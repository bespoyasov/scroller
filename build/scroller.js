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
      var _config$hideScrollbar = config.hideScrollbar;
      var hideScrollbar = _config$hideScrollbar === undefined ? false : _config$hideScrollbar;
      var _config$hideAnchors = config.hideAnchors;
      var hideAnchors = _config$hideAnchors === undefined ? false : _config$hideAnchors;
      var _config$start = config.start;
      var start = _config$start === undefined ? 0 : _config$start;
      var _config$startAnimatio = config.startAnimation;
      var startAnimation = _config$startAnimatio === undefined ? false : _config$startAnimatio;
      var el = config.el;
      var onClick = config.onClick;


      this.config = {
        align: align,
        noAnchors: hideAnchors || noAnchors,
        noScrollbar: hideScrollbar || noScrollbar,
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
        if (rootNode.getAttribute('data-leftalign') || rootNode.getAttribute('data-leftAlign') || rootNode.getAttribute('data-leftIfWide') || this.config.align !== 'center') {
          this.addClass(rootNode, this.config.leftAlignClsnm);
        }

        if (this.config.noAnchors || rootNode.getAttribute('data-noanchors') || rootNode.getAttribute('data-hideAnchors')) {
          this.addClass(rootNode, this.config.noAnchorsClsnm);
        }

        if (this.config.noScrollbar || rootNode.getAttribute('data-noscrollbar') || rootNode.getAttribute('data-hideScrollbar')) {
          this.addClass(rootNode, this.config.noScrollbarClsnm);
        }

        if (rootNode.getAttribute('data-start')) {
          this.config.start = rootNode.getAttribute('data-start');
        }

        if (rootNode.getAttribute('data-startAnimation')) {
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
        var _config$hideAnchors2 = config.hideAnchors;
        var hideAnchors = _config$hideAnchors2 === undefined ? this.config.noAnchors : _config$hideAnchors2;
        var _config$noScrollbar2 = config.noScrollbar;
        var noScrollbar = _config$noScrollbar2 === undefined ? this.config.noScrollbar : _config$noScrollbar2;
        var _config$hideScrollbar2 = config.hideScrollbar;
        var hideScrollbar = _config$hideScrollbar2 === undefined ? this.config.noScrollbar : _config$hideScrollbar2;
        var _config$onClick = config.onClick;
        var onClick = _config$onClick === undefined ? this.config.onClick : _config$onClick;
        var _config$start2 = config.start;
        var start = _config$start2 === undefined ? this.config.start : _config$start2;
        var _config$startAnimatio2 = config.startAnimation;
        var startAnimation = _config$startAnimatio2 === undefined ? this.config.startAnimation : _config$startAnimatio2;


        this.config.align = align;
        this.config.noAnchors = hideAnchors || noAnchors;
        this.config.noScrollbar = hideScrollbar || noScrollbar;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUMsYUFBVzs7OztBQUlWLE1BQUksQ0FBQyxNQUFNLElBQVgsRUFBaUIsTUFBTSxJQUFOLEdBQWEsUUFBUSxZQUFSLENBQWI7Ozs7QUFLakIsR0FBQyxVQUFVLEdBQVYsRUFBZTtBQUNkLFFBQUksT0FBSixDQUFZLFVBQVUsSUFBVixFQUFnQjtBQUMxQixVQUFJLEtBQUssY0FBTCxDQUFvQixRQUFwQixDQUFKLEVBQW1DOztBQUVuQyxhQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsUUFBNUIsRUFBc0M7QUFDcEMsc0JBQWMsSUFEc0I7QUFFcEMsb0JBQVksSUFGd0I7QUFHcEMsa0JBQVUsSUFIMEI7QUFJcEMsZUFBTyxTQUFTLE1BQVQsR0FBa0I7QUFDdkIsZUFBSyxVQUFMLENBQWdCLFdBQWhCLENBQTRCLElBQTVCO0FBQ0Q7QUFObUMsT0FBdEM7QUFRRCxLQVhEO0FBWUQsR0FiRCxFQWFHLENBQUMsUUFBUSxTQUFULEVBQW9CLGNBQWMsU0FBbEMsRUFBNkMsYUFBYSxTQUExRCxDQWJIOzs7O0FBa0JBLE1BQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsWUFBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFFBQVEsU0FBUixDQUFrQixlQUFsQixJQUFxQyxVQUFTLFFBQVQsRUFBbUI7QUFDbEYsVUFBSSxVQUFVLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsQ0FBZDtVQUFtRCxLQUFLLElBQXhEO0FBQ0EsYUFBTyxNQUFNLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUIsRUFBbUMsVUFBUyxDQUFULEVBQVc7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG4gIFxuICAvLyBBcnJheS5mcm9tIHBvbHlmaWxsXG4gIFxuICBpZiAoIUFycmF5LmZyb20pIEFycmF5LmZyb20gPSByZXF1aXJlKCdhcnJheS1mcm9tJyk7XG4gIFxuXG4gIC8vIHJlbW92ZSBwb2x5ZmlsbFxuXG4gIChmdW5jdGlvbiAoYXJyKSB7XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KCdyZW1vdmUnKSkgcmV0dXJuXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncmVtb3ZlJywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9KShbRWxlbWVudC5wcm90b3R5cGUsIENoYXJhY3RlckRhdGEucHJvdG90eXBlLCBEb2N1bWVudFR5cGUucHJvdG90eXBlXSlcblxuXG4gIC8vIG1hdGNoZXMgcG9seWZpbGxcblxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgbWF0Y2hlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLCB0aCA9IHRoaXNcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc29tZS5jYWxsKG1hdGNoZXMsIGZ1bmN0aW9uKGUpe1xuICAgICAgICByZXR1cm4gZSA9PT0gdGhcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cblxuICAvLyBjbG9zZXN0IHBvbHlmaWxsXG5cbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uKGNzcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzXG5cbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLm1hdGNoZXMoY3NzKSkgcmV0dXJuIG5vZGVcbiAgICAgICAgZWxzZSBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cblxuICAvLyBoZWxwZXJzXG5cbiAgY29uc3QgZ2V0RWxlbWVudCA9IChzZWxlY3Rvcj0nJywgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlID8gbm9kZVswXSA6IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEVsZW1lbnRzID0gKHNlbGVjdG9yPScnLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlcyA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlcyB8fCBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFdmVudFggPSBlID0+IHtcbiAgICByZXR1cm4gZS5jaGFuZ2VkVG91Y2hlc1xuICAgICAgICAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aFxuICAgICAgICAmJiBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYXG4gICAgICB8fCBlLnRvdWNoZXNcbiAgICAgICAgJiYgZS50b3VjaGVzLmxlbmd0aFxuICAgICAgICAmJiBlLnRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIHx8IGUucGFnZVggXG4gICAgICB8fCAwXG4gIH1cblxuICBjb25zdCBnZXRDaGlsZHJlbiA9IChlbCkgPT4ge1xuICAgIGxldCBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcyxcbiAgICAgICAgY2hpbGRyZW4gPSBbXSxcbiAgICAgICAgaSA9IGNoaWxkTm9kZXMubGVuZ3RoXG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoY2hpbGROb2Rlc1tpXS5ub2RlVHlwZSA9PSAxKSBjaGlsZHJlbi51bnNoaWZ0KGNoaWxkTm9kZXNbaV0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkcmVuXG4gIH1cblxuICBjb25zdCBpc0FuZHJvaWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwiYW5kcm9pZFwiKSA+IC0xXG4gIH1cblxuXG5cbiAgLy8gc2Nyb2xsZXJcblxuICBjbGFzcyBTY3JvbGxlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPSdjZW50ZXInLFxuICAgICAgICBub0FuY2hvcnM9ZmFsc2UsXG4gICAgICAgIG5vU2Nyb2xsYmFyPWZhbHNlLFxuICAgICAgICBoaWRlU2Nyb2xsYmFyPWZhbHNlLFxuICAgICAgICBoaWRlQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgc3RhcnQ9MCxcbiAgICAgICAgc3RhcnRBbmltYXRpb249ZmFsc2UsXG4gICAgICAgIGVsLFxuICAgICAgICBvbkNsaWNrXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgIG5vQW5jaG9yczogaGlkZUFuY2hvcnMgfHwgbm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcjogaGlkZVNjcm9sbGJhciB8fCBub1Njcm9sbGJhcixcbiAgICAgICAgb25DbGljazogb25DbGljayxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBzdGFydEFuaW1hdGlvbjogc3RhcnRBbmltYXRpb24sXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuICAgICAgICBsZWZ0QWxpZ25DbHNubTogJ2lzLWxlZnQtYWxpZ24nLFxuICAgICAgICBib3JkZXJWc2JsQ2xzbm06ICdpcy12aXNpYmxlJyxcbiAgICAgICAgbm9BbmNob3JzQ2xzbm06ICdpcy1uby1hbmNob3JzJyxcbiAgICAgICAgbm9TY3JvbGxiYXJDbHNubTogJ2lzLW5vLXNjcm9sbGJhcicsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHNjcm9sbGFibGU6IHRydWUsXG5cbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBzY3JvbGxiYXJQb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICAgICAgc2Nyb2xsYmFyRmFjdG9yOiAwLFxuXG4gICAgICAgIHBhZ2VYOiBbXSxcbiAgICAgICAgc2Nyb2xsZWREaWZmOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgc2Nyb2xsYmFyRG93blBhZ2VYOiAwLFxuICAgICAgICBzY3JvbGxDbGlja0Rpc2FibGVkOiBmYWxzZSxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG4gICAgICAgIHN0cmlwV2lkdGg6IDAsXG5cbiAgICAgICAgc3dpcGVEaXJlY3Rpb246IG51bGwsXG4gICAgICAgIHRvdWNoWDogMCxcbiAgICAgICAgdG91Y2hZOiAwLFxuXG4gICAgICAgIGxldDogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldENoaWxkcmVuKGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG5cbiAgICAgICAgaXNBbmRyb2lkOiBpc0FuZHJvaWQoKVxuICAgICAgfVxuXG4gICAgICB3aW5kb3cucmFmID0gKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcblxuICAgICAgdGhpcy5pbml0KGVsKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXSB8fCAwXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIGFsaWduU2NiVG9SaWdodCgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuICAgIHJlbGVhc2VTY2IoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRTY2JQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKGVsLCBwb3MpIHtcbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG4gICAgc2V0V2lkdGgod2lkdGgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICBlbC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuY3JlYXRlQW5jaG9ycygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuICAgICAgdGhpcy5jaGVja1Njcm9sbGFibGUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGxpbmtOb2RlcyA9IGdldEVsZW1lbnRzKCdhJywgc3RyaXBOb2RlKVxuXG4gICAgICBjb25zdCBzY3JvbGxOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcblxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIC8vIGNvbmZpZ1xuICAgICAgaWYgKFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdGFsaWduJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0QWxpZ24nKSB8fCBcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRJZldpZGUnKSB8fFxuICAgICAgICB0aGlzLmNvbmZpZy5hbGlnbiAhPT0gJ2NlbnRlcidcbiAgICAgICkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5sZWZ0QWxpZ25DbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmNvbmZpZy5ub0FuY2hvcnMgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub2FuY2hvcnMnKSB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGlkZUFuY2hvcnMnKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyIHx8IFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbm9zY3JvbGxiYXInKSB8fFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGlkZVNjcm9sbGJhcicpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydCcpKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXN0YXJ0JylcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydEFuaW1hdGlvbicpKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIFxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TY3JvbGxDbGljay5iaW5kKHRoaXMpKVxuXG4gICAgICBjb25zdCB3aGVlbEV2ZW50ID0gKC9GaXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcih3aGVlbEV2ZW50LCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmcgb24gbGlua3NcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHJlcmVuZGVyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cblxuICAgICAgY29uc3Qgc3RhcnRBbmltYXRpb25IZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNlbnRyYWxOb2RlID0gdGhpcy5maW5kQ2VudHJhbE5vZGUoKVxuICAgICAgICBjb25zdCBhbmltYXRpb24gPSB0aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvbiA/IDEwMDAgOiAwXG4gICAgICAgIGxldCBlbmRwb2ludFxuICAgICAgICBcbiAgICAgICAgaWYgKGNlbnRyYWxOb2RlKSB7XG4gICAgICAgICAgZW5kcG9pbnQgPSBjZW50cmFsTm9kZS5vZmZzZXRMZWZ0IC0gKHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoIC8gMikgKyAoY2VudHJhbE5vZGUub2Zmc2V0V2lkdGggLyAyKVxuICAgICAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oY2VudHJhbE5vZGUub2Zmc2V0TGVmdCwgZW5kcG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBlbmRwb2ludCA9IHRoaXMuY29uZmlnLnN0YXJ0XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNjcm9sbFRvKGVuZHBvaW50LCBhbmltYXRpb24pXG4gICAgICB9XG5cblxuICAgICAgLy8gY2hlY2sgaWYgc2Nyb2xsZXIgaXMgaW4gaGlkZGVuIGJsb2NrXG4gICAgICBjb25zdCBpc0hpZGRlbiA9IGVsID0+IGVsLm9mZnNldFBhcmVudCA9PT0gbnVsbFxuXG4gICAgICBpZiAoaXNIaWRkZW4ocm9vdE5vZGUpKSB7XG4gICAgICAgIGxldCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIGlmICghaXNIaWRkZW4ocm9vdE5vZGUpKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgICAgICAvLyB0cmlnZ2VyaW5nIHJlc2l6ZSBpcyBub3QgcmVsaWFibGVcbiAgICAgICAgICAgIC8vIGp1c3QgcmVjYWxjIHR3aWNlXG4gICAgICAgICAgICB0aGlzLl91cGRhdGUoKVxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlKClcblxuICAgICAgICAgICAgc3RhcnRBbmltYXRpb25IZWxwZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApXG4gICAgICB9XG5cbiAgICAgIFxuICAgICAgc3RhcnRBbmltYXRpb25IZWxwZXIoKVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgIH1cblxuXG4gICAgY3JlYXRlV3JhcHBlcigpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGNvbnN0IHByZXZIdG1sID0gcm9vdE5vZGUuaW5uZXJIVE1MXG4gICAgICBjb25zdCB3cmFwcGVySHRtbCA9IGA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXdyYXBwZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tbGVmdFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LWJvcmRlciAke3ByZWZpeH0tYm9yZGVyLS1yaWdodFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXN0cmlwXCI+JHtwcmV2SHRtbH08L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXNjcm9sbHdyYXBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXNjcm9sbGJhclwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JzXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5gXG5cbiAgICAgIHJvb3ROb2RlLmlubmVySFRNTCA9IHdyYXBwZXJIdG1sXG4gICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCBwcmVmaXgpXG4gICAgfVxuXG4gICAgd3JhcEl0ZW1zKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBBcnJheS5mcm9tKGdldENoaWxkcmVuKHdyYXBwZXJOb2RlKSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgaXRlbVdyYXBwZXIuaW5uZXJIVE1MID0gaXRlbU5vZGUub3V0ZXJIVE1MXG4gICAgICAgIGl0ZW1XcmFwcGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICBpdGVtTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpdGVtV3JhcHBlciwgaXRlbU5vZGUpXG4gICAgICAgIGl0ZW1Ob2RlLnJlbW92ZSgpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGZpbmRDZW50cmFsTm9kZSgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBjZW50cmFsTm9kZXMgPSBnZXRFbGVtZW50cyhgW2RhdGEtY2VudHJhbF1gLCByb290Tm9kZSlcbiAgICAgIHJldHVybiBjZW50cmFsTm9kZXMgJiYgY2VudHJhbE5vZGVzLmxlbmd0aCBcbiAgICAgICAgPyBjZW50cmFsTm9kZXNbY2VudHJhbE5vZGVzLmxlbmd0aCAtIDFdLmNsb3Nlc3QoYC4ke3ByZWZpeH0taXRlbWApXG4gICAgICAgIDogbnVsbFxuICAgIH1cblxuICAgIGNyZWF0ZUFuY2hvcnMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBhbmNXcmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYW5jaG9yc2AsIHJvb3ROb2RlKVxuICAgICAgbGV0IGFuY2hvcnNIdG1sID0gJycsIGNvdW50ZXIgPSAwXG5cbiAgICAgIEFycmF5LmZyb20oZ2V0Q2hpbGRyZW4od3JhcHBlck5vZGUpKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcl0nLCBpdGVtTm9kZSlcbiAgICAgICAgY29uc3QgYW5jaG9yVGV4dCA9IHRhcmdldE5vZGUgXG4gICAgICAgICAgPyB0YXJnZXROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKVxuICAgICAgICAgIDogJydcblxuICAgICAgICBhbmNob3JzSHRtbCArPSBgPHNwYW4gZGF0YS1hbmNob3JpZD1cIiR7Y291bnRlcn1cIiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JcIj48c3Bhbj4ke2FuY2hvclRleHR9PC9zcGFuPjwvc3Bhbj5gXG4gICAgICAgIGl0ZW1Ob2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JvcmlnaW5pZCcsIGNvdW50ZXIpXG4gICAgICAgIGNvdW50ZXIrK1xuICAgICAgfSlcblxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gYW5jaG9yc0h0bWxcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsd3JhcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbHdyYXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGxldCBtYXhIZWlnaHQgPSAwLCBzdW1XaWR0aCA9IDBcblxuICAgICAgcm9vdE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc3RyaXBOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHdyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnJylcbiAgICAgIHNjcm9sbGJhck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc2Nyb2xsd3JhcE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuXG4gICAgICBBcnJheS5mcm9tKGl0ZW1Ob2RlcykuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcbiAgICAgICAgc3VtV2lkdGggKz0gaXRlbU5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHdyYXBwZXJXaWR0aCA9IHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoXG4gICAgICBjb25zdCBzY3JvbGx3cmFwV2lkdGggPSBzY3JvbGx3cmFwTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHN1bVdpZHRoICsgMSAtIHJvb3ROb2RlLm9mZnNldFdpZHRoXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHNjcm9sbHdyYXBXaWR0aCAvIHN1bVdpZHRoXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IE1hdGgubWluKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBsaW1pdFJpZ2h0KVxuICAgICAgY29uc3Qgc2NiU2Nyb2xsZWQgPSBzY3JvbGxlZCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICByb290Tm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLndpZHRoID0gKHN1bVdpZHRoICsgMSkgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzY3JvbGxiYXJOb2RlLnN0eWxlLndpZHRoID0gKHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcikgKyAncHgnXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogc2Nyb2xsZWQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY2JTY3JvbGxlZClcbiAgICAgIHRoaXMuc2V0KCdsaW1pdFJpZ2h0JywgbGltaXRSaWdodClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJGYWN0b3InLCBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyV2lkdGgnLCB3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgfVxuXG4gICAgY2hlY2tTY3JvbGxhYmxlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgc3VtV2lkdGggPSAwLCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBBcnJheS5mcm9tKGl0ZW1Ob2RlcykuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBpZiAod3JhcHBlcldpZHRoID49IHN1bVdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgZmFsc2UpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6ICR7c3VtV2lkdGh9cHhgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDphdXRvYClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHRoaXMuY29uZmlnLmFsaWduICE9PSAnY2VudGVyJykgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG4gICAgICBlbHNlIHRoaXMucmVtb3ZlQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9BbmNob3JzKSB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9BbmNob3JzQ2xzbm0pXG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub1Njcm9sbGJhcikgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcblxuICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgIHRoaXMuY2hlY2tTY3JvbGxhYmxlKClcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcblxuICAgICAgaWYgKCF0aGlzLmNvbmZpZy5ub1Njcm9sbGJhcikge1xuICAgICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgc2Nyb2xsZWQsIDApXG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hlY2tFbGVtZW50KGUpIHtcbiAgICAgIHJldHVybiBlLnRhcmdldC5jbG9zZXN0KGAuJHt0aGlzLmNvbmZpZy5wcmVmaXh9YCkgPT0gdGhpcy5zdGF0ZS5lbFxuICAgIH1cblxuXG4gICAgb25Qb2ludGVyRG93bihlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgdGhpcy5oYW5kbGVUb3VjaFN0YXJ0KGUpXG4gICAgICBpZiAoIWUudG91Y2hlcyAmJiAhZS5jaGFuZ2VkVG91Y2hlcykgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ2Rvd25FdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcblxuICAgICAgY29uc3QgZGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZ2V0RXZlbnRYKGUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWREaWZmJywgZGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIG9uUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBcbiAgICAgIHRoaXMuaGFuZGxlVG91Y2hNb3ZlKGUpXG4gICAgICBpZiAodGhpcy5nZXQoJ3N3aXBlRGlyZWN0aW9uJykgPT0gJ3YnKSByZXR1cm5cbiAgICAgIFxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkRGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZERpZmYnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICAvLyBkcmFnIHRvIGxlZnQgaXMgcG9zaXRpdmUgbnVtYmVyXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIGxldCByZXN1bHQgPSBzY3JvbGxlZERpZmYgLSBjdXJyZW50UGFnZVhcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBsZXQgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG4gICAgICBsZXQgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuXG4gICAgICBpZiAocmVzdWx0IDwgbGltaXRMZWZ0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCArPSBNYXRoLnJvdW5kKDAuMiAqIHNjcm9sbGJhclJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyUmVzdWx0ID0gMFxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoIC09IE1hdGgucm91bmQoMC44ICogKHJlc3VsdCAtIGxpbWl0UmlnaHQpICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgICB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgICB0aGlzLnB1c2goJ3BhZ2VYJywgY3VycmVudFBhZ2VYKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cblxuICAgICAgaWYgKHRoaXMuZ2V0KCdzd2lwZURpcmVjdGlvbicpID09ICd2Jykge1xuICAgICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgICB0aGlzLnNldCgnc3dpcGVEaXJlY3Rpb24nLCBudWxsKVxuICAgICAgICB0aGlzLmNsZWFyKCdwYWdlWCcpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKGdldEVsZW1lbnQoJ2h0bWwnKSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBsYXN0UGFnZVggPSB0aGlzLmdldExhc3RNZWFuaW5nZnVsbCgncGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudEV2ZW50WCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3QgZGlzdGFuY2VEZWx0YSA9IGN1cnJlbnRFdmVudFggLSBsYXN0UGFnZVhcblxuICAgICAgY29uc3QgdGltZURlbHRhID0gKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSB0aGlzLmdldCgnbW92ZUV2ZW50VFMnKSkgLyAxLjVcbiAgICAgIGNvbnN0IGVuZHBvaW50ID0gc2Nyb2xsZWQgLSAoZGlzdGFuY2VEZWx0YSAqIDgpXG5cbiAgICAgIC8vIGNsaWNrZWRcbiAgICAgIGlmIChsYXN0UGFnZVggPT09IDApIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm9uQ2xpY2spIHJldHVybiB0aGlzLmNvbmZpZy5vbkNsaWNrKGUpXG5cbiAgICAgICAgY29uc3QgbGlua05vZGUgPSBlLnRhcmdldC5jbG9zZXN0KCdhJylcbiAgICAgICAgaWYgKCFsaW5rTm9kZSkgcmV0dXJuXG5cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbGlua05vZGUuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKVxuICAgICAgICBjb25zdCBocmVmID0gbGlua05vZGUuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICAgICAgY29uc3QgY3RybENsaWNrID0gZS5jdHJsS2V5IHx8IGUubWV0YUtleVxuXG4gICAgICAgIGlmIChjdHJsQ2xpY2spIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgICBpZiAoIXRhcmdldCAmJiBocmVmKSByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmXG4gICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZignYmxhbmsnKSA+IC0xICYmIGhyZWYpIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgfVxuXG4gICAgICAvLyBkcmFnZ2VkXG4gICAgICAvLyBzdGlja3kgbGVmdFxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byBsZWZ0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwKVxuICAgICAgLy8gc3RpY2t5IHJpZ2h0XG4gICAgICBlbHNlIGlmIChzY3JvbGxlZCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byByaWdodFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwKVxuICAgICAgLy8gb3RoZXJ3aXNlXG4gICAgICBlbHNlIGlmICh0aW1lRGVsdGEgPCAxNTAgJiYgTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgPiAyKSB7XG4gICAgICAgIGNvbnN0IHRpbWVUb0VuZHBvaW50ID0gTWF0aC5yb3VuZChNYXRoLmFicyhkaXN0YW5jZURlbHRhKSAvIHRpbWVEZWx0YSlcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBNYXRoLnJvdW5kKGVuZHBvaW50KSwgdGltZVRvRW5kcG9pbnQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xlYXIoJ3BhZ2VYJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25DbGlja0xpbmsoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIGVcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUuZGVsdGFYIHx8IE1hdGguYWJzKGUuZGVsdGFZKSA+IE1hdGguYWJzKGUuZGVsdGFYKSB8fCAgIXNjcm9sbGFibGUpIHJldHVyblxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qge2RlbHRhWH0gPSBlXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGRlbHRhWCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG5cbiAgICAgIGlmIChyZXN1bHQgPT0gbGltaXRSaWdodCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgZWxzZSB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG4gICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgdHJ1ZSlcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbENsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBzY3JvbGxDbGlja0Rpc2FibGVkID0gdGhpcy5nZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnKVxuXG4gICAgICBpZiAoc2Nyb2xsQ2xpY2tEaXNhYmxlZCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIGZhbHNlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFlLnByZXZlbnREZWZhdWx0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY2JXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSBsaW1pdFJpZ2h0ICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IHBhZ2VYID0gZ2V0RXZlbnRYKGUpXG4gICAgICBjb25zdCBjZW50ZXIgPSBwYWdlWCAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgbGVmdEVkZ2UgPSBjZW50ZXIgLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IHJpZ2h0RWRnZSA9IGNlbnRlciArIHNjYldpZHRoIC8gMlxuICAgICAgXG4gICAgICBsZXQgZW5kcG9pbnQgPSBjZW50ZXIgLyBzY2JGYWN0b3JcbiAgICAgIGlmIChsZWZ0RWRnZSA8IGxpbWl0TGVmdCkgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHJpZ2h0RWRnZSA+IHJpZ2h0U2NiTGltaXQpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgXG4gICAgb25BbmNob3JDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFlLnRhcmdldCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuIFxuICAgICAgXG4gICAgICBjb25zdCBhbmNob3JpZCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWFuY2hvcmlkXScpLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JpZCcpXG4gICAgICBpZiAoIWFuY2hvcmlkKSByZXR1cm5cblxuICAgICAgdGhpcy5yZWxlYXNlU2NiKClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JvcmlnaW5pZD1cIicgKyBhbmNob3JpZCArICdcIl0nLCByb290Tm9kZSlcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgXG4gICAgICBsZXQgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0YXJnZXROb2RlLm9mZnNldExlZnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG4gICAgICBpZiAoTWF0aC5hYnMoZW5kcG9pbnQpIDwgMikgZW5kcG9pbnQgPSAwXG5cbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyRG93bihlKSB7XG4gICAgICBpZiAoIWUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGdldEV2ZW50WChlKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIHRydWUpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhckRvd25QYWdlWCcsIGN1cnJlbnRQYWdlWCAtIHNjcm9sbGVkICogc2Nyb2xsYmFyRmFjdG9yKVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjYlBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJylcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRG93blBhZ2VYID0gdGhpcy5nZXQoJ3Njcm9sbGJhckRvd25QYWdlWCcpXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBnZXRFdmVudFgoZSlcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgZGVsdGEgPSAoY3VycmVudFBhZ2VYIC0gc2Nyb2xsYmFyRG93blBhZ2VYKVxuICAgICAgY29uc3QgcmVzdWx0ID0gTWF0aC5taW4oTWF0aC5tYXgoZGVsdGEgLyBzY3JvbGxiYXJGYWN0b3IsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlclVwKGUpIHtcbiAgICAgIGNvbnN0IHNjYlBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJylcbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIGhhbmRsZVRvdWNoU3RhcnQoZSkge1xuICAgICAgaWYgKCFlLnRvdWNoZXMgJiYgIWUuY2hhbmdlZFRvdWNoZXMpIHJldHVyblxuICAgICAgdGhpcy5zZXQoJ3RvdWNoWCcsIGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCB8fCBlLnRvdWNoZXNbMF0uY2xpZW50WClcbiAgICAgIHRoaXMuc2V0KCd0b3VjaFknLCBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgfHwgZS50b3VjaGVzWzBdLmNsaWVudFkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBoYW5kbGVUb3VjaE1vdmUoZSkge1xuICAgICAgY29uc3QgdG91Y2hYID0gdGhpcy5nZXQoJ3RvdWNoWCcpXG4gICAgICBjb25zdCB0b3VjaFkgPSB0aGlzLmdldCgndG91Y2hZJylcbiAgICAgIGlmICghdG91Y2hYIHx8ICF0b3VjaFkgfHwgKCFlLnRvdWNoZXMgJiYgIWUuY2hhbmdlZFRvdWNoZXMpKSByZXR1cm5cblxuICAgICAgY29uc3QgeFVwID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYIHx8IGUudG91Y2hlc1swXS5jbGllbnRYXG4gICAgICBjb25zdCB5VXAgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgfHwgZS50b3VjaGVzWzBdLmNsaWVudFlcblxuICAgICAgY29uc3QgeERpZmYgPSB0b3VjaFggLSB4VXBcbiAgICAgIGNvbnN0IHlEaWZmID0gdG91Y2hZIC0geVVwXG5cbiAgICAgIGlmIChNYXRoLmFicyh4RGlmZikgPiBNYXRoLmFicyh5RGlmZikpIHRoaXMuc2V0KCdzd2lwZURpcmVjdGlvbicsICdoJylcbiAgICAgIGVsc2UgdGhpcy5zZXQoJ3N3aXBlRGlyZWN0aW9uJywgJ3YnKVxuXG4gICAgICB0aGlzLnNldCgndG91Y2hYJywgMClcbiAgICAgIHRoaXMuc2V0KCd0b3VjaFknLCAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG5cbiAgICBhbmltYXRlKHN0YXJ0LCBzdG9wPTAsIHNwZWVkPTEwLCBhbmltYXRlV2lkdGg9ZmFsc2UpIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gc3RvcCAtIHN0YXJ0XG4gICAgICBjb25zdCB0aW1lID0gTWF0aC5tYXgoLjA1LCBNYXRoLm1pbihNYXRoLmFicyhkZWx0YSkgLyBzcGVlZCwgMSkpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSBzcGVlZCA9PSAwID8gMSA6IDAsXG4gICAgICAgICAgZW5kcG9pbnQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSxcbiAgICAgICAgICBzY2JFbmRwb2ludCA9IGVuZHBvaW50ICogc2NiRmFjdG9yXG5cbiAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmdldCgncG9pbnRlckRvd24nKSB8fCB0aGlzLmdldCgnbW91c2VTY3JvbGwnKSkgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudFRpbWUgKz0gKDEgLyA2MClcbiAgICAgICAgZW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKVxuICAgICAgICAgIDogc3RvcFxuXG4gICAgICAgIHNjYkVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCAqIHNjYkZhY3RvciArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkgKiBzY2JGYWN0b3JcbiAgICAgICAgICA6IHN0b3AgKiBzY2JGYWN0b3JcbiAgICAgICAgXG4gICAgICAgIHNjYkVuZHBvaW50ID0gTWF0aC5taW4oc2NiRW5kcG9pbnQsIHJpZ2h0U2NiTGltaXQpXG5cbiAgICAgICAgaWYgKCFhbmltYXRlV2lkdGgpIHtcbiAgICAgICAgICBpZiAoc2NiRW5kcG9pbnQgPj0gcmlnaHRTY2JMaW1pdCkgdGhpcy5hbGlnblNjYlRvUmlnaHQoKVxuICAgICAgICAgIGVsc2UgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgICAgICB0aGlzLnNldFNjYlBvcyhzY2JFbmRwb2ludClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgc2NidyA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICAgICAgaWYgKHN0YXJ0IDwgc3RvcCkgc2NidyAtPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG4gICAgICAgICAgZWxzZSBzY2J3ICs9IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcblxuICAgICAgICAgIHRoaXMuc2V0V2lkdGgoc2NidylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zKC0xICogZW5kcG9pbnQpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIGVuZHBvaW50KVxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA8IDEpIHJhZih0aWNrKVxuICAgICAgICBlbHNlIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpY2soKVxuICAgIH1cblxuICAgIGNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgaWYgKHNjcm9sbGVkID4gbGltaXRMZWZ0KSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0UmlnaHQpIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLy8gcHVibGljIEFQSVxuXG4gICAgc2Nyb2xsVG8ocG9pbnQsIHRpbWU9MTAwMCkge1xuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgbGV0IGVuZHBvaW50ID0gIWlzTmFOKHBvaW50KSA/IHBhcnNlSW50KHBvaW50KSA6IDBcbiAgICAgIGVuZHBvaW50ID0gTWF0aC5taW4oTWF0aC5tYXgoZW5kcG9pbnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIGlmIChwb2ludCA9PSAnZW5kJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnc3RhcnQnKSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ2NlbnRlcicpIGVuZHBvaW50ID0gbGltaXRSaWdodCAvIDJcblxuICAgICAgdGhpcy5hbmltYXRlKHRoaXMuZ2V0KCdzY3JvbGxlZCcpLCBlbmRwb2ludCwgdGltZSlcbiAgICB9XG5cbiAgICB1cGRhdGUoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPXRoaXMuY29uZmlnLmFsaWduLFxuICAgICAgICBub0FuY2hvcnM9dGhpcy5jb25maWcubm9BbmNob3JzLFxuICAgICAgICBoaWRlQW5jaG9ycz10aGlzLmNvbmZpZy5ub0FuY2hvcnMsXG4gICAgICAgIG5vU2Nyb2xsYmFyPXRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyLFxuICAgICAgICBoaWRlU2Nyb2xsYmFyPXRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyLFxuICAgICAgICBvbkNsaWNrPXRoaXMuY29uZmlnLm9uQ2xpY2ssXG4gICAgICAgIHN0YXJ0PXRoaXMuY29uZmlnLnN0YXJ0LFxuICAgICAgICBzdGFydEFuaW1hdGlvbj10aGlzLmNvbmZpZy5zdGFydEFuaW1hdGlvblxuICAgICAgfSA9IGNvbmZpZ1xuXG4gICAgICB0aGlzLmNvbmZpZy5hbGlnbiA9IGFsaWduXG4gICAgICB0aGlzLmNvbmZpZy5ub0FuY2hvcnMgPSBoaWRlQW5jaG9ycyB8fCBub0FuY2hvcnNcbiAgICAgIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyID0gaGlkZVNjcm9sbGJhciB8fCBub1Njcm9sbGJhclxuICAgICAgdGhpcy5jb25maWcub25DbGljayA9IG9uQ2xpY2tcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0ID0gc3RhcnRcbiAgICAgIHRoaXMuY29uZmlnLnN0YXJ0QW5pbWF0aW9uID0gc3RhcnRBbmltYXRpb25cblxuICAgICAgdGhpcy5fdXBkYXRlKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdCBjb25maWdcblxuICBjb25zdCBhdXRvaW5pdCA9ICgpID0+IHtcbiAgICBjb25zdCBlbHMgPSBnZXRFbGVtZW50cygnLnNjcm9sbGVyJylcbiAgICBBcnJheS5mcm9tKGVscykuZm9yRWFjaChlbCA9PiB7XG4gICAgICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG4gICAgfSlcbiAgfVxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBhdXRvaW5pdClcblxuICBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJpbnRlcmFjdGl2ZVwiKSBhdXRvaW5pdCgpXG4gIH1cblxuICB3aW5kb3cuU2Nyb2xsZXIgPSBTY3JvbGxlclxuXG59KCkpXG4iLCJtb2R1bGUuZXhwb3J0cyA9ICh0eXBlb2YgQXJyYXkuZnJvbSA9PT0gJ2Z1bmN0aW9uJyA/XG4gIEFycmF5LmZyb20gOlxuICByZXF1aXJlKCcuL3BvbHlmaWxsJylcbik7XG4iLCIvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1hcnJheS5mcm9tXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbihmbikge1xuICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7XG4gIH07XG4gIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gMDsgfVxuICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHsgcmV0dXJuIG51bWJlcjsgfVxuICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICB9O1xuICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xuICB9O1xuICB2YXIgaXRlcmF0b3JQcm9wID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZih2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBpZihbJ3N0cmluZycsJ251bWJlcicsJ2Jvb2xlYW4nLCdzeW1ib2wnXS5pbmRleE9mKHR5cGVvZiB2YWx1ZSkgPiAtMSl7XG4gICAgICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICAgICAgICgnaXRlcmF0b3InIGluIFN5bWJvbCkgJiZcbiAgICAgICAgKFN5bWJvbC5pdGVyYXRvciBpbiB2YWx1ZSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfVxuICAgICAgLy8gU3VwcG9ydCBcIkBAaXRlcmF0b3JcIiBwbGFjZWhvbGRlciwgR2Vja28gMjcgdG8gR2Vja28gMzVcbiAgICAgIGVsc2UgaWYgKCdAQGl0ZXJhdG9yJyBpbiB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gJ0BAaXRlcmF0b3InO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKE8sIFApIHtcbiAgICAvLyBBc3NlcnQ6IElzUHJvcGVydHlLZXkoUCkgaXMgdHJ1ZS5cbiAgICBpZiAoTyAhPSBudWxsICYmIFAgIT0gbnVsbCkge1xuICAgICAgLy8gTGV0IGZ1bmMgYmUgR2V0VihPLCBQKS5cbiAgICAgIHZhciBmdW5jID0gT1tQXTtcbiAgICAgIC8vIFJldHVybklmQWJydXB0KGZ1bmMpLlxuICAgICAgLy8gSWYgZnVuYyBpcyBlaXRoZXIgdW5kZWZpbmVkIG9yIG51bGwsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZihmdW5jID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIC8vIElmIElzQ2FsbGFibGUoZnVuYykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGZ1bmMgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuYztcbiAgICB9XG4gIH07XG4gIHZhciBpdGVyYXRvclN0ZXAgPSBmdW5jdGlvbihpdGVyYXRvcikge1xuICAgIC8vIExldCByZXN1bHQgYmUgSXRlcmF0b3JOZXh0KGl0ZXJhdG9yKS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChyZXN1bHQpLlxuICAgIHZhciByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgLy8gTGV0IGRvbmUgYmUgSXRlcmF0b3JDb21wbGV0ZShyZXN1bHQpLlxuICAgIC8vIFJldHVybklmQWJydXB0KGRvbmUpLlxuICAgIHZhciBkb25lID0gQm9vbGVhbihyZXN1bHQuZG9uZSk7XG4gICAgLy8gSWYgZG9uZSBpcyB0cnVlLCByZXR1cm4gZmFsc2UuXG4gICAgaWYoZG9uZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oaXRlbXMgLyosIG1hcEZuLCB0aGlzQXJnICovICkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgIHZhciBDID0gdGhpcztcblxuICAgIC8vIDIuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG5cbiAgICB2YXIgVDtcbiAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gMy4gZWxzZVxuICAgICAgLy8gICBhLiBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbidcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gICBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVFxuICAgICAgLy8gICAgICBiZSB1bmRlZmluZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgIH1cbiAgICAgIC8vICAgYy4gTGV0IG1hcHBpbmcgYmUgdHJ1ZSAoaW1wbGllZCBieSBtYXBGbilcbiAgICB9XG5cbiAgICB2YXIgQSwgaztcblxuICAgIC8vIDQuIExldCB1c2luZ0l0ZXJhdG9yIGJlIEdldE1ldGhvZChpdGVtcywgQEBpdGVyYXRvcikuXG4gICAgLy8gNS4gUmV0dXJuSWZBYnJ1cHQodXNpbmdJdGVyYXRvcikuXG4gICAgdmFyIHVzaW5nSXRlcmF0b3IgPSBnZXRNZXRob2QoaXRlbXMsIGl0ZXJhdG9yUHJvcChpdGVtcykpO1xuXG4gICAgLy8gNi4gSWYgdXNpbmdJdGVyYXRvciBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHVzaW5nSXRlcmF0b3IgIT09IHZvaWQgMCkge1xuICAgICAgLy8gYS4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAgIGkuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXVxuICAgICAgLy8gICAgICBpbnRlcm5hbCBtZXRob2Qgb2YgQyB3aXRoIGFuIGVtcHR5IGFyZ3VtZW50IGxpc3QuXG4gICAgICAvLyBiLiBFbHNlLFxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIHRoZSBhYnN0cmFjdCBvcGVyYXRpb24gQXJyYXlDcmVhdGVcbiAgICAgIC8vICAgICAgd2l0aCBhcmd1bWVudCAwLlxuICAgICAgLy8gYy4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQygpKSA6IFtdO1xuXG4gICAgICAvLyBkLiBMZXQgaXRlcmF0b3IgYmUgR2V0SXRlcmF0b3IoaXRlbXMsIHVzaW5nSXRlcmF0b3IpLlxuICAgICAgdmFyIGl0ZXJhdG9yID0gdXNpbmdJdGVyYXRvci5jYWxsKGl0ZW1zKTtcblxuICAgICAgLy8gZS4gUmV0dXJuSWZBYnJ1cHQoaXRlcmF0b3IpLlxuICAgICAgaWYgKGl0ZXJhdG9yID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZi4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuXG4gICAgICAvLyBnLiBSZXBlYXRcbiAgICAgIHZhciBuZXh0LCBuZXh0VmFsdWU7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAvLyBpLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgIC8vIGlpLiBMZXQgbmV4dCBiZSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpLlxuICAgICAgICAvLyBpaWkuIFJldHVybklmQWJydXB0KG5leHQpLlxuICAgICAgICBuZXh0ID0gaXRlcmF0b3JTdGVwKGl0ZXJhdG9yKTtcblxuICAgICAgICAvLyBpdi4gSWYgbmV4dCBpcyBmYWxzZSwgdGhlblxuICAgICAgICBpZiAoIW5leHQpIHtcblxuICAgICAgICAgIC8vIDEuIExldCBzZXRTdGF0dXMgYmUgU2V0KEEsIFwibGVuZ3RoXCIsIGssIHRydWUpLlxuICAgICAgICAgIC8vIDIuIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICAgICAgQS5sZW5ndGggPSBrO1xuXG4gICAgICAgICAgLy8gMy4gUmV0dXJuIEEuXG4gICAgICAgICAgcmV0dXJuIEE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdi4gTGV0IG5leHRWYWx1ZSBiZSBJdGVyYXRvclZhbHVlKG5leHQpLlxuICAgICAgICAvLyB2aS4gUmV0dXJuSWZBYnJ1cHQobmV4dFZhbHVlKVxuICAgICAgICBuZXh0VmFsdWUgPSBuZXh0LnZhbHVlO1xuXG4gICAgICAgIC8vIHZpaS4gSWYgbWFwcGluZyBpcyB0cnVlLCB0aGVuXG4gICAgICAgIC8vICAgMS4gTGV0IG1hcHBlZFZhbHVlIGJlIENhbGwobWFwZm4sIFQsIMKrbmV4dFZhbHVlLCBrwrspLlxuICAgICAgICAvLyAgIDIuIElmIG1hcHBlZFZhbHVlIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vICAgMy4gTGV0IG1hcHBlZFZhbHVlIGJlIG1hcHBlZFZhbHVlLltbdmFsdWVdXS5cbiAgICAgICAgLy8gdmlpaS4gRWxzZSwgbGV0IG1hcHBlZFZhbHVlIGJlIG5leHRWYWx1ZS5cbiAgICAgICAgLy8gaXguICBMZXQgZGVmaW5lU3RhdHVzIGJlIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgLy8gICAgICBDcmVhdGVEYXRhUHJvcGVydHlPclRocm93KEEsIFBrLCBtYXBwZWRWYWx1ZSkuXG4gICAgICAgIC8vIHguIFtUT0RPXSBJZiBkZWZpbmVTdGF0dXMgaXMgYW4gYWJydXB0IGNvbXBsZXRpb24sIHJldHVyblxuICAgICAgICAvLyAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBkZWZpbmVTdGF0dXMpLlxuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gbWFwRm4uY2FsbChULCBuZXh0VmFsdWUsIGspO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIEFba10gPSBuZXh0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8geGkuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgICAgaysrO1xuICAgICAgfVxuICAgICAgLy8gNy4gQXNzZXJ0OiBpdGVtcyBpcyBub3QgYW4gSXRlcmFibGUgc28gYXNzdW1lIGl0IGlzXG4gICAgICAvLyAgICBhbiBhcnJheS1saWtlIG9iamVjdC5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyA4LiBMZXQgYXJyYXlMaWtlIGJlIFRvT2JqZWN0KGl0ZW1zKS5cbiAgICAgIHZhciBhcnJheUxpa2UgPSBPYmplY3QoaXRlbXMpO1xuXG4gICAgICAvLyA5LiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoaXRlbXMgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlbiBiZSBUb0xlbmd0aChHZXQoYXJyYXlMaWtlLCBcImxlbmd0aFwiKSkuXG4gICAgICAvLyAxMS4gUmV0dXJuSWZBYnJ1cHQobGVuKS5cbiAgICAgIHZhciBsZW4gPSB0b0xlbmd0aChhcnJheUxpa2UubGVuZ3RoKTtcblxuICAgICAgLy8gMTIuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIENvbnN0cnVjdChDLCDCq2xlbsK7KS5cbiAgICAgIC8vIDEzLiBFbHNlXG4gICAgICAvLyAgICAgYS4gTGV0IEEgYmUgQXJyYXlDcmVhdGUobGVuKS5cbiAgICAgIC8vIDE0LiBSZXR1cm5JZkFicnVwdChBKS5cbiAgICAgIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XG5cbiAgICAgIC8vIDE1LiBMZXQgayBiZSAwLlxuICAgICAgayA9IDA7XG4gICAgICAvLyAxNi4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGFycmF5TGlrZVtrXTtcbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDE3LiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgLy8gMTguIFJldHVybklmQWJydXB0KHNldFN0YXR1cykuXG4gICAgICBBLmxlbmd0aCA9IGxlbjtcbiAgICAgIC8vIDE5LiBSZXR1cm4gQS5cbiAgICB9XG4gICAgcmV0dXJuIEE7XG4gIH07XG59KSgpO1xuIl19
