window.ReleaseClient = (() => {
  const { createModel } = window.CloudDriveParser;
  async function load() {
    if (!window.GitHubClient.configured()) return [];
    const owner = encodeURIComponent(CONFIG.github.owner), repo = encodeURIComponent(CONFIG.github.repo);
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) {
      if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") throw new Error("GitHub API 请求次数已达到限制，请稍后再试。");
      if (response.status === 404) return []; // Repositories without releases are valid.
      throw new Error(`GitHub Releases 请求失败（${response.status}）。`);
    }
    const releases = await response.json();
    return releases.flatMap(release => (release.assets || []).map(asset => createModel({
      originalName: asset.name, path: `release/${asset.name}`, type: "file", source: "release",
      sizeBytes: asset.size, updatedAt: release.published_at || release.created_at, githubUrl: release.html_url,
      downloadUrl: asset.browser_download_url, releaseTag: release.tag_name || "未命名版本",
      releaseName: release.name || release.tag_name || "GitHub Release", releaseUrl: release.html_url,
      downloadCount: asset.download_count, releasePublishedAt: release.published_at || release.created_at
    })));
  }
  return { load };
})();
