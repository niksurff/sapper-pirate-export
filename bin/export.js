#! /usr/bin/env node

const sapperPirateExport = require("../")

const startTime = new Date()
sapperPirateExport()
  .then(() => {
    const secondsSince = (new Date() - startTime) / 1000
    console.log(`Done after ${secondsSince} seconds.`)
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
