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
        stripNode.addEventListener('mousewheel', this.onScroll.bind(this));

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
      value: function onScroll(e) {
        var scrollable = this.get('scrollable');

        if (!e || !e.deltaX || Math.abs(e.deltaY) > Math.abs(e.deltaX) || !scrollable) return;
        e.preventDefault();
        e.stopPropagation();

        this.set('mouseScroll', true);

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

  // init

  var els = getElements('.scroller');
  els.forEach(function (el) {
    var scroller = new Scroller({ el: el });
  });
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBSSxDQUFDLFFBQVEsU0FBUixDQUFrQixPQUF2QixFQUFnQztBQUM5QixZQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsVUFBUyxHQUFULEVBQWM7QUFDeEMsVUFBSSxPQUFPLElBQVg7O0FBRUEsYUFBTyxJQUFQLEVBQWE7QUFDWCxZQUFJLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBSixFQUF1QixPQUFPLElBQVAsQ0FBdkIsS0FDSyxPQUFPLEtBQUssYUFBWjtBQUNOOztBQUVELGFBQU8sSUFBUDtBQUNELEtBVEQ7QUFVRDs7OztBQUtELE1BQU0sYUFBYSxTQUFiLFVBQWEsQ0FBQyxRQUFELEVBQTRCO0FBQUEsUUFBakIsR0FBaUIseURBQWIsUUFBYTs7QUFDN0MsUUFBTSxPQUFPLElBQUksZ0JBQUosQ0FBcUIsUUFBckIsQ0FBYjtBQUNBLFdBQU8sT0FBTyxLQUFLLENBQUwsQ0FBUCxHQUFpQixJQUF4QjtBQUNELEdBSEQ7O0FBS0EsTUFBTSxjQUFjLFNBQWQsV0FBYyxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM5QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxRQUFRLElBQWY7QUFDRCxHQUhEOzs7O0FBekJVLE1Ba0NKLFFBbENJO0FBbUNSLHNCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFBQSwwQkFPZCxNQVBjLENBRWhCLEtBRmdCO0FBQUEsVUFFaEIsS0FGZ0IsaUNBRVYsUUFGVTtBQUFBLDhCQU9kLE1BUGMsQ0FHaEIsU0FIZ0I7QUFBQSxVQUdoQixTQUhnQixxQ0FHTixLQUhNO0FBQUEsZ0NBT2QsTUFQYyxDQUloQixXQUpnQjtBQUFBLFVBSWhCLFdBSmdCLHVD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ZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuXG4gIC8vIGNsb3Nlc3QgcG9seWZpbGxcblxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXNcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubWF0Y2hlcyhjc3MpKSByZXR1cm4gbm9kZVxuICAgICAgICBlbHNlIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuXG4gIC8vIGhlbHBlcnNcblxuICBjb25zdCBnZXRFbGVtZW50ID0gKHNlbGVjdG9yLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGUgPyBub2RlWzBdIDogbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RWxlbWVudHMgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSB8fCBudWxsXG4gIH1cblxuXG5cbiAgLy8gc2Nyb2xsZXJcblxuICBjbGFzcyBTY3JvbGxlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsaWduPSdjZW50ZXInLFxuICAgICAgICBub0FuY2hvcnM9ZmFsc2UsXG4gICAgICAgIG5vU2Nyb2xsYmFyPWZhbHNlLFxuICAgICAgICBlbCxcbiAgICAgICAgb25DbGlja1xuICAgICAgfSA9IGNvbmZpZ1xuXG4gICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgYWxpZ246IGFsaWduLFxuICAgICAgICBub0FuY2hvcnM6IG5vQW5jaG9ycyxcbiAgICAgICAgbm9TY3JvbGxiYXI6IG5vU2Nyb2xsYmFyLFxuICAgICAgICBvbkNsaWNrOiBvbkNsaWNrLFxuXG4gICAgICAgIHByZWZpeDogJ2FiX3Njcm9sbGVyJyxcbiAgICAgICAgZHJhZ2dpbmdDbHNubTogJ2lzLWRyYWdnaW5nJyxcbiAgICAgICAgbGVmdEFsaWduQ2xzbm06ICdpcy1sZWZ0LWFsaWduJyxcbiAgICAgICAgYm9yZGVyVnNibENsc25tOiAnaXMtdmlzaWJsZScsXG4gICAgICAgIG5vQW5jaG9yc0Nsc25tOiAnaXMtbm8tYW5jaG9ycycsXG4gICAgICAgIG5vU2Nyb2xsYmFyQ2xzbm06ICdpcy1uby1zY3JvbGxiYXInLFxuXG4gICAgICAgIGVhc2luZzogcG9zID0+IHBvcyA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogcG9zKSArIDEsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBzY3JvbGxhYmxlOiB0cnVlLFxuXG4gICAgICAgIHBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgc2Nyb2xsYmFyUG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBtb3VzZVNjcm9sbDogZmFsc2UsXG5cbiAgICAgICAgc2Nyb2xsYmFyV2lkdGg6IDAsXG4gICAgICAgIHNjcm9sbGJhckZhY3RvcjogMCxcblxuICAgICAgICBwYWdlWDogW10sXG4gICAgICAgIHNjcm9sbGVkRGlmZjogMCxcbiAgICAgICAgZG93bkV2ZW50VFM6IDAsXG4gICAgICAgIG1vdmVFdmVudFRTOiAwLFxuXG4gICAgICAgIHNjcm9sbGJhckRvd25QYWdlWDogMCxcbiAgICAgICAgc2Nyb2xsQ2xpY2tEaXNhYmxlZDogZmFsc2UsXG5cbiAgICAgICAgbGltaXRMZWZ0OiAwLFxuICAgICAgICBsaW1pdFJpZ2h0OiAwLFxuICAgICAgICBzdHJpcFdpZHRoOiAwLFxuXG4gICAgICAgIGxlbjogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldEVsZW1lbnRzKCc6c2NvcGUgPiAqJywgZWwpLmxlbmd0aCB8fCAwLFxuICAgICAgICBlbDogZWwgfHwgbnVsbCxcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbml0KGVsKVxuXG4gICAgICB3aW5kb3cucmFmID0gKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcbiAgICB9XG5cblxuICAgIGdldChwcm9wKSB7XG4gICAgICByZXR1cm4gdHlwZW9mKHRoaXMuc3RhdGVbcHJvcF0pICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgICAgOiBudWxsXG4gICAgfVxuXG4gICAgc2V0KHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdID0gdmFsdWVcbiAgICB9XG5cbiAgICBwdXNoKHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdICYmIHRoaXMuc3RhdGVbcHJvcF0ucHVzaCh2YWx1ZSlcbiAgICB9XG5cbiAgICBjbGVhcihwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGlmIChmaWVsZCAmJiBmaWVsZC5sZW5ndGgpIGZpZWxkLmxlbmd0aCA9IDBcbiAgICB9XG5cbiAgICBnZXRMYXN0TWVhbmluZ2Z1bGwocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBjb25zdCB0b0lnbm9yZSA9IGZpZWxkICYmIGZpZWxkLmxlbmd0aCAmJiBmaWVsZC5sZW5ndGggPiAzID8gMyA6IDFcbiAgICAgIHJldHVybiBmaWVsZFtmaWVsZC5sZW5ndGggLSB0b0lnbm9yZV0gfHwgMFxuICAgIH1cblxuXG4gICAgYWRkQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBpZiAoIW5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2wrJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKSkgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsXG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFxzK3xeKScrY2wrJyhcXFxccyt8JCknLCAnZycpLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICB9XG5cbiAgICBhbGlnblNjYlRvUmlnaHQoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgJ2lzLXJpZ2h0JylcbiAgICB9XG5cbiAgICByZWxlYXNlU2NiKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZWwsICdpcy1yaWdodCcpXG4gICAgfVxuXG5cbiAgICBzZXRQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsLCBwb3MpXG4gICAgfVxuXG4gICAgc2V0U2NiUG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWwsIHBvcylcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbihlbCwgcG9zKSB7XG4gICAgICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyBwb3MgKyAncHgsIDApIHRyYW5zbGF0ZVooMCknXG4gICAgICBlbC5zdHlsZS5Nb3pUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUubXNUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUuT1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICB9XG5cbiAgICBzZXRXaWR0aCh3aWR0aCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zY3JvbGxiYXJgLCByb290Tm9kZSlcbiAgICAgIGVsLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgfVxuXG5cbiAgICBpbml0KGVsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVdyYXBwZXIoKVxuICAgICAgdGhpcy53cmFwSXRlbXMoKVxuICAgICAgdGhpcy5jcmVhdGVBbmNob3JzKClcbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG4gICAgICB0aGlzLmNoZWNrc2Nyb2xsYWJsZSgpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBsaW5rTm9kZXMgPSBnZXRFbGVtZW50cygnYScsIHN0cmlwTm9kZSlcblxuICAgICAgY29uc3Qgc2Nyb2xsTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsd3JhcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc2Nyb2xsYmFyYCwgcm9vdE5vZGUpXG5cbiAgICAgIGNvbnN0IGFuY2hvcnNOb2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWFuY2hvcmAsIHJvb3ROb2RlKVxuXG4gICAgICAvLyBjb25maWdcbiAgICAgIGlmIChcbiAgICAgICAgcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZnRhbGlnbicpIHx8IFxuICAgICAgICByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGVmdElmV2lkZScpIHx8XG4gICAgICAgIHRoaXMuY29uZmlnLmFsaWduICE9PSAnY2VudGVyJ1xuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLmxlZnRBbGlnbkNsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcubm9BbmNob3JzIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub2FuY2hvcnMnKSkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCB0aGlzLmNvbmZpZy5ub0FuY2hvcnNDbHNubSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyIHx8IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1ub3Njcm9sbGJhcicpKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHRoaXMuY29uZmlnLm5vU2Nyb2xsYmFyQ2xzbm0pXG4gICAgICB9XG5cblxuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIHRoaXMub25TY3JvbGwuYmluZCh0aGlzKSlcbiAgICAgIFxuICAgICAgc2Nyb2xsYmFyTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uU2Nyb2xsYmFyUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblNjcm9sbGJhclBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuXG4gICAgICBzY3JvbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNjcm9sbENsaWNrLmJpbmQodGhpcykpXG5cbiAgICAgIEFycmF5LmZyb20oYW5jaG9yc05vZGVzKS5mb3JFYWNoKGFuY2hvck5vZGUgPT4ge1xuICAgICAgICBhbmNob3JOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkFuY2hvckNsaWNrLmJpbmQodGhpcykpXG4gICAgICB9KVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmdcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaXplKClcbiAgICAgICAgdGhpcy5jaGVja3Njcm9sbGFibGUoKVxuICAgICAgfSlcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tYm9yZGVyICR7cHJlZml4fS1ib3JkZXItLWxlZnRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1ib3JkZXIgJHtwcmVmaXh9LWJvcmRlci0tcmlnaHRcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zdHJpcFwiPiR7cHJldkh0bWx9PC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGx3cmFwXCI+PGRpdiBjbGFzcz1cIiR7cHJlZml4fS1zY3JvbGxiYXJcIj48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JzXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5gXG5cbiAgICAgIHJvb3ROb2RlLmlubmVySFRNTCA9IHdyYXBwZXJIdG1sXG4gICAgICB0aGlzLmFkZENsYXNzKHJvb3ROb2RlLCBwcmVmaXgpXG4gICAgfVxuXG4gICAgd3JhcEl0ZW1zKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBnZXRFbGVtZW50cygnOnNjb3BlID4gKicsIHdyYXBwZXJOb2RlKS5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgaXRlbVdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBpdGVtV3JhcHBlci5pbm5lckhUTUwgPSBpdGVtTm9kZS5vdXRlckhUTUxcbiAgICAgICAgaXRlbVdyYXBwZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGAke3ByZWZpeH0taXRlbWApXG4gICAgICAgIGl0ZW1Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW1XcmFwcGVyLCBpdGVtTm9kZSlcbiAgICAgICAgaXRlbU5vZGUucmVtb3ZlKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY3JlYXRlQW5jaG9ycygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgYW5jaG9yc0h0bWwgPSAnJywgY291bnRlciA9IDBcblxuICAgICAgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCB3cmFwcGVyTm9kZSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGFuY2hvclRleHQgPSBnZXRFbGVtZW50KCdbZGF0YS1hbmNob3JdJywgaXRlbU5vZGUpLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3InKVxuICAgICAgICBhbmNob3JzSHRtbCArPSBgPHNwYW4gZGF0YS1hbmNob3JpZD1cIiR7Y291bnRlcn1cIiBjbGFzcz1cIiR7cHJlZml4fS1hbmNob3JcIj48c3Bhbj4ke2FuY2hvclRleHR9PC9zcGFuPjwvc3Bhbj5gXG4gICAgICAgIGl0ZW1Ob2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3JvcmlnaW5pZCcsIGNvdW50ZXIpXG4gICAgICAgIGNvdW50ZXIrK1xuICAgICAgfSlcblxuICAgICAgYW5jV3JhcHBlck5vZGUuaW5uZXJIVE1MID0gYW5jaG9yc0h0bWxcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IHNjcm9sbGJhck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXNjcm9sbGJhcmAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcblxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgY29uc3Qgd3JhcHBlcldpZHRoID0gd3JhcHBlck5vZGUub2Zmc2V0V2lkdGhcbiAgICAgIGNvbnN0IHNjcm9sbGJhckZhY3RvciA9IHdyYXBwZXJXaWR0aCAvIHN1bVdpZHRoXG5cbiAgICAgIHJvb3ROb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHN0cmlwTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICBzdHJpcE5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcbiAgICAgIHdyYXBwZXJOb2RlLnN0eWxlLmhlaWdodCA9IG1heEhlaWdodCArICdweCdcbiAgICAgIHNjcm9sbGJhck5vZGUuc3R5bGUud2lkdGggPSAod3JhcHBlcldpZHRoICogc2Nyb2xsYmFyRmFjdG9yKSArICdweCdcblxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxiYXJGYWN0b3InLCBzY3JvbGxiYXJGYWN0b3IpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyV2lkdGgnLCB3cmFwcGVyV2lkdGggKiBzY3JvbGxiYXJGYWN0b3IpXG4gICAgfVxuXG4gICAgY2hlY2tzY3JvbGxhYmxlKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXdyYXBwZXJgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGl0ZW1Ob2RlcyA9IGdldEVsZW1lbnRzKGAuJHtwcmVmaXh9LWl0ZW1gLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGFuY1dyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1hbmNob3JzYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgc3VtV2lkdGggPSAwLCB3cmFwcGVyV2lkdGggPSB3cmFwcGVyTm9kZS5vZmZzZXRXaWR0aFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICBpZiAod3JhcHBlcldpZHRoID49IHN1bVdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgZmFsc2UpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsICdpcy1ub3Qtc2Nyb2xsYWJsZScpXG4gICAgICAgIGFuY1dyYXBwZXJOb2RlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgd2lkdGg6ICR7c3VtV2lkdGh9cHhgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxhYmxlJywgdHJ1ZSlcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhyb290Tm9kZSwgJ2lzLW5vdC1zY3JvbGxhYmxlJylcbiAgICAgICAgYW5jV3JhcHBlck5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIGB3aWR0aDphdXRvYClcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIFxuICAgICAgaWYgKCFlIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCBmYWxzZSlcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG5cbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKSArIChlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVgpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWREaWZmJywgZGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG5cbiAgICAgIGlmICghZSB8fCAhcG9pbnRlckRvd24gfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkRGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZERpZmYnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICAvLyBkcmFnIHRvIGxlZnQgaXMgcG9zaXRpdmUgbnVtYmVyXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGxldCByZXN1bHQgPSBzY3JvbGxlZERpZmYgLSBjdXJyZW50UGFnZVhcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBsZXQgc2Nyb2xsYmFyUmVzdWx0ID0gcmVzdWx0ICogc2Nyb2xsYmFyRmFjdG9yXG4gICAgICBsZXQgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLmdldCgnc2Nyb2xsYmFyV2lkdGgnKVxuXG4gICAgICBpZiAocmVzdWx0IDwgbGltaXRMZWZ0KSB7XG4gICAgICAgIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgICBzY3JvbGxiYXJXaWR0aCArPSBNYXRoLnJvdW5kKDAuMiAqIHNjcm9sbGJhclJlc3VsdClcbiAgICAgICAgc2Nyb2xsYmFyUmVzdWx0ID0gMFxuICAgICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkge1xuICAgICAgICByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG4gICAgICAgIHNjcm9sbGJhcldpZHRoIC09IE1hdGgucm91bmQoMC44ICogKHJlc3VsdCAtIGxpbWl0UmlnaHQpICogc2Nyb2xsYmFyRmFjdG9yKVxuICAgICAgICB0aGlzLmFsaWduU2NiVG9SaWdodCgpXG4gICAgICAgIHRoaXMuc2V0V2lkdGgoc2Nyb2xsYmFyV2lkdGgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlU2NiKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG5cbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgICB0aGlzLnB1c2goJ3BhZ2VYJywgY3VycmVudFBhZ2VYKVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBvblBvaW50ZXJVcChlKSB7XG4gICAgICBjb25zdCBzY3JvbGxhYmxlID0gdGhpcy5nZXQoJ3Njcm9sbGFibGUnKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyhnZXRFbGVtZW50KCdodG1sJyksIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG4gICAgICBjb25zdCB0aW1lRGVsdGEgPSAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHRoaXMuZ2V0KCdtb3ZlRXZlbnRUUycpKSAvIDEuNVxuICAgICAgY29uc3QgZW5kcG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogOClcblxuICAgICAgLy8gY2xpY2tlZFxuICAgICAgaWYgKGxhc3RQYWdlWCA9PT0gMCkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcub25DbGljaykgcmV0dXJuIHRoaXMuY29uZmlnLm9uQ2xpY2soZSlcblxuICAgICAgICBjb25zdCBsaW5rTm9kZSA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2EnKVxuICAgICAgICBpZiAoIWxpbmtOb2RlKSByZXR1cm5cblxuICAgICAgICBjb25zdCB0YXJnZXQgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpXG4gICAgICAgIGNvbnN0IGhyZWYgPSBsaW5rTm9kZS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICBpZiAoIXRhcmdldCAmJiBocmVmKSByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmXG4gICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZignYmxhbmsnKSA+IC0xICYmIGhyZWYpIHJldHVybiB3aW5kb3cub3BlbihocmVmKVxuICAgICAgfVxuXG4gICAgICAvLyBkcmFnZ2VkXG4gICAgICAvLyBzdGlja3kgbGVmdFxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byBsZWZ0XG4gICAgICBlbHNlIGlmIChlbmRwb2ludCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQsIDEwKVxuICAgICAgLy8gc3RpY2t5IHJpZ2h0XG4gICAgICBlbHNlIGlmIChzY3JvbGxlZCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodCwgMTAsIHRydWUpXG4gICAgICAvLyB0b28gbXVjaCB0byByaWdodFxuICAgICAgZWxzZSBpZiAoZW5kcG9pbnQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQsIDEwKVxuICAgICAgLy8gb3RoZXJ3aXNlXG4gICAgICBlbHNlIGlmICh0aW1lRGVsdGEgPCAxNTAgJiYgTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgPiAyKSB7XG4gICAgICAgIGNvbnN0IHRpbWVUb0VuZHBvaW50ID0gTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgLyB0aW1lRGVsdGFcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlbmRwb2ludCwgdGltZVRvRW5kcG9pbnQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xlYXIoJ3BhZ2VYJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgb25DbGlja0xpbmsoZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIGVcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG5cbiAgICAgIGlmICghZSB8fCAhZS5kZWx0YVggfHwgTWF0aC5hYnMoZS5kZWx0YVkpID4gTWF0aC5hYnMoZS5kZWx0YVgpIHx8ICFzY3JvbGxhYmxlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnNldCgnbW91c2VTY3JvbGwnLCB0cnVlKVxuXG4gICAgICBjb25zdCB7ZGVsdGFYfSA9IGVcbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHJlc3VsdCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgZGVsdGFYLCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJXaWR0aCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMucmVsZWFzZVNjYigpXG4gICAgICB0aGlzLnNldFNjYlBvcyhzY3JvbGxiYXJSZXN1bHQpXG4gICAgICB0aGlzLnNldFdpZHRoKHNjcm9sbGJhcldpZHRoKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuXG4gICAgICB0aGlzLmNoZWNrQm9yZGVyVmlzaWJpbGl0eSgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIG9uU2Nyb2xsQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc2Nyb2xsYWJsZSA9IHRoaXMuZ2V0KCdzY3JvbGxhYmxlJylcbiAgICAgIGNvbnN0IHNjcm9sbENsaWNrRGlzYWJsZWQgPSB0aGlzLmdldCgnc2Nyb2xsQ2xpY2tEaXNhYmxlZCcpXG5cbiAgICAgIGlmIChzY3JvbGxDbGlja0Rpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgZmFsc2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIWUucHJldmVudERlZmF1bHQgfHwgIXNjcm9sbGFibGUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHNjYldpZHRoID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgIGNvbnN0IHNjYkZhY3RvciA9IHRoaXMuZ2V0KCdzY3JvbGxiYXJGYWN0b3InKVxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3QgcmlnaHRTY2JMaW1pdCA9IGxpbWl0UmlnaHQgKiBzY2JGYWN0b3JcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgcGFnZVggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGNvbnN0IGNlbnRlciA9IHBhZ2VYIC0gc2NiV2lkdGggLyAyXG4gICAgICBjb25zdCBsZWZ0RWRnZSA9IGNlbnRlciAtIHNjYldpZHRoIC8gMlxuICAgICAgY29uc3QgcmlnaHRFZGdlID0gY2VudGVyICsgc2NiV2lkdGggLyAyXG4gICAgICBcbiAgICAgIGxldCBlbmRwb2ludCA9IGNlbnRlciAvIHNjYkZhY3RvclxuICAgICAgaWYgKGxlZnRFZGdlIDwgbGltaXRMZWZ0KSBlbmRwb2ludCA9IGxpbWl0TGVmdFxuICAgICAgZWxzZSBpZiAocmlnaHRFZGdlID4gcmlnaHRTY2JMaW1pdCkgZW5kcG9pbnQgPSBsaW1pdFJpZ2h0XG5cbiAgICAgIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgZW5kcG9pbnQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBcbiAgICBvbkFuY2hvckNsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHNjcm9sbGFibGUgPSB0aGlzLmdldCgnc2Nyb2xsYWJsZScpXG4gICAgICBpZiAoIWUgfHwgIWUudGFyZ2V0IHx8ICFzY3JvbGxhYmxlKSByZXR1cm4gXG4gICAgICBcbiAgICAgIGNvbnN0IGFuY2hvcmlkID0gZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtYW5jaG9yaWRdJykuZ2V0QXR0cmlidXRlKCdkYXRhLWFuY2hvcmlkJylcbiAgICAgIGlmICghYW5jaG9yaWQpIHJldHVyblxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGdldEVsZW1lbnQoJ1tkYXRhLWFuY2hvcm9yaWdpbmlkPVwiJyArIGFuY2hvcmlkICsgJ1wiXScsIHJvb3ROb2RlKVxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KHRhcmdldE5vZGUub2Zmc2V0TGVmdCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVuZHBvaW50KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBvblNjcm9sbGJhclBvaW50ZXJEb3duKGUpIHtcbiAgICAgIGlmICghZSkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBzY3JvbGxiYXJGYWN0b3IgPSB0aGlzLmdldCgnc2Nyb2xsYmFyRmFjdG9yJylcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGJhclBvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxDbGlja0Rpc2FibGVkJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyRG93blBhZ2VYJywgY3VycmVudFBhZ2VYIC0gc2Nyb2xsZWQgKiBzY3JvbGxiYXJGYWN0b3IpXG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIG9uU2Nyb2xsYmFyUG9pbnRlck1vdmUoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgaWYgKCFlIHx8ICFzY2JQb2ludGVyRG93bikgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgY29uc3Qgc2Nyb2xsYmFyRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCBzY3JvbGxiYXJEb3duUGFnZVggPSB0aGlzLmdldCgnc2Nyb2xsYmFyRG93blBhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBkZWx0YSA9IChjdXJyZW50UGFnZVggLSBzY3JvbGxiYXJEb3duUGFnZVgpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heChkZWx0YSAvIHNjcm9sbGJhckZhY3RvciwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcbiAgICAgIGNvbnN0IHNjcm9sbGJhclJlc3VsdCA9IHJlc3VsdCAqIHNjcm9sbGJhckZhY3RvclxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0U2NiUG9zKHNjcm9sbGJhclJlc3VsdClcblxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGxiYXJQb2ludGVyVXAoZSkge1xuICAgICAgY29uc3Qgc2NiUG9pbnRlckRvd24gPSB0aGlzLmdldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nKVxuICAgICAgXG4gICAgICBpZiAoIWUgfHwgIXNjYlBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsYmFyUG9pbnRlckRvd24nLCBmYWxzZSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgYW5pbWF0ZShzdGFydCwgc3RvcD0wLCBzcGVlZD0xMCwgYW5pbWF0ZVdpZHRoPWZhbHNlKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IHN0b3AgLSBzdGFydFxuICAgICAgY29uc3QgdGltZSA9IE1hdGgubWF4KC4wNSwgTWF0aC5taW4oTWF0aC5hYnMoZGVsdGEpIC8gc3BlZWQsIDEpKVxuICAgICAgY29uc3Qgc2NiRmFjdG9yID0gdGhpcy5nZXQoJ3Njcm9sbGJhckZhY3RvcicpXG4gICAgICBjb25zdCByaWdodFNjYkxpbWl0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKSAqIHNjYkZhY3RvclxuXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSAwLFxuICAgICAgICAgIGVuZHBvaW50ID0gdGhpcy5nZXQoJ3Njcm9sbGVkJyksXG4gICAgICAgICAgc2NiRW5kcG9pbnQgPSBlbmRwb2ludCAqIHNjYkZhY3RvclxuXG4gICAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5nZXQoJ3BvaW50ZXJEb3duJykgfHwgdGhpcy5nZXQoJ21vdXNlU2Nyb2xsJykpIHJldHVyblxuXG4gICAgICAgIGN1cnJlbnRUaW1lICs9ICgxIC8gNjApXG4gICAgICAgIGVuZHBvaW50ID0gY3VycmVudFRpbWUgPCAxXG4gICAgICAgICAgPyBzdGFydCArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSlcbiAgICAgICAgICA6IHN0b3BcblxuICAgICAgICBzY2JFbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKiBzY2JGYWN0b3IgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpICogc2NiRmFjdG9yXG4gICAgICAgICAgOiBzdG9wICogc2NiRmFjdG9yXG5cblxuICAgICAgICBpZiAoIWFuaW1hdGVXaWR0aCkgdGhpcy5zZXRTY2JQb3Moc2NiRW5kcG9pbnQpXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxldCBzY2J3ID0gdGhpcy5nZXQoJ3Njcm9sbGJhcldpZHRoJylcbiAgICAgICAgICBpZiAoc3RhcnQgPCBzdG9wKSBzY2J3IC09IGRlbHRhICogc2NiRmFjdG9yICogKDEgLSB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKSlcbiAgICAgICAgICBlbHNlIHNjYncgKz0gZGVsdGEgKiBzY2JGYWN0b3IgKiAoMSAtIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpKVxuXG4gICAgICAgICAgdGhpcy5zZXRXaWR0aChzY2J3KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3MoLTEgKiBlbmRwb2ludClcbiAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgZW5kcG9pbnQpXG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIDwgMSkgcmFmKHRpY2spXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja0JvcmRlclZpc2liaWxpdHkoKVxuICAgICAgfVxuXG4gICAgICB0aWNrKClcbiAgICB9XG5cbiAgICBjaGVja0JvcmRlclZpc2liaWxpdHkoKSB7XG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG5cbiAgICAgIGlmIChzY3JvbGxlZCA+IGxpbWl0TGVmdCkge1xuICAgICAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLWxlZnRgLCByb290Tm9kZSlcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhsZWZ0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVmdEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1sZWZ0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MobGVmdEJvcmRlciwgdGhpcy5jb25maWcuYm9yZGVyVnNibENsc25tKVxuICAgICAgfVxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdFJpZ2h0KSB7XG4gICAgICAgIGNvbnN0IHJpZ2h0Qm9yZGVyID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1ib3JkZXItLXJpZ2h0YCwgcm9vdE5vZGUpXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MocmlnaHRCb3JkZXIsIHRoaXMuY29uZmlnLmJvcmRlclZzYmxDbHNubSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCByaWdodEJvcmRlciA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tYm9yZGVyLS1yaWdodGAsIHJvb3ROb2RlKVxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHJpZ2h0Qm9yZGVyLCB0aGlzLmNvbmZpZy5ib3JkZXJWc2JsQ2xzbm0pXG4gICAgICB9XG5cbiAgICB9XG5cblxuICAgIC8vIHB1YmxpYyBBUElcblxuICAgIHNjcm9sbFRvKHBvaW50LCB0aW1lPTEwMDApIHtcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGxldCBlbmRwb2ludCA9ICFpc05hTihwb2ludCkgPyBwYXJzZUludChwb2ludCkgOiAwXG4gICAgICBlbmRwb2ludCA9IE1hdGgubWluKE1hdGgubWF4KGVuZHBvaW50LCBsaW1pdExlZnQpLCBsaW1pdFJpZ2h0KVxuXG4gICAgICBpZiAocG9pbnQgPT0gJ2VuZCcpIGVuZHBvaW50ID0gbGltaXRSaWdodFxuICAgICAgZWxzZSBpZiAocG9pbnQgPT0gJ3N0YXJ0JykgZW5kcG9pbnQgPSBsaW1pdExlZnRcbiAgICAgIGVsc2UgaWYgKHBvaW50ID09ICdjZW50ZXInKSBlbmRwb2ludCA9IGxpbWl0UmlnaHQgLyAyXG5cbiAgICAgIHRoaXMuYW5pbWF0ZSh0aGlzLmdldCgnc2Nyb2xsZWQnKSwgZW5kcG9pbnQsIHRpbWUsIHRydWUpXG4gICAgfVxuICB9XG5cblxuXG4gIC8vIGluaXRcblxuICBjb25zdCBlbHMgPSBnZXRFbGVtZW50cygnLnNjcm9sbGVyJylcbiAgZWxzLmZvckVhY2goZWwgPT4ge1xuICAgIGNvbnN0IHNjcm9sbGVyID0gbmV3IFNjcm9sbGVyKHsgZWwgfSlcbiAgfSlcblxufSgpKVxuIl19
