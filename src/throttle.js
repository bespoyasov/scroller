export function throttle(callback, timeout = 25) {
  let timer = null;

  return function perform(...args) {
    if (timer) return;

    timer = setTimeout(() => {
      callback(...args);
      clearTimeout(timer);
      timer = null;
    }, timeout);
  };
}
