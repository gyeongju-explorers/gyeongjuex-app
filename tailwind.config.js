/** @type {import('tailwindcss').Config} */

// 1 spacing unit = 1px (e.g. p-4 -> 4px), instead of Tailwind's default 0.25rem step.
// Capped at 256px — Tailwind CSS IntelliSense re-resolves this scale across every
// spacing utility (padding/margin/gap/width/height/...) on save, so a 1000-entry
// scale made every save noticeably slow. For one-off values above 256px, use
// Tailwind's arbitrary-value syntax instead, e.g. className="pt-[450px]".
const pxSpacing = Object.fromEntries(
  Array.from({ length: 257 }, (_, px) => [String(px), `${px}px`]),
);

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Gmarket Sans ships as separate Light/Medium/Bold files, not one variable font, so RN
  // can't synthesize weight from `fontWeight` — Tailwind's built-in font-weight utilities
  // (font-bold, font-light, ...) would silently do nothing. Disabled so those class names
  // resolve to our `fontFamily` utilities below instead, which swap the actual font file.
  corePlugins: { fontWeight: false },
  theme: {
    spacing: pxSpacing,
    // Not under `extend` — replaces nativewind's preset shadow scale (which has a
    // different offset/blur/color per size) so every `shadow*` class in the app
    // renders identically: offset-y 4px, black at 25% opacity. Add className="shadow"
    // wherever a shadow is needed; don't reach for inline `boxShadow` styles.
    boxShadow: {
      DEFAULT: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      none: '0 0 #0000',
    },
    extend: {
      // Loaded via `useFonts` in src/app/_layout.tsx (assets/fonts/GmarketSans-*.otf).
      // Mirrors constants/theme.ts `Fonts`; ThemedText defaults to `font-sans` so text
      // without an explicit font-* class still gets Gmarket Sans.
      fontFamily: {
        light: ['GmarketSans-Light'],
        sans: ['GmarketSans-Medium'],
        bold: ['GmarketSans-Bold'],
      },
      // Mirrors constants/theme.ts `Colors` (kept in sync by hand — tailwind.config.js
      // is plain Node/CommonJS and can't import that .ts file directly).
      // Base = light mode; use the `-dark` pair with the `dark:` variant, e.g.
      // className="bg-background-element dark:bg-background-element-dark".
      colors: {
        // text: '#000000',
        // 'text-dark': '#ffffff',
        // 'text-secondary': '#60646C',
        // 'text-secondary-dark': '#B0B4BA',
        // background: '#ffffff',
        // 'background-dark': '#000000',
        // 'background-element': '#F0F0F3',
        // 'background-element-dark': '#212225',
        // 'background-selected': '#E0E1E6',
        // 'background-selected-dark': '#2E3135',

        // TODO: placeholder hex — swap these for the real design values.
        // `gray` merges into Tailwind's default gray scale (only 50/100/300 are
        // overridden, gray-200/400/500/... stay Tailwind defaults until you add them).
        // `primary` is a brand-new scale, add more steps (400, 500, 700, ...) as needed.
        black: '#111111',
        white: '#FAFAFA',
        gray: {
          100: '#F6F6F6',
          300: '#D1D1D1',
          500: '#ADADAD',
          700: '#919191',
          900: '#3D3D3D',
        },
        primary: '#29D9CE',
        secondary: '#26323E',
      },
    },
  },
  plugins: [],
};
