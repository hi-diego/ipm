/**
* @author DiegoMeza
* @name JsonToXml
* @version 1.0.0
* @license GPL-3
* @cert
*/
function JsonToXml(json, root = "root") {
  var jsonObject = JSON.parse(json);
  return ObjectToXml(jsonObject, root);
}
function ObjectToXml(obj, root = "root") {
  var serializer = new XMLSerializer();
  var xml = ObjectToXmlDocument(obj, root);
  var xmlString = serializer.serializeToString(xml);
  return xmlString;
}
function ObjectToXmlDocument(obj, root = "root") {
  var parser = new DOMParser();
  var xml = parser.parseFromString(`<${root}></${root}>`, "application/xml");
  WalkObject(obj, (i, lastResult) => ObjectIterationToXmlElement(i, lastResult, xml));
  return xml;
}
function ObjectIterationToXmlElement(i, lastResult, rootXml) {
  if (!lastResult)
    return rootXml.documentElement;
  if (Array.isArray(i.value))
    return lastResult;
  var childName = Array.isArray(i.parent) ? lastResult.tagName : i.key;
  var child = rootXml.createElement(childName || "");
  if (typeof i.value !== "object")
    child.innerHTML = i.value;
  lastResult.appendChild(child);
  return child;
}
function IterationPath(path, key) {
  return !path ? key : `${path}.${key}`;
}
function NextIteration(it, key) {
  return { value: it.value[key], key, parent: it.value, path: IterationPath(it.path, key) };
}
function WalkObject(object_, callback, i = null, lastResult = null) {
  var it = i === null ? { value: object_, path: null, key: null, parent: null } : i;
  lastResult = callback(it, lastResult);
  if (typeof it.value !== "object" && it.value !== null)
    return;
  Object.keys(object_).forEach((key) => WalkObject(object_[key], callback, NextIteration(it, key), lastResult));
}
export { IterationPath, JsonToXml, NextIteration, ObjectIterationToXmlElement, ObjectToXml, ObjectToXmlDocument, WalkObject };
