function resolve (url, tree) {
    const content = retriveFile(url);
    const dependency = makeDependency(content);
    const dependencyConflicts = checkDependency(content);
}
function fetch (url) {
    const [protocol, author, lib, version, hash] = decode(url);
    const dependency = new Dependency(protocol, author, lib, version, hash);
    return dependency;
}
function resolve (metadata, tree) {
    const dependency = tree.search(metadata);
    if (!dependency) return [[], fetch(url)];
    const conflicts = tree.compatibility(dependency);
    return [conflicts, dependency];
}
function Import (url, tree) {
    const [protocol, author, lib, version, hash] = decode(url);
    const metadata = new Dependency.Metadata(protocol, author, lib, version, hash);
    const [conflicts, dependency] = resolve(metadata, tree);
    if (conflicts.length > 0) return resolveConflictsManually();
    return success();
}