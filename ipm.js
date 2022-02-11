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
  return code.match(/import (.)*'/g);
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
function importToModule (importString) {
  const { name, alias, url, raw } = importMetadata(importString);
  const [protocol, author, lib, version, hash] = decode(url);
  return new Module(null, [protocol, author, lib, version, hash]);
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
function moduleFunction (dependency) {
  const name = moduleName(dependency.metadata);
  const content = dependency.rawContent.replace(/export/g, 'const ' + name + ' = ');
  var code = `const MODULE_${name} = function () {\n${ content.split('\n').join('\r\n  ') }\nreturn ${name};\n}\n`
    + `const ${name} = MODULE_${name}();\n`
    + `const ${dependency.metadata.import.alias} = ${name}.${dependency.metadata.import.alias};`;
  return code;
}
/**
 * Split the given url into its 
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
async function replaceEsmSyntax (content, metadata) {
  const _imports = imports(content).map(importMetadata);
  // if the file doesent have a dependency is a leaf
  // in the dependency modules so we can load it safely.
  if (_imports.length === 0) return content;
  const promises = _imports.map(i => resolve(new Metadata(i.url, i)));
  const deps = (await Promise.all(promises)).map(pe => pe[0]);
  return deps.reduce(async (p, d) => content.replace(d.metadata.import.raw, moduleFunction(d), d.metadata), ''); //
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function codeToComment (code) {
  return code.match(/\/\*\*(.|\n|\r\n)*\*\//g)[0];
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function encode (author, name, version, license, cert, hash = '') {
  return `ipfs/${author}/${name}/${version}/${hash}`;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function codeToUrl (code) {
  const comment =  codeToComment(code);
  return commentToUrl(comment);
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function commentToUrl (comment) {
  const [protocol, author, name, version, hash, license, cert] = decodeComment(comment);
  return encode(protocol, author, name, version, hash, license, cert);
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function decodeComment (comment) {
  const authorRegex = /\* \@author (.+)(\n|\r\n)/g;
  const authorResult = authorRegex.exec(comment);
  const author = authorResult[1];
  const nameRegex = /\* \@(name|lib|module) (.+)(\n|\r\n)/g;
  const nameResult = nameRegex.exec(comment);
  const name = nameResult[1];
  const versionRegex = /\* \@version (.+)(\n|\r\n)/g;
  const versionResult = versionRegex.exec(comment);
  const version = versionResult[1];
  const licenseRegex = /\* \@license (.+)(\n|\r\n)/g;
  const licenseResult = licenseRegex.exec(comment);
  const license = licenseResult[1];
  const certRegex = /\* \@cert (.+)(\n|\r\n)/g;
  const certResult = certRegex.exec(comment);
  const cert = certResult[1];
  return ['', author, name, version, license, '', cert];
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
function codeToMetadata (code) {
  try {
    const _imports = imports(code).map(importMetadata);
    return new Metadata(codeToUrl(code), _imports);
  } catch (e) {
    console.error('Modules must have the module definition comment at the start of the file.');
    throw e;
  }
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
async function Fulfill (promise) {
  // return ITry(async () => await promise);
  try {
    return [await promise, null];
  } catch (e) {
    // return resolveConflictsManually(error);
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
      if (r.statusCode !== 200) return rej(new Error(`Request Failed. Status Code: ${r.statusCode}\n${url}`));
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
async function fetchModule (dependency) {
  const url = `https://ipfs.io/ipfs/${dependency.hash}`
  const [content, error] = await Fulfill(fetch(url));
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
function compatibility (a, modules) {
  const c = modules.find(b => broken(a, b));
  return c 
    ? `Broken dependencies: ${a.name} requires ${a.version} and ${c.name} ${c.version} is already installed`
    : null;
}
/**
 * Split the given url into its parts.
 *
 * @throws {Exception}
 * @param {string} url      - The url to deconstruct.
 * @returns {array<string>} - The array of the url pieces.
 */
async function build (fileName) {
  const [bytes, error] = await Fulfill(fs.readFile(fileName));
  if (error) return resolveConflictsManually(error);
  const code = bytes.toString();
  const dependency = new Module(code);
  // ModuleBag dependency flatten and manual resolution.
  const modules = [];
  const conflicts = await resolve(dependency, modules);
  // ModuleBag dependency flatten and manual resolution.
  // const bundle = await make(modules);
  // eval(code); // excec the dependency free code
  // return bundle;
  return modules;
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
async function resolve (dependency, modules) {
  const conflict = compatibility(dependency, modules);
  if (conflict) return [conflict];
  const already = modules.find(exact);
  if (already) return [];
  await dependency.fetch();
  modules.push(dependency);
  return await dependency.dependencies.map(d => resolve(d, modules));
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
async function Import (url, modules) {
  const metadata = new Metadata(url);
  const [dependency, conflicts] = await resolve(metadata, modules);
  if (conflicts.length > 0) return resolveConflictsManually(conflicts);
  return dependency;
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
function exact (a, b) {
    return similar(a, b) && a.version !== b.version;
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
function similar (a, b) {
    return a.name === b.name && a.author === b.author;
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
function broken (a, b) {
  return similar(a, b) && a.version !== b.version;
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
function search (a, modules) {
  return modules.dependencies.find(b => exact(a, b));
  const already = modules.dependencies.find(b => exact(a, b));
  if (already) return already;
  return modules.dependencies.find(b => similar(a, b));
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
function ModuleBag (dependency, modules) {
  this.dependencies = [dependency];
  this.search = a => search(a, this.dependencies);
  // Is leaf?
  // if (dependency.dependencies.length === 0) return modules;
  // return dependency.dependencies.forEach(d => ModuleBag(d, modules));
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
function Module (rawContent = null, attrs = []) {
  const [protocol, author, lib, version, hash, license, cert] = rawContent == null 
    ? attrs
    : decodeComment(codeToComment(rawContent));
  this.rawContent = rawContent;
  this.protocol = protocol;
  this.author = author;
  this.lib = lib;
  this.name = lib;
  this.version = version;
  this.hash = hash;
  this.cert = cert;
  this.dependencies = [];
  this.isFetched = () => !!this.rawContent;
  this.fetch = async () =>  {
    this.rawContent = this.rawContent || await fetchModule(this);
    this.dependencies = imports(rawContent).map(i => importToModule(i));
    console.log(this.dependencies);
  }
  // this.fetch = fetch.bind(null, [this]);
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
  ModuleBag: ModuleBag,
  Module: Module,
  fetch: fetch,
  resolve: resolve,
  Import: Import
}
const code = build(process.argv[2]);
code.then(console.log);
