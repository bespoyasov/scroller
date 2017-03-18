(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

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


      this.config = {
        align: align,
        noAnchors: noAnchors,
        noScrollbar: noScrollbar,

        prefix: 'ab_scroller',
        draggingClsnm: 'is-dragging',

        easing: function easing(pos) {
          return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
        }
      };

      this.state = {
        scrolled: 0,
        pointerDown: false,

        pageX: [],
        scrolledDiff: 0,
        downEventTS: 0,
        moveEventTS: 0,

        limitLeft: 0,
        limitRight: 0,

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
        return field[field.length - toIgnore];
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
      key: 'setPos',
      value: function setPos(pos) {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var el = getElement('.' + prefix + '-strip', rootNode);

        el.style.webkitTransform = 'translate(' + pos + 'px, 0) translateZ(0)';
        el.style.MozTransform = el.style.msTransform = el.style.OTransform = el.style.transform = 'translateX(' + pos + 'px)';
      }
    }, {
      key: 'init',
      value: function init(el) {
        var _this = this;

        this.createWrapper();
        this.wrapItems();
        this.setSize();

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var stripNode = getElement('.' + prefix + '-strip', rootNode);
        var linkNodes = getElements('a', stripNode);

        stripNode.addEventListener('mousedown', this.onPointerDown.bind(this));
        window.addEventListener('mousemove', this.onPointerMove.bind(this));
        window.addEventListener('mouseup', this.onPointerUp.bind(this));

        // prevent clickng
        Array.from(linkNodes).forEach(function (node) {
          node.addEventListener('click', _this.onClickLink.bind(_this), false);
        });
      }
    }, {
      key: 'createWrapper',
      value: function createWrapper() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;

        var prevHtml = rootNode.innerHTML;
        var wrapperHtml = '<div class="' + prefix + '-wrapper">\n        <div class="' + prefix + '-strip">' + prevHtml + '</div>\n      </div>';

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
      key: 'setSize',
      value: function setSize() {
        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        var itemNodes = getElements('.' + prefix + '-item', rootNode);
        var maxHeight = 0,
            sumWidth = 0;

        itemNodes.forEach(function (itemNode) {
          var currentHeight = itemNode.offsetHeight;
          if (currentHeight > maxHeight) maxHeight = currentHeight;

          sumWidth += itemNode.offsetWidth;
        });

        rootNode.style.height = maxHeight + 'px';
        wrapperNode.style.height = maxHeight + 'px';
        wrapperNode.style.width = sumWidth + 1 + 'px';

        this.set('limitRight', sumWidth + 1 - rootNode.offsetWidth);
      }
    }, {
      key: 'onPointerDown',
      value: function onPointerDown(e) {
        if (!e) return;
        e.preventDefault();

        this.set('pointerDown', true);
        this.set('downEventTS', new Date().getTime());

        var diff = this.get('scrolled') + (e.originalEvent && e.originalEvent.pageX || e.pageX);
        this.set('scrolledDiff', diff);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.addClass(wrapperNode, this.config.draggingClsnm);
      }
    }, {
      key: 'onPointerMove',
      value: function onPointerMove(e) {
        var pointerDown = this.get('pointerDown');
        if (!e || !pointerDown) return;
        e.preventDefault();

        var scrolledDiff = this.get('scrolledDiff');
        var scrolled = this.get('scrolled');

        // drag to left is positive number
        var currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var result = scrolledDiff - currentPageX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');

        if (result < limitLeft) result = Math.round(0.2 * result);else if (result > limitRight) result = Math.round(0.2 * result + 0.8 * limitRight);

        this.setPos(-1 * result);
        this.set('scrolled', result);
        this.set('moveEventTS', new Date().getTime());
        this.push('pageX', currentPageX);
      }
    }, {
      key: 'onPointerUp',
      value: function onPointerUp(e) {
        if (!e) return;
        e.preventDefault();

        this.set('pointerDown', false);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.removeClass(wrapperNode, this.config.draggingClsnm);

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var scrolled = this.get('scrolled');

        var lastPageX = this.getLastMeaningfull('pageX');
        var currentEventX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var distanceDelta = currentEventX - lastPageX;
        var timeDelta = new Date().getTime() - this.get('moveEventTS');
        var ednpoint = scrolled - distanceDelta * 5;

        if (scrolled < limitLeft || ednpoint < limitLeft) this.animate(scrolled, limitLeft);else if (scrolled > limitRight || ednpoint > limitRight) this.animate(scrolled, limitRight);else if (timeDelta < 150 && Math.abs(distanceDelta) > 2) {
          var timeToEndpoint = Math.abs(distanceDelta) / timeDelta;
          this.animate(scrolled, ednpoint, timeToEndpoint);
        }

        this.clear('pageX');
      }
    }, {
      key: 'onClickLink',
      value: function onClickLink(e) {
        e.preventDefault();
        return false;
      }
    }, {
      key: 'animate',
      value: function animate(start) {
        var _this2 = this;

        var stop = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var speed = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];

        var delta = stop - start;
        var time = Math.max(.05, Math.min(Math.abs(delta) / speed, 1));

        var currentTime = 0,
            endpoint = this.get('scrolled');

        var tick = function tick() {
          if (_this2.get('pointerDown')) return;

          currentTime += 1 / 60;
          endpoint = currentTime < 1 ? start + delta * _this2.config.easing(currentTime / time) : stop;

          if (currentTime < 1) raf(tick);
          _this2.setPos(-1 * endpoint);
          _this2.set('scrolled', endpoint);
        };

        tick();
      }
    }]);

    return Scroller;
  }();

  // init

  var el = getElement('.scroller');
  var scroller = new Scroller({ el: el });
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM3QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxPQUFPLEtBQUssQ0FBTCxDQUFQLEdBQWlCLElBQXhCO0FBQ0QsR0FIRDs7QUFLQSxNQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsUUFBRCxFQUE0QjtBQUFBLFFBQWpCLEdBQWlCLHlEQUFiLFFBQWE7O0FBQzlDLFFBQU0sT0FBTyxJQUFJLGdCQUFKLENBQXFCLFFBQXJCLENBQWI7QUFDQSxXQUFPLFFBQVEsSUFBZjtBQUNELEdBSEQ7Ozs7QUFUVSxNQWtCSixRQWxCSTtBQW1CUixzQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUEsMEJBTWQsTUFOYyxDQUVoQixLQUZnQjtBQUFBLFVBRWhCLEtBRmdCLGlDQUVWLFFBRlU7QUFBQSw4QkFNZCxNQU5jLENBR2hCLFNBSGdCO0FBQUEsVUFHaEIsU0FIZ0IscUNBR04sS0FITTtBQUFBLGdDQU1kLE1BTmMsQ0FJaEIsV0FKZ0I7QUFBQSxVQUloQixXQUpnQix1Q0FJSixLQUpJO0FBQUEsVUFLaEIsRUFMZ0IsR0FNZCxNQU5jLENBS2hCLEVBTGdCOzs7QUFRbEIsV0FBSyxNQUFMLEdBQWM7QUFDWixlQUFPLEtBREs7QUFFWixtQkFBVyxTQUZDO0FBR1oscUJBQWEsV0FIRDs7QUFLWixnQkFBUSxhQUxJO0FBTVosdUJBQWUsYUFOSDs7QUFRWixnQkFBUTtBQUFBLGlCQUFPLFFBQVEsQ0FBUixHQUFZLENBQVosR0FBZ0IsQ0FBQyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxFQUFELEdBQU0sR0FBbEIs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U0FBUCxJQUFPLEdBQU07QUFDakIsY0FBSSxPQUFLLEdBQUwsQ0FBUyxhQUFULENBQUosRUFBNkI7O0FBRTdCLHlCQUFnQixJQUFJLEVBQXBCO0FBQ0EscUJBQVcsY0FBYyxDQUFkLEdBQ1AsUUFBUSxRQUFRLE9BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsY0FBYyxJQUFqQyxDQURULEdBRVAsSUFGSjs7QUFJQSxjQUFJLGNBQWMsQ0FBbEIsRUFBcUIsSUFBSSxJQUFKO0FBQ3JCLGlCQUFLLE1BQUwsQ0FBWSxDQUFDLENBQUQsR0FBSyxRQUFqQjtBQUNBLGlCQUFLLEdBQUwsQ0FBUyxVQUFULEVBQXFCLFFBQXJCO0FBQ0QsU0FYRDs7QUFhQTtBQUNEO0FBMVJPOztBQUFBO0FBQUE7Ozs7QUFpU1YsTUFBTSxLQUFLLFdBQVcsV0FBWCxDQUFYO0FBQ0EsTUFBTSxXQUFXLElBQUksUUFBSixDQUFhLEVBQUUsTUFBRixFQUFiLENBQWpCO0FBRUQsQ0FwU0EsR0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgLy8gaGVscGVyc1xuXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3RvciwgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlIHx8IG51bGxcbiAgfVxuXG5cblxuICAvLyBzY3JvbGxlclxuXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249J2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI9ZmFsc2UsXG4gICAgICAgIGVsXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgIG5vQW5jaG9yczogbm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcjogbm9TY3JvbGxiYXIsXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuXG4gICAgICAgIGVhc2luZzogcG9zID0+IHBvcyA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogcG9zKSArIDEsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBwb2ludGVyRG93bjogZmFsc2UsXG5cbiAgICAgICAgcGFnZVg6IFtdLFxuICAgICAgICBzY3JvbGxlZERpZmY6IDAsXG4gICAgICAgIGRvd25FdmVudFRTOiAwLFxuICAgICAgICBtb3ZlRXZlbnRUUzogMCxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG5cbiAgICAgICAgbGVuOiBlbC5oYXNDaGlsZE5vZGVzKCkgJiYgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCBlbCkubGVuZ3RoIHx8IDAsXG4gICAgICAgIGVsOiBlbCB8fCBudWxsLFxuICAgICAgfVxuXG4gICAgICB0aGlzLmluaXQoZWwpXG5cbiAgICAgIHdpbmRvdy5yYWYgPSAoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtzZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApfVxuICAgICAgfSkoKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0eXBlb2YodGhpcy5zdGF0ZVtwcm9wXSkgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgICA6IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIHB1c2gocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGNsZWFyKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgaWYgKGZpZWxkICYmIGZpZWxkLmxlbmd0aCkgZmllbGQubGVuZ3RoID0gMFxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuc3RhdGVbcHJvcF1cbiAgICAgIGNvbnN0IHRvSWdub3JlID0gZmllbGQgJiYgZmllbGQubGVuZ3RoICYmIGZpZWxkLmxlbmd0aCA+IDMgPyAzIDogMVxuICAgICAgcmV0dXJuIGZpZWxkW2ZpZWxkLmxlbmd0aCAtIHRvSWdub3JlXVxuICAgIH1cblxuXG4gICAgYWRkQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBpZiAoIW5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2wrJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKSkgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsXG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFxzK3xeKScrY2wrJyhcXFxccyt8JCknLCAnZycpLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICB9XG5cbiAgICBzZXRQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHBvcyArICdweCwgMCkgdHJhbnNsYXRlWigwKSdcbiAgICAgIGVsLnN0eWxlLk1velRyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5tc1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5PVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBsaW5rTm9kZXMgPSBnZXRFbGVtZW50cygnYScsIHN0cmlwTm9kZSlcblxuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG5cbiAgICAgIC8vIHByZXZlbnQgY2xpY2tuZ1xuICAgICAgQXJyYXkuZnJvbShsaW5rTm9kZXMpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2tMaW5rLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgfSlcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc3RyaXBcIj4ke3ByZXZIdG1sfTwvZGl2PlxuICAgICAgPC9kaXY+YFxuXG4gICAgICByb290Tm9kZS5pbm5lckhUTUwgPSB3cmFwcGVySHRtbFxuICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgcHJlZml4KVxuICAgIH1cblxuICAgIHdyYXBJdGVtcygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcblxuICAgICAgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCB3cmFwcGVyTm9kZSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgaXRlbVdyYXBwZXIuaW5uZXJIVE1MID0gaXRlbU5vZGUub3V0ZXJIVE1MXG4gICAgICAgIGl0ZW1XcmFwcGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICBpdGVtTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpdGVtV3JhcHBlciwgaXRlbU5vZGUpXG4gICAgICAgIGl0ZW1Ob2RlLnJlbW92ZSgpXG4gICAgICB9KVxuICAgIH1cblxuICAgIHNldFNpemUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgbWF4SGVpZ2h0ID0gMCwgc3VtV2lkdGggPSAwXG5cbiAgICAgIGl0ZW1Ob2Rlcy5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGl0ZW1Ob2RlLm9mZnNldEhlaWdodFxuICAgICAgICBpZiAoY3VycmVudEhlaWdodCA+IG1heEhlaWdodCkgbWF4SGVpZ2h0ID0gY3VycmVudEhlaWdodFxuXG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICByb290Tm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS53aWR0aCA9IChzdW1XaWR0aCArIDEpICsgJ3B4J1xuXG4gICAgICB0aGlzLnNldCgnbGltaXRSaWdodCcsIHN1bVdpZHRoICsgMSAtIHJvb3ROb2RlLm9mZnNldFdpZHRoKVxuICAgIH1cblxuXG4gICAgb25Qb2ludGVyRG93bihlKSB7XG4gICAgICBpZiAoIWUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnZG93bkV2ZW50VFMnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuXG4gICAgICBjb25zdCBkaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkJykgKyAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkRGlmZicsIGRpZmYpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3Mod3JhcHBlck5vZGUsIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG4gICAgfVxuXG4gICAgb25Qb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQpXG4gICAgICBlbHNlIGlmIChyZXN1bHQgPiBsaW1pdFJpZ2h0KSByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdmVFdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcbiAgICAgIHRoaXMucHVzaCgncGFnZVgnLCBjdXJyZW50UGFnZVgpXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyh3cmFwcGVyTm9kZSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBsYXN0UGFnZVggPSB0aGlzLmdldExhc3RNZWFuaW5nZnVsbCgncGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudEV2ZW50WCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgY29uc3QgZGlzdGFuY2VEZWx0YSA9IGN1cnJlbnRFdmVudFggLSBsYXN0UGFnZVhcbiAgICAgIGNvbnN0IHRpbWVEZWx0YSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSB0aGlzLmdldCgnbW92ZUV2ZW50VFMnKVxuICAgICAgY29uc3QgZWRucG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogNSlcblxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRMZWZ0IHx8IGVkbnBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdClcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCB8fCBlZG5wb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodClcbiAgICAgIGVsc2UgaWYgKHRpbWVEZWx0YSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSAvIHRpbWVEZWx0YVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVkbnBvaW50LCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgIH1cblxuICAgIG9uQ2xpY2tMaW5rKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBhbmltYXRlKHN0YXJ0LCBzdG9wPTAsIHNwZWVkPTEwKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IHN0b3AgLSBzdGFydFxuICAgICAgY29uc3QgdGltZSA9IE1hdGgubWF4KC4wNSwgTWF0aC5taW4oTWF0aC5hYnMoZGVsdGEpIC8gc3BlZWQsIDEpKVxuXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSAwLFxuICAgICAgICAgIGVuZHBvaW50ID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KCdwb2ludGVyRG93bicpKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICBlbmRwb2ludCA9IGN1cnJlbnRUaW1lIDwgMVxuICAgICAgICAgID8gc3RhcnQgKyBkZWx0YSAqIHRoaXMuY29uZmlnLmVhc2luZyhjdXJyZW50VGltZSAvIHRpbWUpXG4gICAgICAgICAgOiBzdG9wXG5cbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lIDwgMSkgcmFmKHRpY2spXG4gICAgICAgIHRoaXMuc2V0UG9zKC0xICogZW5kcG9pbnQpXG4gICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIGVuZHBvaW50KVxuICAgICAgfVxuXG4gICAgICB0aWNrKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdFxuXG4gIGNvbnN0IGVsID0gZ2V0RWxlbWVudCgnLnNjcm9sbGVyJylcbiAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuXG59KCkpXG4iXX0=
