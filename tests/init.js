import { Scroller } from "../scroller.js";

const scrollerRegistry = {};
const configList = [
  { className: "js-scroller-default" },
  { className: "js-scroller-hidden-scrollbar", scrollbar: "hidden" },
  { className: "js-scroller-hidden-navigation", navigation: "hidden" },
  { className: "js-scroller-align-start", align: "start" },
  { className: "js-scroller-align-center", align: "center" },
  { className: "js-scroller-align-end", align: "end" },
];

document.addEventListener("DOMContentLoaded", () => {
  configList.forEach(({ className, ...config }) => {
    const element = document.querySelector(`.${className}`);
    const scroller = new Scroller({ element, ...config });

    scrollerRegistry[className] = scroller;
  });
});

window.scrollerRegistry = scrollerRegistry;
