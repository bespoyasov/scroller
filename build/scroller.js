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
      var _config$scrollbar = config.scrollbar;
      var scrollbar = _config$scrollbar === undefined ? 'visible' : _config$scrollbar;
      var _config$anchors = config.anchors;
      var anchors = _config$anchors === undefined ? 'visible' : _config$anchors;
      var _config$start = config.start;
      var start = _config$start === undefined ? 0 : _config$start;
      var _config$startAnimatio = config.startAnimation;
      var startAnimation = _config$startAnimatio === undefined ? false : _config$startAnimatio;
      var el = config.el;
      var onClick = config.onClick;


      this.config = {
        align: align,
        // noAnchors, noScrollbar — legacy
        noAnchors: anchors == 'hidden' || noAnchors,
        noScrollbar: scrollbar == 'hidden' || noScrollbar,
        onClick: onClick,
        start: start,
        startAnimation: startAnimation,

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
        var wrapperNode = getElement('.' + prefix + '-wrapper', rootNode);
        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var linkNodes = getElements('a', stripNode);

        var scrollNode = getElement('.' + prefix + '-scrollwrap', rootNode);
        var scrollbarNode = getElement('.' + prefix + '-scrollbar', rootNode);

        var anchorsNodes = getElements('.' + prefix + '-anchor', rootNode);

        // config
        if (this.config.align !== 'center' || rootNode.getAttribute('data-leftalign') || rootNode.getAttribute('data-leftAlign') || rootNode.getAttribute('data-leftIfWide') || rootNode.getAttribute('data-leftifwide')) {
          this.addClass(rootNode, this.config.leftAlignClsnm);
        }

        if (this.config.noAnchors || rootNode.getAttribute('data-anchors') == 'hidden' || rootNode.getAttribute('data-noanchors') || rootNode.getAttribute('data-noAnchors')) {
          this.addClass(rootNode, this.config.noAnchorsClsnm);
        }

        if (this.config.noScrollbar || rootNode.getAttribute('data-scrollbar') == 'hidden' || rootNode.getAttribute('data-noscrollbar') || rootNode.getAttribute('data-noScrollbar')) {
          this.addClass(rootNode, this.config.noScrollbarClsnm);
        }

        if (rootNode.getAttribute('data-start')) {
          this.config.start = rootNode.getAttribute('data-start');
        }

        if (rootNode.getAttribute('data-startAnimation') || rootNode.getAttribute('data-startanimation')) {
          this.config.startAnimation = true;
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

        var startAnimationHelper = function startAnimationHelper() {
          var centralNode = _this.findCentralNode();
          var animation = _this.config.startAnimation ? 1000 : 0;
          var endpoint = void 0;

          if (centralNode) {
            endpoint = centralNode.offsetLeft - wrapperNode.offsetWidth / 2 + centralNode.offsetWidth / 2;
            endpoint = Math.min(centralNode.offsetLeft, endpoint);
          } else endpoint = _this.config.start;

          _this.scrollTo(endpoint, animation);
        };

        // check if scroller is in hidden block
        var isHidden = function isHidden(el) {
          return el.offsetParent === null;
        };

        if (isHidden(rootNode)) {
          (function () {
            var intervalId = setInterval(function () {
              if (!isHidden(rootNode)) {
                var scrolled = _this.get('scrolled');
                clearInterval(intervalId);
                // triggering resize is not reliable
                // just recalc twice
                _this._update();
                _this._update();

                startAnimationHelper();
              }
            }, 50);
          })();
        }

        startAnimationHelper();
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
      key: 'findCentralNode',
      value: function findCentralNode() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var centralNodes = getElements('[data-central]', rootNode);
        return centralNodes && centralNodes.length ? centralNodes[centralNodes.length - 1].closest('.' + prefix + '-item') : null;
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
        var scrollbar = config.scrollbar;
        var anchors = config.anchors;
        var _config$onClick = config.onClick;
        var onClick = _config$onClick === undefined ? this.config.onClick : _config$onClick;
        var _config$start2 = config.start;
        var start = _config$start2 === undefined ? this.config.start : _config$start2;
        var _config$startAnimatio2 = config.startAnimation;
        var startAnimation = _config$startAnimatio2 === undefined ? this.config.startAnimation : _config$startAnimatio2;


        this.config.align = align;
        this.config.noAnchors = !noAnchors ? anchors == 'hidden' : anchors != 'visible';

        this.config.noScrollbar = !noScrollbar ? scrollbar == 'hidden' : scrollbar != 'visible';

        this.config.onClick = onClick;
        this.config.start = start;
        this.config.startAnimation = startAnimation;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7OztBQUlWLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSLENBQWI7Ozs7QUFLakIsR0FBQyxVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FiRCxFQWFHLENBQUMsUUFBUSxTQUFULEVBQW9CLGNBQWMsU0FBbEMsRUFBNkMsYUFBYSxTQUExRCxDQWJIOzs7O0FBa0JBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtVQUFtRCxLQUFLLElBQXhEO0FBQ0EsYUFBTyxNQUFNLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUIsRUFBbUMsVUFBUyxDQUFULEVBQVc7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuICBcbiAgLy8gQXJyYXkuZnJvbSBwb2x5ZmlsbFxuICBcbiAgaWYgKCFBcnJheS5mcm9tKSBBcnJheS5mcm9tID0gcmVxdWlyZSgnYXJyYXktZnJvbScpO1xuICBcblxuICAvLyByZW1vdmUgcG9seWZpbGxcblxuICAoZnVuY3Rpb24gKGFycikge1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHJldHVyblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSkoW0VsZW1lbnQucHJvdG90eXBlLCBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSwgRG9jdW1lbnRUeXBlLnByb3RvdHlwZV0pXG5cblxuICAvLyBtYXRjaGVzIHBvbHlmaWxsXG5cbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIG1hdGNoZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgdGggPSB0aGlzXG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChtYXRjaGVzLCBmdW5jdGlvbihlKXtcbiAgICAgICAgcmV0dXJuIGUgPT09IHRoXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2xvc2VzdCBwb2x5ZmlsbFxuXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihjc3MpIHtcbiAgICAgIHZhciBub2RlID0gdGhpc1xuXG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5tYXRjaGVzKGNzcykpIHJldHVybiBub2RlXG4gICAgICAgIGVsc2Ugbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG5cbiAgLy8gaGVscGVyc1xuXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3I9JycsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZXMgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMgfHwgbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RXZlbnRYID0gZSA9PiB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWFxuICAgICAgfHwgZS50b3VjaGVzXG4gICAgICAgICYmIGUudG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS50b3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnBhZ2VYIFxuICAgICAgfHwgMFxuICB9XG5cbiAgY29uc3QgZ2V0Q2hpbGRyZW4gPSAoZWwpID0+IHtcbiAgICBsZXQgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXMsXG4gICAgICAgIGNoaWxkcmVuID0gW10sXG4gICAgICAgIGkgPSBjaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT0gMSkgY2hpbGRyZW4udW5zaGlmdChjaGlsZE5vZGVzW2ldKVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZHJlblxuICB9XG5cbiAgY29uc3QgaXNBbmRyb2lkID0gKCkgPT4ge1xuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImFuZHJvaWRcIikgPiAtMVxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG5cbiAgY2xhc3MgU2Nyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj0nY2VudGVyJyxcbiAgICAgICAgbm9BbmNob3JzPWZhbHNlLFxuICAgICAgICBub1Njcm9sbGJhcj1mYWxzZSxcbiAgICAgICAgc2Nyb2xsYmFyPSd2aXNpYmxlJyxcbiAgICAgICAgYW5jaG9ycz0ndmlzaWJsZScsXG4gICAgICAgIHN0YXJ0PTAsXG4gICAgICAgIHN0YXJ0QW5pbWF0aW9uPWZhbHNlLFxuICAgICAgICBlbCxcbiAgICAgICAgb25DbGlja1xuICAgICAgfSA9IGNvbmZpZ1xuXG4gICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgYWxpZ246IGFsaWduLFxuICAgICAgICAvLyBub0FuY2hvcnMsIG5vU2Nyb2xsYmFyIOKAlCBsZWdhY3lcbiAgICAgICAgbm9BbmNob3JzOiBhbmNob3JzID09ICdoaWRkZW4nIHx8IG5vQW5jaG9ycyxcbiAgICAgICAgbm9TY3JvbGxiYXI6IHNjcm9sbGJhciA9PSAnaGlkZGVuJyB8fCBub1Njcm9sbGJhcixcbiAgICAgICAgb25DbGljazogb25DbGljayxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBzdGFydEFuaW1hdGlvbjogc3RhcnRBbmltYXRpb24sXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuICAgICAgICBsZWZ0QWxpZ25DbHNubTogJ2lzLWxlZnQtYWxpZ24nLFxuICAgICAgICBib3JkZXJWc2JsQ2xzbm06ICdpcy12aXNpYmxlJyxcbiAgICAgICAgbm9BbmNob3JzQ2xzbm06ICdpcy1uby1hbmNob3JzJyxcbiAgICAgICAgbm9TY3JvbGxiYXJDbHNubTogJ2lzLW5vLXNjcm9sbGJhcicsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHNjcm9sbGFibGU6IHRydWUsXG5cbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBzY3JvbGxiYXJQb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICAgICAgc2Nyb2xsYmFyRmFjdG9yOiAwLFxuXG4gICAgICAgIHBhZ2VYOiBbXSxcbiAgICAgICAgc2Nyb2xsZWREaWZmOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgc2Nyb2xsYmFyRG93blBhZ2VYOiAwLFxuICAgICAgICBzY3JvbGxDbGlja0Rpc2FibGVkOiBmYWxzZSxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG4gICAgICAgIHN0cmlwV2lkdGg6IDAsXG5cbiAgICAgICAgc3dpcGVEaXJlY3Rpb246IG51bGwsXG4gICAgICAgIHRvdWNoWDogMCxcbiAgICAgICAgdG91Y2hZOiAwLFxuXG4gICAgICAgIGxldDogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldENoaWxkcmVuKGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG5cbiAgICAgICAgaXNBbmRyb2lkOiBpc0FuZHJvaWQoKVxuICAgICAgfVxuXG4gICAgICB3aW5kb3cucmFmID0gKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcblxuICAgICAgdGhpcy5pbml0KGVsKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXSB8fCAwXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIGFsaWduU2NiVG9SaWdodCgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuICAgIHJlbGVhc2VTY2IoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRTY2JQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKGVsLCBwb3MpIHtcbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG4gICAgc2V0V2lkdGgod2lkdGgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGxpbmtOb2RlcyA9IGdldEVsZW1lbnRzKCdhJywgc3RyaXBOb2RlKVxuXG4gICAgICBjb25zdCBzY3JvbGxOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcblxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIC8vIGNvbmZpZ1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcicgfHxcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRhbGlnbicpIHx8IFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdEFsaWduJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0SWZXaWRlJykgfHxcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRpZndpZGUnKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuY29uZmlnLm5vQW5jaG9ycyB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcnMnKSA9PSAnaGlkZGVuJyB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9hbmNob3JzJykgfHxcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vQW5jaG9ycycpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5jb25maWcubm9TY3JvbGxiYXIgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInKSA9PSAnaGlkZGVuJyB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9TY3JvbGxiYXInKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChyb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKSkge1xuICAgICAgICB0aGlzLmNvbmZpZy5zdGFydCA9IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydCcpXG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0QW5pbWF0aW9uJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydGFuaW1hdGlvbicpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltYXRpb24gPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgXG4gICAgICBzY3JvbGxiYXJOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuXG4gICAgICBzY3JvbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNjcm9sbENsaWNrLmJpbmQodGhpcykpXG5cbiAgICAgIGNvbnN0IHdoZWVsRXZlbnQgPSAoL0ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSA/ICd3aGVlbCcgOiAnbW91c2V3aGVlbCdcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKHdoZWVsRXZlbnQsIHRoaXMub25TY3JvbGwuYmluZCh0aGlzKSlcblxuICAgICAgQXJyYXkuZnJvbShhbmNob3JzTm9kZXMpLmZvckVhY2goYW5jaG9yTm9kZSA9PiB7XG4gICAgICAgIGFuY2hvck5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQW5jaG9yQ2xpY2suYmluZCh0aGlzKSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHByZXZlbnQgY2xpY2tuZyBvbiBsaW5rc1xuICAgICAgQXJyYXkuZnJvbShsaW5rTm9kZXMpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2tMaW5rLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgfSlcblxuICAgICAgLy8gcmVyZW5kZXJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgfSlcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgfSlcblxuXG4gICAgICBjb25zdCBzdGFydEFuaW1hdGlvbkhlbHBlciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSB0aGlzLmZpbmRDZW50cmFsTm9kZSgpXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID8gMTAwMCA6IDBcbiAgICAgICAgbGV0IGVuZHBvaW50XG4gICAgICAgIFxuICAgICAgICBpZiAoY2VudHJhbE5vZGUpIHtcbiAgICAgICAgICBlbmRwb2ludCA9IGNlbnRyYWxOb2RlLm9mZnNldExlZnQgLSAod3JhcHBlck5vZGUub2Zmc2V0V2lkdGggLyAyKSArIChjZW50cmFsTm9kZS5vZmZzZXRXaWR0aCAvIDIpXG4gICAgICAgICAgZW5kcG9pbnQgPSBNYXRoLm1pbihjZW50cmFsTm9kZS5vZmZzZXRMZWZ0LCBlbmRwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGVuZHBvaW50ID0gdGhpcy5jb25maWcuc3RhcnRcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2Nyb2xsVG8oZW5kcG9pbnQsIGFuaW1hdGlvbilcbiAgICAgIH1cblxuXG4gICAgICAvLyBjaGVjayBpZiBzY3JvbGxlciBpcyBpbiBoaWRkZW4gYmxvY2tcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gZWwgPT4gZWwub2Zmc2V0UGFyZW50ID09PSBudWxsXG5cbiAgICAgIGlmIChpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICAgIC8vIHRyaWdnZXJpbmcgcmVzaXplIGlzIG5vdCByZWxpYWJsZVxuICAgICAgICAgICAgLy8ganVzdCByZWNhbGMgdHdpY2VcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpXG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKVxuXG4gICAgICAgICAgICBzdGFydEFuaW1hdGlvbkhlbHBlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cblxuICAgICAgXG4gICAgICBzdGFydEFuaW1hdGlvbkhlbHBlcigpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgfVxuXG5cbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3QgcHJldkh0bWwgPSByb290Tm9kZS5pbm5lckhUTUxcbiAgICAgIGNvbnN0IHdyYXBwZXJIdG1sID0gYDxkaXYgY2xhc3M9XCIke3ByZWZpeH0td3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWJvcmRlciAke3ByZWZpeH0tYm9yZGVyLS1sZWZ0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLXJpZ2h0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc3RyaXBcIj4ke3ByZXZIdG1sfTwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc2Nyb2xsd3JhcFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc2Nyb2xsYmFyXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWFuY2hvcnNcIj48L2Rpdj5cbiAgICAgIDwvZGl2PmBcblxuICAgICAgcm9vdE5vZGUuaW5uZXJIVE1MID0gd3JhcHBlckh0bWxcbiAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHByZWZpeClcbiAgICB9XG5cbiAgICB3cmFwSXRlbXMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIEFycmF5LmZyb20oZ2V0Q2hpbGRyZW4od3JhcHBlck5vZGUpKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgaXRlbVdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBpdGVtV3JhcHBlci5pbm5lckhUTUwgPSBpdGVtTm9kZS5vdXRlckhUTUxcbiAgICAgICAgaXRlbVdyYXBwZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgIGl0ZW1Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW1XcmFwcGVyLCBpdGVtTm9kZSlcbiAgICAgICAgaXRlbU5vZGUucmVtb3ZlKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZmluZENlbnRyYWxOb2RlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGNlbnRyYWxOb2RlcyA9IGdldEVsZW1lbnRzKGBbZGF0YS1jZW50cmFsXWAsIHJvb3ROb2RlKVxuICAgICAgcmV0dXJuIGNlbnRyYWxOb2RlcyAmJiBjZW50cmFsTm9kZXMubGVuZ3RoIFxuICAgICAgICA/IGNlbnRyYWxOb2Rlc1tjZW50cmFsTm9kZXMubGVuZ3RoIC0gMV0uY2xvc2VzdChgLiR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgY3JlYXRlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgYW5jaG9yc0h0bWwgPSAnJywgY291bnRlciA9IDBcblxuICAgICAgQXJyYXkuZnJvbShnZXRDaGlsZHJlbih3cmFwcGVyTm9kZSkpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yXScsIGl0ZW1Ob2RlKVxuICAgICAgICBjb25zdCBhbmNob3JUZXh0ID0gdGFyZ2V0Tm9kZSBcbiAgICAgICAgICA/IHRhcmdldE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcicpXG4gICAgICAgICAgOiAnJ1xuXG4gICAgICAgIGFuY2hvcnNIdG1sICs9IGA8c3BhbiBkYXRhLWFuY2hvcmlkPVwiJHtjb3VudGVyfVwiIGNsYXNzPVwiJHtwcmVmaXh9LWFuY2hvclwiPjxzcGFuPiR7YW5jaG9yVGV4dH08L3NwYW4+PC9zcGFuPmBcbiAgICAgICAgaXRlbU5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcm9yaWdpbmlkJywgY291bnRlcilcbiAgICAgICAgY291bnRlcisrXG4gICAgICB9KVxuXG4gICAgICBhbmNXcmFwcGVyTm9kZS5pbm5lckhUTUwgPSBhbmNob3JzSHRtbFxuICAgIH1cblxuICAgIHNldFNpemUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGx3cmFwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsd3JhcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICByb290Tm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzdHJpcE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgd3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc2Nyb2xsYmFyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGx3cmFwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG5cbiAgICAgIEFycmF5LmZyb20oaXRlbU5vZGVzKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGl0ZW1Ob2RlLm9mZnNldEhlaWdodFxuICAgICAgICBpZiAoY3VycmVudEhlaWdodCA+IG1heEhlaWdodCkgbWF4SGVpZ2h0ID0gY3VycmVudEhlaWdodFxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgY29uc3Qgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBXaWR0aCA9IHNjcm9sbHdyYXBOb2RlLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gc3VtV2lkdGggKyAxIC0gcm9vdE5vZGUub2Zmc2V0V2lkdGhcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gc2Nyb2xsd3JhcFdpZHRoIC8gc3VtV2lkdGhcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gTWF0aC5taW4odGhpcy5nZXQoJ3Njcm9sbGVkJyksIGxpbWl0UmlnaHQpXG4gICAgICBjb25zdCBzY2JTY3JvbGxlZCA9IHNjcm9sbGVkICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHJvb3ROb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcbiAgICAgIHdyYXBwZXJOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHNjcm9sbGJhck5vZGUuc3R5bGUud2lkdGggPSAod3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKSArICdweCdcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiBzY3JvbGxlZClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjYlNjcm9sbGVkKVxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBsaW1pdFJpZ2h0KVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhckZhY3RvcicsIHNjcm9sbGJhckZhY3RvcilcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJXaWR0aCcsIHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcilcbiAgICB9XG5cbiAgICBjaGVja1Njcm9sbGFibGUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGxldCBzdW1XaWR0aCA9IDAsIHdyYXBwZXJXaWR0aCA9IHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoXG5cbiAgICAgIEFycmF5LmZyb20oaXRlbU5vZGVzKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgc3VtV2lkdGggKz0gaXRlbU5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIH0pXG5cbiAgICAgIGlmICh3cmFwcGVyV2lkdGggPj0gc3VtV2lkdGgpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGFibGUnLCBmYWxzZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDogJHtzdW1XaWR0aH1weGApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGFibGUnLCB0cnVlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCAnaXMtbm90LXNjcm9sbGFibGUnKVxuICAgICAgICBhbmNXcmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYHdpZHRoOmF1dG9gKVxuICAgICAgfVxuICAgIH1cblxuICAgIF91cGRhdGUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAodGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub0FuY2hvcnMpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuXG4gICAgICBpZiAoIXRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyKSB7XG4gICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBzY3JvbGxlZCwgMClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0VsZW1lbnQoZSkge1xuICAgICAgcmV0dXJuIGUudGFyZ2V0LmNsb3Nlc3QoYC4ke3RoaXMuY29uZmlnLnByZWZpeH1gKSA9PSB0aGlzLnN0YXRlLmVsXG4gICAgfVxuXG5cbiAgICBvblBvaW50ZXJEb3duKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuXG4gICAgICB0aGlzLmhhbmRsZVRvdWNoU3RhcnQoZSlcbiAgICAgIGlmICghZS50b3VjaGVzICYmICFlLmNoYW5nZWRUb3VjaGVzKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnZG93bkV2ZW50VFMnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuXG4gICAgICBjb25zdCBkaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkJykgKyBnZXRFdmVudFgoZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZERpZmYnLCBkaWZmKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGdldEVsZW1lbnQoJ2h0bWwnKSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgb25Qb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIFxuICAgICAgdGhpcy5oYW5kbGVUb3VjaE1vdmUoZSlcbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PSAndicpIHJldHVyblxuICAgICAgXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qgc2Nyb2xsZWREaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkRGlmZicpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIC8vIGRyYWcgdG8gbGVmdCBpcyBwb3NpdGl2ZSBudW1iZXJcbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgbGV0IHJlc3VsdCA9IHNjcm9sbGVkRGlmZiAtIGN1cnJlbnRQYWdlWFxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGxldCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcbiAgICAgIGxldCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG5cbiAgICAgIGlmIChyZXN1bHQgPCBsaW1pdExlZnQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoICs9IE1hdGgucm91bmQoMC4yICogc2Nyb2xsYmFyUmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJSZXN1bHQgPSAwXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChyZXN1bHQgPiBsaW1pdFJpZ2h0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0ICsgMC44ICogbGltaXRSaWdodClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggLT0gTWF0aC5yb3VuZCgwLjggKiAocmVzdWx0IC0gbGltaXRSaWdodCkgKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICAgIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdmVFdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcbiAgICAgIHRoaXMucHVzaCgncGFnZVgnLCBjdXJyZW50UGFnZVgpXG5cbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uUG9pbnRlclVwKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuXG4gICAgICBpZiAodGhpcy5nZXQoJ3N3aXBlRGlyZWN0aW9uJykgPT0gJ3YnKSB7XG4gICAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICAgIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsIG51bGwpXG4gICAgICAgIHRoaXMuY2xlYXIoJ3BhZ2VYJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZ2V0RWxlbWVudCgnaHRtbCcpLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IGxhc3RQYWdlWCA9IHRoaXMuZ2V0TGFzdE1lYW5pbmdmdWxsKCdwYWdlWCcpXG4gICAgICBjb25zdCBjdXJyZW50RXZlbnRYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBkaXN0YW5jZURlbHRhID0gY3VycmVudEV2ZW50WCAtIGxhc3RQYWdlWFxuXG4gICAgICBjb25zdCB0aW1lRGVsdGEgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHRoaXMuZ2V0KCdtb3ZlRXZlbnRUUycpKSAvIDEuNVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogOClcblxuICAgICAgLy8gY2xpY2tlZFxuICAgICAgaWYgKGxhc3RQYWdlWCA9PT0gMCkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcub25DbGljaykgcmV0dXJuIHRoaXMuY29uZmlnLm9uQ2xpY2soZSlcblxuICAgICAgICBjb25zdCBsaW5rTm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgICBpZiAoIWxpbmtOb2RlKSByZXR1cm5cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpXG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICBjb25zdCBjdHJsQ2xpY2sgPSBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5XG5cbiAgICAgICAgaWYgKGN0cmxDbGljaykgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICAgIGlmICghdGFyZ2V0ICYmIGhyZWYpIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWZcbiAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKCdibGFuaycpID4gLTEgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICB9XG5cbiAgICAgIC8vIGRyYWdnZWRcbiAgICAgIC8vIHN0aWNreSBsZWZ0XG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIGxlZnRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTApXG4gICAgICAvLyBzdGlja3kgcmlnaHRcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIHJpZ2h0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTApXG4gICAgICAvLyBvdGhlcndpc2VcbiAgICAgIGVsc2UgaWYgKHRpbWVEZWx0YSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLnJvdW5kKE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpIC8gdGltZURlbHRhKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIE1hdGgucm91bmQoZW5kcG9pbnQpLCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkNsaWNrTGluayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gZVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGwoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS5kZWx0YVggfHwgTWF0aC5hYnMoZS5kZWx0YVkpID4gTWF0aC5hYnMoZS5kZWx0YVgpIHx8ICAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCB7ZGVsdGFYfSA9IGVcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZGVsdGFYLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcblxuICAgICAgaWYgKHJlc3VsdCA9PSBsaW1pdFJpZ2h0KSB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICBlbHNlIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICBcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcbiAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCB0cnVlKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHNjcm9sbENsaWNrRGlzYWJsZWQgPSB0aGlzLmdldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcpXG5cbiAgICAgIGlmIChzY3JvbGxDbGlja0Rpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgZmFsc2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIWUucHJldmVudERlZmF1bHQgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjYldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IGxpbWl0UmlnaHQgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgcGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGNlbnRlciA9IHBhZ2VYIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCBsZWZ0RWRnZSA9IGNlbnRlciAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgcmlnaHRFZGdlID0gY2VudGVyICsgc2NiV2lkdGggLyAyXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IGNlbnRlciAvIHNjYkZhY3RvclxuICAgICAgaWYgKGxlZnRFZGdlIDwgbGltaXRMZWZ0KSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocmlnaHRFZGdlID4gcmlnaHRTY2JMaW1pdCkgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG5cbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBcbiAgICBvbkFuY2hvckNsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUudGFyZ2V0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm4gXG4gICAgICBcbiAgICAgIGNvbnN0IGFuY2hvcmlkID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtYW5jaG9yaWRdJykuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcmlkJylcbiAgICAgIGlmICghYW5jaG9yaWQpIHJldHVyblxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcm9yaWdpbmlkPVwiJyArIGFuY2hvcmlkICsgJ1wiXScsIHJvb3ROb2RlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KHRhcmdldE5vZGUub2Zmc2V0TGVmdCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGlmIChNYXRoLmFicyhlbmRwb2ludCkgPCAyKSBlbmRwb2ludCA9IDBcblxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJEb3duKGUpIHtcbiAgICAgIGlmICghZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgdGhpcy5yZWxlYXNlU2NiKClcblxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRG93blBhZ2VYJywgY3VycmVudFBhZ2VYIC0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3IpXG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJEb3duUGFnZVggPSB0aGlzLmdldCgnc2Nyb2xsYmFyRG93blBhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBkZWx0YSA9IChjdXJyZW50UGFnZVggLSBzY3JvbGxiYXJEb3duUGFnZVgpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heChkZWx0YSAvIHNjcm9sbGJhckZhY3RvciwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgaGFuZGxlVG91Y2hTdGFydChlKSB7XG4gICAgICBpZiAoIWUudG91Y2hlcyAmJiAhZS5jaGFuZ2VkVG91Y2hlcykgcmV0dXJuXG4gICAgICB0aGlzLnNldCgndG91Y2hYJywgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIHx8IGUudG91Y2hlc1swXS5jbGllbnRYKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGhhbmRsZVRvdWNoTW92ZShlKSB7XG4gICAgICBjb25zdCB0b3VjaFggPSB0aGlzLmdldCgndG91Y2hYJylcbiAgICAgIGNvbnN0IHRvdWNoWSA9IHRoaXMuZ2V0KCd0b3VjaFknKVxuICAgICAgaWYgKCF0b3VjaFggfHwgIXRvdWNoWSB8fCAoIWUudG91Y2hlcyAmJiAhZS5jaGFuZ2VkVG91Y2hlcykpIHJldHVyblxuXG4gICAgICBjb25zdCB4VXAgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFhcbiAgICAgIGNvbnN0IHlVcCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WVxuXG4gICAgICBjb25zdCB4RGlmZiA9IHRvdWNoWCAtIHhVcFxuICAgICAgY29uc3QgeURpZmYgPSB0b3VjaFkgLSB5VXBcblxuICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSkgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ2gnKVxuICAgICAgZWxzZSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAndicpXG5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCAwKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cblxuICAgIGFuaW1hdGUoc3RhcnQsIHN0b3A9MCwgc3BlZWQ9MTAsIGFuaW1hdGVXaWR0aD1mYWxzZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSBzdG9wIC0gc3RhcnRcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1heCguMDUsIE1hdGgubWluKE1hdGguYWJzKGRlbHRhKSAvIHNwZWVkLCAxKSlcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JykgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGxldCBjdXJyZW50VGltZSA9IHNwZWVkID09IDAgPyAxIDogMCxcbiAgICAgICAgICBlbmRwb2ludCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpLFxuICAgICAgICAgIHNjYkVuZHBvaW50ID0gZW5kcG9pbnQgKiBzY2JGYWN0b3JcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdwb2ludGVyRG93bicpIHx8IHRoaXMuZ2V0KCdtb3VzZVNjcm9sbCcpKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICBlbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpXG4gICAgICAgICAgOiBzdG9wXG5cbiAgICAgICAgc2NiRW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICogc2NiRmFjdG9yICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSAqIHNjYkZhY3RvclxuICAgICAgICAgIDogc3RvcCAqIHNjYkZhY3RvclxuICAgICAgICBcbiAgICAgICAgc2NiRW5kcG9pbnQgPSBNYXRoLm1pbihzY2JFbmRwb2ludCwgcmlnaHRTY2JMaW1pdClcblxuICAgICAgICBpZiAoIWFuaW1hdGVXaWR0aCkge1xuICAgICAgICAgIGlmIChzY2JFbmRwb2ludCA+PSByaWdodFNjYkxpbWl0KSB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgICAgZWxzZSB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgICAgIHRoaXMuc2V0U2NiUG9zKHNjYkVuZHBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBzY2J3ID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgICAgICBpZiAoc3RhcnQgPCBzdG9wKSBzY2J3IC09IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcbiAgICAgICAgICBlbHNlIHNjYncgKz0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuXG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChzY2J3KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3MoLTEgKiBlbmRwb2ludClcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgZW5kcG9pbnQpXG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIDwgMSkgcmFmKHRpY2spXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGljaygpXG4gICAgfVxuXG4gICAgY2hlY2tCb3JkZXJWaXNpYmlsaXR5KCkge1xuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPiBsaW1pdExlZnQpIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRSaWdodCkge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvLyBwdWJsaWMgQVBJXG5cbiAgICBzY3JvbGxUbyhwb2ludCwgdGltZT0xMDAwKSB7XG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBsZXQgZW5kcG9pbnQgPSAhaXNOYU4ocG9pbnQpID8gcGFyc2VJbnQocG9pbnQpIDogMFxuICAgICAgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heChlbmRwb2ludCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgaWYgKHBvaW50ID09ICdlbmQnKSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdzdGFydCcpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnY2VudGVyJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0IC8gMlxuXG4gICAgICB0aGlzLmFuaW1hdGUodGhpcy5nZXQoJ3Njcm9sbGVkJyksIGVuZHBvaW50LCB0aW1lKVxuICAgIH1cblxuICAgIHVwZGF0ZShjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249dGhpcy5jb25maWcuYWxpZ24sXG4gICAgICAgIG5vQW5jaG9ycz10aGlzLmNvbmZpZy5ub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyPXRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyLFxuICAgICAgICBzY3JvbGxiYXIsXG4gICAgICAgIGFuY2hvcnMsXG4gICAgICAgIG9uQ2xpY2s9dGhpcy5jb25maWcub25DbGljayxcbiAgICAgICAgc3RhcnQ9dGhpcy5jb25maWcuc3RhcnQsXG4gICAgICAgIHN0YXJ0QW5pbWF0aW9uPXRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnLmFsaWduID0gYWxpZ25cbiAgICAgIHRoaXMuY29uZmlnLm5vQW5jaG9ycyA9ICFub0FuY2hvcnMgXG4gICAgICAgID8gYW5jaG9ycyA9PSAnaGlkZGVuJyBcbiAgICAgICAgOiBhbmNob3JzICE9ICd2aXNpYmxlJ1xuXG4gICAgICB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciA9ICFub1Njcm9sbGJhclxuICAgICAgICA/IHNjcm9sbGJhciA9PSAnaGlkZGVuJyBcbiAgICAgICAgOiBzY3JvbGxiYXIgIT0gJ3Zpc2libGUnXG5cbiAgICAgIHRoaXMuY29uZmlnLm9uQ2xpY2sgPSBvbkNsaWNrXG4gICAgICB0aGlzLmNvbmZpZy5zdGFydCA9IHN0YXJ0XG4gICAgICB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA9IHN0YXJ0QW5pbWF0aW9uXG5cbiAgICAgIHRoaXMuX3VwZGF0ZSgpXG4gICAgfVxuICB9XG5cblxuXG4gIC8vIGluaXQgY29uZmlnXG5cbiAgY29uc3QgYXV0b2luaXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZWxzID0gZ2V0RWxlbWVudHMoJy5zY3JvbGxlcicpXG4gICAgQXJyYXkuZnJvbShlbHMpLmZvckVhY2goZWwgPT4ge1xuICAgICAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuICAgIH0pXG4gIH1cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gYXV0b2luaXQpXG5cbiAgZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiaW50ZXJhY3RpdmVcIikgYXV0b2luaXQoKVxuICB9XG5cbiAgd2luZG93LlNjcm9sbGVyID0gU2Nyb2xsZXJcblxufSgpKVxuIiwibW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIEFycmF5LmZyb20gPT09ICdmdW5jdGlvbicgP1xuICBBcnJheS5mcm9tIDpcbiAgcmVxdWlyZSgnLi9wb2x5ZmlsbCcpXG4pO1xuIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gUmVmZXJlbmNlOiBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtYXJyYXkuZnJvbVxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nO1xuICB9O1xuICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgfTtcbiAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgfTtcbiAgdmFyIGl0ZXJhdG9yUHJvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgIT0gbnVsbCkge1xuICAgICAgaWYoWydzdHJpbmcnLCdudW1iZXInLCdib29sZWFuJywnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdmFsdWUpID4gLTEpe1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAoJ2l0ZXJhdG9yJyBpbiBTeW1ib2wpICYmXG4gICAgICAgIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIFN5bWJvbC5pdGVyYXRvcjtcbiAgICAgIH1cbiAgICAgIC8vIFN1cHBvcnQgXCJAQGl0ZXJhdG9yXCIgcGxhY2Vob2xkZXIsIEdlY2tvIDI3IHRvIEdlY2tvIDM1XG4gICAgICBlbHNlIGlmICgnQEBpdGVyYXRvcicgaW4gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICdAQGl0ZXJhdG9yJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihPLCBQKSB7XG4gICAgLy8gQXNzZXJ0OiBJc1Byb3BlcnR5S2V5KFApIGlzIHRydWUuXG4gICAgaWYgKE8gIT0gbnVsbCAmJiBQICE9IG51bGwpIHtcbiAgICAgIC8vIExldCBmdW5jIGJlIEdldFYoTywgUCkuXG4gICAgICB2YXIgZnVuYyA9IE9bUF07XG4gICAgICAvLyBSZXR1cm5JZkFicnVwdChmdW5jKS5cbiAgICAgIC8vIElmIGZ1bmMgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBudWxsLCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgaWYoZnVuYyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICAvLyBJZiBJc0NhbGxhYmxlKGZ1bmMpIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICBpZiAoIWlzQ2FsbGFibGUoZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihmdW5jICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICB9O1xuICB2YXIgaXRlcmF0b3JTdGVwID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICAvLyBMZXQgcmVzdWx0IGJlIEl0ZXJhdG9yTmV4dChpdGVyYXRvcikuXG4gICAgLy8gUmV0dXJuSWZBYnJ1cHQocmVzdWx0KS5cbiAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIC8vIExldCBkb25lIGJlIEl0ZXJhdG9yQ29tcGxldGUocmVzdWx0KS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChkb25lKS5cbiAgICB2YXIgZG9uZSA9IEJvb2xlYW4ocmVzdWx0LmRvbmUpO1xuICAgIC8vIElmIGRvbmUgaXMgdHJ1ZSwgcmV0dXJuIGZhbHNlLlxuICAgIGlmKGRvbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHJlc3VsdC5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gIHJldHVybiBmdW5jdGlvbiBmcm9tKGl0ZW1zIC8qLCBtYXBGbiwgdGhpc0FyZyAqLyApIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAvLyAyLiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgdmFyIFQ7XG4gICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIDMuIGVsc2VcbiAgICAgIC8vICAgYS4gSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vICAgYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFRcbiAgICAgIC8vICAgICAgYmUgdW5kZWZpbmVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG4gICAgICAvLyAgIGMuIExldCBtYXBwaW5nIGJlIHRydWUgKGltcGxpZWQgYnkgbWFwRm4pXG4gICAgfVxuXG4gICAgdmFyIEEsIGs7XG5cbiAgICAvLyA0LiBMZXQgdXNpbmdJdGVyYXRvciBiZSBHZXRNZXRob2QoaXRlbXMsIEBAaXRlcmF0b3IpLlxuICAgIC8vIDUuIFJldHVybklmQWJydXB0KHVzaW5nSXRlcmF0b3IpLlxuICAgIHZhciB1c2luZ0l0ZXJhdG9yID0gZ2V0TWV0aG9kKGl0ZW1zLCBpdGVyYXRvclByb3AoaXRlbXMpKTtcblxuICAgIC8vIDYuIElmIHVzaW5nSXRlcmF0b3IgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh1c2luZ0l0ZXJhdG9yICE9PSB2b2lkIDApIHtcbiAgICAgIC8vIGEuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV1cbiAgICAgIC8vICAgICAgaW50ZXJuYWwgbWV0aG9kIG9mIEMgd2l0aCBhbiBlbXB0eSBhcmd1bWVudCBsaXN0LlxuICAgICAgLy8gYi4gRWxzZSxcbiAgICAgIC8vICAgaS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEFycmF5Q3JlYXRlXG4gICAgICAvLyAgICAgIHdpdGggYXJndW1lbnQgMC5cbiAgICAgIC8vIGMuIFJldHVybklmQWJydXB0KEEpLlxuICAgICAgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMoKSkgOiBbXTtcblxuICAgICAgLy8gZC4gTGV0IGl0ZXJhdG9yIGJlIEdldEl0ZXJhdG9yKGl0ZW1zLCB1c2luZ0l0ZXJhdG9yKS5cbiAgICAgIHZhciBpdGVyYXRvciA9IHVzaW5nSXRlcmF0b3IuY2FsbChpdGVtcyk7XG5cbiAgICAgIC8vIGUuIFJldHVybklmQWJydXB0KGl0ZXJhdG9yKS5cbiAgICAgIGlmIChpdGVyYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGYuIExldCBrIGJlIDAuXG4gICAgICBrID0gMDtcblxuICAgICAgLy8gZy4gUmVwZWF0XG4gICAgICB2YXIgbmV4dCwgbmV4dFZhbHVlO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gaS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgICAvLyBpaS4gTGV0IG5leHQgYmUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKS5cbiAgICAgICAgLy8gaWlpLiBSZXR1cm5JZkFicnVwdChuZXh0KS5cbiAgICAgICAgbmV4dCA9IGl0ZXJhdG9yU3RlcChpdGVyYXRvcik7XG5cbiAgICAgICAgLy8gaXYuIElmIG5leHQgaXMgZmFsc2UsIHRoZW5cbiAgICAgICAgaWYgKCFuZXh0KSB7XG5cbiAgICAgICAgICAvLyAxLiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBrLCB0cnVlKS5cbiAgICAgICAgICAvLyAyLiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgICAgIEEubGVuZ3RoID0gaztcblxuICAgICAgICAgIC8vIDMuIFJldHVybiBBLlxuICAgICAgICAgIHJldHVybiBBO1xuICAgICAgICB9XG4gICAgICAgIC8vIHYuIExldCBuZXh0VmFsdWUgYmUgSXRlcmF0b3JWYWx1ZShuZXh0KS5cbiAgICAgICAgLy8gdmkuIFJldHVybklmQWJydXB0KG5leHRWYWx1ZSlcbiAgICAgICAgbmV4dFZhbHVlID0gbmV4dC52YWx1ZTtcblxuICAgICAgICAvLyB2aWkuIElmIG1hcHBpbmcgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAvLyAgIDEuIExldCBtYXBwZWRWYWx1ZSBiZSBDYWxsKG1hcGZuLCBULCDCq25leHRWYWx1ZSwga8K7KS5cbiAgICAgICAgLy8gICAyLiBJZiBtYXBwZWRWYWx1ZSBpcyBhbiBhYnJ1cHQgY29tcGxldGlvbiwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyAgIDMuIExldCBtYXBwZWRWYWx1ZSBiZSBtYXBwZWRWYWx1ZS5bW3ZhbHVlXV0uXG4gICAgICAgIC8vIHZpaWkuIEVsc2UsIGxldCBtYXBwZWRWYWx1ZSBiZSBuZXh0VmFsdWUuXG4gICAgICAgIC8vIGl4LiAgTGV0IGRlZmluZVN0YXR1cyBiZSB0aGUgcmVzdWx0IG9mXG4gICAgICAgIC8vICAgICAgQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhBLCBQaywgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyB4LiBbVE9ET10gSWYgZGVmaW5lU3RhdHVzIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgZGVmaW5lU3RhdHVzKS5cbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwgbmV4dFZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHhpLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDcuIEFzc2VydDogaXRlbXMgaXMgbm90IGFuIEl0ZXJhYmxlIHNvIGFzc3VtZSBpdCBpc1xuICAgICAgLy8gICAgYW4gYXJyYXktbGlrZSBvYmplY3QuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gOC4gTGV0IGFycmF5TGlrZSBiZSBUb09iamVjdChpdGVtcykuXG4gICAgICB2YXIgYXJyYXlMaWtlID0gT2JqZWN0KGl0ZW1zKTtcblxuICAgICAgLy8gOS4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGl0ZW1zID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW4gYmUgVG9MZW5ndGgoR2V0KGFycmF5TGlrZSwgXCJsZW5ndGhcIikpLlxuICAgICAgLy8gMTEuIFJldHVybklmQWJydXB0KGxlbikuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoYXJyYXlMaWtlLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEyLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vICAgICBhLiBMZXQgQSBiZSBDb25zdHJ1Y3QoQywgwqtsZW7CuykuXG4gICAgICAvLyAxMy4gRWxzZVxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICAvLyAxNC4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNS4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuICAgICAgLy8gMTYuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBhcnJheUxpa2Vba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrKys7XG4gICAgICB9XG4gICAgICAvLyAxNy4gTGV0IHNldFN0YXR1cyBiZSBTZXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIC8vIDE4LiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAxOS4gUmV0dXJuIEEuXG4gICAgfVxuICAgIHJldHVybiBBO1xuICB9O1xufSkoKTtcbiJdfQ==
