import { contentAlignment } from "./alignment.js";
import { visibility } from "./visibility.js";

const skip = () => {};
const numberFromString = (str) => str && Number(str);

export function createRuntimeConfig({ element, config }) {
  const { dataset } = element;

  return {
    ...config,

    scrollbar: config.scrollbar || dataset.scrollbar || visibility.visible,
    navigation: config.navigation || dataset.navigation || visibility.visible,

    align: config.align ?? dataset.align ?? contentAlignment.center,
    startPosition: config.startPosition ?? dataset.startPosition ?? contentAlignment.start,
    startDuration: config.startDuration ?? numberFromString(dataset.startDuration) ?? 250,

    onItemClick: config.onItemClick ?? skip,
  };
}
