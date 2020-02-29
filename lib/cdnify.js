"use strict";
var minimatch = require("minimatch"),
  Url = require("url"),
  assign = require("object-assign"),
  Soup = require("soup");

function isLocalPath(filePath) {
  return (
    typeof filePath === "string" &&
    filePath.length &&
    filePath.indexOf("//") === -1 &&
    filePath.indexOf("data:") !== 0
  );
}

function resolveUrl(base, origUrl, tail) {
  if (tail) {
    origUrl += (origUrl.indexOf("?") === -1 ? "?" : "&") + tail;
  }
  /**
   * compatible `base = //cdn.host/cdn/`
   * replce host with url.resolve so :
   *
   * Before:
   * Url.resolve('//cdn.host/cdn/','/images/')  ==>  //cdn.host/images
   *
   * After:
   * Url.resolve('//cdn.host/cdn/','./images/') ==> //cdn.host/cdn/images
   *
   */
  if (origUrl[0] === "/") {
    origUrl = "." + origUrl;
  }
  return Url.resolve(base, origUrl);
}

var tagAttrs = {
  "img[data-src]": "data-src",
  "img[src]": "src",
  'link[rel="apple-touch-icon"]': "href",
  'link[rel="icon"]': "href",
  'link[rel="shortcut icon"]': "href",
  'link[rel="stylesheet"]': "href",
  "script[src]": "src",
  "source[src]": "src",
  "video[poster]": "poster"
};

/**
 * @param
 * cdn
 *   enable: true
 *   exclude:
 */
module.exports = function(str, data) {
  var hexo = this,
    options = hexo.config.cdn;

  //return if disable
  if (false === options.enable) return;

  var path = data.path;
  var exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];
  // return the exclude path
  if (path && exclude && exclude.length) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i])) return str;
    }
  }
  var log = hexo.log || console.log;
  var tail = process.env.HEXO_CDN_QS || options.tail || "";

  var base = options.base,
    rewriteURL = function(origUrl) {
      return isLocalPath(origUrl) ? resolveUrl(base, origUrl, tail) : origUrl;
    },
    soup = new Soup(str);

  if (options.tags && typeof options.tags === "object") {
    tagAttrs = assign(tagAttrs, options.tags);
  }
  
  if (options.excludeTags) {
    var excludeTags = Array.isArray(options.excludeTags)
      ? options.excludeTags
      : [options.excludeTags];
    Object.keys(tagAttrs).forEach(key => {
      let tagKey = key.replace(/(\[.*\]|\(.*\))|\{.*\}/g, "");
      if (~excludeTags.indexOf(tagKey)) {
        delete tagAttrs[key];
      }
    });
  }

  for (var search in tagAttrs) {
    if (tagAttrs.hasOwnProperty(search)) {
      var attr = tagAttrs[search];
      if (attr) {
        soup.setAttribute(search, attr, rewriteURL);
      }
    }
  }

  log.log("CDNify update:" + path);
  return soup.toString();
};
