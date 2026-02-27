/**
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'

const projectId = "g6ztk4dk"
const dataset = "production"

export default defineCliConfig({
  api: {
    projectId,
    dataset, 
  },
  deployment: {
    appId: 'fm2dsh6udu5xx8wrps8q8v8h',
  },
})