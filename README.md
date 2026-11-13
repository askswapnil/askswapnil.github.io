# askswapnil.github.io: "Untangled"

The personal site of Swapnil Mishra (IIM Nagpur MBA, 2026). One ink line runs through the whole page: a tangle in the hero that straightens into clean right-angle routing as you scroll, lights each chapter node, and ends on the "Book a call" button.

Plain HTML, CSS and JavaScript. No build step, no framework, no trackers.

## Files

| Path | What it is |
|---|---|
| `index.html` | All page copy: headlines, case files, story, audit questions |
| `css/style.css` | Design tokens (colours, type) at the top, then every section |
| `js/content.js` | **Edit me:** contact links, pricing, chapter teasers, persona ordering, Leak Audit logic |
| `js/thread.js` | Thread engine: tangle generator, rounded orthogonal routing, morphing |
| `js/main.js` | Page behaviour: scroll-drawn spine, case-file diagrams, Up-next pill, Leak Audit, persona chips |
| `404.html`, `robots.txt`, `sitemap.xml`, `.nojekyll`, `favicon.svg` | GitHub Pages plumbing |
| `assets/og-image.png` | 1200x630 share image, rendered from `docs/og-source.html` |

## Editing content

- **Contact details, booking link, pricing:** change the values in `js/content.js`. Any value still in `[SQUARE_BRACKETS]` is a placeholder. Buttons pointing at a placeholder show a short "not set yet" note instead of a broken link, and placeholder prices render as dashed chips. See `TODO.md` for the full list.
- **Words on the page:** edit `index.html` directly. Each chapter is a `<section>` with a comment header (`<!-- 03 CASE FILES -->`).
- **Case-file diagrams:** the node labels (before and after) live in `DIAGRAMS` near the middle of `js/main.js`. `a` is the after label, `b` the before label.
- **Leak Audit wording and logic:** the leak names, the estimate inputs and the offer descriptions are in `CONTENT.audit` in `js/content.js`. The estimate is deliberately simple and explained on the report itself (touches ≈ people × 2; rework from the frequency answer).
- **Up-next teasers:** `CONTENT.chapters` in `js/content.js`.

## Run it locally

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. To preview the reduced-motion version without changing your OS setting, open <http://localhost:5173/?rm=1>.

## Re-render the share image

Start the local server, then:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=6000 --screenshot="%CD%\assets\og-image.png" http://localhost:5173/docs/og-source.html
```

## Deploy (only after Swapnil says go)

1. Fill every placeholder in `TODO.md` (booking link, email and LinkedIn are set; the three prices are still open).
2. Create a **public** repo named exactly `askswapnil.github.io` under the `askswapnil` account.
3. **Check `.gitignore` first.** The private working notes (`HANDOVER_PORTFOLIO.md`, `docs/HANDOVER_PORTFOLIO.md`, `docs/BUILD_BRIEF_FOR_OPUS.md`, `CLAUDE.md`, `.claude/`) name clients and internal details. GitHub Pages would publish anything you push, so they must stay out of the repo. Run `git status` after `git add` and make sure they are not listed.
4. Push to `main`. In the repo's Settings → Pages, set the source to "Deploy from a branch", `main`, `/ (root)`.
5. The site appears at `https://askswapnil.github.io` within a minute or two. Check the share preview with LinkedIn's Post Inspector.

## Design notes

- Type: Fraunces (display), Inter Tight (UI), JetBrains Mono (labels and numbers), from Google Fonts with `display=swap`.
- Colour: warm paper, deep ink, one saffron accent (from the IIM Nagpur crest's sunburst), teal only for the route motif. A dark palette follows the OS setting.
- Motion is scroll-linked with native scrolling (no scroll-jacking). With `prefers-reduced-motion`, the hero tangle stays still, the spine is drawn in full, diagrams show their "after" state (the sliders still work) and counters show final values.
- The IIM Nagpur crest is the supplied 332x112 JPEG, shown small on a white chip as a credential only. A footer line says the institute does not endorse the site.
