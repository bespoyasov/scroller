(function() {

  // closest polyfill

  if (!Element.prototype.closest) {
    Element.prototype.closest = function(css) {
      var node = this

      while (node) {
        if (node.matches(css)) return node
        else node = node.parentElement
      }

      return null
    }
  }


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
      const {
        align='center',
        noAnchors=false,
        noScrollbar=false,
        el,
        onClick
      } = config

      this.config = {
        align: align,
        noAnchors: noAnchors,
        noScrollbar: noScrollbar,
        onClick: onClick,

        prefix: 'ab_scroller',
        draggingClsnm: 'is-dragging',
        leftAlignClsnm: 'is-left-align',
        borderVsblClsnm: 'is-visible',
        noAnchorsClsnm: 'is-no-anchors',
        noScrollbarClsnm: 'is-no-scrollbar',

        easing: pos => pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1,
      }

      this.state = {
        scrolled: 0,
        scrollable: true,

        pointerDown: false,
        scrollbarPointerDown: false,
        mouseScroll: false,

        scrollbarWidth: 0,
        scrollbarFactor: 0,

        pageX: [],
        scrolledDiff: 0,
        downEventTS: 0,
        moveEventTS: 0,

        scrollbarDownPageX: 0,
        scrollClickDisabled: false,

        limitLeft: 0,
        limitRight: 0,
        stripWidth: 0,

        len: el.hasChildNodes() && getElements(':scope > *', el).length || 0,
        el: el || null,
      }

      this.init(el)

      window.raf = (() => {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback) {setTimeout(callback, 1000 / 60)}
      })()
    }


    get(prop) {
      return typeof(this.state[prop]) !== 'undefined'
        ? this.state[prop]
        : null
    }

    set(prop, value) {
      this.state[prop] = value
    }

    push(prop, value) {
      this.state[prop] && this.state[prop].push(value)
    }

    clear(prop) {
      const field = this.state[prop]
      if (field && field.length) field.length = 0
    }

    getLastMeaningfull(prop) {
      const field = this.state[prop]
      const toIgnore = field && field.length && field.length > 3 ? 3 : 1
      return field[field.length - toIgnore] || 0
    }


    addClass(el, cl) {
      if (!new RegExp('(\\s|^)'+cl+'(\\s|$)').test(el.className)) el.className += ' ' + cl
    }

    removeClass(el, cl) {
      el.className = el.className
        .replace(new RegExp('(\\s+|^)'+cl+'(\\s+|$)', 'g'), ' ')
        .replace(/^\s+|\s+$/g, '')
    }

    alignScbToRight() {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const el = getElement(`.${prefix}-scrollbar`, rootNode)
      this.addClass(el, 'is-right')
    }

    releaseScb() {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const el = getElement(`.${prefix}-scrollbar`, rootNode)
      this.removeClass(el, 'is-right')
    }


    setPos(pos) {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const el = getElement(`.${prefix}-strip`, rootNode)
      this.setPosition(el, pos)
    }

    setScbPos(pos) {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const el = getElement(`.${prefix}-scrollbar`, rootNode)
      this.setPosition(el, pos)
    }

    setPosition(el, pos) {
      el.style.webkitTransform = 'translate(' + pos + 'px, 0) translateZ(0)'
      el.style.MozTransform =
      el.style.msTransform =
      el.style.OTransform =
      el.style.transform = 'translateX(' + pos + 'px)'
    }

    setWidth(width) {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const el = getElement(`.${prefix}-scrollbar`, rootNode)
      el.style.width = width + 'px'
    }


    init(el) {
      this.createWrapper()
      this.wrapItems()
      this.createAnchors()
      this.setSize()
      this.checkscrollable()

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const stripNode = getElement(`.${prefix}-strip`, rootNode)
      const linkNodes = getElements('a', stripNode)

      const scrollNode = getElement(`.${prefix}-scrollwrap`, rootNode)
      const scrollbarNode = getElement(`.${prefix}-scrollbar`, rootNode)

      const anchorsNodes = getElements(`.${prefix}-anchor`, rootNode)

      // config
      if (
        rootNode.getAttribute('data-leftalign') || 
        rootNode.getAttribute('data-leftIfWide') ||
        this.config.align !== 'center'
      ) {
        this.addClass(rootNode, this.config.leftAlignClsnm)
      }

      if (this.config.noAnchors || rootNode.getAttribute('data-noanchors')) {
        this.addClass(rootNode, this.config.noAnchorsClsnm)
      }

      if (this.config.noScrollbar || rootNode.getAttribute('data-noscrollbar')) {
        this.addClass(rootNode, this.config.noScrollbarClsnm)
      }


      stripNode.addEventListener('mousedown', this.onPointerDown.bind(this))
      window.addEventListener('mousemove', this.onPointerMove.bind(this))
      window.addEventListener('mouseup', this.onPointerUp.bind(this))
      stripNode.addEventListener('mousewheel', this.onScroll.bind(this, stripNode))
      
      scrollbarNode.addEventListener('mousedown', this.onScrollbarPointerDown.bind(this))
      window.addEventListener('mousemove', this.onScrollbarPointerMove.bind(this))
      window.addEventListener('mouseup', this.onScrollbarPointerUp.bind(this))

      scrollNode.addEventListener('click', this.onScrollClick.bind(this))

      Array.from(anchorsNodes).forEach(anchorNode => {
        anchorNode.addEventListener('click', this.onAnchorClick.bind(this))
      })

      // prevent clickng
      Array.from(linkNodes).forEach(node => {
        node.addEventListener('click', this.onClickLink.bind(this), false)
      })

      window.addEventListener('resize', e => {
        this.setSize()
        this.checkscrollable()
      })

      window.addEventListener('load', e => {
        this.setSize()
        this.checkscrollable()
      })
    }


    createWrapper() {
      const prefix = this.config.prefix
      const rootNode = this.state.el

      const prevHtml = rootNode.innerHTML
      const wrapperHtml = `<div class="${prefix}-wrapper">
        <div class="${prefix}-border ${prefix}-border--left"></div>
        <div class="${prefix}-border ${prefix}-border--right"></div>
        <div class="${prefix}-strip">${prevHtml}</div>

        <div class="${prefix}-scrollwrap"><div class="${prefix}-scrollbar"></div></div>
        <div class="${prefix}-anchors"></div>
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

    createAnchors() {
      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)
      const ancWrapperNode = getElement(`.${prefix}-anchors`, rootNode)
      let anchorsHtml = '', counter = 0

      getElements(':scope > *', wrapperNode).forEach(itemNode => {
        const anchorText = getElement('[data-anchor]', itemNode).getAttribute('data-anchor')
        anchorsHtml += `<span data-anchorid="${counter}" class="${prefix}-anchor"><span>${anchorText}</span></span>`
        itemNode.setAttribute('data-anchororiginid', counter)
        counter++
      })

      ancWrapperNode.innerHTML = anchorsHtml
    }

    setSize() {
      const prefix = this.config.prefix
      const rootNode = this.state.el

      const stripNode = getElement(`.${prefix}-strip`, rootNode)
      const wrapperNode = getElement(`.${prefix}-wrapper`, rootNode)
      const scrollbarNode = getElement(`.${prefix}-scrollbar`, rootNode)
      const itemNodes = getElements(`.${prefix}-item`, rootNode)
      let maxHeight = 0, sumWidth = 0

      itemNodes.forEach(itemNode => {
        const currentHeight = itemNode.offsetHeight
        if (currentHeight > maxHeight) maxHeight = currentHeight

        sumWidth += itemNode.offsetWidth
      })

      const wrapperWidth = wrapperNode.offsetWidth
      const scrollbarFactor = wrapperWidth / sumWidth

      rootNode.style.height = maxHeight + 'px'
      stripNode.style.height = maxHeight + 'px'
      stripNode.style.width = (sumWidth + 1) + 'px'
      wrapperNode.style.height = maxHeight + 'px'
      scrollbarNode.style.width = (wrapperWidth * scrollbarFactor) + 'px'

      this.set('limitRight', sumWidth + 1 - rootNode.offsetWidth)
      this.set('scrollbarFactor', scrollbarFactor)
      this.set('scrollbarWidth', wrapperWidth * scrollbarFactor)
    }

    checkscrollable() {
      const prefix = this.config.prefix
      const rootNode = this.state.el

      const stripNode = getElement(`.${prefix}-strip`, rootNode)
      const wrapperNode = getElement(`.${prefix}-wrapper`, rootNode)
      const itemNodes = getElements(`.${prefix}-item`, rootNode)
      const ancWrapperNode = getElement(`.${prefix}-anchors`, rootNode)
      let sumWidth = 0, wrapperWidth = wrapperNode.offsetWidth

      itemNodes.forEach(itemNode => {
        sumWidth += itemNode.offsetWidth
      })

      if (wrapperWidth >= sumWidth) {
        this.set('scrollable', false)
        this.addClass(rootNode, 'is-not-scrollable')
        ancWrapperNode.setAttribute('style', `width: ${sumWidth}px`)
      }
      else {
        this.set('scrollable', true)
        this.removeClass(rootNode, 'is-not-scrollable')
        ancWrapperNode.setAttribute('style', `width:auto`)
      }
    }


    onPointerDown(e) {
      const scrollable = this.get('scrollable')
      
      if (!e || !scrollable) return
      e.preventDefault()

      this.set('pointerDown', true)
      this.set('scrollbarPointerDown', false)
      this.set('mouseScroll', false)
      this.set('downEventTS', (new Date()).getTime())

      const diff = this.get('scrolled') + (e.originalEvent && e.originalEvent.pageX || e.pageX)
      this.set('scrolledDiff', diff)

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)
      this.addClass(getElement('html'), this.config.draggingClsnm)
      return false
    }

    onPointerMove(e) {
      const scrollable = this.get('scrollable')
      const pointerDown = this.get('pointerDown')

      if (!e || !pointerDown || !scrollable) return
      e.preventDefault()

      const scrolledDiff = this.get('scrolledDiff')
      const scrolled = this.get('scrolled')

      // drag to left is positive number
      const currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX
      let result = scrolledDiff - currentPageX

      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const scrollbarFactor = this.get('scrollbarFactor')
      let scrollbarResult = result * scrollbarFactor
      let scrollbarWidth = this.get('scrollbarWidth')

      if (result < limitLeft) {
        result = Math.round(0.2 * result)
        scrollbarWidth += Math.round(0.2 * scrollbarResult)
        scrollbarResult = 0
        this.setWidth(scrollbarWidth)
      }
      else if (result > limitRight) {
        result = Math.round(0.2 * result + 0.8 * limitRight)
        scrollbarWidth -= Math.round(0.8 * (result - limitRight) * scrollbarFactor)
        this.alignScbToRight()
        this.setWidth(scrollbarWidth)
      }
      else {
        this.releaseScb()
      }

      this.setPos(-1 * result)
      this.setScbPos(scrollbarResult)

      this.set('scrolled', result)
      this.set('moveEventTS', (new Date()).getTime())
      this.push('pageX', currentPageX)

      this.checkBorderVisibility()
      return false
    }

    onPointerUp(e) {
      const scrollable = this.get('scrollable')
      const pointerDown = this.get('pointerDown')

      if (!e || !pointerDown || !scrollable) return
      e.preventDefault()

      this.set('pointerDown', false)

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const wrapperNode = getElement(`.${prefix}-strip`, rootNode)
      this.removeClass(getElement('html'), this.config.draggingClsnm)

      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const scrolled = this.get('scrolled')

      const lastPageX = this.getLastMeaningfull('pageX')
      const currentEventX = e.originalEvent && e.originalEvent.pageX || e.pageX
      const distanceDelta = currentEventX - lastPageX
      const timeDelta = ((new Date()).getTime() - this.get('moveEventTS')) / 1.5
      const endpoint = scrolled - (distanceDelta * 8)

      // clicked
      if (lastPageX === 0) {
        if (this.config.onClick) return this.config.onClick(e)

        const linkNode = e.target.closest('a')
        if (!linkNode) return

        const target = linkNode.getAttribute('target')
        const href = linkNode.getAttribute('href')
        if (!target && href) return window.location.href = href
        if (target.indexOf('blank') > -1 && href) return window.open(href)
      }

      // dragged
      // sticky left
      if (scrolled < limitLeft) this.animate(scrolled, limitLeft, 10, true)
      // too much to left
      else if (endpoint < limitLeft) this.animate(scrolled, limitLeft, 10)
      // sticky right
      else if (scrolled > limitRight) this.animate(scrolled, limitRight, 10, true)
      // too much to right
      else if (endpoint > limitRight) this.animate(scrolled, limitRight, 10)
      // otherwise
      else if (timeDelta < 150 && Math.abs(distanceDelta) > 2) {
        const timeToEndpoint = Math.abs(distanceDelta) / timeDelta
        this.animate(scrolled, endpoint, timeToEndpoint)
      }

      this.clear('pageX')
      return false
    }


    onClickLink(e) {
      const scrollable = this.get('scrollable')
      if (!scrollable) return e

      e.preventDefault()
      return false
    }


    onScroll(originalNode, e) {
      const scrollable = this.get('scrollable')

      if (!e || !e.deltaX || Math.abs(e.deltaY) > Math.abs(e.deltaX) ||  !scrollable) {
        return
      }

      e.preventDefault()

      const {deltaX} = e
      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const result = Math.min(Math.max(this.get('scrolled') + deltaX, limitLeft), limitRight)

      const scrollbarWidth = this.get('scrollbarWidth')
      const scrollbarFactor = this.get('scrollbarFactor')
      const scrollbarResult = result * scrollbarFactor

      this.setPos(-1 * result)
      this.releaseScb()
      this.setScbPos(scrollbarResult)
      this.setWidth(scrollbarWidth)
      this.set('scrolled', result)
      this.set('mouseScroll', true)

      this.checkBorderVisibility()
      return false
    }


    onScrollClick(e) {
      const scrollable = this.get('scrollable')
      const scrollClickDisabled = this.get('scrollClickDisabled')

      if (scrollClickDisabled) {
        this.set('scrollClickDisabled', false)
        return
      }
      
      if (!e || !e.preventDefault || !scrollable) return
      e.preventDefault()

      const scbWidth = this.get('scrollbarWidth')
      const scbFactor = this.get('scrollbarFactor')
      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const rightScbLimit = limitRight * scbFactor
      const scrolled = this.get('scrolled')

      const pageX = e.originalEvent && e.originalEvent.pageX || e.pageX
      const center = pageX - scbWidth / 2
      const leftEdge = center - scbWidth / 2
      const rightEdge = center + scbWidth / 2
      
      let endpoint = center / scbFactor
      if (leftEdge < limitLeft) endpoint = limitLeft
      else if (rightEdge > rightScbLimit) endpoint = limitRight

      this.animate(scrolled, endpoint)
      return false
    }

    
    onAnchorClick(e) {
      const scrollable = this.get('scrollable')
      if (!e || !e.target || !scrollable) return 
      
      const anchorid = e.target.closest('[data-anchorid]').getAttribute('data-anchorid')
      if (!anchorid) return

      const prefix = this.config.prefix
      const rootNode = this.state.el
      const targetNode = getElement('[data-anchororiginid="' + anchorid + '"]', rootNode)
      
      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const scrolled = this.get('scrolled')
      const endpoint = Math.min(Math.max(targetNode.offsetLeft, limitLeft), limitRight)

      this.set('mouseScroll', false)
      this.animate(scrolled, endpoint)
      return false
    }


    onScrollbarPointerDown(e) {
      if (!e) return
      e.preventDefault()
      e.stopPropagation()

      const currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX
      const scrolled = this.get('scrolled')
      const scrollbarFactor = this.get('scrollbarFactor')

      this.set('scrollbarPointerDown', true)
      this.set('scrollClickDisabled', true)
      this.set('pointerDown', false)
      this.set('mouseScroll', false)
      this.set('scrollbarDownPageX', currentPageX - scrolled * scrollbarFactor)

      return false
    }

    onScrollbarPointerMove(e) {
      const scbPointerDown = this.get('scrollbarPointerDown')
      if (!e || !scbPointerDown) return
      e.preventDefault()
      e.stopPropagation()

      const scrollbarFactor = this.get('scrollbarFactor')
      const scrollbarDownPageX = this.get('scrollbarDownPageX')
      const currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX
      
      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')
      const delta = (currentPageX - scrollbarDownPageX)
      const result = Math.min(Math.max(delta / scrollbarFactor, limitLeft), limitRight)
      const scrollbarResult = result * scrollbarFactor

      this.setPos(-1 * result)
      this.setScbPos(scrollbarResult)

      this.set('scrolled', result)
      this.checkBorderVisibility()
      return false
    }

    onScrollbarPointerUp(e) {
      const scbPointerDown = this.get('scrollbarPointerDown')
      
      if (!e || !scbPointerDown) return
      e.preventDefault()
      e.stopPropagation()

      this.set('scrollbarPointerDown', false)
      return false
    }


    animate(start, stop=0, speed=10, animateWidth=false) {
      const delta = stop - start
      const time = Math.max(.05, Math.min(Math.abs(delta) / speed, 1))
      const scbFactor = this.get('scrollbarFactor')
      const rightScbLimit = this.get('limitRight') * scbFactor

      let currentTime = 0,
          endpoint = this.get('scrolled'),
          scbEndpoint = endpoint * scbFactor

      const tick = () => {
        if (this.get('pointerDown') || this.get('mouseScroll')) return

        currentTime += (1 / 60)
        endpoint = currentTime < 1
          ? start + delta * this.config.easing(currentTime / time)
          : stop

        scbEndpoint = currentTime < 1
          ? start * scbFactor + delta * this.config.easing(currentTime / time) * scbFactor
          : stop * scbFactor


        if (!animateWidth) this.setScbPos(scbEndpoint)
        else {
          let scbw = this.get('scrollbarWidth')
          if (start < stop) scbw -= delta * scbFactor * (1 - this.config.easing(currentTime / time))
          else scbw += delta * scbFactor * (1 - this.config.easing(currentTime / time))

          this.setWidth(scbw)
        }

        this.setPos(-1 * endpoint)
        this.set('scrolled', endpoint)

        if (currentTime < 1) raf(tick)
        else this.checkBorderVisibility()
      }

      tick()
    }

    checkBorderVisibility() {
      const scrolled = this.get('scrolled')
      const limitLeft = this.get('limitLeft')
      const limitRight = this.get('limitRight')

      const prefix = this.config.prefix
      const rootNode = this.state.el

      if (scrolled > limitLeft) {
        const leftBorder = getElement(`.${prefix}-border--left`, rootNode)
        this.addClass(leftBorder, this.config.borderVsblClsnm)
      }
      else {
        const leftBorder = getElement(`.${prefix}-border--left`, rootNode)
        this.removeClass(leftBorder, this.config.borderVsblClsnm)
      }

      if (scrolled < limitRight) {
        const rightBorder = getElement(`.${prefix}-border--right`, rootNode)
        this.addClass(rightBorder, this.config.borderVsblClsnm)
      }
      else {
        const rightBorder = getElement(`.${prefix}-border--right`, rootNode)
        this.removeClass(rightBorder, this.config.borderVsblClsnm)
      }

    }


    // public API

    scrollTo(point, time=1000) {
      const limitRight = this.get('limitRight')
      const limitLeft = this.get('limitLeft')
      let endpoint = !isNaN(point) ? parseInt(point) : 0
      endpoint = Math.min(Math.max(endpoint, limitLeft), limitRight)

      if (point == 'end') endpoint = limitRight
      else if (point == 'start') endpoint = limitLeft
      else if (point == 'center') endpoint = limitRight / 2

      this.animate(this.get('scrolled'), endpoint, time, true)
    }
  }



  // autoinit

  const autoinit = () => {
    const els = getElements('.scroller')
    els.forEach(el => {
      const scroller = new Scroller({ el })
    })
  }

  document.addEventListener('DOMContentLoaded', () => autoinit)

  document.onreadystatechange = () => {
    if (document.readyState == "interactive") autoinit()
  }

}())
