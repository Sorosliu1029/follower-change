import { Context } from '@actions/github/lib/context'
import type { Follower } from '..'
import { timeFromNow } from './utils'

export function toPlainText(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): string {
  let text = `You"ve got ${followers.length} new follower${
    followers.length > 1 ? 's' : ''
  } in last ${timeFromNow(snapshotAt)} 🎉\n
  ${
    unfollowers.length
      ? `But ${unfollowers.length} user${
          unfollowers.length > 1 ? 's' : ''
        } unfollowed you 😢\n`
      : ''
  }
  Now you have ${totalCount} followers in total 🥳\n`

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

  return text
}
