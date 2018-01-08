const { setTimeout, clearTimeout } = require("timers")
const { fork } = require("child_process")
const pkg = require("../package.json")
const { CANNONS_READY } = require("./messages")

/**
 * Sets up the server in a child process
 * @param {String} script The path to server script
 * @param {Object} options The setup options
 * @argument {Integer} options.timeout The startup timeout
 * @throws
 */
const setupServer = (script, { timeout }) =>
  new Promise((resolve, reject) => {
    const server = fork(script, {
      env: {
        NODE_ENV: "production" // @TODO check if this works
      }
    }) //  @TODO process error handler

    /*
      Ping the server.
      If no answer was received in time,
      the middleware might not have been installed properly
      or the server is taking to long
    */

    const timer = setTimeout(
      () =>
        reject(
          new Error(
            `Not receiving messages from Server.

                  \t- Make sure you added '${pkg.name}/middleware' to ${script}.
                  \t- To give your server more time to startup
                  \t\t call this script with '--server-timeout=${timeout * 2}'`
          )
        ),
      timeout
    )

    server.on("message", ({ type }) => {
      if (type === CANNONS_READY) {
        clearTimeout(timer)
        server.on("message", () => {})
        resolve(server)
      }
    })

    server.send({ type: CANNONS_READY })
  })

module.exports = setupServer
