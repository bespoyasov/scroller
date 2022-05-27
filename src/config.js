import { contentAlignment } from "./alignment.js";
import { visibility } from "./visibility.js";

export function createRuntimeConfig({ element, config }) {
  const { dataset } = element;

  return {
    ...config,

    scrollbar: config.scrollbar || dataset.scrollbar || visibility.visible,
    navigation: config.navigation || dataset.navigation || visibility.visible,

    align: config.align || dataset.align || contentAlignment.center,
    start: config.start || dataset.start || contentAlignment.start,
    startAnimation: config.startAnimation || dataset.startAnimation || true,
  };
}
