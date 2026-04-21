/**
 * Admin Panel Page
 *
 * Full-featured CMS dashboard for managing content.
 * Features:
 *   - Password authentication against the Cloudflare Worker backend
 *   - Tab 1 — Daily Picks: Create/Edit/Delete posts with live Markdown preview
 *   - Tab 1 — Image upload to Cloudflare R2
 *   - Tab 1 — Cloud-synced category management (CRUD against D1)
 *   - Tab 2 — Knowledge Base: Create/Edit/Delete knowledge articles
 *   - Glassmorphism styling consistent with the Portal design system
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Lock, LogOut, Loader2, Camera, CheckCircle2,
  Trash2, Pencil, Plus, FolderOpen, BookOpen, Tag
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface DailyPost {
  id: number;
  title: string;
  content: string;
  type: 'recommend' | 'warning';
  category: string;
  verified: number;
  price_status: string;
  core_params: string;
  custom_tag: string;
  date: string;
  updated_date: string;
}

interface Category {
  id: number;
  name: string;
  emoji: string;
  sort_order: number;
}

interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  summary: string;
  tags: string;       // comma-separated
  date: string;
  updated_date: string;
}

type AdminTab = 'picks' | 'knowledge';

// ─── Constants ──────────────────────────────────────────
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://asia2eu.lizhilianggreat.workers.dev';

// ─── Component ──────────────────────────────────────────
export default function Admin() {
  const { isAuthed, token, login, logout } = useAuth();
  const [passInput, setPassInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<AdminTab>('picks');

  // Knowledge article form state
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [kTitle, setKTitle] = useState('');
  const [kContent, setKContent] = useState('');
  const [kSummary, setKSummary] = useState('');
  const [kTags, setKTags] = useState('');
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [kLoading, setKLoading] = useState(false);

  // Post form state
  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'recommend' | 'warning'>('recommend');
  const [category, setCategory] = useState('');
  const [priceDev, setPriceDev] = useState('正常市场价');
  const [coreParams, setCoreParams] = useState('');
  const [verified, setVerified] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Category state
  const [cloudCategories, setCloudCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');
  const [showCatManager, setShowCatManager] = useState(false);

  // ─── Data loaders ─────────────────────────────────────
  const loadPosts = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/posts`);
      if (res.ok) setPosts(await res.json());
    } catch (e) { console.error('Failed to fetch posts', e); }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/categories`);
      if (res.ok) setCloudCategories(await res.json());
    } catch (e) { console.error('Failed to load categories', e); }
  };

  const loadArticles = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/knowledge`);
      if (res.ok) setArticles(await res.json());
    } catch (e) { console.error('Failed to fetch knowledge articles', e); }
  };

  useEffect(() => {
    loadPosts();
    if (isAuthed) { loadCategories(); loadArticles(); }
  }, [isAuthed]);

  // ─── Knowledge CRUD ───────────────────────────────────
  const clearKForm = () => {
    setKTitle(''); setKContent(''); setKSummary(''); setKTags('');
    setEditingArticleId(null);
  };

  const startEditingArticle = (a: KnowledgeArticle) => {
    setEditingArticleId(a.id);
    setKTitle(a.title); setKContent(a.content);
    setKSummary(a.summary || ''); setKTags(a.tags || '');
    setActiveTab('knowledge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKSubmit = async () => {
    if (!kTitle || !kContent) return;
    setKLoading(true);
    const isEditing = editingArticleId !== null;
    const url = isEditing ? `${WORKER_URL}/api/knowledge/${editingArticleId}` : `${WORKER_URL}/api/knowledge`;
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: kTitle, content: kContent, summary: kSummary, tags: kTags })
      });
      if (res.ok) { alert(isEditing ? '更新成功！' : '发布成功！'); clearKForm(); loadArticles(); }
    } catch { alert('Operation failed'); }
    finally { setKLoading(false); }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm('确定要删除这篇知识文章吗？')) return;
    try {
      await fetch(`${WORKER_URL}/api/knowledge/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (editingArticleId === id) clearKForm();
      loadArticles();
    } catch { alert('Delete failed'); }
  };

  // ─── Auth ─────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      // Test auth by creating and immediately deleting a test post
      const res = await fetch(`${WORKER_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${passInput}` },
        body: JSON.stringify({ title: '__auth_test__', content: 'test', type: 'recommend' })
      });
      if (res.ok) {
        // Clean up test post
        const postsRes = await fetch(`${WORKER_URL}/api/posts`);
        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          const testPost = allPosts.find((p: DailyPost) => p.title === '__auth_test__');
          if (testPost) {
            await fetch(`${WORKER_URL}/api/posts/${testPost.id}`, {
              method: 'DELETE', headers: { 'Authorization': `Bearer ${passInput}` }
            });
          }
        }
        login(passInput);
        loadPosts();
      } else {
        alert('密码错误，请使用 Cloudflare Worker 中设置的 ADMIN_PASSWORD');
      }
    } catch {
      alert('无法连接后端，请检查网络');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Form helpers ─────────────────────────────────────
  const clearForm = () => {
    setTitle(''); setContent(''); setCoreParams(''); setCustomTag('');
    setVerified(false); setCategory(''); setPriceDev('正常市场价');
    setType('recommend'); setEditingPostId(null);
  };

  const startEditing = (post: DailyPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setType(post.type);
    setCategory(post.category || '');
    setPriceDev(post.price_status || '正常市场价');
    setCoreParams(post.core_params || '');
    setVerified(!!post.verified);
    setCustomTag(post.custom_tag || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── CRUD operations ─────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${WORKER_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) setContent(prev => prev + `\n\n![Image](${data.url})`);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title || !content) return;
    setLoading(true);
    const postData = { title, content, type, category, verified, price_status: priceDev, core_params: coreParams, custom_tag: customTag };
    try {
      const isEditing = editingPostId !== null;
      const url = isEditing ? `${WORKER_URL}/api/posts/${editingPostId}` : `${WORKER_URL}/api/posts`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        alert(isEditing ? '更新成功！' : '发布成功！');
        clearForm();
        loadPosts();
      }
    } catch { alert('Operation failed'); }
    finally { setLoading(false); }
  };

  const handleDeletePost = async (id: number) => {
    if (!window.confirm('确定要永久删除这篇帖子吗？')) return;
    try {
      await fetch(`${WORKER_URL}/api/posts/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (editingPostId === id) clearForm();
      loadPosts();
    } catch { alert('Delete failed'); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${WORKER_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName.trim(), emoji: newCatEmoji || '📦' })
      });
      if (res.ok) { setNewCatName(''); setNewCatEmoji('📦'); loadCategories(); }
      else alert('添加失败，可能名称已存在');
    } catch { alert('网络错误'); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('确定要删除这个品类吗？')) return;
    try {
      await fetch(`${WORKER_URL}/api/categories/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      loadCategories();
    } catch { alert('删除失败'); }
  };

  // ═══════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════
  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Access</h1>
              <p className="text-sm text-slate-500 mt-2">Enter your Cloudflare Worker password</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="密码..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white"
                value={passInput}
                onChange={e => setPassInput(e.target.value)}
                autoFocus
              />
              <button
                disabled={loginLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-8"
    >
      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 glass-card w-fit rounded-2xl">
        <button
          onClick={() => setActiveTab('picks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'picks'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" /> Daily Picks
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'knowledge'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Knowledge Base
        </button>
      </div>
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {activeTab === 'knowledge'
              ? (editingArticleId ? '✏️ Editing Article' : '📚 New Knowledge Article')
              : (editingPostId ? '✏️ Editing Post' : '📝 Create Daily Pick')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'knowledge' ? 'Manage Knowledge Base articles' : 'Manage Asia2EU Daily Picks content'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'picks' ? (
            <button
              onClick={handleSubmit}
              disabled={loading || !title || !content}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editingPostId ? 'Update' : 'Publish'}
            </button>
          ) : (
            <button
              onClick={handleKSubmit}
              disabled={kLoading || !kTitle || !kContent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {kLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editingArticleId ? 'Update Article' : 'Publish Article'}
            </button>
          )}
          <button
            onClick={() => { logout(); setPassInput(''); }}
            className="p-2.5 rounded-xl glass hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* ── Tab: Daily Picks ── */}
      <AnimatePresence mode="wait">
      {activeTab === 'picks' && (
      <motion.div key="picks" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="glass-card p-5 space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Post Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Why this helmet is a steal…"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
            />
          </div>

          {/* Type Toggle */}
          <div className="glass-card p-5 space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Post Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setType('recommend')}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${type === 'recommend'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                ✅ Recommend
              </button>
              <button
                onClick={() => setType('warning')}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${type === 'warning'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                ⚠️ Warning
              </button>
            </div>
          </div>

          {/* Meta fields */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Structured Meta
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">品类</label>
                  <button onClick={() => setShowCatManager(!showCatManager)} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" /> 管理
                  </button>
                </div>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm text-slate-800 dark:text-white"
                >
                  <option value="">-- 请选择 --</option>
                  {cloudCategories.map(cat => (
                    <option key={cat.id} value={`${cat.emoji} ${cat.name}`}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price deviation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">价格状态</label>
                <select
                  value={priceDev} onChange={e => setPriceDev(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm text-slate-800 dark:text-white"
                >
                  <option value="正常市场价">正常市场价</option>
                  <option value="严重溢价 (偏贵)">严重溢价 (偏贵)</option>
                  <option value="捡漏神价 (极便)">捡漏神价 (极便)</option>
                </select>
              </div>
            </div>

            {/* Core params */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">核心参数摘要</label>
              <input
                value={coreParams} onChange={e => setCoreParams(e.target.value)}
                placeholder="e.g. 500cc排量 / 8GB内存"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm text-slate-800 dark:text-white"
              />
            </div>

            {/* Verified + custom tag */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={e => setVerified(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">已验证?</span>
              </label>
              <input
                value={customTag} onChange={e => setCustomTag(e.target.value)}
                placeholder="🏷️ 补充说明"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 text-sm text-slate-800 dark:text-white"
              />
            </div>

            {/* Category Manager */}
            <AnimatePresence>
              {showCatManager && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 space-y-3 mt-2">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5" /> 品类管理 (云端同步)
                    </h4>
                    <div className="flex gap-2">
                      <input
                        value={newCatEmoji} onChange={e => setNewCatEmoji(e.target.value)}
                        className="w-12 px-2 py-2 rounded-lg border border-blue-200 dark:border-blue-700 text-center text-lg bg-white/50 dark:bg-white/5"
                        placeholder="📦"
                      />
                      <input
                        value={newCatName} onChange={e => setNewCatName(e.target.value)}
                        placeholder="新品类名称..."
                        className="flex-1 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white/50 dark:bg-white/5 text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      />
                      <button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">添加</button>
                    </div>
                    <div className="grid gap-1.5 max-h-40 overflow-y-auto">
                      {cloudCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between bg-white/70 dark:bg-white/5 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/50 text-sm">
                          <span>{cat.emoji} {cat.name}</span>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">删除</button>
                        </div>
                      ))}
                      {cloudCategories.length === 0 && <p className="text-xs text-blue-400 italic">暂无品类，请添加。</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content editor */}
          <div className="glass-card p-5 space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              placeholder="Use markdown to format your post. Upload images below."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white resize-y"
            />
            <div className="relative">
              <input type="file" onChange={handleImageUpload} className="hidden" id="img-upload" accept="image/*" />
              <label
                htmlFor="img-upload"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? 'Uploading to R2...' : 'Upload Image to R2'}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column — Live Preview */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Preview</label>
          <div className="glass-card p-8 prose prose-slate dark:prose-invert max-w-none min-h-[500px]">
            <h2 className="text-2xl font-bold mb-4">{title || 'Post Title Preview'}</h2>

            {(category || priceDev || coreParams || customTag) && (
              <div className="not-prose bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 space-y-2 text-sm">
                {category && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900 dark:text-white">📦 品类:</strong> {category}</div>}
                <div className="flex items-center gap-2"><strong className="w-24 text-slate-900 dark:text-white">💵 价格:</strong> {priceDev}</div>
                <div className="flex items-center gap-2"><strong className="w-24 text-slate-900 dark:text-white">⚙️ 参数:</strong> {coreParams || '-'}</div>
                <div className="flex items-center gap-2"><strong className="w-24 text-slate-900 dark:text-white">🕵️ 沟通:</strong> {verified ? <span className="text-green-600 font-bold">✅ 已确认</span> : <span className="text-amber-600 font-bold">⚠️ 未深入沟通</span>}</div>
                {customTag && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900 dark:text-white">🏷️ 说明:</strong> {customTag}</div>}
              </div>
            )}

            <ReactMarkdown>{content || 'Start typing to see preview...'}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Published Posts Management */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">管理已发布帖子</h2>
        <div className="grid gap-3">
          {posts.map(post => (
            <div
              key={post.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editingPostId === post.id
                ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-white/5'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${post.type === 'recommend' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                    {post.type}
                  </span>
                  {post.category && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">{post.category}</span>}
                  <span className="text-[10px] text-slate-400">创建: {new Date(post.date).toLocaleDateString()}</span>
                  {post.updated_date && <span className="text-[10px] text-blue-400">更新: {new Date(post.updated_date).toLocaleDateString()}</span>}
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-200 mt-1 truncate text-sm">{post.title}</p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => startEditing(post)} className="p-2 rounded-lg border border-blue-200 dark:border-blue-700 text-blue-500 hover:bg-blue-500 hover:text-white transition-all" title="编辑">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeletePost(post.id)} className="p-2 rounded-lg border border-red-200 dark:border-red-700 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="删除">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-slate-400 italic text-sm">No posts published yet.</p>}
        </div>
      </div>
      </motion.div>
      )}

      {/* ── Tab: Knowledge Base ── */}
      {activeTab === 'knowledge' && (
      <motion.div key="knowledge" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">

        {/* Knowledge Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Form */}
          <div className="space-y-5">
            <div className="glass-card p-5 space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
              <input value={kTitle} onChange={e => setKTitle(e.target.value)} placeholder="Article title…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" />
            </div>
            <div className="glass-card p-5 space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Summary (list preview)</label>
              <input value={kSummary} onChange={e => setKSummary(e.target.value)} placeholder="One-line summary shown on the Knowledge page…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" />
            </div>
            <div className="glass-card p-5 space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tags (comma-separated)</label>
              <input value={kTags} onChange={e => setKTags(e.target.value)} placeholder="e.g. React, Cloudflare, TypeScript"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" />
            </div>
            <div className="glass-card p-5 space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Content (Markdown)</label>
              <textarea value={kContent} onChange={e => setKContent(e.target.value)} rows={14}
                placeholder="Write in Markdown…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white resize-y" />
            </div>
          </div>
          {/* Right — Preview */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Preview</label>
            <div className="glass-card p-8 prose prose-slate dark:prose-invert max-w-none min-h-[500px]">
              <h2 className="text-2xl font-bold mb-2">{kTitle || 'Article Title Preview'}</h2>
              {kSummary && <p className="text-slate-500 italic text-sm mb-4">{kSummary}</p>}
              {kTags && <div className="flex flex-wrap gap-1.5 mb-6 not-prose">{kTags.split(',').map(t=>t.trim()).filter(Boolean).map(t=>(<span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">{t}</span>))}</div>}
              <ReactMarkdown>{kContent || 'Start typing to see preview…'}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Knowledge Articles List */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">已发布知识文章</h2>
          <div className="grid gap-3">
            {articles.map(a => (
              <div key={a.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                editingArticleId === a.id
                  ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-white/5'
              }`}>
                <div className="flex-1 min-w-0">
                  {a.tags && <div className="flex gap-1 flex-wrap mb-1">{a.tags.split(',').map(t=>t.trim()).filter(Boolean).map(t=>(<span key={t} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{t}</span>))}</div>}
                  <p className="font-bold text-slate-700 dark:text-slate-200 truncate text-sm">{a.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => startEditingArticle(a)} className="p-2 rounded-lg border border-blue-200 dark:border-blue-700 text-blue-500 hover:bg-blue-500 hover:text-white transition-all" title="编辑">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteArticle(a.id)} className="p-2 rounded-lg border border-red-200 dark:border-red-700 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="删除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {articles.length === 0 && <p className="text-slate-400 italic text-sm">No knowledge articles yet. Add your first one above.</p>}
          </div>
        </div>
      </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
