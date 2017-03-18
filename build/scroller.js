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
        draggingClsnm: 'is-dragging'
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
    }

    _createClass(Scroller, [{
      key: 'get',
      value: function get(prop) {
        return this.state[prop] || null;
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

        if (scrolled < limitLeft) {} else if (scrolled > limitRight) {}
      }
    }, {
      key: 'onClickLink',
      value: function onClickLink(e) {
        e.preventDefault();
        return false;
      }
    }]);

    return Scroller;
  }();

  // init

  var el = getElement('.scroller');
  var scroller = new Scroller({ el: el });
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2Nyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQyxhQUFXOzs7O0FBSVYsTUFBTSxhQUFhLFNBQWIsVUFBYSxDQUFDLFFBQUQsRUFBNEI7QUFBQSxRQUFqQixHQUFpQix5REFBYixRQUFhOztBQUM3QyxRQUFNLE9BQU8sSUFBSSxnQkFBSixDQUFxQixRQUFyQixDQUFiO0FBQ0EsV0FBTyxPQUFPLEtBQUssQ0FBTCxDQUFQLEdBQWlCLElBQXhCO0FBQ0QsR0FIRDs7QUFLQSxNQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsUUFBRCxFQUE0QjtBQUFBLFFBQWpCLEdBQWlCLHlEQUFiLFFBQWE7O0FBQzlDLFFBQU0sT0FBTyxJQUFJLGdCQUFKLENBQXFCLFFBQXJCLENBQWI7QUFDQSxXQUFPLFFBQVEsSUFBZjtBQUNELEdBSEQ7Ozs7QUFUVSxNQWtCSixRQWxCSTtBQW1CUixzQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQUEsVUFDWCxLQURXLEdBQzBCLE1BRDFCLENBQ1gsS0FEVztBQUFBLFVBQ0osU0FESSxHQUMwQixNQUQxQixDQUNKLFNBREk7QUFBQSxVQUNPLFdBRFAsR0FDMEIsTUFEMUIsQ0FDTyxXQURQO0FBQUEsVUFDb0IsRUFEcEIsR0FDMEIsTUFEMUIsQ0FDb0IsRUFEcEI7OztBQUdsQixXQUFLLE1BQUwsR0FBYztBQUNaLGVBQU8sU0FBUyxRQURKO0FBRVosbUJBQVcsYUFBYSxLQUZaO0FBR1oscUJBQWEsZUFBZSxLQUhoQjtBQUlaLGdCQUFRLGFBSkk7QUFLWix1QkFBZTtBQUxILE9BQWQ7O0FBUUEsV0FBSyxLQUFMLEdBQWE7QUFDWCxrQkFBVSxDQURDO0FBRVgscUJBQWEsS0FGRjtBQUdYLG9CQUFZLENBSEQ7QUFJWCxxQkFBYSxDQUpGO0FBS1gscUJBQWEsQ0FMRjs7QUFPWCxtQkFBVyxDQVBBO0FBUVgsb0JBQVksQ0FSRDs7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LGtDQStNSSxDQS9NSixFQStNTztBQUNiLFVBQUUsY0FBRjtBQUNBLGVBQU8sS0FBUDtBQUNEO0FBbE5POztBQUFBO0FBQUE7Ozs7QUF5TlYsTUFBTSxLQUFLLFdBQVcsV0FBWCxDQUFYO0FBQ0EsTUFBTSxXQUFXLElBQUksUUFBSixDQUFhLEVBQUUsTUFBRixFQUFiLENBQWpCO0FBRUQsQ0E1TkEsR0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG5cbiAgLy8gaGVscGVyc1xuXG4gIGNvbnN0IGdldEVsZW1lbnQgPSAoc2VsZWN0b3IsIGN0eD1kb2N1bWVudCkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBjdHgucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZSA/IG5vZGVbMF0gOiBudWxsXG4gIH1cblxuICBjb25zdCBnZXRFbGVtZW50cyA9IChzZWxlY3RvciwgY3R4PWRvY3VtZW50KSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGN0eC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIHJldHVybiBub2RlIHx8IG51bGxcbiAgfVxuXG5cblxuICAvLyBzY3JvbGxlclxuXG4gIGNsYXNzIFNjcm9sbGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgIGNvbnN0IHthbGlnbiwgbm9BbmNob3JzLCBub1Njcm9sbGJhciwgZWx9ID0gY29uZmlnXG5cbiAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICBhbGlnbjogYWxpZ24gfHwgJ2NlbnRlcicsXG4gICAgICAgIG5vQW5jaG9yczogbm9BbmNob3JzIHx8IGZhbHNlLFxuICAgICAgICBub1Njcm9sbGJhcjogbm9TY3JvbGxiYXIgfHwgZmFsc2UsXG4gICAgICAgIHByZWZpeDogJ2FiX3Njcm9sbGVyJyxcbiAgICAgICAgZHJhZ2dpbmdDbHNubTogJ2lzLWRyYWdnaW5nJ1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBzY3JvbGxlZDogMCxcbiAgICAgICAgcG9pbnRlckRvd246IGZhbHNlLFxuICAgICAgICBkb3duRXZlbnRYOiAwLFxuICAgICAgICBkb3duRXZlbnRUUzogMCxcbiAgICAgICAgbW92ZUV2ZW50VFM6IDAsXG5cbiAgICAgICAgbGltaXRMZWZ0OiAwLFxuICAgICAgICBsaW1pdFJpZ2h0OiAwLFxuXG4gICAgICAgIGxlbjogZWwuaGFzQ2hpbGROb2RlcygpICYmIGdldEVsZW1lbnRzKCc6c2NvcGUgPiAqJywgZWwpLmxlbmd0aCB8fCAwLFxuICAgICAgICBlbDogZWwgfHwgbnVsbCxcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbml0KGVsKVxuICAgIH1cblxuXG4gICAgZ2V0KHByb3ApIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlW3Byb3BdIHx8IG51bGxcbiAgICB9XG5cbiAgICBzZXQocHJvcCwgdmFsdWUpIHtcbiAgICAgIHRoaXMuc3RhdGVbcHJvcF0gPSB2YWx1ZVxuICAgIH1cblxuXG4gICAgYWRkQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBpZiAoIW5ldyBSZWdFeHAoJyhcXFxcc3xeKScrY2wrJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKSkgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsXG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoZWwsIGNsKSB7XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWVcbiAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFxcXFxzK3xeKScrY2wrJyhcXFxccyt8JCknLCAnZycpLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICB9XG5cbiAgICBzZXRQb3MocG9zKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3QgZWwgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG5cbiAgICAgIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHBvcyArICdweCwgMCkgdHJhbnNsYXRlWigwKSdcbiAgICAgIGVsLnN0eWxlLk1velRyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5tc1RyYW5zZm9ybSA9XG4gICAgICBlbC5zdHlsZS5PVHJhbnNmb3JtID1cbiAgICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBwb3MgKyAncHgpJ1xuICAgIH1cblxuXG4gICAgaW5pdChlbCkge1xuICAgICAgdGhpcy5jcmVhdGVXcmFwcGVyKClcbiAgICAgIHRoaXMud3JhcEl0ZW1zKClcbiAgICAgIHRoaXMuc2V0U2l6ZSgpXG5cbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCBzdHJpcE5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBsaW5rTm9kZXMgPSBnZXRFbGVtZW50cygnYScsIHN0cmlwTm9kZSlcblxuICAgICAgc3RyaXBOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Qb2ludGVyTW92ZS5iaW5kKHRoaXMpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpXG5cbiAgICAgIC8vIHByZXZlbnQgY2xpY2tuZ1xuICAgICAgQXJyYXkuZnJvbShsaW5rTm9kZXMpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2tMaW5rLmJpbmQodGhpcyksIGZhbHNlKVxuICAgICAgfSlcbiAgICB9XG5cblxuICAgIGNyZWF0ZVdyYXBwZXIoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuXG4gICAgICBjb25zdCBwcmV2SHRtbCA9IHJvb3ROb2RlLmlubmVySFRNTFxuICAgICAgY29uc3Qgd3JhcHBlckh0bWwgPSBgPGRpdiBjbGFzcz1cIiR7cHJlZml4fS13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCIke3ByZWZpeH0tc3RyaXBcIj4ke3ByZXZIdG1sfTwvZGl2PlxuICAgICAgPC9kaXY+YFxuXG4gICAgICByb290Tm9kZS5pbm5lckhUTUwgPSB3cmFwcGVySHRtbFxuICAgICAgdGhpcy5hZGRDbGFzcyhyb290Tm9kZSwgcHJlZml4KVxuICAgIH1cblxuICAgIHdyYXBJdGVtcygpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuY29uZmlnLnByZWZpeFxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLnN0YXRlLmVsXG4gICAgICBjb25zdCB3cmFwcGVyTm9kZSA9IGdldEVsZW1lbnQoYC4ke3ByZWZpeH0tc3RyaXBgLCByb290Tm9kZSlcblxuICAgICAgZ2V0RWxlbWVudHMoJzpzY29wZSA+IConLCB3cmFwcGVyTm9kZSkuZm9yRWFjaChpdGVtTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgaXRlbVdyYXBwZXIuaW5uZXJIVE1MID0gaXRlbU5vZGUub3V0ZXJIVE1MXG4gICAgICAgIGl0ZW1XcmFwcGVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgJHtwcmVmaXh9LWl0ZW1gKVxuICAgICAgICBpdGVtTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpdGVtV3JhcHBlciwgaXRlbU5vZGUpXG4gICAgICAgIGl0ZW1Ob2RlLnJlbW92ZSgpXG4gICAgICB9KVxuICAgIH1cblxuICAgIHNldFNpemUoKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICBjb25zdCBpdGVtTm9kZXMgPSBnZXRFbGVtZW50cyhgLiR7cHJlZml4fS1pdGVtYCwgcm9vdE5vZGUpXG4gICAgICBsZXQgbWF4SGVpZ2h0ID0gMCwgc3VtV2lkdGggPSAwXG5cbiAgICAgIGl0ZW1Ob2Rlcy5mb3JFYWNoKGl0ZW1Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGl0ZW1Ob2RlLm9mZnNldEhlaWdodFxuICAgICAgICBpZiAoY3VycmVudEhlaWdodCA+IG1heEhlaWdodCkgbWF4SGVpZ2h0ID0gY3VycmVudEhlaWdodFxuXG4gICAgICAgIHN1bVdpZHRoICs9IGl0ZW1Ob2RlLm9mZnNldFdpZHRoXG4gICAgICB9KVxuXG4gICAgICByb290Tm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS5oZWlnaHQgPSBtYXhIZWlnaHQgKyAncHgnXG4gICAgICB3cmFwcGVyTm9kZS5zdHlsZS53aWR0aCA9IChzdW1XaWR0aCArIDEpICsgJ3B4J1xuXG4gICAgICB0aGlzLnNldCgnbGltaXRSaWdodCcsIHN1bVdpZHRoICsgMSAtIHJvb3ROb2RlLm9mZnNldFdpZHRoKVxuICAgIH1cblxuXG4gICAgb25Qb2ludGVyRG93bihlKSB7XG4gICAgICBpZiAoIWUpIHJldHVyblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IHRzID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgdGhpcy5zZXQoJ3BvaW50ZXJEb3duJywgdHJ1ZSlcbiAgICAgIHRoaXMuc2V0KCdkb3duRXZlbnRUUycsIHRzKVxuXG4gICAgICBjb25zdCBuZXdEb3duRXZlbnRYID0gdGhpcy5nZXQoJ3Njcm9sbGVkJykgKyAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYKVxuICAgICAgdGhpcy5zZXQoJ2Rvd25FdmVudFgnLCBuZXdEb3duRXZlbnRYKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLmFkZENsYXNzKHdyYXBwZXJOb2RlLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuICAgIH1cblxuICAgIG9uUG9pbnRlck1vdmUoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zdCBwb2ludGVyRG93biA9IHRoaXMuZ2V0KCdwb2ludGVyRG93bicpXG4gICAgICBpZiAoIXBvaW50ZXJEb3duKSByZXR1cm5cblxuICAgICAgY29uc3QgZG93bkV2ZW50WCA9IHRoaXMuZ2V0KCdkb3duRXZlbnRYJylcbiAgICAgIGNvbnN0IHNjcm9sbGVkID0gdGhpcy5nZXQoJ3Njcm9sbGVkJylcblxuICAgICAgY29uc3QgY3VycmVudFBhZ2VYID0gZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5wYWdlWCB8fCBlLnBhZ2VYXG4gICAgICBjb25zdCBkZWx0YSA9IGRvd25FdmVudFggLSBjdXJyZW50UGFnZVggLy8gZHJhZyB0byBsZWZ0IGlzIHBvc2l0aXZlIG51bWJlclxuICAgICAgbGV0IHJlc3VsdCA9IGRlbHRhXG5cbiAgICAgIGNvbnN0IGxpbWl0TGVmdCA9IHRoaXMuZ2V0KCdsaW1pdExlZnQnKVxuICAgICAgY29uc3QgbGltaXRSaWdodCA9IHRoaXMuZ2V0KCdsaW1pdFJpZ2h0JylcblxuICAgICAgaWYgKHJlc3VsdCA8IGxpbWl0TGVmdCkgcmVzdWx0ID0gTWF0aC5yb3VuZCgwLjIgKiByZXN1bHQpXG4gICAgICBlbHNlIGlmIChyZXN1bHQgPiBsaW1pdFJpZ2h0KSByZXN1bHQgPSBNYXRoLnJvdW5kKDAuMiAqIHJlc3VsdCArIDAuOCAqIGxpbWl0UmlnaHQpXG5cbiAgICAgIHRoaXMuc2V0UG9zKC0xICogcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ3Njcm9sbGVkJywgcmVzdWx0KVxuICAgICAgdGhpcy5zZXQoJ21vdmVFdmVudFRTJywgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcbiAgICB9XG5cbiAgICBvblBvaW50ZXJVcChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuc2V0KCdwb2ludGVyRG93bicsIGZhbHNlKVxuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZy5wcmVmaXhcbiAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5zdGF0ZS5lbFxuICAgICAgY29uc3Qgd3JhcHBlck5vZGUgPSBnZXRFbGVtZW50KGAuJHtwcmVmaXh9LXN0cmlwYCwgcm9vdE5vZGUpXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKHdyYXBwZXJOb2RlLCB0aGlzLmNvbmZpZy5kcmFnZ2luZ0Nsc25tKVxuXG4gICAgICBjb25zdCBsaW1pdExlZnQgPSB0aGlzLmdldCgnbGltaXRMZWZ0JylcbiAgICAgIGNvbnN0IGxpbWl0UmlnaHQgPSB0aGlzLmdldCgnbGltaXRSaWdodCcpXG4gICAgICBjb25zdCBzY3JvbGxlZCA9IHRoaXMuZ2V0KCdzY3JvbGxlZCcpXG5cbiAgICAgIGlmIChzY3JvbGxlZCA8IGxpbWl0TGVmdCkge31cbiAgICAgIGVsc2UgaWYgKHNjcm9sbGVkID4gbGltaXRSaWdodCkge31cbiAgICB9XG5cbiAgICBvbkNsaWNrTGluayhlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG5cblxuICAvLyBpbml0XG5cbiAgY29uc3QgZWwgPSBnZXRFbGVtZW50KCcuc2Nyb2xsZXInKVxuICBjb25zdCBzY3JvbGxlciA9IG5ldyBTY3JvbGxlcih7IGVsIH0pXG5cbn0oKSlcbiJdfQ==
