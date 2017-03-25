(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

  // closest polyfill

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (css) {
      var node = this;

      while (node) {
        if (node.matches(css)) return node;else node = node.parentElement;
      }

      return null;
    };
  }

  // helpers

  var getElement = function getElement(selector) {
    var ctx = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    var node = ctx.querySelectorAll(selector);
    return node ? node[0] : null;
  };

  var getElements = function getElements(selector) {
    var ctx = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    var node = ctx.querySelectorAll(selector);
    return node || null;
  };

  // scroller

  var Scroller = function () {
    function Scroller(config) {
      _classCallCheck(this, Scroller);

      var _config$align = config.align;
      var align = _config$align === undefined ? 'center' : _config$align;
      var _config$noAnchors = config.noAnchors;
      var noAnchors = _config$noAnchors === undefined ? false : _config$noAnchors;
      var _config$noScrollbar = config.noScrollbar;
      var noScrollbar = _config$noScrollbar === undefined ? false : _config$noScrollbar;
      var el = config.el;
      var onClick = config.onClick;


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

        easing: function easing(pos) {
          return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
        }
      };

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
        el: el || null
      };

      this.init(el);

      window.raf = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
          setTimeout(callback, 1000 / 60);
        };
      }();
    }

    _createClass(Scroller, [{
      key: 'get',
      value: function get(prop) {
        return typeof this.state[prop] !== 'undefined' ? this.state[prop] : null;
      }
    }, {
      key: 'set',
      value: function set(prop, value) {
        this.state[prop] = value;
      }
    }, {
      key: 'push',
      value: function push(prop, value) {
        this.state[prop] && this.state[prop].push(value);
      }
    }, {
      key: 'clear',
      value: function clear(prop) {
        var field = this.state[prop];
        if (field && field.length) field.length = 0;
      }
    }, {
      key: 'getLastMeaningfull',
      value: function getLastMeaningfull(prop) {
        var field = this.state[prop];
        var toIgnore = field && field.length && field.length > 3 ? 3 : 1;
        return field[field.length - toIgnore] || 0;
      }
    }, {
      key: 'addClass',
      value: function addClass(el, cl) {
        if (!new RegExp('(\\s|^)' + cl + '(\\s|$)').test(el.className)) el.className += ' ' + cl;
      }
    }, {
      key: 'removeClass',
      value: function removeClass(el, cl) {
        el.className = el.className.replace(new RegExp('(\\s+|^)' + cl + '(\\s+|$)', 'g'), ' ').replace(/^\s+|\s+$/g, '');
      }
    }, {
      key: 'alignScbToRight',
      value: function alignScbToRight() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        this.addClass(el, 'is-right');
      }
    }, {
      key: 'releaseScb',
      value: function releaseScb() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        this.removeClass(el, 'is-right');
      }
    }, {
      key: 'setPos',
      value: function setPos(pos) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-strip', rootNode);
        this.setPosition(el, pos);
      }
    }, {
      key: 'setScbPos',
      value: function setScbPos(pos) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        this.setPosition(el, pos);
      }
    }, {
      key: 'setPosition',
      value: function setPosition(el, pos) {
        el.style.webkitTransform = 'translate(' + pos + 'px, 0) translateZ(0)';
        el.style.MozTransform = el.style.msTransform = el.style.OTransform = el.style.transform = 'translateX(' + pos + 'px)';
      }
    }, {
      key: 'setWidth',
      value: function setWidth(width) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-scrollbar', rootNode);
        el.style.width = width + 'px';
      }
    }, {
      key: 'init',
      value: function init(el) {
        var _this = this;

        this.createWrapper();
        this.wrapItems();
        this.createAnchors();
        this.setSize();
        this.checkscrollable();

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var linkNodes = getElements('a', stripNode);

        var scrollNode = getElement('.' + prefix + '-scrollwrap', rootNode);
        var scrollbarNode = getElement('.' + prefix + '-scrollbar', rootNode);

        var anchorsNodes = getElements('.' + prefix + '-anchor', rootNode);

        // config
        if (rootNode.getAttribute('data-leftalign') || rootNode.getAttribute('data-leftIfWide') || this.config.align !== 'center') {
          this.addClass(rootNode, this.config.leftAlignClsnm);
        }

        if (this.config.noAnchors || rootNode.getAttribute('data-noanchors')) {
          this.addClass(rootNode, this.config.noAnchorsClsnm);
        }

        if (this.config.noScrollbar || rootNode.getAttribute('data-noscrollbar')) {
          this.addClass(rootNode, this.config.noScrollbarClsnm);
        }

        stripNode.addEventListener('mousedown', this.onPointerDown.bind(this));
        window.addEventListener('mousemove', this.onPointerMove.bind(this));
        window.addEventListener('mouseup', this.onPointerUp.bind(this));
        stripNode.addEventListener('mousewheel', this.onScroll.bind(this, stripNode));

        scrollbarNode.addEventListener('mousedown', this.onScrollbarPointerDown.bind(this));
        window.addEventListener('mousemove', this.onScrollbarPointerMove.bind(this));
        window.addEventListener('mouseup', this.onScrollbarPointerUp.bind(this));

        scrollNode.addEventListener('click', this.onScrollClick.bind(this));

        Array.from(anchorsNodes).forEach(function (anchorNode) {
          anchorNode.addEventListener('click', _this.onAnchorClick.bind(_this));
        });

        // prevent clickng
        Array.from(linkNodes).forEach(function (node) {
          node.addEventListener('click', _this.onClickLink.bind(_this), false);
        });

        window.addEventListener('resize', function (e) {
          _this.setSize();
          _this.checkscrollable();
        });

        window.addEventListener('load', function (e) {
          _this.setSize();
          _this.checkscrollable();
        });
      }
    }, {
      key: 'createWrapper',
      value: function createWrapper() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var prevHtml = rootNode.innerHTML;
        var wrapperHtml = '<div class="' + prefix + '-wrapper">\n        <div class="' + prefix + '-border ' + prefix + '-border--left"></div>\n        <div class="' + prefix + '-border ' + prefix + '-border--right"></div>\n        <div class="' + prefix + '-strip">' + prevHtml + '</div>\n\n        <div class="' + prefix + '-scrollwrap"><div class="' + prefix + '-scrollbar"></div></div>\n        <div class="' + prefix + '-anchors"></div>\n      </div>';

        rootNode.innerHTML = wrapperHtml;
        this.addClass(rootNode, prefix);
      }
    }, {
      key: 'wrapItems',
      value: function wrapItems() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);

        getElements(':scope > *', wrapperNode).forEach(function (itemNode) {
          var itemWrapper = document.createElement('div');
          itemWrapper.innerHTML = itemNode.outerHTML;
          itemWrapper.setAttribute('class', prefix + '-item');
          itemNode.parentNode.insertBefore(itemWrapper, itemNode);
          itemNode.remove();
        });
      }
    }, {
      key: 'createAnchors',
      value: function createAnchors() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        var anchorsHtml = '',
            counter = 0;

        getElements(':scope > *', wrapperNode).forEach(function (itemNode) {
          var anchorText = getElement('[data-anchor]', itemNode).getAttribute('data-anchor');
          anchorsHtml += '<span data-anchorid="' + counter + '" class="' + prefix + '-anchor"><span>' + anchorText + '</span></span>';
          itemNode.setAttribute('data-anchororiginid', counter);
          counter++;
        });

        ancWrapperNode.innerHTML = anchorsHtml;
      }
    }, {
      key: 'setSize',
      value: function setSize() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var wrapperNode = getElement('.' + prefix + '-wrapper', rootNode);
        var scrollbarNode = getElement('.' + prefix + '-scrollbar', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var maxHeight = 0,
            sumWidth = 0;

        itemNodes.forEach(function (itemNode) {
          var currentHeight = itemNode.offsetHeight;
          if (currentHeight > maxHeight) maxHeight = currentHeight;

          sumWidth += itemNode.offsetWidth;
        });

        var wrapperWidth = wrapperNode.offsetWidth;
        var scrollbarFactor = wrapperWidth / sumWidth;

        rootNode.style.height = maxHeight + 'px';
        stripNode.style.height = maxHeight + 'px';
        stripNode.style.width = sumWidth + 1 + 'px';
        wrapperNode.style.height = maxHeight + 'px';
        scrollbarNode.style.width = wrapperWidth * scrollbarFactor + 'px';

        this.set('limitRight', sumWidth + 1 - rootNode.offsetWidth);
        this.set('scrollbarFactor', scrollbarFactor);
        this.set('scrollbarWidth', wrapperWidth * scrollbarFactor);
      }
    }, {
      key: 'checkscrollable',
      value: function checkscrollable() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var wrapperNode = getElement('.' + prefix + '-wrapper', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        var sumWidth = 0,
            wrapperWidth = wrapperNode.offsetWidth;

        itemNodes.forEach(function (itemNode) {
          sumWidth += itemNode.offsetWidth;
        });

        if (wrapperWidth >= sumWidth) {
          this.set('scrollable', false);
          this.addClass(rootNode, 'is-not-scrollable');
          ancWrapperNode.setAttribute('style', 'width: ' + sumWidth + 'px');
        } else {
          this.set('scrollable', true);
          this.removeClass(rootNode, 'is-not-scrollable');
          ancWrapperNode.setAttribute('style', 'width:auto');
        }
      }
    }, {
      key: 'onPointerDown',
      value: function onPointerDown(e) {
        var scrollable = this.get('scrollable');

        if (!e || !scrollable) return;
        e.preventDefault();

        this.set('pointerDown', true);
        this.set('scrollbarPointerDown', false);
        this.set('mouseScroll', false);
        this.set('downEventTS', new Date().getTime());

        var diff = this.get('scrolled') + (e.originalEvent && e.originalEvent.pageX || e.pageX);
        this.set('scrolledDiff', diff);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.addClass(getElement('html'), this.config.draggingClsnm);
        return false;
      }
    }, {
      key: 'onPointerMove',
      value: function onPointerMove(e) {
        var scrollable = this.get('scrollable');
        var pointerDown = this.get('pointerDown');

        if (!e || !pointerDown || !scrollable) return;
        e.preventDefault();

        var scrolledDiff = this.get('scrolledDiff');
        var scrolled = this.get('scrolled');

        // drag to left is positive number
        var currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var result = scrolledDiff - currentPageX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarResult = result * scrollbarFactor;
        var scrollbarWidth = this.get('scrollbarWidth');

        if (result < limitLeft) {
          result = Math.round(0.2 * result);
          scrollbarWidth += Math.round(0.2 * scrollbarResult);
          scrollbarResult = 0;
          this.setWidth(scrollbarWidth);
        } else if (result > limitRight) {
          result = Math.round(0.2 * result + 0.8 * limitRight);
          scrollbarWidth -= Math.round(0.8 * (result - limitRight) * scrollbarFactor);
          this.alignScbToRight();
          this.setWidth(scrollbarWidth);
        } else {
          this.releaseScb();
        }

        this.setPos(-1 * result);
        this.setScbPos(scrollbarResult);

        this.set('scrolled', result);
        this.set('moveEventTS', new Date().getTime());
        this.push('pageX', currentPageX);

        this.checkBorderVisibility();
        return false;
      }
    }, {
      key: 'onPointerUp',
      value: function onPointerUp(e) {
        var scrollable = this.get('scrollable');
        var pointerDown = this.get('pointerDown');

        if (!e || !pointerDown || !scrollable) return;
        e.preventDefault();

        this.set('pointerDown', false);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.removeClass(getElement('html'), this.config.draggingClsnm);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');

        var lastPageX = this.getLastMeaningfull('pageX');
        var currentEventX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var distanceDelta = currentEventX - lastPageX;
        var timeDelta = (new Date().getTime() - this.get('moveEventTS')) / 1.5;
        var endpoint = scrolled - distanceDelta * 8;

        // clicked
        if (lastPageX === 0) {
          if (this.config.onClick) return this.config.onClick(e);

          var linkNode = e.target.closest('a');
          if (!linkNode) return;

          var target = linkNode.getAttribute('target');
          var href = linkNode.getAttribute('href');
          if (!target && href) return window.location.href = href;
          if (target.indexOf('blank') > -1 && href) return window.open(href);
        }

        // dragged
        // sticky left
        if (scrolled < limitLeft) this.animate(scrolled, limitLeft, 10, true);
        // too much to left
        else if (endpoint < limitLeft) this.animate(scrolled, limitLeft, 10);
          // sticky right
          else if (scrolled > limitRight) this.animate(scrolled, limitRight, 10, true);
            // too much to right
            else if (endpoint > limitRight) this.animate(scrolled, limitRight, 10);
              // otherwise
              else if (timeDelta < 150 && Math.abs(distanceDelta) > 2) {
                  var timeToEndpoint = Math.abs(distanceDelta) / timeDelta;
                  this.animate(scrolled, endpoint, timeToEndpoint);
                }

        this.clear('pageX');
        return false;
      }
    }, {
      key: 'onClickLink',
      value: function onClickLink(e) {
        var scrollable = this.get('scrollable');
        if (!scrollable) return e;

        e.preventDefault();
        return false;
      }
    }, {
      key: 'onScroll',
      value: function onScroll(originalNode, e) {
        var scrollable = this.get('scrollable');

        if (!e || !e.deltaX || Math.abs(e.deltaY) > Math.abs(e.deltaX) || !scrollable) {
          return;
        }

        e.preventDefault();

        var deltaX = e.deltaX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var result = Math.min(Math.max(this.get('scrolled') + deltaX, limitLeft), limitRight);

        var scrollbarWidth = this.get('scrollbarWidth');
        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarResult = result * scrollbarFactor;

        this.setPos(-1 * result);
        this.releaseScb();
        this.setScbPos(scrollbarResult);
        this.setWidth(scrollbarWidth);
        this.set('scrolled', result);
        this.set('mouseScroll', true);

        this.checkBorderVisibility();
        return false;
      }
    }, {
      key: 'onScrollClick',
      value: function onScrollClick(e) {
        var scrollable = this.get('scrollable');
        var scrollClickDisabled = this.get('scrollClickDisabled');

        if (scrollClickDisabled) {
          this.set('scrollClickDisabled', false);
          return;
        }

        if (!e || !e.preventDefault || !scrollable) return;
        e.preventDefault();

        var scbWidth = this.get('scrollbarWidth');
        var scbFactor = this.get('scrollbarFactor');
        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var rightScbLimit = limitRight * scbFactor;
        var scrolled = this.get('scrolled');

        var pageX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var center = pageX - scbWidth / 2;
        var leftEdge = center - scbWidth / 2;
        var rightEdge = center + scbWidth / 2;

        var endpoint = center / scbFactor;
        if (leftEdge < limitLeft) endpoint = limitLeft;else if (rightEdge > rightScbLimit) endpoint = limitRight;

        this.animate(scrolled, endpoint);
        return false;
      }
    }, {
      key: 'onAnchorClick',
      value: function onAnchorClick(e) {
        var scrollable = this.get('scrollable');
        if (!e || !e.target || !scrollable) return;

        var anchorid = e.target.closest('[data-anchorid]').getAttribute('data-anchorid');
        if (!anchorid) return;

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var targetNode = getElement('[data-anchororiginid="' + anchorid + '"]', rootNode);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');
        var endpoint = Math.min(Math.max(targetNode.offsetLeft, limitLeft), limitRight);

        this.set('mouseScroll', false);
        this.animate(scrolled, endpoint);
        return false;
      }
    }, {
      key: 'onScrollbarPointerDown',
      value: function onScrollbarPointerDown(e) {
        if (!e) return;
        e.preventDefault();
        e.stopPropagation();

        var currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var scrolled = this.get('scrolled');
        var scrollbarFactor = this.get('scrollbarFactor');

        this.set('scrollbarPointerDown', true);
        this.set('scrollClickDisabled', true);
        this.set('pointerDown', false);
        this.set('mouseScroll', false);
        this.set('scrollbarDownPageX', currentPageX - scrolled * scrollbarFactor);

        return false;
      }
    }, {
      key: 'onScrollbarPointerMove',
      value: function onScrollbarPointerMove(e) {
        var scbPointerDown = this.get('scrollbarPointerDown');
        if (!e || !scbPointerDown) return;
        e.preventDefault();
        e.stopPropagation();

        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarDownPageX = this.get('scrollbarDownPageX');
        var currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var delta = currentPageX - scrollbarDownPageX;
        var result = Math.min(Math.max(delta / scrollbarFactor, limitLeft), limitRight);
        var scrollbarResult = result * scrollbarFactor;

        this.setPos(-1 * result);
        this.setScbPos(scrollbarResult);

        this.set('scrolled', result);
        this.checkBorderVisibility();
        return false;
      }
    }, {
      key: 'onScrollbarPointerUp',
      value: function onScrollbarPointerUp(e) {
        var scbPointerDown = this.get('scrollbarPointerDown');

        if (!e || !scbPointerDown) return;
        e.preventDefault();
        e.stopPropagation();

        this.set('scrollbarPointerDown', false);
        return false;
      }
    }, {
      key: 'animate',
      value: function animate(start) {
        var stop = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var _this2 = this;

        var speed = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];
        var animateWidth = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var delta = stop - start;
        var time = Math.max(.05, Math.min(Math.abs(delta) / speed, 1));
        var scbFactor = this.get('scrollbarFactor');
        var rightScbLimit = this.get('limitRight') * scbFactor;

        var currentTime = 0,
            endpoint = this.get('scrolled'),
            scbEndpoint = endpoint * scbFactor;

        var tick = function tick() {
          if (_this2.get('pointerDown') || _this2.get('mouseScroll')) return;

          currentTime += 1 / 60;
          endpoint = currentTime < 1 ? start + delta * _this2.config.easing(currentTime / time) : stop;

          scbEndpoint = currentTime < 1 ? start * scbFactor + delta * _this2.config.easing(currentTime / time) * scbFactor : stop * scbFactor;

          if (!animateWidth) _this2.setScbPos(scbEndpoint);else {
            var scbw = _this2.get('scrollbarWidth');
            if (start < stop) scbw -= delta * scbFactor * (1 - _this2.config.easing(currentTime / time));else scbw += delta * scbFactor * (1 - _this2.config.easing(currentTime / time));

            _this2.setWidth(scbw);
          }

          _this2.setPos(-1 * endpoint);
          _this2.set('scrolled', endpoint);

          if (currentTime < 1) raf(tick);else _this2.checkBorderVisibility();
        };

        tick();
      }
    }, {
      key: 'checkBorderVisibility',
      value: function checkBorderVisibility() {
        var scrolled = this.get('scrolled');
        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');

        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        if (scrolled > limitLeft) {
          var leftBorder = getElement('.' + prefix + '-border--left', rootNode);
          this.addClass(leftBorder, this.config.borderVsblClsnm);
        } else {
          var _leftBorder = getElement('.' + prefix + '-border--left', rootNode);
          this.removeClass(_leftBorder, this.config.borderVsblClsnm);
        }

        if (scrolled < limitRight) {
          var rightBorder = getElement('.' + prefix + '-border--right', rootNode);
          this.addClass(rightBorder, this.config.borderVsblClsnm);
        } else {
          var _rightBorder = getElement('.' + prefix + '-border--right', rootNode);
          this.removeClass(_rightBorder, this.config.borderVsblClsnm);
        }
      }

      // public API

    }, {
      key: 'scrollTo',
      value: function scrollTo(point) {
        var time = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];

        var limitRight = this.get('limitRight');
        var limitLeft = this.get('limitLeft');
        var endpoint = !isNaN(point) ? parseInt(point) : 0;
        endpoint = Math.min(Math.max(endpoint, limitLeft), limitRight);

        if (point == 'end') endpoint = limitRight;else if (point == 'start') endpoint = limitLeft;else if (point == 'center') endpoint = limitRight / 2;

        this.animate(this.get('scrolled'), endpoint, time, true);
      }
    }]);

    return Scroller;
  }();

  // autoinit

  var autoinit = function autoinit() {
    var els = getElements('.scroller');
    els.forEach(function (el) {
      var scroller = new Scroller({ el: el });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    return autoinit;
  });

  document.onreadystatechange = function () {
    if (document.readyState == "interactive") autoinit();
  };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBSSxDQUFDLFFBQVEsU0FBUixDQUFrQixPQUF2QixFQUFnQztBQUM5QixZQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsVUFBUyxHQUFULEVBQWM7QUFDeEMsVUFBSSxPQUFPLElBQVg7O0FBRUEsYUFBTyxJQUFQLEVBQWE7QUFDWCxZQUFJLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBSixFQUF1QixPQUFPLElBQVAsQ0FBdkIsS0FDSyxPQUFPLEtBQUssYUFBWjtBQUNOOztBQUVELGFBQU8sSUFBUDtBQUNELEtBVEQ7QUFVRDs7OztBQUtELE1BQU0sYUFBYSxTQUFiLFVBQWEsQ0FBQyxRQUFELEVBQTRCO0FBQUEsUUFBakIsR0FBaUIseURBQWIsUUFBYTs7QUFDN0MsUUFBTSxPQUFPLElBQUksZ0JBQUosQ0FBcUIsUUFBckIsQ0FBYjtBQUNBLFdBQU8sT0FBTyxLQUFLLENBQUwsQ0FBUCxHQUFpQixJQUF4QjtBQUNELEdBSEQ7O0FBS0EsTUFBTSxjQUFjLFNBQWQsV0FBYyxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM5QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxRQUFRLElBQWY7QUFDRCxHQUhEOzs7O0FBekJVLE1Ba0NKLFFBbENJO0FBbUNSLHNCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFBQSwwQkFPZCxNQVBjLENBRWhCLEtBRmdCO0FBQUEsVUFFaEIsS0FGZ0IsaUNBRVYsUUFGVTtBQUFBLDhCQU9kLE1BUGMsQ0FHaEIsU0FIZ0I7QUFBQSxVQUdoQixTQUhnQixxQ0FHTixLQUhNO0FBQUEsZ0NBT2QsTUFQYyxDQUloQixXQUpnQjtBQUFBLFVBSWhCLFdBSmdCLHVD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LFFBQUksT0FBSixDQUFZLGNBQU07QUFDaEIsVUFBTSxXQUFXLElBQUksUUFBSixDQUFhLEVBQUUsTUFBRixFQUFiLENBQWpCO0FBQ0QsS0FGRDtBQUdELEdBTEQ7O0FBT0EsV0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEM7QUFBQSxXQUFNLFFBQU47QUFBQSxHQUE5Qzs7QUFFQSxXQUFTLGtCQUFULEdBQThCLFlBQU07QUFDbEMsUUFBSSxTQUFTLFVBQVQsSUFBdUIsYUFBM0IsRUFBMEM7QUFDM0MsR0FGRDtBQUlELENBMXRCQSxHQUFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcblxuICAvLyBjbG9zZXN0IHBvbHlmaWxsXG5cbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uKGNzcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzXG5cbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLm1hdGNoZXMoY3NzKSkgcmV0dXJuIG5vZGVcbiAgICAgICAgZWxzZSBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cblxuICAvLyBoZWxwZXJzXG5cbiAgY29uc3QgZ2V0RWxlbWVudCA9IChzZWxlY3RvciwgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlID8gbm9kZVswXSA6IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEVsZW1lbnRzID0gKHNlbGVjdG9yLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGUgfHwgbnVsbFxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG5cbiAgY2xhc3MgU2Nyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj0nY2VudGVyJyxcbiAgICAgICAgbm9BbmNob3JzPWZhbHNlLFxuICAgICAgICBub1Njcm9sbGJhcj1mYWxzZSxcbiAgICAgICAgZWwsXG4gICAgICAgIG9uQ2xpY2tcbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgbm9BbmNob3JzOiBub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBub1Njcm9sbGJhcixcbiAgICAgICAgb25DbGljazogb25DbGljayxcblxuICAgICAgICBwcmVmaXg6ICdhYl9zY3JvbGxlcicsXG4gICAgICAgIGRyYWdnaW5nQ2xzbm06ICdpcy1kcmFnZ2luZycsXG4gICAgICAgIGxlZnRBbGlnbkNsc25tOiAnaXMtbGVmdC1hbGlnbicsXG4gICAgICAgIGJvcmRlclZzYmxDbHNubTogJ2lzLXZpc2libGUnLFxuICAgICAgICBub0FuY2hvcnNDbHNubTogJ2lzLW5vLWFuY2hvcnMnLFxuICAgICAgICBub1Njcm9sbGJhckNsc25tOiAnaXMtbm8tc2Nyb2xsYmFyJyxcblxuICAgICAgICBlYXNpbmc6IHBvcyA9PiBwb3MgPT09IDEgPyAxIDogLU1hdGgucG93KDIsIC0xMCAqIHBvcykgKyAxLFxuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBzY3JvbGxlZDogMCxcbiAgICAgICAgc2Nyb2xsYWJsZTogdHJ1ZSxcblxuICAgICAgICBwb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIHNjcm9sbGJhclBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgbW91c2VTY3JvbGw6IGZhbHNlLFxuXG4gICAgICAgIHNjcm9sbGJhcldpZHRoOiAwLFxuICAgICAgICBzY3JvbGxiYXJGYWN0b3I6IDAsXG5cbiAgICAgICAgcGFnZVg6IFtdLFxuICAgICAgICBzY3JvbGxlZERpZmY6IDAsXG4gICAgICAgIGRvd25FdmVudFRTOiAwLFxuICAgICAgICBtb3ZlRXZlbnRUUzogMCxcblxuICAgICAgICBzY3JvbGxiYXJEb3duUGFnZVg6IDAsXG4gICAgICAgIHNjcm9sbENsaWNrRGlzYWJsZWQ6IGZhbHNlLFxuXG4gICAgICAgIGxpbWl0TGVmdDogMCxcbiAgICAgICAgbGltaXRSaWdodDogMCxcbiAgICAgICAgc3RyaXBXaWR0aDogMCxcblxuICAgICAgICBsZW46IGVsLmhhc0NoaWxkTm9kZXMoKSAmJiBnZXRFbGVtZW50cygnOnNjb3BlID4gKicsIGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5pdChlbClcblxuICAgICAgd2luZG93LnJhZiA9ICgoKSA9PiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge3NldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCl9XG4gICAgICB9KSgpXG4gICAgfVxuXG5cbiAgICBnZXQocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZih0aGlzLnN0YXRlW3Byb3BdKSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICAgIDogbnVsbFxuICAgIH1cblxuICAgIHNldChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgcHVzaChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSAmJiB0aGlzLnN0YXRlW3Byb3BdLnB1c2godmFsdWUpXG4gICAgfVxuXG4gICAgY2xlYXIocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBpZiAoZmllbGQgJiYgZmllbGQubGVuZ3RoKSBmaWVsZC5sZW5ndGggPSAwXG4gICAgfVxuXG4gICAgZ2V0TGFzdE1lYW5pbmdmdWxsKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgY29uc3QgdG9JZ25vcmUgPSBmaWVsZCAmJiBmaWVsZC5sZW5ndGggJiYgZmllbGQubGVuZ3RoID4gMyA/IDMgOiAxXG4gICAgICByZXR1cm4gZmllbGRbZmllbGQubGVuZ3RoIC0gdG9JZ25vcmVdIHx8IDBcbiAgICB9XG5cblxuICAgIGFkZENsYXNzKGVsLCBjbCkge1xuICAgICAgaWYgKCFuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NsKycoXFxcXHN8JCknKS50ZXN0KGVsLmNsYXNzTmFtZSkpIGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbFxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKGVsLCBjbCkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lXG4gICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxccyt8XiknK2NsKycoXFxcXHMrfCQpJywgJ2cnKSwgJyAnKVxuICAgICAgICAucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gICAgfVxuXG4gICAgYWxpZ25TY2JUb1JpZ2h0KCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsICdpcy1yaWdodCcpXG4gICAgfVxuXG4gICAgcmVsZWFzZVNjYigpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuXG4gICAgc2V0UG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFNjYlBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsLCBwb3MpXG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb24oZWwsIHBvcykge1xuICAgICAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgcG9zICsgJ3B4LCAwKSB0cmFuc2xhdGVaKDApJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG4gICAgc2V0V2lkdGgod2lkdGgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja3Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgLy8gY29uZmlnXG4gICAgICBpZiAoXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0YWxpZ24nKSB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKSB8fFxuICAgICAgICB0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcidcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycyB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9hbmNob3JzJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgfVxuXG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcywgc3RyaXBOb2RlKSlcbiAgICAgIFxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuXG4gICAgICBzY3JvbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNjcm9sbENsaWNrLmJpbmQodGhpcykpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmdcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja3Njcm9sbGFibGUoKVxuICAgICAgfSlcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja3Njcm9sbGFibGUoKVxuICAgICAgfSlcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+PGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JzXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5gXG5cbiAgICAgIHJvb3ROb2RlLmlubmVySFRNTCA9IHdyYXBwZXJIdG1sXG4gICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCBwcmVmaXgpXG4gICAgfVxuXG4gICAgd3JhcEl0ZW1zKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBnZXRFbGVtZW50cygnOnNjb3BlID4gKicsIHdyYXBwZXJOb2RlKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgaXRlbVdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBpdGVtV3JhcHBlci5pbm5lckhUTUwgPSBpdGVtTm9kZS5vdXRlckhUTUxcbiAgICAgICAgaXRlbVdyYXBwZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgIGl0ZW1Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW1XcmFwcGVyLCBpdGVtTm9kZSlcbiAgICAgICAgaXRlbU5vZGUucmVtb3ZlKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY3JlYXRlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgYW5jaG9yc0h0bWwgPSAnJywgY291bnRlciA9IDBcblxuICAgICAgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCB3cmFwcGVyTm9kZSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JdJywgaXRlbU5vZGUpLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKVxuICAgICAgICBhbmNob3JzSHRtbCArPSBgPHNwYW4gZGF0YS1hbmNob3JpZD1cIiR7Y291bnRlcn1cIiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JcIj48c3Bhbj4ke2FuY2hvclRleHR9PC9zcGFuPjwvc3Bhbj5gXG4gICAgICAgIGl0ZW1Ob2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JvcmlnaW5pZCcsIGNvdW50ZXIpXG4gICAgICAgIGNvdW50ZXIrK1xuICAgICAgfSlcblxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gYW5jaG9yc0h0bWxcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcblxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgY29uc3Qgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHdyYXBwZXJXaWR0aCAvIHN1bVdpZHRoXG5cbiAgICAgIHJvb3ROb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcbiAgICAgIHdyYXBwZXJOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHNjcm9sbGJhck5vZGUuc3R5bGUud2lkdGggPSAod3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKSArICdweCdcblxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJGYWN0b3InLCBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyV2lkdGgnLCB3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgfVxuXG4gICAgY2hlY2tzY3JvbGxhYmxlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgc3VtV2lkdGggPSAwLCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBpZiAod3JhcHBlcldpZHRoID49IHN1bVdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgZmFsc2UpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6ICR7c3VtV2lkdGh9cHhgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDphdXRvYClcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG5cbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSArIChlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVgpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWREaWZmJywgZGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkRGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZERpZmYnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICAvLyBkcmFnIHRvIGxlZnQgaXMgcG9zaXRpdmUgbnVtYmVyXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGxldCByZXN1bHQgPSBzY3JvbGxlZERpZmYgLSBjdXJyZW50UGFnZVhcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBsZXQgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG4gICAgICBsZXQgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuXG4gICAgICBpZiAocmVzdWx0IDwgbGltaXRMZWZ0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCArPSBNYXRoLnJvdW5kKDAuMiAqIHNjcm9sbGJhclJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyUmVzdWx0ID0gMFxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoIC09IE1hdGgucm91bmQoMC44ICogKHJlc3VsdCAtIGxpbWl0UmlnaHQpICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgICB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgICB0aGlzLnB1c2goJ3BhZ2VYJywgY3VycmVudFBhZ2VYKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG4gICAgICBjb25zdCB0aW1lRGVsdGEgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHRoaXMuZ2V0KCdtb3ZlRXZlbnRUUycpKSAvIDEuNVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogOClcblxuICAgICAgLy8gY2xpY2tlZFxuICAgICAgaWYgKGxhc3RQYWdlWCA9PT0gMCkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcub25DbGljaykgcmV0dXJuIHRoaXMuY29uZmlnLm9uQ2xpY2soZSlcblxuICAgICAgICBjb25zdCBsaW5rTm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgICBpZiAoIWxpbmtOb2RlKSByZXR1cm5cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpXG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICBpZiAoIXRhcmdldCAmJiBocmVmKSByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmXG4gICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZignYmxhbmsnKSA+IC0xICYmIGhyZWYpIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgfVxuXG4gICAgICAvLyBkcmFnZ2VkXG4gICAgICAvLyBzdGlja3kgbGVmdFxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byBsZWZ0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwKVxuICAgICAgLy8gc3RpY2t5IHJpZ2h0XG4gICAgICBlbHNlIGlmIChzY3JvbGxlZCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byByaWdodFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwKVxuICAgICAgLy8gb3RoZXJ3aXNlXG4gICAgICBlbHNlIGlmICh0aW1lRGVsdGEgPCAxNTAgJiYgTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgPiAyKSB7XG4gICAgICAgIGNvbnN0IHRpbWVUb0VuZHBvaW50ID0gTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgLyB0aW1lRGVsdGFcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludCwgdGltZVRvRW5kcG9pbnQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xlYXIoJ3BhZ2VYJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25DbGlja0xpbmsoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIGVcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsKG9yaWdpbmFsTm9kZSwgZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcblxuICAgICAgaWYgKCFlIHx8ICFlLmRlbHRhWCB8fCBNYXRoLmFicyhlLmRlbHRhWSkgPiBNYXRoLmFicyhlLmRlbHRhWCkgfHwgICFzY3JvbGxhYmxlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qge2RlbHRhWH0gPSBlXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGRlbHRhWCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIHRydWUpXG5cbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3Qgc2Nyb2xsQ2xpY2tEaXNhYmxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJylcblxuICAgICAgaWYgKHNjcm9sbENsaWNrRGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCBmYWxzZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhZS5wcmV2ZW50RGVmYXVsdCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qgc2NiV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gbGltaXRSaWdodCAqIHNjYkZhY3RvclxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBwYWdlWCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgY29uc3QgY2VudGVyID0gcGFnZVggLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IGxlZnRFZGdlID0gY2VudGVyIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCByaWdodEVkZ2UgPSBjZW50ZXIgKyBzY2JXaWR0aCAvIDJcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gY2VudGVyIC8gc2NiRmFjdG9yXG4gICAgICBpZiAobGVmdEVkZ2UgPCBsaW1pdExlZnQpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChyaWdodEVkZ2UgPiByaWdodFNjYkxpbWl0KSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcblxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFxuICAgIG9uQW5jaG9yQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS50YXJnZXQgfHwgIXNjcm9sbGFibGUpIHJldHVybiBcbiAgICAgIFxuICAgICAgY29uc3QgYW5jaG9yaWQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hbmNob3JpZF0nKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yaWQnKVxuICAgICAgaWYgKCFhbmNob3JpZCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yb3JpZ2luaWQ9XCInICsgYW5jaG9yaWQgKyAnXCJdJywgcm9vdE5vZGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnLCBjdXJyZW50UGFnZVggLSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvcilcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckRvd25QYWdlWCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGRlbHRhID0gKGN1cnJlbnRQYWdlWCAtIHNjcm9sbGJhckRvd25QYWdlWClcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KGRlbHRhIC8gc2Nyb2xsYmFyRmFjdG9yLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBhbmltYXRlKHN0YXJ0LCBzdG9wPTAsIHNwZWVkPTEwLCBhbmltYXRlV2lkdGg9ZmFsc2UpIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gc3RvcCAtIHN0YXJ0XG4gICAgICBjb25zdCB0aW1lID0gTWF0aC5tYXgoLjA1LCBNYXRoLm1pbihNYXRoLmFicyhkZWx0YSkgLyBzcGVlZCwgMSkpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpICogc2NiRmFjdG9yXG5cbiAgICAgIGxldCBjdXJyZW50VGltZSA9IDAsXG4gICAgICAgICAgZW5kcG9pbnQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSxcbiAgICAgICAgICBzY2JFbmRwb2ludCA9IGVuZHBvaW50ICogc2NiRmFjdG9yXG5cbiAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmdldCgncG9pbnRlckRvd24nKSB8fCB0aGlzLmdldCgnbW91c2VTY3JvbGwnKSkgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudFRpbWUgKz0gKDEgLyA2MClcbiAgICAgICAgZW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKVxuICAgICAgICAgIDogc3RvcFxuXG4gICAgICAgIHNjYkVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCAqIHNjYkZhY3RvciArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkgKiBzY2JGYWN0b3JcbiAgICAgICAgICA6IHN0b3AgKiBzY2JGYWN0b3JcblxuXG4gICAgICAgIGlmICghYW5pbWF0ZVdpZHRoKSB0aGlzLnNldFNjYlBvcyhzY2JFbmRwb2ludClcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IHNjYncgPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgICAgIGlmIChzdGFydCA8IHN0b3ApIHNjYncgLT0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuICAgICAgICAgIGVsc2Ugc2NidyArPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG5cbiAgICAgICAgICB0aGlzLnNldFdpZHRoKHNjYncpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvcygtMSAqIGVuZHBvaW50KVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCBlbmRwb2ludClcblxuICAgICAgICBpZiAoY3VycmVudFRpbWUgPCAxKSByYWYodGljaylcbiAgICAgICAgZWxzZSB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICB9XG5cbiAgICAgIHRpY2soKVxuICAgIH1cblxuICAgIGNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHNjcm9sbGVkID4gbGltaXRMZWZ0KSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gcHVibGljIEFQSVxuXG4gICAgc2Nyb2xsVG8ocG9pbnQsIHRpbWU9MTAwMCkge1xuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgbGV0IGVuZHBvaW50ID0gIWlzTmFOKHBvaW50KSA/IHBhcnNlSW50KHBvaW50KSA6IDBcbiAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgoZW5kcG9pbnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGlmIChwb2ludCA9PSAnZW5kJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnc3RhcnQnKSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ2NlbnRlcicpIGVuZHBvaW50ID0gbGltaXRSaWdodCAvIDJcblxuICAgICAgdGhpcy5hbmltYXRlKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBlbmRwb2ludCwgdGltZSwgdHJ1ZSlcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gYXV0b2luaXRcblxuICBjb25zdCBhdXRvaW5pdCA9ICgpID0+IHtcbiAgICBjb25zdCBlbHMgPSBnZXRFbGVtZW50cygnLnNjcm9sbGVyJylcbiAgICBlbHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBhdXRvaW5pdClcblxuICBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJpbnRlcmFjdGl2ZVwiKSBhdXRvaW5pdCgpXG4gIH1cblxufSgpKVxuIl19
