export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.83, 0, 0.17, 1],
  soft: [0.33, 1, 0.68, 1],
} as const;
export const dur = {
  micro: 0.18,
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  curtain: 1.15,
  stagger: 0.055,
  transition: 0.42,
  exit: 0.15,
  debounce: 0.12,
  lineStagger: 0.09,
  minimumLoad: 0.7,
  maximumLoad: 1.4,
  loadHold: 0.12,
  resize: 0.15,
  toast: 2.4,
};
export const spring = {
  stiff: { stiffness: 420, damping: 32, mass: 0.8 },
  soft: { stiffness: 180, damping: 26, mass: 1 },
  media: { stiffness: 140, damping: 24, mass: 0.75 },
};
export const distance = {
  micro: 4,
  small: 8,
  reveal: 12,
  curtain: 24,
  magneticRadius: 90,
  magneticStrength: 0.25,
  imageParallax: 0.04,
  tilt: 1.4,
};
export const physics = {
  scrollLerp: 0.085,
  scrub: 0.8,
  frameLimit: 60,
  pointerLerp: 0.045,
  marqueeCoupling: -0.4,
  maxMarqueeSpeed: 2,
};
