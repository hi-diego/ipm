var https = require('https');
var fs = require('fs/promises');
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function replaceImport (_import, content, code) {
  return content.replace(_import, code)
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function objectToCode (_object, metadata) {
  var code = null;
  if (typeof(_object) === 'function') code =  _object.toString();
  code = JSON.stringify(_object); // .replaceAll('', '');
  return 'const ' + metadata.name.toUpperCase() + ' = ' + code;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function interpretContent (content) {
  const exportValue = eval(content);
  return exportValue;
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
function isImports(codeLine) {
  return codeLine.startsWith('import ');
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
function imports(code) {
  const lines = code.split('\n');
  var i = 0;
  const imports = [];
  var line = lines[i];
  if (!isImports(line)) return [];
  while (isImports(line)) {
    imports.push(line);
    i++;
    line = lines[i];
  }
  return imports;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function importMetadata (importString) {
  const raw = importString;
  const pieces = importString.split(' ')
  const expression = importString.match(/\{(\s*(\w+)\s*)*\}/g)[0].replace(/(\{\s*|\s*\})/g, '');
  const alias = expression.split(' as ')[0];
  const name = expression.split(' as ')[1] || alias;
  const url = pieces.pop();
  return { name, alias, url, raw };
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function moduleName (metadata) {
  return [metadata.author, metadata.name, metadata.version.replace(/\./g, '_')].join('_');
}
// 'const ' + c.metadata.name + ' = {\n' + c.rawContent.replace(/export \{(\S|\s)*\};/g, '')) + '\n};' // replaceEsmSyntax(c.rawContent, c.metadata)),
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function wrapModule (content, metadata) {
  const moduleName = [metadata.author, metadata.name, metadata.version.replace(/\./g, '_')].join('_');
  return `const ${moduleName} = {\n${content}\n};`
    + `\nconst ${metadata.import.alias} = ${moduleName}.${metadata.name};\n`;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function exportedObjects (dependency) {
  // var _exports = dependency.rawContent.match(/export.*\{.*(\w).*\};/g)[0];
  // _exports = _exports.replace(/(export.*\{)/g, '').replace(/\};/g, '').replace(/\s/g, '');
  // var names = _exports.split(',')
  // console.log(names);
  // const names = dependency.rawContent.replace(/export \{(\S|\s)*\};/g, '');
  const name = moduleName(dependency.metadata);
  const content = dependency.rawContent.replace(/export/g, 'const ' + name + ' = ');
  var code = `const MODULE_${name} = function () {\n${ content.split('\n').join('\r\n  ') }\nreturn ${name};\n}\n`
    + `const ${name} = MODULE_${name}();\n`
    + `const ${dependency.metadata.import.alias} = ${name}.${dependency.metadata.import.alias};`;
  // eval(code);
  // console.log(MODULE_DiegoMeza_JsonToXml_1_0_0());
  return code;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function removeEsmSyntax (dependency) {
  return exportedObjects(dependency);
  // return dependency.rawContent.replace(/export \{(\S|\s)*\};/g, '');
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
async function replaceEsmSyntax (content, metadata) {
  const _imports = imports(content).map(importMetadata);
  // if the file doesent have a dependency is a leaf
  // in the dependency tree so we can load it safely.
  if (_imports.length === 0) return content;
  // 
  const promises = _imports.map(i => resolve(new Metadata(i.url, i)));
  const dependencies = (await Promise.all(promises)).map(pe => pe[0]);
  _imports.forEach(i => replaceImport(i, content, code));
  return dependencies.reduce(
    (p, d) => content.replace(d.metadata.import.raw, removeEsmSyntax(d), d.metadata) // replaceEsmSyntax(c.rawContent, c.metadata)),
  ,'');
  // const exportedValue =  interpretContent(content);
  // const code =  objectToCode(content, metadata); // wrapDependency()
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
async function compile (fileName) {
  var [content, error] = await IPromise(fs.readFile(fileName));
  if (error) return resolveConflictsManually(e);
  var code = content.toString();
  code = await replaceEsmSyntax(code);
  console.log(code);
  eval(code); // excec the dependency free code
  return code;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function decode (url) {
  const pieces = url.split('/');
  return [pieces[0], pieces[1], pieces[2], pieces[3], pieces[4].replace('\';', '')];
}
/**
 * Sugar syntax for async await promises
 *
 * Get better readability using: const [data, error] = await prom();.
 *
 * @param {Promise} promise - Param description (e.g. "add", "edit").
 * @returns {array<object>} - Array containing in 0 the data of the promise or null, and in 1 the error or null.
 */
async function IPromise (promise) {
  // return ITry(async () => await promise);
  try {
    return [await promise, null];
  } catch (e) {
    return [null, e];
  }
}
/**
 * Sugar syntax for async await promises
 *
 * Get better readability using: const [data, error] = await prom();.
 *
 * @param {Promise} promise - Param description (e.g. "add", "edit").
 * @returns {array<object>} - Array containing in 0 the data of the promise or null, and in 1 the error or null.
 */
function ITry (action) {
  try {
    return [action(), null];
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
function fetch (url) {
  return new Promise((res, rej) => {
    https.get(url, r => {
      if (r.statusCode !== 200) return rej(new Error(`Request Failed. Status Code: ${r.statusCode}`));
      r.on('data', d => res(d.toString()));
    }).on('error', e => rej(e));
  });
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
async function resolveConflictsManually (error) {
  return console.error(error);
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
  const url = `https://ipfs.io/ipfs/${metadata.hash}`
  const [content, error] = await IPromise(fetch(url));
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
async function resolve (metadata, tree) {
  const dependency = null; // tree.search(metadata);
  if (!dependency) return [new Dependency(metadata, await fetchDependency(metadata)), []];
  // const conflicts = tree.compatibility(dependency);
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
function Metadata (url, _import) {
  const [protocol, author, lib, version, hash] = decode(url);
  this.protocol = protocol;
  this.author = author;
  this.lib = lib;
  this.name = lib;
  this.version = version;
  this.hash = hash;
  this.import = _import;
  return this;
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
function Dependency (metadata, rawContent) {
  this.metadata = metadata
  // this.fetch = fetch.bind(null, [this]);
  this.rawContent = rawContent;
  return this;
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
const ipm = {
  Tree: Tree,
  Metadata: Metadata,
  fetch: fetch,
  resolve: resolve,
  Import: Import
}

const code = compile(process.argv[2]);
