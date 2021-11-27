import type { Follower } from '.'

export function toMarkdown(
  snapshotAt: Date | undefined,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let markdown = `# You have ${totalCount} followers now`

  const userMarkdown = (follower: Follower) =>
    `- [${follower.name || follower.login}](${follower.url})`

  if (followers.length) {
    markdown += `\n### New followers\n${followers.map(userMarkdown).join('\n')}`
  } else {
    markdown += '\n### No new followers'
  }

  if (unfollowers.length) {
    markdown += `\n### Unfollowers\n${unfollowers.map(userMarkdown).join('\n')}`
  }

  if (snapshotAt && (followers.length || unfollowers.length)) {
    markdown += `\nChanges since ${snapshotAt.toISOString()}`
  }

  return markdown
}

export function toPlainText(
  snapshotAt: Date | undefined,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let text = `You have ${totalCount} followers now`
  const userText = (follower: Follower) =>
    `- ${follower.name || follower.login} (${follower.url})`

  if (followers.length) {
    text += `\nNew followers:\n${followers.map(userText).join('\n')}`
  } else {
    text += '\nNo new followers'
  }

  if (unfollowers.length) {
    text += `\nUnfollowers:\n${unfollowers.map(userText).join('\n')}`
  }

  if (snapshotAt && (followers.length || unfollowers.length)) {
    text += `\nChanges since ${snapshotAt.toISOString()}`
  }

  return text
}

export function toHtml(
  snapshotAt: Date | undefined,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let html = `<h1>You have ${totalCount} followers now</h1>`

  const userHtml = (follower: Follower) =>
    `<li><a href="${follower.url}">${follower.name || follower.login}</a></li>`

  if (followers.length) {
    html += `<h2>New followers</h2><ul>${followers.map(userHtml).join('')}</ul>`
  } else {
    html += '<h2>No new followers</h2>'
  }

  if (unfollowers.length) {
    html += `<h2>Unfollowers</h2><ul>${unfollowers.map(userHtml).join('')}</ul>`
  }

  if (snapshotAt && (followers.length || unfollowers.length)) {
    html += `<p>Changes since ${snapshotAt.toISOString()}</p>`
  }

  return html
}
