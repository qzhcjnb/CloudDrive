# CloudDrive

CloudDrive 是一个不需要后端、数据库、登录或上传功能的个人静态云盘界面。它把公开 GitHub Repository 中的目录与文件，以及 GitHub Releases 的 Assets，统一为可浏览、搜索、筛选和下载的文件库。可直接部署至 Cloudflare Pages。

## 已实现功能

- Repository 目录多级浏览、面包屑、浏览器前进/后退和刷新后保持目录（URL Hash）。
- Releases 自动显示为虚拟 `release` 目录；若仓库真的含有 `release/`，它会显示为“Repository 目录”，二者数据来源明确区分。
- 连续文件名前缀标签解析，例如 `[CS2][配置][重要] 我的设置.zip` 会显示为 `我的设置.zip` 与三个标签，原始文件名仍用于下载 URL。标签本身就是按钮，点一下即按该标签筛选。
- 全局实时搜索（文件、文件夹、标签、扩展名、路径、Release 信息），标签/格式/来源/尺寸/平台组合筛选和多种排序。
- 表头可直接点击排序（类型与名称 / 大小 / 更新时间），重复点击切换升降序，并同步 `aria-sort` 与排序下拉框。
- Release 按新版优先**折叠**为每个版本一行（默认只展开最新版，点标题展开/收起），避免上千个 Asset 一次性建行。
- Release 平台识别：从 Asset 文件名自动判断 Windows / macOS / Linux / Android / iOS / 其他，仅在 `release` 目录显示平台筛选器并带数量。
- 大列表分块渲染：搜索命中与巨大目录首批只渲染 150 行，滚动到底部再继续追加，状态栏显示“已显示 N / 总数”。
- 文件详情（含复制下载直链、复制仓库路径）、图片预览、官方下载、可配置的多条下载加速线路、列表/网格视图、浅色/深色/跟随系统主题。
- 内存运行状态 + IndexedDB 五分钟索引缓存；点击刷新会清除缓存并重新请求 API，缓存写入失败会在状态栏明确提示。
- 没有分析、广告或第三方追踪；所有 API 内容通过 `textContent` 插入，避免文件名/Release 名称造成 XSS。

## 配置 GitHub 仓库

编辑唯一配置文件 [`config/config.js`](config/config.js)：

```js
const CONFIG = {
  github: {
    owner: "YOUR_GITHUB_USERNAME",
    repo: "YOUR_REPOSITORY",
    branch: "main"
  },
  downloadProxies: [],
  cacheMinutes: 5
};
```

仓库必须公开。不要把 GitHub Personal Access Token、密码、API Key 或任何私有凭据放进静态前端。

### 文件名标签

只有文件名开头连续出现的 `[标签]` 被解析。空标签会忽略；中间或末尾的方括号不会被误判。

```text
[CS2][配置][重要] 我的设置.zip
```

显示为 `我的设置.zip`，并具有 `CS2`、`配置`、`重要` 三个标签。GitHub 原始名会保留在数据模型的 `originalName` 中。

## GitHub Releases

Release Assets 不是真实的 Repository `/release/` 文件夹。CloudDrive 通过 GitHub Releases API 读取它们，并在根目录显示一个标有“GitHub Releases（虚拟目录）”的 `release`。

如果仓库也存在真实 `release/`，它会同时存在，但带有“Repository 目录”说明，内部数据的 `source` 是 `repository`；虚拟目录与 Asset 的 `source` 是 `release`。Release Asset 的路径显示为 `release/文件名` 仅供界面导航，详情会明确说明它不是仓库目录。

## 下载加速线路

在 `config/config.js` 配置可选代理，例如：

```js
downloadProxies: [
  { name: "加速线路 1", prefix: "https://example-proxy.invalid/" },
  { name: "加速线路 2", prefix: "https://another-proxy.invalid/" }
]
```

CloudDrive 不会用跨域 HEAD 请求猜测线路状态。配置一条线路时“加速下载”会直接打开；多条时会让使用者选择。官方下载始终保留。Cloudflare Pages 的访问速度与 GitHub 原始下载速度是两个独立问题。

## GitHub API 与限制

