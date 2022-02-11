/**
* @author DiegoMeza
* @name JsonToXmlServer
* @version 1.0.0
* @license GPL-3
* @cert
*/
import { JsonToXml } from 'ipfs/DiegoMeza/JsonToXml/1.0.0/QmdeW5LqgBPaNpq36ZqciKFhWQi9zxecVk1oYhp1fScQ2R';
const fs = require('fs');
const path = require('path');
/**
 * Parse the given Json string.
 *
 * Description.
 *
 * @throws {InvalidArgumentException}
 * @param {string} jsonString - The mode being performed (e.g. "add", "edit").
 * @returns {Object} The Object correspondent to the given JsonString.
 */
function ReadJsonFile(path) {
    return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
}
/**
 * Parse the given Json string.
 *
 * Description.
 *
 * @throws {InvalidArgumentException}
 * @param {string} jsonString - The mode being performed (e.g. "add", "edit").
 * @returns {Object} The Object correspondent to the given JsonString.
 */
function FromJsonToXml(path, root) {
    if (root === void 0) { root = 'root'; }
    var json = ReadJsonFile(path);
    var xmlString = JsonToXml(json, root);
    return xmlString;
}
/**
 * Parse the given Json string.
 *
 * Description.
 *
 * @throws {InvalidArgumentException}
 * @param {string} jsonString - The mode being performed (e.g. "add", "edit").
 * @returns {Object} The Object correspondent to the given JsonString.
 */
function Transform(inPath, outPath) {
    if (outPath === void 0) { outPath = null; }
    var xmlString = FromJsonToXml(inPath, path.basename(inPath).replace('.json', ''));
    fs.writeFileSync(outPath || inPath.replace('.json', '.xml'), xmlString, { encoding: 'utf8' });
}

export { ReadJsonFile, FromJsonToXml, Transform };
