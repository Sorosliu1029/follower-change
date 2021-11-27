import * as github from '@actions/github'
import * as core from '@actions/core'
import * as artifact from '@actions/artifact'
import AdmZip from 'adm-zip'
import fs from 'fs'
import * as outputUtils from './output-utils'

export type Follower = {
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

type JsonStructure = { snapshotAt: Date; followers: Follower[] }

async function getFollowersFromGitHub(
  octokit: ReturnType<typeof github.getOctokit>,
  writeToFile: string,
): Promise<{ followers: Follower[]; totalCount: number }> {
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

  const j: JsonStructure = { snapshotAt: new Date(), followers }
  await fs.promises.writeFile(writeToFile, JSON.stringify(j, null, 2), 'utf8')

  return {
    followers,
    totalCount: result ? result.viewer.followers.totalCount : 0,
  }
}

async function getSnapshotFollowers(
  octokit: ReturnType<typeof github.getOctokit>,
  artifactName: string,
  followerFile: string,
): Promise<{ snapshotAt?: Date; followers: Follower[]; isFirstRun: boolean }> {
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
      return { followers: [], isFirstRun: true }
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
      return { followers: [], isFirstRun: false }
    }

    const j: JsonStructure = JSON.parse(entry.getData().toString('utf8'))
    if (!('snapshotAt' in j && 'followers' in j)) {
      throw new Error('Invalid snapshot file')
    }
    return {
      snapshotAt: new Date(j.snapshotAt),
      followers: j.followers,
      isFirstRun: false,
    }
  } catch (error) {
    core.error(error as Error)
  }

  return { followers: [], isFirstRun: false }
}

async function uploadFollowerFile(
  client: artifact.ArtifactClient,
  artifactName: string,
  file: string,
): Promise<void> {
  const uploadResult = await client.uploadArtifact(artifactName, [file], '.')
  core.info(
    `Uploaded ${uploadResult.artifactItems.join(', ')} to ${
      uploadResult.artifactName
    }`,
  )
}

function getFollowersChange(
  previous: Follower[],
  current: Follower[],
): { followers: Follower[]; unfollowers: Follower[] } {
  const previousMap = new Map(
    previous.map((follower) => [follower.databaseId, follower]),
  )
  const currentMap = new Map(
    current.map((follower) => [follower.databaseId, follower]),
  )

  const followers = current.filter(
    (follower) => !previousMap.has(follower.databaseId),
  )
  const unfollowers = previous.filter(
    (follower) => !currentMap.has(follower.databaseId),
  )
  return { followers, unfollowers }
}

async function run() {
  const myToken = core.getInput('myToken', { required: true })
  core.setSecret(myToken)

  const followerArtifactName = 'my-followers'
  const followerFile = 'followers.json'

  const octokit = github.getOctokit(myToken)
  const artifactClient = artifact.create()

  const {
    snapshotAt,
    followers: previousFollowers,
    isFirstRun,
  } = await getSnapshotFollowers(octokit, followerArtifactName, followerFile)

  const { followers: currentFollowers, totalCount } =
    await getFollowersFromGitHub(octokit, followerFile)

  await uploadFollowerFile(artifactClient, followerArtifactName, followerFile)

  const { followers, unfollowers } = getFollowersChange(
    previousFollowers,
    currentFollowers,
  )
  core.info(
    `Follower change: \u001b[38;5;10m${followers.length} new followers, \u001b[38;5;11m${unfollowers.length} unfollowers`,
  )

  const changed = followers.length > 0 || unfollowers.length > 0
  core.info(`Changed: ${changed}`)

  const shouldNotify = changed && !isFirstRun
  core.info(`Should notify: ${shouldNotify}`)

  core.setOutput('changed', changed)
  core.setOutput('shouldNotify', shouldNotify)
  core.setOutput(
    'markdown',
    outputUtils.toMarkdown(
      github.context.repo.owner,
      snapshotAt,
      totalCount,
      followers,
      unfollowers,
    ),
  )
  core.setOutput(
    'plainText',
    outputUtils.toPlainText(
      github.context.repo.owner,
      snapshotAt,
      totalCount,
      followers,
      unfollowers,
    ),
  )
  core.setOutput(
    'html',
    outputUtils.toHtml(
      github.context.repo.owner,
      snapshotAt,
      totalCount,
      followers,
      unfollowers,
    ),
  )
}

run()
  .then(() => core.notice('Get follower change, done'))
  .catch((e) => core.setFailed(e.message))
