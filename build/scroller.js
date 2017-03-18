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
        downEventX: 0,
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

        var newDownEventX = this.get('scrolled') + (e.originalEvent && e.originalEvent.pageX || e.pageX);
        this.set('downEventX', newDownEventX);

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

        var downEventX = this.get('downEventX');
        var scrolled = this.get('scrolled');

        var currentPageX = e.originalEvent && e.originalEvent.pageX || e.pageX;
        var delta = downEventX - currentPageX; // drag to left is positive number
        var result = delta;

        var limitLeft = this.get('limitLeft');
        var limitRight = this.get('limitRight');

        if (result < limitLeft) result = Math.round(0.2 * result);else if (result > limitRight) result = Math.round(0.2 * result + 0.8 * limitRight);

        this.setPos(-1 * result);
        this.set('scrolled', result);
        this.set('moveEventTS', new Date().getTime());
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

        if (scrolled < limitLeft) this.animate(scrolled, limitLeft);else if (scrolled > limitRight) this.animate(scrolled, limitRight);else {
          var lastDownEventX = this.get('downEventX');
          var currentEventX = e.originalEvent && e.originalEvent.pageX || e.pageX;
          var delta = currentEventX - lastDownEventX;
          var moveEventTS = this.get('moveEventTS');
          var nowTS = new Date().getTime();
          var timeDelta = nowTS - moveEventTS;
          // const ednpoint =
          // const timeToEndpoint =
          // this.animate(scrolled, limitRight)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM3QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxPQUFPLEtBQUssQ0FBTCxDQUFQLEdBQWlCLElBQXhCO0FBQ0QsR0FIRDs7QUFLQSxNQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsUUFBRCxFQUE0QjtBQUFBLFFBQWpCLEdBQWlCLHlEQUFiLFFBQWE7O0FBQzlDLFFBQU0sT0FBTyxJQUFJLGdCQUFKLENBQXFCLFFBQXJCLENBQWI7QUFDQSxXQUFPLFFBQVEsSUFBZjtBQUNELEdBSEQ7Ozs7QUFUVSxNQWtCSixRQWxCSTtBQW1CUixzQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUEsVUFDWCxLQURXLEdBQzBCLE1BRDFCLENBQ1gsS0FEVztBQUFBLFVBQ0osU0FESSxHQUMwQixNQUQxQixDQUNKLFNBREk7QUFBQSxVQUNPLFdBRFAsR0FDMEIsTUFEMUIsQ0FDTyxXQURQO0FBQUEsVUFDb0IsRUFEcEIsR0FDMEIsTUFEMUIsQ0FDb0IsRUFEcEI7OztBQUdsQixXQUFLLE1BQUwsR0FBYztBQUNaLGVBQU8sU0FBUyxRQURKO0FBRVosbUJBQVcsYUFBYSxLQUZaO0FBR1oscUJBQWEsZUFBZSxLQUhoQjs7QUFLWixnQkFBUSxhQUxJO0FBTVosdUJBQWUsYUFOSDs7QUFRWixnQkFBUTtBQUFBLGlCQUFPLFFBQVEsQ0FBUixHQUFZLENBQVosR0FBZ0IsQ0FBQyxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxFQUFELEdBQU0sR0FBbEIsQ0FBRCxHQUEwQixDQUFqRDtBQUFBLFNBUkk7QUFTWix5QkFBaUI7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LEVBQWMsS0FBSyxHQUFMLENBQVMsS0FBSyxHQUFMLENBQVMsS0FBVCxJQUFrQixLQUEzQixFQUFrQyxDQUFsQyxDQUFkLENBQWI7O0FBRUEsWUFBSSxjQUFjLENBQWxCO1lBQ0ksU0FBUyxLQUFLLEdBQUwsQ0FBUyxVQUFULENBRGI7O0FBR0EsWUFBTSxPQUFPLFNBQVAsSUFBTyxHQUFNO0FBQ2pCLGNBQU0sY0FBYyxPQUFLLEdBQUwsQ0FBUyxhQUFULENBQXBCO0FBQ0EsY0FBSSxXQUFKLEVBQWlCOztBQUVqQix5QkFBZ0IsSUFBSSxFQUFwQjtBQUNBLG1CQUFTLFFBQVEsUUFBUSxPQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLGNBQWMsSUFBakMsQ0FBekI7O0FBRUEsY0FBSSxlQUFlLENBQW5CLEVBQXNCO0FBQ3BCLG1CQUFLLE1BQUwsQ0FBWSxDQUFDLENBQUQsR0FBSyxJQUFqQjtBQUNBLG1CQUFLLEdBQUwsQ0FBUyxVQUFULEVBQXFCLElBQXJCO0FBQ0QsV0FIRCxNQUlLO0FBQ0gsZ0JBQUksSUFBSjtBQUNBLG1CQUFLLE1BQUwsQ0FBWSxDQUFDLENBQUQsR0FBSyxNQUFqQjtBQUNBLG1CQUFLLEdBQUwsQ0FBUyxVQUFULEVBQXFCLE1BQXJCO0FBQ0Q7QUFDRixTQWhCRDs7QUFrQkE7QUFDRDtBQXJRTzs7QUFBQTtBQUFBOzs7O0FBNFFWLE1BQU0sS0FBSyxXQUFXLFdBQVgsQ0FBWDtBQUNBLE1BQU0sV0FBVyxJQUFJLFFBQUosQ0FBYSxFQUFFLE1BQUYsRUFBYixDQUFqQjtBQUVELENBL1FBLEdBQUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuXG4gIC8vIGhlbHBlcnNcblxuICBjb25zdCBnZXRFbGVtZW50ID0gKHNlbGVjdG9yLCBjdHg9ZG9jdW1lbnQpID0+IHtcbiAgICBjb25zdCBub2RlID0gY3R4LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGUgPyBub2RlWzBdIDogbnVsbFxuICB9XG5cbiAgY29uc3QgZ2V0RWxlbWVudHMgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSB8fCBudWxsXG4gIH1cblxuXG5cbiAgLy8gc2Nyb2xsZXJcblxuICBjbGFzcyBTY3JvbGxlciB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICBjb25zdCB7YWxpZ24sIG5vQW5jaG9ycywgbm9TY3JvbGxiYXIsIGVsfSA9IGNvbmZpZ1xuXG4gICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgYWxpZ246IGFsaWduIHx8ICdjZW50ZXInLFxuICAgICAgICBub0FuY2hvcnM6IG5vQW5jaG9ycyB8fCBmYWxzZSxcbiAgICAgICAgbm9TY3JvbGxiYXI6IG5vU2Nyb2xsYmFyIHx8IGZhbHNlLFxuXG4gICAgICAgIHByZWZpeDogJ2FiX3Njcm9sbGVyJyxcbiAgICAgICAgZHJhZ2dpbmdDbHNubTogJ2lzLWRyYWdnaW5nJyxcblxuICAgICAgICBlYXNpbmc6IHBvcyA9PiBwb3MgPT09IDEgPyAxIDogLU1hdGgucG93KDIsIC0xMCAqIHBvcykgKyAxLFxuICAgICAgICB2aXNjb3NpdHlGYWN0b3I6IDAuNSxcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgc2Nyb2xsZWQ6IDAsXG4gICAgICAgIHBvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgZG93bkV2ZW50WDogMCxcbiAgICAgICAgZG93bkV2ZW50VFM6IDAsXG4gICAgICAgIG1vdmVFdmVudFRTOiAwLFxuXG4gICAgICAgIGxpbWl0TGVmdDogMCxcbiAgICAgICAgbGltaXRSaWdodDogMCxcblxuICAgICAgICBsZW46IGVsLmhhc0NoaWxkTm9kZXMoKSAmJiBnZXRFbGVtZW50cygnOnNjb3BlID4gKicsIGVsKS5sZW5ndGggfHwgMCxcbiAgICAgICAgZWw6IGVsIHx8IG51bGwsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5pdChlbClcblxuICAgICAgd2luZG93LnJhZiA9IChmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7c2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKX1cbiAgICAgIH0pKClcbiAgICB9XG5cblxuICAgIGdldChwcm9wKSB7XG4gICAgICByZXR1cm4gdHlwZW9mKHRoaXMuc3RhdGVbcHJvcF0pICE9PSAndW5kZWZpbmVkJyA/IHRoaXMuc3RhdGVbcHJvcF0gOiBudWxsXG4gICAgfVxuXG4gICAgc2V0KHByb3AsIHZhbHVlKSB7XG4gICAgICB0aGlzLnN0YXRlW3Byb3BdID0gdmFsdWVcbiAgICB9XG5cblxuICAgIGFkZENsYXNzKGVsLCBjbCkge1xuICAgICAgaWYgKCFuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NsKycoXFxcXHN8JCknKS50ZXN0KGVsLmNsYXNzTmFtZSkpIGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbFxuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKGVsLCBjbCkge1xuICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lXG4gICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJyhcXFxccyt8XiknK2NsKycoXFxcXHMrfCQpJywgJ2cnKSwgJyAnKVxuICAgICAgICAucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gICAgfVxuXG4gICAgc2V0UG9zKHBvcykge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IGVsID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuXG4gICAgICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyBwb3MgKyAncHgsIDApIHRyYW5zbGF0ZVooMCknXG4gICAgICBlbC5zdHlsZS5Nb3pUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUubXNUcmFuc2Zvcm0gPVxuICAgICAgZWwuc3R5bGUuT1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgnICsgcG9zICsgJ3B4KSdcbiAgICB9XG5cblxuICAgIGluaXQoZWwpIHtcbiAgICAgIHRoaXMuY3JlYXRlV3JhcHBlcigpXG4gICAgICB0aGlzLndyYXBJdGVtcygpXG4gICAgICB0aGlzLnNldFNpemUoKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgc3RyaXBOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgbGlua05vZGVzID0gZ2V0RWxlbWVudHMoJ2EnLCBzdHJpcE5vZGUpXG5cbiAgICAgIHN0cmlwTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uUG9pbnRlckRvd24uYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vblBvaW50ZXJVcC5iaW5kKHRoaXMpKVxuXG4gICAgICAvLyBwcmV2ZW50IGNsaWNrbmdcbiAgICAgIEFycmF5LmZyb20obGlua05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrTGluay5iaW5kKHRoaXMpLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcblxuICAgICAgY29uc3QgcHJldkh0bWwgPSByb290Tm9kZS5pbm5lckhUTUxcbiAgICAgIGNvbnN0IHdyYXBwZXJIdG1sID0gYDxkaXYgY2xhc3M9XCIke3ByZWZpeH0td3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHtwcmVmaXh9LXN0cmlwXCI+JHtwcmV2SHRtbH08L2Rpdj5cbiAgICAgIDwvZGl2PmBcblxuICAgICAgcm9vdE5vZGUuaW5uZXJIVE1MID0gd3JhcHBlckh0bWxcbiAgICAgIHRoaXMuYWRkQ2xhc3Mocm9vdE5vZGUsIHByZWZpeClcbiAgICB9XG5cbiAgICB3cmFwSXRlbXMoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIGdldEVsZW1lbnRzKCc6c2NvcGUgPiAqJywgd3JhcHBlck5vZGUpLmZvckVhY2goaXRlbU5vZGUgPT4ge1xuICAgICAgICBjb25zdCBpdGVtV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGl0ZW1XcmFwcGVyLmlubmVySFRNTCA9IGl0ZW1Ob2RlLm91dGVySFRNTFxuICAgICAgICBpdGVtV3JhcHBlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYCR7cHJlZml4fS1pdGVtYClcbiAgICAgICAgaXRlbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaXRlbVdyYXBwZXIsIGl0ZW1Ob2RlKVxuICAgICAgICBpdGVtTm9kZS5yZW1vdmUoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBzZXRTaXplKCkge1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgY29uc3QgaXRlbU5vZGVzID0gZ2V0RWxlbWVudHMoYC4ke3ByZWZpeH0taXRlbWAsIHJvb3ROb2RlKVxuICAgICAgbGV0IG1heEhlaWdodCA9IDAsIHN1bVdpZHRoID0gMFxuXG4gICAgICBpdGVtTm9kZXMuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRIZWlnaHQgPSBpdGVtTm9kZS5vZmZzZXRIZWlnaHRcbiAgICAgICAgaWYgKGN1cnJlbnRIZWlnaHQgPiBtYXhIZWlnaHQpIG1heEhlaWdodCA9IGN1cnJlbnRIZWlnaHRcblxuICAgICAgICBzdW1XaWR0aCArPSBpdGVtTm9kZS5vZmZzZXRXaWR0aFxuICAgICAgfSlcblxuICAgICAgcm9vdE5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gbWF4SGVpZ2h0ICsgJ3B4J1xuICAgICAgd3JhcHBlck5vZGUuc3R5bGUud2lkdGggPSAoc3VtV2lkdGggKyAxKSArICdweCdcblxuICAgICAgdGhpcy5zZXQoJ2xpbWl0UmlnaHQnLCBzdW1XaWR0aCArIDEgLSByb290Tm9kZS5vZmZzZXRXaWR0aClcbiAgICB9XG5cblxuICAgIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgaWYgKCFlKSByZXR1cm5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCB0cyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIHRydWUpXG4gICAgICB0aGlzLnNldCgnZG93bkV2ZW50VFMnLCB0cylcblxuICAgICAgY29uc3QgbmV3RG93bkV2ZW50WCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpICsgKGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWClcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRYJywgbmV3RG93bkV2ZW50WClcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5hZGRDbGFzcyh3cmFwcGVyTm9kZSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcbiAgICB9XG5cbiAgICBvblBvaW50ZXJNb3ZlKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgcG9pbnRlckRvd24gPSB0aGlzLmdldCgncG9pbnRlckRvd24nKVxuICAgICAgaWYgKCFwb2ludGVyRG93bikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGRvd25FdmVudFggPSB0aGlzLmdldCgnZG93bkV2ZW50WCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQYWdlWCA9IGUub3JpZ2luYWxFdmVudCAmJiBlLm9yaWdpbmFsRXZlbnQucGFnZVggfHwgZS5wYWdlWFxuICAgICAgY29uc3QgZGVsdGEgPSBkb3duRXZlbnRYIC0gY3VycmVudFBhZ2VYIC8vIGRyYWcgdG8gbGVmdCBpcyBwb3NpdGl2ZSBudW1iZXJcbiAgICAgIGxldCByZXN1bHQgPSBkZWx0YVxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG5cbiAgICAgIGlmIChyZXN1bHQgPCBsaW1pdExlZnQpIHJlc3VsdCA9IE1hdGgucm91bmQoMC4yICogcmVzdWx0KVxuICAgICAgZWxzZSBpZiAocmVzdWx0ID4gbGltaXRSaWdodCkgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQgKyAwLjggKiBsaW1pdFJpZ2h0KVxuXG4gICAgICB0aGlzLnNldFBvcygtMSAqIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgIHRoaXMuc2V0KCdtb3ZlRXZlbnRUUycsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgfVxuXG4gICAgb25Qb2ludGVyVXAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLnNldCgncG9pbnRlckRvd24nLCBmYWxzZSlcblxuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWcucHJlZml4XG4gICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuc3RhdGUuZWxcbiAgICAgIGNvbnN0IHdyYXBwZXJOb2RlID0gZ2V0RWxlbWVudChgLiR7cHJlZml4fS1zdHJpcGAsIHJvb3ROb2RlKVxuICAgICAgdGhpcy5yZW1vdmVDbGFzcyh3cmFwcGVyTm9kZSwgdGhpcy5jb25maWcuZHJhZ2dpbmdDbHNubSlcblxuICAgICAgY29uc3QgbGltaXRMZWZ0ID0gdGhpcy5nZXQoJ2xpbWl0TGVmdCcpXG4gICAgICBjb25zdCBsaW1pdFJpZ2h0ID0gdGhpcy5nZXQoJ2xpbWl0UmlnaHQnKVxuICAgICAgY29uc3Qgc2Nyb2xsZWQgPSB0aGlzLmdldCgnc2Nyb2xsZWQnKVxuXG4gICAgICBpZiAoc2Nyb2xsZWQgPCBsaW1pdExlZnQpIHRoaXMuYW5pbWF0ZShzY3JvbGxlZCwgbGltaXRMZWZ0KVxuICAgICAgZWxzZSBpZiAoc2Nyb2xsZWQgPiBsaW1pdFJpZ2h0KSB0aGlzLmFuaW1hdGUoc2Nyb2xsZWQsIGxpbWl0UmlnaHQpXG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGFzdERvd25FdmVudFggPSB0aGlzLmdldCgnZG93bkV2ZW50WCcpXG4gICAgICAgIGNvbnN0IGN1cnJlbnRFdmVudFggPSBlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LnBhZ2VYIHx8IGUucGFnZVhcbiAgICAgICAgY29uc3QgZGVsdGEgPSBjdXJyZW50RXZlbnRYIC0gbGFzdERvd25FdmVudFhcbiAgICAgICAgY29uc3QgbW92ZUV2ZW50VFMgPSB0aGlzLmdldCgnbW92ZUV2ZW50VFMnKVxuICAgICAgICBjb25zdCBub3dUUyA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgY29uc3QgdGltZURlbHRhID0gbm93VFMgLSBtb3ZlRXZlbnRUU1xuICAgICAgICAvLyBjb25zdCBlZG5wb2ludCA9XG4gICAgICAgIC8vIGNvbnN0IHRpbWVUb0VuZHBvaW50ID1cbiAgICAgICAgLy8gdGhpcy5hbmltYXRlKHNjcm9sbGVkLCBsaW1pdFJpZ2h0KVxuICAgICAgfVxuICAgIH1cblxuICAgIG9uQ2xpY2tMaW5rKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG5cbiAgICBhbmltYXRlKHN0YXJ0LCBzdG9wPTAsIHNwZWVkPTEwKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IHN0b3AgLSBzdGFydFxuICAgICAgY29uc3QgdGltZSA9IE1hdGgubWF4KC4wNSwgTWF0aC5taW4oTWF0aC5hYnMoZGVsdGEpIC8gc3BlZWQsIDEpKVxuXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSAwLFxuICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvaW50ZXJEb3duID0gdGhpcy5nZXQoJ3BvaW50ZXJEb3duJylcbiAgICAgICAgaWYgKHBvaW50ZXJEb3duKSByZXR1cm5cblxuICAgICAgICBjdXJyZW50VGltZSArPSAoMSAvIDYwKVxuICAgICAgICByZXN1bHQgPSBzdGFydCArIGRlbHRhICogdGhpcy5jb25maWcuZWFzaW5nKGN1cnJlbnRUaW1lIC8gdGltZSlcblxuICAgICAgICBpZiAoY3VycmVudFRpbWUgPj0gMSkge1xuICAgICAgICAgIHRoaXMuc2V0UG9zKC0xICogc3RvcClcbiAgICAgICAgICB0aGlzLnNldCgnc2Nyb2xsZWQnLCBzdG9wKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJhZih0aWNrKVxuICAgICAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgICAgIHRoaXMuc2V0KCdzY3JvbGxlZCcsIHJlc3VsdClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aWNrKClcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW5pdFxuXG4gIGNvbnN0IGVsID0gZ2V0RWxlbWVudCgnLnNjcm9sbGVyJylcbiAgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXIoeyBlbCB9KVxuXG59KCkpXG4iXX0=
