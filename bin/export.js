#! /usr/bin/env node

const sapperPirateExport = require("../")

sapperPirateExport()
  .then(() => {
    console.log("Done.")
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
