(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

  // Array.from polyfill
  if (!Array.from) Array.from = require('array-from')

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

  // passive event listeners polyfill
  var passiveSupported = false;

  try {
    var options = Object.defineProperty({}, 'passive', {
      get: function get() {
        passiveSupported = true;
      }
    });

    window.addEventListener('test', null, options);
  } catch (err) {}

  // helpers
  var getElement = function getElement() {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    var node = ctx.querySelectorAll(selector);
    return node ? node[0] : null;
  };

  var getElements = function getElements() {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    var nodes = ctx.querySelectorAll(selector);
    return nodes || null;
  };

  var getEventX = function getEventX(e) {
    return e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX || e.touches && e.touches.length && e.touches[0].pageX || e.pageX || 0;
  };

  var isControlClick = function isControlClick(e) {
    return e.ctrlKey || e.metaKey;
  };

  var isLeftButtonClick = function isLeftButtonClick(e) {
    return e.which === 1 || e.button === 0;
  };

  var isTouchEvent = function isTouchEvent(e) {
    return !!e.touches || !!e.changedTouches;
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
    return navigator.userAgent.toLowerCase().indexOf('android') > -1;
  };

  // scroller

  var Scroller = function () {
    function Scroller(config) {
      _classCallCheck(this, Scroller);

      var _config$align = config.align,
          align = _config$align === undefined ? 'center' : _config$align,
          _config$noAnchors = config.noAnchors,
          noAnchors = _config$noAnchors === undefined ? false : _config$noAnchors,
          _config$noScrollbar = config.noScrollbar,
          noScrollbar = _config$noScrollbar === undefined ? false : _config$noScrollbar,
          _config$scrollbar = config.scrollbar,
          scrollbar = _config$scrollbar === undefined ? 'visible' : _config$scrollbar,
          _config$anchors = config.anchors,
          anchors = _config$anchors === undefined ? 'visible' : _config$anchors,
          _config$start = config.start,
          start = _config$start === undefined ? 0 : _config$start,
          _config$startAnimatio = config.startAnimation,
          startAnimation = _config$startAnimatio === undefined ? false : _config$startAnimatio,
          el = config.el,
          onClick = config.onClick,
          _config$useOuterHtml = config.useOuterHtml,
          useOuterHtml = _config$useOuterHtml === undefined ? false : _config$useOuterHtml;


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

        // if we don't need to create markup
        // for example react component will render html by itself
        // so we just take outer markup instead
        useOuterHtml: useOuterHtml,

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
      key: 'clearPointerState',
      value: function clearPointerState() {
        this.set('pointerDown', false);
        this.set('scrollbarPointerDown', false);
        this.set('mouseScroll', false);
        this.set('swipeDirection', null);
        this.clear('pageX');
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

        // passive: false needed to prevent scrolling in Safari on latest iOS
        // https://stackoverflow.com/questions/49500339/cant-prevent-touchmove-from-scrolling-window-on-ios
        var touchMoveEventConfig = passiveSupported ? { passive: false } : false;

        stripNode.addEventListener('mousedown', this.onPointerDown.bind(this));
        stripNode.addEventListener('touchstart', this.onPointerDown.bind(this));
        document.addEventListener('mousemove', this.onPointerMove.bind(this));
        document.addEventListener('touchmove', this.onPointerMove.bind(this), touchMoveEventConfig);
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

        this.bindAnchorsEvents();

        // prevent clickng on links and handle focus event
        Array.from(linkNodes).forEach(function (node) {
          node.addEventListener('click', _this.onClickLink.bind(_this), false);
          node.addEventListener('focus', _this.onFocus.bind(_this), false);
          node.addEventListener('keydown', _this.onKeyDown.bind(_this), false);
        });

        // rerender
        window.addEventListener('resize', function (e) {
          _this.setSize();
          _this.checkScrollable();
          _this.checkBorderVisibility();
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
        }

        startAnimationHelper();
        this.checkBorderVisibility();
      }
    }, {
      key: 'bindAnchorsEvents',
      value: function bindAnchorsEvents() {
        var _this2 = this;

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var anchorsNodes = getElements('.' + prefix + '-anchor', rootNode);

        Array.from(anchorsNodes).forEach(function (anchorNode) {
          anchorNode.addEventListener('click', _this2.onAnchorClick.bind(_this2));
        });
      }
    }, {
      key: 'createWrapper',
      value: function createWrapper() {
        if (this.config.useOuterHtml) return;

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
        var _this3 = this;

        var useOuterHtml = this.config.useOuterHtml;
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);

        Array.from(getChildren(wrapperNode)).forEach(function (itemNode) {
          if (useOuterHtml) {
            _this3.addClass(itemNode, prefix + '-item');
          } else {
            var itemWrapper = document.createElement('div');
            itemWrapper.innerHTML = itemNode.outerHTML;
            itemWrapper.setAttribute('class', prefix + '-item');
            itemNode.parentNode.insertBefore(itemWrapper, itemNode);
            itemNode.remove();
          }
        });
      }
    }, {
      key: 'findCentralNode',
      value: function findCentralNode() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var centralNodes = getElements('[data-central="true"]', rootNode);
        return centralNodes && centralNodes.length ? centralNodes[centralNodes.length - 1].closest('.' + prefix + '-item') : null;
      }
    }, {
      key: 'removeAnchors',
      value: function removeAnchors() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        ancWrapperNode.innerHTML = '';
      }
    }, {
      key: 'createAnchors',
      value: function createAnchors() {
        var useOuterHtml = this.config.useOuterHtml;
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        var ancWrapperNode = getElement('.' + prefix + '-anchors', rootNode);
        var anchorsHtml = '',
            counter = 0;

        Array.from(getChildren(wrapperNode)).forEach(function (itemNode) {
          var targetNode = useOuterHtml ? itemNode : getElement('[data-anchor]', itemNode);

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

        // otherwise will be NaN
        var scrollbarFactor = scrollwrapWidth !== 0 && sumWidth !== 0 ? scrollwrapWidth / sumWidth : 1;

        // if screen is wider than scroller, reset transformations
        if (scrollbarFactor >= 1) {
          this.set('scbScrolled', 0);
          this.set('scrolled', 0);
          this.releaseScb();
        }

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
        var useOuterHtml = this.config.useOuterHtml;
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        if (this.config.align !== 'center') this.addClass(rootNode, this.config.leftAlignClsnm);else this.removeClass(rootNode, this.config.leftAlignClsnm);

        if (this.config.noAnchors) this.addClass(rootNode, this.config.noAnchorsClsnm);else this.removeClass(rootNode, this.config.noAnchorsClsnm);

        if (this.config.noScrollbar) this.addClass(rootNode, this.config.noScrollbarClsnm);else this.removeClass(rootNode, this.config.noScrollbarClsnm);

        if (useOuterHtml) {
          this.wrapItems();
          this.removeAnchors();
          this.createAnchors();
          this.bindAnchorsEvents();
        }

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

        var tochEvent = isTouchEvent(e);
        if (!tochEvent) e.preventDefault();
        if (!tochEvent && !isLeftButtonClick(e)) return;

        this.set('pointerDown', true);
        this.set('scrollbarPointerDown', false);
        this.set('mouseScroll', false);
        this.set('downEventTS', Date.now());

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
        if (this.get('swipeDirection') === 'v') return;

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
        this.set('moveEventTS', Date.now());
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

        if (this.get('swipeDirection') === 'v') {
          this.clearPointerState();
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

        var nowTS = Date.now();
        var timeFromLastMove = (nowTS - this.get('moveEventTS')) / 1.5;
        var timeFromPointerDown = nowTS - this.get('downEventTS');
        var endpoint = scrolled - distanceDelta * 8;

        var isClick = lastPageX === 0 && timeFromPointerDown < 150;
        var isLongClick = lastPageX === 0;

        // simple click
        if (isClick) {
          if (this.config.onClick) return this.config.onClick(e);

          var linkNode = e.target.closest('a');
          if (!linkNode) return;

          var target = linkNode.getAttribute('target');
          var href = linkNode.getAttribute('href');
          var ctrlClick = isControlClick(e);

          if (ctrlClick) return window.open(href);
          if (!target && href) return window.location.href = href;
          if (target.indexOf('blank') > -1 && href) return window.open(href);
        }

        // long click with no motion
        if (isLongClick) return;

        // dragging
        // sticky left
        if (scrolled < limitLeft) this.animate(scrolled, limitLeft, 10, true);
        // too much to left
        else if (endpoint < limitLeft) this.animate(scrolled, limitLeft, 10);
          // sticky right
          else if (scrolled > limitRight) this.animate(scrolled, limitRight, 10, true);
            // too much to right
            else if (endpoint > limitRight) this.animate(scrolled, limitRight, 10);
              // otherwise
              else if (timeFromLastMove < 150 && Math.abs(distanceDelta) > 2) {
                  var timeToEndpoint = Math.round(Math.abs(distanceDelta) / timeFromLastMove);
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
      key: 'onFocus',
      value: function onFocus(e) {
        e.preventDefault();
        e.stopPropagation();

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        this.releaseScb();

        // focus resolve, see: 
        // http://wd.dizaina.net/en/internet-maintenance/js-sliders-and-the-tab-key/
        rootNode.scrollLeft = 0;
        setTimeout(function () {
          rootNode.scrollLeft = 0;
        }, 0);

        var targetNode = e.target.closest('.' + prefix + '-item');
        var scrollwrapNode = getElement('.' + prefix + '-scrollwrap', rootNode);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');

        var endpoint = Math.min(Math.max(targetNode.offsetLeft, limitLeft), limitRight);
        if (Math.abs(endpoint) < 2) endpoint = 0;

        this.set('mouseScroll', false);
        this.animate(scrolled, endpoint);
        return false;
      }

      // check if enter is pressed

    }, {
      key: 'onKeyDown',
      value: function onKeyDown(e) {
        if (!e.keyCode || e.keyCode !== 13) return;
        var ctrlClick = isControlClick(e);
        var location = e.target.getAttribute('href');
        if (ctrlClick) window.open(location, '_blank', {});else window.location = location;
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
        if (!isTouchEvent(e) && !isLeftButtonClick(e)) return;

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
        if (!isTouchEvent(e)) return;
        this.set('touchX', e.changedTouches[0].clientX || e.touches[0].clientX);
        this.set('touchY', e.changedTouches[0].clientY || e.touches[0].clientY);
        return;
      }
    }, {
      key: 'handleTouchMove',
      value: function handleTouchMove(e) {
        var touchX = this.get('touchX');
        var touchY = this.get('touchY');
        if (!touchX || !touchY || !isTouchEvent(e)) return;

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
        var stop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var _this4 = this;

        var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
        var animateWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var delta = stop - start;
        var time = Math.max(.05, Math.min(Math.abs(delta) / speed, 1));
        var scbFactor = this.get('scrollbarFactor');
        var rightScbLimit = this.get('limitRight') * scbFactor;
        var limitRight = this.get('limitRight');

        var currentTime = speed == 0 ? 1 : 0,
            endpoint = this.get('scrolled'),
            scbEndpoint = endpoint * scbFactor;

        var tick = function tick() {
          if (_this4.get('pointerDown') || _this4.get('mouseScroll')) return;

          currentTime += 1 / 60;
          endpoint = currentTime < 1 ? start + delta * _this4.config.easing(currentTime / time) : stop;

          scbEndpoint = currentTime < 1 ? start * scbFactor + delta * _this4.config.easing(currentTime / time) * scbFactor : stop * scbFactor;

          scbEndpoint = Math.min(scbEndpoint, rightScbLimit);

          if (!animateWidth) {
            if (scbEndpoint >= rightScbLimit) _this4.alignScbToRight();else _this4.releaseScb();
            _this4.setScbPos(scbEndpoint);
          } else {
            var scbw = _this4.get('scrollbarWidth');
            if (start < stop) scbw -= delta * scbFactor * (1 - _this4.config.easing(currentTime / time));else scbw += delta * scbFactor * (1 - _this4.config.easing(currentTime / time));

            _this4.setWidth(scbw);
          }

          _this4.setPos(-1 * endpoint);
          _this4.set('scrolled', endpoint);

          if (currentTime < 1) raf(tick);else _this4.checkBorderVisibility();
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
        var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;

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
        var _config$align2 = config.align,
            align = _config$align2 === undefined ? this.config.align : _config$align2,
            _config$noAnchors2 = config.noAnchors,
            noAnchors = _config$noAnchors2 === undefined ? this.config.noAnchors : _config$noAnchors2,
            _config$noScrollbar2 = config.noScrollbar,
            noScrollbar = _config$noScrollbar2 === undefined ? this.config.noScrollbar : _config$noScrollbar2,
            scrollbar = config.scrollbar,
            anchors = config.anchors,
            _config$onClick = config.onClick,
            onClick = _config$onClick === undefined ? this.config.onClick : _config$onClick,
            _config$start2 = config.start,
            start = _config$start2 === undefined ? this.config.start : _config$start2,
            _config$startAnimatio2 = config.startAnimation,
            startAnimation = _config$startAnimatio2 === undefined ? this.config.startAnimation : _config$startAnimatio2;


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
    if (document.readyState == 'interactive') autoinit();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7QUFFVjtBQUNBLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSOztBQUc5QjtBQUg4QixHQUk3QixVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FqQjZCLEVBaUIzQixDQUFDLFFBQVEsU0FBVCxFQUFvQixjQUFjLFNBQWxDLEVBQTZDLGFBQWEsU0FBMUQsQ0FqQjJCLENBQWI7O0FBb0JqQjtBQUNBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtBQUFBLFVBQW1ELEtBQUssSUFBeEQ7QUFDQSxhQUFPLE1BQU0sU0FBTixDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUEwQixPQUEx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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbigpIHtcbiAgXG4gIC8vIEFycmF5LmZyb20gcG9seWZpbGxcbiAgaWYgKCFBcnJheS5mcm9tKSBBcnJheS5mcm9tID0gcmVxdWlyZSgnYXJyYXktZnJvbScpXG4gIFxuXG4gIC8vIHJlbW92ZSBwb2x5ZmlsbFxuICAoZnVuY3Rpb24gKGFycikge1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHJldHVyblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9KShbRWxlbWVudC5wcm90b3R5cGUsIENoYXJhY3RlckRhdGEucHJvdG90eXBlLCBEb2N1bWVudFR5cGUucHJvdG90eXBlXSlcblxuXG4gIC8vIG1hdGNoZXMgcG9seWZpbGxcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIG1hdGNoZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgdGggPSB0aGlzXG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChtYXRjaGVzLCBmdW5jdGlvbihlKXtcbiAgICAgICAgcmV0dXJuIGUgPT09IHRoXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2xvc2VzdCBwb2x5ZmlsbFxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXNcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubWF0Y2hlcyhjc3MpKSByZXR1cm4gbm9kZVxuICAgICAgICBlbHNlIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuXG4gIC8vIHBhc3NpdmUgZXZlbnQgbGlzdGVuZXJzIHBvbHlmaWxsXG4gIGxldCBwYXNzaXZlU3VwcG9ydGVkID0gZmFsc2VcbiAgXG4gIHRyeSB7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgICAgZ2V0OiAoKSA9PiB7IHBhc3NpdmVTdXBwb3J0ZWQgPSB0cnVlIH1cbiAgICB9KVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRpb25zKVxuICB9IGNhdGNoKGVycikge31cblxuXG4gIC8vIGhlbHBlcnNcbiAgY29uc3QgZ2V0RWxlbWVudCA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlID8gbm9kZVswXSA6IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEVsZW1lbnRzID0gKHNlbGVjdG9yPScnLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlcyA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlcyB8fCBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFdmVudFggPSBlID0+IHtcbiAgICByZXR1cm4gZS5jaGFuZ2VkVG91Y2hlc1xuICAgICAgICAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aFxuICAgICAgICAmJiBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnRvdWNoZXNcbiAgICAgICAgJiYgZS50b3VjaGVzLmxlbmd0aFxuICAgICAgICAmJiBlLnRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIHx8IGUucGFnZVggXG4gICAgICB8fCAwXG4gIH1cblxuICBjb25zdCBpc0NvbnRyb2xDbGljayA9IGUgPT5cbiAgICBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5XG5cbiAgY29uc3QgaXNMZWZ0QnV0dG9uQ2xpY2sgPSBlID0+XG4gICAgZS53aGljaCA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMFxuXG4gIGNvbnN0IGlzVG91Y2hFdmVudCA9IGUgPT5cbiAgICAhIWUudG91Y2hlcyB8fCAhIWUuY2hhbmdlZFRvdWNoZXNcblxuICBjb25zdCBnZXRDaGlsZHJlbiA9IChlbCkgPT4ge1xuICAgIGxldCBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcyxcbiAgICAgICAgY2hpbGRyZW4gPSBbXSxcbiAgICAgICAgaSA9IGNoaWxkTm9kZXMubGVuZ3RoXG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoY2hpbGROb2Rlc1tpXS5ub2RlVHlwZSA9PSAxKSBjaGlsZHJlbi51bnNoaWZ0KGNoaWxkTm9kZXNbaV0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkcmVuXG4gIH1cblxuICBjb25zdCBpc0FuZHJvaWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdhbmRyb2lkJykgPiAtMVxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249J2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI9ZmFsc2UsXG4gICAgICAgIHNjcm9sbGJhcj0ndmlzaWJsZScsXG4gICAgICAgIGFuY2hvcnM9J3Zpc2libGUnLFxuICAgICAgICBzdGFydD0wLFxuICAgICAgICBzdGFydEFuaW1hdGlvbj1mYWxzZSxcbiAgICAgICAgZWwsXG4gICAgICAgIG9uQ2xpY2ssXG4gICAgICAgIHVzZU91dGVySHRtbD1mYWxzZSxcbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgLy8gbm9BbmNob3JzLCBub1Njcm9sbGJhciDigJQgbGVnYWN5XG4gICAgICAgIG5vQW5jaG9yczogYW5jaG9ycyA9PSAnaGlkZGVuJyB8fCBub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBzY3JvbGxiYXIgPT0gJ2hpZGRlbicgfHwgbm9TY3JvbGxiYXIsXG4gICAgICAgIG9uQ2xpY2s6IG9uQ2xpY2ssXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgc3RhcnRBbmltYXRpb246IHN0YXJ0QW5pbWF0aW9uLFxuXG4gICAgICAgIHByZWZpeDogJ2FiX3Njcm9sbGVyJyxcbiAgICAgICAgZHJhZ2dpbmdDbHNubTogJ2lzLWRyYWdnaW5nJyxcbiAgICAgICAgbGVmdEFsaWduQ2xzbm06ICdpcy1sZWZ0LWFsaWduJyxcbiAgICAgICAgYm9yZGVyVnNibENsc25tOiAnaXMtdmlzaWJsZScsXG4gICAgICAgIG5vQW5jaG9yc0Nsc25tOiAnaXMtbm8tYW5jaG9ycycsXG4gICAgICAgIG5vU2Nyb2xsYmFyQ2xzbm06ICdpcy1uby1zY3JvbGxiYXInLFxuXG4gICAgICAgIC8vIGlmIHdlIGRvbid0IG5lZWQgdG8gY3JlYXRlIG1hcmt1cFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSByZWFjdCBjb21wb25lbnQgd2lsbCByZW5kZXIgaHRtbCBieSBpdHNlbGZcbiAgICAgICAgLy8gc28gd2UganVzdCB0YWtlIG91dGVyIG1hcmt1cCBpbnN0ZWFkXG4gICAgICAgIHVzZU91dGVySHRtbDogdXNlT3V0ZXJIdG1sLFxuXG4gICAgICAgIGVhc2luZzogcG9zID0+IHBvcyA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogcG9zKSArIDEsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBzY3JvbGxhYmxlOiB0cnVlLFxuXG4gICAgICAgIHBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgc2Nyb2xsYmFyUG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBtb3VzZVNjcm9sbDogZmFsc2UsXG5cbiAgICAgICAgc2Nyb2xsYmFyV2lkdGg6IDAsXG4gICAgICAgIHNjcm9sbGJhckZhY3RvcjogMCxcblxuICAgICAgICBwYWdlWDogW10sXG4gICAgICAgIHNjcm9sbGVkRGlmZjogMCxcbiAgICAgICAgZG93bkV2ZW50VFM6IDAsXG4gICAgICAgIG1vdmVFdmVudFRTOiAwLFxuXG4gICAgICAgIHNjcm9sbGJhckRvd25QYWdlWDogMCxcbiAgICAgICAgc2Nyb2xsQ2xpY2tEaXNhYmxlZDogZmFsc2UsXG5cbiAgICAgICAgbGltaXRMZWZ0OiAwLFxuICAgICAgICBsaW1pdFJpZ2h0OiAwLFxuICAgICAgICBzdHJpcFdpZHRoOiAwLFxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uOiBudWxsLFxuICAgICAgICB0b3VjaFg6IDAsXG4gICAgICAgIHRvdWNoWTogMCxcblxuICAgICAgICBsZXQ6IGVsLmhhc0NoaWxkTm9kZXMoKSAmJiBnZXRDaGlsZHJlbihlbCkubGVuZ3RoIHx8IDAsXG4gICAgICAgIGVsOiBlbCB8fCBudWxsLFxuXG4gICAgICAgIGlzQW5kcm9pZDogaXNBbmRyb2lkKClcbiAgICAgIH1cblxuICAgICAgd2luZG93LnJhZiA9ICgoKSA9PiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge3NldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCl9XG4gICAgICB9KSgpXG5cbiAgICAgIHRoaXMuaW5pdChlbClcbiAgICB9XG5cblxuICAgIGdldChwcm9wKSB7XG4gICAgICByZXR1cm4gdHlwZW9mKHRoaXMuc3RhdGVbcHJvcF0pICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgc2V0KHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdID0gdmFsdWVcbiAgICB9XG5cbiAgICBwdXNoKHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdICYmIHRoaXMuc3RhdGVbcHJvcF0ucHVzaCh2YWx1ZSlcbiAgICB9XG5cbiAgICBjbGVhcihwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGlmIChmaWVsZCAmJiBmaWVsZC5sZW5ndGgpIGZpZWxkLmxlbmd0aCA9IDBcbiAgICB9XG5cbiAgICBnZXRMYXN0TWVhbmluZ2Z1bGwocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBjb25zdCB0b0lnbm9yZSA9IGZpZWxkICYmIGZpZWxkLmxlbmd0aCAmJiBmaWVsZC5sZW5ndGggPiAzID8gMyA6IDFcbiAgICAgIHJldHVybiBmaWVsZFtmaWVsZC5sZW5ndGggLSB0b0lnbm9yZV0gfHwgMFxuICAgIH1cblxuXG4gICAgYWRkQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBpZiAoIW5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2wrJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKSkgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsXG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFxzK3xeKScrY2wrJyhcXFxccyt8JCknLCAnZycpLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICB9XG5cbiAgICBhbGlnblNjYlRvUmlnaHQoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cbiAgICByZWxlYXNlU2NiKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZWwsICdpcy1yaWdodCcpXG4gICAgfVxuXG5cbiAgICBzZXRQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsLCBwb3MpXG4gICAgfVxuXG4gICAgc2V0U2NiUG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbihlbCwgcG9zKSB7XG4gICAgICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICAgIGVsLnN0eWxlLk1velRyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5tc1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5PVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgIH1cblxuICAgIHNldFdpZHRoKHdpZHRoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgZWwuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgICB9XG5cbiAgICBjbGVhclBvaW50ZXJTdGF0ZSgpIHtcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsIG51bGwpXG4gICAgICB0aGlzLmNsZWFyKCdwYWdlWCcpXG4gICAgfVxuXG5cbiAgICBpbml0KGVsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVdyYXBwZXIoKVxuICAgICAgdGhpcy53cmFwSXRlbXMoKVxuICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgLy8gY29uZmlnXG4gICAgICBpZiAodGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInIFxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdGFsaWduJykgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0QWxpZ24nKSBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKSBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRpZndpZGUnKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycyBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcnMnKSA9PSAnaGlkZGVuJyBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vYW5jaG9ycycpIFxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9BbmNob3JzJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbGJhcicpID09ICdoaWRkZW4nIFxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vU2Nyb2xsYmFyJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydCcpKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0JylcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydEFuaW1hdGlvbicpIFxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnRhbmltYXRpb24nKSkge1xuICAgICAgICB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA9IHRydWVcbiAgICAgIH1cblxuXG4gICAgICAvLyBwYXNzaXZlOiBmYWxzZSBuZWVkZWQgdG8gcHJldmVudCBzY3JvbGxpbmcgaW4gU2FmYXJpIG9uIGxhdGVzdCBpT1NcbiAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ5NTAwMzM5L2NhbnQtcHJldmVudC10b3VjaG1vdmUtZnJvbS1zY3JvbGxpbmctd2luZG93LW9uLWlvc1xuICAgICAgY29uc3QgdG91Y2hNb3ZlRXZlbnRDb25maWcgPSBwYXNzaXZlU3VwcG9ydGVkIFxuICAgICAgICA/IHsgcGFzc2l2ZTogZmFsc2UgfVxuICAgICAgICA6IGZhbHNlXG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpLCB0b3VjaE1vdmVFdmVudENvbmZpZylcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIFxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TY3JvbGxDbGljay5iaW5kKHRoaXMpKVxuXG4gICAgICBjb25zdCB3aGVlbEV2ZW50ID0gKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcih3aGVlbEV2ZW50LCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpXG5cbiAgICAgIHRoaXMuYmluZEFuY2hvcnNFdmVudHMoKVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmcgb24gbGlua3MgYW5kIGhhbmRsZSBmb2N1cyBldmVudFxuICAgICAgQXJyYXkuZnJvbShsaW5rTm9kZXMpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2tMaW5rLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5vbkZvY3VzLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHJlcmVuZGVyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgfSlcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgfSlcblxuXG4gICAgICBjb25zdCBzdGFydEFuaW1hdGlvbkhlbHBlciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSB0aGlzLmZpbmRDZW50cmFsTm9kZSgpXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID8gMTAwMCA6IDBcbiAgICAgICAgbGV0IGVuZHBvaW50XG4gICAgICAgIFxuICAgICAgICBpZiAoY2VudHJhbE5vZGUpIHtcbiAgICAgICAgICBlbmRwb2ludCA9IGNlbnRyYWxOb2RlLm9mZnNldExlZnQgXG4gICAgICAgICAgICAtICh3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aCAvIDIpIFxuICAgICAgICAgICAgKyAoY2VudHJhbE5vZGUub2Zmc2V0V2lkdGggLyAyKVxuXG4gICAgICAgICAgZW5kcG9pbnQgPSBNYXRoLm1pbihjZW50cmFsTm9kZS5vZmZzZXRMZWZ0LCBlbmRwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGVuZHBvaW50ID0gdGhpcy5jb25maWcuc3RhcnRcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2Nyb2xsVG8oZW5kcG9pbnQsIGFuaW1hdGlvbilcbiAgICAgIH1cblxuXG4gICAgICAvLyBjaGVjayBpZiBzY3JvbGxlciBpcyBpbiBoaWRkZW4gYmxvY2tcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gZWwgPT4gZWwub2Zmc2V0UGFyZW50ID09PSBudWxsXG5cbiAgICAgIGlmIChpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICAgIC8vIHRyaWdnZXJpbmcgcmVzaXplIGlzIG5vdCByZWxpYWJsZVxuICAgICAgICAgICAgLy8ganVzdCByZWNhbGMgdHdpY2VcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpXG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKVxuXG4gICAgICAgICAgICBzdGFydEFuaW1hdGlvbkhlbHBlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cblxuICAgICAgXG4gICAgICBzdGFydEFuaW1hdGlvbkhlbHBlcigpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgfVxuXG5cbiAgICBiaW5kQW5jaG9yc0V2ZW50cygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgQXJyYXkuZnJvbShhbmNob3JzTm9kZXMpLmZvckVhY2goYW5jaG9yTm9kZSA9PiB7XG4gICAgICAgIGFuY2hvck5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQW5jaG9yQ2xpY2suYmluZCh0aGlzKSlcbiAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnVzZU91dGVySHRtbCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHByZXZIdG1sID0gcm9vdE5vZGUuaW5uZXJIVE1MXG4gICAgICBjb25zdCB3cmFwcGVySHRtbCA9IGA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXdyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tbGVmdFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWJvcmRlciAke3ByZWZpeH0tYm9yZGVyLS1yaWdodFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXN0cmlwXCI+JHtwcmV2SHRtbH08L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXNjcm9sbHdyYXBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXNjcm9sbGJhclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JzXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5gXG5cbiAgICAgIHJvb3ROb2RlLmlubmVySFRNTCA9IHdyYXBwZXJIdG1sXG4gICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCBwcmVmaXgpXG4gICAgfVxuXG4gICAgd3JhcEl0ZW1zKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIEFycmF5LmZyb20oZ2V0Q2hpbGRyZW4od3JhcHBlck5vZGUpKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgaWYgKHVzZU91dGVySHRtbCkge1xuICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoaXRlbU5vZGUsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc3QgaXRlbVdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICAgIGl0ZW1XcmFwcGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICAgIGl0ZW1Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW1XcmFwcGVyLCBpdGVtTm9kZSlcbiAgICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGZpbmRDZW50cmFsTm9kZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBjZW50cmFsTm9kZXMgPSBnZXRFbGVtZW50cyhgW2RhdGEtY2VudHJhbD1cInRydWVcIl1gLCByb290Tm9kZSlcbiAgICAgIHJldHVybiBjZW50cmFsTm9kZXMgJiYgY2VudHJhbE5vZGVzLmxlbmd0aCBcbiAgICAgICAgPyBjZW50cmFsTm9kZXNbY2VudHJhbE5vZGVzLmxlbmd0aCAtIDFdLmNsb3Nlc3QoYC4ke3ByZWZpeH0taXRlbWApXG4gICAgICAgIDogbnVsbFxuICAgIH1cblxuICAgIHJlbW92ZUFuY2hvcnMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGFuY1dyYXBwZXJOb2RlLmlubmVySFRNTCA9ICcnXG4gICAgfVxuXG4gICAgY3JlYXRlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHVzZU91dGVySHRtbCA9IHRoaXMuY29uZmlnLnVzZU91dGVySHRtbFxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGxldCBhbmNob3JzSHRtbCA9ICcnLCBjb3VudGVyID0gMFxuXG4gICAgICBBcnJheS5mcm9tKGdldENoaWxkcmVuKHdyYXBwZXJOb2RlKSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB1c2VPdXRlckh0bWwgXG4gICAgICAgICAgPyBpdGVtTm9kZVxuICAgICAgICAgIDogZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yXScsIGl0ZW1Ob2RlKVxuXG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSB0YXJnZXROb2RlIFxuICAgICAgICAgID8gdGFyZ2V0Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yJylcbiAgICAgICAgICA6ICcnXG5cbiAgICAgICAgYW5jaG9yc0h0bWwgKz0gYDxzcGFuIGRhdGEtYW5jaG9yaWQ9XCIke2NvdW50ZXJ9XCIgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yXCI+PHNwYW4+JHthbmNob3JUZXh0fTwvc3Bhbj48L3NwYW4+YFxuICAgICAgICBpdGVtTm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yb3JpZ2luaWQnLCBjb3VudGVyKVxuICAgICAgICBjb3VudGVyKytcbiAgICAgIH0pXG5cbiAgICAgIGFuY1dyYXBwZXJOb2RlLmlubmVySFRNTCA9IGFuY2hvcnNIdG1sXG4gICAgfVxuXG4gICAgc2V0U2l6ZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS13cmFwcGVyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgbWF4SGVpZ2h0ID0gMCwgc3VtV2lkdGggPSAwXG5cbiAgICAgIHJvb3ROb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHN0cmlwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICB3cmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGxiYXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHNjcm9sbHdyYXBOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50SGVpZ2h0ID0gaXRlbU5vZGUub2Zmc2V0SGVpZ2h0XG4gICAgICAgIGlmIChjdXJyZW50SGVpZ2h0ID4gbWF4SGVpZ2h0KSBtYXhIZWlnaHQgPSBjdXJyZW50SGVpZ2h0XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcFdpZHRoID0gc2Nyb2xsd3JhcE5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICAvLyBvdGhlcndpc2Ugd2lsbCBiZSBOYU5cbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHNjcm9sbHdyYXBXaWR0aCAhPT0gMCAmJiBzdW1XaWR0aCAhPT0gMCBcbiAgICAgICAgPyBzY3JvbGx3cmFwV2lkdGggLyBzdW1XaWR0aFxuICAgICAgICA6IDFcblxuICAgICAgLy8gaWYgc2NyZWVuIGlzIHdpZGVyIHRoYW4gc2Nyb2xsZXIsIHJlc2V0IHRyYW5zZm9ybWF0aW9uc1xuICAgICAgaWYgKHNjcm9sbGJhckZhY3RvciA+PSAxKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY2JTY3JvbGxlZCcsIDApXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIDApXG4gICAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gTWF0aC5taW4odGhpcy5nZXQoJ3Njcm9sbGVkJyksIGxpbWl0UmlnaHQpXG4gICAgICBjb25zdCBzY2JTY3JvbGxlZCA9IHNjcm9sbGVkICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHJvb3ROb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcbiAgICAgIHdyYXBwZXJOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHNjcm9sbGJhck5vZGUuc3R5bGUud2lkdGggPSAod3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKSArICdweCdcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiBzY3JvbGxlZClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjYlNjcm9sbGVkKVxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBsaW1pdFJpZ2h0KVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhckZhY3RvcicsIHNjcm9sbGJhckZhY3RvcilcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJXaWR0aCcsIHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcilcbiAgICB9XG5cbiAgICBjaGVja1Njcm9sbGFibGUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGxldCBzdW1XaWR0aCA9IDAsIHdyYXBwZXJXaWR0aCA9IHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoXG5cbiAgICAgIEFycmF5LmZyb20oaXRlbU5vZGVzKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgc3VtV2lkdGggKz0gaXRlbU5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIH0pXG5cbiAgICAgIGlmICh3cmFwcGVyV2lkdGggPj0gc3VtV2lkdGgpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGFibGUnLCBmYWxzZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDogJHtzdW1XaWR0aH1weGApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGFibGUnLCB0cnVlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCAnaXMtbm90LXNjcm9sbGFibGUnKVxuICAgICAgICBhbmNXcmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYHdpZHRoOmF1dG9gKVxuICAgICAgfVxuICAgIH1cblxuICAgIF91cGRhdGUoKSB7XG4gICAgICBjb25zdCB1c2VPdXRlckh0bWwgPSB0aGlzLmNvbmZpZy51c2VPdXRlckh0bWxcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcicpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vQW5jaG9ycykgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG5cbiAgICAgIGlmICh1c2VPdXRlckh0bWwpIHtcbiAgICAgICAgdGhpcy53cmFwSXRlbXMoKVxuICAgICAgICB0aGlzLnJlbW92ZUFuY2hvcnMoKVxuICAgICAgICB0aGlzLmNyZWF0ZUFuY2hvcnMoKVxuICAgICAgICB0aGlzLmJpbmRBbmNob3JzRXZlbnRzKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcblxuICAgICAgaWYgKCF0aGlzLmNvbmZpZy5ub1Njcm9sbGJhcikge1xuICAgICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgc2Nyb2xsZWQsIDApXG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tFbGVtZW50KGUpIHtcbiAgICAgIHJldHVybiBlLnRhcmdldC5jbG9zZXN0KGAuJHt0aGlzLmNvbmZpZy5wcmVmaXh9YCkgPT0gdGhpcy5zdGF0ZS5lbFxuICAgIH1cblxuXG4gICAgb25Qb2ludGVyRG93bihlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgdGhpcy5oYW5kbGVUb3VjaFN0YXJ0KGUpXG4gICAgICBcbiAgICAgIGNvbnN0IHRvY2hFdmVudCA9IGlzVG91Y2hFdmVudChlKVxuICAgICAgaWYgKCF0b2NoRXZlbnQpIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKCF0b2NoRXZlbnQgJiYgIWlzTGVmdEJ1dHRvbkNsaWNrKGUpKSByZXR1cm5cblxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnZG93bkV2ZW50VFMnLCBEYXRlLm5vdygpKVxuXG4gICAgICBjb25zdCBkaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkJykgKyBnZXRFdmVudFgoZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZERpZmYnLCBkaWZmKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGdldEVsZW1lbnQoJ2h0bWwnKSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgb25Qb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIFxuICAgICAgdGhpcy5oYW5kbGVUb3VjaE1vdmUoZSlcbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PT0gJ3YnKSByZXR1cm5cbiAgICAgIFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkRGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZERpZmYnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICAvLyBkcmFnIHRvIGxlZnQgaXMgcG9zaXRpdmUgbnVtYmVyXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGxldCByZXN1bHQgPSBzY3JvbGxlZERpZmYgLSBjdXJyZW50UGFnZVhcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBsZXQgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG4gICAgICBsZXQgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuXG4gICAgICBpZiAocmVzdWx0IDwgbGltaXRMZWZ0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCArPSBNYXRoLnJvdW5kKDAuMiAqIHNjcm9sbGJhclJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyUmVzdWx0ID0gMFxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoIC09IE1hdGgucm91bmQoMC44ICogKHJlc3VsdCAtIGxpbWl0UmlnaHQpICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgICB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIERhdGUubm93KCkpXG4gICAgICB0aGlzLnB1c2goJ3BhZ2VYJywgY3VycmVudFBhZ2VYKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgaWYgKHRoaXMuZ2V0KCdzd2lwZURpcmVjdGlvbicpID09PSAndicpIHtcbiAgICAgICAgdGhpcy5jbGVhclBvaW50ZXJTdGF0ZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKGdldEVsZW1lbnQoJ2h0bWwnKSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBsYXN0UGFnZVggPSB0aGlzLmdldExhc3RNZWFuaW5nZnVsbCgncGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudEV2ZW50WCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3QgZGlzdGFuY2VEZWx0YSA9IGN1cnJlbnRFdmVudFggLSBsYXN0UGFnZVhcblxuICAgICAgY29uc3Qgbm93VFMgPSBEYXRlLm5vdygpXG4gICAgICBjb25zdCB0aW1lRnJvbUxhc3RNb3ZlID0gKG5vd1RTIC0gdGhpcy5nZXQoJ21vdmVFdmVudFRTJykpIC8gMS41XG4gICAgICBjb25zdCB0aW1lRnJvbVBvaW50ZXJEb3duID0gbm93VFMgLSB0aGlzLmdldCgnZG93bkV2ZW50VFMnKVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogOClcblxuICAgICAgY29uc3QgaXNDbGljayA9IGxhc3RQYWdlWCA9PT0gMCAmJiB0aW1lRnJvbVBvaW50ZXJEb3duIDwgMTUwXG4gICAgICBjb25zdCBpc0xvbmdDbGljayA9IGxhc3RQYWdlWCA9PT0gMFxuXG4gICAgICAvLyBzaW1wbGUgY2xpY2tcbiAgICAgIGlmIChpc0NsaWNrKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5vbkNsaWNrKSByZXR1cm4gdGhpcy5jb25maWcub25DbGljayhlKVxuXG4gICAgICAgIGNvbnN0IGxpbmtOb2RlID0gZS50YXJnZXQuY2xvc2VzdCgnYScpXG4gICAgICAgIGlmICghbGlua05vZGUpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgndGFyZ2V0JylcbiAgICAgICAgY29uc3QgaHJlZiA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICAgIGNvbnN0IGN0cmxDbGljayA9IGlzQ29udHJvbENsaWNrKGUpXG5cbiAgICAgICAgaWYgKGN0cmxDbGljaykgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICAgIGlmICghdGFyZ2V0ICYmIGhyZWYpIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWZcbiAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKCdibGFuaycpID4gLTEgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICB9XG5cbiAgICAgIC8vIGxvbmcgY2xpY2sgd2l0aCBubyBtb3Rpb25cbiAgICAgIGlmIChpc0xvbmdDbGljaykgcmV0dXJuXG5cbiAgICAgIC8vIGRyYWdnaW5nXG4gICAgICAvLyBzdGlja3kgbGVmdFxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byBsZWZ0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwKVxuICAgICAgLy8gc3RpY2t5IHJpZ2h0XG4gICAgICBlbHNlIGlmIChzY3JvbGxlZCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byByaWdodFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwKVxuICAgICAgLy8gb3RoZXJ3aXNlXG4gICAgICBlbHNlIGlmICh0aW1lRnJvbUxhc3RNb3ZlIDwgMTUwICYmIE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpID4gMikge1xuICAgICAgICBjb25zdCB0aW1lVG9FbmRwb2ludCA9IE1hdGgucm91bmQoTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgLyB0aW1lRnJvbUxhc3RNb3ZlKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIE1hdGgucm91bmQoZW5kcG9pbnQpLCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkNsaWNrTGluayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gZVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25Gb2N1cyhlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICBcbiAgICAgIC8vIGZvY3VzIHJlc29sdmUsIHNlZTogXG4gICAgICAvLyBodHRwOi8vd2QuZGl6YWluYS5uZXQvZW4vaW50ZXJuZXQtbWFpbnRlbmFuY2UvanMtc2xpZGVycy1hbmQtdGhlLXRhYi1rZXkvXG4gICAgICByb290Tm9kZS5zY3JvbGxMZWZ0ID0gMFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7cm9vdE5vZGUuc2Nyb2xsTGVmdCA9IDB9LCAwKVxuXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZS50YXJnZXQuY2xvc2VzdChgLiR7cHJlZml4fS1pdGVtYClcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBcbiAgICAvLyBjaGVjayBpZiBlbnRlciBpcyBwcmVzc2VkXG4gICAgb25LZXlEb3duKGUpIHtcbiAgICAgIGlmICghZS5rZXlDb2RlIHx8IGUua2V5Q29kZSAhPT0gMTMpIHJldHVyblxuICAgICAgY29uc3QgY3RybENsaWNrID0gaXNDb250cm9sQ2xpY2soZSlcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICAgIGlmIChjdHJsQ2xpY2spIHdpbmRvdy5vcGVuKGxvY2F0aW9uLCAnX2JsYW5rJywge30pXG4gICAgICBlbHNlIHdpbmRvdy5sb2NhdGlvbiA9IGxvY2F0aW9uXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFlLmRlbHRhWCB8fCBNYXRoLmFicyhlLmRlbHRhWSkgPiBNYXRoLmFicyhlLmRlbHRhWCkgfHwgICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHtkZWx0YVh9ID0gZVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmVzdWx0ID0gTWF0aC5taW4oTWF0aC5tYXgodGhpcy5nZXQoJ3Njcm9sbGVkJykgKyBkZWx0YVgsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuXG4gICAgICBpZiAocmVzdWx0ID09IGxpbWl0UmlnaHQpIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIFxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIHRydWUpXG5cbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3Qgc2Nyb2xsQ2xpY2tEaXNhYmxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJylcblxuICAgICAgaWYgKHNjcm9sbENsaWNrRGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCBmYWxzZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhZS5wcmV2ZW50RGVmYXVsdCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qgc2NiV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gbGltaXRSaWdodCAqIHNjYkZhY3RvclxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBwYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3QgY2VudGVyID0gcGFnZVggLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IGxlZnRFZGdlID0gY2VudGVyIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCByaWdodEVkZ2UgPSBjZW50ZXIgKyBzY2JXaWR0aCAvIDJcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gY2VudGVyIC8gc2NiRmFjdG9yXG4gICAgICBpZiAobGVmdEVkZ2UgPCBsaW1pdExlZnQpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChyaWdodEVkZ2UgPiByaWdodFNjYkxpbWl0KSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcblxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFxuICAgIG9uQW5jaG9yQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS50YXJnZXQgfHwgIXNjcm9sbGFibGUpIHJldHVybiBcbiAgICAgIFxuICAgICAgY29uc3QgYW5jaG9yaWQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hbmNob3JpZF0nKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yaWQnKVxuICAgICAgaWYgKCFhbmNob3JpZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yb3JpZ2luaWQ9XCInICsgYW5jaG9yaWQgKyAnXCJdJywgcm9vdE5vZGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KGUpICYmICFpc0xlZnRCdXR0b25DbGljayhlKSkgcmV0dXJuXG4gICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnLCBjdXJyZW50UGFnZVggLSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvcilcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckRvd25QYWdlWCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGRlbHRhID0gKGN1cnJlbnRQYWdlWCAtIHNjcm9sbGJhckRvd25QYWdlWClcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KGRlbHRhIC8gc2Nyb2xsYmFyRmFjdG9yLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBoYW5kbGVUb3VjaFN0YXJ0KGUpIHtcbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KGUpKSByZXR1cm5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFgpXG4gICAgICB0aGlzLnNldCgndG91Y2hZJywgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5jbGllbnRZKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHRvdWNoWCA9IHRoaXMuZ2V0KCd0b3VjaFgnKVxuICAgICAgY29uc3QgdG91Y2hZID0gdGhpcy5nZXQoJ3RvdWNoWScpXG4gICAgICBpZiAoIXRvdWNoWCB8fCAhdG91Y2hZIHx8ICFpc1RvdWNoRXZlbnQoZSkpIHJldHVyblxuXG4gICAgICBjb25zdCB4VXAgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFhcbiAgICAgIGNvbnN0IHlVcCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WVxuXG4gICAgICBjb25zdCB4RGlmZiA9IHRvdWNoWCAtIHhVcFxuICAgICAgY29uc3QgeURpZmYgPSB0b3VjaFkgLSB5VXBcblxuICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSkgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ2gnKVxuICAgICAgZWxzZSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAndicpXG5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCAwKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cblxuICAgIGFuaW1hdGUoc3RhcnQsIHN0b3A9MCwgc3BlZWQ9MTAsIGFuaW1hdGVXaWR0aD1mYWxzZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSBzdG9wIC0gc3RhcnRcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1heCguMDUsIE1hdGgubWluKE1hdGguYWJzKGRlbHRhKSAvIHNwZWVkLCAxKSlcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JykgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGxldCBjdXJyZW50VGltZSA9IHNwZWVkID09IDAgPyAxIDogMCxcbiAgICAgICAgICBlbmRwb2ludCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpLFxuICAgICAgICAgIHNjYkVuZHBvaW50ID0gZW5kcG9pbnQgKiBzY2JGYWN0b3JcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdwb2ludGVyRG93bicpIHx8IHRoaXMuZ2V0KCdtb3VzZVNjcm9sbCcpKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICBlbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpXG4gICAgICAgICAgOiBzdG9wXG5cbiAgICAgICAgc2NiRW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICogc2NiRmFjdG9yICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSAqIHNjYkZhY3RvclxuICAgICAgICAgIDogc3RvcCAqIHNjYkZhY3RvclxuICAgICAgICBcbiAgICAgICAgc2NiRW5kcG9pbnQgPSBNYXRoLm1pbihzY2JFbmRwb2ludCwgcmlnaHRTY2JMaW1pdClcblxuICAgICAgICBpZiAoIWFuaW1hdGVXaWR0aCkge1xuICAgICAgICAgIGlmIChzY2JFbmRwb2ludCA+PSByaWdodFNjYkxpbWl0KSB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgICAgZWxzZSB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgICAgIHRoaXMuc2V0U2NiUG9zKHNjYkVuZHBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBzY2J3ID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgICAgICBpZiAoc3RhcnQgPCBzdG9wKSBzY2J3IC09IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcbiAgICAgICAgICBlbHNlIHNjYncgKz0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuXG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChzY2J3KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3MoLTEgKiBlbmRwb2ludClcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgZW5kcG9pbnQpXG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIDwgMSkgcmFmKHRpY2spXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGljaygpXG4gICAgfVxuXG4gICAgY2hlY2tCb3JkZXJWaXNpYmlsaXR5KCkge1xuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPiBsaW1pdExlZnQpIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRSaWdodCkge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvLyBwdWJsaWMgQVBJXG4gICAgc2Nyb2xsVG8ocG9pbnQsIHRpbWU9MTAwMCkge1xuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgbGV0IGVuZHBvaW50ID0gIWlzTmFOKHBvaW50KSA/IHBhcnNlSW50KHBvaW50KSA6IDBcbiAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgoZW5kcG9pbnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGlmIChwb2ludCA9PSAnZW5kJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnc3RhcnQnKSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ2NlbnRlcicpIGVuZHBvaW50ID0gbGltaXRSaWdodCAvIDJcblxuICAgICAgdGhpcy5hbmltYXRlKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBlbmRwb2ludCwgdGltZSlcbiAgICB9XG5cbiAgICB1cGRhdGUoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPXRoaXMuY29uZmlnLmFsaWduLFxuICAgICAgICBub0FuY2hvcnM9dGhpcy5jb25maWcubm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcj10aGlzLmNvbmZpZy5ub1Njcm9sbGJhcixcbiAgICAgICAgc2Nyb2xsYmFyLFxuICAgICAgICBhbmNob3JzLFxuICAgICAgICBvbkNsaWNrPXRoaXMuY29uZmlnLm9uQ2xpY2ssXG4gICAgICAgIHN0YXJ0PXRoaXMuY29uZmlnLnN0YXJ0LFxuICAgICAgICBzdGFydEFuaW1hdGlvbj10aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvblxuICAgICAgfSA9IGNvbmZpZ1xuXG4gICAgICB0aGlzLmNvbmZpZy5hbGlnbiA9IGFsaWduXG4gICAgICB0aGlzLmNvbmZpZy5ub0FuY2hvcnMgPSAhbm9BbmNob3JzIFxuICAgICAgICA/IGFuY2hvcnMgPT0gJ2hpZGRlbicgXG4gICAgICAgIDogYW5jaG9ycyAhPSAndmlzaWJsZSdcblxuICAgICAgdGhpcy5jb25maWcubm9TY3JvbGxiYXIgPSAhbm9TY3JvbGxiYXJcbiAgICAgICAgPyBzY3JvbGxiYXIgPT0gJ2hpZGRlbicgXG4gICAgICAgIDogc2Nyb2xsYmFyICE9ICd2aXNpYmxlJ1xuXG4gICAgICB0aGlzLmNvbmZpZy5vbkNsaWNrID0gb25DbGlja1xuICAgICAgdGhpcy5jb25maWcuc3RhcnQgPSBzdGFydFxuICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltYXRpb24gPSBzdGFydEFuaW1hdGlvblxuXG4gICAgICB0aGlzLl91cGRhdGUoKVxuICAgIH1cbiAgfVxuXG5cblxuICAvLyBpbml0IGNvbmZpZ1xuICBjb25zdCBhdXRvaW5pdCA9ICgpID0+IHtcbiAgICBjb25zdCBlbHMgPSBnZXRFbGVtZW50cygnLnNjcm9sbGVyJylcbiAgICBBcnJheS5mcm9tKGVscykuZm9yRWFjaChlbCA9PiB7XG4gICAgICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBhdXRvaW5pdClcblxuICBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gJ2ludGVyYWN0aXZlJykgYXV0b2luaXQoKVxuICB9XG5cbiAgd2luZG93LlNjcm9sbGVyID0gU2Nyb2xsZXJcbn0oKSkiLCJtb2R1bGUuZXhwb3J0cyA9ICh0eXBlb2YgQXJyYXkuZnJvbSA9PT0gJ2Z1bmN0aW9uJyA/XG4gIEFycmF5LmZyb20gOlxuICByZXF1aXJlKCcuL3BvbHlmaWxsJylcbik7XG4iLCIvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1hcnJheS5mcm9tXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbihmbikge1xuICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7XG4gIH07XG4gIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gMDsgfVxuICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHsgcmV0dXJuIG51bWJlcjsgfVxuICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICB9O1xuICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xuICB9O1xuICB2YXIgaXRlcmF0b3JQcm9wID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZih2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBpZihbJ3N0cmluZycsJ251bWJlcicsJ2Jvb2xlYW4nLCdzeW1ib2wnXS5pbmRleE9mKHR5cGVvZiB2YWx1ZSkgPiAtMSl7XG4gICAgICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICgnaXRlcmF0b3InIGluIFN5bWJvbCkgJiZcbiAgICAgICAgKFN5bWJvbC5pdGVyYXRvciBpbiB2YWx1ZSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfVxuICAgICAgLy8gU3VwcG9ydCBcIkBAaXRlcmF0b3JcIiBwbGFjZWhvbGRlciwgR2Vja28gMjcgdG8gR2Vja28gMzVcbiAgICAgIGVsc2UgaWYgKCdAQGl0ZXJhdG9yJyBpbiB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gJ0BAaXRlcmF0b3InO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKE8sIFApIHtcbiAgICAvLyBBc3NlcnQ6IElzUHJvcGVydHlLZXkoUCkgaXMgdHJ1ZS5cbiAgICBpZiAoTyAhPSBudWxsICYmIFAgIT0gbnVsbCkge1xuICAgICAgLy8gTGV0IGZ1bmMgYmUgR2V0VihPLCBQKS5cbiAgICAgIHZhciBmdW5jID0gT1tQXTtcbiAgICAgIC8vIFJldHVybklmQWJydXB0KGZ1bmMpLlxuICAgICAgLy8gSWYgZnVuYyBpcyBlaXRoZXIgdW5kZWZpbmVkIG9yIG51bGwsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZihmdW5jID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIC8vIElmIElzQ2FsbGFibGUoZnVuYykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZ1bmMgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuYztcbiAgICB9XG4gIH07XG4gIHZhciBpdGVyYXRvclN0ZXAgPSBmdW5jdGlvbihpdGVyYXRvcikge1xuICAgIC8vIExldCByZXN1bHQgYmUgSXRlcmF0b3JOZXh0KGl0ZXJhdG9yKS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChyZXN1bHQpLlxuICAgIHZhciByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgLy8gTGV0IGRvbmUgYmUgSXRlcmF0b3JDb21wbGV0ZShyZXN1bHQpLlxuICAgIC8vIFJldHVybklmQWJydXB0KGRvbmUpLlxuICAgIHZhciBkb25lID0gQm9vbGVhbihyZXN1bHQuZG9uZSk7XG4gICAgLy8gSWYgZG9uZSBpcyB0cnVlLCByZXR1cm4gZmFsc2UuXG4gICAgaWYoZG9uZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oaXRlbXMgLyosIG1hcEZuLCB0aGlzQXJnICovICkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgIHZhciBDID0gdGhpcztcblxuICAgIC8vIDIuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG5cbiAgICB2YXIgVDtcbiAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gMy4gZWxzZVxuICAgICAgLy8gICBhLiBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbidcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gICBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVFxuICAgICAgLy8gICAgICBiZSB1bmRlZmluZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cbiAgICAgIC8vICAgYy4gTGV0IG1hcHBpbmcgYmUgdHJ1ZSAoaW1wbGllZCBieSBtYXBGbilcbiAgICB9XG5cbiAgICB2YXIgQSwgaztcblxuICAgIC8vIDQuIExldCB1c2luZ0l0ZXJhdG9yIGJlIEdldE1ldGhvZChpdGVtcywgQEBpdGVyYXRvcikuXG4gICAgLy8gNS4gUmV0dXJuSWZBYnJ1cHQodXNpbmdJdGVyYXRvcikuXG4gICAgdmFyIHVzaW5nSXRlcmF0b3IgPSBnZXRNZXRob2QoaXRlbXMsIGl0ZXJhdG9yUHJvcChpdGVtcykpO1xuXG4gICAgLy8gNi4gSWYgdXNpbmdJdGVyYXRvciBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHVzaW5nSXRlcmF0b3IgIT09IHZvaWQgMCkge1xuICAgICAgLy8gYS4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAgIGkuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXVxuICAgICAgLy8gICAgICBpbnRlcm5hbCBtZXRob2Qgb2YgQyB3aXRoIGFuIGVtcHR5IGFyZ3VtZW50IGxpc3QuXG4gICAgICAvLyBiLiBFbHNlLFxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIHRoZSBhYnN0cmFjdCBvcGVyYXRpb24gQXJyYXlDcmVhdGVcbiAgICAgIC8vICAgICAgd2l0aCBhcmd1bWVudCAwLlxuICAgICAgLy8gYy4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQygpKSA6IFtdO1xuXG4gICAgICAvLyBkLiBMZXQgaXRlcmF0b3IgYmUgR2V0SXRlcmF0b3IoaXRlbXMsIHVzaW5nSXRlcmF0b3IpLlxuICAgICAgdmFyIGl0ZXJhdG9yID0gdXNpbmdJdGVyYXRvci5jYWxsKGl0ZW1zKTtcblxuICAgICAgLy8gZS4gUmV0dXJuSWZBYnJ1cHQoaXRlcmF0b3IpLlxuICAgICAgaWYgKGl0ZXJhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZi4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuXG4gICAgICAvLyBnLiBSZXBlYXRcbiAgICAgIHZhciBuZXh0LCBuZXh0VmFsdWU7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAvLyBpLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgIC8vIGlpLiBMZXQgbmV4dCBiZSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpLlxuICAgICAgICAvLyBpaWkuIFJldHVybklmQWJydXB0KG5leHQpLlxuICAgICAgICBuZXh0ID0gaXRlcmF0b3JTdGVwKGl0ZXJhdG9yKTtcblxuICAgICAgICAvLyBpdi4gSWYgbmV4dCBpcyBmYWxzZSwgdGhlblxuICAgICAgICBpZiAoIW5leHQpIHtcblxuICAgICAgICAgIC8vIDEuIExldCBzZXRTdGF0dXMgYmUgU2V0KEEsIFwibGVuZ3RoXCIsIGssIHRydWUpLlxuICAgICAgICAgIC8vIDIuIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICAgICAgQS5sZW5ndGggPSBrO1xuXG4gICAgICAgICAgLy8gMy4gUmV0dXJuIEEuXG4gICAgICAgICAgcmV0dXJuIEE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdi4gTGV0IG5leHRWYWx1ZSBiZSBJdGVyYXRvclZhbHVlKG5leHQpLlxuICAgICAgICAvLyB2aS4gUmV0dXJuSWZBYnJ1cHQobmV4dFZhbHVlKVxuICAgICAgICBuZXh0VmFsdWUgPSBuZXh0LnZhbHVlO1xuXG4gICAgICAgIC8vIHZpaS4gSWYgbWFwcGluZyBpcyB0cnVlLCB0aGVuXG4gICAgICAgIC8vICAgMS4gTGV0IG1hcHBlZFZhbHVlIGJlIENhbGwobWFwZm4sIFQsIMKrbmV4dFZhbHVlLCBrwrspLlxuICAgICAgICAvLyAgIDIuIElmIG1hcHBlZFZhbHVlIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vICAgMy4gTGV0IG1hcHBlZFZhbHVlIGJlIG1hcHBlZFZhbHVlLltbdmFsdWVdXS5cbiAgICAgICAgLy8gdmlpaS4gRWxzZSwgbGV0IG1hcHBlZFZhbHVlIGJlIG5leHRWYWx1ZS5cbiAgICAgICAgLy8gaXguICBMZXQgZGVmaW5lU3RhdHVzIGJlIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgLy8gICAgICBDcmVhdGVEYXRhUHJvcGVydHlPclRocm93KEEsIFBrLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vIHguIFtUT0RPXSBJZiBkZWZpbmVTdGF0dXMgaXMgYW4gYWJydXB0IGNvbXBsZXRpb24sIHJldHVyblxuICAgICAgICAvLyAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBkZWZpbmVTdGF0dXMpLlxuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gbWFwRm4uY2FsbChULCBuZXh0VmFsdWUsIGspO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIEFba10gPSBuZXh0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8geGkuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgICAgaysrO1xuICAgICAgfVxuICAgICAgLy8gNy4gQXNzZXJ0OiBpdGVtcyBpcyBub3QgYW4gSXRlcmFibGUgc28gYXNzdW1lIGl0IGlzXG4gICAgICAvLyAgICBhbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyA4LiBMZXQgYXJyYXlMaWtlIGJlIFRvT2JqZWN0KGl0ZW1zKS5cbiAgICAgIHZhciBhcnJheUxpa2UgPSBPYmplY3QoaXRlbXMpO1xuXG4gICAgICAvLyA5LiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoaXRlbXMgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlbiBiZSBUb0xlbmd0aChHZXQoYXJyYXlMaWtlLCBcImxlbmd0aFwiKSkuXG4gICAgICAvLyAxMS4gUmV0dXJuSWZBYnJ1cHQobGVuKS5cbiAgICAgIHZhciBsZW4gPSB0b0xlbmd0aChhcnJheUxpa2UubGVuZ3RoKTtcblxuICAgICAgLy8gMTIuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIENvbnN0cnVjdChDLCDCq2xlbsK7KS5cbiAgICAgIC8vIDEzLiBFbHNlXG4gICAgICAvLyAgICAgYS4gTGV0IEEgYmUgQXJyYXlDcmVhdGUobGVuKS5cbiAgICAgIC8vIDE0LiBSZXR1cm5JZkFicnVwdChBKS5cbiAgICAgIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XG5cbiAgICAgIC8vIDE1LiBMZXQgayBiZSAwLlxuICAgICAgayA9IDA7XG4gICAgICAvLyAxNi4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGFycmF5TGlrZVtrXTtcbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDE3LiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgLy8gMTguIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICBBLmxlbmd0aCA9IGxlbjtcbiAgICAgIC8vIDE5LiBSZXR1cm4gQS5cbiAgICB9XG4gICAgcmV0dXJuIEE7XG4gIH07XG59KSgpO1xuIl19
