const debug = require("debug")("sapper-pirate-export:extract-paths")
const cheerio = require("cheerio")

const extractPaths = html => {
  let paths = []

  try {
    cheerio("a", html).each((i, el) => {
      const href = el.attribs.href

      debug("Found <a /> with href %s", href)

      if (href[0] === "/") {
        paths.push(href)
      }
    })
  } catch (e) {
    throw new Error(e)
  }

  debug("Paths extracted %o", paths)

  return paths
}

module.exports = extractPaths
