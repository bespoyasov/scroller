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

        // save rootNode's style.height to prevent "jumps" of content below
        // it won't affect items' offsetHeights calculations
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
        if (scrollbarFactor > 1) {
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
        var _ref = config || {},
            _ref$align = _ref.align,
            align = _ref$align === undefined ? this.config.align : _ref$align,
            _ref$noAnchors = _ref.noAnchors,
            noAnchors = _ref$noAnchors === undefined ? this.config.noAnchors : _ref$noAnchors,
            _ref$noScrollbar = _ref.noScrollbar,
            noScrollbar = _ref$noScrollbar === undefined ? this.config.noScrollbar : _ref$noScrollbar,
            scrollbar = _ref.scrollbar,
            anchors = _ref.anchors,
            _ref$onClick = _ref.onClick,
            onClick = _ref$onClick === undefined ? this.config.onClick : _ref$onClick,
            _ref$start = _ref.start,
            start = _ref$start === undefined ? this.config.start : _ref$start,
            _ref$startAnimation = _ref.startAnimation,
            startAnimation = _ref$startAnimation === undefined ? this.config.startAnimation : _ref$startAnimation;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7QUFFVjtBQUNBLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSOztBQUc5QjtBQUg4QixHQUk3QixVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FqQjZCLEVBaUIzQixDQUFDLFFBQVEsU0FBVCxFQUFvQixjQUFjLFNBQWxDLEVBQTZDLGFBQWEsU0FBMUQsQ0FqQjJCLENBQWI7O0FBb0JqQjtBQUNBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtBQUFBLFVBQW1ELEtBQUssSUFBeEQ7QUFDQSxhQUFPLE1BQU0sU0FBTixDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUEwQixPQUEx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RUFBOEM7QUFBQSxXQUFNLFFBQU47QUFBQSxHQUE5Qzs7QUFFQSxXQUFTLGtCQUFULEdBQThCLFlBQU07QUFDbEMsUUFBSSxTQUFTLFVBQVQsSUFBdUIsYUFBM0IsRUFBMEM7QUFDM0MsR0FGRDs7QUFJQSxTQUFPLFFBQVAsR0FBa0IsUUFBbEI7QUFDRCxDQXhuQ0EsR0FBRDs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgLy8gQXJyYXkuZnJvbSBwb2x5ZmlsbFxuICBpZiAoIUFycmF5LmZyb20pIEFycmF5LmZyb20gPSByZXF1aXJlKCdhcnJheS1mcm9tJylcblxuXG4gIC8vIHJlbW92ZSBwb2x5ZmlsbFxuICAoZnVuY3Rpb24gKGFycikge1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHJldHVyblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9KShbRWxlbWVudC5wcm90b3R5cGUsIENoYXJhY3RlckRhdGEucHJvdG90eXBlLCBEb2N1bWVudFR5cGUucHJvdG90eXBlXSlcblxuXG4gIC8vIG1hdGNoZXMgcG9seWZpbGxcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIG1hdGNoZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgdGggPSB0aGlzXG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChtYXRjaGVzLCBmdW5jdGlvbihlKXtcbiAgICAgICAgcmV0dXJuIGUgPT09IHRoXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2xvc2VzdCBwb2x5ZmlsbFxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXNcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubWF0Y2hlcyhjc3MpKSByZXR1cm4gbm9kZVxuICAgICAgICBlbHNlIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuXG4gIC8vIHBhc3NpdmUgZXZlbnQgbGlzdGVuZXJzIHBvbHlmaWxsXG4gIGxldCBwYXNzaXZlU3VwcG9ydGVkID0gZmFsc2VcblxuICB0cnkge1xuICAgIGxldCBvcHRpb25zID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcbiAgICAgIGdldDogKCkgPT4geyBwYXNzaXZlU3VwcG9ydGVkID0gdHJ1ZSB9XG4gICAgfSlcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0aW9ucylcbiAgfSBjYXRjaChlcnIpIHt9XG5cblxuICAvLyBoZWxwZXJzXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3I9JycsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZXMgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMgfHwgbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RXZlbnRYID0gZSA9PiB7XG4gICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWFxuICAgICAgfHwgZS50b3VjaGVzXG4gICAgICAgICYmIGUudG91Y2hlcy5sZW5ndGhcbiAgICAgICAgJiYgZS50b3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnBhZ2VYXG4gICAgICB8fCAwXG4gIH1cblxuICBjb25zdCBpc0NvbnRyb2xDbGljayA9IGUgPT5cbiAgICBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5XG5cbiAgY29uc3QgaXNMZWZ0QnV0dG9uQ2xpY2sgPSBlID0+XG4gICAgZS53aGljaCA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMFxuXG4gIGNvbnN0IGlzVG91Y2hFdmVudCA9IGUgPT5cbiAgICAhIWUudG91Y2hlcyB8fCAhIWUuY2hhbmdlZFRvdWNoZXNcblxuICBjb25zdCBnZXRDaGlsZHJlbiA9IChlbCkgPT4ge1xuICAgIGxldCBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcyxcbiAgICAgICAgY2hpbGRyZW4gPSBbXSxcbiAgICAgICAgaSA9IGNoaWxkTm9kZXMubGVuZ3RoXG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoY2hpbGROb2Rlc1tpXS5ub2RlVHlwZSA9PSAxKSBjaGlsZHJlbi51bnNoaWZ0KGNoaWxkTm9kZXNbaV0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkcmVuXG4gIH1cblxuICBjb25zdCBpc0FuZHJvaWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdhbmRyb2lkJykgPiAtMVxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249J2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI9ZmFsc2UsXG4gICAgICAgIHNjcm9sbGJhcj0ndmlzaWJsZScsXG4gICAgICAgIGFuY2hvcnM9J3Zpc2libGUnLFxuICAgICAgICBzdGFydD0wLFxuICAgICAgICBzdGFydEFuaW1hdGlvbj1mYWxzZSxcbiAgICAgICAgZWwsXG4gICAgICAgIG9uQ2xpY2ssXG4gICAgICAgIHVzZU91dGVySHRtbD1mYWxzZSxcbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgLy8gbm9BbmNob3JzLCBub1Njcm9sbGJhciDigJQgbGVnYWN5XG4gICAgICAgIG5vQW5jaG9yczogYW5jaG9ycyA9PSAnaGlkZGVuJyB8fCBub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBzY3JvbGxiYXIgPT0gJ2hpZGRlbicgfHwgbm9TY3JvbGxiYXIsXG4gICAgICAgIG9uQ2xpY2s6IG9uQ2xpY2ssXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgc3RhcnRBbmltYXRpb246IHN0YXJ0QW5pbWF0aW9uLFxuXG4gICAgICAgIHByZWZpeDogJ2FiX3Njcm9sbGVyJyxcbiAgICAgICAgZHJhZ2dpbmdDbHNubTogJ2lzLWRyYWdnaW5nJyxcbiAgICAgICAgbGVmdEFsaWduQ2xzbm06ICdpcy1sZWZ0LWFsaWduJyxcbiAgICAgICAgYm9yZGVyVnNibENsc25tOiAnaXMtdmlzaWJsZScsXG4gICAgICAgIG5vQW5jaG9yc0Nsc25tOiAnaXMtbm8tYW5jaG9ycycsXG4gICAgICAgIG5vU2Nyb2xsYmFyQ2xzbm06ICdpcy1uby1zY3JvbGxiYXInLFxuXG4gICAgICAgIC8vIGlmIHdlIGRvbid0IG5lZWQgdG8gY3JlYXRlIG1hcmt1cFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSByZWFjdCBjb21wb25lbnQgd2lsbCByZW5kZXIgaHRtbCBieSBpdHNlbGZcbiAgICAgICAgLy8gc28gd2UganVzdCB0YWtlIG91dGVyIG1hcmt1cCBpbnN0ZWFkXG4gICAgICAgIHVzZU91dGVySHRtbDogdXNlT3V0ZXJIdG1sLFxuXG4gICAgICAgIGVhc2luZzogcG9zID0+IHBvcyA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogcG9zKSArIDEsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBzY3JvbGxhYmxlOiB0cnVlLFxuXG4gICAgICAgIHBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgc2Nyb2xsYmFyUG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBtb3VzZVNjcm9sbDogZmFsc2UsXG5cbiAgICAgICAgc2Nyb2xsYmFyV2lkdGg6IDAsXG4gICAgICAgIHNjcm9sbGJhckZhY3RvcjogMCxcblxuICAgICAgICBwYWdlWDogW10sXG4gICAgICAgIHNjcm9sbGVkRGlmZjogMCxcbiAgICAgICAgZG93bkV2ZW50VFM6IDAsXG4gICAgICAgIG1vdmVFdmVudFRTOiAwLFxuXG4gICAgICAgIHNjcm9sbGJhckRvd25QYWdlWDogMCxcbiAgICAgICAgc2Nyb2xsQ2xpY2tEaXNhYmxlZDogZmFsc2UsXG5cbiAgICAgICAgbGltaXRMZWZ0OiAwLFxuICAgICAgICBsaW1pdFJpZ2h0OiAwLFxuICAgICAgICBzdHJpcFdpZHRoOiAwLFxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uOiBudWxsLFxuICAgICAgICB0b3VjaFg6IDAsXG4gICAgICAgIHRvdWNoWTogMCxcblxuICAgICAgICBsZXQ6IGVsLmhhc0NoaWxkTm9kZXMoKSAmJiBnZXRDaGlsZHJlbihlbCkubGVuZ3RoIHx8IDAsXG4gICAgICAgIGVsOiBlbCB8fCBudWxsLFxuXG4gICAgICAgIGlzQW5kcm9pZDogaXNBbmRyb2lkKClcbiAgICAgIH1cblxuICAgICAgd2luZG93LnJhZiA9ICgoKSA9PiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge3NldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCl9XG4gICAgICB9KSgpXG5cbiAgICAgIHRoaXMuaW5pdChlbClcbiAgICB9XG5cblxuICAgIGdldChwcm9wKSB7XG4gICAgICByZXR1cm4gdHlwZW9mKHRoaXMuc3RhdGVbcHJvcF0pICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgc2V0KHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdID0gdmFsdWVcbiAgICB9XG5cbiAgICBwdXNoKHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdICYmIHRoaXMuc3RhdGVbcHJvcF0ucHVzaCh2YWx1ZSlcbiAgICB9XG5cbiAgICBjbGVhcihwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGlmIChmaWVsZCAmJiBmaWVsZC5sZW5ndGgpIGZpZWxkLmxlbmd0aCA9IDBcbiAgICB9XG5cbiAgICBnZXRMYXN0TWVhbmluZ2Z1bGwocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBjb25zdCB0b0lnbm9yZSA9IGZpZWxkICYmIGZpZWxkLmxlbmd0aCAmJiBmaWVsZC5sZW5ndGggPiAzID8gMyA6IDFcbiAgICAgIHJldHVybiBmaWVsZFtmaWVsZC5sZW5ndGggLSB0b0lnbm9yZV0gfHwgMFxuICAgIH1cblxuXG4gICAgYWRkQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBpZiAoIW5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2wrJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKSkgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsXG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFxzK3xeKScrY2wrJyhcXFxccyt8JCknLCAnZycpLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICB9XG5cbiAgICBhbGlnblNjYlRvUmlnaHQoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cbiAgICByZWxlYXNlU2NiKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZWwsICdpcy1yaWdodCcpXG4gICAgfVxuXG5cbiAgICBzZXRQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsLCBwb3MpXG4gICAgfVxuXG4gICAgc2V0U2NiUG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbihlbCwgcG9zKSB7XG4gICAgICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICAgIGVsLnN0eWxlLk1velRyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5tc1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5PVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgIH1cblxuICAgIHNldFdpZHRoKHdpZHRoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgZWwuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgICB9XG5cbiAgICBjbGVhclBvaW50ZXJTdGF0ZSgpIHtcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsIG51bGwpXG4gICAgICB0aGlzLmNsZWFyKCdwYWdlWCcpXG4gICAgfVxuXG5cbiAgICBpbml0KGVsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVdyYXBwZXIoKVxuICAgICAgdGhpcy53cmFwSXRlbXMoKVxuICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgLy8gY29uZmlnXG4gICAgICBpZiAodGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0YWxpZ24nKVxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdEFsaWduJylcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKVxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdGlmd2lkZScpKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9BbmNob3JzXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JzJykgPT0gJ2hpZGRlbidcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vYW5jaG9ycycpXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub0FuY2hvcnMnKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyXG4gICAgICAgIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInKSA9PSAnaGlkZGVuJ1xuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKVxuICAgICAgICB8fCByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9TY3JvbGxiYXInKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAocm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0JykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnQgPSByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKVxuICAgICAgfVxuXG4gICAgICBpZiAocm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0QW5pbWF0aW9uJylcbiAgICAgICAgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0YW5pbWF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltYXRpb24gPSB0cnVlXG4gICAgICB9XG5cblxuICAgICAgLy8gcGFzc2l2ZTogZmFsc2UgbmVlZGVkIHRvIHByZXZlbnQgc2Nyb2xsaW5nIGluIFNhZmFyaSBvbiBsYXRlc3QgaU9TXG4gICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80OTUwMDMzOS9jYW50LXByZXZlbnQtdG91Y2htb3ZlLWZyb20tc2Nyb2xsaW5nLXdpbmRvdy1vbi1pb3NcbiAgICAgIGNvbnN0IHRvdWNoTW92ZUV2ZW50Q29uZmlnID0gcGFzc2l2ZVN1cHBvcnRlZFxuICAgICAgICA/IHsgcGFzc2l2ZTogZmFsc2UgfVxuICAgICAgICA6IGZhbHNlXG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpLCB0b3VjaE1vdmVFdmVudENvbmZpZylcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TY3JvbGxDbGljay5iaW5kKHRoaXMpKVxuXG4gICAgICBjb25zdCB3aGVlbEV2ZW50ID0gKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcih3aGVlbEV2ZW50LCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpXG5cbiAgICAgIHRoaXMuYmluZEFuY2hvcnNFdmVudHMoKVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmcgb24gbGlua3MgYW5kIGhhbmRsZSBmb2N1cyBldmVudFxuICAgICAgQXJyYXkuZnJvbShsaW5rTm9kZXMpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2tMaW5rLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5vbkZvY3VzLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHJlcmVuZGVyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgfSlcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgfSlcblxuXG4gICAgICBjb25zdCBzdGFydEFuaW1hdGlvbkhlbHBlciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2VudHJhbE5vZGUgPSB0aGlzLmZpbmRDZW50cmFsTm9kZSgpXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID8gMTAwMCA6IDBcbiAgICAgICAgbGV0IGVuZHBvaW50XG5cbiAgICAgICAgaWYgKGNlbnRyYWxOb2RlKSB7XG4gICAgICAgICAgZW5kcG9pbnQgPSBjZW50cmFsTm9kZS5vZmZzZXRMZWZ0XG4gICAgICAgICAgICAtICh3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aCAvIDIpXG4gICAgICAgICAgICArIChjZW50cmFsTm9kZS5vZmZzZXRXaWR0aCAvIDIpXG5cbiAgICAgICAgICBlbmRwb2ludCA9IE1hdGgubWluKGNlbnRyYWxOb2RlLm9mZnNldExlZnQsIGVuZHBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgZW5kcG9pbnQgPSB0aGlzLmNvbmZpZy5zdGFydFxuXG4gICAgICAgIHRoaXMuc2Nyb2xsVG8oZW5kcG9pbnQsIGFuaW1hdGlvbilcbiAgICAgIH1cblxuXG4gICAgICAvLyBjaGVjayBpZiBzY3JvbGxlciBpcyBpbiBoaWRkZW4gYmxvY2tcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gZWwgPT4gZWwub2Zmc2V0UGFyZW50ID09PSBudWxsXG5cbiAgICAgIGlmIChpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICAgIC8vIHRyaWdnZXJpbmcgcmVzaXplIGlzIG5vdCByZWxpYWJsZVxuICAgICAgICAgICAgLy8ganVzdCByZWNhbGMgdHdpY2VcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpXG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKVxuXG4gICAgICAgICAgICBzdGFydEFuaW1hdGlvbkhlbHBlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cblxuXG4gICAgICBzdGFydEFuaW1hdGlvbkhlbHBlcigpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgfVxuXG5cbiAgICBiaW5kQW5jaG9yc0V2ZW50cygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgQXJyYXkuZnJvbShhbmNob3JzTm9kZXMpLmZvckVhY2goYW5jaG9yTm9kZSA9PiB7XG4gICAgICAgIGFuY2hvck5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQW5jaG9yQ2xpY2suYmluZCh0aGlzKSlcbiAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnVzZU91dGVySHRtbCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHByZXZIdG1sID0gcm9vdE5vZGUuaW5uZXJIVE1MXG4gICAgICBjb25zdCB3cmFwcGVySHRtbCA9IGA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXdyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tbGVmdFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWJvcmRlciAke3ByZWZpeH0tYm9yZGVyLS1yaWdodFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXN0cmlwXCI+JHtwcmV2SHRtbH08L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXNjcm9sbHdyYXBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXNjcm9sbGJhclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JzXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5gXG5cbiAgICAgIHJvb3ROb2RlLmlubmVySFRNTCA9IHdyYXBwZXJIdG1sXG4gICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCBwcmVmaXgpXG4gICAgfVxuXG4gICAgd3JhcEl0ZW1zKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIEFycmF5LmZyb20oZ2V0Q2hpbGRyZW4od3JhcHBlck5vZGUpKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgaWYgKHVzZU91dGVySHRtbCkge1xuICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoaXRlbU5vZGUsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc3QgaXRlbVdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICAgIGl0ZW1XcmFwcGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICAgIGl0ZW1Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW1XcmFwcGVyLCBpdGVtTm9kZSlcbiAgICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGZpbmRDZW50cmFsTm9kZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBjZW50cmFsTm9kZXMgPSBnZXRFbGVtZW50cyhgW2RhdGEtY2VudHJhbD1cInRydWVcIl1gLCByb290Tm9kZSlcbiAgICAgIHJldHVybiBjZW50cmFsTm9kZXMgJiYgY2VudHJhbE5vZGVzLmxlbmd0aFxuICAgICAgICA/IGNlbnRyYWxOb2Rlc1tjZW50cmFsTm9kZXMubGVuZ3RoIC0gMV0uY2xvc2VzdChgLiR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgcmVtb3ZlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gJydcbiAgICB9XG5cbiAgICBjcmVhdGVBbmNob3JzKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgbGV0IGFuY2hvcnNIdG1sID0gJycsIGNvdW50ZXIgPSAwXG5cbiAgICAgIEFycmF5LmZyb20oZ2V0Q2hpbGRyZW4od3JhcHBlck5vZGUpKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IHVzZU91dGVySHRtbFxuICAgICAgICAgID8gaXRlbU5vZGVcbiAgICAgICAgICA6IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcl0nLCBpdGVtTm9kZSlcblxuICAgICAgICBjb25zdCBhdHRyQ29udGVudCA9IHRhcmdldE5vZGUgPyB0YXJnZXROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKSA6ICcnXG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSBhdHRyQ29udGVudCB8fCAnJ1xuXG4gICAgICAgIGFuY2hvcnNIdG1sICs9IGA8c3BhbiBkYXRhLWFuY2hvcmlkPVwiJHtjb3VudGVyfVwiIGNsYXNzPVwiJHtwcmVmaXh9LWFuY2hvclwiPjxzcGFuPiR7YW5jaG9yVGV4dH08L3NwYW4+PC9zcGFuPmBcbiAgICAgICAgaXRlbU5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcm9yaWdpbmlkJywgY291bnRlcilcbiAgICAgICAgY291bnRlcisrXG4gICAgICB9KVxuXG4gICAgICBhbmNXcmFwcGVyTm9kZS5pbm5lckhUTUwgPSBhbmNob3JzSHRtbFxuICAgIH1cblxuICAgIHNldFNpemUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGx3cmFwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsd3JhcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICAvLyBzYXZlIHJvb3ROb2RlJ3Mgc3R5bGUuaGVpZ2h0IHRvIHByZXZlbnQgXCJqdW1wc1wiIG9mIGNvbnRlbnQgYmVsb3dcbiAgICAgIC8vIGl0IHdvbid0IGFmZmVjdCBpdGVtcycgb2Zmc2V0SGVpZ2h0cyBjYWxjdWxhdGlvbnNcbiAgICAgIHN0cmlwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICB3cmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGxiYXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHNjcm9sbHdyYXBOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50SGVpZ2h0ID0gaXRlbU5vZGUub2Zmc2V0SGVpZ2h0XG4gICAgICAgIGlmIChjdXJyZW50SGVpZ2h0ID4gbWF4SGVpZ2h0KSBtYXhIZWlnaHQgPSBjdXJyZW50SGVpZ2h0XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcFdpZHRoID0gc2Nyb2xsd3JhcE5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICAvLyBvdGhlcndpc2Ugd2lsbCBiZSBOYU5cbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHNjcm9sbHdyYXBXaWR0aCAhPT0gMCAmJiBzdW1XaWR0aCAhPT0gMFxuICAgICAgICA/IHNjcm9sbHdyYXBXaWR0aCAvIHN1bVdpZHRoXG4gICAgICAgIDogMVxuXG4gICAgICAvLyBpZiBzY3JlZW4gaXMgd2lkZXIgdGhhbiBzY3JvbGxlciwgcmVzZXQgdHJhbnNmb3JtYXRpb25zXG4gICAgICBpZiAoc2Nyb2xsYmFyRmFjdG9yID4gMSkge1xuICAgICAgICB0aGlzLnNldCgnc2NiU2Nyb2xsZWQnLCAwKVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCAwKVxuICAgICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IE1hdGgubWluKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2NiU2Nyb2xsZWQgPSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICByb290Tm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLndpZHRoID0gKHN1bVdpZHRoICsgMSkgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzY3JvbGxiYXJOb2RlLnN0eWxlLndpZHRoID0gKHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcikgKyAncHgnXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogc2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY2JTY3JvbGxlZClcbiAgICAgIHRoaXMuc2V0KCdsaW1pdFJpZ2h0JywgbGltaXRSaWdodClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJGYWN0b3InLCBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyV2lkdGgnLCB3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgfVxuXG4gICAgY2hlY2tTY3JvbGxhYmxlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgc3VtV2lkdGggPSAwLCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBBcnJheS5mcm9tKGl0ZW1Ob2RlcykuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBpZiAod3JhcHBlcldpZHRoID49IHN1bVdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgZmFsc2UpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6ICR7c3VtV2lkdGh9cHhgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDphdXRvYClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAodGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub0FuY2hvcnMpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuXG4gICAgICBpZiAodXNlT3V0ZXJIdG1sKSB7XG4gICAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgICAgdGhpcy5yZW1vdmVBbmNob3JzKClcbiAgICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgICAgdGhpcy5iaW5kQW5jaG9yc0V2ZW50cygpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG5cbiAgICAgIGlmICghdGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIHNjcm9sbGVkLCAwKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRWxlbWVudChlKSB7XG4gICAgICByZXR1cm4gZS50YXJnZXQuY2xvc2VzdChgLiR7dGhpcy5jb25maWcucHJlZml4fWApID09IHRoaXMuc3RhdGUuZWxcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hTdGFydChlKVxuXG4gICAgICBjb25zdCB0b2NoRXZlbnQgPSBpc1RvdWNoRXZlbnQoZSlcbiAgICAgIGlmICghdG9jaEV2ZW50KSBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmICghdG9jaEV2ZW50ICYmICFpc0xlZnRCdXR0b25DbGljayhlKSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ2Rvd25FdmVudFRTJywgRGF0ZS5ub3coKSlcblxuICAgICAgY29uc3QgZGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZ2V0RXZlbnRYKGUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWREaWZmJywgZGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIG9uUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hNb3ZlKGUpXG4gICAgICBpZiAodGhpcy5nZXQoJ3N3aXBlRGlyZWN0aW9uJykgPT09ICd2JykgcmV0dXJuXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgbGV0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuICAgICAgbGV0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggKz0gTWF0aC5yb3VuZCgwLjIgKiBzY3JvbGxiYXJSZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhclJlc3VsdCA9IDBcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJlc3VsdCA+IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCAtPSBNYXRoLnJvdW5kKDAuOCAqIChyZXN1bHQgLSBsaW1pdFJpZ2h0KSAqIHNjcm9sbGJhckZhY3RvcilcbiAgICAgICAgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW92ZUV2ZW50VFMnLCBEYXRlLm5vdygpKVxuICAgICAgdGhpcy5wdXNoKCdwYWdlWCcsIGN1cnJlbnRQYWdlWClcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PT0gJ3YnKSB7XG4gICAgICAgIHRoaXMuY2xlYXJQb2ludGVyU3RhdGUoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG5cbiAgICAgIGNvbnN0IG5vd1RTID0gRGF0ZS5ub3coKVxuICAgICAgY29uc3QgdGltZUZyb21MYXN0TW92ZSA9IChub3dUUyAtIHRoaXMuZ2V0KCdtb3ZlRXZlbnRUUycpKSAvIDEuNVxuICAgICAgY29uc3QgdGltZUZyb21Qb2ludGVyRG93biA9IG5vd1RTIC0gdGhpcy5nZXQoJ2Rvd25FdmVudFRTJylcbiAgICAgIGNvbnN0IGVuZHBvaW50ID0gc2Nyb2xsZWQgLSAoZGlzdGFuY2VEZWx0YSAqIDgpXG5cbiAgICAgIGNvbnN0IGlzQ2xpY2sgPSBsYXN0UGFnZVggPT09IDAgJiYgdGltZUZyb21Qb2ludGVyRG93biA8IDE1MFxuICAgICAgY29uc3QgaXNMb25nQ2xpY2sgPSBsYXN0UGFnZVggPT09IDBcblxuICAgICAgLy8gc2ltcGxlIGNsaWNrXG4gICAgICBpZiAoaXNDbGljaykge1xuICAgICAgICBpZiAodGhpcy5jb25maWcub25DbGljaykgcmV0dXJuIHRoaXMuY29uZmlnLm9uQ2xpY2soZSlcblxuICAgICAgICBjb25zdCBsaW5rTm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgICBpZiAoIWxpbmtOb2RlKSByZXR1cm5cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpXG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICBjb25zdCBjdHJsQ2xpY2sgPSBpc0NvbnRyb2xDbGljayhlKVxuXG4gICAgICAgIGlmIChjdHJsQ2xpY2spIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgICBpZiAoIXRhcmdldCAmJiBocmVmKSByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmXG4gICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZignYmxhbmsnKSA+IC0xICYmIGhyZWYpIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgfVxuXG4gICAgICAvLyBsb25nIGNsaWNrIHdpdGggbm8gbW90aW9uXG4gICAgICBpZiAoaXNMb25nQ2xpY2spIHJldHVyblxuXG4gICAgICAvLyBkcmFnZ2luZ1xuICAgICAgLy8gc3RpY2t5IGxlZnRcbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwLCB0cnVlKVxuICAgICAgLy8gdG9vIG11Y2ggdG8gbGVmdFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMClcbiAgICAgIC8vIHN0aWNreSByaWdodFxuICAgICAgZWxzZSBpZiAoc2Nyb2xsZWQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwLCB0cnVlKVxuICAgICAgLy8gdG9vIG11Y2ggdG8gcmlnaHRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50ID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMClcbiAgICAgIC8vIG90aGVyd2lzZVxuICAgICAgZWxzZSBpZiAodGltZUZyb21MYXN0TW92ZSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLnJvdW5kKE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpIC8gdGltZUZyb21MYXN0TW92ZSlcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBNYXRoLnJvdW5kKGVuZHBvaW50KSwgdGltZVRvRW5kcG9pbnQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xlYXIoJ3BhZ2VYJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25DbGlja0xpbmsoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIGVcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uRm9jdXMoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICAvLyBmb2N1cyByZXNvbHZlLCBzZWU6XG4gICAgICAvLyBodHRwOi8vd2QuZGl6YWluYS5uZXQvZW4vaW50ZXJuZXQtbWFpbnRlbmFuY2UvanMtc2xpZGVycy1hbmQtdGhlLXRhYi1rZXkvXG4gICAgICByb290Tm9kZS5zY3JvbGxMZWZ0ID0gMFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7cm9vdE5vZGUuc2Nyb2xsTGVmdCA9IDB9LCAwKVxuXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZS50YXJnZXQuY2xvc2VzdChgLiR7cHJlZml4fS1pdGVtYClcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIC8vIGNoZWNrIGlmIGVudGVyIGlzIHByZXNzZWRcbiAgICBvbktleURvd24oZSkge1xuICAgICAgaWYgKCFlLmtleUNvZGUgfHwgZS5rZXlDb2RlICE9PSAxMykgcmV0dXJuXG4gICAgICBjb25zdCBjdHJsQ2xpY2sgPSBpc0NvbnRyb2xDbGljayhlKVxuICAgICAgY29uc3QgbG9jYXRpb24gPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgaWYgKGN0cmxDbGljaykgd2luZG93Lm9wZW4obG9jYXRpb24sICdfYmxhbmsnLCB7fSlcbiAgICAgIGVsc2Ugd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb25cbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUuZGVsdGFYIHx8IE1hdGguYWJzKGUuZGVsdGFZKSA+IE1hdGguYWJzKGUuZGVsdGFYKSB8fCAgIXNjcm9sbGFibGUpIHJldHVyblxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qge2RlbHRhWH0gPSBlXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGRlbHRhWCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG5cbiAgICAgIGlmIChyZXN1bHQgPT0gbGltaXRSaWdodCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgZWxzZSB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG4gICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgdHJ1ZSlcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbENsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBzY3JvbGxDbGlja0Rpc2FibGVkID0gdGhpcy5nZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnKVxuXG4gICAgICBpZiAoc2Nyb2xsQ2xpY2tEaXNhYmxlZCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIGZhbHNlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKCFlIHx8ICFlLnByZXZlbnREZWZhdWx0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY2JXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSBsaW1pdFJpZ2h0ICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IHBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBjZW50ZXIgPSBwYWdlWCAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgbGVmdEVkZ2UgPSBjZW50ZXIgLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IHJpZ2h0RWRnZSA9IGNlbnRlciArIHNjYldpZHRoIC8gMlxuXG4gICAgICBsZXQgZW5kcG9pbnQgPSBjZW50ZXIgLyBzY2JGYWN0b3JcbiAgICAgIGlmIChsZWZ0RWRnZSA8IGxpbWl0TGVmdCkgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHJpZ2h0RWRnZSA+IHJpZ2h0U2NiTGltaXQpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkFuY2hvckNsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUudGFyZ2V0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgY29uc3QgYW5jaG9yaWQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hbmNob3JpZF0nKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yaWQnKVxuICAgICAgaWYgKCFhbmNob3JpZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yb3JpZ2luaWQ9XCInICsgYW5jaG9yaWQgKyAnXCJdJywgcm9vdE5vZGUpXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KGUpICYmICFpc0xlZnRCdXR0b25DbGljayhlKSkgcmV0dXJuXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnLCBjdXJyZW50UGFnZVggLSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvcilcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckRvd25QYWdlWCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGRlbHRhID0gKGN1cnJlbnRQYWdlWCAtIHNjcm9sbGJhckRvd25QYWdlWClcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KGRlbHRhIC8gc2Nyb2xsYmFyRmFjdG9yLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBoYW5kbGVUb3VjaFN0YXJ0KGUpIHtcbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KGUpKSByZXR1cm5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFgpXG4gICAgICB0aGlzLnNldCgndG91Y2hZJywgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5jbGllbnRZKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHRvdWNoWCA9IHRoaXMuZ2V0KCd0b3VjaFgnKVxuICAgICAgY29uc3QgdG91Y2hZID0gdGhpcy5nZXQoJ3RvdWNoWScpXG4gICAgICBpZiAoIXRvdWNoWCB8fCAhdG91Y2hZIHx8ICFpc1RvdWNoRXZlbnQoZSkpIHJldHVyblxuXG4gICAgICBjb25zdCB4VXAgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFhcbiAgICAgIGNvbnN0IHlVcCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WVxuXG4gICAgICBjb25zdCB4RGlmZiA9IHRvdWNoWCAtIHhVcFxuICAgICAgY29uc3QgeURpZmYgPSB0b3VjaFkgLSB5VXBcblxuICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSkgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ2gnKVxuICAgICAgZWxzZSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAndicpXG5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCAwKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cblxuICAgIGFuaW1hdGUoc3RhcnQsIHN0b3A9MCwgc3BlZWQ9MTAsIGFuaW1hdGVXaWR0aD1mYWxzZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSBzdG9wIC0gc3RhcnRcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1heCguMDUsIE1hdGgubWluKE1hdGguYWJzKGRlbHRhKSAvIHNwZWVkLCAxKSlcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JykgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGxldCBjdXJyZW50VGltZSA9IHNwZWVkID09IDAgPyAxIDogMCxcbiAgICAgICAgICBlbmRwb2ludCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpLFxuICAgICAgICAgIHNjYkVuZHBvaW50ID0gZW5kcG9pbnQgKiBzY2JGYWN0b3JcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdwb2ludGVyRG93bicpIHx8IHRoaXMuZ2V0KCdtb3VzZVNjcm9sbCcpKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICBlbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpXG4gICAgICAgICAgOiBzdG9wXG5cbiAgICAgICAgc2NiRW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICogc2NiRmFjdG9yICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSAqIHNjYkZhY3RvclxuICAgICAgICAgIDogc3RvcCAqIHNjYkZhY3RvclxuXG4gICAgICAgIHNjYkVuZHBvaW50ID0gTWF0aC5taW4oc2NiRW5kcG9pbnQsIHJpZ2h0U2NiTGltaXQpXG5cbiAgICAgICAgaWYgKCFhbmltYXRlV2lkdGgpIHtcbiAgICAgICAgICBpZiAoc2NiRW5kcG9pbnQgPj0gcmlnaHRTY2JMaW1pdCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgICAgICB0aGlzLnNldFNjYlBvcyhzY2JFbmRwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgc2NidyA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICAgICAgaWYgKHN0YXJ0IDwgc3RvcCkgc2NidyAtPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG4gICAgICAgICAgZWxzZSBzY2J3ICs9IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcblxuICAgICAgICAgIHRoaXMuc2V0V2lkdGgoc2NidylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zKC0xICogZW5kcG9pbnQpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIGVuZHBvaW50KVxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA8IDEpIHJhZih0aWNrKVxuICAgICAgICBlbHNlIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpY2soKVxuICAgIH1cblxuICAgIGNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHNjcm9sbGVkID4gbGltaXRMZWZ0KSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gcHVibGljIEFQSVxuICAgIHNjcm9sbFRvKHBvaW50LCB0aW1lPTEwMDApIHtcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGxldCBlbmRwb2ludCA9ICFpc05hTihwb2ludCkgPyBwYXJzZUludChwb2ludCkgOiAwXG4gICAgICBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KGVuZHBvaW50LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBpZiAocG9pbnQgPT0gJ2VuZCcpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ3N0YXJ0JykgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdjZW50ZXInKSBlbmRwb2ludCA9IGxpbWl0UmlnaHQgLyAyXG5cbiAgICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmdldCgnc2Nyb2xsZWQnKSwgZW5kcG9pbnQsIHRpbWUpXG4gICAgfVxuXG4gICAgdXBkYXRlKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj10aGlzLmNvbmZpZy5hbGlnbixcbiAgICAgICAgbm9BbmNob3JzPXRoaXMuY29uZmlnLm5vQW5jaG9ycyxcbiAgICAgICAgbm9TY3JvbGxiYXI9dGhpcy5jb25maWcubm9TY3JvbGxiYXIsXG4gICAgICAgIHNjcm9sbGJhcixcbiAgICAgICAgYW5jaG9ycyxcbiAgICAgICAgb25DbGljaz10aGlzLmNvbmZpZy5vbkNsaWNrLFxuICAgICAgICBzdGFydD10aGlzLmNvbmZpZy5zdGFydCxcbiAgICAgICAgc3RhcnRBbmltYXRpb249dGhpcy5jb25maWcuc3RhcnRBbmltYXRpb25cbiAgICAgIH0gPSBjb25maWcgfHwge31cblxuICAgICAgdGhpcy5jb25maWcuYWxpZ24gPSBhbGlnblxuICAgICAgdGhpcy5jb25maWcubm9BbmNob3JzID0gIW5vQW5jaG9yc1xuICAgICAgICA/IGFuY2hvcnMgPT0gJ2hpZGRlbidcbiAgICAgICAgOiBhbmNob3JzICE9ICd2aXNpYmxlJ1xuXG4gICAgICB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciA9ICFub1Njcm9sbGJhclxuICAgICAgICA/IHNjcm9sbGJhciA9PSAnaGlkZGVuJ1xuICAgICAgICA6IHNjcm9sbGJhciAhPSAndmlzaWJsZSdcblxuICAgICAgdGhpcy5jb25maWcub25DbGljayA9IG9uQ2xpY2tcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gc3RhcnRcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID0gc3RhcnRBbmltYXRpb25cblxuICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdCBjb25maWdcbiAgY29uc3QgYXV0b2luaXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZWxzID0gZ2V0RWxlbWVudHMoJy5zY3JvbGxlcicpXG4gICAgQXJyYXkuZnJvbShlbHMpLmZvckVhY2goZWwgPT4ge1xuICAgICAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuICAgIH0pXG4gIH1cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gYXV0b2luaXQpXG5cbiAgZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09ICdpbnRlcmFjdGl2ZScpIGF1dG9pbml0KClcbiAgfVxuXG4gIHdpbmRvdy5TY3JvbGxlciA9IFNjcm9sbGVyXG59KCkpXG4iLCJtb2R1bGUuZXhwb3J0cyA9ICh0eXBlb2YgQXJyYXkuZnJvbSA9PT0gJ2Z1bmN0aW9uJyA/XG4gIEFycmF5LmZyb20gOlxuICByZXF1aXJlKCcuL3BvbHlmaWxsJylcbik7XG4iLCIvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1hcnJheS5mcm9tXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbihmbikge1xuICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7XG4gIH07XG4gIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gMDsgfVxuICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHsgcmV0dXJuIG51bWJlcjsgfVxuICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICB9O1xuICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xuICB9O1xuICB2YXIgaXRlcmF0b3JQcm9wID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZih2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBpZihbJ3N0cmluZycsJ251bWJlcicsJ2Jvb2xlYW4nLCdzeW1ib2wnXS5pbmRleE9mKHR5cGVvZiB2YWx1ZSkgPiAtMSl7XG4gICAgICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICgnaXRlcmF0b3InIGluIFN5bWJvbCkgJiZcbiAgICAgICAgKFN5bWJvbC5pdGVyYXRvciBpbiB2YWx1ZSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfVxuICAgICAgLy8gU3VwcG9ydCBcIkBAaXRlcmF0b3JcIiBwbGFjZWhvbGRlciwgR2Vja28gMjcgdG8gR2Vja28gMzVcbiAgICAgIGVsc2UgaWYgKCdAQGl0ZXJhdG9yJyBpbiB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gJ0BAaXRlcmF0b3InO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKE8sIFApIHtcbiAgICAvLyBBc3NlcnQ6IElzUHJvcGVydHlLZXkoUCkgaXMgdHJ1ZS5cbiAgICBpZiAoTyAhPSBudWxsICYmIFAgIT0gbnVsbCkge1xuICAgICAgLy8gTGV0IGZ1bmMgYmUgR2V0VihPLCBQKS5cbiAgICAgIHZhciBmdW5jID0gT1tQXTtcbiAgICAgIC8vIFJldHVybklmQWJydXB0KGZ1bmMpLlxuICAgICAgLy8gSWYgZnVuYyBpcyBlaXRoZXIgdW5kZWZpbmVkIG9yIG51bGwsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZihmdW5jID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIC8vIElmIElzQ2FsbGFibGUoZnVuYykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZ1bmMgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuYztcbiAgICB9XG4gIH07XG4gIHZhciBpdGVyYXRvclN0ZXAgPSBmdW5jdGlvbihpdGVyYXRvcikge1xuICAgIC8vIExldCByZXN1bHQgYmUgSXRlcmF0b3JOZXh0KGl0ZXJhdG9yKS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChyZXN1bHQpLlxuICAgIHZhciByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgLy8gTGV0IGRvbmUgYmUgSXRlcmF0b3JDb21wbGV0ZShyZXN1bHQpLlxuICAgIC8vIFJldHVybklmQWJydXB0KGRvbmUpLlxuICAgIHZhciBkb25lID0gQm9vbGVhbihyZXN1bHQuZG9uZSk7XG4gICAgLy8gSWYgZG9uZSBpcyB0cnVlLCByZXR1cm4gZmFsc2UuXG4gICAgaWYoZG9uZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oaXRlbXMgLyosIG1hcEZuLCB0aGlzQXJnICovICkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgIHZhciBDID0gdGhpcztcblxuICAgIC8vIDIuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG5cbiAgICB2YXIgVDtcbiAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gMy4gZWxzZVxuICAgICAgLy8gICBhLiBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbidcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gICBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVFxuICAgICAgLy8gICAgICBiZSB1bmRlZmluZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cbiAgICAgIC8vICAgYy4gTGV0IG1hcHBpbmcgYmUgdHJ1ZSAoaW1wbGllZCBieSBtYXBGbilcbiAgICB9XG5cbiAgICB2YXIgQSwgaztcblxuICAgIC8vIDQuIExldCB1c2luZ0l0ZXJhdG9yIGJlIEdldE1ldGhvZChpdGVtcywgQEBpdGVyYXRvcikuXG4gICAgLy8gNS4gUmV0dXJuSWZBYnJ1cHQodXNpbmdJdGVyYXRvcikuXG4gICAgdmFyIHVzaW5nSXRlcmF0b3IgPSBnZXRNZXRob2QoaXRlbXMsIGl0ZXJhdG9yUHJvcChpdGVtcykpO1xuXG4gICAgLy8gNi4gSWYgdXNpbmdJdGVyYXRvciBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHVzaW5nSXRlcmF0b3IgIT09IHZvaWQgMCkge1xuICAgICAgLy8gYS4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAgIGkuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXVxuICAgICAgLy8gICAgICBpbnRlcm5hbCBtZXRob2Qgb2YgQyB3aXRoIGFuIGVtcHR5IGFyZ3VtZW50IGxpc3QuXG4gICAgICAvLyBiLiBFbHNlLFxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIHRoZSBhYnN0cmFjdCBvcGVyYXRpb24gQXJyYXlDcmVhdGVcbiAgICAgIC8vICAgICAgd2l0aCBhcmd1bWVudCAwLlxuICAgICAgLy8gYy4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQygpKSA6IFtdO1xuXG4gICAgICAvLyBkLiBMZXQgaXRlcmF0b3IgYmUgR2V0SXRlcmF0b3IoaXRlbXMsIHVzaW5nSXRlcmF0b3IpLlxuICAgICAgdmFyIGl0ZXJhdG9yID0gdXNpbmdJdGVyYXRvci5jYWxsKGl0ZW1zKTtcblxuICAgICAgLy8gZS4gUmV0dXJuSWZBYnJ1cHQoaXRlcmF0b3IpLlxuICAgICAgaWYgKGl0ZXJhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZi4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuXG4gICAgICAvLyBnLiBSZXBlYXRcbiAgICAgIHZhciBuZXh0LCBuZXh0VmFsdWU7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAvLyBpLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgIC8vIGlpLiBMZXQgbmV4dCBiZSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpLlxuICAgICAgICAvLyBpaWkuIFJldHVybklmQWJydXB0KG5leHQpLlxuICAgICAgICBuZXh0ID0gaXRlcmF0b3JTdGVwKGl0ZXJhdG9yKTtcblxuICAgICAgICAvLyBpdi4gSWYgbmV4dCBpcyBmYWxzZSwgdGhlblxuICAgICAgICBpZiAoIW5leHQpIHtcblxuICAgICAgICAgIC8vIDEuIExldCBzZXRTdGF0dXMgYmUgU2V0KEEsIFwibGVuZ3RoXCIsIGssIHRydWUpLlxuICAgICAgICAgIC8vIDIuIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICAgICAgQS5sZW5ndGggPSBrO1xuXG4gICAgICAgICAgLy8gMy4gUmV0dXJuIEEuXG4gICAgICAgICAgcmV0dXJuIEE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdi4gTGV0IG5leHRWYWx1ZSBiZSBJdGVyYXRvclZhbHVlKG5leHQpLlxuICAgICAgICAvLyB2aS4gUmV0dXJuSWZBYnJ1cHQobmV4dFZhbHVlKVxuICAgICAgICBuZXh0VmFsdWUgPSBuZXh0LnZhbHVlO1xuXG4gICAgICAgIC8vIHZpaS4gSWYgbWFwcGluZyBpcyB0cnVlLCB0aGVuXG4gICAgICAgIC8vICAgMS4gTGV0IG1hcHBlZFZhbHVlIGJlIENhbGwobWFwZm4sIFQsIMKrbmV4dFZhbHVlLCBrwrspLlxuICAgICAgICAvLyAgIDIuIElmIG1hcHBlZFZhbHVlIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vICAgMy4gTGV0IG1hcHBlZFZhbHVlIGJlIG1hcHBlZFZhbHVlLltbdmFsdWVdXS5cbiAgICAgICAgLy8gdmlpaS4gRWxzZSwgbGV0IG1hcHBlZFZhbHVlIGJlIG5leHRWYWx1ZS5cbiAgICAgICAgLy8gaXguICBMZXQgZGVmaW5lU3RhdHVzIGJlIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgLy8gICAgICBDcmVhdGVEYXRhUHJvcGVydHlPclRocm93KEEsIFBrLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vIHguIFtUT0RPXSBJZiBkZWZpbmVTdGF0dXMgaXMgYW4gYWJydXB0IGNvbXBsZXRpb24sIHJldHVyblxuICAgICAgICAvLyAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBkZWZpbmVTdGF0dXMpLlxuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gbWFwRm4uY2FsbChULCBuZXh0VmFsdWUsIGspO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIEFba10gPSBuZXh0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8geGkuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgICAgaysrO1xuICAgICAgfVxuICAgICAgLy8gNy4gQXNzZXJ0OiBpdGVtcyBpcyBub3QgYW4gSXRlcmFibGUgc28gYXNzdW1lIGl0IGlzXG4gICAgICAvLyAgICBhbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyA4LiBMZXQgYXJyYXlMaWtlIGJlIFRvT2JqZWN0KGl0ZW1zKS5cbiAgICAgIHZhciBhcnJheUxpa2UgPSBPYmplY3QoaXRlbXMpO1xuXG4gICAgICAvLyA5LiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoaXRlbXMgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlbiBiZSBUb0xlbmd0aChHZXQoYXJyYXlMaWtlLCBcImxlbmd0aFwiKSkuXG4gICAgICAvLyAxMS4gUmV0dXJuSWZBYnJ1cHQobGVuKS5cbiAgICAgIHZhciBsZW4gPSB0b0xlbmd0aChhcnJheUxpa2UubGVuZ3RoKTtcblxuICAgICAgLy8gMTIuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIENvbnN0cnVjdChDLCDCq2xlbsK7KS5cbiAgICAgIC8vIDEzLiBFbHNlXG4gICAgICAvLyAgICAgYS4gTGV0IEEgYmUgQXJyYXlDcmVhdGUobGVuKS5cbiAgICAgIC8vIDE0LiBSZXR1cm5JZkFicnVwdChBKS5cbiAgICAgIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XG5cbiAgICAgIC8vIDE1LiBMZXQgayBiZSAwLlxuICAgICAgayA9IDA7XG4gICAgICAvLyAxNi4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGFycmF5TGlrZVtrXTtcbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDE3LiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgLy8gMTguIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICBBLmxlbmd0aCA9IGxlbjtcbiAgICAgIC8vIDE5LiBSZXR1cm4gQS5cbiAgICB9XG4gICAgcmV0dXJuIEE7XG4gIH07XG59KSgpO1xuIl19
