/* CloudDrive UI layer — presentation only. All API text is injected with
   textContent; inline SVG markup below is a fixed internal constant. */

const CLOUDDRIVE_ICONS = {
  folder: '<path d="M3 7.4A2.4 2.4 0 0 1 5.4 5h3.5c.6 0 1.2.2 1.6.7l1 1.2h7.1A2.4 2.4 0 0 1 21 9.3v7.3a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 16.6z"/>',
  archive: '<path d="M3.4 7.5 4.4 5h15.2l1 2.5"/><path d="M4.8 7.5h14.4V18a1.5 1.5 0 0 1-1.5 1.5H6.3A1.5 1.5 0 0 1 4.8 18z"/><path d="M10 11.2h4"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.6-4.6 3.2 3.2 2.6-2.4 4.6 4.3"/>',
  video: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m10.2 9.4 5 2.6-5 2.6z"/>',
  audio: '<path d="M9 17V7.4l9-2V15"/><circle cx="6.8" cy="17" r="2.2"/><circle cx="15.8" cy="15" r="2.2"/>',
  code: '<path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>',
  doc: '<path d="M6.5 3.8h7l4.5 4.5V20a.5.5 0 0 1-.5.5H6.5A.5.5 0 0 1 6 20V4.3a.5.5 0 0 1 .5-.5Z"/><path d="M13.5 3.8V8.3H18"/><path d="M9 12.6h6M9 16h4"/>',
  app: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3.2"/><path d="M8.4 12h7.2M12 8.4v7.2"/>',
  file: '<path d="M6.5 3.8h7l4.5 4.5V20a.5.5 0 0 1-.5.5H6.5A.5.5 0 0 1 6 20V4.3a.5.5 0 0 1 .5-.5Z"/><path d="M13.5 3.8V8.3H18"/>',
  alert: '<path d="M12 4.6 20.6 19.4H3.4z"/><path d="M12 10v4"/><path d="M12 16.8h.01"/>',
  empty: '<circle cx="12" cy="12" r="8.5"/><path d="M8.6 14.2a4.6 4.6 0 0 0 6.8 0"/><path d="M9.2 9.6h.01M14.8 9.6h.01"/>',
  bolt: '<path d="M13.4 3 5.6 13.8h4.7L10.6 21l7.8-10.8h-4.7z"/>',
  download: '<path d="M12 4.2v10.4"/><path d="m8 10.9 4 4 4-4"/><path d="M5 19.4h14"/>',
  external: '<path d="M14 4.8h5.2V10"/><path d="M19.2 4.8 11 13"/><path d="M18 14v4.7a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5H10"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  list: '<path d="M4 6.8h16M4 12h16M4 17.2h16"/>',
  preview: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10.2" r="1.5"/><path d="m4.4 17.4 4.4-4.4 3.1 3.1 2.6-2.4 4.5 4.2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4.5A.5.5 0 0 1 4 14.5v-10A.5.5 0 0 1 4.5 4h10a.5.5 0 0 1 .5.5V5"/>'
};

const CLOUDDRIVE_EXT_ICON = {
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive", bz2: "archive", xz: "archive",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", bmp: "image", avif: "image", ico: "image",
  mp4: "video", mkv: "video", mov: "video", webm: "video", avi: "video", flv: "video",
  mp3: "audio", wav: "audio", flac: "audio", m4a: "audio", ogg: "audio", aac: "audio",
  js: "code", mjs: "code", cjs: "code", ts: "code", tsx: "code", jsx: "code", json: "code",
  html: "code", htm: "code", css: "code", scss: "code", py: "code", c: "code", h: "code",
  cpp: "code", cs: "code", java: "code", go: "code", rs: "code", rb: "code", php: "code",
  sh: "code", bat: "code", ps1: "code", yml: "code", yaml: "code", xml: "code", sql: "code", lua: "code",
  exe: "app", msi: "app", apk: "app", dmg: "app", appimage: "app", deb: "app", rpm: "app",
  pdf: "doc", txt: "doc", md: "doc", doc: "doc", docx: "doc", rtf: "doc", csv: "doc",
  xls: "doc", xlsx: "doc", ppt: "doc", pptx: "doc", epub: "doc"
};

