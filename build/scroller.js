(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    return navigator.userAgent.toLowerCase().indexOf("android") > -1;
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

        if (this.get('swipeDirection') == 'v') {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7QUFFVjs7QUFFQSxNQUFJLENBQUMsTUFBTSxJQUFYLEVBQWlCLE1BQU0sSUFBTixHQUFhLFFBQVEsWUFBUixDQUFiOztBQUdqQjs7QUFFQSxHQUFDLFVBQVUsR0FBVixFQUFlO0FBQ2QsUUFBSSxPQUFKLENBQVksVUFBVSxJQUFWLEVBQWdCO0FBQzFCLFVBQUksS0FBSyxjQUFMLENBQW9CLFFBQXBCLENBQUosRUFBbUM7O0FBRW5DLGFBQU8sY0FBUCxDQUFzQixJQUF0QixFQUE0QixRQUE1QixFQUFzQztBQUNwQyxzQkFBYyxJQURzQjtBQUVwQyxvQkFBWSxJQUZ3QjtBQUdwQyxrQkFBVSxJQUgwQjtBQUlwQyxlQUFPLFNBQVMsTUFBVCxHQUFrQjtBQUN2QixlQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsSUFBNUI7QUFDRDtBQU5tQyxPQUF0QztBQVFELEtBWEQ7QUFZRCxHQWJELEVBYUcsQ0FBQyxRQUFRLFNBQVQsRUFBb0IsY0FBYyxTQUFsQyxFQUE2QyxhQUFhLFNBQTFELENBYkg7O0FBZ0JBOztBQUVBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtBQUFBLFVBQW1ELEtBQUssSUFBeEQ7QUFDQSxhQUFPLE1BQU0sU0FBTixDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUEwQixPQUExQixFQUFt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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbigpIHtcbiAgXG4gIC8vIEFycmF5LmZyb20gcG9seWZpbGxcbiAgXG4gIGlmICghQXJyYXkuZnJvbSkgQXJyYXkuZnJvbSA9IHJlcXVpcmUoJ2FycmF5LWZyb20nKTtcbiAgXG5cbiAgLy8gcmVtb3ZlIHBvbHlmaWxsXG5cbiAgKGZ1bmN0aW9uIChhcnIpIHtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3JlbW92ZScpKSByZXR1cm5cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0pKFtFbGVtZW50LnByb3RvdHlwZSwgQ2hhcmFjdGVyRGF0YS5wcm90b3R5cGUsIERvY3VtZW50VHlwZS5wcm90b3R5cGVdKVxuXG5cbiAgLy8gbWF0Y2hlcyBwb2x5ZmlsbFxuXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzU2VsZWN0b3IgfHwgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIHRoID0gdGhpc1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zb21lLmNhbGwobWF0Y2hlcywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHJldHVybiBlID09PSB0aFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNsb3Nlc3QgcG9seWZpbGxcblxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXNcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubWF0Y2hlcyhjc3MpKSByZXR1cm4gbm9kZVxuICAgICAgICBlbHNlIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuXG4gIC8vIGhlbHBlcnNcblxuICBjb25zdCBnZXRFbGVtZW50ID0gKHNlbGVjdG9yPScnLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGUgPyBub2RlWzBdIDogbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RWxlbWVudHMgPSAoc2VsZWN0b3I9JycsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGVzID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGVzIHx8IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEV2ZW50WCA9IGUgPT4ge1xuICAgIHJldHVybiBlLmNoYW5nZWRUb3VjaGVzXG4gICAgICAgICYmIGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoXG4gICAgICAgICYmIGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIHx8IGUudG91Y2hlc1xuICAgICAgICAmJiBlLnRvdWNoZXMubGVuZ3RoXG4gICAgICAgICYmIGUudG91Y2hlc1swXS5wYWdlWFxuICAgICAgfHwgZS5wYWdlWCBcbiAgICAgIHx8IDBcbiAgfVxuXG4gIGNvbnN0IGlzQ29udHJvbENsaWNrID0gZSA9PlxuICAgIGUuY3RybEtleSB8fCBlLm1ldGFLZXlcblxuICBjb25zdCBpc0xlZnRCdXR0b25DbGljayA9IGUgPT5cbiAgICBlLndoaWNoID09PSAxIHx8IGUuYnV0dG9uID09PSAwXG5cbiAgY29uc3QgaXNUb3VjaEV2ZW50ID0gZSA9PlxuICAgICEhZS50b3VjaGVzIHx8ICEhZS5jaGFuZ2VkVG91Y2hlc1xuXG4gIGNvbnN0IGdldENoaWxkcmVuID0gKGVsKSA9PiB7XG4gICAgbGV0IGNoaWxkTm9kZXMgPSBlbC5jaGlsZE5vZGVzLFxuICAgICAgICBjaGlsZHJlbiA9IFtdLFxuICAgICAgICBpID0gY2hpbGROb2Rlcy5sZW5ndGhcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChjaGlsZE5vZGVzW2ldLm5vZGVUeXBlID09IDEpIGNoaWxkcmVuLnVuc2hpZnQoY2hpbGROb2Rlc1tpXSlcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGRyZW5cbiAgfVxuXG4gIGNvbnN0IGlzQW5kcm9pZCA9ICgpID0+IHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJhbmRyb2lkXCIpID4gLTFcbiAgfVxuXG5cblxuICAvLyBzY3JvbGxlclxuXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249J2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI9ZmFsc2UsXG4gICAgICAgIHNjcm9sbGJhcj0ndmlzaWJsZScsXG4gICAgICAgIGFuY2hvcnM9J3Zpc2libGUnLFxuICAgICAgICBzdGFydD0wLFxuICAgICAgICBzdGFydEFuaW1hdGlvbj1mYWxzZSxcbiAgICAgICAgZWwsXG4gICAgICAgIG9uQ2xpY2ssXG4gICAgICAgIHVzZU91dGVySHRtbD1mYWxzZSxcbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbixcbiAgICAgICAgLy8gbm9BbmNob3JzLCBub1Njcm9sbGJhciDigJQgbGVnYWN5XG4gICAgICAgIG5vQW5jaG9yczogYW5jaG9ycyA9PSAnaGlkZGVuJyB8fCBub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBzY3JvbGxiYXIgPT0gJ2hpZGRlbicgfHwgbm9TY3JvbGxiYXIsXG4gICAgICAgIG9uQ2xpY2s6IG9uQ2xpY2ssXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgc3RhcnRBbmltYXRpb246IHN0YXJ0QW5pbWF0aW9uLFxuXG4gICAgICAgIHByZWZpeDogJ2FiX3Njcm9sbGVyJyxcbiAgICAgICAgZHJhZ2dpbmdDbHNubTogJ2lzLWRyYWdnaW5nJyxcbiAgICAgICAgbGVmdEFsaWduQ2xzbm06ICdpcy1sZWZ0LWFsaWduJyxcbiAgICAgICAgYm9yZGVyVnNibENsc25tOiAnaXMtdmlzaWJsZScsXG4gICAgICAgIG5vQW5jaG9yc0Nsc25tOiAnaXMtbm8tYW5jaG9ycycsXG4gICAgICAgIG5vU2Nyb2xsYmFyQ2xzbm06ICdpcy1uby1zY3JvbGxiYXInLFxuXG4gICAgICAgIC8vIGlmIHdlIGRvbid0IG5lZWQgdG8gY3JlYXRlIG1hcmt1cFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSByZWFjdCBjb21wb25lbnQgd2lsbCByZW5kZXIgaHRtbCBieSBpdHNlbGZcbiAgICAgICAgLy8gc28gd2UganVzdCB0YWtlIG91dGVyIG1hcmt1cCBpbnN0ZWFkXG4gICAgICAgIHVzZU91dGVySHRtbDogdXNlT3V0ZXJIdG1sLFxuXG4gICAgICAgIGVhc2luZzogcG9zID0+IHBvcyA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogcG9zKSArIDEsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBzY3JvbGxhYmxlOiB0cnVlLFxuXG4gICAgICAgIHBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgc2Nyb2xsYmFyUG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBtb3VzZVNjcm9sbDogZmFsc2UsXG5cbiAgICAgICAgc2Nyb2xsYmFyV2lkdGg6IDAsXG4gICAgICAgIHNjcm9sbGJhckZhY3RvcjogMCxcblxuICAgICAgICBwYWdlWDogW10sXG4gICAgICAgIHNjcm9sbGVkRGlmZjogMCxcbiAgICAgICAgZG93bkV2ZW50VFM6IDAsXG4gICAgICAgIG1vdmVFdmVudFRTOiAwLFxuXG4gICAgICAgIHNjcm9sbGJhckRvd25QYWdlWDogMCxcbiAgICAgICAgc2Nyb2xsQ2xpY2tEaXNhYmxlZDogZmFsc2UsXG5cbiAgICAgICAgbGltaXRMZWZ0OiAwLFxuICAgICAgICBsaW1pdFJpZ2h0OiAwLFxuICAgICAgICBzdHJpcFdpZHRoOiAwLFxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uOiBudWxsLFxuICAgICAgICB0b3VjaFg6IDAsXG4gICAgICAgIHRvdWNoWTogMCxcblxuICAgICAgICBsZXQ6IGVsLmhhc0NoaWxkTm9kZXMoKSAmJiBnZXRDaGlsZHJlbihlbCkubGVuZ3RoIHx8IDAsXG4gICAgICAgIGVsOiBlbCB8fCBudWxsLFxuXG4gICAgICAgIGlzQW5kcm9pZDogaXNBbmRyb2lkKClcbiAgICAgIH1cblxuICAgICAgd2luZG93LnJhZiA9ICgoKSA9PiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge3NldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCl9XG4gICAgICB9KSgpXG5cbiAgICAgIHRoaXMuaW5pdChlbClcbiAgICB9XG5cblxuICAgIGdldChwcm9wKSB7XG4gICAgICByZXR1cm4gdHlwZW9mKHRoaXMuc3RhdGVbcHJvcF0pICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgc2V0KHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdID0gdmFsdWVcbiAgICB9XG5cbiAgICBwdXNoKHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdICYmIHRoaXMuc3RhdGVbcHJvcF0ucHVzaCh2YWx1ZSlcbiAgICB9XG5cbiAgICBjbGVhcihwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGlmIChmaWVsZCAmJiBmaWVsZC5sZW5ndGgpIGZpZWxkLmxlbmd0aCA9IDBcbiAgICB9XG5cbiAgICBnZXRMYXN0TWVhbmluZ2Z1bGwocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBjb25zdCB0b0lnbm9yZSA9IGZpZWxkICYmIGZpZWxkLmxlbmd0aCAmJiBmaWVsZC5sZW5ndGggPiAzID8gMyA6IDFcbiAgICAgIHJldHVybiBmaWVsZFtmaWVsZC5sZW5ndGggLSB0b0lnbm9yZV0gfHwgMFxuICAgIH1cblxuXG4gICAgYWRkQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBpZiAoIW5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2wrJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKSkgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsXG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFxzK3xeKScrY2wrJyhcXFxccyt8JCknLCAnZycpLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICB9XG5cbiAgICBhbGlnblNjYlRvUmlnaHQoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cbiAgICByZWxlYXNlU2NiKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZWwsICdpcy1yaWdodCcpXG4gICAgfVxuXG5cbiAgICBzZXRQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsLCBwb3MpXG4gICAgfVxuXG4gICAgc2V0U2NiUG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbihlbCwgcG9zKSB7XG4gICAgICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICAgIGVsLnN0eWxlLk1velRyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5tc1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5PVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgIH1cblxuICAgIHNldFdpZHRoKHdpZHRoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgZWwuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgICB9XG5cbiAgICBjbGVhclBvaW50ZXJTdGF0ZSgpIHtcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsIG51bGwpXG4gICAgICB0aGlzLmNsZWFyKCdwYWdlWCcpXG4gICAgfVxuXG5cbiAgICBpbml0KGVsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVdyYXBwZXIoKVxuICAgICAgdGhpcy53cmFwSXRlbXMoKVxuICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuXG4gICAgICBjb25zdCBhbmNob3JzTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1hbmNob3JgLCByb290Tm9kZSlcblxuICAgICAgLy8gY29uZmlnXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuY29uZmlnLmFsaWduICE9PSAnY2VudGVyJyB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdGFsaWduJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0QWxpZ24nKSB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKSB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdGlmd2lkZScpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5jb25maWcubm9BbmNob3JzIHx8IFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9ycycpID09ICdoaWRkZW4nIHx8XG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub2FuY2hvcnMnKSB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9BbmNob3JzJylcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbGJhcicpID09ICdoaWRkZW4nIHx8XG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub3Njcm9sbGJhcicpIHx8XG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub1Njcm9sbGJhcicpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydCcpKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0JylcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnRBbmltYXRpb24nKSB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0YW5pbWF0aW9uJylcbiAgICAgICkge1xuICAgICAgICB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA9IHRydWVcbiAgICAgIH1cblxuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBzY3JvbGxiYXJOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG5cbiAgICAgIHNjcm9sbE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uU2Nyb2xsQ2xpY2suYmluZCh0aGlzKSlcblxuICAgICAgY29uc3Qgd2hlZWxFdmVudCA9ICgvRmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpID8gJ3doZWVsJyA6ICdtb3VzZXdoZWVsJ1xuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIod2hlZWxFdmVudCwgdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMpKVxuXG4gICAgICB0aGlzLmJpbmRBbmNob3JzRXZlbnRzKClcblxuICAgICAgLy8gcHJldmVudCBjbGlja25nIG9uIGxpbmtzIGFuZCBoYW5kbGUgZm9jdXMgZXZlbnRcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMub25Gb2N1cy5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24uYmluZCh0aGlzKSwgZmFsc2UpXG4gICAgICB9KVxuXG4gICAgICAvLyByZXJlbmRlclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGUgPT4ge1xuICAgICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cblxuICAgICAgY29uc3Qgc3RhcnRBbmltYXRpb25IZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNlbnRyYWxOb2RlID0gdGhpcy5maW5kQ2VudHJhbE5vZGUoKVxuICAgICAgICBjb25zdCBhbmltYXRpb24gPSB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA/IDEwMDAgOiAwXG4gICAgICAgIGxldCBlbmRwb2ludFxuICAgICAgICBcbiAgICAgICAgaWYgKGNlbnRyYWxOb2RlKSB7XG4gICAgICAgICAgZW5kcG9pbnQgPSBjZW50cmFsTm9kZS5vZmZzZXRMZWZ0IFxuICAgICAgICAgICAgLSAod3JhcHBlck5vZGUub2Zmc2V0V2lkdGggLyAyKSBcbiAgICAgICAgICAgICsgKGNlbnRyYWxOb2RlLm9mZnNldFdpZHRoIC8gMilcblxuICAgICAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oY2VudHJhbE5vZGUub2Zmc2V0TGVmdCwgZW5kcG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBlbmRwb2ludCA9IHRoaXMuY29uZmlnLnN0YXJ0XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNjcm9sbFRvKGVuZHBvaW50LCBhbmltYXRpb24pXG4gICAgICB9XG5cblxuICAgICAgLy8gY2hlY2sgaWYgc2Nyb2xsZXIgaXMgaW4gaGlkZGVuIGJsb2NrXG4gICAgICBjb25zdCBpc0hpZGRlbiA9IGVsID0+IGVsLm9mZnNldFBhcmVudCA9PT0gbnVsbFxuXG4gICAgICBpZiAoaXNIaWRkZW4ocm9vdE5vZGUpKSB7XG4gICAgICAgIGxldCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIGlmICghaXNIaWRkZW4ocm9vdE5vZGUpKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgICAgICAvLyB0cmlnZ2VyaW5nIHJlc2l6ZSBpcyBub3QgcmVsaWFibGVcbiAgICAgICAgICAgIC8vIGp1c3QgcmVjYWxjIHR3aWNlXG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKClcblxuICAgICAgICAgICAgc3RhcnRBbmltYXRpb25IZWxwZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApXG4gICAgICB9XG5cbiAgICAgIFxuICAgICAgc3RhcnRBbmltYXRpb25IZWxwZXIoKVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgIH1cblxuXG4gICAgYmluZEFuY2hvcnNFdmVudHMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuICAgIH1cblxuXG4gICAgY3JlYXRlV3JhcHBlcigpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VPdXRlckh0bWwpIHJldHVyblxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYW5jaG9yc1wiPjwvZGl2PlxuICAgICAgPC9kaXY+YFxuXG4gICAgICByb290Tm9kZS5pbm5lckhUTUwgPSB3cmFwcGVySHRtbFxuICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgcHJlZml4KVxuICAgIH1cblxuICAgIHdyYXBJdGVtcygpIHtcbiAgICAgIGNvbnN0IHVzZU91dGVySHRtbCA9IHRoaXMuY29uZmlnLnVzZU91dGVySHRtbFxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBBcnJheS5mcm9tKGdldENoaWxkcmVuKHdyYXBwZXJOb2RlKSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGlmICh1c2VPdXRlckh0bWwpIHtcbiAgICAgICAgICB0aGlzLmFkZENsYXNzKGl0ZW1Ob2RlLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGl0ZW1XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICBpdGVtV3JhcHBlci5pbm5lckhUTUwgPSBpdGVtTm9kZS5vdXRlckhUTUxcbiAgICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgICBpdGVtTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpdGVtV3JhcHBlciwgaXRlbU5vZGUpXG4gICAgICAgICAgaXRlbU5vZGUucmVtb3ZlKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBmaW5kQ2VudHJhbE5vZGUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgY2VudHJhbE5vZGVzID0gZ2V0RWxlbWVudHMoYFtkYXRhLWNlbnRyYWw9XCJ0cnVlXCJdYCwgcm9vdE5vZGUpXG4gICAgICByZXR1cm4gY2VudHJhbE5vZGVzICYmIGNlbnRyYWxOb2Rlcy5sZW5ndGggXG4gICAgICAgID8gY2VudHJhbE5vZGVzW2NlbnRyYWxOb2Rlcy5sZW5ndGggLSAxXS5jbG9zZXN0KGAuJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICByZW1vdmVBbmNob3JzKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBhbmNXcmFwcGVyTm9kZS5pbm5lckhUTUwgPSAnJ1xuICAgIH1cblxuICAgIGNyZWF0ZUFuY2hvcnMoKSB7XG4gICAgICBjb25zdCB1c2VPdXRlckh0bWwgPSB0aGlzLmNvbmZpZy51c2VPdXRlckh0bWxcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgYW5jaG9yc0h0bWwgPSAnJywgY291bnRlciA9IDBcblxuICAgICAgQXJyYXkuZnJvbShnZXRDaGlsZHJlbih3cmFwcGVyTm9kZSkpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gdXNlT3V0ZXJIdG1sIFxuICAgICAgICAgID8gaXRlbU5vZGVcbiAgICAgICAgICA6IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcl0nLCBpdGVtTm9kZSlcblxuICAgICAgICBjb25zdCBhbmNob3JUZXh0ID0gdGFyZ2V0Tm9kZSBcbiAgICAgICAgICA/IHRhcmdldE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcicpXG4gICAgICAgICAgOiAnJ1xuXG4gICAgICAgIGFuY2hvcnNIdG1sICs9IGA8c3BhbiBkYXRhLWFuY2hvcmlkPVwiJHtjb3VudGVyfVwiIGNsYXNzPVwiJHtwcmVmaXh9LWFuY2hvclwiPjxzcGFuPiR7YW5jaG9yVGV4dH08L3NwYW4+PC9zcGFuPmBcbiAgICAgICAgaXRlbU5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcm9yaWdpbmlkJywgY291bnRlcilcbiAgICAgICAgY291bnRlcisrXG4gICAgICB9KVxuXG4gICAgICBhbmNXcmFwcGVyTm9kZS5pbm5lckhUTUwgPSBhbmNob3JzSHRtbFxuICAgIH1cblxuICAgIHNldFNpemUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGx3cmFwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsd3JhcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICByb290Tm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzdHJpcE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgd3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc2Nyb2xsYmFyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzY3JvbGx3cmFwTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG5cbiAgICAgIEFycmF5LmZyb20oaXRlbU5vZGVzKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGl0ZW1Ob2RlLm9mZnNldEhlaWdodFxuICAgICAgICBpZiAoY3VycmVudEhlaWdodCA+IG1heEhlaWdodCkgbWF4SGVpZ2h0ID0gY3VycmVudEhlaWdodFxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgY29uc3Qgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBXaWR0aCA9IHNjcm9sbHdyYXBOb2RlLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gc3VtV2lkdGggKyAxIC0gcm9vdE5vZGUub2Zmc2V0V2lkdGhcblxuICAgICAgLy8gb3RoZXJ3aXNlIHdpbGwgYmUgTmFOXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSBzY3JvbGx3cmFwV2lkdGggIT09IDAgJiYgc3VtV2lkdGggIT09IDAgXG4gICAgICAgID8gc2Nyb2xsd3JhcFdpZHRoIC8gc3VtV2lkdGhcbiAgICAgICAgOiAxXG5cbiAgICAgIC8vIGlmIHNjcmVlbiBpcyB3aWRlciB0aGFuIHNjcm9sbGVyLCByZXNldCB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgIGlmIChzY3JvbGxiYXJGYWN0b3IgPj0gMSkge1xuICAgICAgICB0aGlzLnNldCgnc2NiU2Nyb2xsZWQnLCAwKVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCAwKVxuICAgICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IE1hdGgubWluKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2NiU2Nyb2xsZWQgPSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICByb290Tm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLndpZHRoID0gKHN1bVdpZHRoICsgMSkgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzY3JvbGxiYXJOb2RlLnN0eWxlLndpZHRoID0gKHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcikgKyAncHgnXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogc2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY2JTY3JvbGxlZClcbiAgICAgIHRoaXMuc2V0KCdsaW1pdFJpZ2h0JywgbGltaXRSaWdodClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJGYWN0b3InLCBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyV2lkdGgnLCB3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgfVxuXG4gICAgY2hlY2tTY3JvbGxhYmxlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgc3VtV2lkdGggPSAwLCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBBcnJheS5mcm9tKGl0ZW1Ob2RlcykuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBpZiAod3JhcHBlcldpZHRoID49IHN1bVdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgZmFsc2UpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6ICR7c3VtV2lkdGh9cHhgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDphdXRvYClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAodGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub0FuY2hvcnMpIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuICAgICAgZWxzZSB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhckNsc25tKVxuXG4gICAgICBpZiAodXNlT3V0ZXJIdG1sKSB7XG4gICAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgICAgdGhpcy5yZW1vdmVBbmNob3JzKClcbiAgICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgICAgdGhpcy5iaW5kQW5jaG9yc0V2ZW50cygpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG5cbiAgICAgIGlmICghdGhpcy5jb25maWcubm9TY3JvbGxiYXIpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIHNjcm9sbGVkLCAwKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrRWxlbWVudChlKSB7XG4gICAgICByZXR1cm4gZS50YXJnZXQuY2xvc2VzdChgLiR7dGhpcy5jb25maWcucHJlZml4fWApID09IHRoaXMuc3RhdGUuZWxcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hTdGFydChlKVxuICAgICAgXG4gICAgICBjb25zdCB0b2NoRXZlbnQgPSBpc1RvdWNoRXZlbnQoZSlcbiAgICAgIGlmICghdG9jaEV2ZW50KSBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmICghdG9jaEV2ZW50ICYmICFpc0xlZnRCdXR0b25DbGljayhlKSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ2Rvd25FdmVudFRTJywgRGF0ZS5ub3coKSlcblxuICAgICAgY29uc3QgZGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZ2V0RXZlbnRYKGUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWREaWZmJywgZGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIG9uUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBcbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hNb3ZlKGUpXG4gICAgICBpZiAodGhpcy5nZXQoJ3N3aXBlRGlyZWN0aW9uJykgPT0gJ3YnKSByZXR1cm5cbiAgICAgIFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkRGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZERpZmYnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICAvLyBkcmFnIHRvIGxlZnQgaXMgcG9zaXRpdmUgbnVtYmVyXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGxldCByZXN1bHQgPSBzY3JvbGxlZERpZmYgLSBjdXJyZW50UGFnZVhcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBsZXQgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG4gICAgICBsZXQgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuXG4gICAgICBpZiAocmVzdWx0IDwgbGltaXRMZWZ0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCArPSBNYXRoLnJvdW5kKDAuMiAqIHNjcm9sbGJhclJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyUmVzdWx0ID0gMFxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoIC09IE1hdGgucm91bmQoMC44ICogKHJlc3VsdCAtIGxpbWl0UmlnaHQpICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgICB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIERhdGUubm93KCkpXG4gICAgICB0aGlzLnB1c2goJ3BhZ2VYJywgY3VycmVudFBhZ2VYKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgaWYgKHRoaXMuZ2V0KCdzd2lwZURpcmVjdGlvbicpID09ICd2Jykge1xuICAgICAgICB0aGlzLmNsZWFyUG9pbnRlclN0YXRlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZ2V0RWxlbWVudCgnaHRtbCcpLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IGxhc3RQYWdlWCA9IHRoaXMuZ2V0TGFzdE1lYW5pbmdmdWxsKCdwYWdlWCcpXG4gICAgICBjb25zdCBjdXJyZW50RXZlbnRYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBkaXN0YW5jZURlbHRhID0gY3VycmVudEV2ZW50WCAtIGxhc3RQYWdlWFxuXG4gICAgICBjb25zdCBub3dUUyA9IERhdGUubm93KClcbiAgICAgIGNvbnN0IHRpbWVGcm9tTGFzdE1vdmUgPSAobm93VFMgLSB0aGlzLmdldCgnbW92ZUV2ZW50VFMnKSkgLyAxLjVcbiAgICAgIGNvbnN0IHRpbWVGcm9tUG9pbnRlckRvd24gPSBub3dUUyAtIHRoaXMuZ2V0KCdkb3duRXZlbnRUUycpXG4gICAgICBjb25zdCBlbmRwb2ludCA9IHNjcm9sbGVkIC0gKGRpc3RhbmNlRGVsdGEgKiA4KVxuXG4gICAgICBjb25zdCBpc0NsaWNrID0gbGFzdFBhZ2VYID09PSAwICYmIHRpbWVGcm9tUG9pbnRlckRvd24gPCAxNTBcbiAgICAgIGNvbnN0IGlzTG9uZ0NsaWNrID0gbGFzdFBhZ2VYID09PSAwXG5cbiAgICAgIC8vIHNpbXBsZSBjbGlja1xuICAgICAgaWYgKGlzQ2xpY2spIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm9uQ2xpY2spIHJldHVybiB0aGlzLmNvbmZpZy5vbkNsaWNrKGUpXG5cbiAgICAgICAgY29uc3QgbGlua05vZGUgPSBlLnRhcmdldC5jbG9zZXN0KCdhJylcbiAgICAgICAgaWYgKCFsaW5rTm9kZSkgcmV0dXJuXG5cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbGlua05vZGUuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKVxuICAgICAgICBjb25zdCBocmVmID0gbGlua05vZGUuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICAgICAgY29uc3QgY3RybENsaWNrID0gaXNDb250cm9sQ2xpY2soZSlcblxuICAgICAgICBpZiAoY3RybENsaWNrKSByZXR1cm4gd2luZG93Lm9wZW4oaHJlZilcbiAgICAgICAgaWYgKCF0YXJnZXQgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZlxuICAgICAgICBpZiAodGFyZ2V0LmluZGV4T2YoJ2JsYW5rJykgPiAtMSAmJiBocmVmKSByZXR1cm4gd2luZG93Lm9wZW4oaHJlZilcbiAgICAgIH1cblxuICAgICAgLy8gbG9uZyBjbGljayB3aXRoIG5vIG1vdGlvblxuICAgICAgaWYgKGlzTG9uZ0NsaWNrKSByZXR1cm5cblxuICAgICAgLy8gZHJhZ2dpbmdcbiAgICAgIC8vIHN0aWNreSBsZWZ0XG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIGxlZnRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTApXG4gICAgICAvLyBzdGlja3kgcmlnaHRcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIHJpZ2h0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTApXG4gICAgICAvLyBvdGhlcndpc2VcbiAgICAgIGVsc2UgaWYgKHRpbWVGcm9tTGFzdE1vdmUgPCAxNTAgJiYgTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgPiAyKSB7XG4gICAgICAgIGNvbnN0IHRpbWVUb0VuZHBvaW50ID0gTWF0aC5yb3VuZChNYXRoLmFicyhkaXN0YW5jZURlbHRhKSAvIHRpbWVGcm9tTGFzdE1vdmUpXG4gICAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgTWF0aC5yb3VuZChlbmRwb2ludCksIHRpbWVUb0VuZHBvaW50KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNsZWFyKCdwYWdlWCcpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uQ2xpY2tMaW5rKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBlXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkZvY3VzKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIFxuICAgICAgLy8gZm9jdXMgcmVzb2x2ZSwgc2VlOiBcbiAgICAgIC8vIGh0dHA6Ly93ZC5kaXphaW5hLm5ldC9lbi9pbnRlcm5ldC1tYWludGVuYW5jZS9qcy1zbGlkZXJzLWFuZC10aGUtdGFiLWtleS9cbiAgICAgIHJvb3ROb2RlLnNjcm9sbExlZnQgPSAwXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtyb290Tm9kZS5zY3JvbGxMZWZ0ID0gMH0sIDApXG5cbiAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBlLnRhcmdldC5jbG9zZXN0KGAuJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgXG4gICAgICBsZXQgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0YXJnZXROb2RlLm9mZnNldExlZnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG4gICAgICBpZiAoTWF0aC5hYnMoZW5kcG9pbnQpIDwgMikgZW5kcG9pbnQgPSAwXG5cbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFxuICAgIC8vIGNoZWNrIGlmIGVudGVyIGlzIHByZXNzZWRcbiAgICBvbktleURvd24oZSkge1xuICAgICAgaWYgKCFlLmtleUNvZGUgfHwgZS5rZXlDb2RlICE9PSAxMykgcmV0dXJuXG4gICAgICBjb25zdCBjdHJsQ2xpY2sgPSBpc0NvbnRyb2xDbGljayhlKVxuICAgICAgY29uc3QgbG9jYXRpb24gPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgaWYgKGN0cmxDbGljaykgd2luZG93Lm9wZW4obG9jYXRpb24sICdfYmxhbmsnLCB7fSlcbiAgICAgIGVsc2Ugd2luZG93LmxvY2F0aW9uID0gbG9jYXRpb25cbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUuZGVsdGFYIHx8IE1hdGguYWJzKGUuZGVsdGFZKSA+IE1hdGguYWJzKGUuZGVsdGFYKSB8fCAgIXNjcm9sbGFibGUpIHJldHVyblxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qge2RlbHRhWH0gPSBlXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGRlbHRhWCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG5cbiAgICAgIGlmIChyZXN1bHQgPT0gbGltaXRSaWdodCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgZWxzZSB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG4gICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgdHJ1ZSlcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbENsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBzY3JvbGxDbGlja0Rpc2FibGVkID0gdGhpcy5nZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnKVxuXG4gICAgICBpZiAoc2Nyb2xsQ2xpY2tEaXNhYmxlZCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIGZhbHNlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFlLnByZXZlbnREZWZhdWx0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY2JXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSBsaW1pdFJpZ2h0ICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IHBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBjZW50ZXIgPSBwYWdlWCAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgbGVmdEVkZ2UgPSBjZW50ZXIgLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IHJpZ2h0RWRnZSA9IGNlbnRlciArIHNjYldpZHRoIC8gMlxuICAgICAgXG4gICAgICBsZXQgZW5kcG9pbnQgPSBjZW50ZXIgLyBzY2JGYWN0b3JcbiAgICAgIGlmIChsZWZ0RWRnZSA8IGxpbWl0TGVmdCkgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHJpZ2h0RWRnZSA+IHJpZ2h0U2NiTGltaXQpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgXG4gICAgb25BbmNob3JDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFlLnRhcmdldCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuIFxuICAgICAgXG4gICAgICBjb25zdCBhbmNob3JpZCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWFuY2hvcmlkXScpLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JpZCcpXG4gICAgICBpZiAoIWFuY2hvcmlkKSByZXR1cm5cblxuICAgICAgdGhpcy5yZWxlYXNlU2NiKClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JvcmlnaW5pZD1cIicgKyBhbmNob3JpZCArICdcIl0nLCByb290Tm9kZSlcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgXG4gICAgICBsZXQgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0YXJnZXROb2RlLm9mZnNldExlZnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG4gICAgICBpZiAoTWF0aC5hYnMoZW5kcG9pbnQpIDwgMikgZW5kcG9pbnQgPSAwXG5cbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyRG93bihlKSB7XG4gICAgICBpZiAoIWUpIHJldHVyblxuICAgICAgaWYgKCFpc1RvdWNoRXZlbnQoZSkgJiYgIWlzTGVmdEJ1dHRvbkNsaWNrKGUpKSByZXR1cm5cbiAgICAgIFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIHRydWUpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhckRvd25QYWdlWCcsIGN1cnJlbnRQYWdlWCAtIHNjcm9sbGVkICogc2Nyb2xsYmFyRmFjdG9yKVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjYlBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJylcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRG93blBhZ2VYID0gdGhpcy5nZXQoJ3Njcm9sbGJhckRvd25QYWdlWCcpXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgZGVsdGEgPSAoY3VycmVudFBhZ2VYIC0gc2Nyb2xsYmFyRG93blBhZ2VYKVxuICAgICAgY29uc3QgcmVzdWx0ID0gTWF0aC5taW4oTWF0aC5tYXgoZGVsdGEgLyBzY3JvbGxiYXJGYWN0b3IsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlclVwKGUpIHtcbiAgICAgIGNvbnN0IHNjYlBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJylcbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIGhhbmRsZVRvdWNoU3RhcnQoZSkge1xuICAgICAgaWYgKCFpc1RvdWNoRXZlbnQoZSkpIHJldHVyblxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWCcsIGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WClcbiAgICAgIHRoaXMuc2V0KCd0b3VjaFknLCBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgfHwgZS50b3VjaGVzWzBdLmNsaWVudFkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBoYW5kbGVUb3VjaE1vdmUoZSkge1xuICAgICAgY29uc3QgdG91Y2hYID0gdGhpcy5nZXQoJ3RvdWNoWCcpXG4gICAgICBjb25zdCB0b3VjaFkgPSB0aGlzLmdldCgndG91Y2hZJylcbiAgICAgIGlmICghdG91Y2hYIHx8ICF0b3VjaFkgfHwgIWlzVG91Y2hFdmVudChlKSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHhVcCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WFxuICAgICAgY29uc3QgeVVwID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5jbGllbnRZXG5cbiAgICAgIGNvbnN0IHhEaWZmID0gdG91Y2hYIC0geFVwXG4gICAgICBjb25zdCB5RGlmZiA9IHRvdWNoWSAtIHlVcFxuXG4gICAgICBpZiAoTWF0aC5hYnMoeERpZmYpID4gTWF0aC5hYnMoeURpZmYpKSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAnaCcpXG4gICAgICBlbHNlIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsICd2JylcblxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWCcsIDApXG4gICAgICB0aGlzLnNldCgndG91Y2hZJywgMClcbiAgICAgIHJldHVyblxuICAgIH1cblxuXG4gICAgYW5pbWF0ZShzdGFydCwgc3RvcD0wLCBzcGVlZD0xMCwgYW5pbWF0ZVdpZHRoPWZhbHNlKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IHN0b3AgLSBzdGFydFxuICAgICAgY29uc3QgdGltZSA9IE1hdGgubWF4KC4wNSwgTWF0aC5taW4oTWF0aC5hYnMoZGVsdGEpIC8gc3BlZWQsIDEpKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKSAqIHNjYkZhY3RvclxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgbGV0IGN1cnJlbnRUaW1lID0gc3BlZWQgPT0gMCA/IDEgOiAwLFxuICAgICAgICAgIGVuZHBvaW50ID0gdGhpcy5nZXQoJ3Njcm9sbGVkJyksXG4gICAgICAgICAgc2NiRW5kcG9pbnQgPSBlbmRwb2ludCAqIHNjYkZhY3RvclxuXG4gICAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5nZXQoJ3BvaW50ZXJEb3duJykgfHwgdGhpcy5nZXQoJ21vdXNlU2Nyb2xsJykpIHJldHVyblxuXG4gICAgICAgIGN1cnJlbnRUaW1lICs9ICgxIC8gNjApXG4gICAgICAgIGVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSlcbiAgICAgICAgICA6IHN0b3BcblxuICAgICAgICBzY2JFbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKiBzY2JGYWN0b3IgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpICogc2NiRmFjdG9yXG4gICAgICAgICAgOiBzdG9wICogc2NiRmFjdG9yXG4gICAgICAgIFxuICAgICAgICBzY2JFbmRwb2ludCA9IE1hdGgubWluKHNjYkVuZHBvaW50LCByaWdodFNjYkxpbWl0KVxuXG4gICAgICAgIGlmICghYW5pbWF0ZVdpZHRoKSB7XG4gICAgICAgICAgaWYgKHNjYkVuZHBvaW50ID49IHJpZ2h0U2NiTGltaXQpIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgICAgICBlbHNlIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICAgICAgdGhpcy5zZXRTY2JQb3Moc2NiRW5kcG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGV0IHNjYncgPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgICAgIGlmIChzdGFydCA8IHN0b3ApIHNjYncgLT0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuICAgICAgICAgIGVsc2Ugc2NidyArPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG5cbiAgICAgICAgICB0aGlzLnNldFdpZHRoKHNjYncpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvcygtMSAqIGVuZHBvaW50KVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCBlbmRwb2ludClcblxuICAgICAgICBpZiAoY3VycmVudFRpbWUgPCAxKSByYWYodGljaylcbiAgICAgICAgZWxzZSB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aWNrKClcbiAgICB9XG5cbiAgICBjaGVja0JvcmRlclZpc2liaWxpdHkoKSB7XG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGlmIChzY3JvbGxlZCA+IGxpbWl0TGVmdCkge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdFJpZ2h0KSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICB9XG5cblxuICAgIC8vIHB1YmxpYyBBUElcblxuICAgIHNjcm9sbFRvKHBvaW50LCB0aW1lPTEwMDApIHtcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGxldCBlbmRwb2ludCA9ICFpc05hTihwb2ludCkgPyBwYXJzZUludChwb2ludCkgOiAwXG4gICAgICBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KGVuZHBvaW50LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBpZiAocG9pbnQgPT0gJ2VuZCcpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ3N0YXJ0JykgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdjZW50ZXInKSBlbmRwb2ludCA9IGxpbWl0UmlnaHQgLyAyXG5cbiAgICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmdldCgnc2Nyb2xsZWQnKSwgZW5kcG9pbnQsIHRpbWUpXG4gICAgfVxuXG4gICAgdXBkYXRlKGNvbmZpZykge1xuICAgICAgY29uc3Qge1xuICAgICAgICBhbGlnbj10aGlzLmNvbmZpZy5hbGlnbixcbiAgICAgICAgbm9BbmNob3JzPXRoaXMuY29uZmlnLm5vQW5jaG9ycyxcbiAgICAgICAgbm9TY3JvbGxiYXI9dGhpcy5jb25maWcubm9TY3JvbGxiYXIsXG4gICAgICAgIHNjcm9sbGJhcixcbiAgICAgICAgYW5jaG9ycyxcbiAgICAgICAgb25DbGljaz10aGlzLmNvbmZpZy5vbkNsaWNrLFxuICAgICAgICBzdGFydD10aGlzLmNvbmZpZy5zdGFydCxcbiAgICAgICAgc3RhcnRBbmltYXRpb249dGhpcy5jb25maWcuc3RhcnRBbmltYXRpb25cbiAgICAgIH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcuYWxpZ24gPSBhbGlnblxuICAgICAgdGhpcy5jb25maWcubm9BbmNob3JzID0gIW5vQW5jaG9ycyBcbiAgICAgICAgPyBhbmNob3JzID09ICdoaWRkZW4nIFxuICAgICAgICA6IGFuY2hvcnMgIT0gJ3Zpc2libGUnXG5cbiAgICAgIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyID0gIW5vU2Nyb2xsYmFyXG4gICAgICAgID8gc2Nyb2xsYmFyID09ICdoaWRkZW4nIFxuICAgICAgICA6IHNjcm9sbGJhciAhPSAndmlzaWJsZSdcblxuICAgICAgdGhpcy5jb25maWcub25DbGljayA9IG9uQ2xpY2tcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gc3RhcnRcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID0gc3RhcnRBbmltYXRpb25cblxuICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdCBjb25maWdcblxuICBjb25zdCBhdXRvaW5pdCA9ICgpID0+IHtcbiAgICBjb25zdCBlbHMgPSBnZXRFbGVtZW50cygnLnNjcm9sbGVyJylcbiAgICBBcnJheS5mcm9tKGVscykuZm9yRWFjaChlbCA9PiB7XG4gICAgICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBhdXRvaW5pdClcblxuICBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJpbnRlcmFjdGl2ZVwiKSBhdXRvaW5pdCgpXG4gIH1cblxuICB3aW5kb3cuU2Nyb2xsZXIgPSBTY3JvbGxlclxuXG59KCkpIiwibW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIEFycmF5LmZyb20gPT09ICdmdW5jdGlvbicgP1xuICBBcnJheS5mcm9tIDpcbiAgcmVxdWlyZSgnLi9wb2x5ZmlsbCcpXG4pO1xuIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gUmVmZXJlbmNlOiBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtYXJyYXkuZnJvbVxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nO1xuICB9O1xuICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgfTtcbiAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgfTtcbiAgdmFyIGl0ZXJhdG9yUHJvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgIT0gbnVsbCkge1xuICAgICAgaWYoWydzdHJpbmcnLCdudW1iZXInLCdib29sZWFuJywnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdmFsdWUpID4gLTEpe1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAoJ2l0ZXJhdG9yJyBpbiBTeW1ib2wpICYmXG4gICAgICAgIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIFN5bWJvbC5pdGVyYXRvcjtcbiAgICAgIH1cbiAgICAgIC8vIFN1cHBvcnQgXCJAQGl0ZXJhdG9yXCIgcGxhY2Vob2xkZXIsIEdlY2tvIDI3IHRvIEdlY2tvIDM1XG4gICAgICBlbHNlIGlmICgnQEBpdGVyYXRvcicgaW4gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICdAQGl0ZXJhdG9yJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihPLCBQKSB7XG4gICAgLy8gQXNzZXJ0OiBJc1Byb3BlcnR5S2V5KFApIGlzIHRydWUuXG4gICAgaWYgKE8gIT0gbnVsbCAmJiBQICE9IG51bGwpIHtcbiAgICAgIC8vIExldCBmdW5jIGJlIEdldFYoTywgUCkuXG4gICAgICB2YXIgZnVuYyA9IE9bUF07XG4gICAgICAvLyBSZXR1cm5JZkFicnVwdChmdW5jKS5cbiAgICAgIC8vIElmIGZ1bmMgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBudWxsLCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgaWYoZnVuYyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICAvLyBJZiBJc0NhbGxhYmxlKGZ1bmMpIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICBpZiAoIWlzQ2FsbGFibGUoZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihmdW5jICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICB9O1xuICB2YXIgaXRlcmF0b3JTdGVwID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICAvLyBMZXQgcmVzdWx0IGJlIEl0ZXJhdG9yTmV4dChpdGVyYXRvcikuXG4gICAgLy8gUmV0dXJuSWZBYnJ1cHQocmVzdWx0KS5cbiAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIC8vIExldCBkb25lIGJlIEl0ZXJhdG9yQ29tcGxldGUocmVzdWx0KS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChkb25lKS5cbiAgICB2YXIgZG9uZSA9IEJvb2xlYW4ocmVzdWx0LmRvbmUpO1xuICAgIC8vIElmIGRvbmUgaXMgdHJ1ZSwgcmV0dXJuIGZhbHNlLlxuICAgIGlmKGRvbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHJlc3VsdC5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gIHJldHVybiBmdW5jdGlvbiBmcm9tKGl0ZW1zIC8qLCBtYXBGbiwgdGhpc0FyZyAqLyApIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAvLyAyLiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgdmFyIFQ7XG4gICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIDMuIGVsc2VcbiAgICAgIC8vICAgYS4gSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vICAgYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFRcbiAgICAgIC8vICAgICAgYmUgdW5kZWZpbmVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG4gICAgICAvLyAgIGMuIExldCBtYXBwaW5nIGJlIHRydWUgKGltcGxpZWQgYnkgbWFwRm4pXG4gICAgfVxuXG4gICAgdmFyIEEsIGs7XG5cbiAgICAvLyA0LiBMZXQgdXNpbmdJdGVyYXRvciBiZSBHZXRNZXRob2QoaXRlbXMsIEBAaXRlcmF0b3IpLlxuICAgIC8vIDUuIFJldHVybklmQWJydXB0KHVzaW5nSXRlcmF0b3IpLlxuICAgIHZhciB1c2luZ0l0ZXJhdG9yID0gZ2V0TWV0aG9kKGl0ZW1zLCBpdGVyYXRvclByb3AoaXRlbXMpKTtcblxuICAgIC8vIDYuIElmIHVzaW5nSXRlcmF0b3IgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh1c2luZ0l0ZXJhdG9yICE9PSB2b2lkIDApIHtcbiAgICAgIC8vIGEuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV1cbiAgICAgIC8vICAgICAgaW50ZXJuYWwgbWV0aG9kIG9mIEMgd2l0aCBhbiBlbXB0eSBhcmd1bWVudCBsaXN0LlxuICAgICAgLy8gYi4gRWxzZSxcbiAgICAgIC8vICAgaS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEFycmF5Q3JlYXRlXG4gICAgICAvLyAgICAgIHdpdGggYXJndW1lbnQgMC5cbiAgICAgIC8vIGMuIFJldHVybklmQWJydXB0KEEpLlxuICAgICAgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMoKSkgOiBbXTtcblxuICAgICAgLy8gZC4gTGV0IGl0ZXJhdG9yIGJlIEdldEl0ZXJhdG9yKGl0ZW1zLCB1c2luZ0l0ZXJhdG9yKS5cbiAgICAgIHZhciBpdGVyYXRvciA9IHVzaW5nSXRlcmF0b3IuY2FsbChpdGVtcyk7XG5cbiAgICAgIC8vIGUuIFJldHVybklmQWJydXB0KGl0ZXJhdG9yKS5cbiAgICAgIGlmIChpdGVyYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGYuIExldCBrIGJlIDAuXG4gICAgICBrID0gMDtcblxuICAgICAgLy8gZy4gUmVwZWF0XG4gICAgICB2YXIgbmV4dCwgbmV4dFZhbHVlO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gaS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgICAvLyBpaS4gTGV0IG5leHQgYmUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKS5cbiAgICAgICAgLy8gaWlpLiBSZXR1cm5JZkFicnVwdChuZXh0KS5cbiAgICAgICAgbmV4dCA9IGl0ZXJhdG9yU3RlcChpdGVyYXRvcik7XG5cbiAgICAgICAgLy8gaXYuIElmIG5leHQgaXMgZmFsc2UsIHRoZW5cbiAgICAgICAgaWYgKCFuZXh0KSB7XG5cbiAgICAgICAgICAvLyAxLiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBrLCB0cnVlKS5cbiAgICAgICAgICAvLyAyLiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgICAgIEEubGVuZ3RoID0gaztcblxuICAgICAgICAgIC8vIDMuIFJldHVybiBBLlxuICAgICAgICAgIHJldHVybiBBO1xuICAgICAgICB9XG4gICAgICAgIC8vIHYuIExldCBuZXh0VmFsdWUgYmUgSXRlcmF0b3JWYWx1ZShuZXh0KS5cbiAgICAgICAgLy8gdmkuIFJldHVybklmQWJydXB0KG5leHRWYWx1ZSlcbiAgICAgICAgbmV4dFZhbHVlID0gbmV4dC52YWx1ZTtcblxuICAgICAgICAvLyB2aWkuIElmIG1hcHBpbmcgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAvLyAgIDEuIExldCBtYXBwZWRWYWx1ZSBiZSBDYWxsKG1hcGZuLCBULCDCq25leHRWYWx1ZSwga8K7KS5cbiAgICAgICAgLy8gICAyLiBJZiBtYXBwZWRWYWx1ZSBpcyBhbiBhYnJ1cHQgY29tcGxldGlvbiwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyAgIDMuIExldCBtYXBwZWRWYWx1ZSBiZSBtYXBwZWRWYWx1ZS5bW3ZhbHVlXV0uXG4gICAgICAgIC8vIHZpaWkuIEVsc2UsIGxldCBtYXBwZWRWYWx1ZSBiZSBuZXh0VmFsdWUuXG4gICAgICAgIC8vIGl4LiAgTGV0IGRlZmluZVN0YXR1cyBiZSB0aGUgcmVzdWx0IG9mXG4gICAgICAgIC8vICAgICAgQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhBLCBQaywgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyB4LiBbVE9ET10gSWYgZGVmaW5lU3RhdHVzIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgZGVmaW5lU3RhdHVzKS5cbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwgbmV4dFZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHhpLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDcuIEFzc2VydDogaXRlbXMgaXMgbm90IGFuIEl0ZXJhYmxlIHNvIGFzc3VtZSBpdCBpc1xuICAgICAgLy8gICAgYW4gYXJyYXktbGlrZSBvYmplY3QuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gOC4gTGV0IGFycmF5TGlrZSBiZSBUb09iamVjdChpdGVtcykuXG4gICAgICB2YXIgYXJyYXlMaWtlID0gT2JqZWN0KGl0ZW1zKTtcblxuICAgICAgLy8gOS4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGl0ZW1zID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW4gYmUgVG9MZW5ndGgoR2V0KGFycmF5TGlrZSwgXCJsZW5ndGhcIikpLlxuICAgICAgLy8gMTEuIFJldHVybklmQWJydXB0KGxlbikuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoYXJyYXlMaWtlLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEyLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vICAgICBhLiBMZXQgQSBiZSBDb25zdHJ1Y3QoQywgwqtsZW7CuykuXG4gICAgICAvLyAxMy4gRWxzZVxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICAvLyAxNC4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNS4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuICAgICAgLy8gMTYuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBhcnJheUxpa2Vba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrKys7XG4gICAgICB9XG4gICAgICAvLyAxNy4gTGV0IHNldFN0YXR1cyBiZSBTZXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIC8vIDE4LiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAxOS4gUmV0dXJuIEEuXG4gICAgfVxuICAgIHJldHVybiBBO1xuICB9O1xufSkoKTtcbiJdfQ==
