# B-For-Baking

A scroll-led cake book for the Shillong boutique bakery. The site uses the bakery’s own logo, tagline, contact numbers, and 31 photographs and reel covers from 22 Instagram posts. Each gallery entry links to its source. The photo titles are editorial descriptions.

## Run locally

Serve this directory with any static HTTP server. GitHub Pages serves the main branch from its root. Visitors need no build step or third-party services to view the photographs, fonts, or animations.

## Edit

- `index.html` contains the story, bakery details, navigation, and contact links.
- `gallery.js` maps the optimised local images to their original Instagram posts.
- `style.css` controls typography, colour, and responsive layout.
- `site.js` handles the gallery, featured images, scroll sequences, and motion preferences.
- `source/pastry.js` is the editable Three.js scene. It loads the Blender model at `assets/piping.glb`. To rebuild the bundled viewer, install three@0.187.0 and esbuild@0.28.2 locally, then run `npx esbuild source/pastry.js --bundle --format=esm --minify --outfile=assets/pastry.js`.
- `source/piping.py` generates the original model and fallback render in Blender. Run Blender in background mode with this script from the repository root. It writes the GLB and a PNG to `assets/`. The shipped poster is a WebP conversion of the PNG.

## Credits

Bakery content and media come from [@b_for_baking](https://www.instagram.com/b_for_baking/). Instrument Serif and DM Sans are distributed under the accompanying font licences. The site uses GSAP, ScrollTrigger, and Three.js.