const CLOUDDRIVE_PLATFORM_LABELS = { all: "全部平台", windows: "Windows", macos: "macOS", linux: "Linux", android: "Android", ios: "iOS", other: "其他" };
const CLOUDDRIVE_RENDER_CHUNK = 150;

function clouddriveIconNode(name, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.7");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  if (className) svg.setAttribute("class", className);
  svg.innerHTML = CLOUDDRIVE_ICONS[name] || CLOUDDRIVE_ICONS.file;
  return svg;
}

function clouddriveIconName(item) {
  if (item.type === "folder") return "folder";
  return CLOUDDRIVE_EXT_ICON[item.extension] || "file";
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])';

window.CloudDriveUI = class CloudDriveUI {
  constructor(actions) {
    this.actions = actions;
    this.overlayStack = [];
    this.lastFocus = null;
    this.lastState = null;
    this.expandedReleases = null;
    this.expandedRoute = null;
    this.pending = [];
    this.cursor = 0;
    this.batchHost = null;
    this.sentinel = null;
    this.observer = null;
    this.progress = { shown: 0, total: 0 };
    this.bindStatic();
    this.bindKeyboard();
  }

  /* --------------------------------------------------------- helpers */

  el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  button(text, className, callback) {
    const node = this.el("button", className, text);
    node.type = "button";
    node.addEventListener("click", callback);
    return node;
  }

  icon(name, className) { return clouddriveIconNode(name, className); }

  focusables(panel) { return panel ? [...panel.querySelectorAll(FOCUSABLE)] : []; }

  /* ---------------------------------------------------------- wiring */

  bindStatic() {
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");
    const filtersToggle = document.getElementById("filters-toggle");
    const filterPanel = document.getElementById("filter-panel");

    searchInput.addEventListener("input", event => {
      searchClear.hidden = !event.target.value;
      this.actions.search(event.target.value);
    });
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchClear.hidden = true;
      this.actions.search("");
      searchInput.focus();
    });
    document.getElementById("refresh-button").addEventListener("click", this.actions.refresh);
    document.getElementById("theme-select").addEventListener("change", event => this.actions.theme(event.target.value));
    document.getElementById("view-button").addEventListener("click", this.actions.view);
    document.getElementById("sort-select").addEventListener("change", event => this.actions.sort(event.target.value));
    document.getElementById("platform-filter").addEventListener("change", event => this.actions.filter("platform", event.target.value));
    filtersToggle.addEventListener("click", () => {
      const open = filterPanel.classList.toggle("hidden") === false;
      filtersToggle.setAttribute("aria-expanded", String(open));
    });
    document.getElementById("clear-filters").addEventListener("click", this.actions.clearFilters);
    document.getElementById("source-filter").addEventListener("change", event => this.actions.filter("source", event.target.value));
    document.getElementById("size-filter").addEventListener("change", event => this.actions.filter("size", event.target.value));
    document.querySelectorAll(".head-sort").forEach(node => node.addEventListener("click", () => this.actions.sortBy(node.dataset.sort)));

    document.getElementById("detail-close").addEventListener("click", () => this.hideOverlay("detail"));
    document.getElementById("preview-close").addEventListener("click", () => this.hideOverlay("preview"));
    document.getElementById("proxy-close").addEventListener("click", () => this.hideOverlay("proxy"));
    document.querySelectorAll(".overlay").forEach(node => node.addEventListener("click", event => {
      if (event.target === node) this.hideOverlay(node.id.replace("-overlay", ""));
    }));
  }

  bindKeyboard() {
    document.addEventListener("keydown", event => {
      const name = this.overlayStack[this.overlayStack.length - 1];
      if (!name) return;
      if (event.key === "Escape") { event.preventDefault(); this.hideOverlay(name); return; }
      if (event.key !== "Tab") return;
      const panel = this.panelFor(name);
      const items = this.focusables(panel);
      if (!items.length) { event.preventDefault(); panel.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  panelFor(name) {
    return document.querySelector(`#${name}-overlay .drawer, #${name}-overlay .preview, #${name}-overlay .proxy-picker`);
  }

  openOverlay(name) {
    const overlay = document.getElementById(`${name}-overlay`);
    if (!overlay) return;
    if (overlay.classList.contains("hidden")) {
      this.overlayStack.push(name);
      this.lastFocus = document.activeElement;
    }
    overlay.classList.remove("hidden");
    document.body.classList.add("overlay-open");
    const panel = this.panelFor(name);
    requestAnimationFrame(() => {
      if (!panel) return;
      (this.focusables(panel)[0] || panel).focus();
    });
  }

  hideOverlay(name) {
    const overlay = document.getElementById(`${name}-overlay`);
    if (!overlay || overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    this.overlayStack = this.overlayStack.filter(item => item !== name);
    if (name === "preview") {
      const image = document.getElementById("preview-image");
      image.removeAttribute("src");
      image.alt = "";
    }
    if (!this.overlayStack.length) {
      document.body.classList.remove("overlay-open");
      const target = this.lastFocus;
      this.lastFocus = null;
      if (target && typeof target.focus === "function" && document.contains(target)) target.focus();
    }
  }

  /* --------------------------------------------------------- theming */

  setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.getElementById("theme-select").value = theme;
  }

  /* ---------------------------------------------------------- render */

  render(state) {
    this.lastState = state;

    const searchInput = document.getElementById("search-input");
    searchInput.value = state.query;
    document.getElementById("search-clear").hidden = !state.query;

    document.getElementById("sort-select").value = state.sort;
    document.getElementById("source-filter").value = state.filters.source;
    document.getElementById("size-filter").value = state.filters.size;

    const viewButton = document.getElementById("view-button");
    const nextView = state.view === "list" ? "grid" : "list";
    viewButton.replaceChildren(
      this.icon(nextView),
      this.el("span", "", state.view === "list" ? "网格" : "列表")
    );
    viewButton.setAttribute("aria-label", state.view === "list" ? "切换到网格视图" : "切换到列表视图");

    this.renderBreadcrumb(state);
    this.renderFilters(state);
    this.updatePlatform(state);
    this.updateHeadSort(state);
    this.updateFileHead(state);
    this.renderContent(state);
    this.renderStatus(state);
  }

  renderBreadcrumb(state) {
    const holder = document.getElementById("breadcrumbs");
    holder.replaceChildren();
    const crumbs = state.searching
      ? [{ label: "搜索结果", route: "" }]
      : [{ label: "首页", route: "" }, ...state.breadcrumbs];
    crumbs.forEach((crumb, index) => {
      if (index) holder.append(this.el("span", "crumb-separator", "/"));
      const node = this.button(crumb.label, "crumb", () => this.actions.navigate(crumb.route));
      if (index === crumbs.length - 1) {
        node.disabled = true;
        node.setAttribute("aria-current", "page");
      }
      holder.append(node);
    });
  }

  renderFilters(state) {
    const tagList = document.getElementById("tag-options");
    const extList = document.getElementById("extension-options");
    tagList.replaceChildren();
    extList.replaceChildren();
    const makeCheck = (value, selected, kind) => {
      const label = this.el("label", "check");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = selected.includes(value);
      input.addEventListener("change", () => this.actions.toggleFilter(kind, value));
      label.append(input, document.createTextNode(kind === "tags" ? value : value.toUpperCase()));
      return label;
    };
    state.options.tags.forEach(tag => tagList.append(makeCheck(tag, state.filters.tags, "tags")));
    state.options.extensions.forEach(ext => extList.append(makeCheck(ext, state.filters.extensions, "extensions")));

    const count = state.filters.tags.length + state.filters.extensions.length
      + (state.filters.source !== "all" ? 1 : 0) + (state.filters.size !== "all" ? 1 : 0)
      + (state.filters.platform && state.filters.platform !== "all" ? 1 : 0);
    document.getElementById("filter-count").textContent = `筛选 ${count}`;

    const toggle = document.getElementById("filters-toggle");
    toggle.setAttribute("aria-expanded", String(!document.getElementById("filter-panel").classList.contains("hidden")));
  }

  updatePlatform(state) {
    const field = document.getElementById("platform-field");
    const select = document.getElementById("platform-filter");
    if (!state.showPlatform) { field.classList.add("hidden"); return; }
    field.classList.remove("hidden");
    const counts = state.platformCounts || {};
    select.replaceChildren();
    ["all", "windows", "macos", "linux", "android", "ios", "other"].forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      const total = key === "all" ? (state.platformTotal || 0) : (counts[key] || 0);
      option.textContent = `${CLOUDDRIVE_PLATFORM_LABELS[key]}（${total}）`;
      select.append(option);
    });
    select.value = state.filters.platform || "all";
  }

  updateHeadSort(state) {
    const [key, direction] = state.sort.split("-");
    document.querySelectorAll(".head-sort").forEach(button => {
      const active = button.dataset.sort === key;
      const cell = button.closest(".head-cell");
      if (cell) cell.setAttribute("aria-sort", active ? (direction === "asc" ? "ascending" : "descending") : "none");
      const caret = button.querySelector(".head-caret");
      if (caret) caret.textContent = active ? (direction === "asc" ? "↑" : "↓") : "";
    });
  }

  renderStatus(state) {
    const status = document.getElementById("status-line");
    if (state.loading) { status.textContent = "正在从 GitHub 加载文件列表…"; status.dataset.kind = "busy"; return; }
    if (state.error) { status.textContent = state.error; status.dataset.kind = "error"; return; }
    if (state.message) { status.textContent = state.message; status.dataset.kind = "warn"; return; }
    status.textContent = this.progressText(state);
    status.dataset.kind = "count";
  }

  progressText(state) {
    const total = state.items.length;
    if (!total) return "当前结果 0 项";
    const shown = this.progress ? this.progress.shown : total;
    if (shown >= total) return `当前结果 ${total} 项`;
    return this.progress.grouped
      ? `当前结果 ${total} 项 · 已展开 ${shown} 项`
      : `当前结果 ${total} 项 · 已显示 ${shown} 项`;
  }

  updateProgressText() {
    const state = this.lastState;
    if (!state || state.loading || state.error || state.message) return;
    const status = document.getElementById("status-line");
    status.textContent = this.progressText(state);
    status.dataset.kind = "count";
  }

  updateFileHead(state) {
    document.getElementById("file-head").hidden = state.view === "grid" || !state.items.length;
  }

  /* ------------------------------------------------------------ rows */

  formatSize(bytes) {
    if (!Number.isFinite(bytes)) return "大小未知";
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
  }

  formatDate(value) {
    return value
      ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value))
      : "更新时间未知";
  }

  tags(item) {
    const holder = this.el("div", "tags");
    item.tags.forEach(tag => holder.append(this.tagButton(tag)));
    return holder;
  }

  /* Tag chips double as one-click filters. They sit above the stretched row
     hit area, so clicking a tag filters instead of opening the file. */
  tagButton(tag, active) {
    const button = this.el("button", active ? "tag tag-button is-active" : "tag tag-button", tag);
    button.type = "button";
    button.title = `按标签“${tag}”筛选`;
    button.setAttribute("aria-label", `按标签“${tag}”筛选`);
    if (active) button.setAttribute("aria-pressed", "true");
    button.addEventListener("click", () => this.actions.toggleFilter("tags", tag));
    return button;
  }

  originCell(item) {
    const holder = this.el("span", "cell cell-origin");
    if (item.type === "folder") {
      const chip = item.virtual
        ? this.el("span", "chip chip-release", "Releases 虚拟目录")
        : item.path === "release"
          ? this.el("span", "chip chip-repo", "Repository 目录")
          : this.el("span", "chip chip-folder", "文件夹");
      holder.append(chip);
      return holder;
    }
    holder.append(this.el("span", "chip chip-type", item.extension ? item.extension.toUpperCase() : "文件"));
    if (item.source === "release" && item.platform && item.platform !== "other") {
      holder.append(this.el("span", "chip chip-platform", CLOUDDRIVE_PLATFORM_LABELS[item.platform] || item.platform));
    }
    if (item.source === "release" && item.releaseTag) holder.append(this.el("span", "chip chip-release", item.releaseTag));
    return holder;
  }

  rowBody(item, state) {
    const nameCell = this.el("span", "cell cell-name");
    const iconCell = this.el("span", "cell-icon");
    iconCell.append(this.icon(clouddriveIconName(item)));
    const open = this.el("button", "row-open");
    open.type = "button";
    open.append(this.el("span", "file-name", item.name));
    open.addEventListener("click", () => this.activate(item));
    nameCell.append(iconCell, open);

    const tagCell = this.el("span", "cell cell-tags");
    item.tags.forEach(tag => tagCell.append(this.tagButton(tag, state.filters.tags.includes(tag))));

    const sizeCell = this.el("span", "cell cell-size mono", item.type === "folder" ? "—" : this.formatSize(item.sizeBytes));
    const dateCell = this.el("span", "cell cell-date mono", item.type === "folder" ? "—" : this.formatDate(item.updatedAt));

    return [nameCell, tagCell, this.originCell(item), sizeCell, dateCell];
  }

  rowItem(item, state) {
    const li = this.el("li", item.type === "folder" ? "row row-folder" : "row");
    this.rowBody(item, state).forEach(cell => li.append(cell));
    return li;
  }

  cardItem(item, state) {
    const li = this.el("li", "card");
    const button = this.el("button", "card-open");
    button.type = "button";
    const icon = this.el("span", "card-icon");
    icon.append(this.icon(clouddriveIconName(item)));
    button.append(icon, this.el("span", "file-name", item.name));

    const meta = this.el("span", "card-meta mono");
    if (item.type === "folder") meta.textContent = item.virtual ? "Releases 虚拟目录" : item.path === "release" ? "Repository 目录" : "文件夹";
    else meta.textContent = `${item.extension ? item.extension.toUpperCase() : "文件"} · ${this.formatSize(item.sizeBytes)}`;
    button.append(meta);
    button.addEventListener("click", () => this.activate(item));
    li.append(button);

    if (item.tags.length) {
      const row = this.el("span", "card-tags");
      item.tags.forEach(tag => row.append(this.tagButton(tag, state.filters.tags.includes(tag))));
      li.append(row);
    }
    return li;
  }

  activate(item) {
    if (item.type === "folder") this.actions.navigate(item.virtual ? "releases" : `repo/${item.path}`);
    else this.openDetail(item);
  }

  /* ------------------------------------------------- loading / empty */

  skeleton(view) {
    const wrap = this.el("div", "skeleton");
    wrap.setAttribute("aria-hidden", "true");
    if (view === "grid") {
      const ul = this.el("ul", "cards");
      for (let i = 0; i < 8; i++) {
        const li = this.el("li", "card");
        const box = this.el("div", "card-open sk-card");
        box.append(this.el("span", "sk sk-icon"), this.el("span", "sk sk-line w60"), this.el("span", "sk sk-line w40"));
        li.append(box);
        ul.append(li);
      }
      wrap.append(ul);
      return wrap;
    }
    const ul = this.el("ul", "rows");
    for (let i = 0; i < 9; i++) {
      const li = this.el("li", "row");
      const name = this.el("span", "cell cell-name");
      name.append(this.el("span", "cell-icon sk sk-icon"), this.el("span", "sk sk-line"));
      const tag = this.el("span", "cell cell-tags");
      tag.append(this.el("span", "sk sk-chip"));
      const origin = this.el("span", "cell cell-origin");
      origin.append(this.el("span", "sk sk-chip"));
      const size = this.el("span", "cell cell-size");
      size.append(this.el("span", "sk sk-line w40"));
      const date = this.el("span", "cell cell-date");
      date.append(this.el("span", "sk sk-line w60"));
      li.append(name, tag, origin, size, date);
      ul.append(li);
    }
    wrap.append(ul);
    return wrap;
  }

  emptyState(state) {
    const empty = this.el("div", "empty");
    const icon = this.el("div", "empty-icon");
    icon.append(this.icon(state.error ? "alert" : "empty"));
    empty.append(
      icon,
      this.el("h2", "", state.error ? "暂时无法加载文件" : "没有找到相关文件"),
      this.el("p", "", state.error || "请尝试更换搜索关键词，或清除筛选条件。")
    );
    if (state.error) {
      const retry = this.button("重试", "primary retry-button", () => this.actions.refresh());
      empty.append(retry);
    }
    return empty;
  }

  /* ------------------------------------------------- content render */

  renderContent(state) {
    const holder = document.getElementById("file-list");
    holder.dataset.view = state.view;
    holder.setAttribute("aria-busy", String(Boolean(state.loading)));
    this.stopObserver();
    this.sentinel = null;
    this.batchHost = null;
    this.pending = [];
    this.cursor = 0;
    this.progress = { shown: 0, total: state.items.length, grouped: false };
    holder.replaceChildren();

    if (state.loading && !state.items.length) { holder.append(this.skeleton(state.view)); return; }
    if (!state.items.length) { holder.append(this.emptyState(state)); return; }

    if (state.releaseGrouped) this.renderAccordion(state);
    else this.renderFlat(state);
    this.updateProgressText();
  }

  /* Long flat lists (search hits, huge directories) render in chunks so the
     first paint stays cheap; the rest streams in as the sentinel scrolls in. */
  renderFlat(state) {
    const list = this.el("ul", state.view === "grid" ? "cards" : "rows");
    document.getElementById("file-list").append(list);
    this.batchHost = list;
    this.pending = state.items;
    this.appendBatch();
  }

  appendBatch() {
    if (!this.batchHost) return;
    if (this.sentinel) { this.sentinel.remove(); this.sentinel = null; }
    const view = this.lastState.view;
    const slice = this.pending.slice(this.cursor, this.cursor + CLOUDDRIVE_RENDER_CHUNK);
    const fragment = document.createDocumentFragment();
    slice.forEach(item => fragment.append(view === "grid" ? this.cardItem(item, this.lastState) : this.rowItem(item, this.lastState)));
    this.batchHost.append(fragment);
    this.cursor += slice.length;
    this.progress = { shown: this.cursor, total: this.pending.length, grouped: false };
    if (this.cursor < this.pending.length) {
      this.sentinel = this.el("li", "sentinel");
      this.sentinel.setAttribute("aria-hidden", "true");
      this.batchHost.append(this.sentinel);
      this.observeSentinel();
    } else {
      this.stopObserver();
    }
    this.updateProgressText();
  }

  observeSentinel() {
    if (!this.observer) {
      this.observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) this.appendBatch();
      }, { rootMargin: "800px 0px" });
    }
    if (this.sentinel) this.observer.observe(this.sentinel);
  }

  stopObserver() { if (this.observer) this.observer.disconnect(); }

  /* Releases collapse to one row per version (newest expanded) so a repo with
     thousands of assets does not build thousands of rows up front. */
  renderAccordion(state) {
    const holder = document.getElementById("file-list");
    if (this.expandedRoute !== state.route) {
      this.expandedRoute = state.route;
      this.expandedReleases = null;
    }
    const groups = [];
    state.items.forEach(item => {
      const last = groups[groups.length - 1];
      if (last && last.tag === item.releaseTag) last.items.push(item);
      else groups.push({ tag: item.releaseTag, name: item.releaseName, items: [item] });
    });
    if (!this.expandedReleases) this.expandedReleases = new Set(groups.length ? [groups[0].tag] : []);

    let shown = 0;
    groups.forEach(group => {
      const expanded = this.expandedReleases.has(group.tag);
      if (expanded) shown += group.items.length;
      const section = this.el("section", "release-group");
      const heading = this.el("button", "release-heading");
      heading.type = "button";
      heading.setAttribute("aria-expanded", String(expanded));
      const caret = this.el("span", "release-caret");
      caret.setAttribute("aria-hidden", "true");
      caret.textContent = expanded ? "−" : "+";
      const published = group.items[0].releasePublishedAt;
      heading.append(
        caret,
        this.el("span", "release-tag", group.tag),
        this.el("span", "release-name", group.name || "GitHub Release"),
        this.el("span", "release-meta mono", `${group.items.length} 个文件${published ? ` · ${this.formatDate(published)}` : ""}`)
      );
      heading.addEventListener("click", () => {
        if (this.expandedReleases.has(group.tag)) this.expandedReleases.delete(group.tag);
        else this.expandedReleases.add(group.tag);
        if (this.lastState) this.renderContent(this.lastState);
      });
      section.append(heading);
      if (expanded) {
        const list = this.el("ul", "rows");
        const fragment = document.createDocumentFragment();
        group.items.forEach(item => fragment.append(this.rowItem(item, state)));
        list.append(fragment);
        section.append(list);
      }
      holder.append(section);
    });
    this.progress = { shown, total: state.items.length, grouped: true };
  }

  /* --------------------------------------------------------- details */

  copy(text, label) {
    const done = () => this.notice(`${label}已复制。`);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => this.notice("复制失败，请手动选择文本。"));
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    try { document.execCommand("copy"); done(); } catch { this.notice("复制失败，请手动选择文本。"); }
    area.remove();
  }

  openDetail(item) {
    const body = document.getElementById("detail-body");
    body.replaceChildren();

    const head = this.el("div", "detail-head");
    const iconWrap = this.el("div", "detail-icon");
    iconWrap.append(this.icon(clouddriveIconName(item)));
    head.append(iconWrap, this.el("h2", "", item.name));
    body.append(head);
    if (item.tags.length) body.append(this.tags(item));

    const info = this.el("dl", "detail-info");
    const add = (label, value, mono) => {
      info.append(this.el("dt", "", label), this.el("dd", mono ? "mono" : "", value));
    };
    add("类型", item.extension ? item.extension.toUpperCase() : "文件");
    add("大小", this.formatSize(item.sizeBytes), true);
    add("最后更新", this.formatDate(item.updatedAt), true);
    add("创建时间", "暂无创建时间");
    add("所在目录", item.source === "release" ? "release（GitHub Releases 虚拟目录）" : item.path.split("/").slice(0, -1).join(" / ") || "首页");
    add("GitHub 路径", item.source === "release" ? "GitHub Release Asset（非仓库 /release/ 目录）" : item.path, true);
    add("来源", item.source === "release" ? "GitHub Release" : "Repository");
    if (item.platform && item.platform !== "other") add("平台", CLOUDDRIVE_PLATFORM_LABELS[item.platform] || item.platform);
    if (item.source === "release") {
      add("Release", item.releaseTag || "—");
      add("Release 发布时间", this.formatDate(item.releasePublishedAt), true);
      add("下载次数", Number.isFinite(item.downloadCount) ? String(item.downloadCount) : "暂无数据", true);
    }
    body.append(info);

    const actions = this.el("div", "detail-actions");
    if (window.CloudDrivePreview.canPreview(item)) {
      const preview = this.button("预览图片", "secondary", () => this.showPreview(item));
      preview.prepend(this.icon("preview"));
      actions.append(preview);
    }
    const fast = this.button("加速下载", "primary", () => window.CloudDriveDownload.accelerated(item));
    fast.prepend(this.icon("bolt"));
    const official = this.button("官方下载", "secondary", () => window.CloudDriveDownload.official(item));
    official.prepend(this.icon("download"));
    actions.append(fast, official);

    if (item.downloadUrl) {
      const copyUrl = this.button("复制下载直链", "secondary", () => this.copy(item.downloadUrl, "下载直链"));
      copyUrl.prepend(this.icon("copy"));
      actions.append(copyUrl);
    }
    const copyPath = this.button("复制仓库路径", "secondary", () => this.copy(item.path, "路径"));
    copyPath.prepend(this.icon("copy"));
    actions.append(copyPath);

    if (item.githubUrl) {
      actions.append(this.button(item.source === "release" ? "打开 Release" : "打开 GitHub", "link-button", () => window.CloudDriveDownload.open(item.githubUrl)));
    }
    body.append(actions);

    this.openOverlay("detail");
  }

  showPreview(item) {
    const image = document.getElementById("preview-image");
    const caption = document.getElementById("preview-caption");
    caption.textContent = item.name;
    image.alt = item.name;
    image.onerror = () => {
      caption.textContent = "图片加载失败。你可以使用官方下载打开原文件。";
      image.removeAttribute("src");
    };
    image.src = item.downloadUrl;
    this.openOverlay("preview");
  }

  showProxyPicker({ item, proxies }) {
    const holder = document.getElementById("proxy-options");
    holder.replaceChildren();
    proxies.forEach(proxy => {
      const button = this.button(proxy.name, "proxy-button", () => {
        this.hideOverlay("proxy");
        window.CloudDriveDownload.open(window.CloudDriveDownload.proxied(item.downloadUrl, proxy));
      });
      button.prepend(this.icon("bolt"));
      holder.append(button);
    });
    this.openOverlay("proxy");
  }

  notice(message) {
    const node = document.getElementById("toast");
    node.textContent = message;
    node.classList.remove("hidden");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => node.classList.add("hidden"), 3600);
  }
};
