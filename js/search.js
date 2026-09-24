window.CloudDriveSearch = (() => {
  function normalize(value) { return String(value || "").toLocaleLowerCase(); }
  function matches(item, query) {
    const needle = normalize(query).trim(); if (!needle) return true;
    return [item.name, item.originalName, item.path, item.extension, item.source === "release" ? "github release release 发布版" : "repository 仓库", item.releaseTag, item.releaseName, ...item.tags]
      .some(value => normalize(value).includes(needle));
  }
  return { matches };
})();
