/**
 * How every Canvas measures itself. R3F's default sends even the first measurement through a
 * 50ms scroll debounce that each scroll event restarts, so a canvas mounted mid-scroll stays
 * size 0 (blank) until the visitor stops scrolling. None of our canvases need scroll tracking:
 * the room is fixed, and pointer events use offsetX/offsetY, not the canvas's page position.
 */
export const CANVAS_RESIZE = { scroll: false, debounce: 0 } as const;
