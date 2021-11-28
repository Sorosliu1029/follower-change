import { Context } from '@actions/github/lib/context'
import type { Follower } from '..'
import { timeFromNow } from './utils'

export function toMarkdown(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let markdown = `## You"ve got ${followers.length} new follower${
    followers.length > 1 ? 's' : ''
  } in last ${timeFromNow(snapshotAt)} 🎉
  ${
    unfollowers.length
      ? `### But ${unfollowers.length} user${
          unfollowers.length > 1 ? 's' : ''
        } unfollowed you 😢`
      : ''
  }
  ### Now you have ${totalCount} followers in total 🥳`

  const userMarkdown = (follower: Follower) =>
    `- [${follower.name || follower.login}](${follower.url})`

  if (followers.length) {
    markdown += `\n## New followers\n${followers.map(userMarkdown).join('\n')}`
  } else if (unfollowers.length) {
    markdown += '\n## No new followers'
  }

  if (unfollowers.length) {
    markdown += `\n## Unfollowers\n${unfollowers.map(userMarkdown).join('\n')}`
  }

  return markdown
}
