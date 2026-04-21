/**
 * Cloudflare Worker — Asia2EU API Backend
 *
 * Version: 2.0.0 (2026-04-21)
 *
 * Public Routes (no auth):
 *   GET  /api/posts              — List all Daily Picks posts (desc by date)
 *   GET  /api/categories         — List all categories
 *   GET  /api/knowledge          — List all knowledge articles
 *   GET  /img/:filename          — Serve image from R2
 *
 * Protected Routes (requires: Authorization: Bearer <ADMIN_PASSWORD>):
 *   POST   /api/posts            — Create post
 *   PUT    /api/posts/:id        — Update post
 *   DELETE /api/posts/:id        — Delete post
 *   POST   /api/categories       — Create category
 *   PUT    /api/categories/:id   — Update category
 *   DELETE /api/categories/:id   — Delete category
 *   POST   /api/knowledge        — Create knowledge article
 *   PUT    /api/knowledge/:id    — Update knowledge article
 *   DELETE /api/knowledge/:id    — Delete knowledge article
 *   POST   /api/upload           — Upload image to R2
 *
 * Bindings (wrangler.toml):
 *   D1_DB      — Cloudflare D1 Database
 *   R2_BUCKET  — Cloudflare R2 Bucket
 *
 * Secrets (Cloudflare Dashboard → Worker Settings):
 *   ADMIN_PASSWORD — Set as Secret type, never hardcode!
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // ── CORS Headers ────────────────────────────────────────────────
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight
    if (method === "OPTIONS")
      return new Response(null, { headers: corsHeaders });

    // ════════════════════════════════════════════════════════════════
    // PUBLIC ROUTES — No authentication required
    // ════════════════════════════════════════════════════════════════

    // GET /api/posts — List all Daily Picks (most recent first)
    if (url.pathname === "/api/posts" && method === "GET") {
      const { results } = await env.D1_DB.prepare(
        "SELECT * FROM posts ORDER BY COALESCE(NULLIF(updated_date, ''), date) DESC"
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    // GET /api/categories — List all categories (sorted by sort_order)
    if (url.pathname === "/api/categories" && method === "GET") {
      const { results } = await env.D1_DB.prepare(
        "SELECT * FROM categories ORDER BY sort_order ASC, id ASC"
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    // GET /api/knowledge — List all knowledge articles (most recent first)
    if (url.pathname === "/api/knowledge" && method === "GET") {
      const { results } = await env.D1_DB.prepare(
        "SELECT * FROM knowledge_articles ORDER BY COALESCE(NULLIF(updated_date, ''), date) DESC"
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    // GET /img/:filename — Serve image from R2 bucket
    if (url.pathname.startsWith("/img/") && method === "GET") {
      const fileName = url.pathname.replace("/img/", "");
      const object = await env.R2_BUCKET.get(fileName);
      if (!object) return new Response("Not Found", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(object.body, { headers });
    }

    // ════════════════════════════════════════════════════════════════
    // AUTH CHECK
    // ════════════════════════════════════════════════════════════════
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.ADMIN_PASSWORD}`)
      return new Response("UnAuth", { status: 401, headers: corsHeaders });

    // ════════════════════════════════════════════════════════════════
    // PROTECTED ROUTES — Daily Picks (Posts)
    // ════════════════════════════════════════════════════════════════

    // POST /api/posts — Create a new post
    if (url.pathname === "/api/posts" && method === "POST") {
      const { title, content, type, category, verified, price_status, core_params, custom_tag } = await request.json();
      await env.D1_DB.prepare(
        "INSERT INTO posts (title, content, type, category, verified, price_status, core_params, custom_tag, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        title, content, type,
        category || "", verified ? 1 : 0,
        price_status || "正常市场价",
        core_params || "", custom_tag || "",
        new Date().toISOString()
      ).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // PUT /api/posts/:id — Update an existing post
    if (url.pathname.startsWith("/api/posts/") && method === "PUT") {
      const id = url.pathname.split("/").pop();
      const { title, content, type, category, verified, price_status, core_params, custom_tag } = await request.json();
      await env.D1_DB.prepare(
        "UPDATE posts SET title=?, content=?, type=?, category=?, verified=?, price_status=?, core_params=?, custom_tag=?, updated_date=? WHERE id=?"
      ).bind(
        title, content, type,
        category || "", verified ? 1 : 0,
        price_status || "正常市场价",
        core_params || "", custom_tag || "",
        new Date().toISOString(), id
      ).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // DELETE /api/posts/:id — Delete a post
    if (url.pathname.startsWith("/api/posts/") && method === "DELETE") {
      const id = url.pathname.split("/").pop();
      await env.D1_DB.prepare("DELETE FROM posts WHERE id=?").bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // ════════════════════════════════════════════════════════════════
    // PROTECTED ROUTES — Categories
    // ════════════════════════════════════════════════════════════════

    // POST /api/categories — Create a category
    if (url.pathname === "/api/categories" && method === "POST") {
      const { name, emoji, sort_order } = await request.json();
      if (!name) return Response.json({ error: "name is required" }, { status: 400, headers: corsHeaders });
      try {
        await env.D1_DB.prepare(
          "INSERT INTO categories (name, emoji, sort_order) VALUES (?, ?, ?)"
        ).bind(name, emoji || "📦", sort_order || 0).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      } catch (e) {
        return Response.json({ error: "Category already exists or DB error" }, { status: 409, headers: corsHeaders });
      }
    }

    // PUT /api/categories/:id — Update a category
    if (url.pathname.startsWith("/api/categories/") && method === "PUT") {
      const id = url.pathname.split("/").pop();
      const { name, emoji, sort_order } = await request.json();
      await env.D1_DB.prepare(
        "UPDATE categories SET name=COALESCE(?,name), emoji=COALESCE(?,emoji), sort_order=COALESCE(?,sort_order) WHERE id=?"
      ).bind(name || null, emoji || null, sort_order ?? null, id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // DELETE /api/categories/:id — Delete a category
    if (url.pathname.startsWith("/api/categories/") && method === "DELETE") {
      const id = url.pathname.split("/").pop();
      await env.D1_DB.prepare("DELETE FROM categories WHERE id=?").bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // ════════════════════════════════════════════════════════════════
    // PROTECTED ROUTES — Knowledge Articles (v2.0)
    // ════════════════════════════════════════════════════════════════

    // POST /api/knowledge — Create a knowledge article
    if (url.pathname === "/api/knowledge" && method === "POST") {
      const { title, content, summary, tags } = await request.json();
      if (!title || !content) return Response.json({ error: "title and content required" }, { status: 400, headers: corsHeaders });
      await env.D1_DB.prepare(
        "INSERT INTO knowledge_articles (title, content, summary, tags, date) VALUES (?, ?, ?, ?, ?)"
      ).bind(title, content, summary || "", tags || "", new Date().toISOString()).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // PUT /api/knowledge/:id — Update a knowledge article
    if (url.pathname.startsWith("/api/knowledge/") && method === "PUT") {
      const id = url.pathname.split("/").pop();
      const { title, content, summary, tags } = await request.json();
      await env.D1_DB.prepare(
        "UPDATE knowledge_articles SET title=?, content=?, summary=?, tags=?, updated_date=? WHERE id=?"
      ).bind(title, content, summary || "", tags || "", new Date().toISOString(), id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // DELETE /api/knowledge/:id — Delete a knowledge article
    if (url.pathname.startsWith("/api/knowledge/") && method === "DELETE") {
      const id = url.pathname.split("/").pop();
      await env.D1_DB.prepare("DELETE FROM knowledge_articles WHERE id=?").bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // ════════════════════════════════════════════════════════════════
    // PROTECTED ROUTES — Image Upload
    // ════════════════════════════════════════════════════════════════

    // POST /api/upload — Upload image file to R2 bucket
    if (url.pathname === "/api/upload" && method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      await env.R2_BUCKET.put(fileName, file, {
        httpMetadata: { contentType: file.type },
      });
      return Response.json(
        { url: `${url.origin}/img/${fileName}` },
        { headers: corsHeaders }
      );
    }

    // Fallthrough — 404
    return new Response("Not Found", { status: 404 });
  },
};
