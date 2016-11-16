# hexo-cdnify

> Converts local URLs to CDN ones when hexo generator.

## What is it

The plugin through your `HTML` for statics file URLs rewrite to the CDN 

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

## options

```yaml
cdn:
  enable: true
  base: //cdn.com
  tags:
    'img[data-orign]':  data-orign
```