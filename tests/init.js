import { Scroller } from "../scroller.js";

const scrollerRegistry = {};
const configList = [
  { className: "js-scroller-default" },
  { className: "js-scroller-hidden-scrollbar", scrollbar: "hidden" },
  { className: "js-scroller-hidden-navigation", navigation: "hidden" },
  { className: "js-scroller-align-start", align: "start" },
  { className: "js-scroller-align-center", align: "center" },
  { className: "js-scroller-align-end", align: "end" },
  { className: "js-scroller-position-start", start: "start" },
  { className: "js-scroller-position-center", start: "center" },
  { className: "js-scroller-position-end", start: "end" },
  { className: "js-scroller-position-number", start: 250 },
  { className: "js-scroller-initially-hidden", start: 250 },
  { className: "js-scroller-external-layout", useExternalLayout: true },
  { className: "js-scroller-click-callback", onItemClick: console.log },
];

document.addEventListener("DOMContentLoaded", () => {
  configList.forEach(({ className, ...config }) => {
    const element = document.querySelector(`.${className}`);
    const scroller = new Scroller({ element, ...config });

    scrollerRegistry[className] = scroller;
  });

  document.querySelectorAll(".hidden").forEach((el) => {
    setTimeout(() => {
      el.classList.remove("hidden");
    }, 1000);
  });
});

window.scrollerRegistry = scrollerRegistry;
