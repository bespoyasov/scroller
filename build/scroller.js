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

          var attrContent = targetNode ? targetNode.getAttribute('data-anchor') : '';
          var anchorText = attrContent || '';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7QUFFVjtBQUNBLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSOztBQUc5QjtBQUg4QixHQUk3QixVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FqQjZCLEVBaUIzQixDQUFDLFFBQVEsU0FBVCxFQUFvQixjQUFjLFNBQWxDLEVBQTZDLGFBQWEsU0FBMUQsQ0FqQjJCLENBQWI7O0FBb0JqQjtBQUNBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtBQUFBLFVBQW1ELEtBQUssSUFBeEQ7QUFDQSxhQUFPLE1BQU0sU0FBTixDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUEwQixPQUEx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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24oKSB7XG4gIFxuICAvLyBBcnJheS5mcm9tIHBvbHlmaWxsXG4gIGlmICghQXJyYXkuZnJvbSkgQXJyYXkuZnJvbSA9IHJlcXVpcmUoJ2FycmF5LWZyb20nKVxuICBcblxuICAvLyByZW1vdmUgcG9seWZpbGxcbiAgKGZ1bmN0aW9uIChhcnIpIHtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3JlbW92ZScpKSByZXR1cm5cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSkoW0VsZW1lbnQucHJvdG90eXBlLCBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSwgRG9jdW1lbnRUeXBlLnByb3RvdHlwZV0pXG5cblxuICAvLyBtYXRjaGVzIHBvbHlmaWxsXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIHRoID0gdGhpc1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zb21lLmNhbGwobWF0Y2hlcywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHJldHVybiBlID09PSB0aFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNsb3Nlc3QgcG9seWZpbGxcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uKGNzcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzXG5cbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLm1hdGNoZXMoY3NzKSkgcmV0dXJuIG5vZGVcbiAgICAgICAgZWxzZSBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cblxuICAvLyBwYXNzaXZlIGV2ZW50IGxpc3RlbmVycyBwb2x5ZmlsbFxuICBsZXQgcGFzc2l2ZVN1cHBvcnRlZCA9IGZhbHNlXG4gIFxuICB0cnkge1xuICAgIGxldCBvcHRpb25zID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcbiAgICAgIGdldDogKCkgPT4geyBwYXNzaXZlU3VwcG9ydGVkID0gdHJ1ZSB9XG4gICAgfSlcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0aW9ucylcbiAgfSBjYXRjaChlcnIpIHt9XG5cblxuICAvLyBoZWxwZXJzXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3I9JycsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZXMgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMgfHwgbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RXZlbnRYID0gZSA9PiB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWFxuICAgICAgfHwgZS50b3VjaGVzXG4gICAgICAgICYmIGUudG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS50b3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnBhZ2VYIFxuICAgICAgfHwgMFxuICB9XG5cbiAgY29uc3QgaXNDb250cm9sQ2xpY2sgPSBlID0+XG4gICAgZS5jdHJsS2V5IHx8IGUubWV0YUtleVxuXG4gIGNvbnN0IGlzTGVmdEJ1dHRvbkNsaWNrID0gZSA9PlxuICAgIGUud2hpY2ggPT09IDEgfHwgZS5idXR0b24gPT09IDBcblxuICBjb25zdCBpc1RvdWNoRXZlbnQgPSBlID0+XG4gICAgISFlLnRvdWNoZXMgfHwgISFlLmNoYW5nZWRUb3VjaGVzXG5cbiAgY29uc3QgZ2V0Q2hpbGRyZW4gPSAoZWwpID0+IHtcbiAgICBsZXQgY2hpbGROb2RlcyA9IGVsLmNoaWxkTm9kZXMsXG4gICAgICAgIGNoaWxkcmVuID0gW10sXG4gICAgICAgIGkgPSBjaGlsZE5vZGVzLmxlbmd0aFxuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT0gMSkgY2hpbGRyZW4udW5zaGlmdChjaGlsZE5vZGVzW2ldKVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZHJlblxuICB9XG5cbiAgY29uc3QgaXNBbmRyb2lkID0gKCkgPT4ge1xuICAgIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignYW5kcm9pZCcpID4gLTFcbiAgfVxuXG5cblxuICAvLyBzY3JvbGxlclxuICBjbGFzcyBTY3JvbGxlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPSdjZW50ZXInLFxuICAgICAgICBub0FuY2hvcnM9ZmFsc2UsXG4gICAgICAgIG5vU2Nyb2xsYmFyPWZhbHNlLFxuICAgICAgICBzY3JvbGxiYXI9J3Zpc2libGUnLFxuICAgICAgICBhbmNob3JzPSd2aXNpYmxlJyxcbiAgICAgICAgc3RhcnQ9MCxcbiAgICAgICAgc3RhcnRBbmltYXRpb249ZmFsc2UsXG4gICAgICAgIGVsLFxuICAgICAgICBvbkNsaWNrLFxuICAgICAgICB1c2VPdXRlckh0bWw9ZmFsc2UsXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgIC8vIG5vQW5jaG9ycywgbm9TY3JvbGxiYXIg4oCUIGxlZ2FjeVxuICAgICAgICBub0FuY2hvcnM6IGFuY2hvcnMgPT0gJ2hpZGRlbicgfHwgbm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcjogc2Nyb2xsYmFyID09ICdoaWRkZW4nIHx8IG5vU2Nyb2xsYmFyLFxuICAgICAgICBvbkNsaWNrOiBvbkNsaWNrLFxuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIHN0YXJ0QW5pbWF0aW9uOiBzdGFydEFuaW1hdGlvbixcblxuICAgICAgICBwcmVmaXg6ICdhYl9zY3JvbGxlcicsXG4gICAgICAgIGRyYWdnaW5nQ2xzbm06ICdpcy1kcmFnZ2luZycsXG4gICAgICAgIGxlZnRBbGlnbkNsc25tOiAnaXMtbGVmdC1hbGlnbicsXG4gICAgICAgIGJvcmRlclZzYmxDbHNubTogJ2lzLXZpc2libGUnLFxuICAgICAgICBub0FuY2hvcnNDbHNubTogJ2lzLW5vLWFuY2hvcnMnLFxuICAgICAgICBub1Njcm9sbGJhckNsc25tOiAnaXMtbm8tc2Nyb2xsYmFyJyxcblxuICAgICAgICAvLyBpZiB3ZSBkb24ndCBuZWVkIHRvIGNyZWF0ZSBtYXJrdXBcbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgcmVhY3QgY29tcG9uZW50IHdpbGwgcmVuZGVyIGh0bWwgYnkgaXRzZWxmXG4gICAgICAgIC8vIHNvIHdlIGp1c3QgdGFrZSBvdXRlciBtYXJrdXAgaW5zdGVhZFxuICAgICAgICB1c2VPdXRlckh0bWw6IHVzZU91dGVySHRtbCxcblxuICAgICAgICBlYXNpbmc6IHBvcyA9PiBwb3MgPT09IDEgPyAxIDogLU1hdGgucG93KDIsIC0xMCAqIHBvcykgKyAxLFxuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBzY3JvbGxlZDogMCxcbiAgICAgICAgc2Nyb2xsYWJsZTogdHJ1ZSxcblxuICAgICAgICBwb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIHNjcm9sbGJhclBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgbW91c2VTY3JvbGw6IGZhbHNlLFxuXG4gICAgICAgIHNjcm9sbGJhcldpZHRoOiAwLFxuICAgICAgICBzY3JvbGxiYXJGYWN0b3I6IDAsXG5cbiAgICAgICAgcGFnZVg6IFtdLFxuICAgICAgICBzY3JvbGxlZERpZmY6IDAsXG4gICAgICAgIGRvd25FdmVudFRTOiAwLFxuICAgICAgICBtb3ZlRXZlbnRUUzogMCxcblxuICAgICAgICBzY3JvbGxiYXJEb3duUGFnZVg6IDAsXG4gICAgICAgIHNjcm9sbENsaWNrRGlzYWJsZWQ6IGZhbHNlLFxuXG4gICAgICAgIGxpbWl0TGVmdDogMCxcbiAgICAgICAgbGltaXRSaWdodDogMCxcbiAgICAgICAgc3RyaXBXaWR0aDogMCxcblxuICAgICAgICBzd2lwZURpcmVjdGlvbjogbnVsbCxcbiAgICAgICAgdG91Y2hYOiAwLFxuICAgICAgICB0b3VjaFk6IDAsXG5cbiAgICAgICAgbGV0OiBlbC5oYXNDaGlsZE5vZGVzKCkgJiYgZ2V0Q2hpbGRyZW4oZWwpLmxlbmd0aCB8fCAwLFxuICAgICAgICBlbDogZWwgfHwgbnVsbCxcblxuICAgICAgICBpc0FuZHJvaWQ6IGlzQW5kcm9pZCgpXG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5yYWYgPSAoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtzZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApfVxuICAgICAgfSkoKVxuXG4gICAgICB0aGlzLmluaXQoZWwpXG4gICAgfVxuXG5cbiAgICBnZXQocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZih0aGlzLnN0YXRlW3Byb3BdKSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICAgIDogbnVsbFxuICAgIH1cblxuICAgIHNldChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgcHVzaChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSAmJiB0aGlzLnN0YXRlW3Byb3BdLnB1c2godmFsdWUpXG4gICAgfVxuXG4gICAgY2xlYXIocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBpZiAoZmllbGQgJiYgZmllbGQubGVuZ3RoKSBmaWVsZC5sZW5ndGggPSAwXG4gICAgfVxuXG4gICAgZ2V0TGFzdE1lYW5pbmdmdWxsKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgY29uc3QgdG9JZ25vcmUgPSBmaWVsZCAmJiBmaWVsZC5sZW5ndGggJiYgZmllbGQubGVuZ3RoID4gMyA/IDMgOiAxXG4gICAgICByZXR1cm4gZmllbGRbZmllbGQubGVuZ3RoIC0gdG9JZ25vcmVdIHx8IDBcbiAgICB9XG5cblxuICAgIGFkZENsYXNzKGVsLCBjbCkge1xuICAgICAgaWYgKCFuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NsKycoXFxcXHN8JCknKS50ZXN0KGVsLmNsYXNzTmFtZSkpIGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbFxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKGVsLCBjbCkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lXG4gICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxccyt8XiknK2NsKycoXFxcXHMrfCQpJywgJ2cnKSwgJyAnKVxuICAgICAgICAucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gICAgfVxuXG4gICAgYWxpZ25TY2JUb1JpZ2h0KCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsICdpcy1yaWdodCcpXG4gICAgfVxuXG4gICAgcmVsZWFzZVNjYigpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuXG4gICAgc2V0UG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFNjYlBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsLCBwb3MpXG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb24oZWwsIHBvcykge1xuICAgICAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgICBlbC5zdHlsZS5Nb3pUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUubXNUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUuT1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICB9XG5cbiAgICBzZXRXaWR0aCh3aWR0aCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIGVsLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgfVxuXG4gICAgY2xlYXJQb2ludGVyU3RhdGUoKSB7XG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCBudWxsKVxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGxpbmtOb2RlcyA9IGdldEVsZW1lbnRzKCdhJywgc3RyaXBOb2RlKVxuXG4gICAgICBjb25zdCBzY3JvbGxOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcblxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIC8vIGNvbmZpZ1xuICAgICAgaWYgKHRoaXMuY29uZmlnLmFsaWduICE9PSAnY2VudGVyJyBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRhbGlnbicpIFxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdEFsaWduJykgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0SWZXaWRlJykgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0aWZ3aWRlJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub0FuY2hvcnMgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JzJykgPT0gJ2hpZGRlbicgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub2FuY2hvcnMnKSBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vQW5jaG9ycycpKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9TY3JvbGxiYXIgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInKSA9PSAnaGlkZGVuJyBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vc2Nyb2xsYmFyJykgXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub1Njcm9sbGJhcicpKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChyb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKSkge1xuICAgICAgICB0aGlzLmNvbmZpZy5zdGFydCA9IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydCcpXG4gICAgICB9XG5cbiAgICAgIGlmIChyb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnRBbmltYXRpb24nKSBcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0YW5pbWF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltYXRpb24gPSB0cnVlXG4gICAgICB9XG5cblxuICAgICAgLy8gcGFzc2l2ZTogZmFsc2UgbmVlZGVkIHRvIHByZXZlbnQgc2Nyb2xsaW5nIGluIFNhZmFyaSBvbiBsYXRlc3QgaU9TXG4gICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80OTUwMDMzOS9jYW50LXByZXZlbnQtdG91Y2htb3ZlLWZyb20tc2Nyb2xsaW5nLXdpbmRvdy1vbi1pb3NcbiAgICAgIGNvbnN0IHRvdWNoTW92ZUV2ZW50Q29uZmlnID0gcGFzc2l2ZVN1cHBvcnRlZCBcbiAgICAgICAgPyB7IHBhc3NpdmU6IGZhbHNlIH1cbiAgICAgICAgOiBmYWxzZVxuXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSwgdG91Y2hNb3ZlRXZlbnRDb25maWcpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBzY3JvbGxiYXJOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG5cbiAgICAgIHNjcm9sbE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uU2Nyb2xsQ2xpY2suYmluZCh0aGlzKSlcblxuICAgICAgY29uc3Qgd2hlZWxFdmVudCA9ICgvRmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpID8gJ3doZWVsJyA6ICdtb3VzZXdoZWVsJ1xuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIod2hlZWxFdmVudCwgdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMpKVxuXG4gICAgICB0aGlzLmJpbmRBbmNob3JzRXZlbnRzKClcblxuICAgICAgLy8gcHJldmVudCBjbGlja25nIG9uIGxpbmtzIGFuZCBoYW5kbGUgZm9jdXMgZXZlbnRcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMub25Gb2N1cy5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24uYmluZCh0aGlzKSwgZmFsc2UpXG4gICAgICB9KVxuXG4gICAgICAvLyByZXJlbmRlclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGUgPT4ge1xuICAgICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cblxuICAgICAgY29uc3Qgc3RhcnRBbmltYXRpb25IZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNlbnRyYWxOb2RlID0gdGhpcy5maW5kQ2VudHJhbE5vZGUoKVxuICAgICAgICBjb25zdCBhbmltYXRpb24gPSB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA/IDEwMDAgOiAwXG4gICAgICAgIGxldCBlbmRwb2ludFxuICAgICAgICBcbiAgICAgICAgaWYgKGNlbnRyYWxOb2RlKSB7XG4gICAgICAgICAgZW5kcG9pbnQgPSBjZW50cmFsTm9kZS5vZmZzZXRMZWZ0IFxuICAgICAgICAgICAgLSAod3JhcHBlck5vZGUub2Zmc2V0V2lkdGggLyAyKSBcbiAgICAgICAgICAgICsgKGNlbnRyYWxOb2RlLm9mZnNldFdpZHRoIC8gMilcblxuICAgICAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oY2VudHJhbE5vZGUub2Zmc2V0TGVmdCwgZW5kcG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBlbmRwb2ludCA9IHRoaXMuY29uZmlnLnN0YXJ0XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNjcm9sbFRvKGVuZHBvaW50LCBhbmltYXRpb24pXG4gICAgICB9XG5cblxuICAgICAgLy8gY2hlY2sgaWYgc2Nyb2xsZXIgaXMgaW4gaGlkZGVuIGJsb2NrXG4gICAgICBjb25zdCBpc0hpZGRlbiA9IGVsID0+IGVsLm9mZnNldFBhcmVudCA9PT0gbnVsbFxuXG4gICAgICBpZiAoaXNIaWRkZW4ocm9vdE5vZGUpKSB7XG4gICAgICAgIGxldCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIGlmICghaXNIaWRkZW4ocm9vdE5vZGUpKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgICAgICAvLyB0cmlnZ2VyaW5nIHJlc2l6ZSBpcyBub3QgcmVsaWFibGVcbiAgICAgICAgICAgIC8vIGp1c3QgcmVjYWxjIHR3aWNlXG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKClcblxuICAgICAgICAgICAgc3RhcnRBbmltYXRpb25IZWxwZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApXG4gICAgICB9XG5cbiAgICAgIFxuICAgICAgc3RhcnRBbmltYXRpb25IZWxwZXIoKVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgIH1cblxuXG4gICAgYmluZEFuY2hvcnNFdmVudHMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuICAgIH1cblxuXG4gICAgY3JlYXRlV3JhcHBlcigpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VPdXRlckh0bWwpIHJldHVyblxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yc1wiPjwvZGl2PlxuICAgICAgPC9kaXY+YFxuXG4gICAgICByb290Tm9kZS5pbm5lckhUTUwgPSB3cmFwcGVySHRtbFxuICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgcHJlZml4KVxuICAgIH1cblxuICAgIHdyYXBJdGVtcygpIHtcbiAgICAgIGNvbnN0IHVzZU91dGVySHRtbCA9IHRoaXMuY29uZmlnLnVzZU91dGVySHRtbFxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBBcnJheS5mcm9tKGdldENoaWxkcmVuKHdyYXBwZXJOb2RlKSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGlmICh1c2VPdXRlckh0bWwpIHtcbiAgICAgICAgICB0aGlzLmFkZENsYXNzKGl0ZW1Ob2RlLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGl0ZW1XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICBpdGVtV3JhcHBlci5pbm5lckhUTUwgPSBpdGVtTm9kZS5vdXRlckhUTUxcbiAgICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgICBpdGVtTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpdGVtV3JhcHBlciwgaXRlbU5vZGUpXG4gICAgICAgICAgaXRlbU5vZGUucmVtb3ZlKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBmaW5kQ2VudHJhbE5vZGUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgY2VudHJhbE5vZGVzID0gZ2V0RWxlbWVudHMoYFtkYXRhLWNlbnRyYWw9XCJ0cnVlXCJdYCwgcm9vdE5vZGUpXG4gICAgICByZXR1cm4gY2VudHJhbE5vZGVzICYmIGNlbnRyYWxOb2Rlcy5sZW5ndGggXG4gICAgICAgID8gY2VudHJhbE5vZGVzW2NlbnRyYWxOb2Rlcy5sZW5ndGggLSAxXS5jbG9zZXN0KGAuJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICByZW1vdmVBbmNob3JzKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBhbmNXcmFwcGVyTm9kZS5pbm5lckhUTUwgPSAnJ1xuICAgIH1cblxuICAgIGNyZWF0ZUFuY2hvcnMoKSB7XG4gICAgICBjb25zdCB1c2VPdXRlckh0bWwgPSB0aGlzLmNvbmZpZy51c2VPdXRlckh0bWxcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgYW5jaG9yc0h0bWwgPSAnJywgY291bnRlciA9IDBcblxuICAgICAgQXJyYXkuZnJvbShnZXRDaGlsZHJlbih3cmFwcGVyTm9kZSkpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gdXNlT3V0ZXJIdG1sIFxuICAgICAgICAgID8gaXRlbU5vZGVcbiAgICAgICAgICA6IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcl0nLCBpdGVtTm9kZSlcblxuICAgICAgICBjb25zdCBhdHRyQ29udGVudCA9IHRhcmdldE5vZGUgPyB0YXJnZXROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKSA6ICcnXG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSBhdHRyQ29udGVudCB8fCAnJ1xuXG4gICAgICAgIGFuY2hvcnNIdG1sICs9IGA8c3BhbiBkYXRhLWFuY2hvcmlkPVwiJHtjb3VudGVyfVwiIGNsYXNzPVwiJHtwcmVmaXh9LWFuY2hvclwiPjxzcGFuPiR7YW5jaG9yVGV4dH08L3NwYW4+PC9zcGFuPmBcbiAgICAgICAgaXRlbU5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcm9yaWdpbmlkJywgY291bnRlcilcbiAgICAgICAgY291bnRlcisrXG4gICAgICB9KVxuXG4gICAgICBhbmNXcmFwcGVyTm9kZS5pbm5lckhUTUwgPSBhbmNob3JzSHRtbFxuICAgIH1cblxuICAgIHNldFNpemUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGx3cmFwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsd3JhcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICByb290Tm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzdHJpcE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgd3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc2Nyb2xsYmFyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGx3cmFwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG5cbiAgICAgIEFycmF5LmZyb20oaXRlbU5vZGVzKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGl0ZW1Ob2RlLm9mZnNldEhlaWdodFxuICAgICAgICBpZiAoY3VycmVudEhlaWdodCA+IG1heEhlaWdodCkgbWF4SGVpZ2h0ID0gY3VycmVudEhlaWdodFxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgY29uc3Qgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBXaWR0aCA9IHNjcm9sbHdyYXBOb2RlLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gc3VtV2lkdGggKyAxIC0gcm9vdE5vZGUub2Zmc2V0V2lkdGhcblxuICAgICAgLy8gb3RoZXJ3aXNlIHdpbGwgYmUgTmFOXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSBzY3JvbGx3cmFwV2lkdGggIT09IDAgJiYgc3VtV2lkdGggIT09IDAgXG4gICAgICAgID8gc2Nyb2xsd3JhcFdpZHRoIC8gc3VtV2lkdGhcbiAgICAgICAgOiAxXG5cbiAgICAgIC8vIGlmIHNjcmVlbiBpcyB3aWRlciB0aGFuIHNjcm9sbGVyLCByZXNldCB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgIGlmIChzY3JvbGxiYXJGYWN0b3IgPj0gMSkge1xuICAgICAgICB0aGlzLnNldCgnc2NiU2Nyb2xsZWQnLCAwKVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCAwKVxuICAgICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IE1hdGgubWluKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2NiU2Nyb2xsZWQgPSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICByb290Tm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLndpZHRoID0gKHN1bVdpZHRoICsgMSkgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzY3JvbGxiYXJOb2RlLnN0eWxlLndpZHRoID0gKHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcikgKyAncHgnXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogc2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY2JTY3JvbGxlZClcbiAgICAgIHRoaXMuc2V0KCdsaW1pdFJpZ2h0JywgbGltaXRSaWdodClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJGYWN0b3InLCBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyV2lkdGgnLCB3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgfVxuXG4gICAgY2hlY2tTY3JvbGxhYmxlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgc3VtV2lkdGggPSAwLCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBBcnJheS5mcm9tKGl0ZW1Ob2RlcykuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBpZiAod3JhcHBlcldpZHRoID49IHN1bVdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgZmFsc2UpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6ICR7c3VtV2lkdGh9cHhgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDphdXRvYClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAodGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub0FuY2hvcnMpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuXG4gICAgICBpZiAodXNlT3V0ZXJIdG1sKSB7XG4gICAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgICAgdGhpcy5yZW1vdmVBbmNob3JzKClcbiAgICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgICAgdGhpcy5iaW5kQW5jaG9yc0V2ZW50cygpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG5cbiAgICAgIGlmICghdGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIHNjcm9sbGVkLCAwKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRWxlbWVudChlKSB7XG4gICAgICByZXR1cm4gZS50YXJnZXQuY2xvc2VzdChgLiR7dGhpcy5jb25maWcucHJlZml4fWApID09IHRoaXMuc3RhdGUuZWxcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hTdGFydChlKVxuICAgICAgXG4gICAgICBjb25zdCB0b2NoRXZlbnQgPSBpc1RvdWNoRXZlbnQoZSlcbiAgICAgIGlmICghdG9jaEV2ZW50KSBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmICghdG9jaEV2ZW50ICYmICFpc0xlZnRCdXR0b25DbGljayhlKSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ2Rvd25FdmVudFRTJywgRGF0ZS5ub3coKSlcblxuICAgICAgY29uc3QgZGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZ2V0RXZlbnRYKGUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWREaWZmJywgZGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIG9uUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBcbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hNb3ZlKGUpXG4gICAgICBpZiAodGhpcy5nZXQoJ3N3aXBlRGlyZWN0aW9uJykgPT09ICd2JykgcmV0dXJuXG4gICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgbGV0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuICAgICAgbGV0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggKz0gTWF0aC5yb3VuZCgwLjIgKiBzY3JvbGxiYXJSZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhclJlc3VsdCA9IDBcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJlc3VsdCA+IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCAtPSBNYXRoLnJvdW5kKDAuOCAqIChyZXN1bHQgLSBsaW1pdFJpZ2h0KSAqIHNjcm9sbGJhckZhY3RvcilcbiAgICAgICAgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW92ZUV2ZW50VFMnLCBEYXRlLm5vdygpKVxuICAgICAgdGhpcy5wdXNoKCdwYWdlWCcsIGN1cnJlbnRQYWdlWClcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PT0gJ3YnKSB7XG4gICAgICAgIHRoaXMuY2xlYXJQb2ludGVyU3RhdGUoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG5cbiAgICAgIGNvbnN0IG5vd1RTID0gRGF0ZS5ub3coKVxuICAgICAgY29uc3QgdGltZUZyb21MYXN0TW92ZSA9IChub3dUUyAtIHRoaXMuZ2V0KCdtb3ZlRXZlbnRUUycpKSAvIDEuNVxuICAgICAgY29uc3QgdGltZUZyb21Qb2ludGVyRG93biA9IG5vd1RTIC0gdGhpcy5nZXQoJ2Rvd25FdmVudFRTJylcbiAgICAgIGNvbnN0IGVuZHBvaW50ID0gc2Nyb2xsZWQgLSAoZGlzdGFuY2VEZWx0YSAqIDgpXG5cbiAgICAgIGNvbnN0IGlzQ2xpY2sgPSBsYXN0UGFnZVggPT09IDAgJiYgdGltZUZyb21Qb2ludGVyRG93biA8IDE1MFxuICAgICAgY29uc3QgaXNMb25nQ2xpY2sgPSBsYXN0UGFnZVggPT09IDBcblxuICAgICAgLy8gc2ltcGxlIGNsaWNrXG4gICAgICBpZiAoaXNDbGljaykge1xuICAgICAgICBpZiAodGhpcy5jb25maWcub25DbGljaykgcmV0dXJuIHRoaXMuY29uZmlnLm9uQ2xpY2soZSlcblxuICAgICAgICBjb25zdCBsaW5rTm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgICBpZiAoIWxpbmtOb2RlKSByZXR1cm5cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpXG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICBjb25zdCBjdHJsQ2xpY2sgPSBpc0NvbnRyb2xDbGljayhlKVxuXG4gICAgICAgIGlmIChjdHJsQ2xpY2spIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgICBpZiAoIXRhcmdldCAmJiBocmVmKSByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmXG4gICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZignYmxhbmsnKSA+IC0xICYmIGhyZWYpIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgfVxuXG4gICAgICAvLyBsb25nIGNsaWNrIHdpdGggbm8gbW90aW9uXG4gICAgICBpZiAoaXNMb25nQ2xpY2spIHJldHVyblxuXG4gICAgICAvLyBkcmFnZ2luZ1xuICAgICAgLy8gc3RpY2t5IGxlZnRcbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwLCB0cnVlKVxuICAgICAgLy8gdG9vIG11Y2ggdG8gbGVmdFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMClcbiAgICAgIC8vIHN0aWNreSByaWdodFxuICAgICAgZWxzZSBpZiAoc2Nyb2xsZWQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwLCB0cnVlKVxuICAgICAgLy8gdG9vIG11Y2ggdG8gcmlnaHRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50ID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMClcbiAgICAgIC8vIG90aGVyd2lzZVxuICAgICAgZWxzZSBpZiAodGltZUZyb21MYXN0TW92ZSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLnJvdW5kKE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpIC8gdGltZUZyb21MYXN0TW92ZSlcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBNYXRoLnJvdW5kKGVuZHBvaW50KSwgdGltZVRvRW5kcG9pbnQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xlYXIoJ3BhZ2VYJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25DbGlja0xpbmsoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIGVcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uRm9jdXMoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgXG4gICAgICAvLyBmb2N1cyByZXNvbHZlLCBzZWU6IFxuICAgICAgLy8gaHR0cDovL3dkLmRpemFpbmEubmV0L2VuL2ludGVybmV0LW1haW50ZW5hbmNlL2pzLXNsaWRlcnMtYW5kLXRoZS10YWIta2V5L1xuICAgICAgcm9vdE5vZGUuc2Nyb2xsTGVmdCA9IDBcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge3Jvb3ROb2RlLnNjcm9sbExlZnQgPSAwfSwgMClcblxuICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoYC4ke3ByZWZpeH0taXRlbWApXG4gICAgICBjb25zdCBzY3JvbGx3cmFwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsd3JhcGAsIHJvb3ROb2RlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KHRhcmdldE5vZGUub2Zmc2V0TGVmdCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGlmIChNYXRoLmFicyhlbmRwb2ludCkgPCAyKSBlbmRwb2ludCA9IDBcblxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgXG4gICAgLy8gY2hlY2sgaWYgZW50ZXIgaXMgcHJlc3NlZFxuICAgIG9uS2V5RG93bihlKSB7XG4gICAgICBpZiAoIWUua2V5Q29kZSB8fCBlLmtleUNvZGUgIT09IDEzKSByZXR1cm5cbiAgICAgIGNvbnN0IGN0cmxDbGljayA9IGlzQ29udHJvbENsaWNrKGUpXG4gICAgICBjb25zdCBsb2NhdGlvbiA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICBpZiAoY3RybENsaWNrKSB3aW5kb3cub3Blbihsb2NhdGlvbiwgJ19ibGFuaycsIHt9KVxuICAgICAgZWxzZSB3aW5kb3cubG9jYXRpb24gPSBsb2NhdGlvblxuICAgIH1cblxuXG4gICAgb25TY3JvbGwoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS5kZWx0YVggfHwgTWF0aC5hYnMoZS5kZWx0YVkpID4gTWF0aC5hYnMoZS5kZWx0YVgpIHx8ICAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCB7ZGVsdGFYfSA9IGVcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZGVsdGFYLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcblxuICAgICAgaWYgKHJlc3VsdCA9PSBsaW1pdFJpZ2h0KSB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICBlbHNlIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICBcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcbiAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCB0cnVlKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHNjcm9sbENsaWNrRGlzYWJsZWQgPSB0aGlzLmdldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcpXG5cbiAgICAgIGlmIChzY3JvbGxDbGlja0Rpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgZmFsc2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIWUucHJldmVudERlZmF1bHQgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjYldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IGxpbWl0UmlnaHQgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgcGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGNlbnRlciA9IHBhZ2VYIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCBsZWZ0RWRnZSA9IGNlbnRlciAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgcmlnaHRFZGdlID0gY2VudGVyICsgc2NiV2lkdGggLyAyXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IGNlbnRlciAvIHNjYkZhY3RvclxuICAgICAgaWYgKGxlZnRFZGdlIDwgbGltaXRMZWZ0KSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocmlnaHRFZGdlID4gcmlnaHRTY2JMaW1pdCkgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG5cbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBcbiAgICBvbkFuY2hvckNsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUudGFyZ2V0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm4gXG4gICAgICBcbiAgICAgIGNvbnN0IGFuY2hvcmlkID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtYW5jaG9yaWRdJykuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcmlkJylcbiAgICAgIGlmICghYW5jaG9yaWQpIHJldHVyblxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcm9yaWdpbmlkPVwiJyArIGFuY2hvcmlkICsgJ1wiXScsIHJvb3ROb2RlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KHRhcmdldE5vZGUub2Zmc2V0TGVmdCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGlmIChNYXRoLmFicyhlbmRwb2ludCkgPCAyKSBlbmRwb2ludCA9IDBcblxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJEb3duKGUpIHtcbiAgICAgIGlmICghZSkgcmV0dXJuXG4gICAgICBpZiAoIWlzVG91Y2hFdmVudChlKSAmJiAhaXNMZWZ0QnV0dG9uQ2xpY2soZSkpIHJldHVyblxuICAgICAgXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgdGhpcy5yZWxlYXNlU2NiKClcblxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRG93blBhZ2VYJywgY3VycmVudFBhZ2VYIC0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3IpXG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJEb3duUGFnZVggPSB0aGlzLmdldCgnc2Nyb2xsYmFyRG93blBhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBkZWx0YSA9IChjdXJyZW50UGFnZVggLSBzY3JvbGxiYXJEb3duUGFnZVgpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heChkZWx0YSAvIHNjcm9sbGJhckZhY3RvciwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgaGFuZGxlVG91Y2hTdGFydChlKSB7XG4gICAgICBpZiAoIWlzVG91Y2hFdmVudChlKSkgcmV0dXJuXG4gICAgICB0aGlzLnNldCgndG91Y2hYJywgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIHx8IGUudG91Y2hlc1swXS5jbGllbnRYKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGhhbmRsZVRvdWNoTW92ZShlKSB7XG4gICAgICBjb25zdCB0b3VjaFggPSB0aGlzLmdldCgndG91Y2hYJylcbiAgICAgIGNvbnN0IHRvdWNoWSA9IHRoaXMuZ2V0KCd0b3VjaFknKVxuICAgICAgaWYgKCF0b3VjaFggfHwgIXRvdWNoWSB8fCAhaXNUb3VjaEV2ZW50KGUpKSByZXR1cm5cblxuICAgICAgY29uc3QgeFVwID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIHx8IGUudG91Y2hlc1swXS5jbGllbnRYXG4gICAgICBjb25zdCB5VXAgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgfHwgZS50b3VjaGVzWzBdLmNsaWVudFlcblxuICAgICAgY29uc3QgeERpZmYgPSB0b3VjaFggLSB4VXBcbiAgICAgIGNvbnN0IHlEaWZmID0gdG91Y2hZIC0geVVwXG5cbiAgICAgIGlmIChNYXRoLmFicyh4RGlmZikgPiBNYXRoLmFicyh5RGlmZikpIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsICdoJylcbiAgICAgIGVsc2UgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ3YnKVxuXG4gICAgICB0aGlzLnNldCgndG91Y2hYJywgMClcbiAgICAgIHRoaXMuc2V0KCd0b3VjaFknLCAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG5cbiAgICBhbmltYXRlKHN0YXJ0LCBzdG9wPTAsIHNwZWVkPTEwLCBhbmltYXRlV2lkdGg9ZmFsc2UpIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gc3RvcCAtIHN0YXJ0XG4gICAgICBjb25zdCB0aW1lID0gTWF0aC5tYXgoLjA1LCBNYXRoLm1pbihNYXRoLmFicyhkZWx0YSkgLyBzcGVlZCwgMSkpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSBzcGVlZCA9PSAwID8gMSA6IDAsXG4gICAgICAgICAgZW5kcG9pbnQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSxcbiAgICAgICAgICBzY2JFbmRwb2ludCA9IGVuZHBvaW50ICogc2NiRmFjdG9yXG5cbiAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmdldCgncG9pbnRlckRvd24nKSB8fCB0aGlzLmdldCgnbW91c2VTY3JvbGwnKSkgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudFRpbWUgKz0gKDEgLyA2MClcbiAgICAgICAgZW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKVxuICAgICAgICAgIDogc3RvcFxuXG4gICAgICAgIHNjYkVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCAqIHNjYkZhY3RvciArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkgKiBzY2JGYWN0b3JcbiAgICAgICAgICA6IHN0b3AgKiBzY2JGYWN0b3JcbiAgICAgICAgXG4gICAgICAgIHNjYkVuZHBvaW50ID0gTWF0aC5taW4oc2NiRW5kcG9pbnQsIHJpZ2h0U2NiTGltaXQpXG5cbiAgICAgICAgaWYgKCFhbmltYXRlV2lkdGgpIHtcbiAgICAgICAgICBpZiAoc2NiRW5kcG9pbnQgPj0gcmlnaHRTY2JMaW1pdCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgICAgICB0aGlzLnNldFNjYlBvcyhzY2JFbmRwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgc2NidyA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICAgICAgaWYgKHN0YXJ0IDwgc3RvcCkgc2NidyAtPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG4gICAgICAgICAgZWxzZSBzY2J3ICs9IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcblxuICAgICAgICAgIHRoaXMuc2V0V2lkdGgoc2NidylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zKC0xICogZW5kcG9pbnQpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIGVuZHBvaW50KVxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA8IDEpIHJhZih0aWNrKVxuICAgICAgICBlbHNlIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpY2soKVxuICAgIH1cblxuICAgIGNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHNjcm9sbGVkID4gbGltaXRMZWZ0KSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gcHVibGljIEFQSVxuICAgIHNjcm9sbFRvKHBvaW50LCB0aW1lPTEwMDApIHtcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGxldCBlbmRwb2ludCA9ICFpc05hTihwb2ludCkgPyBwYXJzZUludChwb2ludCkgOiAwXG4gICAgICBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KGVuZHBvaW50LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBpZiAocG9pbnQgPT0gJ2VuZCcpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ3N0YXJ0JykgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdjZW50ZXInKSBlbmRwb2ludCA9IGxpbWl0UmlnaHQgLyAyXG5cbiAgICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmdldCgnc2Nyb2xsZWQnKSwgZW5kcG9pbnQsIHRpbWUpXG4gICAgfVxuXG4gICAgdXBkYXRlKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj10aGlzLmNvbmZpZy5hbGlnbixcbiAgICAgICAgbm9BbmNob3JzPXRoaXMuY29uZmlnLm5vQW5jaG9ycyxcbiAgICAgICAgbm9TY3JvbGxiYXI9dGhpcy5jb25maWcubm9TY3JvbGxiYXIsXG4gICAgICAgIHNjcm9sbGJhcixcbiAgICAgICAgYW5jaG9ycyxcbiAgICAgICAgb25DbGljaz10aGlzLmNvbmZpZy5vbkNsaWNrLFxuICAgICAgICBzdGFydD10aGlzLmNvbmZpZy5zdGFydCxcbiAgICAgICAgc3RhcnRBbmltYXRpb249dGhpcy5jb25maWcuc3RhcnRBbmltYXRpb25cbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcuYWxpZ24gPSBhbGlnblxuICAgICAgdGhpcy5jb25maWcubm9BbmNob3JzID0gIW5vQW5jaG9ycyBcbiAgICAgICAgPyBhbmNob3JzID09ICdoaWRkZW4nIFxuICAgICAgICA6IGFuY2hvcnMgIT0gJ3Zpc2libGUnXG5cbiAgICAgIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyID0gIW5vU2Nyb2xsYmFyXG4gICAgICAgID8gc2Nyb2xsYmFyID09ICdoaWRkZW4nIFxuICAgICAgICA6IHNjcm9sbGJhciAhPSAndmlzaWJsZSdcblxuICAgICAgdGhpcy5jb25maWcub25DbGljayA9IG9uQ2xpY2tcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gc3RhcnRcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID0gc3RhcnRBbmltYXRpb25cblxuICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdCBjb25maWdcbiAgY29uc3QgYXV0b2luaXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZWxzID0gZ2V0RWxlbWVudHMoJy5zY3JvbGxlcicpXG4gICAgQXJyYXkuZnJvbShlbHMpLmZvckVhY2goZWwgPT4ge1xuICAgICAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuICAgIH0pXG4gIH1cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gYXV0b2luaXQpXG5cbiAgZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09ICdpbnRlcmFjdGl2ZScpIGF1dG9pbml0KClcbiAgfVxuXG4gIHdpbmRvdy5TY3JvbGxlciA9IFNjcm9sbGVyXG59KCkpIiwibW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIEFycmF5LmZyb20gPT09ICdmdW5jdGlvbicgP1xuICBBcnJheS5mcm9tIDpcbiAgcmVxdWlyZSgnLi9wb2x5ZmlsbCcpXG4pO1xuIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gUmVmZXJlbmNlOiBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtYXJyYXkuZnJvbVxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nO1xuICB9O1xuICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgfTtcbiAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgfTtcbiAgdmFyIGl0ZXJhdG9yUHJvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgIT0gbnVsbCkge1xuICAgICAgaWYoWydzdHJpbmcnLCdudW1iZXInLCdib29sZWFuJywnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdmFsdWUpID4gLTEpe1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAoJ2l0ZXJhdG9yJyBpbiBTeW1ib2wpICYmXG4gICAgICAgIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIFN5bWJvbC5pdGVyYXRvcjtcbiAgICAgIH1cbiAgICAgIC8vIFN1cHBvcnQgXCJAQGl0ZXJhdG9yXCIgcGxhY2Vob2xkZXIsIEdlY2tvIDI3IHRvIEdlY2tvIDM1XG4gICAgICBlbHNlIGlmICgnQEBpdGVyYXRvcicgaW4gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICdAQGl0ZXJhdG9yJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihPLCBQKSB7XG4gICAgLy8gQXNzZXJ0OiBJc1Byb3BlcnR5S2V5KFApIGlzIHRydWUuXG4gICAgaWYgKE8gIT0gbnVsbCAmJiBQICE9IG51bGwpIHtcbiAgICAgIC8vIExldCBmdW5jIGJlIEdldFYoTywgUCkuXG4gICAgICB2YXIgZnVuYyA9IE9bUF07XG4gICAgICAvLyBSZXR1cm5JZkFicnVwdChmdW5jKS5cbiAgICAgIC8vIElmIGZ1bmMgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBudWxsLCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgaWYoZnVuYyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICAvLyBJZiBJc0NhbGxhYmxlKGZ1bmMpIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICBpZiAoIWlzQ2FsbGFibGUoZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihmdW5jICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICB9O1xuICB2YXIgaXRlcmF0b3JTdGVwID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICAvLyBMZXQgcmVzdWx0IGJlIEl0ZXJhdG9yTmV4dChpdGVyYXRvcikuXG4gICAgLy8gUmV0dXJuSWZBYnJ1cHQocmVzdWx0KS5cbiAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIC8vIExldCBkb25lIGJlIEl0ZXJhdG9yQ29tcGxldGUocmVzdWx0KS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChkb25lKS5cbiAgICB2YXIgZG9uZSA9IEJvb2xlYW4ocmVzdWx0LmRvbmUpO1xuICAgIC8vIElmIGRvbmUgaXMgdHJ1ZSwgcmV0dXJuIGZhbHNlLlxuICAgIGlmKGRvbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHJlc3VsdC5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gIHJldHVybiBmdW5jdGlvbiBmcm9tKGl0ZW1zIC8qLCBtYXBGbiwgdGhpc0FyZyAqLyApIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAvLyAyLiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgdmFyIFQ7XG4gICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIDMuIGVsc2VcbiAgICAgIC8vICAgYS4gSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vICAgYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFRcbiAgICAgIC8vICAgICAgYmUgdW5kZWZpbmVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG4gICAgICAvLyAgIGMuIExldCBtYXBwaW5nIGJlIHRydWUgKGltcGxpZWQgYnkgbWFwRm4pXG4gICAgfVxuXG4gICAgdmFyIEEsIGs7XG5cbiAgICAvLyA0LiBMZXQgdXNpbmdJdGVyYXRvciBiZSBHZXRNZXRob2QoaXRlbXMsIEBAaXRlcmF0b3IpLlxuICAgIC8vIDUuIFJldHVybklmQWJydXB0KHVzaW5nSXRlcmF0b3IpLlxuICAgIHZhciB1c2luZ0l0ZXJhdG9yID0gZ2V0TWV0aG9kKGl0ZW1zLCBpdGVyYXRvclByb3AoaXRlbXMpKTtcblxuICAgIC8vIDYuIElmIHVzaW5nSXRlcmF0b3IgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh1c2luZ0l0ZXJhdG9yICE9PSB2b2lkIDApIHtcbiAgICAgIC8vIGEuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV1cbiAgICAgIC8vICAgICAgaW50ZXJuYWwgbWV0aG9kIG9mIEMgd2l0aCBhbiBlbXB0eSBhcmd1bWVudCBsaXN0LlxuICAgICAgLy8gYi4gRWxzZSxcbiAgICAgIC8vICAgaS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEFycmF5Q3JlYXRlXG4gICAgICAvLyAgICAgIHdpdGggYXJndW1lbnQgMC5cbiAgICAgIC8vIGMuIFJldHVybklmQWJydXB0KEEpLlxuICAgICAgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMoKSkgOiBbXTtcblxuICAgICAgLy8gZC4gTGV0IGl0ZXJhdG9yIGJlIEdldEl0ZXJhdG9yKGl0ZW1zLCB1c2luZ0l0ZXJhdG9yKS5cbiAgICAgIHZhciBpdGVyYXRvciA9IHVzaW5nSXRlcmF0b3IuY2FsbChpdGVtcyk7XG5cbiAgICAgIC8vIGUuIFJldHVybklmQWJydXB0KGl0ZXJhdG9yKS5cbiAgICAgIGlmIChpdGVyYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGYuIExldCBrIGJlIDAuXG4gICAgICBrID0gMDtcblxuICAgICAgLy8gZy4gUmVwZWF0XG4gICAgICB2YXIgbmV4dCwgbmV4dFZhbHVlO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gaS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgICAvLyBpaS4gTGV0IG5leHQgYmUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKS5cbiAgICAgICAgLy8gaWlpLiBSZXR1cm5JZkFicnVwdChuZXh0KS5cbiAgICAgICAgbmV4dCA9IGl0ZXJhdG9yU3RlcChpdGVyYXRvcik7XG5cbiAgICAgICAgLy8gaXYuIElmIG5leHQgaXMgZmFsc2UsIHRoZW5cbiAgICAgICAgaWYgKCFuZXh0KSB7XG5cbiAgICAgICAgICAvLyAxLiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBrLCB0cnVlKS5cbiAgICAgICAgICAvLyAyLiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgICAgIEEubGVuZ3RoID0gaztcblxuICAgICAgICAgIC8vIDMuIFJldHVybiBBLlxuICAgICAgICAgIHJldHVybiBBO1xuICAgICAgICB9XG4gICAgICAgIC8vIHYuIExldCBuZXh0VmFsdWUgYmUgSXRlcmF0b3JWYWx1ZShuZXh0KS5cbiAgICAgICAgLy8gdmkuIFJldHVybklmQWJydXB0KG5leHRWYWx1ZSlcbiAgICAgICAgbmV4dFZhbHVlID0gbmV4dC52YWx1ZTtcblxuICAgICAgICAvLyB2aWkuIElmIG1hcHBpbmcgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAvLyAgIDEuIExldCBtYXBwZWRWYWx1ZSBiZSBDYWxsKG1hcGZuLCBULCDCq25leHRWYWx1ZSwga8K7KS5cbiAgICAgICAgLy8gICAyLiBJZiBtYXBwZWRWYWx1ZSBpcyBhbiBhYnJ1cHQgY29tcGxldGlvbiwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyAgIDMuIExldCBtYXBwZWRWYWx1ZSBiZSBtYXBwZWRWYWx1ZS5bW3ZhbHVlXV0uXG4gICAgICAgIC8vIHZpaWkuIEVsc2UsIGxldCBtYXBwZWRWYWx1ZSBiZSBuZXh0VmFsdWUuXG4gICAgICAgIC8vIGl4LiAgTGV0IGRlZmluZVN0YXR1cyBiZSB0aGUgcmVzdWx0IG9mXG4gICAgICAgIC8vICAgICAgQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhBLCBQaywgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyB4LiBbVE9ET10gSWYgZGVmaW5lU3RhdHVzIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgZGVmaW5lU3RhdHVzKS5cbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwgbmV4dFZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHhpLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDcuIEFzc2VydDogaXRlbXMgaXMgbm90IGFuIEl0ZXJhYmxlIHNvIGFzc3VtZSBpdCBpc1xuICAgICAgLy8gICAgYW4gYXJyYXktbGlrZSBvYmplY3QuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gOC4gTGV0IGFycmF5TGlrZSBiZSBUb09iamVjdChpdGVtcykuXG4gICAgICB2YXIgYXJyYXlMaWtlID0gT2JqZWN0KGl0ZW1zKTtcblxuICAgICAgLy8gOS4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGl0ZW1zID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW4gYmUgVG9MZW5ndGgoR2V0KGFycmF5TGlrZSwgXCJsZW5ndGhcIikpLlxuICAgICAgLy8gMTEuIFJldHVybklmQWJydXB0KGxlbikuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoYXJyYXlMaWtlLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEyLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vICAgICBhLiBMZXQgQSBiZSBDb25zdHJ1Y3QoQywgwqtsZW7CuykuXG4gICAgICAvLyAxMy4gRWxzZVxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICAvLyAxNC4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNS4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuICAgICAgLy8gMTYuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBhcnJheUxpa2Vba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrKys7XG4gICAgICB9XG4gICAgICAvLyAxNy4gTGV0IHNldFN0YXR1cyBiZSBTZXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIC8vIDE4LiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAxOS4gUmV0dXJuIEEuXG4gICAgfVxuICAgIHJldHVybiBBO1xuICB9O1xufSkoKTtcbiJdfQ==
