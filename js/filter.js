window.CloudDriveFilter = (() => {
  function matches(item, filters) {
    if (filters.tags.length && !filters.tags.every(tag => item.tags.includes(tag))) return false;
    if (filters.extensions.length && (item.type !== "file" || !filters.extensions.includes(item.extension))) return false;
    if (filters.source !== "all" && item.source !== filters.source) return false;
    if (filters.platform && filters.platform !== "all" && item.source === "release" && item.platform !== filters.platform) return false;
    if (filters.size !== "all") {
      if (item.type !== "file") return false;
      const size = item.sizeBytes || 0, mb = 1024 * 1024, gb = 1024 * mb;
      const ranges = { small: size < 10 * mb, medium: size >= 10 * mb && size < 100 * mb, large: size >= 100 * mb && size < gb, huge: size >= gb };
      if (!ranges[filters.size]) return false;
    }
    return true;
  }
  function options(items) {
    const tags = [...new Set(items.flatMap(item => item.tags))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const extensions = [...new Set(items.filter(item => item.type === "file" && item.extension).map(item => item.extension))].sort();
    const platforms = {};
    items.filter(item => item.source === "release").forEach(item => {
      const key = item.platform || "other";
      platforms[key] = (platforms[key] || 0) + 1;
    });
    return { tags, extensions, platforms, releaseTotal: items.filter(item => item.source === "release").length };
  }
  return { matches, options };
})();
