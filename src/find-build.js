const fetch = require('node-fetch')

const base = 'https://circleci.com/api'
const projectSlug = 'gh/DataBiosphere/terra-ui'
const buildArtifactPath = 'build.tgz'

const findBuild = async () => {
  const workflows = await fetch(`${base}/v2/insights/${projectSlug}/workflows/build-deploy?branch=dev`).then(r => r.json()).then(o => o.items)
  const latestWorkflow = workflows.find(w => w.status === 'success')

  const workflow = await fetch(`${base}/v2/workflow/${latestWorkflow.id}`).then(r => r.json())
  const pipeline = await fetch(`${base}/v2/pipeline/${workflow.pipeline_id}`).then(r => r.json())
  const revision = pipeline.vcs.revision

  const workflowJobs = await fetch(`${base}/v2/workflow/${latestWorkflow.id}/job`).then(r => r.json()).then(o => o.items)
  const buildJob = workflowJobs.find(j => j.name === 'build' && j.status === 'success')

  // CircleCI now requires a token to list artifacts, even for public projects.
  // CIRCLECI_TOKEN is a terra-ui project API token (Read Only), which only API v1.x accepts.
  const jobArtifacts = await fetch(`${base}/v1.1/project/${projectSlug}/${buildJob.job_number}/artifacts`, { headers: { 'Circle-Token': process.env.CIRCLECI_TOKEN } }).then(r => r.json());
  const buildArtifact = jobArtifacts.find(artifact => artifact.path === buildArtifactPath)
  const artifactUrl = buildArtifact.url

  const buildInfo = { artifactUrl, revision }
  console.log(JSON.stringify(buildInfo, null, 2))
}

findBuild()
