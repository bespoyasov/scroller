import { classNames } from "./classes.js";

export function createComponentRoot() {
  const root = document.createElement("article");
  root.className = classNames.namespace;
  return root;
}

export function createContentContainer() {
  const container = document.createElement("div");
  container.className = classNames.container;
  return container;
}

export function createScrollBar() {
  const scrollbar = document.createElement("div");
  const handle = document.createElement("div");

  handle.className = classNames.handle;
  scrollbar.className = classNames.scrollbar;
  scrollbar.append(handle);

  return scrollbar;
}

export function createNavigation(contentItems) {
  const navigation = document.createElement("footer");
  const buttons = contentItems
    .filter((element) => !!element.dataset.anchor)
    .map((element) => {
      const button = document.createElement("button");
      button.className = classNames.button;
      button.innerText = element.dataset.anchor;
      button.dataset.id = element.dataset.anchor;
      button.type = "button";
      return button;
    });

  navigation.className = classNames.nav;
  navigation.append(...buttons);
  return navigation;
}
