var http = require('http');
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function decode (url) {
  const pieces = url.split('/');
  return [pieces[0], pieces[1], pieces[2], pieces[3], pieces[4]];
}
/**
 * Sugar syntax for async await promises
 *
 * Get better readability using: const [data, error] = await prom();.
 *
 * @param {Promise} promise - Param description (e.g. "add", "edit").
 * @returns {array<object>} - Array containing in 0 the data of the promise or null, and in 1 the error or null.
 */
async function makePromise (promise) {
  try {
    return [await p, null];
  } catch (e) {
    return [null, e];
  }
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function fetch (url, options = {}) {
  return await makePromise(new Promise((res, rej) => {
    var data = '';
    http.get(url, options, response => {
      if (statusCode !== 200) rej(err);
      // A chunk of data has been received.
      resp.on('data', (chunk) => (data += chunk));
      // The whole response has been received. Print out the result.
      resp.on('end', () => res(data));
    }).catch(e => rej(e));
  }).catch(e => rej(r)));
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
async function fetchDependency (metadata) {
  const [content, error] = await fetch(`https://ipfs.io/ipfs/${metadata.hash}`);
  if (error) resolveConflictsManually(error);
  return content;
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function compatibility (metadata, tree) {
  // if (tree.dependencies.fin())
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function resolve (metadata, tree) {
  const dependency = tree.search(metadata);
  if (!dependency) return [fetchDependency(metadata), []];
  const conflicts = tree.compatibility(dependency);
  return [dependency, conflicts];
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function Import (url, tree) {
  const [protocol, author, lib, version, hash] = decode(url);
  const metadata = new Dependency.Metadata(protocol, author, lib, version, hash);
  const [dependency, conflicts] = resolve(metadata, tree);
  if (conflicts.length > 0) return resolveConflictsManually(conflicts);
  return success();
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function Tree (dependencies = []) {
 this.dependencies = dependencies
 this.compatibility = compatibility;
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function Metadata (protocol, author, lib, version, hash) {
 this.protocol = protocol
 this.author = author
 this.lib = lib
 this.version = version
 this.hash = hash
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
function Dependency (metadata) {
 this.metadata = metadata
 this.fetch = fetch.bind(null, [this]);
}
/**
 * Summary.
 *
 * Description.
 *
 * @throws {Exception}
 * @param {string} paramName - Param description (e.g. "add", "edit").
 * @returns {Object} The return description.
 */
export const Dependency = {
  Tree: Tree,
  Metadata: Metadata,
  fetch: fetch,
  resolve: resolve,
  Import: Import
}
