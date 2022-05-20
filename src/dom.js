export const classIf = (element, condition, ...classNames) =>
  condition ? element.classList.add(...classNames) : element.classList.remove(...classNames);
