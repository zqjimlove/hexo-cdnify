var Attribute, Element, Soup, cheerio, htmlparser

htmlparser = require('htmlparser2')

cheerio = require('cheerio')

Element = require('./element')

Attribute = require('./attribute')

module.exports = Soup = (function () {
  function Soup(_string) {
    this._string = _string.toString()
  }

  Soup.prototype._build = function () {
    var lastIndex, parser, refString, tagId, tagStack
    this._splicings = []
    this._lookupAttrName = 'data-souplookup-' + Date.now()
    refString = ''
    lastIndex = 0
    tagId = 0
    this._elements = {}
    tagStack = []
    parser = new htmlparser.Parser(
      {
        onopentag: (function (_this) {
          return function (tagName, attributes) {
            var modifiedOpeningTag, openingTag
            tagId++
            tagStack.push({
              start: parser.startIndex,
              end: parser._tokenizer._index + 1,
              id: tagId,
            })
            if (parser.endIndex <= parser.startIndex) {
              openingTag = _this._string.substring(
                parser.startIndex,
                parser._tokenizer._index
              )
            } else {
              openingTag = _this._string.substring(
                parser.startIndex,
                parser.endIndex + 1
              )
            }
            modifiedOpeningTag = (function () {
              var endOfTagNameIndex
              endOfTagNameIndex = openingTag.indexOf(' ')
              if (endOfTagNameIndex === -1) {
                endOfTagNameIndex = openingTag.indexOf('/')
              }
              if (endOfTagNameIndex === -1) {
                endOfTagNameIndex = openingTag.indexOf('>')
              }
              if (endOfTagNameIndex === -1) {
                throw new Error('Should not happen :)')
              }
              return (openingTag =
                openingTag.substring(0, endOfTagNameIndex) +
                (' ' + _this._lookupAttrName + "='" + tagId + "'") +
                openingTag.substring(endOfTagNameIndex))
            })()
            refString +=
              _this._string.substring(lastIndex, parser.startIndex) +
              modifiedOpeningTag
            return (lastIndex = parser.endIndex + 1)
          }
        })(this),
        onclosetag: (function (_this) {
          return function (tagName) {
            var correspondingOpeningTag, selfClosingTag
            correspondingOpeningTag = tagStack.pop()
            if (
              correspondingOpeningTag.start === 1 &&
              _this._string.charAt(1) !== '<'
            ) {
              correspondingOpeningTag.start = 0
            }
            selfClosingTag = parser.startIndex === correspondingOpeningTag.start
            return (_this._elements[correspondingOpeningTag.id] = {
              start: correspondingOpeningTag.start,
              contentStart: correspondingOpeningTag.end,
              contentEnd: selfClosingTag
                ? correspondingOpeningTag.end
                : parser.startIndex,
              end: parser.endIndex + 1,
            })
          }
        })(this),
        onend: (function (_this) {
          return function () {
            return (refString += _this._string.substring(lastIndex))
          }
        })(this),
      },
      {
        recognizeSelfClosing: true,
      }
    )
    parser.write(this._string)
    parser.end()
    return (this._$ref = cheerio.load(refString))
  }

  Soup.prototype._select = function (selector) {
    var elements, foundElements, lookupAttrName, _$ref
    _$ref = this._$ref
    lookupAttrName = this._lookupAttrName
    elements = this._elements
    foundElements = []
    _$ref(selector).each(function () {
      var id
      id = _$ref(this).attr(lookupAttrName)
      return foundElements.push(elements[id])
    })
    return foundElements
  }

  Soup.prototype.getAttribute = function (selector, name, callback) {
    return this.setAttribute(selector, name, function (
      value,
      start,
      end,
      elStart,
      elEnd
    ) {
      var _value
      callback(value, start, end, elStart, elEnd)
      _value = value
      return null
    })
  }

  Soup.prototype.setAttribute = function (selector, name, _value) {
    var absoluteEnd,
      absoluteStart,
      attr,
      attrDetails,
      attrGotUpdated,
      attrString,
      attributes,
      element,
      endInsideOpeningTag,
      endOfAttributeIndex,
      newAttrString,
      openingTagString,
      quoteType,
      type,
      valEnd,
      valStart,
      value,
      _i,
      _j,
      _len,
      _len1,
      _ref
    this._build()
    _ref = this._select(selector)
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i]
      openingTagString = this._string.substring(element.start, element.end)
      attributes = new Element(openingTagString).getAttributes()
      attrGotUpdated = false
      for (_j = 0, _len1 = attributes.length; _j < _len1; _j++) {
        attrDetails = attributes[_j]
        attrString = openingTagString.substring(
          attrDetails.start,
          attrDetails.end
        )
        attr = new Attribute(attrString)
        if (attr.name() === name) {
          type = typeof _value
          switch (type) {
            case 'function':
              absoluteStart = element.start + attrDetails.start
              absoluteEnd = element.start + attrDetails.end
              value = _value(
                attr.valueWithoutQuotes(),
                absoluteStart,
                absoluteEnd,
                element.start,
                element.end
              )
              break
            case 'string':
            case 'boolean':
            case 'undefined':
              value = _value
              break
            default:
              if (_value != null) {
                throw new Error('Unexpected type: ' + type)
              }
              value = null
          }
          switch (value) {
            case true:
              this._splicings.push({
                start: element.start + attrDetails.start,
                content: attr.name(),
                end: element.start + attrDetails.end,
              })
              break
            case false:
              this._splicings.push({
                start: element.start + attrDetails.start - 1,
                content: '',
                end: element.start + attrDetails.end,
              })
              break
            case null:
            case void 0:
              break
            default:
              if (attr.hasValue()) {
                quoteType = attr.quoteType()
                valStart =
                  element.start + attrDetails.start + attr.valueStartIndex()
                valEnd = valStart + attr.valueWithoutQuotes().length
                switch (quoteType) {
                  case '"':
                  case "'":
                    this._splicings.push({
                      start: valStart,
                      content:
                        quoteType === '"'
                          ? value.replace('"', '&quot;')
                          : value.replace("'", '&apos;'),
                      end: valEnd,
                    })
                    break
                  case null:
                    if (/[\s\'\"]/.test(value)) {
                      this._splicings.push({
                        start: valStart,
                        content: '"' + value.replace('"', '&quot;') + '"',
                        end: valEnd,
                      })
                    } else {
                      this._splicings.push({
                        start: valStart,
                        content: value,
                        end: valEnd,
                      })
                    }
                    break
                  default:
                    throw new Error('Unknown quote type: ' + quoteType)
                }
              } else {
                endOfAttributeIndex = element.start + attrDetails.end
                this._splicings.push({
                  start: endOfAttributeIndex,
                  content: '="' + value.replace('"', '&quot;') + '"',
                  end: endOfAttributeIndex,
                })
              }
          }
          attrGotUpdated = true
          continue
        }
      }
      if (_value != null && !attrGotUpdated) {
        newAttrString = (function () {
          type = typeof _value
          switch (type) {
            case 'function':
              value = _value(null, null, null)
              break
            case 'string':
            case 'boolean':
              value = _value
              break
            default:
              throw new Error('Unexpected type: ' + type)
          }
          switch (value) {
            case true:
              return name
            default:
              if (value == null) {
                return null
              }
              if (typeof value !== 'string') {
                throw new Error(
                  'Unexpected type: ' + typeof value + ' (' + value + ')'
                )
              }
              return '' + name + '="' + value.replace('"', '&quot;') + '"'
          }
        })()
        if (newAttrString != null) {
          endInsideOpeningTag = element.contentStart - 1
          if (this._string.charAt(endInsideOpeningTag - 1) === '/') {
            endInsideOpeningTag--
          }
          this._splicings.push({
            start: endInsideOpeningTag,
            content: ' ' + newAttrString,
            end: endInsideOpeningTag,
          })
        }
      }
    }
    return this._execute()
  }

  Soup.prototype.getInnerHTML = function (selector, callback) {
    return this.setInnerHTML(selector, function (value, start, end) {
      var _value
      callback(value, start, end)
      _value = value
      return null
    })
  }

  Soup.prototype.setInnerHTML = function (selector, _newHTML) {
    var element, newHTML, oldHTML, type, _i, _len, _ref
    this._build()
    type = typeof _newHTML
    _ref = this._select(selector)
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      element = _ref[_i]
      newHTML = null
      switch (type) {
        case 'function':
          oldHTML = this._string.substring(
            element.contentStart,
            element.contentEnd
          )
          newHTML = _newHTML(oldHTML, element.contentStart, element.contentEnd)
          break
        case 'string':
          newHTML = _newHTML
          break
        default:
          if (_newHTML != null) {
            throw new Error('Unexpected type: ' + type)
          }
      }
      if (newHTML != null) {
        this._splicings.push({
          start: element.contentStart,
          content: newHTML,
          end: element.contentEnd,
        })
      }
    }
    return this._execute()
  }

  Soup.prototype._execute = function () {
    var i, lastIndex, newString, splicing, _i, _len, _ref
    if (this._splicings.length) {
      lastIndex = 0
      newString = ''
      _ref = this._splicings
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        splicing = _ref[i]
        newString +=
          this._string.substring(lastIndex, splicing.start) + splicing.content
        lastIndex = splicing.end
      }
      newString += this._string.substring(lastIndex)
      this._string = newString
    }
    return null
  }

  Soup.prototype.toString = function () {
    return this._string
  }

  return Soup
})()
