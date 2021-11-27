import type { Follower } from '.'

export function toMarkdown(
  myGitHubLoginId: string,
  snapshotAt: Date | undefined,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let markdown = `# You have ${totalCount} followers now. [Go to followers page](https://github.com/${myGitHubLoginId}?tab=followers)`

  const userMarkdown = (follower: Follower) =>
    `- [${follower.name || follower.login}](${follower.url})`

  if (followers.length) {
    markdown += `\n### New followers\n${followers.map(userMarkdown).join('\n')}`
  } else if (unfollowers.length) {
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
  myGitHubLoginId: string,
  snapshotAt: Date | undefined,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let text = `You have ${totalCount} followers now. Go to followers page: https://github.com/${myGitHubLoginId}?tab=followers`
  const userText = (follower: Follower) =>
    `- ${follower.name || follower.login} (${follower.url})`

  if (followers.length) {
    text += `\nNew followers:\n${followers.map(userText).join('\n')}`
  } else if (unfollowers.length) {
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
  myGitHubLoginId: string,
  snapshotAt: Date | undefined,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let html = `<h1>You have ${totalCount} followers now. <a href="https://github.com/${myGitHubLoginId}?tab=followers">Go to followers page</a></h1>`

  const userHtml = (follower: Follower) =>
    `<li>
      <a href="${follower.url}">
        <img src="${follower.avatarUrl}" width="50" height="50"
          style="border-radius: 50% !important;box-shadow: 0 0 0 1px">
      </a>
      <a href="${follower.url}">${follower.name || follower.login}</a>
    </li>`

  if (followers.length) {
    html += `<h2>New followers</h2><ul>${followers.map(userHtml).join('')}</ul>`
  } else if (unfollowers.length) {
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
