# ASIA2EU 全套部署保姆级教程 (小白直通车) 🚀

本手册教你如何将网站所有的“大脑”和“图片库”全部免费托管在 Cloudflare。按照以下 4 个步骤操作，你就能彻底关掉那个昂贵的 VPS。

---

### 第一步：创建云端数据库 (D1)
1. 登录 Cloudflare 控制台，点击左侧 **Workers & Pages** -> **D1**。
2. 点击 **Create database** -> **Dashboard**，名字随便起（建议：`asia2eu-db`）。
3. 进入你刚建好的数据库，点击顶部的 **Console (控制台)**。
4. **把下面这段话原样粘贴进去并点回车运行：**
```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK( type IN ('recommend','warning') ) NOT NULL,
  date TEXT NOT NULL
);
```
*这一步做完，你的商品存储空间就开好了。*

---

### 第二步：创建云端图片库 (R2)
1. 点击 Cloudflare 左侧 **R2**。
2. 点击 **Create bucket**，名字必须叫：`asia2eubucket`。
3. 创建好后，点进这个存储桶 -> 点击顶部的 **Settings (设置)**。
4. 找到 **Public access (公开访问)** 选项，点击 **Allow Access** (它会给你一个绿色的 `.r2.dev` 结尾的链接，记下它，或者绑定你自己想用的域名)。

---

### 第三步：部署后端大脑 (Worker)
1. 点击左侧 **Workers & Pages** -> **Overview** -> **Create application** -> **Create Worker**。
2. 名字随你起（比如就叫 `asia2eu`），点击 **Deploy**。
3. 部署成功后，点击 **Edit Code (编辑代码)**。
4. **把里面的东西全部删掉，把下面的代码原样贴进去：**
*(注意：代码末尾的 imageUrl 建议换成你真实的域名或 R2 公开链接)*

```javascript
// 粘贴到 Worker 编辑器里的代码：
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // API 路由逻辑
    if (url.pathname === "/api/posts" && method === "GET") {
      const { results } = await env.D1_DB.prepare("SELECT * FROM posts ORDER BY date DESC").all();
      return Response.json(results, { headers: corsHeaders });
    }
    if (url.pathname.startsWith("/img/") && method === "GET") {
      const fileName = url.pathname.replace("/img/", "");
      const object = await env.R2_BUCKET.get(fileName);
      if (!object) return new Response("Not Found", { status: 404 });
      const headers = new Headers(); object.writeHttpMetadata(headers);
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(object.body, { headers });
    }
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) return new Response("UnAuth", { status: 401, headers: corsHeaders });

    if (url.pathname === "/api/posts" && method === "POST") {
      const { title, content, type } = await request.json();
      await env.D1_DB.prepare("INSERT INTO posts (title, content, type, date) VALUES (?, ?, ?, ?)").bind(title, content, type, new Date().toISOString()).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }
    if (url.pathname.startsWith("/api/posts/") && method === "DELETE") {
      const id = url.pathname.split("/").pop();
      await env.D1_DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }
    if (url.pathname === "/api/upload" && method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      await env.R2_BUCKET.put(fileName, file, { httpMetadata: { contentType: file.type } });
      return Response.json({ url: `${url.origin}/img/${fileName}` }, { headers: corsHeaders });
    }
    return new Response("Not Found", { status: 404 });
  }
};
```
5. 点击右上角 **Save and deploy**。
6. **重要的一步：** 回到这个 Worker 的页面，点击 **Settings** -> **Variables**。你需要添加三个东西：
   - **D1 Database Bindings**: 点击 Add，变量名填 `D1_DB`，数据库选你第一步建的。
   - **R2 Bucket Bindings**: 点击 Add，变量名填 `R2_BUCKET`，存储桶选你第二步建的。
   - **Environment Variables**: 点击 Add，变量名填 `ADMIN_PASSWORD`，值填入你自定义的**强密码**。

---

### 第四步：部署前端网页 (Pages)
1. 在本地本项目文件夹下，确认 `dist` 文件夹是最新的。
2. 在 Cloudflare 点击 **Workers & Pages** -> **Create application** -> **Pages**。
3. 点击 **Upload assets** -> 上传你的 `dist` 文件夹。
4. 部署完你会得到一个 `xxx.pages.dev` 的网址，大功告成！

---

### 💡 常用维护技巧
- **进后台**：访问 `你的域名/#admin`，密码使用你在 Worker 设置里填写的密码。 (警告：由于前端密码验证为纯文本对比，请务必保证你通过 HTTPS 访问网站并设置 Worker 环境变量为 Secret 类型)
- **发贴**：在后台填写标题、设置参数、点“Upload Image”自动插图，最后点发布。
- **删帖**：后台最底部有已发贴子列表，点红色按钮即物理删除。
- **本地开发**：如果换了 Worker 域名，记得改本地 `.env` 文件里的地址并重启。

> [!CAUTION]
> **安全警告**：务必在 Cloudflare Worker 的后台将 `ADMIN_PASSWORD` 设为 **Secret** 类型。切勿在 README 或任何公开代码中记录你的真实密码！
