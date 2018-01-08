const log = require("./logger")("pirate-file-system")
const path = require("path")
const fs = require("fs-extra")
const assert = require("assert")

/**
 * Handles interaction with the filesystem
 * @param {Object} config - The configuration
 * @property config.exportDir - Export directory relative to cwd
 * @property config.assetsDir - Assets directory relative to cwd
 * @property config.sapperDir - Sapper build directory relative to cwd
 * @property config.cwd - The current working directoy (cwd)
 */
const pirateFileSystem = async ({ exportDir, assetsDir, sapperDir, cwd }) => {
  assert(exportDir, "`config.exportDir` missing`")
  assert(assetsDir, "`config.assetsDir` missing`")
  assert(sapperDir, "`config.sapperDir` missing`")
  assert(cwd, "`config.cwd` missing in config`")

  const exportPath = path.join(cwd, exportDir)
  const assetsPath = path.join(cwd, assetsDir)
  const sapperPath = path.join(cwd, sapperDir)

  log(`Initialized with paths
  ${sapperPath} (sapper source)
  ${assetsPath} (assets source)
  ${exportPath} (export destination)`)

  const prepareForBattle = async () => {
    await fs.emptyDir(exportPath)

    await Promise.all([
      fs.copy(assetsPath, exportPath),
      fs.copy(path.join(sapperPath, "client"), path.join(exportPath, "client"))
    ])

    log(`Prepared export folder, Captain!`)
  }

  const arrr = async (pathname, contents) => {
    const dest = path.join(exportPath, pathname)
    console.log(`Writing file ${dest}`) // @TODO move into cli
    await fs.outputFile(dest, contents)

    log(`Exported file ${dest}, Cap!`)
  }

  // prepare static files on init
  await prepareForBattle()

  return {
    writeFile: arrr
  }
}

module.exports = pirateFileSystem
