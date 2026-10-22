// Structural checks for the static site in docs/. Run: node design/check-site.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docs = path.join(root, 'docs')
const read = (p) => fs.readFileSync(p, 'utf8')
const exists = (p) => fs.existsSync(path.join(docs, p))

const SITE = 'https://follower-change.sorosliu.xyz'
const REPO = 'https://github.com/Sorosliu1029/follower-change'
const ALLOWED_EXTERNAL = new Set([
  REPO,
  `${REPO}/issues`,
  `${REPO}/blob/main/LICENSE`,
  'https://github.com/marketplace/actions/github-follower-change-event',
  'https://github.com/settings/tokens/new',
  'https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository',
  'https://github.com/Sorosliu1029/follower-change-email',
  'https://github.com/dawidd6/action-send-mail',
])

const failures = []
let count = 0
const check = (name, ok) => {
  count++
  if (!ok) failures.push(name)
}

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

check('CNAME is the custom domain', exists('CNAME') && read(path.join(docs, 'CNAME')).trim() === 'follower-change.sorosliu.xyz')
check('.nojekyll exists', exists('.nojekyll'))
check('html-screenshot.jpg still in docs/', exists('html-screenshot.jpg'))
check('favicon.svg exists', exists('favicon.svg'))

const html = exists('index.html') ? read(path.join(docs, 'index.html')) : ''
check('index.html exists', html.length > 0)

check('has <title>', /<title>[^<]+<\/title>/.test(html))
check('has meta description', /<meta name="description" content="[^"]+"/.test(html))
check('has og:title', /property="og:title"/.test(html))
check('og:image is absolute screenshot URL', html.includes(`property="og:image" content="${SITE}/html-screenshot.jpg"`))
check('has canonical', html.includes(`rel="canonical" href="${SITE}/"`))
check('icon is favicon.svg', /<link rel="icon"[^>]*href="favicon\.svg"/.test(html))

check('no external scripts', !/<script[^>]+src=/.test(html))
check('no external stylesheets', !/rel="stylesheet"/.test(html))
check('no remote src', !/src="https?:/.test(html))

for (const id of ['quick-start', 'how-it-works', 'reference', 'output', 'faq']) {
  check(`section #${id} exists`, html.includes(`id="${id}"`))
}

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))
for (const [, a] of html.matchAll(/href="#([^"]*)"/g)) {
  check(`anchor #${a} resolves`, ids.has(a))
}

for (const [, href] of html.matchAll(/<a\b[^>]*href="(https?:[^"]+)"/g)) {
  check(`external link allowed: ${href}`, ALLOWED_EXTERNAL.has(href.replace(/&amp;/g, '&')))
}

check('mentions Sorosliu1029/follower-change@v2', html.includes('Sorosliu1029/follower-change@v2'))

const readmeYaml = (read(path.join(root, 'README.md')).match(/```yaml\n([\s\S]*?)```/) || [])[1] || ''
const pageYaml = (html.match(/<pre id="workflow-yaml"[^>]*>([\s\S]*?)<\/pre>/) || [])[1]
check('README has a yaml block', readmeYaml.trim().length > 0)
check('page workflow YAML matches README', pageYaml !== undefined && decode(pageYaml).trim() === readmeYaml.trim())

const lightRoot = (html.match(/:root\s*\{([\s\S]*?)\}/) || [])[1] || ''
const darkBlock = (html.match(/@media \(prefers-color-scheme: dark\)\s*\{([\s\S]*?)\}\s*\}/) || [])[1] || ''
const tokens = [...lightRoot.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])
check('light theme declares tokens', tokens.length > 0)
for (const t of tokens) {
  if (t.startsWith('--c-')) check(`dark theme redefines ${t}`, new RegExp(`${t}\\s*:`).test(darkBlock))
}

const prose = html.replace(/<pre id="workflow-yaml"[\s\S]*?<\/pre>/, '')
for (const secret of ['MY_TOKEN', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'TO_EMAIL_ADDRESS']) {
  check(`quick start prose names secret ${secret}`, prose.includes(secret))
}
check('quick start prose mentions changing server_address', prose.includes('server_address'))

const [, before, after] = html.match(/(\d+) → (\d+)/) || []
const adds = (html.match(/<span class="add">\+(\d+)<\/span>/) || [])[1]
const dels = (html.match(/<span class="del">−(\d+)<\/span>/) || [])[1]
const others = (html.match(/<b>(\d+) others<\/b>/) || [])[1]
check('hero diff: before + adds − dels = after', +before + +adds - +dels === +after)
check('hero diff: others = before − dels', +others === +before - +dels)

const notifyRow = (html.match(/<td><code>shouldNotify<\/code><\/td><td>([\s\S]*?)<\/td>/) || [])[1] || ''
check('shouldNotify description mentions notifyUnFollowEvent', notifyRow.includes('notifyUnFollowEvent'))
check('FAQ does not claim shouldNotify is false on first run', !html.includes('<code>shouldNotify</code> is false on that run'))

for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
  // empty alt is allowed for decorative images; a missing alt is not
  check(`img has alt: ${img.slice(0, 60)}`, /\balt="[^"]*"/.test(img))
}

if (failures.length) {
  console.log(`FAIL ${failures.length}/${count} checks:`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log(`ok ${count} checks`)
