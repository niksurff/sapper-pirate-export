#! /usr/bin/env node
const path = require("path")
const sapperPirateExport = require("../")
const startTime = new Date()
const cwd = process.cwd()
const pkg = require("../package")

const s = num => " ".repeat(Math.max(num, 0))
const pad = str =>
  str.length > 33 ? str.substr(0, 33) + "..." + s(4) : str + s(40 - str.length)
const log =
  process.env.DEBUG && process.env.DEBUG.includes(pkg.name)
    ? () => null
    : console.log.bind(console)

// theres probably easier ways ( i.e. no internet :o )
console.log(`Exporting like a PIRATE...\n`)
log(s(4) + "PATH" + s(30) + "=>" + s(4) + "FILE" + "\n")

sapperPirateExport({
  onPathExported: (pathname, file) => {
    const l = pathname
    const r = path.relative(cwd, file)
    log(pad(l) + " " + pad(r))
  }
})
  .then(() => {
    const secondsSince = (new Date() - startTime) / 1000
    console.log(`\nDone after ${secondsSince} seconds.`)
    process.exit(0)
  })
  .catch(err => {
    error(err)
    process.exit(1)
  })
