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
        mouseScroll: false,

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
        stripNode.addEventListener('mousewheel', this.onScroll.bind(this));

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
        this.set('mouseScroll', false);
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
      key: 'onScroll',
      value: function onScroll(e) {
        if (!e || !e.deltaX) return;
        e.preventDefault();

        this.set('mouseScroll', true);

        var deltaX = e.deltaX;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');
        var result = Math.min(Math.max(this.get('scrolled') + deltaX, limitLeft), limitRight);

        this.setPos(-1 * result);
        this.set('scrolled', result);

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
          if (_this2.get('pointerDown') || _this2.get('mouseScroll')) return;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM3QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxPQUFPLEtBQUssQ0FBTCxDQUFQLEdBQWlCLElBQXhCO0FBQ0QsR0FIRDs7QUFLQSxNQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsUUFBRCxFQUE0QjtBQUFBLFFBQWpCLEdBQWlCLHlEQUFiLFFBQWE7O0FBQzlDLFFBQU0sT0FBTyxJQUFJLGdCQUFKLENBQXFCLFFBQXJCLENBQWI7QUFDQSxXQUFPLFFBQVEsSUFBZjtBQUNELEdBSEQ7Ozs7QUFUVSxNQWtCSixRQWxCSTtBQW1CUixzQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUEsMEJBTWQsTUFOYyxDQUVoQixLQUZnQjtBQUFBLFVBRWhCLEtBRmdCLGlDQUVWLFFBRlU7QUFBQSw4QkFNZCxNQU5jLENBR2hCLFNBSGdCO0FBQUEsVUFHaEIsU0FIZ0IscUNBR04sS0FITTtBQUFBLGdDQU1kLE1BTmMsQ0FJaEIsV0FKZ0I7QUFBQSxVQUloQixXQUpnQix1Q0FJSixLQUpJO0FBQUEsVUFLaEIsRUFMZ0IsR0FNZCxNQU5jLENBS2hCLEVBTGdCOzs7QUFRbEIsV0FBSyxNQUFMLEdBQWM7QUFDWixlQUFPLEtBREs7QUFFWixtQkFBVyxTQUZDO0FBR1oscUJBQWEsV0FIRDs7QUFLWixnQkFBUSxhQUxJO0FBTVosdUJBQWUsYUFOSDs7QUFRWixnQkFBUTtBQUFBLGlCQUFPLFFBQVEsQ0FBUixHQUFZLENBQVosR0FBZ0IsQ0FBQyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxFQUFELEdBQU0sR0FBbEIs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LFFBQXJCO0FBQ0QsU0FYRDs7QUFhQTtBQUNEO0FBOVNPOztBQUFBO0FBQUE7Ozs7QUFxVFYsTUFBTSxLQUFLLFdBQVcsV0FBWCxDQUFYO0FBQ0EsTUFBTSxXQUFXLElBQUksUUFBSixDQUFhLEVBQUUsTUFBRixFQUFiLENBQWpCO0FBRUQsQ0F4VEEsR0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgLy8gaGVscGVyc1xuXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3RvciwgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlIHx8IG51bGxcbiAgfVxuXG5cblxuICAvLyBzY3JvbGxlclxuXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxpZ249J2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9ycz1mYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI9ZmFsc2UsXG4gICAgICAgIGVsXG4gICAgICB9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24sXG4gICAgICAgIG5vQW5jaG9yczogbm9BbmNob3JzLFxuICAgICAgICBub1Njcm9sbGJhcjogbm9TY3JvbGxiYXIsXG5cbiAgICAgICAgcHJlZml4OiAnYWJfc2Nyb2xsZXInLFxuICAgICAgICBkcmFnZ2luZ0Nsc25tOiAnaXMtZHJhZ2dpbmcnLFxuXG4gICAgICAgIGVhc2luZzogcG9zID0+IHBvcyA9PT0gMSA/IDEgOiAtTWF0aC5wb3coMiwgLTEwICogcG9zKSArIDEsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBwb2ludGVyRG93bjogZmFsc2UsXG4gICAgICAgIG1vdXNlU2Nyb2xsOiBmYWxzZSxcblxuICAgICAgICBwYWdlWDogW10sXG4gICAgICAgIHNjcm9sbGVkRGlmZjogMCxcbiAgICAgICAgZG93bkV2ZW50VFM6IDAsXG4gICAgICAgIG1vdmVFdmVudFRTOiAwLFxuXG4gICAgICAgIGxpbWl0TGVmdDogMCxcbiAgICAgICAgbGltaXRSaWdodDogMCxcblxuICAgICAgICBsZW46IGVsLmhhc0NoaWxkTm9kZXMoKSAmJiBnZXRFbGVtZW50cygnOnNjb3BlID4gKicsIGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5pdChlbClcblxuICAgICAgd2luZG93LnJhZiA9ICgoKSA9PiB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge3NldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCl9XG4gICAgICB9KSgpXG4gICAgfVxuXG5cbiAgICBnZXQocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZih0aGlzLnN0YXRlW3Byb3BdKSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICAgIDogbnVsbFxuICAgIH1cblxuICAgIHNldChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgcHVzaChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSAmJiB0aGlzLnN0YXRlW3Byb3BdLnB1c2godmFsdWUpXG4gICAgfVxuXG4gICAgY2xlYXIocHJvcCkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzLnN0YXRlW3Byb3BdXG4gICAgICBpZiAoZmllbGQgJiYgZmllbGQubGVuZ3RoKSBmaWVsZC5sZW5ndGggPSAwXG4gICAgfVxuXG4gICAgZ2V0TGFzdE1lYW5pbmdmdWxsKHByb3ApIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5zdGF0ZVtwcm9wXVxuICAgICAgY29uc3QgdG9JZ25vcmUgPSBmaWVsZCAmJiBmaWVsZC5sZW5ndGggJiYgZmllbGQubGVuZ3RoID4gMyA/IDMgOiAxXG4gICAgICByZXR1cm4gZmllbGRbZmllbGQubGVuZ3RoIC0gdG9JZ25vcmVdXG4gICAgfVxuXG5cbiAgICBhZGRDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGlmICghbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJytjbCsnKFxcXFxzfCQpJykudGVzdChlbC5jbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhlbCwgY2wpIHtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXHMrfF4pJytjbCsnKFxcXFxzK3wkKScsICdnJyksICcgJylcbiAgICAgICAgLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgIH1cblxuICAgIHNldFBvcyhwb3MpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBlbCA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcblxuICAgICAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgcG9zICsgJ3B4LCAwKSB0cmFuc2xhdGVaKDApJ1xuICAgICAgZWwuc3R5bGUuTW96VHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLm1zVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLk9UcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHBvcyArICdweCknXG4gICAgfVxuXG5cbiAgICBpbml0KGVsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVdyYXBwZXIoKVxuICAgICAgdGhpcy53cmFwSXRlbXMoKVxuICAgICAgdGhpcy5zZXRTaXplKClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHN0cmlwTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIGNvbnN0IGxpbmtOb2RlcyA9IGdldEVsZW1lbnRzKCdhJywgc3RyaXBOb2RlKVxuXG4gICAgICBzdHJpcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSlcbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXdoZWVsJywgdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMpKVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmdcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3QgcHJldkh0bWwgPSByb290Tm9kZS5pbm5lckhUTUxcbiAgICAgIGNvbnN0IHdyYXBwZXJIdG1sID0gYDxkaXYgY2xhc3M9XCIke3ByZWZpeH0td3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXN0cmlwXCI+JHtwcmV2SHRtbH08L2Rpdj5cbiAgICAgIDwvZGl2PmBcblxuICAgICAgcm9vdE5vZGUuaW5uZXJIVE1MID0gd3JhcHBlckh0bWxcbiAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHByZWZpeClcbiAgICB9XG5cbiAgICB3cmFwSXRlbXMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIGdldEVsZW1lbnRzKCc6c2NvcGUgPiAqJywgd3JhcHBlck5vZGUpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBpdGVtV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgaXRlbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbVdyYXBwZXIsIGl0ZW1Ob2RlKVxuICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcblxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcblxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aClcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCB0cnVlKVxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgZmFsc2UpXG4gICAgICB0aGlzLnNldCgnZG93bkV2ZW50VFMnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpKVxuXG4gICAgICBjb25zdCBkaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkJykgKyAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkRGlmZicsIGRpZmYpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMuYWRkQ2xhc3Mod3JhcHBlck5vZGUsIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG4gICAgfVxuXG4gICAgb25Qb2ludGVyTW92ZShlKSB7XG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG4gICAgICBpZiAoIWUgfHwgIXBvaW50ZXJEb3duKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBzY3JvbGxlZERpZmYgPSB0aGlzLmdldCgnc2Nyb2xsZWREaWZmJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYXG4gICAgICBsZXQgcmVzdWx0ID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQpXG4gICAgICBlbHNlIGlmIChyZXN1bHQgPiBsaW1pdFJpZ2h0KSByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdmVFdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcbiAgICAgIHRoaXMucHVzaCgncGFnZVgnLCBjdXJyZW50UGFnZVgpXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyh3cmFwcGVyTm9kZSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBsYXN0UGFnZVggPSB0aGlzLmdldExhc3RNZWFuaW5nZnVsbCgncGFnZVgnKVxuICAgICAgY29uc3QgY3VycmVudEV2ZW50WCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgY29uc3QgZGlzdGFuY2VEZWx0YSA9IGN1cnJlbnRFdmVudFggLSBsYXN0UGFnZVhcbiAgICAgIGNvbnN0IHRpbWVEZWx0YSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSB0aGlzLmdldCgnbW92ZUV2ZW50VFMnKVxuICAgICAgY29uc3QgZWRucG9pbnQgPSBzY3JvbGxlZCAtIChkaXN0YW5jZURlbHRhICogNSlcblxuICAgICAgaWYgKHNjcm9sbGVkIDwgbGltaXRMZWZ0IHx8IGVkbnBvaW50IDwgbGltaXRMZWZ0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0TGVmdClcbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCB8fCBlZG5wb2ludCA+IGxpbWl0UmlnaHQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRSaWdodClcbiAgICAgIGVsc2UgaWYgKHRpbWVEZWx0YSA8IDE1MCAmJiBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSA+IDIpIHtcbiAgICAgICAgY29uc3QgdGltZVRvRW5kcG9pbnQgPSBNYXRoLmFicyhkaXN0YW5jZURlbHRhKSAvIHRpbWVEZWx0YVxuICAgICAgICB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGVkbnBvaW50LCB0aW1lVG9FbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigncGFnZVgnKVxuICAgIH1cblxuICAgIG9uQ2xpY2tMaW5rKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgb25TY3JvbGwoZSkge1xuICAgICAgaWYgKCFlIHx8ICFlLmRlbHRhWCkgcmV0dXJuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgdGhpcy5zZXQoJ21vdXNlU2Nyb2xsJywgdHJ1ZSlcblxuICAgICAgY29uc3Qge2RlbHRhWH0gPSBlXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCByZXN1bHQgPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmdldCgnc2Nyb2xsZWQnKSArIGRlbHRhWCwgbGltaXRMZWZ0KSwgbGltaXRSaWdodClcblxuICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCByZXN1bHQpXG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuXG4gICAgYW5pbWF0ZShzdGFydCwgc3RvcD0wLCBzcGVlZD0xMCkge1xuICAgICAgY29uc3QgZGVsdGEgPSBzdG9wIC0gc3RhcnRcbiAgICAgIGNvbnN0IHRpbWUgPSBNYXRoLm1heCguMDUsIE1hdGgubWluKE1hdGguYWJzKGRlbHRhKSAvIHNwZWVkLCAxKSlcblxuICAgICAgbGV0IGN1cnJlbnRUaW1lID0gMCxcbiAgICAgICAgICBlbmRwb2ludCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmdldCgncG9pbnRlckRvd24nKSB8fCB0aGlzLmdldCgnbW91c2VTY3JvbGwnKSkgcmV0dXJuXG5cbiAgICAgICAgY3VycmVudFRpbWUgKz0gKDEgLyA2MClcbiAgICAgICAgZW5kcG9pbnQgPSBjdXJyZW50VGltZSA8IDFcbiAgICAgICAgICA/IHN0YXJ0ICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKVxuICAgICAgICAgIDogc3RvcFxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA8IDEpIHJhZih0aWNrKVxuICAgICAgICB0aGlzLnNldFBvcygtMSAqIGVuZHBvaW50KVxuICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCBlbmRwb2ludClcbiAgICAgIH1cblxuICAgICAgdGljaygpXG4gICAgfVxuICB9XG5cblxuXG4gIC8vIGluaXRcblxuICBjb25zdCBlbCA9IGdldEVsZW1lbnQoJy5zY3JvbGxlcicpXG4gIGNvbnN0IHNjcm9sbGVyID0gbmV3IFNjcm9sbGVyKHsgZWwgfSlcblxufSgpKVxuIl19
