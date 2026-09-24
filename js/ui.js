window.CloudDriveUI = class CloudDriveUI {
  constructor(actions) { this.actions = actions; this.root = document.getElementById("app"); this.bindStatic(); }
  el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  button(text, className, callback) { const node = this.el("button", className, text); node.type = "button"; node.addEventListener("click", callback); return node; }
  bindStatic() {
    document.getElementById("search-input").addEventListener("input", event => this.actions.search(event.target.value));
    document.getElementById("refresh-button").addEventListener("click", this.actions.refresh);
    document.getElementById("theme-select").addEventListener("change", event => this.actions.theme(event.target.value));
    document.getElementById("view-button").addEventListener("click", this.actions.view);
    document.getElementById("sort-select").addEventListener("change", event => this.actions.sort(event.target.value));
    document.getElementById("filters-toggle").addEventListener("click", () => document.getElementById("filter-panel").classList.toggle("hidden"));
    document.getElementById("clear-filters").addEventListener("click", this.actions.clearFilters);
    document.getElementById("source-filter").addEventListener("change", event => this.actions.filter("source", event.target.value));
    document.getElementById("size-filter").addEventListener("change", event => this.actions.filter("size", event.target.value));
    document.getElementById("detail-close").addEventListener("click", () => this.hideOverlay("detail"));
    document.getElementById("preview-close").addEventListener("click", () => this.hideOverlay("preview"));
    document.getElementById("proxy-close").addEventListener("click", () => this.hideOverlay("proxy"));
    document.querySelectorAll(".overlay").forEach(node => node.addEventListener("click", event => { if (event.target === node) this.hideOverlay(node.id.replace("-overlay", "")); }));
  }
  hideOverlay(name) { document.getElementById(`${name}-overlay`).classList.add("hidden"); }
  setTheme(theme) { document.documentElement.dataset.theme = theme; document.getElementById("theme-select").value = theme; }
  render(state) {
    document.getElementById("search-input").value = state.query;
    document.getElementById("sort-select").value = state.sort;
    document.getElementById("source-filter").value = state.filters.source;
    document.getElementById("size-filter").value = state.filters.size;
    document.getElementById("view-button").textContent = state.view === "list" ? "▦ 网格" : "☷ 列表";
    this.renderBreadcrumb(state); this.renderFilters(state); this.renderStats(state); this.renderContent(state);
  }
  renderBreadcrumb(state) {
    const holder = document.getElementById("breadcrumbs"); holder.replaceChildren();
    const crumbs = state.searching ? [{ label: "搜索结果", route: "" }] : [{ label: "首页", route: "" }, ...state.breadcrumbs];
    crumbs.forEach((crumb, index) => { if (index) holder.append(this.el("span", "crumb-separator", "/")); const node = this.button(crumb.label, "crumb", () => this.actions.navigate(crumb.route)); if (index === crumbs.length - 1) node.disabled = true; holder.append(node); });
  }
  renderFilters(state) {
    const tagList = document.getElementById("tag-options"), extList = document.getElementById("extension-options"); tagList.replaceChildren(); extList.replaceChildren();
    const makeCheck = (value, selected, kind) => { const label = this.el("label", "check"); const input = document.createElement("input"); input.type = "checkbox"; input.checked = selected.includes(value); input.addEventListener("change", () => this.actions.toggleFilter(kind, value)); label.append(input, document.createTextNode(kind === "tags" ? value : value.toUpperCase())); return label; };
    state.options.tags.forEach(tag => tagList.append(makeCheck(tag, state.filters.tags, "tags")));
    state.options.extensions.forEach(ext => extList.append(makeCheck(ext, state.filters.extensions, "extensions")));
    document.getElementById("filter-count").textContent = `筛选 ${state.filters.tags.length + state.filters.extensions.length + (state.filters.source !== "all" ? 1 : 0) + (state.filters.size !== "all" ? 1 : 0)}`;
  }
  renderStats(state) { document.getElementById("status-line").textContent = state.message || `当前显示 ${state.items.length} 项 · 已加载 ${state.totalFiles} 个文件、${state.totalFolders} 个文件夹`; }
  icon(item) { if (item.type === "folder") return "📁"; const icons = { zip: "🗜️", rar: "🗜️", "7z": "🗜️", exe: "⚙️", pdf: "📕", png: "🖼️", jpg: "🖼️", jpeg: "🖼️", gif: "🖼️", webp: "🖼️", svg: "🖼️", txt: "📄", md: "📄", mp4: "🎬", mkv: "🎬", mp3: "🎵", wav: "🎵", js: "🟨", html: "🌐", css: "🎨" }; return icons[item.extension] || "📄"; }
  tags(item) { const holder = this.el("div", "tags"); item.tags.forEach(tag => holder.append(this.el("span", "tag", tag))); return holder; }
  itemRow(item, state) {
    const card = this.el("article", state.view === "grid" ? "file-card" : "file-row"); card.tabIndex = 0; card.setAttribute("role", "button");
    const icon = this.el("div", "file-icon", this.icon(item)); const main = this.el("div", "file-main"); main.append(this.el("div", "file-name", item.name)); if (item.tags.length) main.append(this.tags(item));
    const details = this.el("div", "file-meta");
    if (item.type === "folder") details.append(this.el("span", "folder-origin", item.virtual ? "GitHub Releases（虚拟目录）" : item.path === "release" ? "Repository 目录" : "文件夹"));
    else { details.append(this.el("span", "type", item.extension ? item.extension.toUpperCase() : "文件"), this.el("span", "size", this.formatSize(item.sizeBytes)), this.el("span", "date", this.formatDate(item.updatedAt))); }
    if (item.source === "release" && item.releaseTag) details.append(this.el("span", "release-chip", item.releaseTag));
    card.append(icon, main, details); const activate = () => item.type === "folder" ? this.actions.navigate(item.virtual ? "releases" : `repo/${item.path}`) : this.actions.openItem(item); card.addEventListener("click", activate); card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }); return card;
  }
  renderContent(state) {
    const holder = document.getElementById("file-list"); holder.className = `file-list ${state.view}`; holder.replaceChildren();
    if (!state.items.length) { const empty = this.el("div", "empty"); empty.append(this.el("div", "empty-icon", state.error ? "⚠️" : "😢"), this.el("h2", "", state.error ? "暂时无法加载文件" : "没有找到相关文件"), this.el("p", "", state.error || "请尝试更换搜索关键词，或清除筛选条件。")); holder.append(empty); return; }
    if (state.releaseGrouped) {
      let tag = null; state.items.forEach(item => { if (tag !== item.releaseTag) { tag = item.releaseTag; const group = this.el("h2", "release-heading", tag); group.append(this.el("span", "", item.releaseName || "GitHub Release")); holder.append(group); } holder.append(this.itemRow(item, state)); });
    } else state.items.forEach(item => holder.append(this.itemRow(item, state)));
  }
  formatSize(bytes) { if (!Number.isFinite(bytes)) return "大小未知"; if (!bytes) return "0 B"; const units = ["B", "KB", "MB", "GB", "TB"]; const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`; }
  formatDate(value) { return value ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)) : "更新时间未知"; }
  showDetail(item) {
    const body = document.getElementById("detail-body"); body.replaceChildren(); body.append(this.el("div", "detail-icon", this.icon(item)), this.el("h2", "", item.name)); if (item.tags.length) body.append(this.tags(item));
    const info = this.el("dl", "detail-info"); const add = (label, value) => { info.append(this.el("dt", "", label), this.el("dd", "", value)); };
    add("类型", item.extension ? item.extension.toUpperCase() : "文件"); add("大小", this.formatSize(item.sizeBytes)); add("最后更新", this.formatDate(item.updatedAt)); add("创建时间", "暂无创建时间"); add("所在目录", item.source === "release" ? "release（GitHub Releases 虚拟目录）" : item.path.split("/").slice(0, -1).join(" / ") || "首页"); add("GitHub 路径", item.source === "release" ? "GitHub Release Asset（非仓库 /release/ 目录）" : item.path); add("来源", item.source === "release" ? "GitHub Release" : "Repository");
    if (item.source === "release") { add("Release", item.releaseTag || "—"); add("Release 发布时间", this.formatDate(item.releasePublishedAt)); add("下载次数", Number.isFinite(item.downloadCount) ? String(item.downloadCount) : "暂无数据"); }
    body.append(info); const actions = this.el("div", "detail-actions");
    if (window.CloudDrivePreview.canPreview(item)) actions.append(this.button("🖼️ 预览图片", "secondary", () => this.showPreview(item)));
    actions.append(this.button("⚡ 加速下载", "primary", () => window.CloudDriveDownload.accelerated(item)), this.button("🌐 官方下载", "secondary", () => window.CloudDriveDownload.official(item)));
    if (item.githubUrl) actions.append(this.button(item.source === "release" ? "↗ 打开 Release" : "↗ 打开 GitHub", "link-button", () => window.CloudDriveDownload.open(item.githubUrl)));
    body.append(actions); document.getElementById("detail-overlay").classList.remove("hidden");
  }
  showPreview(item) { const image = document.getElementById("preview-image"), caption = document.getElementById("preview-caption"); caption.textContent = item.name; image.src = item.downloadUrl; image.alt = item.name; image.onerror = () => { caption.textContent = "图片加载失败。你可以使用官方下载打开原文件。"; image.removeAttribute("src"); }; document.getElementById("preview-overlay").classList.remove("hidden"); }
  showProxyPicker({ item, proxies }) { const holder = document.getElementById("proxy-options"); holder.replaceChildren(); proxies.forEach(proxy => holder.append(this.button(`⚡ ${proxy.name}`, "proxy-button", () => { this.hideOverlay("proxy"); window.CloudDriveDownload.open(window.CloudDriveDownload.proxied(item.downloadUrl, proxy)); }))); document.getElementById("proxy-overlay").classList.remove("hidden"); }
  notice(message) { const node = document.getElementById("toast"); node.textContent = message; node.classList.remove("hidden"); clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => node.classList.add("hidden"), 3600); }
};
