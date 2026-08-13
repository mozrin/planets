# Atlas design language

The Atlas uses small, reusable TSX primitives and Tailwind CSS v4 utility
classes. `styles.css` remains only the required Tailwind import.

## Foundations

- **Typography:** serif display headings; sans-serif body text; uppercase,
  tracked monospace labels for provenance, system state, and data categories.
- **Spacing:** page gutters use `px-4 sm:px-8 lg:px-12`; screen sections use
  `py-8` or `py-10`; cards use `p-5` or `p-6`; related controls use `gap-3`.
- **Surfaces:** dark default surfaces use subtle white borders; quiet surfaces
  use `#101b28`; cyan-tinted surfaces communicate contextual information, not
  success or error alone.
- **States:** cyan is the active/focus affordance; slate is inactive or
  secondary; rose is reserved for errors. Every interactive control includes
  a visible keyboard focus ring.
- **Responsive behavior:** controls wrap before they compress; tables scroll
  horizontally; primary navigation remains intentionally horizontally
  scrollable on small screens.

## Reusable primitives

`src/components/atlas-ui.tsx` provides:

- `Surface` for standard, quiet, and contextual panels.
- `SectionLabel` for uppercase metadata labels.
- `DataValue` for compact label/value pairs.
- `SecondaryAction` for secondary interactive controls.

Use these primitives when the visual treatment and semantics repeat. Keep a
one-off composition local when it describes a genuinely unique research view.
