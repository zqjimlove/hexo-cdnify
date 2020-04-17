
/*
  Attribute class

  Constructs an object that can provide information about the given attribute string, such as whether it is quoted, etc.
 */
var Attribute;

module.exports = Attribute = (function() {
  function Attribute(string) {
    this.string = string;
  }

  Attribute.prototype.name = function() {
    if (!this.hasValue()) {
      return this.string;
    } else {
      return this.string.substring(0, this.string.indexOf('='));
    }
  };

  Attribute.prototype.hasValue = function() {
    return this.string.indexOf('=') !== -1;
  };

  Attribute.prototype.valueStartIndex = function() {
    var index;
    index = this.string.indexOf('=') + 1;
    if (index === -1) {
      return null;
    } else if (this.valueIsQuoted()) {
      return index + 1;
    } else {
      return index;
    }
  };

  Attribute.prototype.valueEndIndex = function() {
    return this.valueStartIndex() + this.valueWithoutQuotes().length;
  };

  Attribute.prototype.valueWithoutQuotes = function() {
    var val;
    if (this.valueIsQuoted()) {
      val = this.valueIncludingQuotes().trim();
      return val.substring(1, val.length - 1);
    } else {
      return this.valueIncludingQuotes();
    }
  };

  Attribute.prototype.valueIsQuoted = function() {
    return !!(this.hasValue() && (this.string.indexOf('"') !== -1 || this.string.indexOf("'") !== -1));
  };

  Attribute.prototype.quoteType = function() {
    if (this.hasValue() && this.valueIsQuoted()) {
      return this.valueIncludingQuotes().charAt(0);
    } else {
      return null;
    }
  };

  Attribute.prototype.valueIncludingQuotes = function() {
    if (this.hasValue) {
      return this.string.substring(this.string.indexOf('=') + 1).trim();
    } else {
      return null;
    }
  };

  return Attribute;

})();
