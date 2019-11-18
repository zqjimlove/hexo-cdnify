# hexo-cdnify

> Converts local URLs to CDN ones when hexo generator.

## What is it

The plugin through your `HTML` for statics file URLs rewrite to the CDN

Default support:

```html
    <img data-src="____">
    <img src="____">
    <link rel="apple-touch-icon" href="____">
    <link rel="icon" href="____">
    <link rel="shortcut icon" href="____">
    <link rel="stylesheet" href="____">
    <script src="____"></script>
    <source src="____"></source>
```

## install

`npm install hexo-cdnify --save`

## options

```yaml
cdn:
  enable: true
  base: //cdn.com
  tail: v=2019042200000
  tags:
    'img[data-orign]':  data-orign
  excludeTags:
    - 'link'
    - 'script'
```

#### base 

the CDN hostname. e.g., '//cdn.com/'.

It will replace `./vendors/index.css` to `//cdn.com/vendors/index.css`

#### tags

That is, any elements matching the CSS selector `img[data-orign]` will have their `data-orign` attributes , etc.

#### tail

Adding `tail` parameters and supporting HEXO_CDN_QS environment variables, avoiding CDN caching。

`tail: v1` to `index.js?v1`