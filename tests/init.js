import { Scroller } from "../scroller.js";

const scrollerRegistry = {};
const configList = [
  { className: "js-scroller-default" },
  { className: "js-scroller-hidden-scrollbar", scrollbar: "hidden" },
  { className: "js-scroller-hidden-navigation", navigation: "hidden" },
  { className: "js-scroller-align-start", align: "start" },
  { className: "js-scroller-align-center", align: "center" },
  { className: "js-scroller-align-end", align: "end" },
  { className: "js-scroller-position-start", startPosition: "start" },
  { className: "js-scroller-position-center", startPosition: "center" },
  { className: "js-scroller-position-end", startPosition: "end" },
  { className: "js-scroller-position-number", startPosition: 250 },
  { className: "js-scroller-initially-hidden", startPosition: 250 },
  { className: "js-scroller-external-layout", useExternalLayout: true },
  { className: "js-scroller-click-callback", onItemClick: console.log },
  { className: "js-scroller-scroll-to" },
  { className: "js-scroller-update-config" },
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

  setTimeout(() => {
    scrollerRegistry["js-scroller-scroll-to"].scrollTo("center");
  }, 2500);

  setTimeout(() => {
    scrollerRegistry["js-scroller-update-config"].update({
      scrollbar: "visible",
      navigation: "visible",
      onItemClick: () => console.log("Updated handler fired."),
    });
  }, 1000);
});

window.scrollerRegistry = scrollerRegistry;
