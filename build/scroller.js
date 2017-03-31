(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

  // Array.from polyfill

  if (!Array.from) Array.from = require('array-from');

  // remove polyfill

  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) return;

      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          this.parentNode.removeChild(this);
        }
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

  // matches polyfill

  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || function (selector) {
      var matches = document.querySelectorAll(selector),
          th = this;
      return Array.prototype.some.call(matches, function (e) {
        return e === th;
      });
    };
  }

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

  var getElement = function getElement() {
    var selector = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var ctx = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    var node = ctx.querySelectorAll(selector);
    return node ? node[0] : null;
  };

  var getElements = function getElements() {
    var selector = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var ctx = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    var nodes = ctx.querySelectorAll(selector);
    return nodes || null;
  };

  var getEventX = function getEventX(e) {
    return e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX || e.touches && e.touches.length && e.touches[0].pageX || e.pageX || 0;
  };

  var getChildren = function getChildren(el) {
    var childNodes = el.childNodes,
        children = [],
        i = childNodes.length;

    while (i--) {
      if (childNodes[i].nodeType == 1) children.unshift(childNodes[i]);
    }

    return children;
  };

  var isAndroid = function isAndroid() {
    return navigator.userAgent.toLowerCase().indexOf("android") > -1;
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
      var _config$start = config.start;
      var start = _config$start === undefined ? 0 : _config$start;
      var _config$startAnimDura = config.startAnimDuration;
      var startAnimDuration = _config$startAnimDura === undefined ? 1000 : _config$startAnimDura;
      var el = config.el;
      var onClick = config.onClick;


      this.config = {
        align: align,
        noAnchors: noAnchors,
        noScrollbar: noScrollbar,
        onClick: onClick,
        start: start,
        startAnimDuration: startAnimDuration,

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

        swipeDirection: null,
        touchX: 0,
        touchY: 0,

        let: el.hasChildNodes() && getChildren(el).length || 0,
        el: el || null,

        isAndroid: isAndroid()
      };

      window.raf = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
          setTimeout(callback, 1000 / 60);
        };
      }();

      this.init(el);
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
        el.style.webkitTransform = 'translateX(' + pos + 'px)';
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
        this.checkScrollable();

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

        if (rootNode.getAttribute('data-start')) {
          this.config.start = rootNode.getAttribute('data-start');
        }

        if (rootNode.getAttribute('data-startAnimDuration')) {
          this.config.startAnimDuration = rootNode.getAttribute('data-startAnimDuration');
        }

        stripNode.addEventListener('mousedown', this.onPointerDown.bind(this));
        stripNode.addEventListener('touchstart', this.onPointerDown.bind(this));
        document.addEventListener('mousemove', this.onPointerMove.bind(this));
        document.addEventListener('touchmove', this.onPointerMove.bind(this));
        document.addEventListener('mouseup', this.onPointerUp.bind(this));
        document.addEventListener('touchend', this.onPointerUp.bind(this));

        scrollbarNode.addEventListener('mousedown', this.onScrollbarPointerDown.bind(this));
        scrollbarNode.addEventListener('touchstart', this.onScrollbarPointerDown.bind(this));
        document.addEventListener('mousemove', this.onScrollbarPointerMove.bind(this));
        document.addEventListener('touchmove', this.onScrollbarPointerMove.bind(this));
        document.addEventListener('mouseup', this.onScrollbarPointerUp.bind(this));
        document.addEventListener('touchend', this.onScrollbarPointerUp.bind(this));

        scrollNode.addEventListener('click', this.onScrollClick.bind(this));

        var wheelEvent = /Firefox/i.test(navigator.userAgent) ? 'wheel' : 'mousewheel';
        stripNode.addEventListener(wheelEvent, this.onScroll.bind(this));

        Array.from(anchorsNodes).forEach(function (anchorNode) {
          anchorNode.addEventListener('click', _this.onAnchorClick.bind(_this));
        });

        // prevent clickng on links
        Array.from(linkNodes).forEach(function (node) {
          node.addEventListener('click', _this.onClickLink.bind(_this), false);
        });

        // rerender
        window.addEventListener('resize', function (e) {
          _this.setSize();
          _this.checkScrollable();
        });

        window.addEventListener('load', function (e) {
          _this.setSize();
          _this.checkScrollable();
        });

        // check for display none
        var isHidden = function isHidden(el) {
          return el.offsetParent === null;
        };

        if (isHidden(rootNode)) {
          (function () {
            var intervalId = setInterval(function () {
              if (!isHidden(rootNode)) {
                var scrolled = _this.get('scrolled');
                clearInterval(intervalId);
                // no polyfills for triggering resize
                // just recalc twice
                _this._update();
                _this._update();

                var _start = _this.config.start || 0;
                var _startAnimDuration = _this.config.startAnimDuration || 0;
                _this.scrollTo(_start, _startAnimDuration);
              }
            }, 50);
          })();
        }

        var start = this.config.start;
        var startAnimDuration = this.config.startAnimDuration;
        this.scrollTo(start, startAnimDuration);
        this.checkBorderVisibility();
      }
    }, {
      key: 'createWrapper',
      value: function createWrapper() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var prevHtml = rootNode.innerHTML;
        var wrapperHtml = '<div class="' + prefix + '-wrapper">\n        <div class="' + prefix + '-border ' + prefix + '-border--left"></div>\n        <div class="' + prefix + '-border ' + prefix + '-border--right"></div>\n        <div class="' + prefix + '-strip">' + prevHtml + '</div>\n\n        <div class="' + prefix + '-scrollwrap">\n          <div class="' + prefix + '-scrollbar"></div>\n        </div>\n        <div class="' + prefix + '-anchors"></div>\n      </div>';

        rootNode.innerHTML = wrapperHtml;
        this.addClass(rootNode, prefix);
      }
    }, {
      key: 'wrapItems',
      value: function wrapItems() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);

        Array.from(getChildren(wrapperNode)).forEach(function (itemNode) {
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

        Array.from(getChildren(wrapperNode)).forEach(function (itemNode) {
          var targetNode = getElement('[data-anchor]', itemNode);
          var anchorText = targetNode ? targetNode.getAttribute('data-anchor') : '';

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
        var scrollwrapNode = getElement('.' + prefix + '-scrollwrap', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var maxHeight = 0,
            sumWidth = 0;

        rootNode.setAttribute('style', '');
        stripNode.setAttribute('style', '');
        wrapperNode.setAttribute('style', '');
        scrollbarNode.setAttribute('style', '');
        scrollwrapNode.setAttribute('style', '');

        Array.from(itemNodes).forEach(function (itemNode) {
          var currentHeight = itemNode.offsetHeight;
          if (currentHeight > maxHeight) maxHeight = currentHeight;
          sumWidth += itemNode.offsetWidth;
        });

        var wrapperWidth = wrapperNode.offsetWidth;
        var scrollwrapWidth = scrollwrapNode.offsetWidth;
        var limitRight = sumWidth + 1 - rootNode.offsetWidth;

        var scrollbarFactor = scrollwrapWidth / sumWidth;
        var scrolled = Math.min(this.get('scrolled'), limitRight);
        var scbScrolled = scrolled * scrollbarFactor;

        rootNode.style.height = maxHeight + 'px';
        stripNode.style.height = maxHeight + 'px';
        stripNode.style.width = sumWidth + 1 + 'px';
        wrapperNode.style.height = maxHeight + 'px';
        scrollbarNode.style.width = wrapperWidth * scrollbarFactor + 'px';

        this.setPos(-1 * scrolled);
        this.setScbPos(scbScrolled);
        this.set('limitRight', limitRight);
        this.set('scrollbarFactor', scrollbarFactor);
        this.set('scrollbarWidth', wrapperWidth * scrollbarFactor);
      }
    }, {
      key: 'checkScrollable',
      value: function checkScrollable() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var wrapperNode = getElement('.' + prefix + '-wrapper', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        var sumWidth = 0,
            wrapperWidth = wrapperNode.offsetWidth;

        Array.from(itemNodes).forEach(function (itemNode) {
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
      key: '_update',
      value: function _update() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        if (this.config.align !== 'center') this.addClass(rootNode, this.config.leftAlignClsnm);else this.removeClass(rootNode, this.config.leftAlignClsnm);

        if (this.config.noAnchors) this.addClass(rootNode, this.config.noAnchorsClsnm);else this.removeClass(rootNode, this.config.noAnchorsClsnm);

        if (this.config.noScrollbar) this.addClass(rootNode, this.config.noScrollbarClsnm);else this.removeClass(rootNode, this.config.noScrollbarClsnm);

        this.setSize();
        this.checkScrollable();
        this.checkBorderVisibility();

        if (!this.config.noScrollbar) {
          var scrolled = this.get('scrolled');
          this.animate(scrolled, scrolled, 0);
        }
      }
    }, {
      key: 'checkElement',
      value: function checkElement(e) {
        return e.target.closest('.' + this.config.prefix) == this.state.el;
      }
    }, {
      key: 'onPointerDown',
      value: function onPointerDown(e) {
        var scrollable = this.get('scrollable');
        if (!e || !scrollable) return;

        this.handleTouchStart(e);
        if (!e.touches && !e.changedTouches) e.preventDefault();

        this.set('pointerDown', true);
        this.set('scrollbarPointerDown', false);
        this.set('mouseScroll', false);
        this.set('downEventTS', new Date().getTime());

        var diff = this.get('scrolled') + getEventX(e);
        this.set('scrolledDiff', diff);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.addClass(getElement('html'), this.config.draggingClsnm);

        return;
      }
    }, {
      key: 'onPointerMove',
      value: function onPointerMove(e) {
        var scrollable = this.get('scrollable');
        var pointerDown = this.get('pointerDown');

        if (!e || !pointerDown || !scrollable) return;

        this.handleTouchMove(e);
        if (this.get('swipeDirection') == 'v') return;

        e.preventDefault();

        var scrolledDiff = this.get('scrolledDiff');
        var scrolled = this.get('scrolled');

        // drag to left is positive number
        var currentPageX = getEventX(e);
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

        if (this.get('swipeDirection') == 'v') {
          this.set('pointerDown', false);
          this.set('scrollbarPointerDown', false);
          this.set('mouseScroll', false);
          this.set('swipeDirection', null);
          this.clear('pageX');
          return;
        }

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
        var currentEventX = getEventX(e);
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
          var ctrlClick = e.ctrlKey || e.metaKey;

          if (ctrlClick) return window.open(href);
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
                  var timeToEndpoint = Math.round(Math.abs(distanceDelta) / timeDelta);
                  this.animate(scrolled, Math.round(endpoint), timeToEndpoint);
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
      value: function onScroll(e) {
        var scrollable = this.get('scrollable');
        if (!e || !e.deltaX || Math.abs(e.deltaY) > Math.abs(e.deltaX) || !scrollable) return;

        e.preventDefault();

        var deltaX = e.deltaX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var result = Math.min(Math.max(this.get('scrolled') + deltaX, limitLeft), limitRight);

        var scrollbarWidth = this.get('scrollbarWidth');
        var scrollbarFactor = this.get('scrollbarFactor');
        var scrollbarResult = result * scrollbarFactor;

        this.setPos(-1 * result);

        if (result == limitRight) this.alignScbToRight();else this.releaseScb();

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

        var pageX = getEventX(e);
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

        this.releaseScb();

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var targetNode = getElement('[data-anchororiginid="' + anchorid + '"]', rootNode);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');

        var endpoint = Math.min(Math.max(targetNode.offsetLeft, limitLeft), limitRight);
        if (Math.abs(endpoint) < 2) endpoint = 0;

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

        this.releaseScb();

        var currentPageX = getEventX(e);
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
        var currentPageX = getEventX(e);

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
      key: 'handleTouchStart',
      value: function handleTouchStart(e) {
        if (!e.touches && !e.changedTouches) return;
        this.set('touchX', e.changedTouches[0].clientX || e.touches[0].clientX);
        this.set('touchY', e.changedTouches[0].clientY || e.touches[0].clientY);
        return;
      }
    }, {
      key: 'handleTouchMove',
      value: function handleTouchMove(e) {
        var touchX = this.get('touchX');
        var touchY = this.get('touchY');
        if (!touchX || !touchY || !e.touches && !e.changedTouches) return;

        var xUp = e.changedTouches[0].clientX || e.touches[0].clientX;
        var yUp = e.changedTouches[0].clientY || e.touches[0].clientY;

        var xDiff = touchX - xUp;
        var yDiff = touchY - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) this.set('swipeDirection', 'h');else this.set('swipeDirection', 'v');

        this.set('touchX', 0);
        this.set('touchY', 0);
        return;
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
        var limitRight = this.get('limitRight');

        var currentTime = speed == 0 ? 1 : 0,
            endpoint = this.get('scrolled'),
            scbEndpoint = endpoint * scbFactor;

        var tick = function tick() {
          if (_this2.get('pointerDown') || _this2.get('mouseScroll')) return;

          currentTime += 1 / 60;
          endpoint = currentTime < 1 ? start + delta * _this2.config.easing(currentTime / time) : stop;

          scbEndpoint = currentTime < 1 ? start * scbFactor + delta * _this2.config.easing(currentTime / time) * scbFactor : stop * scbFactor;

          scbEndpoint = Math.min(scbEndpoint, rightScbLimit);

          if (!animateWidth) {
            if (scbEndpoint >= rightScbLimit) _this2.alignScbToRight();else _this2.releaseScb();
            _this2.setScbPos(scbEndpoint);
          } else {
            var scbw = _this2.get('scrollbarWidth');
            if (start < stop) scbw -= delta * scbFactor * (1 - _this2.config.easing(currentTime / time));else scbw += delta * scbFactor * (1 - _this2.config.easing(currentTime / time));

            _this2.setWidth(scbw);
          }

          _this2.setPos(-1 * endpoint);
          _this2.set('scrolled', endpoint);

          if (currentTime < 1) raf(tick);else _this2.checkBorderVisibility();
        };

        return tick();
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

        this.animate(this.get('scrolled'), endpoint, time);
      }
    }, {
      key: 'update',
      value: function update(config) {
        var _config$align2 = config.align;
        var align = _config$align2 === undefined ? this.config.align : _config$align2;
        var _config$noAnchors2 = config.noAnchors;
        var noAnchors = _config$noAnchors2 === undefined ? this.config.noAnchors : _config$noAnchors2;
        var _config$noScrollbar2 = config.noScrollbar;
        var noScrollbar = _config$noScrollbar2 === undefined ? this.config.noScrollbar : _config$noScrollbar2;
        var _config$onClick = config.onClick;
        var onClick = _config$onClick === undefined ? this.config.onClick : _config$onClick;
        var _config$start2 = config.start;
        var start = _config$start2 === undefined ? this.config.start : _config$start2;
        var _config$startAnimDura2 = config.startAnimDuration;
        var startAnimDuration = _config$startAnimDura2 === undefined ? this.config.startAnimDuration : _config$startAnimDura2;


        this.config.align = align;
        this.config.noAnchors = noAnchors;
        this.config.noScrollbar = noScrollbar;
        this.config.onClick = onClick;
        this.config.startAnimDuration = startAnimDuration;
        this.config.start = start;

        this._update();
      }
    }]);

    return Scroller;
  }();

  // init config

  var autoinit = function autoinit() {
    var els = getElements('.scroller');
    Array.from(els).forEach(function (el) {
      var scroller = new Scroller({ el: el });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    return autoinit;
  });

  document.onreadystatechange = function () {
    if (document.readyState == "interactive") autoinit();
  };

  window.Scroller = Scroller;
})();

},{"array-from":2}],2:[function(require,module,exports){
module.exports = (typeof Array.from === 'function' ?
  Array.from :
  require('./polyfill')
);

},{"./polyfill":3}],3:[function(require,module,exports){
// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: http://www.ecma-international.org/ecma-262/6.0/#sec-array.from
module.exports = (function() {
  var isCallable = function(fn) {
    return typeof fn === 'function';
  };
  var toInteger = function (value) {
    var number = Number(value);
    if (isNaN(number)) { return 0; }
    if (number === 0 || !isFinite(number)) { return number; }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  };
  var maxSafeInteger = Math.pow(2, 53) - 1;
  var toLength = function (value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  };
  var iteratorProp = function(value) {
    if(value != null) {
      if(['string','number','boolean','symbol'].indexOf(typeof value) > -1){
        return Symbol.iterator;
      } else if (
        (typeof Symbol !== 'undefined') &&
        ('iterator' in Symbol) &&
        (Symbol.iterator in value)
      ) {
        return Symbol.iterator;
      }
      // Support "@@iterator" placeholder, Gecko 27 to Gecko 35
      else if ('@@iterator' in value) {
        return '@@iterator';
      }
    }
  };
  var getMethod = function(O, P) {
    // Assert: IsPropertyKey(P) is true.
    if (O != null && P != null) {
      // Let func be GetV(O, P).
      var func = O[P];
      // ReturnIfAbrupt(func).
      // If func is either undefined or null, return undefined.
      if(func == null) {
        return void 0;
      }
      // If IsCallable(func) is false, throw a TypeError exception.
      if (!isCallable(func)) {
        throw new TypeError(func + ' is not a function');
      }
      return func;
    }
  };
  var iteratorStep = function(iterator) {
    // Let result be IteratorNext(iterator).
    // ReturnIfAbrupt(result).
    var result = iterator.next();
    // Let done be IteratorComplete(result).
    // ReturnIfAbrupt(done).
    var done = Boolean(result.done);
    // If done is true, return false.
    if(done) {
      return false;
    }
    // Return result.
    return result;
  };

  // The length property of the from method is 1.
  return function from(items /*, mapFn, thisArg */ ) {
    'use strict';

    // 1. Let C be the this value.
    var C = this;

    // 2. If mapfn is undefined, let mapping be false.
    var mapFn = arguments.length > 1 ? arguments[1] : void 0;

    var T;
    if (typeof mapFn !== 'undefined') {
      // 3. else
      //   a. If IsCallable(mapfn) is false, throw a TypeError exception.
      if (!isCallable(mapFn)) {
        throw new TypeError(
          'Array.from: when provided, the second argument must be a function'
        );
      }

      //   b. If thisArg was supplied, let T be thisArg; else let T
      //      be undefined.
      if (arguments.length > 2) {
        T = arguments[2];
      }
      //   c. Let mapping be true (implied by mapFn)
    }

    var A, k;

    // 4. Let usingIterator be GetMethod(items, @@iterator).
    // 5. ReturnIfAbrupt(usingIterator).
    var usingIterator = getMethod(items, iteratorProp(items));

    // 6. If usingIterator is not undefined, then
    if (usingIterator !== void 0) {
      // a. If IsConstructor(C) is true, then
      //   i. Let A be the result of calling the [[Construct]]
      //      internal method of C with an empty argument list.
      // b. Else,
      //   i. Let A be the result of the abstract operation ArrayCreate
      //      with argument 0.
      // c. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C()) : [];

      // d. Let iterator be GetIterator(items, usingIterator).
      var iterator = usingIterator.call(items);

      // e. ReturnIfAbrupt(iterator).
      if (iterator == null) {
        throw new TypeError(
          'Array.from requires an array-like or iterable object'
        );
      }

      // f. Let k be 0.
      k = 0;

      // g. Repeat
      var next, nextValue;
      while (true) {
        // i. Let Pk be ToString(k).
        // ii. Let next be IteratorStep(iterator).
        // iii. ReturnIfAbrupt(next).
        next = iteratorStep(iterator);

        // iv. If next is false, then
        if (!next) {

          // 1. Let setStatus be Set(A, "length", k, true).
          // 2. ReturnIfAbrupt(setStatus).
          A.length = k;

          // 3. Return A.
          return A;
        }
        // v. Let nextValue be IteratorValue(next).
        // vi. ReturnIfAbrupt(nextValue)
        nextValue = next.value;

        // vii. If mapping is true, then
        //   1. Let mappedValue be Call(mapfn, T, «nextValue, k»).
        //   2. If mappedValue is an abrupt completion, return
        //      IteratorClose(iterator, mappedValue).
        //   3. Let mappedValue be mappedValue.[[value]].
        // viii. Else, let mappedValue be nextValue.
        // ix.  Let defineStatus be the result of
        //      CreateDataPropertyOrThrow(A, Pk, mappedValue).
        // x. [TODO] If defineStatus is an abrupt completion, return
        //    IteratorClose(iterator, defineStatus).
        if (mapFn) {
          A[k] = mapFn.call(T, nextValue, k);
        }
        else {
          A[k] = nextValue;
        }
        // xi. Increase k by 1.
        k++;
      }
      // 7. Assert: items is not an Iterable so assume it is
      //    an array-like object.
    } else {

      // 8. Let arrayLike be ToObject(items).
      var arrayLike = Object(items);

      // 9. ReturnIfAbrupt(items).
      if (items == null) {
        throw new TypeError(
          'Array.from requires an array-like object - not null or undefined'
        );
      }

      // 10. Let len be ToLength(Get(arrayLike, "length")).
      // 11. ReturnIfAbrupt(len).
      var len = toLength(arrayLike.length);

      // 12. If IsConstructor(C) is true, then
      //     a. Let A be Construct(C, «len»).
      // 13. Else
      //     a. Let A be ArrayCreate(len).
      // 14. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 15. Let k be 0.
      k = 0;
      // 16. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = arrayLike[k];
        if (mapFn) {
          A[k] = mapFn.call(T, kValue, k);
        }
        else {
          A[k] = kValue;
        }
        k++;
      }
      // 17. Let setStatus be Set(A, "length", len, true).
      // 18. ReturnIfAbrupt(setStatus).
      A.length = len;
      // 19. Return A.
    }
    return A;
  };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7OztBQUlWLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSLENBQWI7Ozs7QUFLakIsR0FBQyxVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FiRCxFQWFHLENBQUMsUUFBUSxTQUFULEVBQW9CLGNBQWMsU0FBbEMsRUFBNkMsYUFBYSxTQUExRCxDQWJIOzs7O0FBa0JBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtVQUFtRCxLQUFLLElBQXhEO0FBQ0EsYUFBTyxNQUFNLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUIsRUFBbUMsVUFBUyxDQUFULEVBQVc7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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuICBcbiAgLy8gQXJyYXkuZnJvbSBwb2x5ZmlsbFxuICBcbiAgaWYgKCFBcnJheS5mcm9tKSBBcnJheS5mcm9tID0gcmVxdWlyZSgnYXJyYXktZnJvbScpO1xuICBcblxuICAvLyByZW1vdmUgcG9seWZpbGxcblxuICAoZnVuY3Rpb24gKGFycikge1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHJldHVyblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSkoW0VsZW1lbnQucHJvdG90eXBlLCBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSwgRG9jdW1lbnRUeXBlLnByb3RvdHlwZV0pXG5cblxuICAvLyBtYXRjaGVzIHBvbHlmaWxsXG5cbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIG1hdGNoZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgdGggPSB0aGlzXG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChtYXRjaGVzLCBmdW5jdGlvbihlKXtcbiAgICAgICAgcmV0dXJuIGUgPT09IHRoXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2xvc2VzdCBwb2x5ZmlsbFxuXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihjc3MpIHtcbiAgICAgIHZhciBub2RlID0gdGhpc1xuXG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5tYXRjaGVzKGNzcykpIHJldHVybiBub2RlXG4gICAgICAgIGVsc2Ugbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG5cbiAgLy8gaGVscGVyc1xuXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3I9JycsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZXMgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMgfHwgbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RXZlbnRYID0gZSA9PiB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWFxuICAgICAgfHwgZS50b3VjaGVzXG4gICAgICAgICYmIGUudG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS50b3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnBhZ2VYIFxuICAgICAgfHwgMFxuICB9XG5cbiAgY29uc3QgZ2V0Q2hpbGRyZW4gPSAoZWwpID0+IHtcbiAgICBsZXQgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXMsXG4gICAgICAgIGNoaWxkcmVuID0gW10sXG4gICAgICAgIGkgPSBjaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT0gMSkgY2hpbGRyZW4udW5zaGlmdChjaGlsZE5vZGVzW2ldKVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZHJlblxuICB9XG5cbiAgY29uc3QgaXNBbmRyb2lkID0gKCkgPT4ge1xuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImFuZHJvaWRcIikgPiAtMVxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG5cbiAgY2xhc3MgU2Nyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj0nY2VudGVyJyxcbiAgICAgICAgbm9BbmNob3JzPWZhbHNlLFxuICAgICAgICBub1Njcm9sbGJhcj1mYWxzZSxcbiAgICAgICAgc3RhcnQ9MCxcbiAgICAgICAgc3RhcnRBbmltRHVyYXRpb249MTAwMCxcbiAgICAgICAgZWwsXG4gICAgICAgIG9uQ2xpY2tcbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgbm9BbmNob3JzOiBub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBub1Njcm9sbGJhcixcbiAgICAgICAgb25DbGljazogb25DbGljayxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBzdGFydEFuaW1EdXJhdGlvbjogc3RhcnRBbmltRHVyYXRpb24sXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuICAgICAgICBsZWZ0QWxpZ25DbHNubTogJ2lzLWxlZnQtYWxpZ24nLFxuICAgICAgICBib3JkZXJWc2JsQ2xzbm06ICdpcy12aXNpYmxlJyxcbiAgICAgICAgbm9BbmNob3JzQ2xzbm06ICdpcy1uby1hbmNob3JzJyxcbiAgICAgICAgbm9TY3JvbGxiYXJDbHNubTogJ2lzLW5vLXNjcm9sbGJhcicsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHNjcm9sbGFibGU6IHRydWUsXG5cbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBzY3JvbGxiYXJQb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICAgICAgc2Nyb2xsYmFyRmFjdG9yOiAwLFxuXG4gICAgICAgIHBhZ2VYOiBbXSxcbiAgICAgICAgc2Nyb2xsZWREaWZmOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgc2Nyb2xsYmFyRG93blBhZ2VYOiAwLFxuICAgICAgICBzY3JvbGxDbGlja0Rpc2FibGVkOiBmYWxzZSxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG4gICAgICAgIHN0cmlwV2lkdGg6IDAsXG5cbiAgICAgICAgc3dpcGVEaXJlY3Rpb246IG51bGwsXG4gICAgICAgIHRvdWNoWDogMCxcbiAgICAgICAgdG91Y2hZOiAwLFxuXG4gICAgICAgIGxldDogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldENoaWxkcmVuKGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG5cbiAgICAgICAgaXNBbmRyb2lkOiBpc0FuZHJvaWQoKVxuICAgICAgfVxuXG4gICAgICB3aW5kb3cucmFmID0gKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcblxuICAgICAgdGhpcy5pbml0KGVsKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXSB8fCAwXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIGFsaWduU2NiVG9SaWdodCgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuICAgIHJlbGVhc2VTY2IoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRTY2JQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKGVsLCBwb3MpIHtcbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG4gICAgc2V0V2lkdGgod2lkdGgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgLy8gY29uZmlnXG4gICAgICBpZiAoXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0YWxpZ24nKSB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKSB8fFxuICAgICAgICB0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcidcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycyB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9hbmNob3JzJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAocm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0JykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnQgPSByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKVxuICAgICAgfVxuXG4gICAgICBpZiAocm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0QW5pbUR1cmF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltRHVyYXRpb24gPSByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnRBbmltRHVyYXRpb24nKVxuICAgICAgfVxuXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIFxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TY3JvbGxDbGljay5iaW5kKHRoaXMpKVxuXG4gICAgICBjb25zdCB3aGVlbEV2ZW50ID0gKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcih3aGVlbEV2ZW50LCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmcgb24gbGlua3NcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHJlcmVuZGVyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIC8vIGNoZWNrIGZvciBkaXNwbGF5IG5vbmVcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gZWwgPT4gZWwub2Zmc2V0UGFyZW50ID09PSBudWxsXG5cbiAgICAgIGlmIChpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICAgIC8vIG5vIHBvbHlmaWxscyBmb3IgdHJpZ2dlcmluZyByZXNpemUgXG4gICAgICAgICAgICAvLyBqdXN0IHJlY2FsYyB0d2ljZVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpXG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5jb25maWcuc3RhcnQgfHwgMFxuICAgICAgICAgICAgY29uc3Qgc3RhcnRBbmltRHVyYXRpb24gPSB0aGlzLmNvbmZpZy5zdGFydEFuaW1EdXJhdGlvbiB8fCAwXG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvKHN0YXJ0LCBzdGFydEFuaW1EdXJhdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDUwKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzdGFydCA9IHRoaXMuY29uZmlnLnN0YXJ0XG4gICAgICBjb25zdCBzdGFydEFuaW1EdXJhdGlvbiA9IHRoaXMuY29uZmlnLnN0YXJ0QW5pbUR1cmF0aW9uXG4gICAgICB0aGlzLnNjcm9sbFRvKHN0YXJ0LCBzdGFydEFuaW1EdXJhdGlvbilcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yc1wiPjwvZGl2PlxuICAgICAgPC9kaXY+YFxuXG4gICAgICByb290Tm9kZS5pbm5lckhUTUwgPSB3cmFwcGVySHRtbFxuICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgcHJlZml4KVxuICAgIH1cblxuICAgIHdyYXBJdGVtcygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcblxuICAgICAgQXJyYXkuZnJvbShnZXRDaGlsZHJlbih3cmFwcGVyTm9kZSkpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBpdGVtV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgaXRlbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbVdyYXBwZXIsIGl0ZW1Ob2RlKVxuICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjcmVhdGVBbmNob3JzKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGxldCBhbmNob3JzSHRtbCA9ICcnLCBjb3VudGVyID0gMFxuXG4gICAgICBBcnJheS5mcm9tKGdldENoaWxkcmVuKHdyYXBwZXJOb2RlKSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JdJywgaXRlbU5vZGUpXG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSB0YXJnZXROb2RlIFxuICAgICAgICAgID8gdGFyZ2V0Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yJylcbiAgICAgICAgICA6ICcnXG5cbiAgICAgICAgYW5jaG9yc0h0bWwgKz0gYDxzcGFuIGRhdGEtYW5jaG9yaWQ9XCIke2NvdW50ZXJ9XCIgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yXCI+PHNwYW4+JHthbmNob3JUZXh0fTwvc3Bhbj48L3NwYW4+YFxuICAgICAgICBpdGVtTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yb3JpZ2luaWQnLCBjb3VudGVyKVxuICAgICAgICBjb3VudGVyKytcbiAgICAgIH0pXG5cbiAgICAgIGFuY1dyYXBwZXJOb2RlLmlubmVySFRNTCA9IGFuY2hvcnNIdG1sXG4gICAgfVxuXG4gICAgc2V0U2l6ZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS13cmFwcGVyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgbWF4SGVpZ2h0ID0gMCwgc3VtV2lkdGggPSAwXG5cbiAgICAgIHJvb3ROb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHN0cmlwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICB3cmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGxiYXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHNjcm9sbHdyYXBOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50SGVpZ2h0ID0gaXRlbU5vZGUub2Zmc2V0SGVpZ2h0XG4gICAgICAgIGlmIChjdXJyZW50SGVpZ2h0ID4gbWF4SGVpZ2h0KSBtYXhIZWlnaHQgPSBjdXJyZW50SGVpZ2h0XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcFdpZHRoID0gc2Nyb2xsd3JhcE5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSBzY3JvbGx3cmFwV2lkdGggLyBzdW1XaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSBNYXRoLm1pbih0aGlzLmdldCgnc2Nyb2xsZWQnKSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjYlNjcm9sbGVkID0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS53aWR0aCA9IChzdW1XaWR0aCArIDEpICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc2Nyb2xsYmFyTm9kZS5zdHlsZS53aWR0aCA9ICh3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpICsgJ3B4J1xuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHNjcm9sbGVkKVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2NiU2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldCgnbGltaXRSaWdodCcsIGxpbWl0UmlnaHQpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRmFjdG9yJywgc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhcldpZHRoJywgd3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgIH1cblxuICAgIGNoZWNrU2Nyb2xsYWJsZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS13cmFwcGVyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgbGV0IHN1bVdpZHRoID0gMCwgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgaWYgKHdyYXBwZXJXaWR0aCA+PSBzdW1XaWR0aCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYWJsZScsIGZhbHNlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCAnaXMtbm90LXNjcm9sbGFibGUnKVxuICAgICAgICBhbmNXcmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYHdpZHRoOiAke3N1bVdpZHRofXB4YClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYWJsZScsIHRydWUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6YXV0b2ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgX3VwZGF0ZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcicpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycykgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG5cbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG5cbiAgICAgIGlmICghdGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIHNjcm9sbGVkLCAwKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRWxlbWVudChlKSB7XG4gICAgICByZXR1cm4gZS50YXJnZXQuY2xvc2VzdChgLiR7dGhpcy5jb25maWcucHJlZml4fWApID09IHRoaXMuc3RhdGUuZWxcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hTdGFydChlKVxuICAgICAgaWYgKCFlLnRvdWNoZXMgJiYgIWUuY2hhbmdlZFRvdWNoZXMpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG5cbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGdldEV2ZW50WChlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkRGlmZicsIGRpZmYpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3MoZ2V0RWxlbWVudCgnaHRtbCcpLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgXG4gICAgICB0aGlzLmhhbmRsZVRvdWNoTW92ZShlKVxuICAgICAgaWYgKHRoaXMuZ2V0KCdzd2lwZURpcmVjdGlvbicpID09ICd2JykgcmV0dXJuXG4gICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgbGV0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuICAgICAgbGV0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggKz0gTWF0aC5yb3VuZCgwLjIgKiBzY3JvbGxiYXJSZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhclJlc3VsdCA9IDBcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJlc3VsdCA+IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCAtPSBNYXRoLnJvdW5kKDAuOCAqIChyZXN1bHQgLSBsaW1pdFJpZ2h0KSAqIHNjcm9sbGJhckZhY3RvcilcbiAgICAgICAgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW92ZUV2ZW50VFMnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuICAgICAgdGhpcy5wdXNoKCdwYWdlWCcsIGN1cnJlbnRQYWdlWClcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PSAndicpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgICAgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgbnVsbClcbiAgICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG5cbiAgICAgIGNvbnN0IHRpbWVEZWx0YSA9ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gdGhpcy5nZXQoJ21vdmVFdmVudFRTJykpIC8gMS41XG4gICAgICBjb25zdCBlbmRwb2ludCA9IHNjcm9sbGVkIC0gKGRpc3RhbmNlRGVsdGEgKiA4KVxuXG4gICAgICAvLyBjbGlja2VkXG4gICAgICBpZiAobGFzdFBhZ2VYID09PSAwKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5vbkNsaWNrKSByZXR1cm4gdGhpcy5jb25maWcub25DbGljayhlKVxuXG4gICAgICAgIGNvbnN0IGxpbmtOb2RlID0gZS50YXJnZXQuY2xvc2VzdCgnYScpXG4gICAgICAgIGlmICghbGlua05vZGUpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgndGFyZ2V0JylcbiAgICAgICAgY29uc3QgaHJlZiA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICAgIGNvbnN0IGN0cmxDbGljayA9IGUuY3RybEtleSB8fCBlLm1ldGFLZXlcblxuICAgICAgICBpZiAoY3RybENsaWNrKSByZXR1cm4gd2luZG93Lm9wZW4oaHJlZilcbiAgICAgICAgaWYgKCF0YXJnZXQgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZlxuICAgICAgICBpZiAodGFyZ2V0LmluZGV4T2YoJ2JsYW5rJykgPiAtMSAmJiBocmVmKSByZXR1cm4gd2luZG93Lm9wZW4oaHJlZilcbiAgICAgIH1cblxuICAgICAgLy8gZHJhZ2dlZFxuICAgICAgLy8gc3RpY2t5IGxlZnRcbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwLCB0cnVlKVxuICAgICAgLy8gdG9vIG11Y2ggdG8gbGVmdFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMClcbiAgICAgIC8vIHN0aWNreSByaWdodFxuICAgICAgZWxzZSBpZiAoc2Nyb2xsZWQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwLCB0cnVlKVxuICAgICAgLy8gdG9vIG11Y2ggdG8gcmlnaHRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50ID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMClcbiAgICAgIC8vIG90aGVyd2lzZVxuICAgICAgZWxzZSBpZiAodGltZURlbHRhIDwgMTUwICYmIE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpID4gMikge1xuICAgICAgICBjb25zdCB0aW1lVG9FbmRwb2ludCA9IE1hdGgucm91bmQoTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgLyB0aW1lRGVsdGEpXG4gICAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgTWF0aC5yb3VuZChlbmRwb2ludCksIHRpbWVUb0VuZHBvaW50KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNsZWFyKCdwYWdlWCcpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uQ2xpY2tMaW5rKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBlXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFlLmRlbHRhWCB8fCBNYXRoLmFicyhlLmRlbHRhWSkgPiBNYXRoLmFicyhlLmRlbHRhWCkgfHwgICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHtkZWx0YVh9ID0gZVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmVzdWx0ID0gTWF0aC5taW4oTWF0aC5tYXgodGhpcy5nZXQoJ3Njcm9sbGVkJykgKyBkZWx0YVgsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuXG4gICAgICBpZiAocmVzdWx0ID09IGxpbWl0UmlnaHQpIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIFxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIHRydWUpXG5cbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3Qgc2Nyb2xsQ2xpY2tEaXNhYmxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJylcblxuICAgICAgaWYgKHNjcm9sbENsaWNrRGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCBmYWxzZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhZS5wcmV2ZW50RGVmYXVsdCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qgc2NiV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gbGltaXRSaWdodCAqIHNjYkZhY3RvclxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBwYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3QgY2VudGVyID0gcGFnZVggLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IGxlZnRFZGdlID0gY2VudGVyIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCByaWdodEVkZ2UgPSBjZW50ZXIgKyBzY2JXaWR0aCAvIDJcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gY2VudGVyIC8gc2NiRmFjdG9yXG4gICAgICBpZiAobGVmdEVkZ2UgPCBsaW1pdExlZnQpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChyaWdodEVkZ2UgPiByaWdodFNjYkxpbWl0KSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcblxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFxuICAgIG9uQW5jaG9yQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS50YXJnZXQgfHwgIXNjcm9sbGFibGUpIHJldHVybiBcbiAgICAgIFxuICAgICAgY29uc3QgYW5jaG9yaWQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hbmNob3JpZF0nKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yaWQnKVxuICAgICAgaWYgKCFhbmNob3JpZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yb3JpZ2luaWQ9XCInICsgYW5jaG9yaWQgKyAnXCJdJywgcm9vdE5vZGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnLCBjdXJyZW50UGFnZVggLSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvcilcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckRvd25QYWdlWCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGRlbHRhID0gKGN1cnJlbnRQYWdlWCAtIHNjcm9sbGJhckRvd25QYWdlWClcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KGRlbHRhIC8gc2Nyb2xsYmFyRmFjdG9yLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBoYW5kbGVUb3VjaFN0YXJ0KGUpIHtcbiAgICAgIGlmICghZS50b3VjaGVzICYmICFlLmNoYW5nZWRUb3VjaGVzKSByZXR1cm5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFgpXG4gICAgICB0aGlzLnNldCgndG91Y2hZJywgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5jbGllbnRZKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHRvdWNoWCA9IHRoaXMuZ2V0KCd0b3VjaFgnKVxuICAgICAgY29uc3QgdG91Y2hZID0gdGhpcy5nZXQoJ3RvdWNoWScpXG4gICAgICBpZiAoIXRvdWNoWCB8fCAhdG91Y2hZIHx8ICghZS50b3VjaGVzICYmICFlLmNoYW5nZWRUb3VjaGVzKSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHhVcCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WFxuICAgICAgY29uc3QgeVVwID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5jbGllbnRZXG5cbiAgICAgIGNvbnN0IHhEaWZmID0gdG91Y2hYIC0geFVwXG4gICAgICBjb25zdCB5RGlmZiA9IHRvdWNoWSAtIHlVcFxuXG4gICAgICBpZiAoTWF0aC5hYnMoeERpZmYpID4gTWF0aC5hYnMoeURpZmYpKSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAnaCcpXG4gICAgICBlbHNlIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsICd2JylcblxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWCcsIDApXG4gICAgICB0aGlzLnNldCgndG91Y2hZJywgMClcbiAgICAgIHJldHVyblxuICAgIH1cblxuXG4gICAgYW5pbWF0ZShzdGFydCwgc3RvcD0wLCBzcGVlZD0xMCwgYW5pbWF0ZVdpZHRoPWZhbHNlKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IHN0b3AgLSBzdGFydFxuICAgICAgY29uc3QgdGltZSA9IE1hdGgubWF4KC4wNSwgTWF0aC5taW4oTWF0aC5hYnMoZGVsdGEpIC8gc3BlZWQsIDEpKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKSAqIHNjYkZhY3RvclxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgbGV0IGN1cnJlbnRUaW1lID0gc3BlZWQgPT0gMCA/IDEgOiAwLFxuICAgICAgICAgIGVuZHBvaW50ID0gdGhpcy5nZXQoJ3Njcm9sbGVkJyksXG4gICAgICAgICAgc2NiRW5kcG9pbnQgPSBlbmRwb2ludCAqIHNjYkZhY3RvclxuXG4gICAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5nZXQoJ3BvaW50ZXJEb3duJykgfHwgdGhpcy5nZXQoJ21vdXNlU2Nyb2xsJykpIHJldHVyblxuXG4gICAgICAgIGN1cnJlbnRUaW1lICs9ICgxIC8gNjApXG4gICAgICAgIGVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSlcbiAgICAgICAgICA6IHN0b3BcblxuICAgICAgICBzY2JFbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKiBzY2JGYWN0b3IgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpICogc2NiRmFjdG9yXG4gICAgICAgICAgOiBzdG9wICogc2NiRmFjdG9yXG4gICAgICAgIFxuICAgICAgICBzY2JFbmRwb2ludCA9IE1hdGgubWluKHNjYkVuZHBvaW50LCByaWdodFNjYkxpbWl0KVxuXG4gICAgICAgIGlmICghYW5pbWF0ZVdpZHRoKSB7XG4gICAgICAgICAgaWYgKHNjYkVuZHBvaW50ID49IHJpZ2h0U2NiTGltaXQpIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgICAgICBlbHNlIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICAgICAgdGhpcy5zZXRTY2JQb3Moc2NiRW5kcG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IHNjYncgPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgICAgIGlmIChzdGFydCA8IHN0b3ApIHNjYncgLT0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuICAgICAgICAgIGVsc2Ugc2NidyArPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG5cbiAgICAgICAgICB0aGlzLnNldFdpZHRoKHNjYncpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvcygtMSAqIGVuZHBvaW50KVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCBlbmRwb2ludClcblxuICAgICAgICBpZiAoY3VycmVudFRpbWUgPCAxKSByYWYodGljaylcbiAgICAgICAgZWxzZSB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aWNrKClcbiAgICB9XG5cbiAgICBjaGVja0JvcmRlclZpc2liaWxpdHkoKSB7XG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGlmIChzY3JvbGxlZCA+IGxpbWl0TGVmdCkge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdFJpZ2h0KSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICB9XG5cblxuICAgIC8vIHB1YmxpYyBBUElcblxuICAgIHNjcm9sbFRvKHBvaW50LCB0aW1lPTEwMDApIHtcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGxldCBlbmRwb2ludCA9ICFpc05hTihwb2ludCkgPyBwYXJzZUludChwb2ludCkgOiAwXG4gICAgICBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KGVuZHBvaW50LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBpZiAocG9pbnQgPT0gJ2VuZCcpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ3N0YXJ0JykgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdjZW50ZXInKSBlbmRwb2ludCA9IGxpbWl0UmlnaHQgLyAyXG5cbiAgICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmdldCgnc2Nyb2xsZWQnKSwgZW5kcG9pbnQsIHRpbWUpXG4gICAgfVxuXG4gICAgdXBkYXRlKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj10aGlzLmNvbmZpZy5hbGlnbixcbiAgICAgICAgbm9BbmNob3JzPXRoaXMuY29uZmlnLm5vQW5jaG9ycyxcbiAgICAgICAgbm9TY3JvbGxiYXI9dGhpcy5jb25maWcubm9TY3JvbGxiYXIsXG4gICAgICAgIG9uQ2xpY2s9dGhpcy5jb25maWcub25DbGljayxcbiAgICAgICAgc3RhcnQ9dGhpcy5jb25maWcuc3RhcnQsXG4gICAgICAgIHN0YXJ0QW5pbUR1cmF0aW9uPXRoaXMuY29uZmlnLnN0YXJ0QW5pbUR1cmF0aW9uLFxuICAgICAgfSA9IGNvbmZpZ1xuXG4gICAgICB0aGlzLmNvbmZpZy5hbGlnbiA9IGFsaWduXG4gICAgICB0aGlzLmNvbmZpZy5ub0FuY2hvcnMgPSBub0FuY2hvcnNcbiAgICAgIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyID0gbm9TY3JvbGxiYXJcbiAgICAgIHRoaXMuY29uZmlnLm9uQ2xpY2sgPSBvbkNsaWNrXG4gICAgICB0aGlzLmNvbmZpZy5zdGFydEFuaW1EdXJhdGlvbiA9IHN0YXJ0QW5pbUR1cmF0aW9uXG4gICAgICB0aGlzLmNvbmZpZy5zdGFydCA9IHN0YXJ0XG5cbiAgICAgIHRoaXMuX3VwZGF0ZSgpXG4gICAgfVxuICB9XG5cblxuXG4gIC8vIGluaXQgY29uZmlnXG5cbiAgY29uc3QgYXV0b2luaXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZWxzID0gZ2V0RWxlbWVudHMoJy5zY3JvbGxlcicpXG4gICAgQXJyYXkuZnJvbShlbHMpLmZvckVhY2goZWwgPT4ge1xuICAgICAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuICAgIH0pXG4gIH1cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gYXV0b2luaXQpXG5cbiAgZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiaW50ZXJhY3RpdmVcIikgYXV0b2luaXQoKVxuICB9XG5cbiAgd2luZG93LlNjcm9sbGVyID0gU2Nyb2xsZXJcblxufSgpKVxuIiwibW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIEFycmF5LmZyb20gPT09ICdmdW5jdGlvbicgP1xuICBBcnJheS5mcm9tIDpcbiAgcmVxdWlyZSgnLi9wb2x5ZmlsbCcpXG4pO1xuIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gUmVmZXJlbmNlOiBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtYXJyYXkuZnJvbVxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nO1xuICB9O1xuICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgfTtcbiAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgfTtcbiAgdmFyIGl0ZXJhdG9yUHJvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgIT0gbnVsbCkge1xuICAgICAgaWYoWydzdHJpbmcnLCdudW1iZXInLCdib29sZWFuJywnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdmFsdWUpID4gLTEpe1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAoJ2l0ZXJhdG9yJyBpbiBTeW1ib2wpICYmXG4gICAgICAgIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIFN5bWJvbC5pdGVyYXRvcjtcbiAgICAgIH1cbiAgICAgIC8vIFN1cHBvcnQgXCJAQGl0ZXJhdG9yXCIgcGxhY2Vob2xkZXIsIEdlY2tvIDI3IHRvIEdlY2tvIDM1XG4gICAgICBlbHNlIGlmICgnQEBpdGVyYXRvcicgaW4gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICdAQGl0ZXJhdG9yJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihPLCBQKSB7XG4gICAgLy8gQXNzZXJ0OiBJc1Byb3BlcnR5S2V5KFApIGlzIHRydWUuXG4gICAgaWYgKE8gIT0gbnVsbCAmJiBQICE9IG51bGwpIHtcbiAgICAgIC8vIExldCBmdW5jIGJlIEdldFYoTywgUCkuXG4gICAgICB2YXIgZnVuYyA9IE9bUF07XG4gICAgICAvLyBSZXR1cm5JZkFicnVwdChmdW5jKS5cbiAgICAgIC8vIElmIGZ1bmMgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBudWxsLCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgaWYoZnVuYyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICAvLyBJZiBJc0NhbGxhYmxlKGZ1bmMpIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICBpZiAoIWlzQ2FsbGFibGUoZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihmdW5jICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICB9O1xuICB2YXIgaXRlcmF0b3JTdGVwID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICAvLyBMZXQgcmVzdWx0IGJlIEl0ZXJhdG9yTmV4dChpdGVyYXRvcikuXG4gICAgLy8gUmV0dXJuSWZBYnJ1cHQocmVzdWx0KS5cbiAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIC8vIExldCBkb25lIGJlIEl0ZXJhdG9yQ29tcGxldGUocmVzdWx0KS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChkb25lKS5cbiAgICB2YXIgZG9uZSA9IEJvb2xlYW4ocmVzdWx0LmRvbmUpO1xuICAgIC8vIElmIGRvbmUgaXMgdHJ1ZSwgcmV0dXJuIGZhbHNlLlxuICAgIGlmKGRvbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHJlc3VsdC5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gIHJldHVybiBmdW5jdGlvbiBmcm9tKGl0ZW1zIC8qLCBtYXBGbiwgdGhpc0FyZyAqLyApIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAvLyAyLiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgdmFyIFQ7XG4gICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIDMuIGVsc2VcbiAgICAgIC8vICAgYS4gSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vICAgYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFRcbiAgICAgIC8vICAgICAgYmUgdW5kZWZpbmVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG4gICAgICAvLyAgIGMuIExldCBtYXBwaW5nIGJlIHRydWUgKGltcGxpZWQgYnkgbWFwRm4pXG4gICAgfVxuXG4gICAgdmFyIEEsIGs7XG5cbiAgICAvLyA0LiBMZXQgdXNpbmdJdGVyYXRvciBiZSBHZXRNZXRob2QoaXRlbXMsIEBAaXRlcmF0b3IpLlxuICAgIC8vIDUuIFJldHVybklmQWJydXB0KHVzaW5nSXRlcmF0b3IpLlxuICAgIHZhciB1c2luZ0l0ZXJhdG9yID0gZ2V0TWV0aG9kKGl0ZW1zLCBpdGVyYXRvclByb3AoaXRlbXMpKTtcblxuICAgIC8vIDYuIElmIHVzaW5nSXRlcmF0b3IgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh1c2luZ0l0ZXJhdG9yICE9PSB2b2lkIDApIHtcbiAgICAgIC8vIGEuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV1cbiAgICAgIC8vICAgICAgaW50ZXJuYWwgbWV0aG9kIG9mIEMgd2l0aCBhbiBlbXB0eSBhcmd1bWVudCBsaXN0LlxuICAgICAgLy8gYi4gRWxzZSxcbiAgICAgIC8vICAgaS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEFycmF5Q3JlYXRlXG4gICAgICAvLyAgICAgIHdpdGggYXJndW1lbnQgMC5cbiAgICAgIC8vIGMuIFJldHVybklmQWJydXB0KEEpLlxuICAgICAgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMoKSkgOiBbXTtcblxuICAgICAgLy8gZC4gTGV0IGl0ZXJhdG9yIGJlIEdldEl0ZXJhdG9yKGl0ZW1zLCB1c2luZ0l0ZXJhdG9yKS5cbiAgICAgIHZhciBpdGVyYXRvciA9IHVzaW5nSXRlcmF0b3IuY2FsbChpdGVtcyk7XG5cbiAgICAgIC8vIGUuIFJldHVybklmQWJydXB0KGl0ZXJhdG9yKS5cbiAgICAgIGlmIChpdGVyYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGYuIExldCBrIGJlIDAuXG4gICAgICBrID0gMDtcblxuICAgICAgLy8gZy4gUmVwZWF0XG4gICAgICB2YXIgbmV4dCwgbmV4dFZhbHVlO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gaS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgICAvLyBpaS4gTGV0IG5leHQgYmUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKS5cbiAgICAgICAgLy8gaWlpLiBSZXR1cm5JZkFicnVwdChuZXh0KS5cbiAgICAgICAgbmV4dCA9IGl0ZXJhdG9yU3RlcChpdGVyYXRvcik7XG5cbiAgICAgICAgLy8gaXYuIElmIG5leHQgaXMgZmFsc2UsIHRoZW5cbiAgICAgICAgaWYgKCFuZXh0KSB7XG5cbiAgICAgICAgICAvLyAxLiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBrLCB0cnVlKS5cbiAgICAgICAgICAvLyAyLiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgICAgIEEubGVuZ3RoID0gaztcblxuICAgICAgICAgIC8vIDMuIFJldHVybiBBLlxuICAgICAgICAgIHJldHVybiBBO1xuICAgICAgICB9XG4gICAgICAgIC8vIHYuIExldCBuZXh0VmFsdWUgYmUgSXRlcmF0b3JWYWx1ZShuZXh0KS5cbiAgICAgICAgLy8gdmkuIFJldHVybklmQWJydXB0KG5leHRWYWx1ZSlcbiAgICAgICAgbmV4dFZhbHVlID0gbmV4dC52YWx1ZTtcblxuICAgICAgICAvLyB2aWkuIElmIG1hcHBpbmcgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAvLyAgIDEuIExldCBtYXBwZWRWYWx1ZSBiZSBDYWxsKG1hcGZuLCBULCDCq25leHRWYWx1ZSwga8K7KS5cbiAgICAgICAgLy8gICAyLiBJZiBtYXBwZWRWYWx1ZSBpcyBhbiBhYnJ1cHQgY29tcGxldGlvbiwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyAgIDMuIExldCBtYXBwZWRWYWx1ZSBiZSBtYXBwZWRWYWx1ZS5bW3ZhbHVlXV0uXG4gICAgICAgIC8vIHZpaWkuIEVsc2UsIGxldCBtYXBwZWRWYWx1ZSBiZSBuZXh0VmFsdWUuXG4gICAgICAgIC8vIGl4LiAgTGV0IGRlZmluZVN0YXR1cyBiZSB0aGUgcmVzdWx0IG9mXG4gICAgICAgIC8vICAgICAgQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhBLCBQaywgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyB4LiBbVE9ET10gSWYgZGVmaW5lU3RhdHVzIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgZGVmaW5lU3RhdHVzKS5cbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwgbmV4dFZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHhpLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDcuIEFzc2VydDogaXRlbXMgaXMgbm90IGFuIEl0ZXJhYmxlIHNvIGFzc3VtZSBpdCBpc1xuICAgICAgLy8gICAgYW4gYXJyYXktbGlrZSBvYmplY3QuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gOC4gTGV0IGFycmF5TGlrZSBiZSBUb09iamVjdChpdGVtcykuXG4gICAgICB2YXIgYXJyYXlMaWtlID0gT2JqZWN0KGl0ZW1zKTtcblxuICAgICAgLy8gOS4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGl0ZW1zID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW4gYmUgVG9MZW5ndGgoR2V0KGFycmF5TGlrZSwgXCJsZW5ndGhcIikpLlxuICAgICAgLy8gMTEuIFJldHVybklmQWJydXB0KGxlbikuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoYXJyYXlMaWtlLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEyLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vICAgICBhLiBMZXQgQSBiZSBDb25zdHJ1Y3QoQywgwqtsZW7CuykuXG4gICAgICAvLyAxMy4gRWxzZVxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICAvLyAxNC4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNS4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuICAgICAgLy8gMTYuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBhcnJheUxpa2Vba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrKys7XG4gICAgICB9XG4gICAgICAvLyAxNy4gTGV0IHNldFN0YXR1cyBiZSBTZXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIC8vIDE4LiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAxOS4gUmV0dXJuIEEuXG4gICAgfVxuICAgIHJldHVybiBBO1xuICB9O1xufSkoKTtcbiJdfQ==
