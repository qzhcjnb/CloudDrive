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
  /* Best-effort platform detection from a Release asset name (Rust/Go style
     target triples and common installer extensions). Order matters: mobile and
     Apple targets must win before the generic linux/windows keywords. */
  function platform(name) {
    const s = String(name || "").toLocaleLowerCase();
    if (!s) return "other";
    if (s.includes("android") || s.includes(".apk") || s.includes(".aab")) return "android";
    if (s.includes("-ios") || s.includes(".ipa") || s.includes("apple-ios")) return "ios";
    if (s.includes("darwin") || s.includes("macos") || s.includes("osx") || s.includes(".dmg") || s.includes("apple-") || /mac[_.-]?(arm|amd|x64|x86|universal|intel|m1|m2)/.test(s)) return "macos";
    if (s.includes("windows") || s.includes("win32") || s.includes("win64") || s.includes(".msi") || s.includes(".exe") || /(^|[-_.])win([-_.]|$)/.test(s)) return "windows";
    if (s.includes("linux") || s.includes(".deb") || s.includes(".rpm") || s.includes("appimage") || s.includes("musl")) return "linux";
    return "other";
  }
  function createModel(data) {
    const parsed = parseName(data.originalName);
    return {
      name: parsed.name, originalName: parsed.originalName, path: data.path, type: data.type,
      source: data.source, tags: parsed.tags, extension: data.type === "folder" ? "" : extension(parsed.name),
      platform: data.type === "file" && data.source === "release" ? platform(parsed.name) : null,
      sizeBytes: Number.isFinite(data.sizeBytes) ? data.sizeBytes : null, updatedAt: data.updatedAt || null,
      createdAt: null, githubUrl: data.githubUrl || null, downloadUrl: data.downloadUrl || null,
      releaseTag: data.releaseTag || null, releaseName: data.releaseName || null,
      releaseUrl: data.releaseUrl || null, downloadCount: Number.isFinite(data.downloadCount) ? data.downloadCount : null,
      releasePublishedAt: data.releasePublishedAt || null, virtual: Boolean(data.virtual)
    };
  }
  function parentPath(path) { const parts = String(path || "").split("/"); parts.pop(); return parts.join("/"); }
  function encodePath(path) { return String(path).split("/").map(encodeURIComponent).join("/"); }
  return { parseName, extension, platform, createModel, parentPath, encodePath };
})();
