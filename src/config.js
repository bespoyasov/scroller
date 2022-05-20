import { visibility } from "./visibility.js";

export function createRuntimeConfig({ element, config }) {
  const { dataset } = element;

  return {
    ...config,
    scrollbar: config.scrollbar || dataset.scrollbar || visibility.visible,
    navigation: config.navigation || dataset.navigation || visibility.visible,
  };
}
