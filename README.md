# ASIA2EU Personal Portal — 部署与维护手册 🚀

> **版本 2.0** | 更新于 2026-04-21

---

## 📐 项目架构

```
asia2eu/
├── src/
│   ├── App.tsx                    # 根路由配置 (ThemeProvider + AuthProvider + BrowserRouter)
│   ├── index.css                  # Tailwind v4 主配置 + Glassmorphism 工具类
│   ├── main.tsx                   # React 入口
│   ├── contexts/
│   │   ├── ThemeContext.tsx        # 全局暗黑/浅色模式上下文
│   │   └── AuthContext.tsx         # 全局管理员认证状态（内存，不持久化）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx          # 全局页面包装（Navbar + Outlet + Footer）
│   │   │   ├── Navbar.tsx          # 浮动玻璃态导航栏
│   │   │   └── Footer.tsx          # 全局页脚
│   │   └── bento/
│   │       ├── CardWrapper.tsx     # Bento 卡片基础动效包装
│   │       ├── BioCard.tsx         # 个人简介卡
│   │       ├── StatsCard.tsx       # 实时时钟卡
│   │       ├── SocialCard.tsx      # 社交链接卡
│   │       ├── SkillsCard.tsx      # Tech Stack 卡
│   │       ├── ProjectsCard.tsx    # 项目展示卡
│   │       └── KnowledgeCard.tsx   # 知识库摘要卡
│   └── pages/
│       ├── Portal.tsx              # 首页 Bento Grid (/)
│       ├── Asia2EU.tsx             # 旧版 Asia2EU 服务页 (/asia2eu)
│       ├── Knowledge.tsx           # 知识库页面 (/knowledge)
│       └── Admin.tsx               # 管理后台 (/admin)
├── worker.js                       # Cloudflare Worker 后端 API
├── wrangler.toml                   # Worker 配置（D1 + R2 bindings）
└── CHANGELOG.md                    # 版本变更日志
```

---

## 🗺️ 路由说明

| URL | 页面 | 说明 |
|-----|------|------|
| `/` | Portal | Bento Grid 个人主页 |
| `/asia2eu` | Asia2EU | 原版代购服务页面 |
| `/knowledge` | Knowledge | 知识库文章列表 |
| `/admin` | Admin | CMS 后台管理（密码保护） |

> **注意**：旧版 `/#admin` Hash 路由已废弃，请使用 `/admin`。

---

## ☁️ Cloudflare 基础设施

### 架构图

```
用户浏览器
    │
    ▼
Cloudflare Pages (asia2eu.pages.dev / delins.cn)
    │  前端静态资源 (React SPA)
    │
    ▼
Cloudflare Worker (asia2eu.lizhilianggreat.workers.dev)
    │  RESTful API 后端
    ├── D1 Database (asia2eu) — 文章、品类、知识库数据
    └── R2 Bucket (asia2eubucket) — 图片存储
```

---

## 🗄️ 数据库结构 (D1)

### `posts` 表 — Daily Picks 文章
```sql
CREATE TABLE posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,          -- Markdown 格式
  type         TEXT CHECK(type IN ('recommend','warning')) NOT NULL,
  category     TEXT DEFAULT '',
  verified     INTEGER DEFAULT 0,       -- 0=未验证, 1=已验证
  price_status TEXT DEFAULT '正常市场价',
  core_params  TEXT DEFAULT '',
  custom_tag   TEXT DEFAULT '',
  date         TEXT NOT NULL,           -- ISO 8601
  updated_date TEXT DEFAULT ''
);
```

### `categories` 表 — 品类管理
```sql
CREATE TABLE categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  emoji      TEXT DEFAULT '📦',
  sort_order INTEGER DEFAULT 0
);
```

### `knowledge_articles` 表 — 知识库 (v2.0 新增)
```sql
CREATE TABLE knowledge_articles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,            -- Markdown 格式
  summary    TEXT DEFAULT '',          -- 列表页摘要
  tags       TEXT DEFAULT '',          -- 逗号分隔标签
  date       TEXT NOT NULL,
  updated_date TEXT DEFAULT ''
);
```

