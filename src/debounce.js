export function debounce(callee, timeoutMs = 100) {
  return function perform(...args) {
    let previousCall = this.lastCall;
    this.lastCall = Date.now();

    if (previousCall && this.lastCall - previousCall <= timeoutMs) {
      clearTimeout(this.lastCallTimer);
    }

    this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs);
  };
}
