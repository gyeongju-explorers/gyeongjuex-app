/** @type {import('tailwindcss').Config} */

// 1 spacing unit = 1px (e.g. p-4 -> 4px), instead of Tailwind's default 0.25rem step.
const pxSpacing = Object.fromEntries(
  Array.from({ length: 1001 }, (_, px) => [String(px), `${px}px`]),
);

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    spacing: pxSpacing,
    extend: {},
  },
  plugins: [],
};
