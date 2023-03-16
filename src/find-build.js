const fetch = require('node-fetch')

const base = 'https://circleci.com/api/v2'
const projectSlug = 'gh/DataBiosphere/terra-ui'
const buildArtifactPath = 'build.tgz'

const delay = t => new Promise(resolve => setTimeout(resolve, t * 1000))

const fetchCircleCI = async (path, opts = {}) => {
  const { maxRetries = 5 } = opts

  let response = await fetch(`${base}/${path}`)
  let nRequests = 1

  while (!response.ok && nRequests < maxRetries) {
    await delay(nRequests)
    response = await fetch(`${base}/${path}`)
    nRequests += 1
  }

  if (response.ok) {
    const responseContent = await response.json()
    return responseContent
  } else {
    const responseContent = await response.text()
    throw new Error(`CircleCI request failed: ${responseContent}`)
  }
}

const findBuild = async () => {
  const workflows = await fetchCircleCI(`insights/${projectSlug}/workflows/build-deploy?branch=dev`).then(o => o.items)
  const latestWorkflow = workflows.find(w => w.status === 'success')

  const workflow = await fetchCircleCI(`workflow/${latestWorkflow.id}`)
  const pipeline = await fetchCircleCI(`pipeline/${workflow.pipeline_id}`)
  const revision = pipeline.vcs.revision

  const workflowJobs = await fetchCircleCI(`workflow/${latestWorkflow.id}/job`).then(o => o.items)
  const buildJob = workflowJobs.find(j => j.name === 'build' && j.status === 'success')

  const jobArtifacts = await fetchCircleCI(`project/${projectSlug}/${buildJob.job_number}/artifacts`).then(o => o.items)
  const buildArtifact = jobArtifacts.find(artifact => artifact.path === buildArtifactPath)
  const artifactUrl = buildArtifact.url

  const buildInfo = { artifactUrl, revision }
  console.log(JSON.stringify(buildInfo, null, 2))
}

findBuild()
