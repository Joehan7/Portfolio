export type ScrollDetail = { target: string | number; immediate?: boolean; offset?: number };
export function scrollToTarget(target: string | number, immediate = false, offset = 0) {
  const event = new CustomEvent<ScrollDetail>('signal:scroll', {
    detail: { target, immediate, offset },
    cancelable: true,
  });
  if (!window.dispatchEvent(event)) return;
  const top =
    typeof target === 'number'
      ? target
      : (document.querySelector<HTMLElement>(target)?.getBoundingClientRect().top ??
          -window.scrollY) + window.scrollY;
  window.scrollTo({
    top: top + offset,
    behavior:
      immediate || document.documentElement.dataset.motion === 'reduced' ? 'instant' : 'smooth',
  });
}
