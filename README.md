# SHEIN Growth Portfolio

React + TypeScript + Tailwind CSS + Framer Motion portfolio case study reconstructed from the provided Figma design.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Structure

- `src/components/Sections.tsx` — independent portfolio sections and interactions, including `HeroSection`, `ProjectOverview`, `AIWorkflow`, `AIPromptSystem`, `VisualOptimization`, `DataGrowthAnalysis`, `BestsellerPerformance`, and `FinalImpact`
- `src/styles.css` — design tokens, responsive layout, glass surfaces, frame styling
- `public/assets` — locally stored Figma source images
- `dist` — verified production build

The Banner Visual System supports automatic rotation, manual selection, pause/resume, upward transitions, stacked depth, and reduced-motion preferences.

## Optional banner video assets

Approved static banner images remain the default and poster fallback. To enable video, add `.mp4` and/or `.webm` files under `public/assets/video/`, then add a `video` field to the matching item in `src/components/Sections.tsx`:

```ts
{
  src: '/assets/context/20.png',
  label: 'BEACH CHEER',
  note: 'Emotional storytelling · Sports & companionship',
  position: 'center',
  video: {
    webm: '/assets/video/beach-cheer.webm',
    mp4: '/assets/video/beach-cheer.mp4',
  },
}
```

The video uses the existing banner frame and ratio, autoplays muted, loops, plays inline, crossfades with the other banners, and retains the approved image as its poster.
