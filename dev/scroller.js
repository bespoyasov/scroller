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
        draggingClsnm: 'is-dragging',

        easing: pos => pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1,
        viscosityFactor: 0.5,
      }

      this.state = {
        scrolled: 0,
        pointerDown: false,
        downEventX: 0,
        downEventTS: 0,
        moveEventTS: 0,

        limitLeft: 0,
        limitRight: 0,

        len: el.hasChildNodes() && getElements(':scope > *', el).length || 0,
        el: el || null,
      }

      this.init(el)

      window.raf = (function(){
        return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback) {setTimeout(callback, 1000 / 60)}
      })()
    }


    get(prop) {
      return typeof(this.state[prop]) !== 'undefined' ? this.state[prop] : null
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

    setPos(pos) {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const el = getElement(`.${prefix}-strip`, rootNode)

      el.style.webkitTransform = 'translate(' + pos + 'px, 0) translateZ(0)'
      el.style.MozTransform =
      el.style.msTransform =
      el.style.OTransform =
      el.style.transform = 'translateX(' + pos + 'px)'
    }


    init(el) {
      this.createWrapper()
      this.wrapItems()
      this.setSize()

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const stripNode = getElement(`.${prefix}-strip`, rootNode)
      const linkNodes = getElements('a', stripNode)

      stripNode.addEventListener('mousedown', this.onPointerDown.bind(this))
      window.addEventListener('mousemove', this.onPointerMove.bind(this))
      window.addEventListener('mouseup', this.onPointerUp.bind(this))

      // prevent clickng
      Array.from(linkNodes).forEach(node => {
        node.addEventListener('click', this.onClickLink.bind(this), false)
      })
    }


    createWrapper() {
      const prefix = this.config.prefix
      const rootNode = this.state.el

      const prevHtml = rootNode.innerHTML
      const wrapperHtml = `<div class="${prefix}-wrapper">
        <div class="${prefix}-strip">${prevHtml}</div>
      </div>`

      rootNode.innerHTML = wrapperHtml
      this.addClass(rootNode, prefix)
    }

    wrapItems() {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)

      getElements(':scope > *', wrapperNode).forEach(itemNode => {
        const itemWrapper = document.createElement('div')
        itemWrapper.innerHTML = itemNode.outerHTML
        itemWrapper.setAttribute('class', `${prefix}-item`)
        itemNode.parentNode.insertBefore(itemWrapper, itemNode)
        itemNode.remove()
      })
    }

    setSize() {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)
      const itemNodes = getElements(`.${prefix}-item`, rootNode)
      let maxHeight = 0, sumWidth = 0

      itemNodes.forEach(itemNode => {
        const currentHeight = itemNode.offsetHeight
        if (currentHeight > maxHeight) maxHeight = currentHeight

        sumWidth += itemNode.offsetWidth
      })

      rootNode.style.height = maxHeight + 'px'
      wrapperNode.style.height = maxHeight + 'px'
      wrapperNode.style.width = (sumWidth + 1) + 'px'

      this.set('limitRight', sumWidth + 1 - rootNode.offsetWidth)
    }


    onPointerDown(e) {
      if (!e) return
      e.preventDefault()

      const ts = (new Date()).getTime()
      this.set('pointerDown', true)
      this.set('downEventTS', ts)

      const newDownEventX = this.get('scrolled') + (e.originalEvent && e.originalEvent.pageX || e.pageX)
      this.set('downEventX', newDownEventX)

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)
      this.addClass(wrapperNode, this.config.draggingClsnm)
    }

    onPointerMove(e) {
      e.preventDefault()
      const pointerDown = this.get('pointerDown')
      if (!pointerDown) return

      const downEventX = this.get('downEventX')
      const scrolled = this.get('scrolled')

      const currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX
      const delta = downEventX - currentPageX // drag to left is positive number
      let result = delta

      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')

      if (result < limitLeft) result = Math.round(0.2 * result)
      else if (result > limitRight) result = Math.round(0.2 * result + 0.8 * limitRight)

      this.setPos(-1 * result)
      this.set('scrolled', result)
      this.set('moveEventTS', (new Date()).getTime())
    }

    onPointerUp(e) {
      e.preventDefault()
      this.set('pointerDown', false)

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)
      this.removeClass(wrapperNode, this.config.draggingClsnm)

      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const scrolled = this.get('scrolled')

      if (scrolled < limitLeft) this.animate(scrolled, limitLeft)
      else if (scrolled > limitRight) this.animate(scrolled, limitRight)
      else {
        const lastDownEventX = this.get('downEventX')
        const currentEventX = e.originalEvent && e.originalEvent.pageX || e.pageX
        const delta = currentEventX - lastDownEventX
        const moveEventTS = this.get('moveEventTS')
        const nowTS = (new Date()).getTime()
        const timeDelta = nowTS - moveEventTS
        // const ednpoint =
        // const timeToEndpoint =
        // this.animate(scrolled, limitRight)
      }
    }

    onClickLink(e) {
      e.preventDefault()
      return false
    }


    animate(start, stop=0, speed=10) {
      const delta = stop - start
      const time = Math.max(.05, Math.min(Math.abs(delta) / speed, 1))

      let currentTime = 0,
          result = this.get('scrolled')

      const tick = () => {
        const pointerDown = this.get('pointerDown')
        if (pointerDown) return

        currentTime += (1 / 60)
        result = start + delta * this.config.easing(currentTime / time)

        if (currentTime >= 1) {
          this.setPos(-1 * stop)
          this.set('scrolled', stop)
        }
        else {
          raf(tick)
          this.setPos(-1 * result)
          this.set('scrolled', result)
        }
      }

      tick()
    }
  }



  // init

  const el = getElement('.scroller')
  const scroller = new Scroller({ el })

}())
