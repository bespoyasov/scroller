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
