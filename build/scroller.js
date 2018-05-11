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

        // if we don't need to create marup here
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
          var ctrlClick = isControlClick(e);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7QUFFVjs7QUFFQSxNQUFJLENBQUMsTUFBTSxJQUFYLEVBQWlCLE1BQU0sSUFBTixHQUFhLFFBQVEsWUFBUixDQUFiOztBQUdqQjs7QUFFQSxHQUFDLFVBQVUsR0FBVixFQUFlO0FBQ2QsUUFBSSxPQUFKLENBQVksVUFBVSxJQUFWLEVBQWdCO0FBQzFCLFVBQUksS0FBSyxjQUFMLENBQW9CLFFBQXBCLENBQUosRUFBbUM7O0FBRW5DLGFBQU8sY0FBUCxDQUFzQixJQUF0QixFQUE0QixRQUE1QixFQUFzQztBQUNwQyxzQkFBYyxJQURzQjtBQUVwQyxvQkFBWSxJQUZ3QjtBQUdwQyxrQkFBVSxJQUgwQjtBQUlwQyxlQUFPLFNBQVMsTUFBVCxHQUFrQjtBQUN2QixlQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBNEIsSUFBNUI7QUFDRDtBQU5tQyxPQUF0QztBQVFELEtBWEQ7QUFZRCxHQWJELEVBYUcsQ0FBQyxRQUFRLFNBQVQsRUFBb0IsY0FBYyxTQUFsQyxFQUE2QyxhQUFhLFNBQTFELENBYkg7O0FBZ0JBOztBQUVBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtBQUFBLFVBQW1ELEtBQUssSUFBeEQ7QUFDQSxhQUFPLE1BQU0sU0FBTixDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUEwQixPQUExQixFQUFt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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24oKSB7XG4gIFxuICAvLyBBcnJheS5mcm9tIHBvbHlmaWxsXG4gIFxuICBpZiAoIUFycmF5LmZyb20pIEFycmF5LmZyb20gPSByZXF1aXJlKCdhcnJheS1mcm9tJyk7XG4gIFxuXG4gIC8vIHJlbW92ZSBwb2x5ZmlsbFxuXG4gIChmdW5jdGlvbiAoYXJyKSB7XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KCdyZW1vdmUnKSkgcmV0dXJuXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncmVtb3ZlJywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9KShbRWxlbWVudC5wcm90b3R5cGUsIENoYXJhY3RlckRhdGEucHJvdG90eXBlLCBEb2N1bWVudFR5cGUucHJvdG90eXBlXSlcblxuXG4gIC8vIG1hdGNoZXMgcG9seWZpbGxcblxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgbWF0Y2hlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLCB0aCA9IHRoaXNcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc29tZS5jYWxsKG1hdGNoZXMsIGZ1bmN0aW9uKGUpe1xuICAgICAgICByZXR1cm4gZSA9PT0gdGhcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cblxuICAvLyBjbG9zZXN0IHBvbHlmaWxsXG5cbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uKGNzcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzXG5cbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLm1hdGNoZXMoY3NzKSkgcmV0dXJuIG5vZGVcbiAgICAgICAgZWxzZSBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cblxuICAvLyBoZWxwZXJzXG5cbiAgY29uc3QgZ2V0RWxlbWVudCA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlID8gbm9kZVswXSA6IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEVsZW1lbnRzID0gKHNlbGVjdG9yPScnLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlcyA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlcyB8fCBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFdmVudFggPSBlID0+IHtcbiAgICByZXR1cm4gZS5jaGFuZ2VkVG91Y2hlc1xuICAgICAgICAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aFxuICAgICAgICAmJiBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnRvdWNoZXNcbiAgICAgICAgJiYgZS50b3VjaGVzLmxlbmd0aFxuICAgICAgICAmJiBlLnRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIHx8IGUucGFnZVggXG4gICAgICB8fCAwXG4gIH1cblxuICBjb25zdCBpc0NvbnRyb2xDbGljayA9IGUgPT5cbiAgICBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5XG5cbiAgY29uc3QgaXNMZWZ0QnV0dG9uQ2xpY2sgPSBlID0+XG4gICAgZS53aGljaCA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMFxuXG4gIGNvbnN0IGlzVG91Y2hFdmVudCA9IGUgPT5cbiAgICAhIWUudG91Y2hlcyB8fCAhIWUuY2hhbmdlZFRvdWNoZXNcblxuICBjb25zdCBnZXRDaGlsZHJlbiA9IChlbCkgPT4ge1xuICAgIGxldCBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcyxcbiAgICAgICAgY2hpbGRyZW4gPSBbXSxcbiAgICAgICAgaSA9IGNoaWxkTm9kZXMubGVuZ3RoXG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoY2hpbGROb2Rlc1tpXS5ub2RlVHlwZSA9PSAxKSBjaGlsZHJlbi51bnNoaWZ0KGNoaWxkTm9kZXNbaV0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkcmVuXG4gIH1cblxuICBjb25zdCBpc0FuZHJvaWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwiYW5kcm9pZFwiKSA+IC0xXG4gIH1cblxuXG5cbiAgLy8gc2Nyb2xsZXJcblxuICBjbGFzcyBTY3JvbGxlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPSdjZW50ZXInLFxuICAgICAgICBub0FuY2hvcnM9ZmFsc2UsXG4gICAgICAgIG5vU2Nyb2xsYmFyPWZhbHNlLFxuICAgICAgICBzY3JvbGxiYXI9J3Zpc2libGUnLFxuICAgICAgICBhbmNob3JzPSd2aXNpYmxlJyxcbiAgICAgICAgc3RhcnQ9MCxcbiAgICAgICAgc3RhcnRBbmltYXRpb249ZmFsc2UsXG4gICAgICAgIGVsLFxuICAgICAgICBvbkNsaWNrLFxuICAgICAgICB1c2VPdXRlckh0bWw9ZmFsc2UsXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgIC8vIG5vQW5jaG9ycywgbm9TY3JvbGxiYXIg4oCUIGxlZ2FjeVxuICAgICAgICBub0FuY2hvcnM6IGFuY2hvcnMgPT0gJ2hpZGRlbicgfHwgbm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcjogc2Nyb2xsYmFyID09ICdoaWRkZW4nIHx8IG5vU2Nyb2xsYmFyLFxuICAgICAgICBvbkNsaWNrOiBvbkNsaWNrLFxuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIHN0YXJ0QW5pbWF0aW9uOiBzdGFydEFuaW1hdGlvbixcblxuICAgICAgICBwcmVmaXg6ICdhYl9zY3JvbGxlcicsXG4gICAgICAgIGRyYWdnaW5nQ2xzbm06ICdpcy1kcmFnZ2luZycsXG4gICAgICAgIGxlZnRBbGlnbkNsc25tOiAnaXMtbGVmdC1hbGlnbicsXG4gICAgICAgIGJvcmRlclZzYmxDbHNubTogJ2lzLXZpc2libGUnLFxuICAgICAgICBub0FuY2hvcnNDbHNubTogJ2lzLW5vLWFuY2hvcnMnLFxuICAgICAgICBub1Njcm9sbGJhckNsc25tOiAnaXMtbm8tc2Nyb2xsYmFyJyxcblxuICAgICAgICAvLyBpZiB3ZSBkb24ndCBuZWVkIHRvIGNyZWF0ZSBtYXJ1cCBoZXJlXG4gICAgICAgIC8vIGZvciBleGFtcGxlIHJlYWN0IGNvbXBvbmVudCB3aWxsIHJlbmRlciBodG1sIGJ5IGl0c2VsZlxuICAgICAgICAvLyBzbyB3ZSBqdXN0IHRha2Ugb3V0ZXIgbWFya3VwIGluc3RlYWRcbiAgICAgICAgdXNlT3V0ZXJIdG1sOiB1c2VPdXRlckh0bWwsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHNjcm9sbGFibGU6IHRydWUsXG5cbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBzY3JvbGxiYXJQb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICAgICAgc2Nyb2xsYmFyRmFjdG9yOiAwLFxuXG4gICAgICAgIHBhZ2VYOiBbXSxcbiAgICAgICAgc2Nyb2xsZWREaWZmOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgc2Nyb2xsYmFyRG93blBhZ2VYOiAwLFxuICAgICAgICBzY3JvbGxDbGlja0Rpc2FibGVkOiBmYWxzZSxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG4gICAgICAgIHN0cmlwV2lkdGg6IDAsXG5cbiAgICAgICAgc3dpcGVEaXJlY3Rpb246IG51bGwsXG4gICAgICAgIHRvdWNoWDogMCxcbiAgICAgICAgdG91Y2hZOiAwLFxuXG4gICAgICAgIGxldDogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldENoaWxkcmVuKGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG5cbiAgICAgICAgaXNBbmRyb2lkOiBpc0FuZHJvaWQoKVxuICAgICAgfVxuXG4gICAgICB3aW5kb3cucmFmID0gKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcblxuICAgICAgdGhpcy5pbml0KGVsKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXSB8fCAwXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIGFsaWduU2NiVG9SaWdodCgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuICAgIHJlbGVhc2VTY2IoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRTY2JQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKGVsLCBwb3MpIHtcbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG4gICAgc2V0V2lkdGgod2lkdGgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGxpbmtOb2RlcyA9IGdldEVsZW1lbnRzKCdhJywgc3RyaXBOb2RlKVxuXG4gICAgICBjb25zdCBzY3JvbGxOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcblxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIC8vIGNvbmZpZ1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcicgfHxcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRhbGlnbicpIHx8IFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdEFsaWduJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0SWZXaWRlJykgfHxcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRpZndpZGUnKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuY29uZmlnLm5vQW5jaG9ycyB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcnMnKSA9PSAnaGlkZGVuJyB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9hbmNob3JzJykgfHxcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vQW5jaG9ycycpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5jb25maWcubm9TY3JvbGxiYXIgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInKSA9PSAnaGlkZGVuJyB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9TY3JvbGxiYXInKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChyb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQnKSkge1xuICAgICAgICB0aGlzLmNvbmZpZy5zdGFydCA9IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydCcpXG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0QW5pbWF0aW9uJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydGFuaW1hdGlvbicpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5jb25maWcuc3RhcnRBbmltYXRpb24gPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuICAgICAgXG4gICAgICBzY3JvbGxiYXJOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuXG4gICAgICBzY3JvbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNjcm9sbENsaWNrLmJpbmQodGhpcykpXG5cbiAgICAgIGNvbnN0IHdoZWVsRXZlbnQgPSAoL0ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSA/ICd3aGVlbCcgOiAnbW91c2V3aGVlbCdcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKHdoZWVsRXZlbnQsIHRoaXMub25TY3JvbGwuYmluZCh0aGlzKSlcblxuICAgICAgdGhpcy5iaW5kQW5jaG9yc0V2ZW50cygpXG5cbiAgICAgIC8vIHByZXZlbnQgY2xpY2tuZyBvbiBsaW5rcyBhbmQgaGFuZGxlIGZvY3VzIGV2ZW50XG4gICAgICBBcnJheS5mcm9tKGxpbmtOb2RlcykuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGlja0xpbmsuYmluZCh0aGlzKSwgZmFsc2UpXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9uRm9jdXMuYmluZCh0aGlzKSwgZmFsc2UpXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgfSlcblxuICAgICAgLy8gcmVyZW5kZXJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICB9KVxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGUgPT4ge1xuICAgICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsYWJsZSgpXG4gICAgICB9KVxuXG5cbiAgICAgIGNvbnN0IHN0YXJ0QW5pbWF0aW9uSGVscGVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjZW50cmFsTm9kZSA9IHRoaXMuZmluZENlbnRyYWxOb2RlKClcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gdGhpcy5jb25maWcuc3RhcnRBbmltYXRpb24gPyAxMDAwIDogMFxuICAgICAgICBsZXQgZW5kcG9pbnRcbiAgICAgICAgXG4gICAgICAgIGlmIChjZW50cmFsTm9kZSkge1xuICAgICAgICAgIGVuZHBvaW50ID0gY2VudHJhbE5vZGUub2Zmc2V0TGVmdCBcbiAgICAgICAgICAgIC0gKHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoIC8gMikgXG4gICAgICAgICAgICArIChjZW50cmFsTm9kZS5vZmZzZXRXaWR0aCAvIDIpXG5cbiAgICAgICAgICBlbmRwb2ludCA9IE1hdGgubWluKGNlbnRyYWxOb2RlLm9mZnNldExlZnQsIGVuZHBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgZW5kcG9pbnQgPSB0aGlzLmNvbmZpZy5zdGFydFxuICAgICAgICBcbiAgICAgICAgdGhpcy5zY3JvbGxUbyhlbmRwb2ludCwgYW5pbWF0aW9uKVxuICAgICAgfVxuXG5cbiAgICAgIC8vIGNoZWNrIGlmIHNjcm9sbGVyIGlzIGluIGhpZGRlbiBibG9ja1xuICAgICAgY29uc3QgaXNIaWRkZW4gPSBlbCA9PiBlbC5vZmZzZXRQYXJlbnQgPT09IG51bGxcblxuICAgICAgaWYgKGlzSGlkZGVuKHJvb3ROb2RlKSkge1xuICAgICAgICBsZXQgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWlzSGlkZGVuKHJvb3ROb2RlKSkge1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgICAgICAgICAgLy8gdHJpZ2dlcmluZyByZXNpemUgaXMgbm90IHJlbGlhYmxlXG4gICAgICAgICAgICAvLyBqdXN0IHJlY2FsYyB0d2ljZVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpXG5cbiAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uSGVscGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDUwKVxuICAgICAgfVxuXG4gICAgICBcbiAgICAgIHN0YXJ0QW5pbWF0aW9uSGVscGVyKClcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICB9XG5cblxuICAgIGJpbmRBbmNob3JzRXZlbnRzKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGFuY2hvcnNOb2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWFuY2hvcmAsIHJvb3ROb2RlKVxuXG4gICAgICBBcnJheS5mcm9tKGFuY2hvcnNOb2RlcykuZm9yRWFjaChhbmNob3JOb2RlID0+IHtcbiAgICAgICAgYW5jaG9yTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25BbmNob3JDbGljay5iaW5kKHRoaXMpKVxuICAgICAgfSlcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcudXNlT3V0ZXJIdG1sKSByZXR1cm5cblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3QgcHJldkh0bWwgPSByb290Tm9kZS5pbm5lckhUTUxcbiAgICAgIGNvbnN0IHdyYXBwZXJIdG1sID0gYDxkaXYgY2xhc3M9XCIke3ByZWZpeH0td3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWJvcmRlciAke3ByZWZpeH0tYm9yZGVyLS1sZWZ0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLXJpZ2h0XCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc3RyaXBcIj4ke3ByZXZIdG1sfTwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc2Nyb2xsd3JhcFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc2Nyb2xsYmFyXCI+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWFuY2hvcnNcIj48L2Rpdj5cbiAgICAgIDwvZGl2PmBcblxuICAgICAgcm9vdE5vZGUuaW5uZXJIVE1MID0gd3JhcHBlckh0bWxcbiAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHByZWZpeClcbiAgICB9XG5cbiAgICB3cmFwSXRlbXMoKSB7XG4gICAgICBjb25zdCB1c2VPdXRlckh0bWwgPSB0aGlzLmNvbmZpZy51c2VPdXRlckh0bWxcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcblxuICAgICAgQXJyYXkuZnJvbShnZXRDaGlsZHJlbih3cmFwcGVyTm9kZSkpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBpZiAodXNlT3V0ZXJIdG1sKSB7XG4gICAgICAgICAgdGhpcy5hZGRDbGFzcyhpdGVtTm9kZSwgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zdCBpdGVtV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgaXRlbVdyYXBwZXIuaW5uZXJIVE1MID0gaXRlbU5vZGUub3V0ZXJIVE1MXG4gICAgICAgICAgaXRlbVdyYXBwZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgICAgaXRlbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbVdyYXBwZXIsIGl0ZW1Ob2RlKVxuICAgICAgICAgIGl0ZW1Ob2RlLnJlbW92ZSgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZmluZENlbnRyYWxOb2RlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGNlbnRyYWxOb2RlcyA9IGdldEVsZW1lbnRzKGBbZGF0YS1jZW50cmFsPVwidHJ1ZVwiXWAsIHJvb3ROb2RlKVxuICAgICAgcmV0dXJuIGNlbnRyYWxOb2RlcyAmJiBjZW50cmFsTm9kZXMubGVuZ3RoIFxuICAgICAgICA/IGNlbnRyYWxOb2Rlc1tjZW50cmFsTm9kZXMubGVuZ3RoIC0gMV0uY2xvc2VzdChgLiR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgcmVtb3ZlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gJydcbiAgICB9XG5cbiAgICBjcmVhdGVBbmNob3JzKCkge1xuICAgICAgY29uc3QgdXNlT3V0ZXJIdG1sID0gdGhpcy5jb25maWcudXNlT3V0ZXJIdG1sXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgbGV0IGFuY2hvcnNIdG1sID0gJycsIGNvdW50ZXIgPSAwXG5cbiAgICAgIEFycmF5LmZyb20oZ2V0Q2hpbGRyZW4od3JhcHBlck5vZGUpKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IHVzZU91dGVySHRtbCBcbiAgICAgICAgICA/IGl0ZW1Ob2RlXG4gICAgICAgICAgOiBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JdJywgaXRlbU5vZGUpXG5cbiAgICAgICAgY29uc3QgYW5jaG9yVGV4dCA9IHRhcmdldE5vZGUgXG4gICAgICAgICAgPyB0YXJnZXROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKVxuICAgICAgICAgIDogJydcblxuICAgICAgICBhbmNob3JzSHRtbCArPSBgPHNwYW4gZGF0YS1hbmNob3JpZD1cIiR7Y291bnRlcn1cIiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JcIj48c3Bhbj4ke2FuY2hvclRleHR9PC9zcGFuPjwvc3Bhbj5gXG4gICAgICAgIGl0ZW1Ob2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JvcmlnaW5pZCcsIGNvdW50ZXIpXG4gICAgICAgIGNvdW50ZXIrK1xuICAgICAgfSlcblxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gYW5jaG9yc0h0bWxcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGxldCBtYXhIZWlnaHQgPSAwLCBzdW1XaWR0aCA9IDBcblxuICAgICAgcm9vdE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc3RyaXBOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHdyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHNjcm9sbGJhck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc2Nyb2xsd3JhcE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuXG4gICAgICBBcnJheS5mcm9tKGl0ZW1Ob2RlcykuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcbiAgICAgICAgc3VtV2lkdGggKz0gaXRlbU5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHdyYXBwZXJXaWR0aCA9IHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBzY3JvbGx3cmFwV2lkdGggPSBzY3JvbGx3cmFwTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHN1bVdpZHRoICsgMSAtIHJvb3ROb2RlLm9mZnNldFdpZHRoXG5cbiAgICAgIC8vIG90aGVyd2lzZSB3aWxsIGJlIE5hTlxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gc2Nyb2xsd3JhcFdpZHRoICE9PSAwICYmIHN1bVdpZHRoICE9PSAwIFxuICAgICAgICA/IHNjcm9sbHdyYXBXaWR0aCAvIHN1bVdpZHRoXG4gICAgICAgIDogMVxuXG4gICAgICAvLyBpZiBzY3JlZW4gaXMgd2lkZXIgdGhhbiBzY3JvbGxlciwgcmVzZXQgdHJhbnNmb3JtYXRpb25zXG4gICAgICBpZiAoc2Nyb2xsYmFyRmFjdG9yID49IDEpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3NjYlNjcm9sbGVkJywgMClcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgMClcbiAgICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSBNYXRoLm1pbih0aGlzLmdldCgnc2Nyb2xsZWQnKSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjYlNjcm9sbGVkID0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS53aWR0aCA9IChzdW1XaWR0aCArIDEpICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc2Nyb2xsYmFyTm9kZS5zdHlsZS53aWR0aCA9ICh3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpICsgJ3B4J1xuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHNjcm9sbGVkKVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2NiU2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldCgnbGltaXRSaWdodCcsIGxpbWl0UmlnaHQpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRmFjdG9yJywgc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhcldpZHRoJywgd3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgIH1cblxuICAgIGNoZWNrU2Nyb2xsYWJsZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS13cmFwcGVyYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgbGV0IHN1bVdpZHRoID0gMCwgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcblxuICAgICAgQXJyYXkuZnJvbShpdGVtTm9kZXMpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgaWYgKHdyYXBwZXJXaWR0aCA+PSBzdW1XaWR0aCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYWJsZScsIGZhbHNlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCAnaXMtbm90LXNjcm9sbGFibGUnKVxuICAgICAgICBhbmNXcmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYHdpZHRoOiAke3N1bVdpZHRofXB4YClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsYWJsZScsIHRydWUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6YXV0b2ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgX3VwZGF0ZSgpIHtcbiAgICAgIGNvbnN0IHVzZU91dGVySHRtbCA9IHRoaXMuY29uZmlnLnVzZU91dGVySHRtbFxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLmFsaWduICE9PSAnY2VudGVyJykgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9BbmNob3JzKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub1Njcm9sbGJhcikgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcblxuICAgICAgaWYgKHVzZU91dGVySHRtbCkge1xuICAgICAgICB0aGlzLndyYXBJdGVtcygpXG4gICAgICAgIHRoaXMucmVtb3ZlQW5jaG9ycygpXG4gICAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICAgIHRoaXMuYmluZEFuY2hvcnNFdmVudHMoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuXG4gICAgICBpZiAoIXRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyKSB7XG4gICAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBzY3JvbGxlZCwgMClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja0VsZW1lbnQoZSkge1xuICAgICAgcmV0dXJuIGUudGFyZ2V0LmNsb3Nlc3QoYC4ke3RoaXMuY29uZmlnLnByZWZpeH1gKSA9PSB0aGlzLnN0YXRlLmVsXG4gICAgfVxuXG5cbiAgICBvblBvaW50ZXJEb3duKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuXG4gICAgICB0aGlzLmhhbmRsZVRvdWNoU3RhcnQoZSlcbiAgICAgIFxuICAgICAgY29uc3QgdG9jaEV2ZW50ID0gaXNUb3VjaEV2ZW50KGUpXG4gICAgICBpZiAoIXRvY2hFdmVudCkgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAoIXRvY2hFdmVudCAmJiAhaXNMZWZ0QnV0dG9uQ2xpY2soZSkpIHJldHVyblxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG5cbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGdldEV2ZW50WChlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkRGlmZicsIGRpZmYpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3MoZ2V0RWxlbWVudCgnaHRtbCcpLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgXG4gICAgICB0aGlzLmhhbmRsZVRvdWNoTW92ZShlKVxuICAgICAgaWYgKHRoaXMuZ2V0KCdzd2lwZURpcmVjdGlvbicpID09ICd2JykgcmV0dXJuXG4gICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgbGV0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuICAgICAgbGV0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggKz0gTWF0aC5yb3VuZCgwLjIgKiBzY3JvbGxiYXJSZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhclJlc3VsdCA9IDBcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJlc3VsdCA+IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCAtPSBNYXRoLnJvdW5kKDAuOCAqIChyZXN1bHQgLSBsaW1pdFJpZ2h0KSAqIHNjcm9sbGJhckZhY3RvcilcbiAgICAgICAgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnbW92ZUV2ZW50VFMnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuICAgICAgdGhpcy5wdXNoKCdwYWdlWCcsIGN1cnJlbnRQYWdlWClcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmdldCgnc3dpcGVEaXJlY3Rpb24nKSA9PSAndicpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgICAgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgbnVsbClcbiAgICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG5cbiAgICAgIGNvbnN0IHRpbWVEZWx0YSA9ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gdGhpcy5nZXQoJ21vdmVFdmVudFRTJykpIC8gMS41XG4gICAgICBjb25zdCBlbmRwb2ludCA9IHNjcm9sbGVkIC0gKGRpc3RhbmNlRGVsdGEgKiA4KVxuXG4gICAgICAvLyBjbGlja2VkXG4gICAgICBpZiAobGFzdFBhZ2VYID09PSAwKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5vbkNsaWNrKSByZXR1cm4gdGhpcy5jb25maWcub25DbGljayhlKVxuXG4gICAgICAgIGNvbnN0IGxpbmtOb2RlID0gZS50YXJnZXQuY2xvc2VzdCgnYScpXG4gICAgICAgIGlmICghbGlua05vZGUpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgndGFyZ2V0JylcbiAgICAgICAgY29uc3QgaHJlZiA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICAgIGNvbnN0IGN0cmxDbGljayA9IGlzQ29udHJvbENsaWNrKGUpXG5cbiAgICAgICAgaWYgKGN0cmxDbGljaykgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICAgIGlmICghdGFyZ2V0ICYmIGhyZWYpIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWZcbiAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKCdibGFuaycpID4gLTEgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICB9XG5cbiAgICAgIC8vIGRyYWdnZWRcbiAgICAgIC8vIHN0aWNreSBsZWZ0XG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIGxlZnRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTApXG4gICAgICAvLyBzdGlja3kgcmlnaHRcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIHJpZ2h0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTApXG4gICAgICAvLyBvdGhlcndpc2VcbiAgICAgIGVsc2UgaWYgKHRpbWVEZWx0YSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLnJvdW5kKE1hdGguYWJzKGRpc3RhbmNlRGVsdGEpIC8gdGltZURlbHRhKVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIE1hdGgucm91bmQoZW5kcG9pbnQpLCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkNsaWNrTGluayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gZVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25Gb2N1cyhlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICBcbiAgICAgIC8vIGZvY3VzIHJlc29sdmUsIHNlZTogXG4gICAgICAvLyBodHRwOi8vd2QuZGl6YWluYS5uZXQvZW4vaW50ZXJuZXQtbWFpbnRlbmFuY2UvanMtc2xpZGVycy1hbmQtdGhlLXRhYi1rZXkvXG4gICAgICByb290Tm9kZS5zY3JvbGxMZWZ0ID0gMFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7cm9vdE5vZGUuc2Nyb2xsTGVmdCA9IDB9LCAwKVxuXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZS50YXJnZXQuY2xvc2VzdChgLiR7cHJlZml4fS1pdGVtYClcbiAgICAgIGNvbnN0IHNjcm9sbHdyYXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBcbiAgICAvLyBjaGVjayBpZiBlbnRlciBpcyBwcmVzc2VkXG4gICAgb25LZXlEb3duKGUpIHtcbiAgICAgIGlmICghZS5rZXlDb2RlIHx8IGUua2V5Q29kZSAhPT0gMTMpIHJldHVyblxuICAgICAgY29uc3QgY3RybENsaWNrID0gaXNDb250cm9sQ2xpY2soZSlcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICAgIGlmIChjdHJsQ2xpY2spIHdpbmRvdy5vcGVuKGxvY2F0aW9uLCAnX2JsYW5rJywge30pXG4gICAgICBlbHNlIHdpbmRvdy5sb2NhdGlvbiA9IGxvY2F0aW9uXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFlLmRlbHRhWCB8fCBNYXRoLmFicyhlLmRlbHRhWSkgPiBNYXRoLmFicyhlLmRlbHRhWCkgfHwgICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHtkZWx0YVh9ID0gZVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmVzdWx0ID0gTWF0aC5taW4oTWF0aC5tYXgodGhpcy5nZXQoJ3Njcm9sbGVkJykgKyBkZWx0YVgsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuXG4gICAgICBpZiAocmVzdWx0ID09IGxpbWl0UmlnaHQpIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIFxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIHRydWUpXG5cbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3Qgc2Nyb2xsQ2xpY2tEaXNhYmxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJylcblxuICAgICAgaWYgKHNjcm9sbENsaWNrRGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCBmYWxzZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhZS5wcmV2ZW50RGVmYXVsdCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qgc2NiV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gbGltaXRSaWdodCAqIHNjYkZhY3RvclxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBwYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3QgY2VudGVyID0gcGFnZVggLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IGxlZnRFZGdlID0gY2VudGVyIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCByaWdodEVkZ2UgPSBjZW50ZXIgKyBzY2JXaWR0aCAvIDJcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gY2VudGVyIC8gc2NiRmFjdG9yXG4gICAgICBpZiAobGVmdEVkZ2UgPCBsaW1pdExlZnQpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChyaWdodEVkZ2UgPiByaWdodFNjYkxpbWl0KSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcblxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFxuICAgIG9uQW5jaG9yQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghZSB8fCAhZS50YXJnZXQgfHwgIXNjcm9sbGFibGUpIHJldHVybiBcbiAgICAgIFxuICAgICAgY29uc3QgYW5jaG9yaWQgPSBlLnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hbmNob3JpZF0nKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYW5jaG9yaWQnKVxuICAgICAgaWYgKCFhbmNob3JpZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2V0RWxlbWVudCgnW2RhdGEtYW5jaG9yb3JpZ2luaWQ9XCInICsgYW5jaG9yaWQgKyAnXCJdJywgcm9vdE5vZGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIFxuICAgICAgbGV0IGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGFyZ2V0Tm9kZS5vZmZzZXRMZWZ0LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgaWYgKE1hdGguYWJzKGVuZHBvaW50KSA8IDIpIGVuZHBvaW50ID0gMFxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KGUpICYmICFpc0xlZnRCdXR0b25DbGljayhlKSkgcmV0dXJuXG4gICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnLCBjdXJyZW50UGFnZVggLSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvcilcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhckRvd25QYWdlWCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJEb3duUGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGRlbHRhID0gKGN1cnJlbnRQYWdlWCAtIHNjcm9sbGJhckRvd25QYWdlWClcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KGRlbHRhIC8gc2Nyb2xsYmFyRmFjdG9yLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXRTY2JQb3Moc2Nyb2xsYmFyUmVzdWx0KVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY2JQb2ludGVyRG93biA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicpXG4gICAgICBcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBoYW5kbGVUb3VjaFN0YXJ0KGUpIHtcbiAgICAgIGlmICghaXNUb3VjaEV2ZW50KGUpKSByZXR1cm5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFgpXG4gICAgICB0aGlzLnNldCgndG91Y2hZJywgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5jbGllbnRZKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHRvdWNoWCA9IHRoaXMuZ2V0KCd0b3VjaFgnKVxuICAgICAgY29uc3QgdG91Y2hZID0gdGhpcy5nZXQoJ3RvdWNoWScpXG4gICAgICBpZiAoIXRvdWNoWCB8fCAhdG91Y2hZIHx8ICFpc1RvdWNoRXZlbnQoZSkpIHJldHVyblxuXG4gICAgICBjb25zdCB4VXAgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggfHwgZS50b3VjaGVzWzBdLmNsaWVudFhcbiAgICAgIGNvbnN0IHlVcCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WVxuXG4gICAgICBjb25zdCB4RGlmZiA9IHRvdWNoWCAtIHhVcFxuICAgICAgY29uc3QgeURpZmYgPSB0b3VjaFkgLSB5VXBcblxuICAgICAgaWYgKE1hdGguYWJzKHhEaWZmKSA+IE1hdGguYWJzKHlEaWZmKSkgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ2gnKVxuICAgICAgZWxzZSB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCAndicpXG5cbiAgICAgIHRoaXMuc2V0KCd0b3VjaFgnLCAwKVxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWScsIDApXG4gICAgICByZXR1cm5cbiAgICB9XG5cblxuICAgIGFuaW1hdGUoc3RhcnQsIHN0b3A9MCwgc3BlZWQ9MTAsIGFuaW1hdGVXaWR0aD1mYWxzZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSBzdG9wIC0gc3RhcnRcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1heCguMDUsIE1hdGgubWluKE1hdGguYWJzKGRlbHRhKSAvIHNwZWVkLCAxKSlcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JykgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGxldCBjdXJyZW50VGltZSA9IHNwZWVkID09IDAgPyAxIDogMCxcbiAgICAgICAgICBlbmRwb2ludCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpLFxuICAgICAgICAgIHNjYkVuZHBvaW50ID0gZW5kcG9pbnQgKiBzY2JGYWN0b3JcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdwb2ludGVyRG93bicpIHx8IHRoaXMuZ2V0KCdtb3VzZVNjcm9sbCcpKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICBlbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpXG4gICAgICAgICAgOiBzdG9wXG5cbiAgICAgICAgc2NiRW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICogc2NiRmFjdG9yICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSAqIHNjYkZhY3RvclxuICAgICAgICAgIDogc3RvcCAqIHNjYkZhY3RvclxuICAgICAgICBcbiAgICAgICAgc2NiRW5kcG9pbnQgPSBNYXRoLm1pbihzY2JFbmRwb2ludCwgcmlnaHRTY2JMaW1pdClcblxuICAgICAgICBpZiAoIWFuaW1hdGVXaWR0aCkge1xuICAgICAgICAgIGlmIChzY2JFbmRwb2ludCA+PSByaWdodFNjYkxpbWl0KSB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgICAgZWxzZSB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgICAgIHRoaXMuc2V0U2NiUG9zKHNjYkVuZHBvaW50KVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBzY2J3ID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgICAgICBpZiAoc3RhcnQgPCBzdG9wKSBzY2J3IC09IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcbiAgICAgICAgICBlbHNlIHNjYncgKz0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuXG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChzY2J3KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3MoLTEgKiBlbmRwb2ludClcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgZW5kcG9pbnQpXG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIDwgMSkgcmFmKHRpY2spXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGljaygpXG4gICAgfVxuXG4gICAgY2hlY2tCb3JkZXJWaXNpYmlsaXR5KCkge1xuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPiBsaW1pdExlZnQpIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRSaWdodCkge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvLyBwdWJsaWMgQVBJXG5cbiAgICBzY3JvbGxUbyhwb2ludCwgdGltZT0xMDAwKSB7XG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBsZXQgZW5kcG9pbnQgPSAhaXNOYU4ocG9pbnQpID8gcGFyc2VJbnQocG9pbnQpIDogMFxuICAgICAgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heChlbmRwb2ludCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgaWYgKHBvaW50ID09ICdlbmQnKSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdzdGFydCcpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnY2VudGVyJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0IC8gMlxuXG4gICAgICB0aGlzLmFuaW1hdGUodGhpcy5nZXQoJ3Njcm9sbGVkJyksIGVuZHBvaW50LCB0aW1lKVxuICAgIH1cblxuICAgIHVwZGF0ZShjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249dGhpcy5jb25maWcuYWxpZ24sXG4gICAgICAgIG5vQW5jaG9ycz10aGlzLmNvbmZpZy5ub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyPXRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyLFxuICAgICAgICBzY3JvbGxiYXIsXG4gICAgICAgIGFuY2hvcnMsXG4gICAgICAgIG9uQ2xpY2s9dGhpcy5jb25maWcub25DbGljayxcbiAgICAgICAgc3RhcnQ9dGhpcy5jb25maWcuc3RhcnQsXG4gICAgICAgIHN0YXJ0QW5pbWF0aW9uPXRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnLmFsaWduID0gYWxpZ25cbiAgICAgIHRoaXMuY29uZmlnLm5vQW5jaG9ycyA9ICFub0FuY2hvcnMgXG4gICAgICAgID8gYW5jaG9ycyA9PSAnaGlkZGVuJyBcbiAgICAgICAgOiBhbmNob3JzICE9ICd2aXNpYmxlJ1xuXG4gICAgICB0aGlzLmNvbmZpZy5ub1Njcm9sbGJhciA9ICFub1Njcm9sbGJhclxuICAgICAgICA/IHNjcm9sbGJhciA9PSAnaGlkZGVuJyBcbiAgICAgICAgOiBzY3JvbGxiYXIgIT0gJ3Zpc2libGUnXG5cbiAgICAgIHRoaXMuY29uZmlnLm9uQ2xpY2sgPSBvbkNsaWNrXG4gICAgICB0aGlzLmNvbmZpZy5zdGFydCA9IHN0YXJ0XG4gICAgICB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA9IHN0YXJ0QW5pbWF0aW9uXG5cbiAgICAgIHRoaXMuX3VwZGF0ZSgpXG4gICAgfVxuICB9XG5cblxuXG4gIC8vIGluaXQgY29uZmlnXG5cbiAgY29uc3QgYXV0b2luaXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZWxzID0gZ2V0RWxlbWVudHMoJy5zY3JvbGxlcicpXG4gICAgQXJyYXkuZnJvbShlbHMpLmZvckVhY2goZWwgPT4ge1xuICAgICAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuICAgIH0pXG4gIH1cblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gYXV0b2luaXQpXG5cbiAgZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiaW50ZXJhY3RpdmVcIikgYXV0b2luaXQoKVxuICB9XG5cbiAgd2luZG93LlNjcm9sbGVyID0gU2Nyb2xsZXJcblxufSgpKSIsIm1vZHVsZS5leHBvcnRzID0gKHR5cGVvZiBBcnJheS5mcm9tID09PSAnZnVuY3Rpb24nID9cbiAgQXJyYXkuZnJvbSA6XG4gIHJlcXVpcmUoJy4vcG9seWZpbGwnKVxuKTtcbiIsIi8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNiwgMjIuMS4yLjFcbi8vIFJlZmVyZW5jZTogaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWFycmF5LmZyb21cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgaXNDYWxsYWJsZSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJztcbiAgfTtcbiAgdmFyIHRvSW50ZWdlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBudW1iZXIgPSBOdW1iZXIodmFsdWUpO1xuICAgIGlmIChpc05hTihudW1iZXIpKSB7IHJldHVybiAwOyB9XG4gICAgaWYgKG51bWJlciA9PT0gMCB8fCAhaXNGaW5pdGUobnVtYmVyKSkgeyByZXR1cm4gbnVtYmVyOyB9XG4gICAgcmV0dXJuIChudW1iZXIgPiAwID8gMSA6IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobnVtYmVyKSk7XG4gIH07XG4gIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciB0b0xlbmd0aCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xuICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChsZW4sIDApLCBtYXhTYWZlSW50ZWdlcik7XG4gIH07XG4gIHZhciBpdGVyYXRvclByb3AgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIGlmKFsnc3RyaW5nJywnbnVtYmVyJywnYm9vbGVhbicsJ3N5bWJvbCddLmluZGV4T2YodHlwZW9mIHZhbHVlKSA+IC0xKXtcbiAgICAgICAgcmV0dXJuIFN5bWJvbC5pdGVyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJykgJiZcbiAgICAgICAgKCdpdGVyYXRvcicgaW4gU3ltYm9sKSAmJlxuICAgICAgICAoU3ltYm9sLml0ZXJhdG9yIGluIHZhbHVlKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3I7XG4gICAgICB9XG4gICAgICAvLyBTdXBwb3J0IFwiQEBpdGVyYXRvclwiIHBsYWNlaG9sZGVyLCBHZWNrbyAyNyB0byBHZWNrbyAzNVxuICAgICAgZWxzZSBpZiAoJ0BAaXRlcmF0b3InIGluIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAnQEBpdGVyYXRvcic7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oTywgUCkge1xuICAgIC8vIEFzc2VydDogSXNQcm9wZXJ0eUtleShQKSBpcyB0cnVlLlxuICAgIGlmIChPICE9IG51bGwgJiYgUCAhPSBudWxsKSB7XG4gICAgICAvLyBMZXQgZnVuYyBiZSBHZXRWKE8sIFApLlxuICAgICAgdmFyIGZ1bmMgPSBPW1BdO1xuICAgICAgLy8gUmV0dXJuSWZBYnJ1cHQoZnVuYykuXG4gICAgICAvLyBJZiBmdW5jIGlzIGVpdGhlciB1bmRlZmluZWQgb3IgbnVsbCwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgIGlmKGZ1bmMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgLy8gSWYgSXNDYWxsYWJsZShmdW5jKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgaWYgKCFpc0NhbGxhYmxlKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoZnVuYyArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jO1xuICAgIH1cbiAgfTtcbiAgdmFyIGl0ZXJhdG9yU3RlcCA9IGZ1bmN0aW9uKGl0ZXJhdG9yKSB7XG4gICAgLy8gTGV0IHJlc3VsdCBiZSBJdGVyYXRvck5leHQoaXRlcmF0b3IpLlxuICAgIC8vIFJldHVybklmQWJydXB0KHJlc3VsdCkuXG4gICAgdmFyIHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAvLyBMZXQgZG9uZSBiZSBJdGVyYXRvckNvbXBsZXRlKHJlc3VsdCkuXG4gICAgLy8gUmV0dXJuSWZBYnJ1cHQoZG9uZSkuXG4gICAgdmFyIGRvbmUgPSBCb29sZWFuKHJlc3VsdC5kb25lKTtcbiAgICAvLyBJZiBkb25lIGlzIHRydWUsIHJldHVybiBmYWxzZS5cbiAgICBpZihkb25lKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFJldHVybiByZXN1bHQuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUaGUgbGVuZ3RoIHByb3BlcnR5IG9mIHRoZSBmcm9tIG1ldGhvZCBpcyAxLlxuICByZXR1cm4gZnVuY3Rpb24gZnJvbShpdGVtcyAvKiwgbWFwRm4sIHRoaXNBcmcgKi8gKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gMS4gTGV0IEMgYmUgdGhlIHRoaXMgdmFsdWUuXG4gICAgdmFyIEMgPSB0aGlzO1xuXG4gICAgLy8gMi4gSWYgbWFwZm4gaXMgdW5kZWZpbmVkLCBsZXQgbWFwcGluZyBiZSBmYWxzZS5cbiAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcblxuICAgIHZhciBUO1xuICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyAzLiBlbHNlXG4gICAgICAvLyAgIGEuIElmIElzQ2FsbGFibGUobWFwZm4pIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICBpZiAoIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyAgIGIuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUXG4gICAgICAvLyAgICAgIGJlIHVuZGVmaW5lZC5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICBUID0gYXJndW1lbnRzWzJdO1xuICAgICAgfVxuICAgICAgLy8gICBjLiBMZXQgbWFwcGluZyBiZSB0cnVlIChpbXBsaWVkIGJ5IG1hcEZuKVxuICAgIH1cblxuICAgIHZhciBBLCBrO1xuXG4gICAgLy8gNC4gTGV0IHVzaW5nSXRlcmF0b3IgYmUgR2V0TWV0aG9kKGl0ZW1zLCBAQGl0ZXJhdG9yKS5cbiAgICAvLyA1LiBSZXR1cm5JZkFicnVwdCh1c2luZ0l0ZXJhdG9yKS5cbiAgICB2YXIgdXNpbmdJdGVyYXRvciA9IGdldE1ldGhvZChpdGVtcywgaXRlcmF0b3JQcm9wKGl0ZW1zKSk7XG5cbiAgICAvLyA2LiBJZiB1c2luZ0l0ZXJhdG9yIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICBpZiAodXNpbmdJdGVyYXRvciAhPT0gdm9pZCAwKSB7XG4gICAgICAvLyBhLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vICAgaS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NvbnN0cnVjdF1dXG4gICAgICAvLyAgICAgIGludGVybmFsIG1ldGhvZCBvZiBDIHdpdGggYW4gZW1wdHkgYXJndW1lbnQgbGlzdC5cbiAgICAgIC8vIGIuIEVsc2UsXG4gICAgICAvLyAgIGkuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgdGhlIGFic3RyYWN0IG9wZXJhdGlvbiBBcnJheUNyZWF0ZVxuICAgICAgLy8gICAgICB3aXRoIGFyZ3VtZW50IDAuXG4gICAgICAvLyBjLiBSZXR1cm5JZkFicnVwdChBKS5cbiAgICAgIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKCkpIDogW107XG5cbiAgICAgIC8vIGQuIExldCBpdGVyYXRvciBiZSBHZXRJdGVyYXRvcihpdGVtcywgdXNpbmdJdGVyYXRvcikuXG4gICAgICB2YXIgaXRlcmF0b3IgPSB1c2luZ0l0ZXJhdG9yLmNhbGwoaXRlbXMpO1xuXG4gICAgICAvLyBlLiBSZXR1cm5JZkFicnVwdChpdGVyYXRvcikuXG4gICAgICBpZiAoaXRlcmF0b3IgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0J1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBmLiBMZXQgayBiZSAwLlxuICAgICAgayA9IDA7XG5cbiAgICAgIC8vIGcuIFJlcGVhdFxuICAgICAgdmFyIG5leHQsIG5leHRWYWx1ZTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIC8vIGkuIExldCBQayBiZSBUb1N0cmluZyhrKS5cbiAgICAgICAgLy8gaWkuIExldCBuZXh0IGJlIEl0ZXJhdG9yU3RlcChpdGVyYXRvcikuXG4gICAgICAgIC8vIGlpaS4gUmV0dXJuSWZBYnJ1cHQobmV4dCkuXG4gICAgICAgIG5leHQgPSBpdGVyYXRvclN0ZXAoaXRlcmF0b3IpO1xuXG4gICAgICAgIC8vIGl2LiBJZiBuZXh0IGlzIGZhbHNlLCB0aGVuXG4gICAgICAgIGlmICghbmV4dCkge1xuXG4gICAgICAgICAgLy8gMS4gTGV0IHNldFN0YXR1cyBiZSBTZXQoQSwgXCJsZW5ndGhcIiwgaywgdHJ1ZSkuXG4gICAgICAgICAgLy8gMi4gUmV0dXJuSWZBYnJ1cHQoc2V0U3RhdHVzKS5cbiAgICAgICAgICBBLmxlbmd0aCA9IGs7XG5cbiAgICAgICAgICAvLyAzLiBSZXR1cm4gQS5cbiAgICAgICAgICByZXR1cm4gQTtcbiAgICAgICAgfVxuICAgICAgICAvLyB2LiBMZXQgbmV4dFZhbHVlIGJlIEl0ZXJhdG9yVmFsdWUobmV4dCkuXG4gICAgICAgIC8vIHZpLiBSZXR1cm5JZkFicnVwdChuZXh0VmFsdWUpXG4gICAgICAgIG5leHRWYWx1ZSA9IG5leHQudmFsdWU7XG5cbiAgICAgICAgLy8gdmlpLiBJZiBtYXBwaW5nIGlzIHRydWUsIHRoZW5cbiAgICAgICAgLy8gICAxLiBMZXQgbWFwcGVkVmFsdWUgYmUgQ2FsbChtYXBmbiwgVCwgwqtuZXh0VmFsdWUsIGvCuykuXG4gICAgICAgIC8vICAgMi4gSWYgbWFwcGVkVmFsdWUgaXMgYW4gYWJydXB0IGNvbXBsZXRpb24sIHJldHVyblxuICAgICAgICAvLyAgICAgIEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIG1hcHBlZFZhbHVlKS5cbiAgICAgICAgLy8gICAzLiBMZXQgbWFwcGVkVmFsdWUgYmUgbWFwcGVkVmFsdWUuW1t2YWx1ZV1dLlxuICAgICAgICAvLyB2aWlpLiBFbHNlLCBsZXQgbWFwcGVkVmFsdWUgYmUgbmV4dFZhbHVlLlxuICAgICAgICAvLyBpeC4gIExldCBkZWZpbmVTdGF0dXMgYmUgdGhlIHJlc3VsdCBvZlxuICAgICAgICAvLyAgICAgIENyZWF0ZURhdGFQcm9wZXJ0eU9yVGhyb3coQSwgUGssIG1hcHBlZFZhbHVlKS5cbiAgICAgICAgLy8geC4gW1RPRE9dIElmIGRlZmluZVN0YXR1cyBpcyBhbiBhYnJ1cHQgY29tcGxldGlvbiwgcmV0dXJuXG4gICAgICAgIC8vICAgIEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGRlZmluZVN0YXR1cykuXG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSBtYXBGbi5jYWxsKFQsIG5leHRWYWx1ZSwgayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IG5leHRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB4aS4gSW5jcmVhc2UgayBieSAxLlxuICAgICAgICBrKys7XG4gICAgICB9XG4gICAgICAvLyA3LiBBc3NlcnQ6IGl0ZW1zIGlzIG5vdCBhbiBJdGVyYWJsZSBzbyBhc3N1bWUgaXQgaXNcbiAgICAgIC8vICAgIGFuIGFycmF5LWxpa2Ugb2JqZWN0LlxuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIDguIExldCBhcnJheUxpa2UgYmUgVG9PYmplY3QoaXRlbXMpLlxuICAgICAgdmFyIGFycmF5TGlrZSA9IE9iamVjdChpdGVtcyk7XG5cbiAgICAgIC8vIDkuIFJldHVybklmQWJydXB0KGl0ZW1zKS5cbiAgICAgIGlmIChpdGVtcyA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvYmplY3QgLSBub3QgbnVsbCBvciB1bmRlZmluZWQnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIDEwLiBMZXQgbGVuIGJlIFRvTGVuZ3RoKEdldChhcnJheUxpa2UsIFwibGVuZ3RoXCIpKS5cbiAgICAgIC8vIDExLiBSZXR1cm5JZkFicnVwdChsZW4pLlxuICAgICAgdmFyIGxlbiA9IHRvTGVuZ3RoKGFycmF5TGlrZS5sZW5ndGgpO1xuXG4gICAgICAvLyAxMi4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAgICAgYS4gTGV0IEEgYmUgQ29uc3RydWN0KEMsIMKrbGVuwrspLlxuICAgICAgLy8gMTMuIEVsc2VcbiAgICAgIC8vICAgICBhLiBMZXQgQSBiZSBBcnJheUNyZWF0ZShsZW4pLlxuICAgICAgLy8gMTQuIFJldHVybklmQWJydXB0KEEpLlxuICAgICAgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgLy8gMTUuIExldCBrIGJlIDAuXG4gICAgICBrID0gMDtcbiAgICAgIC8vIDE2LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW7igKYgKGFsc28gc3RlcHMgYSAtIGgpXG4gICAgICB2YXIga1ZhbHVlO1xuICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAga1ZhbHVlID0gYXJyYXlMaWtlW2tdO1xuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gbWFwRm4uY2FsbChULCBrVmFsdWUsIGspO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIEFba10gPSBrVmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaysrO1xuICAgICAgfVxuICAgICAgLy8gMTcuIExldCBzZXRTdGF0dXMgYmUgU2V0KEEsIFwibGVuZ3RoXCIsIGxlbiwgdHJ1ZSkuXG4gICAgICAvLyAxOC4gUmV0dXJuSWZBYnJ1cHQoc2V0U3RhdHVzKS5cbiAgICAgIEEubGVuZ3RoID0gbGVuO1xuICAgICAgLy8gMTkuIFJldHVybiBBLlxuICAgIH1cbiAgICByZXR1cm4gQTtcbiAgfTtcbn0pKCk7XG4iXX0=
