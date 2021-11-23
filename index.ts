import github from '@actions/github'
import core from '@actions/core'

const query = `query { 
  viewer { 
    followers(first: 100) {
      nodes {
        databaseId
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      totalCount
    }
  }
}`



async function run() {
  const myToken = core.getInput('myToken')

  const octokit = github.getOctokit(myToken)

  const result = await octokit.graphql(query, {})

  console.log(result)
}

run()
