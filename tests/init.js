import { Scroller } from "../scroller.js";

document.addEventListener("DOMContentLoaded", () => {
  const scroller1 = new Scroller({
    element: document.querySelector(".js-scroller-1"),
  });

  const scroller2 = new Scroller({
    element: document.querySelector(".js-scroller-2"),
    scrollbar: "hidden",
  });

  const scroller3 = new Scroller({
    element: document.querySelector(".js-scroller-3"),
    navigation: "hidden",
  });

  console.log({ scroller1 });
  console.log({ scroller2 });
  console.log({ scroller3 });
});
