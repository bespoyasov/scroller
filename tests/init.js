import { Scroller } from "../scroller.js";

document.addEventListener("DOMContentLoaded", () => {
  const scroller1 = new Scroller({
    element: document.querySelector(".js-scroller-1"),
  });

  console.log({ scroller1 });
});
