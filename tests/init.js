import { Scroller } from "../scroller.js";

document.addEventListener("DOMContentLoaded", () => {
  const scroller1 = new Scroller({
    element: document.querySelector(".js-scroller-default"),
  });

  const scroller2 = new Scroller({
    element: document.querySelector(".js-scroller-hidden-scrollbar"),
    scrollbar: "hidden",
  });

  const scroller3 = new Scroller({
    element: document.querySelector(".js-scroller-hidden-navigation"),
    navigation: "hidden",
  });

  console.log({ scroller1 });
  console.log({ scroller2 });
  console.log({ scroller3 });
});
