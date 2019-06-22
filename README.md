# Simple SVG

A wafer-thin wrapper around the built-in `SVGElement` which adds some creature
comforts that make creating SVGs a lot less verbose.

This uses
[proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy),
[classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes),
[modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), 
and [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
and thus only works in modern browsers.

## Idea

SVG is really not that hard to understand, and in fact it's pretty
pleasant to work with, conceptually. In practice, however, it
involves a ton of very verbose method calls with arcane namespace
strings, and some other annoyances.

By minimizing that boilerplate, we can bring practice closer to concept
and provide a pretty decent way of creating SVGs.


## Usage

To start, create an instance:
  
```js
let svg = new SSVG()
```

All of the `SVGElement` types can be created and immediately appended
to the `SVGElement` by calling their name as a method:

```js
svg.circle()  // appends & returns a new <circle> (SVGCircleElement)
svg.line()    // appends & returns a new <line> (SVGLineElement)
// etc...
```

To just create an element without appending, use the `create*` variation:

```js
svg.createCircle()  // returns a new <circle>
svg.createLine()    // returns a new <line>
// etc...
```

Created elements also have some syntax sugar applied. Normally, the
short syntax (`circle.cx = 10`) doesn't work because those properties
are read-only. Instead you have to do `circle.setAttribute('cx', 10)`

SSVG makes those attributes writable:

```js
let circle = svg.circle()
circle.cx = 100
circle.cy = 100
circle.r = 50
circle.fill = 'red'
circle.stroke = 'blue'
// etc...
```

You can also set attributes when you create the element:

```js
let circle = svg.circle({ 
    cx: 100, 
    cy: 100, 
    r: 50,
    fill: 'red',
    stroke: 'blue',
    // etc...
})
```
Elements can also create/append nested children. This only makes
sense to do with the `g` (group) element:

```js
let g = svg.g({fill: red})
g.circle({cx:100, cy:100, r:50})
g.rect({x:10, y:10, width:50, height:50})
```

You can apply classes to elements, but use `.class` instead of `.className`:

    let circle = svg.circle(...)
    circle.class = 'myClass'

The actual Element instance can be gotten from the `.root` property:

    svg.root      // SVGElement
    circle.root   // SVGCircleElement


## Other Userful Documentation:

- SVG: https://developer.mozilla.org/en-US/docs/Web/SVG/Element
- Proxy: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy


## License

MIT
