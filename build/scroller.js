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

      var align = config.align;
      var noAnchors = config.noAnchors;
      var noScrollbar = config.noScrollbar;
      var el = config.el;


      this.config = {
        align: align || 'center',
        noAnchors: noAnchors || false,
        noScrollbar: noScrollbar || false,

        prefix: 'ab_scroller',
        draggingClsnm: 'is-dragging',

        easing: function easing(pos) {
          return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
        },
        viscosityFactor: 0.5
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
        this.state[prop].push(value);
      }
    }, {
      key: 'getLastMeaningfull',
      value: function getLastMeaningfull(prop) {
        var toIgnore = this.state[prop] && this.state[prop].length && this.state[prop].length > 3 ? 3 : 1;

        return this.state[prop][this.state[prop].length - toIgnore];
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

        var ts = new Date().getTime();
        this.set('pointerDown', true);
        this.set('downEventTS', ts);

        var newScrolledDiff = this.get('scrolled') + (e.originalEvent && e.originalEvent.pageX || e.pageX);
        this.set('scrolledDiff', newScrolledDiff);

        var prefix = this.config.prefix;
        var rootNode = this.state.el;
        var wrapperNode = getElement('.' + prefix + '-strip', rootNode);
        this.addClass(wrapperNode, this.config.draggingClsnm);
      }
    }, {
      key: 'onPointerMove',
      value: function onPointerMove(e) {
        e.preventDefault();
        var pointerDown = this.get('pointerDown');
        if (!pointerDown) return;

        var scrolledDiff = this.get('scrolledDiff');
        var scrolled = this.get('scrolled');

        var currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var delta = scrolledDiff - currentPageX; // drag to left is positive number
        var result = delta;

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
            result = this.get('scrolled');

        var tick = function tick() {
          var pointerDown = _this2.get('pointerDown');
          if (pointerDown) return;

          currentTime += 1 / 60;
          result = start + delta * _this2.config.easing(currentTime / time);

          if (currentTime >= 1) {
            _this2.setPos(-1 * stop);
            _this2.set('scrolled', stop);
          } else {
            raf(tick);
            _this2.setPos(-1 * result);
            _this2.set('scrolled', result);
          }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM3QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxPQUFPLEtBQUssQ0FBTCxDQUFQLEdBQWlCLElBQXhCO0FBQ0QsR0FIRDs7QUFLQSxNQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsUUFBRCxFQUE0QjtBQUFBLFFBQWpCLEdBQWlCLHlEQUFiLFFBQWE7O0FBQzlDLFFBQU0sT0FBTyxJQUFJLGdCQUFKLENBQXFCLFFBQXJCLENBQWI7QUFDQSxXQUFPLFFBQVEsSUFBZjtBQUNELEdBSEQ7Ozs7QUFUVSxNQWtCSixRQWxCSTtBQW1CUixzQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUEsVUFDWCxLQURXLEdBQzBCLE1BRDFCLENBQ1gsS0FEVztBQUFBLFVBQ0osU0FESSxHQUMwQixNQUQxQixDQUNKLFNBREk7QUFBQSxVQUNPLFdBRFAsR0FDMEIsTUFEMUIsQ0FDTyxXQURQO0FBQUEsVUFDb0IsRUFEcEIsR0FDMEIsTUFEMUIsQ0FDb0IsRUFEcEI7OztBQUdsQixXQUFLLE1BQUwsR0FBYztBQUNaLGVBQU8sU0FBUyxRQURKO0FBRVosbUJBQVcsYUFBYSxLQUZaO0FBR1oscUJBQWEsZUFBZSxLQUhoQjs7QUFLWixnQkFBUSxhQUxJO0FBTVosdUJBQWUsYUFOSDs7QUFRWixnQkFBUTtBQUFBLGlCQUFPLFFBQVEsQ0FBUixHQUFZLENBQVosR0FBZ0IsQ0FBQyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxFQUFELEdBQU0sR0FBbEIsQ0FBRCxHQUEwQixDQUFqRDtBQUFBLFNBUkk7QUFTWix5QkFBaUI7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TUFBWixDQUFtQixjQUFjLElBQWpDLENBQXpCOztBQUVBLGNBQUksZUFBZSxDQUFuQixFQUFzQjtBQUNwQixtQkFBSyxNQUFMLENBQVksQ0FBQyxDQUFELEdBQUssSUFBakI7QUFDQSxtQkFBSyxHQUFMLENBQVMsVUFBVCxFQUFxQixJQUFyQjtBQUNELFdBSEQsTUFJSztBQUNILGdCQUFJLElBQUo7QUFDQSxtQkFBSyxNQUFMLENBQVksQ0FBQyxDQUFELEdBQUssTUFBakI7QUFDQSxtQkFBSyxHQUFMLENBQVMsVUFBVCxFQUFxQixNQUFyQjtBQUNEO0FBQ0YsU0FoQkQ7O0FBa0JBO0FBQ0Q7QUFsUk87O0FBQUE7QUFBQTs7OztBQXlSVixNQUFNLEtBQUssV0FBVyxXQUFYLENBQVg7QUFDQSxNQUFNLFdBQVcsSUFBSSxRQUFKLENBQWEsRUFBRSxNQUFGLEVBQWIsQ0FBakI7QUFFRCxDQTVSQSxHQUFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcblxuICAvLyBoZWxwZXJzXG5cbiAgY29uc3QgZ2V0RWxlbWVudCA9IChzZWxlY3RvciwgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlID8gbm9kZVswXSA6IG51bGxcbiAgfVxuXG4gIGNvbnN0IGdldEVsZW1lbnRzID0gKHNlbGVjdG9yLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGUgfHwgbnVsbFxuICB9XG5cblxuXG4gIC8vIHNjcm9sbGVyXG5cbiAgY2xhc3MgU2Nyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgY29uc3Qge2FsaWduLCBub0FuY2hvcnMsIG5vU2Nyb2xsYmFyLCBlbH0gPSBjb25maWdcblxuICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgIGFsaWduOiBhbGlnbiB8fCAnY2VudGVyJyxcbiAgICAgICAgbm9BbmNob3JzOiBub0FuY2hvcnMgfHwgZmFsc2UsXG4gICAgICAgIG5vU2Nyb2xsYmFyOiBub1Njcm9sbGJhciB8fCBmYWxzZSxcblxuICAgICAgICBwcmVmaXg6ICdhYl9zY3JvbGxlcicsXG4gICAgICAgIGRyYWdnaW5nQ2xzbm06ICdpcy1kcmFnZ2luZycsXG5cbiAgICAgICAgZWFzaW5nOiBwb3MgPT4gcG9zID09PSAxID8gMSA6IC1NYXRoLnBvdygyLCAtMTAgKiBwb3MpICsgMSxcbiAgICAgICAgdmlzY29zaXR5RmFjdG9yOiAwLjUsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHNjcm9sbGVkOiAwLFxuICAgICAgICBwb2ludGVyRG93bjogZmFsc2UsXG5cbiAgICAgICAgcGFnZVg6IFtdLFxuICAgICAgICBzY3JvbGxlZERpZmY6IDAsXG4gICAgICAgIGRvd25FdmVudFRTOiAwLFxuICAgICAgICBtb3ZlRXZlbnRUUzogMCxcblxuICAgICAgICBsaW1pdExlZnQ6IDAsXG4gICAgICAgIGxpbWl0UmlnaHQ6IDAsXG5cbiAgICAgICAgbGVuOiBlbC5oYXNDaGlsZE5vZGVzKCkgJiYgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCBlbCkubGVuZ3RoIHx8IDAsXG4gICAgICAgIGVsOiBlbCB8fCBudWxsLFxuICAgICAgfVxuXG4gICAgICB0aGlzLmluaXQoZWwpXG5cbiAgICAgIHdpbmRvdy5yYWYgPSAoZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge3NldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCl9XG4gICAgICB9KSgpXG4gICAgfVxuXG5cbiAgICBnZXQocHJvcCkge1xuICAgICAgcmV0dXJuIHR5cGVvZih0aGlzLnN0YXRlW3Byb3BdKSAhPT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnN0YXRlW3Byb3BdIDogbnVsbFxuICAgIH1cblxuICAgIHNldChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgcHVzaChwcm9wLCB2YWx1ZSkge1xuICAgICAgdGhpcy5zdGF0ZVtwcm9wXS5wdXNoKHZhbHVlKVxuICAgIH1cblxuICAgIGdldExhc3RNZWFuaW5nZnVsbChwcm9wKSB7XG4gICAgICBjb25zdCB0b0lnbm9yZSA9IHRoaXMuc3RhdGVbcHJvcF0gJiYgdGhpcy5zdGF0ZVtwcm9wXS5sZW5ndGggJiYgdGhpcy5zdGF0ZVtwcm9wXS5sZW5ndGggPiAzXG4gICAgICAgID8gMyA6IDFcblxuICAgICAgcmV0dXJuIHRoaXMuc3RhdGVbcHJvcF1bdGhpcy5zdGF0ZVtwcm9wXS5sZW5ndGggLSB0b0lnbm9yZV1cbiAgICB9XG5cblxuICAgIGFkZENsYXNzKGVsLCBjbCkge1xuICAgICAgaWYgKCFuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NsKycoXFxcXHN8JCknKS50ZXN0KGVsLmNsYXNzTmFtZSkpIGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbFxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKGVsLCBjbCkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lXG4gICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxccyt8XiknK2NsKycoXFxcXHMrfCQpJywgJ2cnKSwgJyAnKVxuICAgICAgICAucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gICAgfVxuXG4gICAgc2V0UG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyBwb3MgKyAncHgsIDApIHRyYW5zbGF0ZVooMCknXG4gICAgICBlbC5zdHlsZS5Nb3pUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUubXNUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUuT1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICB9XG5cblxuICAgIGluaXQoZWwpIHtcbiAgICAgIHRoaXMuY3JlYXRlV3JhcHBlcigpXG4gICAgICB0aGlzLndyYXBJdGVtcygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmdcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3QgcHJldkh0bWwgPSByb290Tm9kZS5pbm5lckhUTUxcbiAgICAgIGNvbnN0IHdyYXBwZXJIdG1sID0gYDxkaXYgY2xhc3M9XCIke3ByZWZpeH0td3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXN0cmlwXCI+JHtwcmV2SHRtbH08L2Rpdj5cbiAgICAgIDwvZGl2PmBcblxuICAgICAgcm9vdE5vZGUuaW5uZXJIVE1MID0gd3JhcHBlckh0bWxcbiAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHByZWZpeClcbiAgICB9XG5cbiAgICB3cmFwSXRlbXMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIGdldEVsZW1lbnRzKCc6c2NvcGUgPiAqJywgd3JhcHBlck5vZGUpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBpdGVtV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgaXRlbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbVdyYXBwZXIsIGl0ZW1Ob2RlKVxuICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcblxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcblxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aClcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCB0cyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnZG93bkV2ZW50VFMnLCB0cylcblxuICAgICAgY29uc3QgbmV3U2Nyb2xsZWREaWZmID0gdGhpcy5nZXQoJ3Njcm9sbGVkJykgKyAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYKVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkRGlmZicsIG5ld1Njcm9sbGVkRGlmZilcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyh3cmFwcGVyTm9kZSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuICAgICAgaWYgKCFwb2ludGVyRG93bikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHNjcm9sbGVkRGlmZiA9IHRoaXMuZ2V0KCdzY3JvbGxlZERpZmYnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBjb25zdCBjdXJyZW50UGFnZVggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGNvbnN0IGRlbHRhID0gc2Nyb2xsZWREaWZmIC0gY3VycmVudFBhZ2VYIC8vIGRyYWcgdG8gbGVmdCBpcyBwb3NpdGl2ZSBudW1iZXJcbiAgICAgIGxldCByZXN1bHQgPSBkZWx0YVxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGlmIChyZXN1bHQgPCBsaW1pdExlZnQpIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgICB0aGlzLnB1c2goJ3BhZ2VYJywgY3VycmVudFBhZ2VYKVxuICAgIH1cblxuICAgIG9uUG9pbnRlclVwKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgZmFsc2UpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3Mod3JhcHBlck5vZGUsIHRoaXMuY29uZmlnLmRyYWdnaW5nQ2xzbm0pXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgbGFzdFBhZ2VYID0gdGhpcy5nZXRMYXN0TWVhbmluZ2Z1bGwoJ3BhZ2VYJylcbiAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgIGNvbnN0IGRpc3RhbmNlRGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdFBhZ2VYXG4gICAgICBjb25zdCB0aW1lRGVsdGEgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gdGhpcy5nZXQoJ21vdmVFdmVudFRTJylcbiAgICAgIGNvbnN0IGVkbnBvaW50ID0gc2Nyb2xsZWQgLSAoZGlzdGFuY2VEZWx0YSAqIDUpXG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0TGVmdCB8fCBlZG5wb2ludCA8IGxpbWl0TGVmdCkgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdExlZnQpXG4gICAgICBlbHNlIGlmIChzY3JvbGxlZCA+IGxpbWl0UmlnaHQgfHwgZWRucG9pbnQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQpXG4gICAgICBlbHNlIGlmICh0aW1lRGVsdGEgPCAxNTAgJiYgTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgPiAyKSB7XG4gICAgICAgIGNvbnN0IHRpbWVUb0VuZHBvaW50ID0gTWF0aC5hYnMoZGlzdGFuY2VEZWx0YSkgLyB0aW1lRGVsdGFcbiAgICAgICAgdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBlZG5wb2ludCwgdGltZVRvRW5kcG9pbnQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgb25DbGlja0xpbmsoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cblxuICAgIGFuaW1hdGUoc3RhcnQsIHN0b3A9MCwgc3BlZWQ9MTApIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gc3RvcCAtIHN0YXJ0XG4gICAgICBjb25zdCB0aW1lID0gTWF0aC5tYXgoLjA1LCBNYXRoLm1pbihNYXRoLmFicyhkZWx0YSkgLyBzcGVlZCwgMSkpXG5cbiAgICAgIGxldCBjdXJyZW50VGltZSA9IDAsXG4gICAgICAgICAgcmVzdWx0ID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuICAgICAgICBpZiAocG9pbnRlckRvd24pIHJldHVyblxuXG4gICAgICAgIGN1cnJlbnRUaW1lICs9ICgxIC8gNjApXG4gICAgICAgIHJlc3VsdCA9IHN0YXJ0ICsgZGVsdGEgKiB0aGlzLmNvbmZpZy5lYXNpbmcoY3VycmVudFRpbWUgLyB0aW1lKVxuXG4gICAgICAgIGlmIChjdXJyZW50VGltZSA+PSAxKSB7XG4gICAgICAgICAgdGhpcy5zZXRQb3MoLTEgKiBzdG9wKVxuICAgICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHN0b3ApXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmFmKHRpY2spXG4gICAgICAgICAgdGhpcy5zZXRQb3MoLTEgKiByZXN1bHQpXG4gICAgICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRpY2soKVxuICAgIH1cbiAgfVxuXG5cblxuICAvLyBpbml0XG5cbiAgY29uc3QgZWwgPSBnZXRFbGVtZW50KCcuc2Nyb2xsZXInKVxuICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG5cbn0oKSlcbiJdfQ==
