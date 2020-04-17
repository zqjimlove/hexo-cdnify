// var system = require('system');

if (false === hexo.config.hasOwnProperty('cdn') || true === hexo.config.cdn) {
  return
}

if (process.argv.indexOf('server') > -1 || process.argv.indexOf('s') > -1) {
  return
}

hexo.extend.filter.register('after_render:html', require('./lib/cdnify'), 5)
