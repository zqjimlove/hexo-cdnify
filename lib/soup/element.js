
/*
  Element class

  This is basically a simple parser for individual elements. It's primarily concerned with getting character index info about the opening tag's attributes.
 */
var AFTER_ATTRIBUTE_NAME, BEFORE_ATTRIBUTE_VALUE, Element, IN_ATTRIBUTE_NAME, IN_ATTRIBUTE_VALUE_DQ, IN_ATTRIBUTE_VALUE_NQ, IN_ATTRIBUTE_VALUE_SQ, IN_TAG_NAME, LOOSE_IN_TAG;

IN_TAG_NAME = 1;

LOOSE_IN_TAG = 2;

IN_ATTRIBUTE_NAME = 3;

AFTER_ATTRIBUTE_NAME = 4;

BEFORE_ATTRIBUTE_VALUE = 5;

IN_ATTRIBUTE_VALUE_DQ = 6;

IN_ATTRIBUTE_VALUE_SQ = 7;

IN_ATTRIBUTE_VALUE_NQ = 8;

module.exports = Element = (function() {
  function Element(_string) {
    this._string = _string;
  }

  Element.prototype.getAttributes = function() {
    var char, currentAttrStart, i, state;
    if (this._attributes != null) {
      return this._attributes;
    }
    this._attributes = [];
    if (this._string.charAt(0) !== '<') {
      throw new Error('First character of tag should be "<"');
    }
    i = 0;
    state = IN_TAG_NAME;
    currentAttrStart = null;
    while (++i < this._string.length - 1) {
      char = this._string.charAt(i);
      switch (state) {
        case IN_TAG_NAME:
          if (char === ' ') {
            state = LOOSE_IN_TAG;
          }
          break;
        case LOOSE_IN_TAG:
          if (char === '/' || char === '>') {
            break;
          } else if (!/\s/.test(char)) {
            state = IN_ATTRIBUTE_NAME;
            currentAttrStart = i;
          }
          break;
        case IN_ATTRIBUTE_NAME:
          if (char === '=') {
            state = BEFORE_ATTRIBUTE_VALUE;
          } else if (/\s/.test(char)) {
            state = AFTER_ATTRIBUTE_NAME;
          } else if (/[\>\/]/) {
            break;
          }
          break;
        case AFTER_ATTRIBUTE_NAME:
          if (char === '=') {
            state = BEFORE_ATTRIBUTE_VALUE;
          } else if (!/\s/.test(char)) {
            if (currentAttrStart == null) {
              throw new Error('Bug: currentAttrStart should exist at this point');
            }
            while (/\s/.test(this._string.charAt(i - 1))) {
              i--;
            }
            this._attributes.push({
              start: currentAttrStart,
              end: i
            });
            state = LOOSE_IN_TAG;
            currentAttrStart = null;
          }
          break;
        case BEFORE_ATTRIBUTE_VALUE:
          if (char === '"') {
            state = IN_ATTRIBUTE_VALUE_DQ;
          } else if (char === "'") {
            state = IN_ATTRIBUTE_VALUE_SQ;
          } else if (!/\s/.test(char)) {
            state = IN_ATTRIBUTE_VALUE_NQ;
          }
          break;
        case IN_ATTRIBUTE_VALUE_DQ:
          if (char === '"') {
            this._attributes.push({
              start: currentAttrStart,
              end: i + 1
            });
            currentAttrStart = null;
            state = LOOSE_IN_TAG;
          }
          break;
        case IN_ATTRIBUTE_VALUE_SQ:
          if (char === "'") {
            this._attributes.push({
              start: currentAttrStart,
              end: i + 1
            });
            currentAttrStart = null;
            state = LOOSE_IN_TAG;
          }
          break;
        case IN_ATTRIBUTE_VALUE_NQ:
          if (/[\s\>\/]/.test(char)) {
            this._attributes.push({
              start: currentAttrStart,
              end: i
            });
            currentAttrStart = null;
            state = LOOSE_IN_TAG;
          }
          break;
        default:
          throw new Error('Bug in here somewhere');
      }
    }
    if (currentAttrStart) {
      while (/[\>\/]/.test(this._string.charAt(i))) {
        i--;
      }
      i++;
      this._attributes.push({
        start: currentAttrStart,
        end: i
      });
      currentAttrStart = null;
    }
    return this._attributes;
  };

  return Element;

})();
