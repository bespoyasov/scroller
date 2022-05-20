import { classNames } from "./classes.js";

export function createComponentRoot() {
  const root = document.createElement("article");
  root.className = classNames.namespace;
  return root;
}
