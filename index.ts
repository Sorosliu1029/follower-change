import * as github from '@actions/github'
import * as core from '@actions/core'
import * as artifact from '@actions/artifact'
import AdmZip from 'adm-zip'
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

async function getFollowersFromGitHub(
  octokit: ReturnType<typeof github.getOctokit>,
  writeToFile: string,
): Promise<Follower[]> {
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

  const followers: Follower[] = []
  let result: Response | undefined = undefined

  do {
    result = (await octokit.graphql(query, {
      after: result ? result.viewer.followers.pageInfo.endCursor : undefined,
    })) as Response

    followers.push(...result.viewer.followers.nodes)
  } while (result.viewer.followers.pageInfo.hasNextPage)

  await fs.promises.writeFile(
    writeToFile,
    JSON.stringify(followers, null, 2),
    'utf8',
  )

  return followers
}

async function getPreviousFollowers(
  octokit: ReturnType<typeof github.getOctokit>,
  artifactName: string,
  followerFile: string,
): Promise<Follower[]> {
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  try {
    const listArtifactsResp = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/artifacts',
      {
        owner,
        repo,
        per_page: 10,
        page: 1,
      },
    )

    const latestArtifact = listArtifactsResp.data.artifacts
      .filter((a) => a.name === artifactName)
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }
        return a.id - b.id
      })
      .pop()

    if (!latestArtifact) {
      return []
    }

    core.info(`Latest artifact: ${latestArtifact?.id}`)

    const downloadResp = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}',
      {
        owner,
        repo,
        artifact_id: latestArtifact.id,
        archive_format: 'zip',
      },
    )

    const adm = new AdmZip(Buffer.from(downloadResp.data as ArrayBuffer))
    const entry = adm.getEntry(followerFile)
    if (!entry) {
      return []
    }

    return JSON.parse(entry.getData().toString('utf8'))
  } catch (error) {
    core.error(error as Error)
  }

  return []
}

async function uploadFollowerFile(
  client: artifact.ArtifactClient,
  artifactName: string,
  file: string,
): Promise<void> {
  const uploadResult = await client.uploadArtifact(artifactName, [file], '.', {
    retentionDays: 30,
  })
  core.info(
    `Uploaded ${uploadResult.artifactItems.join(', ')} to ${
      uploadResult.artifactName
    }`,
  )
}

function getFollowersChange(
  previous: Follower[],
  current: Follower[],
): { newFollow: Follower[]; unfollowed: Follower[] } {
  const previousMap = new Map(
    previous.map((follower) => [follower.databaseId, follower]),
  )
  const currentMap = new Map(
    current.map((follower) => [follower.databaseId, follower]),
  )

  const newFollow = current.filter(
    (follower) => !previousMap.has(follower.databaseId),
  )
  const unfollowed = previous.filter(
    (follower) => !currentMap.has(follower.databaseId),
  )
  return { newFollow, unfollowed }
}

async function run() {
  const myToken = core.getInput('myToken', { required: true })
  core.setSecret(myToken)

  const followerArtifactName = 'my-followers'
  const followerFile = 'followers.json'

  const octokit = github.getOctokit(myToken)
  const artifactClient = artifact.create()

  const previousFollowers = await getPreviousFollowers(
    octokit,
    followerArtifactName,
    followerFile,
  )

  const currentFollowers = await getFollowersFromGitHub(octokit, followerFile)
  await uploadFollowerFile(artifactClient, followerArtifactName, followerFile)

  const { newFollow, unfollowed } = getFollowersChange(
    previousFollowers,
    currentFollowers,
  )
  core.info(
    `New followers: ${newFollow.length}, unfollowed: ${unfollowed.length}`,
  )
}

run()
  .then(() => core.notice('job done'))
  .catch((e) => core.setFailed(e.message))
