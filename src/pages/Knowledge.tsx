/**
 * Knowledge Base Page (/knowledge)
 *
 * Fetches knowledge articles from Cloudflare D1 via the Worker API.
 * Displays a searchable, filterable list with tag-based navigation.
 * Clicking an article expands it into an inline Markdown reader.
 *
 * Data flow: Cloudflare Worker → /api/knowledge → D1 knowledge_articles table
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Search, Tag, X, ChevronRight, Loader2, Sparkles } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────
interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  tags: string;       // comma-separated
  date: string;
  updated_date: string;
}

// ─── Constants ──────────────────────────────────────────────────────────
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://asia2eu.lizhilianggreat.workers.dev';

// ─── Helpers ────────────────────────────────────────────────────────────
/** Parse comma-separated tags string into trimmed array */
function parseTags(raw: string): string[] {
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

/** Format a date string into a human-readable short form */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Component ──────────────────────────────────────────────────────────
export default function Knowledge() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  // ── Fetch articles from D1 via Worker ─────────────────────────────
  useEffect(() => {
    fetch(`${WORKER_URL}/api/knowledge`)
      .then(r => r.json())
      .then((data: Article[]) => { setArticles(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── Derived: all unique tags across all articles ───────────────────
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach(a => parseTags(a.tags).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [articles]);

  // ── Derived: filtered articles ─────────────────────────────────────
  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchSearch = !search
        || a.title.toLowerCase().includes(search.toLowerCase())
        || a.summary.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || parseTags(a.tags).includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [articles, search, activeTag]);

  const openArticle = articles.find(a => a.id === openId);

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 mb-4">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Knowledge Base</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Notes & Insights
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Collected learnings, technical notes, and practical guides.
        </p>
      </motion.div>

      {/* Search + Tag filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="space-y-3"
      >
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl glass border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  activeTag === tag
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50'
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="glass-card p-8 text-center text-slate-500 dark:text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Unable to load articles. Check your network or backend.</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{articles.length === 0 ? 'No articles yet. Add some from the Admin panel.' : 'No articles match your search.'}</p>
        </div>
      )}

      {/* Article List */}
      {!loading && !error && (
        <motion.div className="space-y-4" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((article, i) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                {/* Article Card */}
                <div
                  className={`glass-card glass-hover cursor-pointer p-6 transition-all ${openId === article.id ? 'ring-2 ring-blue-500/50' : ''}`}
                  onClick={() => setOpenId(openId === article.id ? null : article.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
                        {article.title}
                      </h2>
                      {article.summary && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Tags */}
                        {parseTags(article.tags).map(tag => (
                          <span
                            key={tag}
                            onClick={e => { e.stopPropagation(); setActiveTag(activeTag === tag ? null : tag); }}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                          >
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                        {/* Date */}
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {formatDate(article.updated_date || article.date)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform mt-1 ${openId === article.id ? 'rotate-90' : ''}`} />
                  </div>

                  {/* Expanded Markdown reader */}
                  <AnimatePresence>
                    {openId === article.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3 } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 prose prose-slate dark:prose-invert max-w-none prose-img:rounded-xl prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm">
                          <ReactMarkdown>{article.content}</ReactMarkdown>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}
