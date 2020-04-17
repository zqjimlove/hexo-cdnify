const cdnify = require('../lib/cdnify')
const expect = require('chai').expect

const hexo = {
  config: {
    cdn: {
      enable: true,
      base: '//cdn.com',
      tail: 'v1',
    },
  },
}

test('base test', function () {
  expect(
    cdnify.call(
      hexo,
      [
        '<link rel="apple-touch-icon" href="./a.jpg">',
        '<link rel="icon" href="./a.jpg">',
        '<link rel="shortcut icon" href="./a.jpg">',
        '<link rel="stylesheet" href="./a.jpg">',
        '<script src="./a.jpg"></script>',
        '<source src="./a.jpg" />',
        '<video src="./a.jpg" poster="./a.jpg"></video>',
        '<img src="./a.jpg" data-src="./a.jpg" alt="">',
      ].join(''),
      {}
    )
  ).to.eq(
    [
      '<link rel="apple-touch-icon" href="//cdn.com/a.jpg?v1">',
      '<link rel="icon" href="//cdn.com/a.jpg?v1">',
      '<link rel="shortcut icon" href="//cdn.com/a.jpg?v1">',
      '<link rel="stylesheet" href="//cdn.com/a.jpg?v1">',
      '<script src="//cdn.com/a.jpg?v1"></script>',
      '<source src="//cdn.com/a.jpg?v1" />',
      '<video src="./a.jpg" poster="//cdn.com/a.jpg?v1"></video>',
      '<img src="//cdn.com/a.jpg?v1" data-src="//cdn.com/a.jpg?v1" alt="">',
    ].join('')
  )
})

test('test inline style url', function () {
  expect(
    cdnify.call(
      hexo,
      [
        '<span style="background-image:url(/images/a.png)"></span>',
        '<span style="background-image:url(\'/images/a.png\')"></span>',
        '<span style=\'background-image:url("/images/a.png")\'></span>',
      ].join(''),
      {}
    )
  ).to.eq(
    [
      '<span style="background-image:url(//cdn.com/images/a.png?v1)"></span>',
      '<span style="background-image:url(\'//cdn.com/images/a.png?v1\')"></span>',
      '<span style=\'background-image:url("//cdn.com/images/a.png?v1")\'></span>',
    ].join('')
  )
})

test('test custome replace function', function () {
  hexo.config.cdn.tags = {
    'a[src]': {
      attribute: 'src',
      callback: `function(attributeValue,rewriteURL){ return rewriteURL(attributeValue) }`,
    },
  }
  expect(
    cdnify.call(
      hexo,
      [
        '<a src="./a.jpg" data-src="./a.jpg" alt="" />',
        '<a src="./b.jpg" data-src="./a.jpg" alt="" />',
      ].join(''),
      {}
    )
  ).to.eq(
    [
      '<a src="//cdn.com/a.jpg?v1" data-src="./a.jpg" alt="" />',
      '<a src="//cdn.com/b.jpg?v1" data-src="./a.jpg" alt="" />',
    ].join('')
  )
})
