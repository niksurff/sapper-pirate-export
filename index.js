const debug = require("debug")("sapper-pirate-export")
const path = require("path")
const fs = require("fs-extra")
const { setTimeout } = require("timers")
const { fork } = require("child_process")
const requestQueue = require("./lib/request-queue")
const extractPaths = require("./lib/extract-paths")
const write = require("./lib/write")
const setupServer = require("./lib/setup-server")

debug("Module required.")

const sapperPirateExport = async (options = {}) => {
  debug("Export started with user config %O", options)

  const script = options.serverScript || "server.js"
  const server = await setupServer(script, { timeout: 3000 })

  debug("Server process forked with pid %s", server.pid)

  return run(server, options)
}

function run(
  server,
  {
    initialPaths = ["/", "/service-worker.js"],
    serverPort = 3000,
    serverRequestConcurrency = 1,
    serverRequestTimeout = 500,
    exportDir = ".pirates",
    assetsDir = "assets",
    sapperDir = ".sapper",
    cwd = process.cwd()
  } = {}
) {
  return new Promise((resolve, reject) => {
    debug("Runner started")

    const queue = requestQueue({
      concurrency: serverRequestConcurrency,
      timeout: serverRequestTimeout,
      host: `http://localhost:${serverPort}`
    })

    debug("Request queue set up")

    const exportPath = path.join(cwd, exportDir)
    const assetsPath = path.join(cwd, assetsDir)
    const sapperPath = path.join(cwd, sapperDir)

    debug("File paths calculated:")
    debug("\t\t%s (sapper)", sapperPath)
    debug("\t\t%s (assets)", assetsPath)
    debug("\t\t%s (export)", exportPath)

    queue.on("success", async response => {
      debug("Successful response received from %s", response.url)

      const url = response.url
      const body = await response.text()
      const contentType = response.headers.get("content-type")

      try {
        write({
          url,
          body,
          contentType,
          destPath: exportPath
        })

        if (contentType.includes("text/html")) {
          const paths = extractPaths(body)
          paths.forEach(path => {
            queue.pushPath(path)
            debug("Path %s extracted and queued", path)
          })
        }
      } catch (e) {
        reject(e)
      }
    })

    server.on("message", ({ path }) => {
      debug("Message from server received with path: %s", path)
      path && queue.pushPath(path)
    })

    queue.on("error", err => reject(err))
    queue.on("timeout", (con, job) => reject(job + "timed out"))
    server.on("error", err => reject(err))

    queue.on("end", () => {
      debug("Queue empty, waiting for response...")
      const timeout = setTimeout(() => {
        // give some time for queue to fill up
        if (queue.length) {
          debug("Queue has %s new jobs, restarting...", queue.length)
          queue.start()
        } else {
          debug(
            "Queue has been empty for %sms, finishing up.",
            serverRequestTimeout
          )
          resolve()
        }
      }, serverRequestTimeout)
    })

    // start here
    fs
      .emptyDir(exportPath)
      .then(() =>
        Promise.all([
          fs.copy(assetsPath, exportPath),
          fs.copy(
            path.join(sapperPath, "client"),
            path.join(exportPath, "client")
          )
        ])
      )
      .then(() => {
        debug("Export dir emptied, assets and sapper files copied.")

        initialPaths.forEach(path => {
          queue.pushPath(path)
          debug("Initial path queued %s", path)
        })

        queue.start()
        debug("Queue started.")
      })
      .catch(err => reject(err))
  })
}

module.exports = sapperPirateExport
