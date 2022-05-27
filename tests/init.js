import { Scroller } from "../scroller.js";

const scrollerRegistry = {};
const configList = [
  { selector: ".js-scroller-default" },
  { selector: ".js-scroller-hidden-scrollbar", scrollbar: "hidden" },
  { selector: ".js-scroller-hidden-navigation", navigation: "hidden" },
  { selector: ".js-scroller-align-start", align: "start" },
  { selector: ".js-scroller-align-center", align: "center" },
  { selector: ".js-scroller-align-end", align: "end" },
];

document.addEventListener("DOMContentLoaded", () => {
  configList.forEach(({ selector, ...config }) => {
    const element = document.querySelector(selector);
    const scroller = new Scroller({ element, ...config });

    scrollerRegistry[selector] = scroller;
  });
});