> **迁移方式**：在 Cloudflare D1 控制台的 Console 中执行上述 `CREATE TABLE` SQL。

---

## 🔌 Worker API 端点

### 公开端点（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取所有 Daily Picks |
| GET | `/api/categories` | 获取所有品类 |
| GET | `/api/knowledge` | 获取所有知识库文章 |
| GET | `/img/:filename` | 从 R2 获取图片 |

### 受保护端点（需 `Authorization: Bearer <ADMIN_PASSWORD>`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:id` | 更新文章 |
| DELETE | `/api/posts/:id` | 删除文章 |
| POST | `/api/categories` | 创建品类 |
| PUT | `/api/categories/:id` | 更新品类 |
| DELETE | `/api/categories/:id` | 删除品类 |
| POST | `/api/knowledge` | 创建知识文章 |
| PUT | `/api/knowledge/:id` | 更新知识文章 |
| DELETE | `/api/knowledge/:id` | 删除知识文章 |
| POST | `/api/upload` | 上传图片到 R2 |

---

## 🚀 首次部署流程

### 第一步：D1 数据库初始化

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **D1**
2. 创建数据库，名称：`asia2eu`（记录 database_id）
3. 在 D1 Console 中依次执行以下三个建表语句（见上方《数据库结构》章节）

### 第二步：R2 图床创建

1. 左侧菜单 → **R2**
2. 创建 Bucket，名称：`asia2eubucket`
3. Settings → **Public access** → Allow Access

### 第三步：部署 Worker 后端

```bash
# 在项目根目录
npx wrangler deploy
```

在 Cloudflare Worker 控制台 → Settings → Variables 中添加：
- **D1 Database Binding**: 变量名 `D1_DB`，选择步骤一创建的数据库
- **R2 Bucket Binding**: 变量名 `R2_BUCKET`，选择步骤二的存储桶
- **Secret**: 变量名 `ADMIN_PASSWORD`，填入强密码（**必须设为 Secret 类型**）

### 第四步：部署前端 Pages

```bash
npm run build
mv wrangler.toml wrangler.toml.bak
npx wrangler pages deploy dist --project-name asia2eu
mv wrangler.toml.bak wrangler.toml
```

---

## 🔄 日常更新流程

```bash
# 1. 修改代码
# 2. TypeScript 检查
npm run lint

# 3. 构建
npm run build

# 4. 推送 GitHub
git add .
git commit -m "feat/fix: description"
git push

# 5. 部署前端到 Pages
mv wrangler.toml wrangler.toml.bak
npx wrangler pages deploy dist --project-name asia2eu
mv wrangler.toml.bak wrangler.toml

# 6. 部署后端 Worker (仅 worker.js 有变更时)
npx wrangler deploy
```

---

## 🔐 管理后台使用

1. 访问 `https://你的域名/admin`
2. 输入在 Cloudflare Worker 中设置的 `ADMIN_PASSWORD`
3. 登录后 Navbar 齿轮图标变绿 + 脉冲点
4. 支持：发布/编辑/删除 Daily Picks 文章、管理品类、上传图片、管理知识库文章

> [!CAUTION]
> **安全**：`ADMIN_PASSWORD` 必须设为 Cloudflare Worker 的 **Secret** 类型，切勿明文写入代码或 README。

---

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000

# TypeScript 检查
npm run lint

# 生产构建
npm run build
```

创建 `.env` 文件配置 Worker 地址：
```env
VITE_WORKER_URL=https://asia2eu.lizhilianggreat.workers.dev
```

---

## 🎨 设计系统

| 元素 | 规格 |
|------|------|
| 字体 | Inter (Google Fonts) |
| 风格 | Glassmorphism (`backdrop-blur`, `bg-white/70`) |
| 暗色 | Slate-950 背景，White/5 卡片 |
| 亮色 | Slate-50 背景，White/70 卡片 |
| 主色 | Blue-600 |
| 动效 | Framer Motion spring，stagger 0.1s |
| 工具类 | `.glass` `.glass-card` `.glass-hover`（`index.css`） |

---

> [!NOTE]
> 详细版本变更历史见 [CHANGELOG.md](./CHANGELOG.md)
