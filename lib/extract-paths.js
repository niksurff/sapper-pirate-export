const log = require("./logger")("extract-paths")
const cheerio = require("cheerio")

/**
 * Extracts internal paths from some HTML
 * @param {String} html - The HTML to crawl
 */
const extractPaths = html => {
  let paths = []

  log("Extracting paths from HTML")

  try {
    cheerio("a", html).each((i, el) => {
      const href = el.attribs.href

      log(`Found possible path ${href}`)

      if (href[0] === "/") {
        paths.push(href)
      }
    })
  } catch (e) {
    throw new Error(e)
  }

  log("Extracted paths %o", paths)

  return paths
}

module.exports = extractPaths
