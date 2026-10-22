# Product page for `follower-change` — Design Spec

Date: 2026-10-22 · Status: draft for review

## 1. Goal

A single landing page at **https://follower-change.sorosliu.xyz** that explains what the
`Sorosliu1029/follower-change` GitHub Action does and gets a visitor from "what is this?" to
"workflow file copied into my repo" in under two minutes.

**Audience:** GitHub users (often maintainers of a profile README repo) who want to be told when
someone follows or unfollows them. They know what a GitHub Action and a cron workflow are.

**Success criteria**
- Page is served at the custom domain over HTTPS from `main` → `/docs`.
- The quick-start YAML on the page is identical in substance to the README example and can be
  copied with one click.
- Renders well at 375px phone width and on desktop, in both light and dark OS themes.
- No build step, no runtime third-party requests (works offline once loaded, no trackers).

## 2. Decisions (agreed)

| Topic | Decision |
|---|---|
| Hosting | GitHub Pages, "Deploy from a branch", `main`, folder `/docs` |
| Visual direction | GitHub-native dev-tool feel: system UI + monospace accents, GitHub's green contribution-graph palette, respects `prefers-color-scheme` |
| Tech | One hand-written `docs/index.html` with inline CSS and a few lines of inline JS. No framework, no bundler, no web fonts, no analytics |
| Spec/plan location | `design/` at repo root (not `docs/`, which is now public) |

## 3. File layout

```
docs/
  index.html            # the page (new)
  CNAME                 # "follower-change.sorosliu.xyz" (new)
  .nojekyll             # serve files as-is, skip Jekyll (new)
  favicon.svg           # user-check glyph in green, matches action.yml branding (new)
  html-screenshot.jpg   # existing; reused on the page, still referenced by README
design/
  specs/…               # this file
  plans/…               # implementation plan (next step)
```

`docs/html-screenshot.jpg` stays where it is so the README image link keeps working.

## 4. Page content (top to bottom)

1. **Header bar** – wordmark `follower-change` (monospace) with favicon glyph; right side links:
   "Docs" (anchor to quick start), "GitHub" (repo), "Marketplace".
2. **Hero**
   - Headline: "Know who followed — and who left."
   - Sub: "A GitHub Action that diffs your followers on a schedule and hands you the change as
     HTML, Markdown or plain text — ready to email, post or log."
   - Primary CTA: "Get started" → `#quick-start`. Secondary: "View on GitHub".
   - Install chip: `uses: Sorosliu1029/follower-change@v2` with copy button.
   - **Visual:** a mock "follower diff" card styled like a GitHub diff — green `+` rows for new
     followers, red `−` rows for unfollows, with avatar circles (pure CSS initials, no real
     users' images) and a header like `followers  128 → 130`. Static, with a subtle one-time
     row reveal animation, disabled under `prefers-reduced-motion`.
3. **How it works** – four numbered steps in a row (stack on mobile), mirroring the README:
   fetch current followers via GraphQL → download previous snapshot artifact → diff →
   upload new snapshot. One line under it: "Not realtime — GitHub has no follow event, so run it
   on a cron."
4. **Quick start** (`id="quick-start"`) – 3 short steps:
   1. Create a personal access token with `read:user` and `repo` scopes (link to
      github.com/settings/tokens/new).
   2. Save it as repository secret `MY_TOKEN`.
   3. Add `.github/workflows/follower-notifier.yml` — the README's full example YAML in a code
      block with a filename tab and **Copy** button. Light hand-rolled syntax colouring
      (keys / strings / comments) done with static `<span>`s, no highlighter library.
5. **Inputs & outputs** – two compact tables taken verbatim from `action.yml` / README:
   inputs `myToken` (required), `notifyUnFollowEvent` (default `false`); outputs `changed`,
   `shouldNotify`, `htmlFilePath`, `markdown`, `plainText`.
6. **What you receive** – the existing email screenshot in a browser-frame mock, cropped via
   CSS to a fixed-height window with fade-out (image is 1228×2438), caption crediting
   `follower-change-email`. Beside it, short bullets: HTML for email, Markdown for issues /
   Slack, plain text for logs.
7. **FAQ** (native `<details>`):
   - Is it realtime? — No; cron. Daily is typical.
   - Why no notification on the first run? — No previous snapshot to compare against.
   - Why does the token need `repo`? — To read the previous run's snapshot artifact.
   - Where is my follower data stored? — Only as an Actions artifact in your own repo.
8. **Footer** – MIT license, "Made by Soros Liu", links to repo, issues, Marketplace.

All copy is English. The version shown is `@v2`.

## 5. Visual system

- Colors as CSS custom properties with a light set and a dark set (`prefers-color-scheme`).
  Light ≈ GitHub Primer light (bg `#ffffff`, fg `#1f2328`, muted `#59636e`, border `#d1d9e0`);
  dark ≈ Primer dark (bg `#0d1117`, fg `#e6edf3`, border `#30363d`).
  Accent green ramp `#9be9a8 / #40c463 / #30a14e / #216e39`; removal red `#cf222e` (light),
  `#f85149` (dark).
- Type: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
  code/wordmark `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
- A faint contribution-graph grid pattern behind the hero (CSS gradients, no image).
- Max content width ~1080px, 16px minimum side gutter; code blocks scroll horizontally inside
  their own container; page body never scrolls sideways.

## 6. Behaviour (JS)

- Copy buttons: `navigator.clipboard.writeText`, label flips to "Copied" for 1.5s; on failure,
  selects the code text so the user can ⌘C.
- Nothing else. Page is fully readable with JS disabled.

## 7. Metadata

`<title>follower-change — GitHub follower notifications</title>`, meta description, Open Graph
/ Twitter tags (title, description, url, image = absolute URL of `html-screenshot.jpg`),
`<link rel="icon" href="favicon.svg">`, canonical URL.

## 8. Repo housekeeping

- `check-dist.yml` runs on every push except `**.md`; add `docs/**` and `design/**` to its
  `paths-ignore` so page-only commits don't rebuild `dist/`.
- README: add a "Website" link to the custom domain near the top.

## 9. Deployment

1. Commit to `main` and push.
2. Pages settings: Source "Deploy from a branch", branch `main`, folder `/docs`
   (set via `gh api` if permissions allow; otherwise you click it in the UI).
3. Custom domain `follower-change.sorosliu.xyz` (also recorded by `docs/CNAME`), then
   "Enforce HTTPS" once the certificate is issued.
4. DNS (you, at your registrar): `CNAME follower-change → sorosliu1029.github.io`.
   I'll verify with `dig` and report if it's missing.

## 10. Verification

- Local: `python3 -m http.server -d docs`, check at 375px and 1280px, light + dark, keyboard
  focus visible, copy buttons work.
- HTML sanity: no broken internal anchors; all external links point to real URLs.
- Live: `curl -I https://follower-change.sorosliu.xyz` returns 200 after Pages builds.

## 11. Out of scope

Analytics, i18n, a blog/changelog, live follower demo using the GitHub API, generated OG image,
any change to the Action's code.
