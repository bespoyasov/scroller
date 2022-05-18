(function () {
  class Scroller {
    constructor(config) {
      const { el } = config;

      this.state = {
        el: el || null,
      };

      this.init(el);
    }

    init(el) {
      const { el: rootNode } = this.state;
    }
  }

  window.Scroller = Scroller;
})();
