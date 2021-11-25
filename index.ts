import * as github from '@actions/github'
import * as core from '@actions/core'
import * as artifact from '@actions/artifact'
import fs from 'fs'

type Follower = {
  databaseId: number
  login: string
  avatarUrl: string
  url: string
  name: string
}

type Response = {
  viewer: {
    followers: {
      totalCount: number
      pageInfo: {
        hasNextPage: boolean
        startCursor?: string
        endCursor?: string
      }
      nodes: Follower[]
    }
  }
}

const query = `
query($after: String) {
  viewer {
    followers(first: 100, after: $after) {
      nodes {
        databaseId
        name
        url
        avatarUrl
        login
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      totalCount
    }
  }
}
`

async function run() {
  const myToken = core.getInput('myToken', { required: true })
  const followerFile = 'followers.json'
  core.setSecret(myToken)
  const octokit = github.getOctokit(myToken)

  const followers: Follower[] = []
  let result: Response | undefined = undefined

  do {
    result = (await octokit.graphql(query, {
      after: result ? result.viewer.followers.pageInfo.endCursor : undefined,
    })) as Response

    followers.push(...result.viewer.followers.nodes)
  } while (result.viewer.followers.pageInfo.hasNextPage)

  fs.writeFileSync(followerFile, JSON.stringify(followers, null, 2))

  const artifactClient = artifact.create()
  const uploadResult = await artifactClient.uploadArtifact(
    'my-followers',
    [followerFile],
    '.',
  )
  core.info(
    `Uploaded ${uploadResult.artifactItems.join(', ')} to ${
      uploadResult.artifactName
    }`,
  )
}

run()
  .then(() => core.notice('job done'))
  .catch((e) => core.setFailed(e.message))
