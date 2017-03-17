(function() {

  // helpers

  const getElement = (selector, ctx=document) => {
    const node = ctx.querySelectorAll(selector)
    return node ? node[0] : null
  }

  const getElements = (selector, ctx=document) => {
    const node = ctx.querySelectorAll(selector)
    return node || null
  }



  // scroller

  class Scroller {
    constructor(config) {
      const {align, noAnchors, noScrollbar, el} = config

      this.config = {
        align: align || 'center',
        noAnchors: noAnchors || false,
        noScrollbar: noScrollbar || false,
        prefix: 'ab_scroller',
      }

      this.state = {
        scrolled: 0,
        len: el.hasChildNodes() && getElements(':scope > *', el).length || 0,
        el: el || null,
      }

      this.init(el)
    }


    get(prop) {
      return this.state[prop] || null
    }

    set(prop, value) {
      this.state[prop] = value
    }


    addClass(el, cl) {
      if (!new RegExp('(\\s|^)'+cl+'(\\s|$)').test(el.className)) el.className += ' ' + cl
    }

    removeClass(el, cl) {
      el.className = el.className
        .replace(new RegExp('(\\s+|^)'+cl+'(\\s+|$)', 'g'), ' ')
        .replace(/^\s+|\s+$/g, '')
    }

    setPos(el, pos) {
      el.style.webkitTransform = 'translate(' + pos + 'px, 0) translateZ(0)'
      el.style.MozTransform =
      el.style.msTransform =
      el.style.OTransform =
      el.style.transform = 'translateX(' + pos + 'px)'
    }


    init(el) {
      this.createWrapper()
      this.wrapItems()
    }


    createWrapper() {
      const prefix = this.config.prefix
      const rootNode = this.state.el

      const prevHtml = rootNode.innerHTML
      const wrapperHtml = `<div class="${prefix}-wrapper">${prevHtml}</div>`
      rootNode.innerHTML = wrapperHtml

      this.addClass(rootNode, prefix)
    }

    wrapItems() {
      const prefix = this.config.prefix
      const wrapperNode = getElement(`.${prefix}-wrapper`)

      getElements(':scope > *', wrapperNode).forEach(itemNode => {
        const itemWrapper = document.createElement('div')
        itemWrapper.innerHTML = itemNode.outerHTML
        itemWrapper.setAttribute('class', `${prefix}-item`)
        itemNode.parentNode.insertBefore(itemWrapper, itemNode)
        itemNode.remove()
      })
    }
  }



  // init

  const el = getElement('.scroller')
  const scroller = new Scroller({ el })

}())
