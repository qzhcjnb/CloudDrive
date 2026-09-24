(() => {
  const Store = window.CloudDriveStorage, Parser = window.CloudDriveParser, Search = window.CloudDriveSearch, Filter = window.CloudDriveFilter, Sort = window.CloudDriveSort;
  const initialFilters = () => ({ tags: [], extensions: [], source: "all", size: "all" });
  const state = { repo: [], releases: [], query: "", route: "", filters: initialFilters(), sort: "updated-desc", view: Store.get("view", "list"), theme: Store.get("theme", "system"), loading: false, error: "", warning: "" };
  let ui;
  function cacheKey() { return `data:${CONFIG.github.owner}/${CONFIG.github.repo}@${CONFIG.github.branch}`; }
  function cacheValid(cache) { return cache && Date.now() - cache.savedAt < (CONFIG.cacheMinutes || 5) * 60000; }
  function saveCache() { Store.set(cacheKey(), { savedAt: Date.now(), repo: state.repo, releases: state.releases }); }
  function setTheme(theme) { state.theme = theme; Store.set("theme", theme); ui.setTheme(theme); }
  function allItems() { return [...state.repo, ...state.releases]; }
  function virtualReleaseFolder() { return Parser.createModel({ originalName: "release", path: "release", type: "folder", source: "release", virtual: true }); }
  function pathForRoute() { return state.route.startsWith("repo/") ? decodeURIComponent(state.route.slice(5)) : ""; }
  function breadcrumbs() { if (state.route === "releases") return [{ label: "release", route: "releases" }]; const path = pathForRoute(); if (!path) return []; const parts = path.split("/"); return parts.map((label, index) => ({ label, route: `repo/${parts.slice(0, index + 1).map(encodeURIComponent).join("/")}` })); }
  function currentItems() {
    if (state.query.trim()) return allItems().filter(item => Search.matches(item, state.query));
    if (state.route === "releases") return state.releases;
    const parent = pathForRoute();
    const repoItems = state.repo.filter(item => Parser.parentPath(item.path) === parent);
    return parent ? repoItems : [virtualReleaseFolder(), ...repoItems];
  }
  function displayed() {
    let items = currentItems().filter(item => Filter.matches(item, state.filters));
    items = Sort.sort(items, state.sort);
    return items;
  }
  function render() {
    const all = allItems(), items = displayed();
    ui.render({ items, totalFiles: all.filter(item => item.type === "file").length, totalFolders: state.repo.filter(item => item.type === "folder").length + 1, query: state.query, filters: state.filters, sort: state.sort, view: state.view, options: Filter.options(all), breadcrumbs: breadcrumbs(), searching: Boolean(state.query.trim()), error: state.error, message: state.loading ? "正在从 GitHub 加载文件列表…" : state.warning, releaseGrouped: state.route === "releases" && !state.query.trim() && state.sort === "updated-desc" });
  }
  function routeFromHash() { const raw = location.hash.replace(/^#\/?/, ""); if (!raw || raw === "releases" || raw.startsWith("repo/")) { state.route = raw; } else { state.route = ""; } state.query = ""; render(); }
  function navigate(route) { location.hash = route ? `/${route}` : "/"; if (state.route === route) routeFromHash(); }
  async function refresh(force = false) {
    state.error = ""; state.warning = ""; const cached = Store.get(cacheKey());
    if (!force && cacheValid(cached)) { state.repo = cached.repo || []; state.releases = cached.releases || []; render(); return; }
    state.loading = true; render();
    const [repoResult, releaseResult] = await Promise.allSettled([window.GitHubClient.loadIndex(), window.ReleaseClient.load()]);
    state.loading = false;
    if (repoResult.status === "fulfilled") { state.repo = repoResult.value.items; if (repoResult.value.truncated) state.warning = "仓库文件树过大，GitHub 返回了不完整索引；部分文件可能未显示。"; }
    else state.error = repoResult.reason.message || "无法加载仓库文件。";
    if (releaseResult.status === "fulfilled") state.releases = releaseResult.value;
    else state.warning = `${state.warning ? `${state.warning} ` : ""}Release 文件暂时无法加载：${releaseResult.reason.message || "网络错误"}`;
    if (!state.error) saveCache(); render();
  }
  function removeValue(list, value) { return list.includes(value) ? list.filter(item => item !== value) : [...list, value]; }
  document.addEventListener("DOMContentLoaded", () => {
    ui = new window.CloudDriveUI({
      navigate, refresh: () => { Store.remove(cacheKey()); refresh(true); }, search: query => { state.query = query; render(); },
      sort: sort => { state.sort = sort; render(); }, view: () => { state.view = state.view === "list" ? "grid" : "list"; Store.set("view", state.view); render(); }, theme: setTheme,
      filter: (key, value) => { state.filters[key] = value; render(); }, toggleFilter: (key, value) => { state.filters[key] = removeValue(state.filters[key], value); render(); },
      clearFilters: () => { state.filters = initialFilters(); render(); }, openItem: item => ui.showDetail(item)
    });
    setTheme(state.theme); window.addEventListener("hashchange", routeFromHash); document.addEventListener("clouddrive:proxy-choice", event => ui.showProxyPicker(event.detail)); document.addEventListener("clouddrive:notice", event => ui.notice(event.detail)); routeFromHash(); refresh();
  });
})();
