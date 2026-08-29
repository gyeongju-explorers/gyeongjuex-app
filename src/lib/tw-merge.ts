import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge's built-in `font-family`/`font-weight` groups don't know about this
// project's tailwind.config.js, which repurposes font-light/font-sans/font-bold as
// fontFamily utilities (Gmarket Sans has no weight axis, so corePlugins.fontWeight is
// disabled). Without this override, twMerge treats font-sans as non-conflicting with
// font-bold/font-light and keeps both — letting Tailwind's cascade order silently
// decide instead of "last class wins", which is what broke `<ThemedText className="font-bold">`.
export const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'font-weight': [],
      'font-family': ['font-light', 'font-sans', 'font-bold'],
    },
  },
});
