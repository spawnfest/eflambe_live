'use strict'

// Ported from https://github.com/brendangregg/FlameGraph/blob/master/flamegraph.pl

window.eflambe = {
  xpad: 10,
  inverted: 0,
  fontsize: 12,
  fontwidth: 0.59
}

let details, svg

export function init (ctx, html) {
  ctx.root.innerHTML = html
  details = document.getElementById('details').firstChild
  svg = document.getElementsByTagName('svg')[0]
}

window.s = function (info) { details.nodeValue = 'Function: ' + info }

window.c = function () { details.nodeValue = ' ' }

function find_child (parent, name, attr) {
  const children = parent.childNodes
  for (let i = 0; i < children.length; i++) {
    if (children[i].tagName === name) {
      return (attr !== undefined) ? children[i].attributes[attr].value : children[i]
    }
  }
}

function orig_save (e, attr, val) {
  if (e.attributes['_orig_' + attr] !== undefined) return
  if (e.attributes[attr] === undefined) return
  if (val === undefined) val = e.attributes[attr].value

  e.setAttribute('_orig_' + attr, val)
}

function orig_load (e, attr) {
  if (e.attributes['_orig_' + attr] === undefined) return
  e.attributes[attr].value = e.attributes['_orig_' + attr].value
  e.removeAttribute('_orig_' + attr)
}

function update_text (e) {
  const r = find_child(e, 'rect')
  const t = find_child(e, 'text')
  const w = parseFloat(r.attributes.width.value) - 3
  const txt = find_child(e, 'title').textContent.replace(/\\([^(]*\\)/, '')
  t.attributes.x.value = parseFloat(r.attributes.x.value) + 3

  // Smaller than this size won't fit anything
  if (w < 2 * window.eflambe.fontsize * window.eflambe.fontwidth) {
    t.textContent = ''
    return
  }

  t.textContent = txt
  // Fit in full text width
  if (/^ *\$/.test(txt) || t.getSubStringLength(0, txt.length) < w) {
    return
  }

  for (let x = txt.length - 2; x > 0; x--) {
    if (t.getSubStringLength(0, x + 2) <= w) {
      t.textContent = txt.substring(0, x) + '..'
      return
    }
  }
  t.textContent = ''
}

function zoom_reset (e) {
  if (e.attributes !== undefined) {
    orig_load(e, 'x')
    orig_load(e, 'width')
  }

  if (e.childNodes === undefined) return

  for (let i = 0, c = e.childNodes; i < c.length; i++) {
    zoom_reset(c[i])
  }
}

function zoom_child (e, x, ratio) {
  const xpad = window.eflambe.xpad

  if (e.attributes !== undefined) {
    if (e.attributes.x !== undefined) {
      orig_save(e, 'x')
      e.attributes.x.value = (parseFloat(e.attributes.x.value) - x - xpad) * ratio + xpad
      if (e.tagName === 'text') e.attributes.x.value = find_child(e.parentNode, 'rect', 'x') + 3
    }
    if (e.attributes.width !== undefined) {
      orig_save(e, 'width')
      e.attributes.width.value = parseFloat(e.attributes.width.value) * ratio
    }
  }

  if (e.childNodes === undefined) return

  for (let i = 0, c = e.childNodes; i < c.length; i++) {
    zoom_child(c[i], x - xpad, ratio)
  }
}

function zoom_parent (e) {
  const xpad = window.eflambe.xpad

  if (e.attributes) {
    if (e.attributes.x !== undefined) {
      orig_save(e, 'x')
      e.attributes.x.value = xpad
    }
    if (e.attributes.width !== undefined) {
      orig_save(e, 'width')
      e.attributes.width.value = parseInt(svg.width.baseVal.value) - (xpad * 2)
    }
  }

  if (e.childNodes === undefined) return

  for (let i = 0, c = e.childNodes; i < c.length; i++) {
    zoom_parent(c[i])
  }
}

window.zoom = function (node) {
  const xpad = window.eflambe.xpad

  const attr = find_child(node, 'rect').attributes
  const width = parseFloat(attr.width.value)
  const xmin = parseFloat(attr.x.value)
  const xmax = parseFloat(xmin + width)
  const ymin = parseFloat(attr.y.value)
  const ratio = (svg.width.baseVal.value - 2 * xpad) / width

  // XXX: Workaround for JavaScript float issues (fix me)
  const fudge = 0.0001

  const unzoombtn = document.getElementById('unzoom')
  unzoombtn.style.opacity = '1.0'

  const el = document.getElementsByTagName('g')
  for (let i = 0; i < el.length; i++) {
    const e = el[i]
    const a = find_child(e, 'rect').attributes
    const ex = parseFloat(a.x.value)
    const ew = parseFloat(a.width.value)
    let upstack
    // Is it an ancestor
    if (window.eflambe.inverted === 0) {
      upstack = parseFloat(a.y.value) > ymin
    } else {
      upstack = parseFloat(a.y.value) < ymin
    }
    if (upstack) {
      // Direct ancestor
      if (ex <= xmin && (ex + ew + fudge) >= xmax) {
        e.style.opacity = '0.5'
        zoom_parent(e)
        e.onclick = function (e) { window.unzoom(); window.zoom(this) }
        update_text(e)
      } else {
        // not in current path
        e.style.display = 'none'
      }
    } else {
      // Children maybe
      // no common path
      if (ex < xmin || ex + fudge >= xmax) {
        e.style.display = 'none'
      } else {
        zoom_child(e, xmin, ratio)
        e.onclick = function (e) { window.zoom(this) }
        update_text(e)
      }
    }
  }
}

window.unzoom = function () {
  const unzoombtn = document.getElementById('unzoom')
  unzoombtn.style.opacity = '0.0'

  const el = document.getElementsByTagName('g')

  for (let i = 0; i < el.length; i++) {
    el[i].style.display = 'block'
    el[i].style.opacity = '1'
    zoom_reset(el[i])
    update_text(el[i])
  }
}
