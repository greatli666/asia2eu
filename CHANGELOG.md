# Asia2EU Personal Portal — 变更日志 (CHANGELOG)

所有版本的显著变更均记录于此。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

---

## [2.0.0] - 2026-04-21 — Personal Portal 全面重构

### ⚠️ 重大架构变更

原站由单页 Hash-路由应用重构为完整的 **个人门户 (Personal Portal)**，采用 React Router v6 标准路由体系。所有旧路由（`/#admin`、`/#daily` 等）已迁移至独立 URL 路径。

---

### 新增功能 (Added)

#### 基础设施 (Phase 1)
- **Tailwind CSS v4** CSS-first 配置（`@import "tailwindcss"` + `@custom-variant dark`）
- **ThemeContext** — 全局暗黑/明亮模式切换，联动系统偏好 (`prefers-color-scheme`)，持久化至 `localStorage`
- **AuthContext** — 全局管理员认证状态，密码仅驻留内存，刷新自动清除，不持久化
- **Layout 组件** — 全局包装层，提供固定导航栏 + 页脚 + 内容区
- **Navbar** — 浮动胶囊式导航，含主题切换按钮；登录后 Gear 图标变绿 + 脉冲提示点
- **Footer** — 全局页脚
- `react-router-dom` 标准路由
- Glassmorphism 工具类：`.glass`、`.glass-card`、`.glass-hover`（定义于 `index.css` `@layer utilities`）

#### 首页 - Bento Grid (Phase 2)
- **Portal 页面** (`/`) — 4 列 CSS Grid Bento 布局，`motion/react` stagger 弹簧动效
- **BioCard** — 个人简介卡片，含"Available"状态徽章
- **StatsCard** — 实时时钟（欧洲时区）
- **SocialCard** — 联系链接图标组
- **SkillsCard** — Tech Stack 技能标签云
- **ProjectsCard** — 项目展示卡，链接至 Asia2EU 子页
- **KnowledgeCard** — 知识库摘要，链接至 `/knowledge`

#### 管理后台 (Phase 3)
- **Admin 页面** (`/admin`) — 从旧 `App.tsx` 中完全独立提取
  - 全新 Glassmorphism CMS 仪表盘界面
  - 文章创建/编辑/删除，带实时 Markdown 预览
  - 图片上传至 Cloudflare R2
  - 品类管理（云端 D1 同步 CRUD）
  - 支持深色/浅色模式

#### 知识库 (Phase 4)
- **Knowledge 页面** (`/knowledge`) — 连接 Cloudflare D1 的实时知识库
- `knowledge_articles` 数据库表（含标签、摘要字段）
- Worker 新增 `/api/knowledge` RESTful 端点（GET/POST/PUT/DELETE）
- Admin 面板新增知识文章管理标签页
- **MarkdownRenderer** 组件（代码高亮、响应式图片）

---

### 变更 (Changed)

| 旧方式 | 新方式 |
|--------|--------|
| `/#admin` Hash 路由 | `/admin` 标准 URL 路由 |
| `/#daily` Hash 路由 | `/asia2eu` 路由下的 Daily Picks 视图 |
| 单文件 `App.tsx`（1317行）| 多文件模块化：`pages/`、`components/`、`contexts/` |
| 无暗色模式 | 全站暗色/浅色模式，平滑 `transition-colors 300ms` |
| `.glass-card { @apply glass... }` | 展开内联（修复 Tailwind v4 `@apply` 递归 bug） |

---

### 修复 (Fixed)

- **Tailwind CSS v4 暗色模式失效** — 补充 `@custom-variant dark (&:where(.dark, .dark *))` 声明
- **`wrangler.toml` 配置冲突** — 删除与 `main` 互斥的 `pages_build_output_dir`，分离 Worker 和 Pages 的部署命令
- **`motion/react` TypeScript 类型错误** — 为 `Variants` 配置对象添加 `import type { Variants }` 显式类型标注

---

### 技术栈快照

| 依赖 | 版本 |
|------|------|
| React | 19 |
| TypeScript | ~5.7 |
| Vite | 6 |
| Tailwind CSS | 4 |
| motion/react | 12 |
| react-router-dom | 7 |
| lucide-react | latest |
| react-markdown | latest |

---

## [1.x] - 2026-04-07 (旧版本存档)

原版 Asia2EU 单页应用：
- 单文件架构（`App.tsx` 含全部逻辑）
- Hash 路由（`/#home`、`/#admin` 等）
- Cloudflare Worker 后端（`worker.js`）
- D1 数据库：`posts`、`categories` 表
- R2 图片存储

---

> [!NOTE]
> 本 CHANGELOG 由 Antigravity AI 自动维护，每次重要功能迭代后更新。
