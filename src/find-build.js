const fetch = require('node-fetch')

const base = 'https://circleci.com/api/v2'
const projectSlug = 'gh/DataBiosphere/terra-ui'

const findBuild = async () => {
  const workflows = await fetch(`${base}/insights/${projectSlug}/workflows/build-deploy?branch=dev`).then(r => r.json()).then(o => o.items)
  const latestWorkflow = workflows.find(w => w.status === 'success')

  const workflowJobs = await fetch(`${base}/workflow/${latestWorkflow.id}/job`).then(r => r.json()).then(o => o.items)
  const buildJob = workflowJobs.find(j => j.name === 'build' && j.status === 'success')

  const jobArtifacts = await fetch(`${base}/project/${projectSlug}/${buildJob.job_number}/artifacts`).then(r => r.json()).then(o => o.items)
  console.log(jobArtifacts[0].url)
}

findBuild()
