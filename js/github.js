window.GitHubClient = (() => {
  const { createModel, encodePath } = window.CloudDriveParser;
  function configured() { return CONFIG.github.owner !== "YOUR_GITHUB_USERNAME" && CONFIG.github.repo !== "YOUR_REPOSITORY"; }
  function base() { return `https://api.github.com/repos/${encodeURIComponent(CONFIG.github.owner)}/${encodeURIComponent(CONFIG.github.repo)}`; }
  async function request(path) {
    const response = await fetch(base() + path, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) {
      if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") throw new Error("GitHub API 请求次数已达到限制，请稍后再试。");
      if (response.status === 404) throw new Error("未找到公开仓库，请检查 config/config.js 中的 owner、repo 和 branch。");
      throw new Error(`GitHub API 请求失败（${response.status}）。`);
    }
    return response.json();
  }
  function links(path) {
    const owner = encodeURIComponent(CONFIG.github.owner), repo = encodeURIComponent(CONFIG.github.repo), branch = encodeURIComponent(CONFIG.github.branch);
    return {
      githubUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${encodePath(path)}`,
      downloadUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodePath(path)}`
    };
  }
  function folderModel(path) { return createModel({ originalName: path.split("/").pop(), path, type: "folder", source: "repository", githubUrl: `https://github.com/${encodeURIComponent(CONFIG.github.owner)}/${encodeURIComponent(CONFIG.github.repo)}/tree/${encodeURIComponent(CONFIG.github.branch)}/${encodePath(path)}` }); }
  async function loadIndex() {
    if (!configured()) throw new Error("请先在 config/config.js 填写公开 GitHub 仓库信息。");
    const tree = await request(`/git/trees/${encodeURIComponent(CONFIG.github.branch)}?recursive=1`);
    if (!Array.isArray(tree.tree)) throw new Error("无法读取仓库文件树。");
    const records = new Map();
    for (const item of tree.tree) {
      if (item.type === "tree") records.set(`d:${item.path}`, folderModel(item.path));
      if (item.type === "blob") records.set(`f:${item.path}`, createModel({ originalName: item.path.split("/").pop(), path: item.path, type: "file", source: "repository", sizeBytes: item.size, ...links(item.path) }));
    }
    // Git Trees may omit parent entries in unusual repositories; add missing ancestors.
    [...records.values()].forEach(item => {
      const chunks = item.path.split("/"); chunks.pop();
      while (chunks.length) { const path = chunks.join("/"); if (!records.has(`d:${path}`)) records.set(`d:${path}`, folderModel(path)); chunks.pop(); }
    });
    return { items: [...records.values()], truncated: Boolean(tree.truncated) };
  }
  return { loadIndex, configured };
})();
