const fetch = require('node-fetch')

const BASE = 'https://circleci.com/api/v1.1/project/github/DataBiosphere/terra-ui'

const findBuild = async () => {
  const jobs = await fetch(`${BASE}/tree/dev?filter=successful`).then(r => r.json())
  const latest = jobs.find(j => j.workflows && j.workflows.job_name === 'build')
  const artifacts = await fetch(`${BASE}/${latest.build_num}/artifacts`).then(r => r.json())
  console.log(artifacts[0].url)
}

findBuild()
