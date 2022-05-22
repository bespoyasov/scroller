const easeOutExpo = (position) => (position === 1 ? 1 : -Math.pow(2, -10 * position) + 1);
const nope = () => false;

export function animateValue({ from, to, callback, stop = nope, time: duration = 250 }) {
  if (to === from || !duration) return callback(to);

  const distance = Math.abs(to - from);
  const forward = to > from;
  const direction = forward ? 1 : -1;
  const constraint = forward ? Math.min : Math.max;

  let startedAt = 0;

  const tick = (timestamp) => {
    if (stop()) return;

    startedAt = startedAt || timestamp - 1;
    const elapsed = timestamp - startedAt;
    const gain = Math.round(direction * distance * easeOutExpo(elapsed / duration));
    const position = constraint(from + gain, to);

    callback(position);

    if (elapsed >= duration) return;
    if (forward && position >= to) return;
    if (!forward && position <= to) return;
    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}
