/**
 * URL and path building helper
 * @param {String} host - The host to append a path onto
 */
const pirateURL = host => ({
  makeURL: path => `${host}${path}`,
  makePathname: url => url.replace(host, "") // the naive version
})

module.exports = pirateURL