仓库索引使用 Git Trees 的递归接口（一次请求建立本地索引），Release 使用 Releases API；搜索、筛选和排序均在浏览器内存中完成，而不是对每个文件额外请求。对于特别巨大的仓库，GitHub 可能返回 `truncated`，页面会给出提示，此时不能保证索引完整。

GitHub Repository API 通常不能低成本、可靠地提供每个文件的真正创建时间，也不能在不为每项额外请求提交记录的情况下提供准确更新时间。CloudDrive 不伪造这两个数据：Repository 文件显示“更新时间未知”和“暂无创建时间”；Release 则显示 API 提供的发布时间。Release Asset 下载次数来自 Releases API，可用于排序。

平台分类是从文件名推断的启发式规则（Rust/Go 目标三元组、`.msi`/`.dmg`/`.deb`/`AppImage` 等），无法识别的归入“其他”。

### 索引缓存

索引（仓库文件树 + Release Asset）缓存在 **IndexedDB**（数据库 `clouddrive`），而不是 localStorage：大型仓库的 Release 索引会超出 localStorage 约 5 MB 的配额，且 localStorage 写入失败是静默的。实测 `astral-sh/uv`（2248 个文件项 + 4180 个 Asset）的结构化副本约 0.4 MB，配额约 10 GB；缓存命中时刷新不会发出任何 GitHub API 请求。缓存键带 schema 版本号，模型新增字段时旧缓存自动失效。

未认证公共 API 有速率限制。达到限制、仓库不存在/私有、网络异常、空目录、无 Asset 与图片加载失败都会显示可理解的界面提示，而不会白屏。

## 本地预览

这是无构建步骤的静态网站。为了让浏览器请求 GitHub API，请通过任意静态文件服务器预览 `CloudDrive/`，不要依赖浏览器对 `file://` 的跨域限制。部署后可直接访问。

## Cloudflare Pages 部署

1. 在 GitHub 创建一个 Repository，并将整个 `CloudDrive` 文件夹的**内容**推送到该仓库根目录（或将 Pages 的根目录设置为 `CloudDrive`）。
2. 修改 `config/config.js`，填入你要作为文件源的公开 GitHub `owner`、`repo` 和 `branch`。文件源可以是该 Pages 仓库，也可以是另一个公开仓库。
3. 登录 Cloudflare Dashboard，进入 **Workers & Pages**，创建 Pages 项目并连接 GitHub。
4. 选择 CloudDrive 代码仓库。
5. 若项目根目录就是 `index.html` 所在目录：**Build command 留空**；**Output directory 填 `.`**。若保留本仓库的外层目录结构：Build command 留空，Output directory 填 `CloudDrive`。
6. 点击部署。之后每次 `git push` 都会触发 Cloudflare Pages 自动部署。
7. 可在 Pages 项目的 Custom domains 中添加自定义域名；本项目所有资源引用均为相对路径，因此不依赖站点根绝对路径。

Hash 路由形如 `/#/repo/%E6%B8%B8%E6%88%8F/CS2`，服务器只会收到根页面请求，因此 Cloudflare Pages 刷新不会出现目录路由 404。

## 项目文件

```text
CloudDrive/
├── index.html                 页面结构与相对资源入口
├── DESIGN.md                  视觉规则与 Token 说明（设计唯一依据）
├── assets/favicon.svg         本地相对路径网站图标
├── config/config.js           唯一的仓库、分支、代理配置
├── css/style.css              主视觉、组件与深浅色变量
├── css/responsive.css         手机/平板响应式布局
└── js/
    ├── app.js                 状态、Hash 路由、缓存与流程编排
    ├── github.js              Repository Git Trees API 与统一模型
    ├── releases.js            Releases API 与 Asset 标准化
    ├── parser.js              标签、扩展名、路径、数据模型工具
    ├── search.js              全局模糊搜索
    ├── filter.js              组合筛选与选项收集
    ├── sort.js                文件夹优先排序
    ├── download.js            官方/代理下载
    ├── preview.js             图片预览能力判断
    ├── storage.js             localStorage 封装（主题、视图等偏好）
    ├── cache.js               IndexedDB 索引缓存（写入失败可上报）
    └── ui.js                  骨架/行与卡片/详情/弹层/焦点与键盘行为/分块渲染/折叠
```
