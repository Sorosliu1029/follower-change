# Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single static landing page for the `follower-change` Action at https://follower-change.sorosliu.xyz, served by GitHub Pages from `main` → `/docs`.

**Architecture:** One hand-written `docs/index.html` (inline CSS + ~20 lines of inline JS), plus `CNAME`, `.nojekyll`, `favicon.svg`. A dependency-free Node script `design/check-site.mjs` is the test suite: it asserts the structural requirements of the spec against the files on disk. Visual checks use a throwaway Playwright screenshot run from the scratchpad (not added to the repo).

**Tech Stack:** HTML5, CSS custom properties, vanilla JS, Node 24 (`node:fs`, `node:assert`) for checks, GitHub Pages.

**Spec:** `design/specs/2026-10-22-product-page-design.md`

## Global Constraints

- Custom domain: `follower-change.sorosliu.xyz`; Pages source `main` / `/docs`.
- Action reference shown everywhere: `Sorosliu1029/follower-change@v2`.
- No `<script src>`, no `<link rel="stylesheet">`, no web fonts, no analytics, no images from other hosts.
- Page readable with JS disabled; copy buttons are the only JS.
- Light + dark via `prefers-color-scheme`; animation disabled under `prefers-reduced-motion`.
- 16px minimum side gutter; works at 375px; only code blocks/tables scroll horizontally.
- Palette tokens and copy exactly as spec §4–§5 (headline "Know who followed — and who left.").
- `docs/html-screenshot.jpg` must not move (README links it).

## Review Focus

1. Quick-start YAML drifting from the README example (users copy a broken workflow) → `check-site.mjs` asserts the page's YAML equals the README's block after stripping tags/entities.
2. Clipboard API unavailable (http, old Safari, permissions) → copy button must fall back to selecting the code; Task 3 verifies by stubbing `navigator.clipboard` to `undefined` in the Playwright run.
3. Narrow phones (375px) causing horizontal page scroll from the YAML block or diff card → Task 3 asserts `document.documentElement.scrollWidth <= innerWidth` at 375px.
4. Dark-mode contrast: tokens forgotten in the dark set leaving dark text on dark bg → Task 3 screenshots with `colorScheme: 'dark'` and checks every custom property used in `:root` light set is redefined in the dark block (asserted in `check-site.mjs`).
5. Dead in-page anchors / mistyped external URLs → `check-site.mjs` asserts every `href="#id"` has a matching `id`, and every external href is in an allowlist of known URLs.

---

### Task 1: Site skeleton + check script

**Files:**
- Create: `design/check-site.mjs`, `docs/CNAME`, `docs/.nojekyll`, `docs/favicon.svg`, `docs/index.html` (minimal shell)

**Interfaces:**
- Produces: `node design/check-site.mjs` → exits 0 and prints `ok N checks`, or exits 1 listing failed checks. Later tasks extend nothing in it; all assertions are written now and expected to fail until Task 2.

- [ ] **Step 1: Write `design/check-site.mjs`** with these assertions (each collected, not fail-fast):
  - `docs/CNAME` trimmed === `follower-change.sorosliu.xyz`; `docs/.nojekyll` exists; `docs/html-screenshot.jpg` exists.
  - `index.html` contains `<title>`, `meta name="description"`, `og:title`, `og:image` with `https://follower-change.sorosliu.xyz/html-screenshot.jpg`, `rel="canonical"`, `rel="icon"` → `favicon.svg`.
  - No `<script src`, no `rel="stylesheet"`, no `src="http`.
  - Contains ids: `quick-start`, `how-it-works`, `reference`, `output`, `faq`.
  - Every `href="#x"` has an element with `id="x"`.
  - External hrefs ⊆ allowlist: repo URL, `/issues`, `/blob/main/LICENSE`, Marketplace `https://github.com/marketplace/actions/github-follower-change-event`, `https://github.com/settings/tokens/new`, repo secrets docs URL from README, `https://github.com/Sorosliu1029/follower-change-email`, `https://github.com/dawidd6/action-send-mail`.
  - Text `Sorosliu1029/follower-change@v2` present.
  - YAML parity: element `<pre id="workflow-yaml">` text (tags stripped, `&lt; &gt; &amp; &quot; &#39;` decoded) === the first ```` ```yaml ```` block in `README.md`, both trimmed.
  - Every `--token:` declared in the first `:root{…}` block is also declared inside the `@media (prefers-color-scheme: dark)` block.
  - Every `<img>` has a non-empty `alt`.
- [ ] **Step 2: Create `docs/CNAME`, `docs/.nojekyll`, `docs/favicon.svg`** (16×16 viewBox user-check glyph, stroke `#30a14e`), and a shell `index.html` with only `<title>`.
- [ ] **Step 3: Run** `node design/check-site.mjs` — Expected: exit 1; CNAME/nojekyll/screenshot checks pass, page-content checks fail.
- [ ] **Step 4: Commit** `feat(site): scaffold docs/ site and check script`.

