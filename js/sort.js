window.CloudDriveSort = (() => {
  function value(item, key) { if (key === "name") return item.name; if (key === "size") return item.sizeBytes ?? -1; if (key === "downloads") return item.downloadCount ?? -1; return item.updatedAt ? Date.parse(item.updatedAt) : 0; }
  function sort(items, mode) {
    const [key, direction] = mode.split("-"); const factor = direction === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      const left = value(a, key), right = value(b, key);
      if (typeof left === "string") return factor * left.localeCompare(right, "zh-CN", { numeric: true, sensitivity: "base" });
      return factor * (left - right) || a.name.localeCompare(b.name, "zh-CN");
    });
  }
  return { sort };
})();
