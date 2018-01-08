const log = require("./logger")("pirate-server")
const { setTimeout, clearTimeout } = require("timers")
const { fork } = require("child_process")
const pkg = require("../package.json")
const { CANNONS_READY } = require("./messages")

/**
 * Sets up the server process and makes sure we can exchange messages
 * @param {String} script The path to server script
 * @param {Object} options The setup options
 * @property {Number} options.timeout The startup timeout in ms (default: 1000)
 */
const pirateServer = (script, { timeout = 1000 } = {}) =>
  new Promise((resolve, reject) => {
    !script && reject("Parameter `script` missing")

    const server = fork(script, {
      env: {
        NODE_ENV: "production"
      }
    })

    server.on("error", err => reject(err))
    // @TODO pipe server logs through our logger

    log(`Forked Server process with pid ${server.pid}`)

    /*
      Ping the server.
      If no answer was received in time,
      the middleware might not have been installed properly
      or the server is taking to long
    */

    const timer = setTimeout(
      () =>
        // @TODO close child process
        reject(
          `Captain, we can't reach the Server.

                  \t- Make sure to add '${pkg.name}/middleware' to ${script}.
                  \t- To give your server more time to start up
                  \t\t export with '--server-timeout=${timeout * 1.5}'` // magic
        ),
      timeout
    )

    server.on("message", msg => {
      if (msg === CANNONS_READY) {
        log("Connection with Server established.")

        clearTimeout(timer)
        resolve(server)
      }
    })

    server.send(CANNONS_READY)
  })

module.exports = pirateServer
