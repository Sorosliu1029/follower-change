import * as Maizzle from '@maizzle/framework'

import { Context } from '@actions/github/lib/context'
import type { Follower } from '..'
import { timeFromNow } from './utils'

export async function toHtmlFile(
  githubContext: Context,
  snapshotAt: Date,
  totalCount: number,
  followers: Follower[],
  unfollowers: Follower[],
): Promise<string> {
  return ''
}
