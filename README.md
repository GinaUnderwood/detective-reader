# Detective Reader

A responsive, detective-themed structured-literacy prototype for nine-year-old readers. It includes 49 sequenced word-family lessons, the 14-screen lesson framework from the Developer Notebook, guided pattern practice, avatars, earned coins, badges, and a fixed-price rewards shop.

Open `index.html` in a browser or publish the repository with GitHub Pages.

## Mobile lesson wireframes

The complete Developer Notebook lesson flow is available at
[`wireframes/index.html`](wireframes/index.html). It contains mobile-first
wireframes for Screens 1–14, from the Pattern Detective welcome through the
mastery check and celebration.

## Important production note

The prototype uses browser speech synthesis and consistently prefers a warm female AI voice across all 49 lessons. It selects Microsoft Jenny Online Natural first, then another known female Natural or Neural English voice, with a known female device voice as a fallback. The exact voice depends on which voices the learner's browser and device provide. A production version that requires one identical narrator on every device should use pre-generated, versioned audio and phoneme clips from a secured AI voice workflow; API credentials must remain outside the public website. Speech recognition, secure accounts, subscriptions, and durable server-side progress tracking should be added by the production developer.
