# YVOO cinematic rebuild — full 28-page story

## Goal
Rebuild the current short, soft-looking experience into a high-resolution continuous cinematic journey that carries the substance of the complete 28-page YVOO customer presentation.

## What will change

### 1. Use the complete presentation narrative
- Expand the current 6 moments into a paced story of roughly 16 cinematic chapters.
- Preserve all five parts from the deck: The problem, How YVOO works, Proof, Why YVOO, Getting started.
- Include the missing substance: decision gap; 15–27 weeks vs. about 5–7 weeks; bottleneck; paper vs. floor; Vučetić proof legacy; six-step closed loop; six Atlas agents; L1/L2/L3 verification depth; local expert network and service standard; inspections; platform; drone inspections; real-case proof rejection; scored financial result; industries; Stuttgart scenario; comparison; architecture and data principles; two entry points; pilot measures; contact.
- Keep deck caveats such as targets/reference ranges and anonymised-case context where relevant.

### 2. Replace the sparse 3D tunnel with distinct cinematic environments
- Keep one uninterrupted scroll-controlled WebGL world, matching the reference’s storytelling principle.
- Build recognisable visual worlds rather than generic rings: supplier search field, decision gap, deadline corridor, factory evidence scan, fingerprint/proof transition, Atlas agent core, verification-depth gates, auditor network, inspection timeline, evidence wall, risk-reduction verdict, architecture channels, and final global YVOO world.
- Give every major content shift its own camera composition, transformation, lighting cue, and transition while keeping the journey continuous.

### 3. Raise visual quality
- Increase render density and texture filtering for sharper desktop and high-density displays.
- Remove the heavy fog/low-opacity treatment that currently makes images look like low-quality video.
- Use higher-fidelity materials, controlled depth, better lighting, and cleaner post-processing instead of blur and noise doing most of the work.
- Add a loading/progress state that waits for essential visual assets before revealing the first frame.
- Keep performance adaptive so mobile remains smooth without making desktop look soft.

### 4. Make the content readable without becoming a slide deck
- Use layered headlines, concise supporting facts, timelines, counters, evidence labels, process steps, and contextual data overlays.
- Reveal secondary detail during each camera move instead of displaying only one sentence per chapter.
- Expand the navigation to mirror all five presentation parts and show progress within each part.
- Keep YVOO lime as a precise proof/status signal, not a full-screen color wash.

### 5. Validate the full experience
- Check every presentation claim against the source before finalising copy.
- Test the entire scroll path on desktop and mobile, including navigation jumps and the final contact action.
- Verify sharpness, text legibility, no overlaps, no blank 3D frames, smooth transitions, and reduced-motion behaviour.

## Technical details
- Extend the existing React Three Fiber world and Catmull-Rom camera path rather than creating stacked webpage sections.
- Use a central chapter timeline to drive camera position, scene transforms, copy, statistics, and menu navigation from the same scroll progress.
- Split the 3D world into focused scene components and reuse geometry/materials to control memory and frame time.
- Use adaptive pixel ratio and quality tiers rather than the current hard cap that visibly softens large screens.
- Preserve the current semantic color system, accessible controls, and route metadata.

## Source of truth
`YVOO_Customer_Presentation_v3-2.pdf` — verified as 28 pages. No figures or claims will be invented beyond that deck.