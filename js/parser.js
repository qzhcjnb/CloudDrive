window.CloudDriveParser = (() => {
  function canonicalTag(value) {
    return String(value || "").trim().replace(/[a-z]/gi, char => char.toUpperCase());
  }
  function parseName(originalName) {
    let rest = String(originalName || "");
    const tags = [], seen = new Set();
    let match;
    while ((match = /^\[([^\]]*)\]/.exec(rest))) {
      rest = rest.slice(match[0].length);
      const tag = canonicalTag(match[1]);
      if (tag && !seen.has(tag.toLocaleLowerCase())) { seen.add(tag.toLocaleLowerCase()); tags.push(tag); }
    }
    return { originalName: String(originalName || ""), name: rest.trimStart() || String(originalName || ""), tags };
  }
  function extension(name) {
    const clean = String(name || "").trim();
    const dot = clean.lastIndexOf(".");
    return dot > 0 && dot < clean.length - 1 ? clean.slice(dot + 1).toLowerCase() : "";
  }
  function createModel(data) {
    const parsed = parseName(data.originalName);
    return {
      name: parsed.name, originalName: parsed.originalName, path: data.path, type: data.type,
      source: data.source, tags: parsed.tags, extension: data.type === "folder" ? "" : extension(parsed.name),
      sizeBytes: Number.isFinite(data.sizeBytes) ? data.sizeBytes : null, updatedAt: data.updatedAt || null,
      createdAt: null, githubUrl: data.githubUrl || null, downloadUrl: data.downloadUrl || null,
      releaseTag: data.releaseTag || null, releaseName: data.releaseName || null,
      releaseUrl: data.releaseUrl || null, downloadCount: Number.isFinite(data.downloadCount) ? data.downloadCount : null,
      releasePublishedAt: data.releasePublishedAt || null, virtual: Boolean(data.virtual)
    };
  }
  function parentPath(path) { const parts = String(path || "").split("/"); parts.pop(); return parts.join("/"); }
  function encodePath(path) { return String(path).split("/").map(encodeURIComponent).join("/"); }
  return { parseName, extension, createModel, parentPath, encodePath };
})();