### Task 2: Page content and styles

**Files:**
- Modify: `docs/index.html`

**Interfaces:**
- Consumes: check script from Task 1.
- Produces: element hooks for Task 3 — `button.copy[data-copy-target="<id>"]` buttons; copy targets `#install-line` and `#workflow-yaml`; diff rows `.diff-row` (animated).

- [ ] **Step 1: Write the page** per spec §4 order (header, hero with diff card, `#how-it-works`, `#quick-start`, `#reference` inputs/outputs tables, `#output` screenshot in browser frame with fade, `#faq` with 4 `<details>`, footer), metadata per spec §7, tokens/type/grid pattern per spec §5. Diff card sample: header `followers  128 → 130`, rows `+ @octo-cat`, `+ @mona-dev`, `− @ghost-repo` with CSS-initial avatars (fictional handles). YAML block: README example verbatim inside `<pre id="workflow-yaml">` with `<span class="k|s|c">` colouring and a filename tab `.github/workflows/follower-notifier.yml`. Under-hero install chip `<code id="install-line">uses: Sorosliu1029/follower-change@v2</code>`.
- [ ] **Step 2: Run** `node design/check-site.mjs` — Expected: `ok` and exit 0.
- [ ] **Step 3: Commit** `feat(site): product page content and styles`.

### Task 3: Copy behaviour + visual/responsive verification

**Files:**
- Modify: `docs/index.html` (inline `<script>` at end of body)
- Scratch only: `$SCRATCHPAD/shots/shoot.mjs` (Playwright, not committed)

**Interfaces:**
- Consumes: `button.copy[data-copy-target]`, `#install-line`, `#workflow-yaml` from Task 2.

- [ ] **Step 1: Implement** a click handler: `navigator.clipboard?.writeText(target.innerText)`; on success set button text `Copied` for 1500ms then restore; if clipboard missing or the promise rejects, select the target's contents with `Range`/`Selection` and set text `Press ⌘C`.
- [ ] **Step 2: Write `shoot.mjs`** in the scratchpad: serve `docs/` with `python3 -m http.server`, then with Playwright (webkit or chromium) assert and capture:
  - at 375×812 and 1280×800, light and dark: full-page PNG; `scrollWidth <= innerWidth`.
  - clicking the YAML copy button with clipboard permission → button text `Copied`, clipboard text === `#workflow-yaml` innerText.
  - with `navigator.clipboard` deleted via `addInitScript` → button text `Press ⌘C` and `getSelection().toString()` non-empty.
  - `reducedMotion: 'reduce'` → `.diff-row` computed `animation-name` is `none`.
- [ ] **Step 3: Run** it — Expected: all assertions pass; review the 4 screenshots by eye for contrast, spacing, and broken layout; fix and re-run until clean.
- [ ] **Step 4: Run** `node design/check-site.mjs` — Expected: `ok`.
- [ ] **Step 5: Commit** `feat(site): copy buttons`.

### Task 4: Repo housekeeping

**Files:**
- Modify: `.github/workflows/check-dist.yml` (`paths-ignore` under both `push` and `pull_request`)
- Modify: `README.md` (line after the `# Follower Change` heading)

- [ ] **Step 1:** Add `'docs/**'` and `'design/**'` to both `paths-ignore` lists.
- [ ] **Step 2:** Add `🌐 Website: https://follower-change.sorosliu.xyz` under the README title.
- [ ] **Step 3: Verify** with `ruby -ryaml -e 'YAML.load_file(".github/workflows/check-dist.yml")'` — Expected: no error. Run `node design/check-site.mjs` — Expected: `ok` (README YAML unchanged).
- [ ] **Step 4: Commit** `chore: link website from README, skip dist check for site changes`.

### Task 5: Deploy

- [ ] **Step 1:** `git push origin main`.
- [ ] **Step 2:** Configure Pages: `gh api -X POST repos/Sorosliu1029/follower-change/pages -f 'source[branch]=main' -f 'source[path]=/docs'` (if it already exists, `-X PUT` with the same source plus `cname=follower-change.sorosliu.xyz`). If the API refuses (permissions), stop and ask the user to set it in Settings → Pages.
- [ ] **Step 3:** `dig +short follower-change.sorosliu.xyz CNAME` — Expected: `sorosliu1029.github.io.`; if empty, tell the user the exact record to add.
- [ ] **Step 4:** Poll `gh api repos/Sorosliu1029/follower-change/pages/builds/latest --jq .status` until `built`; then `curl -sI https://follower-change.sorosliu.xyz` — Expected: `HTTP/2 200`. Enable HTTPS enforcement via `gh api -X PUT …/pages -F https_enforced=true` once the certificate exists.
- [ ] **Step 5:** Report the live URL and any remaining user actions.
