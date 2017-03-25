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

        // check for display none
        var isHidden = function isHidden(el) {
          return el.offsetParent === null;
        };

        if (isHidden(rootNode)) {
          (function () {
            var intervalId = setInterval(function () {
              if (!isHidden(rootNode)) {
                clearInterval(intervalId);
                _this.setSize();
                _this.checkscrollable();
              }
            }, 50);
          })();
        }
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

        rootNode.setAttribute('style', '');
        stripNode.setAttribute('style', '');
        wrapperNode.setAttribute('style', '');
        scrollbarNode.setAttribute('style', '');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBSSxDQUFDLFFBQVEsU0FBUixDQUFrQixPQUF2QixFQUFnQztBQUM5QixZQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsVUFBUyxHQUFULEVBQWM7QUFDeEMsVUFBSSxPQUFPLElBQVg7O0FBRUEsYUFBTyxJQUFQLEVBQWE7QUFDWCxZQUFJLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBSixFQUF1QixPQUFPLElBQVAsQ0FBdkIsS0FDSyxPQUFPLEtBQUssYUFBWjtBQUNOOztBQUVELGFBQU8sSUFBUDtBQUNELEtBVEQ7QUFVRDs7OztBQUtELE1BQU0sYUFBYSxTQUFiLFVBQWEsQ0FBQyxRQUFELEVBQTRCO0FBQUEsUUFBakIsR0FBaUIseURBQWIsUUFBYTs7QUFDN0MsUUFBTSxPQUFPLElBQUksZ0JBQUosQ0FBcUIsUUFBckIsQ0FBYjtBQUNBLFdBQU8sT0FBTyxLQUFLLENBQUwsQ0FBUCxHQUFpQixJQUF4QjtBQUNELEdBSEQ7O0FBS0EsTUFBTSxjQUFjLFNBQWQsV0FBYyxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM5QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxRQUFRLElBQWY7QUFDRCxHQUhEOzs7O0FBekJVLE1Ba0NKLFFBbENJO0FBbUNSLHNCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFBQSwwQkFPZCxNQVBjLENBRWhCLEtBRmdCO0FBQUEsVUFFaEIsS0FGZ0IsaUNBRVYsUUFGVTtBQUFBLDhCQU9kLE1BUGMsQ0FHaEIsU0FIZ0I7QUFBQSxVQUdoQixTQUhnQixxQ0FHTixLQUhNO0FBQUEsZ0NBT2QsTUFQYyxDQUloQixXQUpnQjtBQUFBLFVBSWhCLFdBSmdCLHVD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S0FBTixDQUFELEdBQWdCLFNBQVMsS0FBVCxDQUFoQixHQUFrQyxDQUFqRDtBQUNBLG1CQUFXLEtBQUssR0FBTCxDQUFTLEtBQUssR0FBTCxDQUFTLFFBQVQsRUFBbUIsU0FBbkIsQ0FBVCxFQUF3QyxVQUF4QyxDQUFYOztBQUVBLFlBQUksU0FBUyxLQUFiLEVBQW9CLFdBQVcsVUFBWCxDQUFwQixLQUNLLElBQUksU0FBUyxPQUFiLEVBQXNCLFdBQVcsU0FBWCxDQUF0QixLQUNBLElBQUksU0FBUyxRQUFiLEVBQXVCLFdBQVcsYUFBYSxDQUF4Qjs7QUFFNUIsYUFBSyxPQUFMLENBQWEsS0FBSyxHQUFMLENBQVMsVUFBVCxDQUFiLEVBQW1DLFFBQW5DLEVBQTZDLElBQTdDLEVBQW1ELElBQW5EO0FBQ0Q7QUF4dEJPOztBQUFBO0FBQUE7Ozs7QUErdEJWLE1BQU0sV0FBVyxTQUFYLFFBQVcsR0FBTTtBQUNyQixRQUFNLE1BQU0sWUFBWSxXQUFaLENBQVo7QUFDQSxRQUFJLE9BQUosQ0FBWSxjQUFNO0FBQ2hCLFVBQU0sV0FBVyxJQUFJLFFBQUosQ0FBYSxFQUFFLE1BQUYsRUFBYixDQUFqQjtBQUNELEtBRkQ7QUFHRCxHQUxEOztBQU9BLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDO0FBQUEsV0FBTSxRQUFOO0FBQUEsR0FBOUM7O0FBRUEsV0FBUyxrQkFBVCxHQUE4QixZQUFNO0FBQ2xDLFFBQUksU0FBUyxVQUFULElBQXVCLGFBQTNCLEVBQTBDO0FBQzNDLEdBRkQ7QUFJRCxDQTV1QkEsR0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgLy8gY2xvc2VzdCBwb2x5ZmlsbFxuXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihjc3MpIHtcbiAgICAgIHZhciBub2RlID0gdGhpc1xuXG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5tYXRjaGVzKGNzcykpIHJldHVybiBub2RlXG4gICAgICAgIGVsc2Ugbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG5cbiAgLy8gaGVscGVyc1xuXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3RvciwgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlIHx8IG51bGxcbiAgfVxuXG5cblxuICAvLyBzY3JvbGxlclxuXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249J2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI9ZmFsc2UsXG4gICAgICAgIGVsLFxuICAgICAgICBvbkNsaWNrXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgIG5vQW5jaG9yczogbm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcjogbm9TY3JvbGxiYXIsXG4gICAgICAgIG9uQ2xpY2s6IG9uQ2xpY2ssXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuICAgICAgICBsZWZ0QWxpZ25DbHNubTogJ2lzLWxlZnQtYWxpZ24nLFxuICAgICAgICBib3JkZXJWc2JsQ2xzbm06ICdpcy12aXNpYmxlJyxcbiAgICAgICAgbm9BbmNob3JzQ2xzbm06ICdpcy1uby1hbmNob3JzJyxcbiAgICAgICAgbm9TY3JvbGxiYXJDbHNubTogJ2lzLW5vLXNjcm9sbGJhcicsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHNjcm9sbGFibGU6IHRydWUsXG5cbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBzY3JvbGxiYXJQb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICAgICAgc2Nyb2xsYmFyRmFjdG9yOiAwLFxuXG4gICAgICAgIHBhZ2VYOiBbXSxcbiAgICAgICAgc2Nyb2xsZWREaWZmOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgc2Nyb2xsYmFyRG93blBhZ2VYOiAwLFxuICAgICAgICBzY3JvbGxDbGlja0Rpc2FibGVkOiBmYWxzZSxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG4gICAgICAgIHN0cmlwV2lkdGg6IDAsXG5cbiAgICAgICAgbGVuOiBlbC5oYXNDaGlsZE5vZGVzKCkgJiYgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCBlbCkubGVuZ3RoIHx8IDAsXG4gICAgICAgIGVsOiBlbCB8fCBudWxsLFxuICAgICAgfVxuXG4gICAgICB0aGlzLmluaXQoZWwpXG5cbiAgICAgIHdpbmRvdy5yYWYgPSAoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtzZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApfVxuICAgICAgfSkoKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXSB8fCAwXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIGFsaWduU2NiVG9SaWdodCgpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGVsLCAnaXMtcmlnaHQnKVxuICAgIH1cblxuICAgIHJlbGVhc2VTY2IoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRTY2JQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5zZXRQb3NpdGlvbihlbCwgcG9zKVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKGVsLCBwb3MpIHtcbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHBvcyArICdweCwgMCkgdHJhbnNsYXRlWigwKSdcbiAgICAgIGVsLnN0eWxlLk1velRyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5tc1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5PVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgIH1cblxuICAgIHNldFdpZHRoKHdpZHRoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgZWwuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgICB9XG5cblxuICAgIGluaXQoZWwpIHtcbiAgICAgIHRoaXMuY3JlYXRlV3JhcHBlcigpXG4gICAgICB0aGlzLndyYXBJdGVtcygpXG4gICAgICB0aGlzLmNyZWF0ZUFuY2hvcnMoKVxuICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgIHRoaXMuY2hlY2tzY3JvbGxhYmxlKClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGxpbmtOb2RlcyA9IGdldEVsZW1lbnRzKCdhJywgc3RyaXBOb2RlKVxuXG4gICAgICBjb25zdCBzY3JvbGxOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGx3cmFwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBzY3JvbGxiYXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcblxuICAgICAgY29uc3QgYW5jaG9yc05vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0tYW5jaG9yYCwgcm9vdE5vZGUpXG5cbiAgICAgIC8vIGNvbmZpZ1xuICAgICAgaWYgKFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdGFsaWduJykgfHwgXG4gICAgICAgIHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1sZWZ0SWZXaWRlJykgfHxcbiAgICAgICAgdGhpcy5jb25maWcuYWxpZ24gIT09ICdjZW50ZXInXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubGVmdEFsaWduQ2xzbm0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5ub0FuY2hvcnMgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vYW5jaG9ycycpKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vQW5jaG9yc0Nsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9TY3JvbGxiYXIgfHwgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLW5vc2Nyb2xsYmFyJykpIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgdGhpcy5jb25maWcubm9TY3JvbGxiYXJDbHNubSlcbiAgICAgIH1cblxuXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMsIHN0cmlwTm9kZSkpXG4gICAgICBcbiAgICAgIHNjcm9sbGJhck5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25TY3JvbGxiYXJQb2ludGVyVXAuYmluZCh0aGlzKSlcblxuICAgICAgc2Nyb2xsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TY3JvbGxDbGljay5iaW5kKHRoaXMpKVxuXG4gICAgICBBcnJheS5mcm9tKGFuY2hvcnNOb2RlcykuZm9yRWFjaChhbmNob3JOb2RlID0+IHtcbiAgICAgICAgYW5jaG9yTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25BbmNob3JDbGljay5iaW5kKHRoaXMpKVxuICAgICAgfSlcblxuICAgICAgLy8gcHJldmVudCBjbGlja25nXG4gICAgICBBcnJheS5mcm9tKGxpbmtOb2RlcykuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGlja0xpbmsuYmluZCh0aGlzKSwgZmFsc2UpXG4gICAgICB9KVxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tzY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgIHRoaXMuY2hlY2tzY3JvbGxhYmxlKClcbiAgICAgIH0pXG5cbiAgICAgIC8vIGNoZWNrIGZvciBkaXNwbGF5IG5vbmVcbiAgICAgIGNvbnN0IGlzSGlkZGVuID0gZWwgPT4gZWwub2Zmc2V0UGFyZW50ID09PSBudWxsXG5cbiAgICAgIGlmIChpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgbGV0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFpc0hpZGRlbihyb290Tm9kZSkpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICAgICAgICB0aGlzLmNoZWNrc2Nyb2xsYWJsZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9LCA1MClcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+PGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JzXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5gXG5cbiAgICAgIHJvb3ROb2RlLmlubmVySFRNTCA9IHdyYXBwZXJIdG1sXG4gICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCBwcmVmaXgpXG4gICAgfVxuXG4gICAgd3JhcEl0ZW1zKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBnZXRFbGVtZW50cygnOnNjb3BlID4gKicsIHdyYXBwZXJOb2RlKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgaXRlbVdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBpdGVtV3JhcHBlci5pbm5lckhUTUwgPSBpdGVtTm9kZS5vdXRlckhUTUxcbiAgICAgICAgaXRlbVdyYXBwZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgIGl0ZW1Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW1XcmFwcGVyLCBpdGVtTm9kZSlcbiAgICAgICAgaXRlbU5vZGUucmVtb3ZlKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY3JlYXRlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgYW5jaG9yc0h0bWwgPSAnJywgY291bnRlciA9IDBcblxuICAgICAgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCB3cmFwcGVyTm9kZSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JdJywgaXRlbU5vZGUpLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKVxuICAgICAgICBhbmNob3JzSHRtbCArPSBgPHNwYW4gZGF0YS1hbmNob3JpZD1cIiR7Y291bnRlcn1cIiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JcIj48c3Bhbj4ke2FuY2hvclRleHR9PC9zcGFuPjwvc3Bhbj5gXG4gICAgICAgIGl0ZW1Ob2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JvcmlnaW5pZCcsIGNvdW50ZXIpXG4gICAgICAgIGNvdW50ZXIrK1xuICAgICAgfSlcblxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gYW5jaG9yc0h0bWxcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICByb290Tm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG4gICAgICBzdHJpcE5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgd3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsICcnKVxuICAgICAgc2Nyb2xsYmFyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpXG5cbiAgICAgIGl0ZW1Ob2Rlcy5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGl0ZW1Ob2RlLm9mZnNldEhlaWdodFxuICAgICAgICBpZiAoY3VycmVudEhlaWdodCA+IG1heEhlaWdodCkgbWF4SGVpZ2h0ID0gY3VycmVudEhlaWdodFxuXG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gd3JhcHBlcldpZHRoIC8gc3VtV2lkdGhcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc3RyaXBOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS53aWR0aCA9IChzdW1XaWR0aCArIDEpICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgc2Nyb2xsYmFyTm9kZS5zdHlsZS53aWR0aCA9ICh3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpICsgJ3B4J1xuXG4gICAgICB0aGlzLnNldCgnbGltaXRSaWdodCcsIHN1bVdpZHRoICsgMSAtIHJvb3ROb2RlLm9mZnNldFdpZHRoKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhckZhY3RvcicsIHNjcm9sbGJhckZhY3RvcilcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJXaWR0aCcsIHdyYXBwZXJXaWR0aCAqIHNjcm9sbGJhckZhY3RvcilcbiAgICB9XG5cbiAgICBjaGVja3Njcm9sbGFibGUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0td3JhcHBlcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgYW5jV3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWFuY2hvcnNgLCByb290Tm9kZSlcbiAgICAgIGxldCBzdW1XaWR0aCA9IDAsIHdyYXBwZXJXaWR0aCA9IHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoXG5cbiAgICAgIGl0ZW1Ob2Rlcy5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgc3VtV2lkdGggKz0gaXRlbU5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIH0pXG5cbiAgICAgIGlmICh3cmFwcGVyV2lkdGggPj0gc3VtV2lkdGgpIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGFibGUnLCBmYWxzZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDogJHtzdW1XaWR0aH1weGApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGFibGUnLCB0cnVlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJvb3ROb2RlLCAnaXMtbm90LXNjcm9sbGFibGUnKVxuICAgICAgICBhbmNXcmFwcGVyTm9kZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYHdpZHRoOmF1dG9gKVxuICAgICAgfVxuICAgIH1cblxuXG4gICAgb25Qb2ludGVyRG93bihlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ2Rvd25FdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcblxuICAgICAgY29uc3QgZGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgKGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZERpZmYnLCBkaWZmKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKGdldEVsZW1lbnQoJ2h0bWwnKSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcblxuICAgICAgaWYgKCFlIHx8ICFwb2ludGVyRG93biB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY29uc3Qgc2Nyb2xsZWREaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkRGlmZicpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIC8vIGRyYWcgdG8gbGVmdCBpcyBwb3NpdGl2ZSBudW1iZXJcbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgbGV0IHJlc3VsdCA9IHNjcm9sbGVkRGlmZiAtIGN1cnJlbnRQYWdlWFxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGxldCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcbiAgICAgIGxldCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG5cbiAgICAgIGlmIChyZXN1bHQgPCBsaW1pdExlZnQpIHtcbiAgICAgICAgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoICs9IE1hdGgucm91bmQoMC4yICogc2Nyb2xsYmFyUmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJSZXN1bHQgPSAwXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChyZXN1bHQgPiBsaW1pdFJpZ2h0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0ICsgMC44ICogbGltaXRSaWdodClcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggLT0gTWF0aC5yb3VuZCgwLjggKiAocmVzdWx0IC0gbGltaXRSaWdodCkgKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICAgIHRoaXMuYWxpZ25TY2JUb1JpZ2h0KClcbiAgICAgICAgdGhpcy5zZXRXaWR0aChzY3JvbGxiYXJXaWR0aClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnJlbGVhc2VTY2IoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdmVFdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcbiAgICAgIHRoaXMucHVzaCgncGFnZVgnLCBjdXJyZW50UGFnZVgpXG5cbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uUG9pbnRlclVwKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKGdldEVsZW1lbnQoJ2h0bWwnKSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBsYXN0UGFnZVggPSB0aGlzLmdldExhc3RNZWFuaW5nZnVsbCgncGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudEV2ZW50WCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgY29uc3QgZGlzdGFuY2VEZWx0YSA9IGN1cnJlbnRFdmVudFggLSBsYXN0UGFnZVhcbiAgICAgIGNvbnN0IHRpbWVEZWx0YSA9ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gdGhpcy5nZXQoJ21vdmVFdmVudFRTJykpIC8gMS41XG4gICAgICBjb25zdCBlbmRwb2ludCA9IHNjcm9sbGVkIC0gKGRpc3RhbmNlRGVsdGEgKiA4KVxuXG4gICAgICAvLyBjbGlja2VkXG4gICAgICBpZiAobGFzdFBhZ2VYID09PSAwKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5vbkNsaWNrKSByZXR1cm4gdGhpcy5jb25maWcub25DbGljayhlKVxuXG4gICAgICAgIGNvbnN0IGxpbmtOb2RlID0gZS50YXJnZXQuY2xvc2VzdCgnYScpXG4gICAgICAgIGlmICghbGlua05vZGUpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgndGFyZ2V0JylcbiAgICAgICAgY29uc3QgaHJlZiA9IGxpbmtOb2RlLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICAgIGlmICghdGFyZ2V0ICYmIGhyZWYpIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWZcbiAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKCdibGFuaycpID4gLTEgJiYgaHJlZikgcmV0dXJuIHdpbmRvdy5vcGVuKGhyZWYpXG4gICAgICB9XG5cbiAgICAgIC8vIGRyYWdnZWRcbiAgICAgIC8vIHN0aWNreSBsZWZ0XG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIGxlZnRcbiAgICAgIGVsc2UgaWYgKGVuZHBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTApXG4gICAgICAvLyBzdGlja3kgcmlnaHRcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0LCAxMCwgdHJ1ZSlcbiAgICAgIC8vIHRvbyBtdWNoIHRvIHJpZ2h0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTApXG4gICAgICAvLyBvdGhlcndpc2VcbiAgICAgIGVsc2UgaWYgKHRpbWVEZWx0YSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSAvIHRpbWVEZWx0YVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50LCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvbkNsaWNrTGluayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gZVxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGwob3JpZ2luYWxOb2RlLCBlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuXG4gICAgICBpZiAoIWUgfHwgIWUuZGVsdGFYIHx8IE1hdGguYWJzKGUuZGVsdGFZKSA+IE1hdGguYWJzKGUuZGVsdGFYKSB8fCAgIXNjcm9sbGFibGUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCB7ZGVsdGFYfSA9IGVcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZGVsdGFYLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG4gICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgdHJ1ZSlcblxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbENsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBzY3JvbGxDbGlja0Rpc2FibGVkID0gdGhpcy5nZXQoJ3Njcm9sbENsaWNrRGlzYWJsZWQnKVxuXG4gICAgICBpZiAoc2Nyb2xsQ2xpY2tEaXNhYmxlZCkge1xuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIGZhbHNlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFlLnByZXZlbnREZWZhdWx0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY2JXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY2JGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJpZ2h0U2NiTGltaXQgPSBsaW1pdFJpZ2h0ICogc2NiRmFjdG9yXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IHBhZ2VYID0gZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYXG4gICAgICBjb25zdCBjZW50ZXIgPSBwYWdlWCAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgbGVmdEVkZ2UgPSBjZW50ZXIgLSBzY2JXaWR0aCAvIDJcbiAgICAgIGNvbnN0IHJpZ2h0RWRnZSA9IGNlbnRlciArIHNjYldpZHRoIC8gMlxuICAgICAgXG4gICAgICBsZXQgZW5kcG9pbnQgPSBjZW50ZXIgLyBzY2JGYWN0b3JcbiAgICAgIGlmIChsZWZ0RWRnZSA8IGxpbWl0TGVmdCkgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHJpZ2h0RWRnZSA+IHJpZ2h0U2NiTGltaXQpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgXG4gICAgb25BbmNob3JDbGljayhlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgaWYgKCFlIHx8ICFlLnRhcmdldCB8fCAhc2Nyb2xsYWJsZSkgcmV0dXJuIFxuICAgICAgXG4gICAgICBjb25zdCBhbmNob3JpZCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWFuY2hvcmlkXScpLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JpZCcpXG4gICAgICBpZiAoIWFuY2hvcmlkKSByZXR1cm5cblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JvcmlnaW5pZD1cIicgKyBhbmNob3JpZCArICdcIl0nLCByb290Tm9kZSlcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0YXJnZXROb2RlLm9mZnNldExlZnQsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG5cbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyRG93bihlKSB7XG4gICAgICBpZiAoIWUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJQb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcsIHRydWUpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdtb3VzZVNjcm9sbCcsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhckRvd25QYWdlWCcsIGN1cnJlbnRQYWdlWCAtIHNjcm9sbGVkICogc2Nyb2xsYmFyRmFjdG9yKVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjYlBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJylcbiAgICAgIGlmICghZSB8fCAhc2NiUG9pbnRlckRvd24pIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRG93blBhZ2VYID0gdGhpcy5nZXQoJ3Njcm9sbGJhckRvd25QYWdlWCcpXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIFxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgZGVsdGEgPSAoY3VycmVudFBhZ2VYIC0gc2Nyb2xsYmFyRG93blBhZ2VYKVxuICAgICAgY29uc3QgcmVzdWx0ID0gTWF0aC5taW4oTWF0aC5tYXgoZGVsdGEgLyBzY3JvbGxiYXJGYWN0b3IsIGxpbWl0TGVmdCksIGxpbWl0UmlnaHQpXG4gICAgICBjb25zdCBzY3JvbGxiYXJSZXN1bHQgPSByZXN1bHQgKiBzY3JvbGxiYXJGYWN0b3JcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlclVwKGUpIHtcbiAgICAgIGNvbnN0IHNjYlBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJylcbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIGFuaW1hdGUoc3RhcnQsIHN0b3A9MCwgc3BlZWQ9MTAsIGFuaW1hdGVXaWR0aD1mYWxzZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSBzdG9wIC0gc3RhcnRcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1heCguMDUsIE1hdGgubWluKE1hdGguYWJzKGRlbHRhKSAvIHNwZWVkLCAxKSlcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JykgKiBzY2JGYWN0b3JcblxuICAgICAgbGV0IGN1cnJlbnRUaW1lID0gMCxcbiAgICAgICAgICBlbmRwb2ludCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpLFxuICAgICAgICAgIHNjYkVuZHBvaW50ID0gZW5kcG9pbnQgKiBzY2JGYWN0b3JcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdwb2ludGVyRG93bicpIHx8IHRoaXMuZ2V0KCdtb3VzZVNjcm9sbCcpKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICBlbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpXG4gICAgICAgICAgOiBzdG9wXG5cbiAgICAgICAgc2NiRW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICogc2NiRmFjdG9yICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSAqIHNjYkZhY3RvclxuICAgICAgICAgIDogc3RvcCAqIHNjYkZhY3RvclxuXG5cbiAgICAgICAgaWYgKCFhbmltYXRlV2lkdGgpIHRoaXMuc2V0U2NiUG9zKHNjYkVuZHBvaW50KVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsZXQgc2NidyA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICAgICAgaWYgKHN0YXJ0IDwgc3RvcCkgc2NidyAtPSBkZWx0YSAqIHNjYkZhY3RvciAqICgxIC0gdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSkpXG4gICAgICAgICAgZWxzZSBzY2J3ICs9IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcblxuICAgICAgICAgIHRoaXMuc2V0V2lkdGgoc2NidylcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zKC0xICogZW5kcG9pbnQpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIGVuZHBvaW50KVxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA8IDEpIHJhZih0aWNrKVxuICAgICAgICBlbHNlIHRoaXMuY2hlY2tCb3JkZXJWaXNpYmlsaXR5KClcbiAgICAgIH1cblxuICAgICAgdGljaygpXG4gICAgfVxuXG4gICAgY2hlY2tCb3JkZXJWaXNpYmlsaXR5KCkge1xuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPiBsaW1pdExlZnQpIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlZnRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tbGVmdGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGxlZnRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRSaWdodCkge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLmFkZENsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcmlnaHRCb3JkZXIgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyaWdodEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvLyBwdWJsaWMgQVBJXG5cbiAgICBzY3JvbGxUbyhwb2ludCwgdGltZT0xMDAwKSB7XG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBsZXQgZW5kcG9pbnQgPSAhaXNOYU4ocG9pbnQpID8gcGFyc2VJbnQocG9pbnQpIDogMFxuICAgICAgZW5kcG9pbnQgPSBNYXRoLm1pbihNYXRoLm1heChlbmRwb2ludCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgaWYgKHBvaW50ID09ICdlbmQnKSBlbmRwb2ludCA9IGxpbWl0UmlnaHRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdzdGFydCcpIGVuZHBvaW50ID0gbGltaXRMZWZ0XG4gICAgICBlbHNlIGlmIChwb2ludCA9PSAnY2VudGVyJykgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0IC8gMlxuXG4gICAgICB0aGlzLmFuaW1hdGUodGhpcy5nZXQoJ3Njcm9sbGVkJyksIGVuZHBvaW50LCB0aW1lLCB0cnVlKVxuICAgIH1cbiAgfVxuXG5cblxuICAvLyBhdXRvaW5pdFxuXG4gIGNvbnN0IGF1dG9pbml0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGVscyA9IGdldEVsZW1lbnRzKCcuc2Nyb2xsZXInKVxuICAgIGVscy5mb3JFYWNoKGVsID0+IHtcbiAgICAgIGNvbnN0IHNjcm9sbGVyID0gbmV3IFNjcm9sbGVyKHsgZWwgfSlcbiAgICB9KVxuICB9XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IGF1dG9pbml0KVxuXG4gIGRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImludGVyYWN0aXZlXCIpIGF1dG9pbml0KClcbiAgfVxuXG59KCkpXG4iXX0=
