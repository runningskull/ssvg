/*******************************************************************************
MIT License

Copyright (c) 2019 Juan Patten

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*******************************************************************************/

/**
 * Simple SVG
 *
 * A wrapper around the built-in `SVGElement` which adds some creature
 * comforts that make creating SVGs a lot less verbose.
 *
 * Idea
 * --------------------
 * SVG is really not that hard to understand, and in fact it's pretty
 * pleasant to work with, conceptually. In practice, however, it
 * involves a ton of very verbose method calls with arcane namespace
 * strings, and some other annoyances.
 *
 * By minimizing that boilerplate, we can bring practice closer to
 * concept and provide a pretty decent way of creating SVGs.
 *
 *
 * Usage
 * --------------------
 * To start, create an instance:
 * 	
 * 	let svg = new SSVG()
 *
 * All of the `SVGElement` types can be created and immediately appended
 * to the `SVGElement` by calling their name as a method:
 *
 * 	svg.circle()  // appends & returns a new <circle> (SVGCircleElement)
 * 	svg.line()    // appends & returns a new <line> (SVGLineElement)
 * 	// etc...
 *
 * To just create an element without appending, use the `create*` variation:
 *
 * 	svg.createCircle()  // returns a new <circle>
 * 	svg.createLine()    // returns a new <line>
 *	// etc...
 *
 * Created elements also have some syntax sugar applied. Normally, the
 * short syntax (`circle.cx = 10`) doesn't work because those properties
 * are read-only. Instead you have to do `circle.setAttribute('cx', 10)`
 *
 * SSVG makes those attributes writable:
 *
 * 	let circle = svg.circle()
 * 	circle.cx = 100
 * 	circle.cy = 100
 * 	circle.r = 50
 * 	circle.fill = 'red'
 * 	circle.stroke = 'blue'
 * 	// etc...
 *
 * You can also set attributes when you create the element:
 *
 * 	let circle = svg.circle({ 
 * 		cx: 100, 
 * 		cy: 100, 
 * 		r: 50,
 * 		fill: 'red',
 * 		stroke: 'blue',
 * 		// etc...
 * 	})
 *
 * Elements can also create/append nested children. This only makes
 * sense to do with the `g` (group) element:
 *
 * 	let g = svg.g({fill: red})
 * 	g.circle({cx:100, cy:100, r:50})
 * 	g.rect({x:10, y:10, width:50, height:50})
 *
 * You can apply classes to elements, but use `.class` instead of `.className`:
 *
 * 	let circle = svg.circle(...)
 * 	circle.class = 'myClass'
 *
 * The actual Element instance can be gotten from the `.root` property:
 *	
 *	svg.root      // SVGElement
 *	circle.root   // SVGCircleElement
 *
 *
 * Documentation:
 * 	SVG: https://developer.mozilla.org/en-US/docs/Web/SVG/Element
 *	Proxy: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 */


const svgns = 'http://www.w3.org/2000/svg'


const SSVGProxyHandler = {
	get: function(instance, propName) {
		// Figure out what element we're creating (if any)
		let [_, isCreate, elemName] = propName.match(/(create)?(\w+)/)
		let upperElemName = elemName[0].toUpperCase() + elemName.slice(1)
		let className = `SVG${upperElemName}Element`
		let validElement = window.hasOwnProperty(className)
		elemName = elemName.toLowerCase()

		// If not a valid svg element, fall back to the instance
		if (! validElement) {
			let prop = instance[propName]
			if (typeof prop == 'function') {
				return prop.bind(instance)
			} else {
				return prop
			}
		}

		// Otherwise, return the creator function
		return function(attrs = {}) {
			let elem = document.createElementNS(svgns, elemName)
			for (let [attrName, attrVal] of Object.entries(attrs)) {
				elem.setAttribute(attrName, attrVal)
			}

			if (! isCreate) {
				instance.root.append(elem)
			}

			return new SSVGElementProxy(elem)
		}
	},

	set: function(instance, propName, val) {
		let desc = Object.getOwnPropertyDescriptor(instance, propName)
		if (desc && desc.writable) { // if this is a writable property, just set it
			instance[propName] = val
		} else { // otherwise, assume it's an attribute
			instance.setAttribute(propName, val)
		}
	},
}



class SSVGProxy {
	constructor(ssvg) {
		return new Proxy(ssvg, SSVGProxyHandler)
	}
}


class SSVGElementProxy {
	constructor(element) {
		let proxy = new Proxy(element, SSVGProxyHandler)
		Object.defineProperty(proxy, 'root', {value: element})
		return proxy
	}
}



export default class SSVG {
	root = document.createElementNS(svgns, 'svg')

	constructor(attrs = {}) {
		for (let [attrName, attrVal] of Object.entries(attrs)) {
			this.root.setAttribute(attrName, attrVal)
		}

		return new SSVGProxy(this)
	}
}

