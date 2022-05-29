import { Scroller } from "./component.js";

document.addEventListener("DOMContentLoaded", function initializeAll() {
  document.querySelectorAll(`.${Scroller.className}`).forEach((element) => {
    if (element.dataset.initialized) return;
    new Scroller({ element });
  });
});

export { Scroller };
