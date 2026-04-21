/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PlaneTakeoff,
  Tag,
  CheckCircle2,
  Star,
  Search,
  Calculator,
  Wallet,
  Camera,
  Truck,
  ChevronRight,
  HelpCircle,
  Plane,
  Ship,
  Sparkles,
  Loader2,
  MessageCircle,
  Mail,
  X,
  Menu,
  Coffee,
  User,
  MapPin,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

// --- Types ---
type View = 'home' | 'ideas' | 'about' | 'faq' | 'contact' | 'daily' | 'admin';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image: string;
  savings: string;
  comparison: {
    euPrice: string;
    asiaPrice: string;
    totalLanded: string;
    saving: string;
  };
}

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

// --- Constants ---
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    title: 'Motorcycle Windshield',
    description: 'Procured specific model parts unavailable locally in Malta.',
    image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=800',
    savings: '€45',
    comparison: {
      euPrice: '€130.00',
      asiaPrice: '€55.00',
      totalLanded: '€85.00',
      saving: '€45.00'
    }
  },
  {
    id: 'case-2',
    title: 'Custom Mechanical Keyboard',
    description: 'Sourced high-quality customized parts directly from Asia.',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
    savings: '€60',
    comparison: {
      euPrice: '€220.00',
      asiaPrice: '€120.00',
      totalLanded: '€160.00',
      saving: '€60.00'
    }
  },
  {
    id: 'case-3',
    title: 'Limited Edition Stationery',
    description: 'Secured rare Asian-market planner and pen sets.',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop',
    savings: '€25',
    comparison: {
      euPrice: '€60.00',
      asiaPrice: '€20.00',
      totalLanded: '€35.00',
      saving: '€25.00'
    }
  },
  {
    id: 'case-4',
    title: 'Vintage Camera Lenses',
    description: 'Used camera lenses and rare electronics from platforms like Xianyu.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    savings: '€140',
    comparison: {
      euPrice: '€320.00',
      asiaPrice: '€140.00',
      totalLanded: '€180.00',
      saving: '€140.00'
    }
  }
];

export default function App() {
  const getInitialView = (): View => {
    const hash = window.location.hash.replace('#', '');
    return (['home', 'ideas', 'about', 'faq', 'contact', 'daily', 'admin'].includes(hash) ? hash : 'home') as View;
  };
  const [currentView, setCurrentView] = useState<View>(getInitialView);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'ideas', 'about', 'faq', 'contact', 'daily', 'admin'].includes(hash)) {
        setCurrentView(hash as View);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New State for Cloudflare Features
  const [adminPassword, setAdminPassword] = useState('');
  const [dailyPosts, setDailyPosts] = useState<DailyPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://your-worker-name.your-subdomain.workers.dev';

  const loadPosts = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        setDailyPosts(data);
      }
    } catch (e) {
      console.error("Failed to fetch posts", e);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [WORKER_URL]);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const handleAiInquiry = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setAiResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [{
            text: `User description: ${aiInput}`
          }]
        }],
        config: {
          systemInstruction: `You are a professional proxy shopping consultant for ASIA2EU. 
          Your goal is to provide a comprehensive analysis for the user and a final draft for the buyer Gary Li.

          FOLLOW THESE STEPS IN YOUR RESPONSE:
          1. **ANALYSIS**: Based on the item described, estimate its likely category, typical weight (kg) or volume.
          2. **SHIPPING ESTIMATE**: 
             - Air Freight: ~€20/kg, delivery in ~14 days.
             - Sea Freight: ~€70/box (25kg limit), delivery in ~90 days.
             Suggest the best method for this item.
          3. **COST COMPARISON**: 
             - Estimate the item's likely price in Asian markets (e.g. Taobao/Xianyu).
             - Estimate the total Landed Price (Asia Price + Shipping).
             - Estimate the European Market Gap (Difference compared to local EU/eBay prices).
          4. **FRIENDLY ADVICE**:
             - IMPORTANT: Remind user that international items have NO WARRANTY.
             - ADVICE: If the price difference is small (<30% savings), explicitly advise "NOT RECOMMENDED to risk it, buy locally for warranty."
             - ADVICE: If savings are high, encourage the purchase.
          5. **INQUIRY DRAFT**: At the very end, provide a short 2-3 sentence message the user can send to Gary, including translated Chinese keywords in brackets.

          Language: Response should be in English, but use Chinese keywords in brackets. 
          Tone: Objective, professional, and honest.`
        }
      });

      setAiResult(response.text || "No response generated.");
    } catch (error) {
      console.error("Gemini API Error:", error);
      setAiResult("Sorry, I encountered an error while analyzing your request. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const switchView = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-200">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className="cursor-pointer flex items-center gap-2 group"
            onClick={() => switchView('home')}
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
            <div className="text-2xl tracking-tighter">
              <span className="font-black text-slate-900">ASIA</span>
              <span className="font-light text-blue-600 mx-0.5">2</span>
              <span className="font-black text-slate-900">EU</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => switchView('home')} className={cn("text-slate-600 hover:text-blue-600 font-medium transition-colors", currentView === 'home' && "text-blue-600 font-bold")}>Home</button>
            <button onClick={() => switchView('daily')} className={cn("text-slate-600 hover:text-blue-600 font-medium transition-colors", currentView === 'daily' && "text-blue-600 font-bold")}>Daily Picks</button>
            <button onClick={() => switchView('ideas')} className={cn("text-slate-600 hover:text-blue-600 font-medium transition-colors", currentView === 'ideas' && "text-blue-600 font-bold")}>Curated Finds</button>
            <button onClick={() => switchView('about')} className={cn("text-slate-600 hover:text-blue-600 font-medium transition-colors", currentView === 'about' && "text-blue-600 font-bold")}>About Gary</button>
            <button onClick={() => switchView('faq')} className={cn("text-slate-600 hover:text-blue-600 font-medium transition-colors", currentView === 'faq' && "text-blue-600 font-bold")}>FAQ</button>
            <button
              onClick={() => switchView('contact')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-colors text-sm shadow-sm"
            >
              Shipping & Contact
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-slate-50 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-4">
                <button onClick={() => switchView('home')} className={cn("text-left py-2 font-medium", currentView === 'home' ? "text-blue-600 font-bold" : "text-slate-600")}>Home</button>
                <button onClick={() => switchView('daily')} className={cn("text-left py-2 font-medium", currentView === 'daily' ? "text-blue-600 font-bold" : "text-slate-600")}>Daily Picks</button>
                <button onClick={() => switchView('ideas')} className={cn("text-left py-2 font-medium", currentView === 'ideas' ? "text-blue-600 font-bold" : "text-slate-600")}>Curated Finds</button>
                <button onClick={() => switchView('about')} className={cn("text-left py-2 font-medium", currentView === 'about' ? "text-blue-600 font-bold" : "text-slate-600")}>About Gary</button>
                <button onClick={() => switchView('faq')} className={cn("text-left py-2 font-medium", currentView === 'faq' ? "text-blue-600 font-bold" : "text-slate-600")}>FAQ</button>
                <button onClick={() => switchView('contact')} className="text-left py-2 text-blue-600 font-bold">Shipping & Contact</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              {/* Hero Section */}
              <section className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                  <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                    Buy from Asia, <br />
                    <span className="text-blue-600">Shipped to Europe.</span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                    We help you purchase items from China, Japan, and Korea. Perfect for goods that are hard to find, limited, or too expensive in the European market.
                  </p>
                  <div className="inline-block bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                    <p className="text-green-800 font-semibold flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Promo Period: 0 Service Fee
                    </p>
                    <p className="text-sm text-green-700 mt-1">You only pay: Item Price + Shipping + Customs Duties.</p>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop"
                    alt="ASIA2EU Service"
                    className="rounded-2xl shadow-2xl object-cover w-full h-[300px] md:h-[500px]"
                  />
                </div>
              </section>

              {/* Promo Banner */}
              <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 md:p-10 border border-amber-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold tracking-wide">
                      <Star className="w-4 h-4" /> LIMITED OFFER
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Zero Upfront Cost Promo</h2>
                    <p className="text-slate-700 text-lg">We are offering <strong>5 spots per month</strong> where you pay nothing until the item is delivered. No deposit required during this period.</p>
                    <ul className="space-y-2 mt-4 text-slate-600 text-sm">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Total value (Item + Shipping) must be under €100.</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Requires an honest public review upon receiving the item.</li>
                    </ul>
                  </div>
                  <div className="md:w-1/3 text-center">
                    <button
                      onClick={() => switchView('contact')}
                      className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-md"
                    >
                      Claim a Spot Now
                    </button>
                    <p className="text-xs text-slate-500 mt-3">First come, first served every month.</p>
                  </div>
                </div>
              </section>

              {/* Categories */}
              <section className="space-y-10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-900">What We Buy For You</h2>
                  <p className="text-slate-600 mt-3 max-w-2xl mx-auto">From niche modification parts to rare collectibles, we source almost anything from Asian markets.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <CategoryCard
                    title="Printer Ink Cartridges"
                    description="High-quality third-party ink cartridges and toner for all major brands."
                    image="https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop"
                    why="Save up to 70% compared to European retail prices while maintaining professional print quality."
                  />
                  <CategoryCard
                    title="Novelty Stationery"
                    description="Planners, limited edition gel pens, and unique craft supplies."
                    image="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop"
                    why="Easy access to the latest trends from China, Japan, and Korea rare in Europe."
                  />
                  <CategoryCard
                    title="Motorcycle Parts"
                    description="Windshields, specific model modification parts, and accessories."
                    image="https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=800"
                    why="We strictly verify the exact SKU to provide an accurate quote, avoiding confusing promotional listings."
                  />
                  <CategoryCard
                    title="Hobbies & Collectibles"
                    description="Anime figures, designer toys, and specialized outdoor gear."
                    image="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=800&auto=format&fit=crop"
                    why="Secure authentic collector's items directly from original releases."
                  />
                </div>
              </section>


              {/* Note: How it works section moved to global main bottom */}
            </motion.div>
          )}

          {currentView === 'ideas' && (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-900">Curated Finds & Success Stories</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">Discover inspiration to save money on specialized goods.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {CASE_STUDIES.map(study => (
                  <div
                    key={study.id}
                    onClick={() => setSelectedCase(study)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img src={study.image} alt={study.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm">Saved {study.savings}</div>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{study.title}</h3>
                      <p className="text-slate-600 text-sm">{study.description}</p>
                      <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-800 mt-4 border-t border-slate-100 pt-4">
                        View Price Comparison <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-16"
            >
              <section className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 relative">
                  <div className="aspect-[4/5] rounded-3xl bg-slate-200 overflow-hidden shadow-2xl relative group border-4 border-white">
                    {/* PLACEHOLDER FOR PERSONAL IMAGE */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <User className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-sm font-medium leading-relaxed">
                        [ 建议放置一张你在折腾爱好时的生活照 ]<br />
                        比如：正在组装键盘、维修摩托车、或者在咖啡馆工作的照片。<br />
                        展现个人化、真实的一面。
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
                    <p className="text-blue-600 font-black text-2xl tracking-tighter">Gary Li</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Founder / Proxy Buyer</p>
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">The Person Behind ASIA2EU</h1>
                    <p className="text-xl text-blue-600 font-medium italic">"I prefer doing it right for 5 people than doing it 'okay' for 500."</p>
                  </div>

                  <div className="space-y-6 text-slate-600 leading-relaxed">
                    <p>
                      Hi, I'm Gary. ASIA2EU isn't a massive logistics corporation or an automated warehouse. It's just me, helping friends and fellow hobbyists bridge the gap between Asian markets and Europe.
                    </p>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" /> Why stay small?
                      </h3>
                      <p className="text-sm">
                        Because trust is the only thing that matters in proxy shopping. I personally check every SKU, negotiate with sellers on Taobao or Xianyu, and send you real-time inspection photos. When you message Gary, you get Gary—not a chatbot.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 space-y-4">
                  <div className="p-3 bg-white rounded-xl w-fit shadow-sm"><Heart className="text-indigo-600" /></div>
                  <h3 className="text-xl font-bold text-slate-900">Interests</h3>
                  <p className="text-sm text-slate-600">I'm a fan of motorcycle modification, custom mechanical keyboards, and high-performance tech. I understand the gear we buy because I use it too.</p>
                </div>
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4">
                  <div className="p-3 bg-white rounded-xl w-fit shadow-sm"><MapPin className="text-blue-600" /></div>
                  <h3 className="text-xl font-bold text-slate-900">Based in Malta</h3>
                  <p className="text-sm text-slate-600">Operating locally from Malta gives me a unique perspective on the European market's needs and shipping challenges.</p>
                </div>
                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 space-y-4">
                  <div className="p-3 bg-white rounded-xl w-fit shadow-sm"><Coffee className="text-amber-600" /></div>
                  <h3 className="text-xl font-bold text-slate-900">Let's Chat</h3>
                  <p className="text-sm text-slate-600">Shopping is just the bridge. If you're nearby, let's grab a coffee and talk about your next project. Helping you find rare gear is my hobby-turned-service.</p>
                </div>
              </section>

              <div className="flex justify-center pt-8">
                <button
                  onClick={() => switchView('contact')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-1"
                >
                  Start a Personal Inquiry
                </button>
              </div>
            </motion.div>
          )}

          {currentView === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold text-slate-900">Frequently Asked Questions</h1>
              </div>

              <div className="space-y-6">
                <FaqItem
                  question="Are there any hidden service fees?"
                  answer="No. During our promotional period, our service fee is zero. You only pay for the item cost, shipping, and any applicable customs duties."
                />
                <FaqItem
                  question="How do you handle confusing Taobao/Xianyu listings?"
                  answer="We strictly verify specific SKUs and communicate with sellers to ensure the item matches your requirements before providing a quote."
                />
                <FaqItem
                  question="What if the item is damaged during shipping?"
                  answer="We provide warehouse inspection photos before international shipping. For damages during international transit, we assist in filing claims with the shipping carrier."
                />
                <FaqItem
                  question="Do you ship to all European countries?"
                  answer="Yes, we ship to most EU countries including Malta, Italy, Germany, France, and more. Shipping rates may vary slightly by destination."
                />
              </div>
            </motion.div>
          )}

          {currentView === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-900">Daily Picks & Market Insights</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">1-2 selected products every day. Not always a recommendation—sometimes a warning to help you avoid common pitfalls.</p>
              </div>

              <div className="grid grid-cols-1 gap-12 max-w-4xl mx-auto">
                {dailyPosts.slice((currentPage - 1) * 5, currentPage * 5).map(post => (
                  <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row">
                    <div className="p-8 md:p-10 flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase",
                          post.type === 'recommend' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {post.type === 'recommend' ? "✅ Quality Find" : "⚠️ Market Warning"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">{post.title}</h2>

                      {(post.category || post.price_status || post.core_params || post.custom_tag) && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-2 text-sm text-slate-700">
                          {post.category && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">📦 所属品类:</strong> {post.category}</div>}
                          {post.price_status && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">💵 价格状态:</strong> {post.price_status}</div>}
                          <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">⚙️ 核心参数:</strong> {post.core_params || '-'}</div>
                          <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">🕵️ 实况沟通:</strong> {post.verified ? <span className="text-green-600 font-bold">✅ 已与卖家实拍确认</span> : <span className="text-amber-600 font-bold">⚠️ 未深入沟通，存在页面图盲买风险</span>}</div>
                          {post.custom_tag && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">🏷️ 补充说明:</strong> {post.custom_tag}</div>}
                        </div>
                      )}

                      <div className="prose prose-slate max-w-none prose-img:rounded-2xl prose-img:max-h-96 prose-img:object-cover">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                      </div>
                    </div>
                  </article>
                ))}

                {dailyPosts.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400">Loading daily insights...</p>
                  </div>
                )}

                {Math.ceil(dailyPosts.length / 5) > 1 && (
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-2 rounded-xl border border-slate-200 disabled:opacity-50 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="flex items-center font-medium text-slate-500">
                      Page {currentPage} of {Math.ceil(dailyPosts.length / 5)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(dailyPosts.length / 5), p + 1))}
                      disabled={currentPage === Math.ceil(dailyPosts.length / 5)}
                      className="px-6 py-2 rounded-xl border border-slate-200 disabled:opacity-50 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'admin' && (
            <AdminPanel
              workerUrl={WORKER_URL}
              posts={dailyPosts}
              onRefresh={loadPosts}
              onSuccess={() => {
                loadPosts(); // 重新加载数据，留在管理页
              }}
            />
          )}

          {currentView === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-4xl font-bold text-slate-900">Shipping & Contact</h1>
                <p className="text-slate-500">Clear rates, no surprises.</p>
              </div>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Plane /></div>
                    <h3 className="text-xl font-bold">Air Freight</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-black">€20</span><span className="text-slate-400"> / kg</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">Best for light and urgent items. Delivery in ~2 weeks. (Volumetric weight applies if dimensions exceed actual weight).</p>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-teal-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform"><Ship /></div>
                    <h3 className="text-xl font-bold">Sea Freight</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-black">€70</span><span className="text-slate-400"> / box</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">The most cost-effective for bulky items. Box limit: 25kg, 40x50x60cm. Delivery in ~3 months.</p>
                </div>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-100 flex flex-col items-center text-center shadow-inner">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Ready to Order?</h2>

                <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-100 mb-10 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                  <label className="block text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Tell me what you are looking for
                  </label>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-slate-700 mb-4 focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. A white motorcycle helmet for a Honda CB500X, or specific printer ink for Epson L3150..."
                  />
                  <button
                    onClick={handleAiInquiry}
                    disabled={isAiLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>✨ Draft Message & Get Advice</span>}
                  </button>

                  {aiResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100"
                    >
                      <div className="prose prose-sm max-w-none text-slate-700 italic bg-white p-4 rounded border border-green-100 mb-4 overflow-y-auto max-h-[400px]">
                        <ReactMarkdown>{aiResult}</ReactMarkdown>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Advice is based on current market estimates. Contact Gary via WhatsApp or Email to proceed.</p>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl text-left">
                  <a
                    href={`https://wa.me/35699494201?text=${encodeURIComponent(aiResult || "Hi Gary, I'm interested in proxy shopping from Asia.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">WhatsApp</h3>
                    <p className="text-sm text-slate-500">Chat with Gary Li</p>
                  </a>
                  <a
                    href="mailto:lizhilianggreat@gmail.com"
                    className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Email</h3>
                    <p className="text-sm text-slate-500">Send an inquiry</p>
                  </a>
                </div>
              </section>
            </motion.div>
          )}

        </AnimatePresence>

        {/* How it works - Global section visible on all pages */}
        <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white text-center mt-20">
          <h2 className="text-3xl font-bold mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
            <Step icon={<Search />} step="1. Tell Us" desc="Tell us what you need. We'll find it." />
            <Step icon={<Calculator />} step="2. Get Quote" desc="We verify the total landed cost." />
            <Step icon={<Wallet />} step="3. Pay Item" desc="Pay item cost to secure order." />
            <Step icon={<Camera />} step="4. Inspection" desc="We send warehouse photos." />
            <Step icon={<Truck />} step="5. Delivery" desc="International shipping to you." />
          </div>
        </section>
      </main>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedCase(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{selectedCase.title} Comparison</h3>
                <button onClick={() => setSelectedCase(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <img src={selectedCase.image} alt={selectedCase.title} className="rounded-xl w-full h-48 object-cover" />
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedCase.description}</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Price Breakdown</p>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Local EU Price</span>
                      <span className="font-bold text-slate-900">{selectedCase.comparison.euPrice}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Asia Item Price</span>
                      <span className="font-bold text-slate-900">{selectedCase.comparison.asiaPrice}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Total Landed Cost</span>
                      <span className="font-bold text-slate-900">{selectedCase.comparison.totalLanded}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
                    <span className="text-green-800 font-bold">Total Savings</span>
                    <span className="text-2xl font-black text-green-600">{selectedCase.comparison.saving}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCase(null);
                      switchView('contact');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Inquire About Similar Items
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1 rounded">
              <PlaneTakeoff className="w-4 h-4" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter">ASIA2EU</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <button onClick={() => switchView('home')} className="hover:text-blue-600">Home</button>
            <button onClick={() => switchView('ideas')} className="hover:text-blue-600">Curated Finds</button>
            <button onClick={() => switchView('about')} className="hover:text-blue-600">About Gary</button>
            <button onClick={() => switchView('faq')} className="hover:text-blue-600">FAQ</button>
            <button onClick={() => switchView('contact')} className="hover:text-blue-600">Contact</button>
          </div>
          <p className="text-xs text-slate-400">© 2026 ASIA2EU Proxy Shopping Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function AdminPanel({ workerUrl, posts, onRefresh, onSuccess }: { workerUrl: string, posts: DailyPost[], onRefresh: () => void, onSuccess: () => void }) {
  const [pass, setPass] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'recommend' | 'warning'>('recommend');

  // Editing state
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Cloud categories from D1
  const [cloudCategories, setCloudCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');
  const [showCatManager, setShowCatManager] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${workerUrl}/api/categories`);
      if (res.ok) setCloudCategories(await res.json());
    } catch (e) { console.error('Failed to load categories', e); }
  };

  useEffect(() => { if (isAuthed) loadCategories(); }, [isAuthed]);

  const [category, setCategory] = useState('');
  const [priceDev, setPriceDev] = useState('正常市场价');
  const [coreParams, setCoreParams] = useState('');
  const [verified, setVerified] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const clearForm = () => {
    setTitle(''); setContent(''); setCoreParams(''); setCustomTag(''); setVerified(false);
    setCategory(''); setPriceDev('正常市场价'); setType('recommend');
    setEditingPostId(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${workerUrl}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pass}` },
        body: JSON.stringify({ title: '__auth_test__', content: 'test', type: 'recommend' })
      });
      if (res.ok) {
        const postsRes = await fetch(`${workerUrl}/api/posts`);
        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          const testPost = allPosts.find((p: any) => p.title === '__auth_test__');
          if (testPost) {
            await fetch(`${workerUrl}/api/posts/${testPost.id}`, {
              method: 'DELETE', headers: { 'Authorization': `Bearer ${pass}` }
            });
          }
        }
        setIsAuthed(true);
      } else {
        alert('密码错误，请使用 Cloudflare Worker 中设置的 ADMIN_PASSWORD');
      }
    } catch {
      alert('无法连接后端，请检查网络');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${workerUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${pass}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setContent(prev => prev + `\n\n![Image](${data.url})`);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) return;
    setLoading(true);

    const postData = {
      title, content, type, category, verified,
      price_status: priceDev, core_params: coreParams, custom_tag: customTag,
    };

    try {
      const isEditing = editingPostId !== null;
      const url = isEditing ? `${workerUrl}/api/posts/${editingPostId}` : `${workerUrl}/api/posts`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pass}`
        },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        alert(isEditing ? '更新成功！' : '发布成功！');
        clearForm();
        onSuccess();
      }
    } catch (err) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${workerUrl}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pass}` },
        body: JSON.stringify({ name: newCatName.trim(), emoji: newCatEmoji || '📦' })
      });
      if (res.ok) {
        setNewCatName(''); setNewCatEmoji('📦');
        loadCategories();
      } else {
        alert('添加失败，可能名称已存在');
      }
    } catch { alert('网络错误'); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('确定要删除这个品类吗？')) return;
    try {
      await fetch(`${workerUrl}/api/categories/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${pass}` }
      });
      loadCategories();
    } catch { alert('删除失败'); }
  };

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto py-20">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create Daily Pick</h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Finish & Publish"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase">Post Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Why this helmet is a steal, or Beware of fake SKUs"
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase">Post Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setType('recommend')}
                className={cn("flex-1 py-3 rounded-xl border font-bold", type === 'recommend' ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-slate-200 text-slate-400")}
              >
                Recommend
              </button>
              <button
                onClick={() => setType('warning')}
                className={cn("flex-1 py-3 rounded-xl border font-bold", type === 'warning' ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-slate-200 text-slate-400")}
              >
                Warning
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Structured Meta Info</h3>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">所属品类</label>
                  <button onClick={() => setShowCatManager(!showCatManager)} className="text-[10px] text-blue-500 font-bold hover:underline">⚙️ 管理品类</button>
                </div>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- 请选择品类 --</option>
                  {cloudCategories.map(cat => (
                    <option key={cat.id} value={`${cat.emoji} ${cat.name}`}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">价格偏差状态</label>
                <select
                  value={priceDev} onChange={e => setPriceDev(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="正常市场价">正常市场价</option>
                  <option value="严重溢价 (偏贵)">严重溢价 (偏贵)</option>
                  <option value="捡漏神价 (极便)">捡漏神价 (极便)</option>
                </select>
              </div>

              <div className="space-y-2 col-span-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">核心参数摘要</label>
                <input
                  value={coreParams} onChange={e => setCoreParams(e.target.value)}
                  placeholder="e.g. 500cc排量 / 8GB内存"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {/* Category Manager Panel */}
            {showCatManager && (
              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 space-y-4">
                <h4 className="font-bold text-indigo-900 text-sm">📂 品类管理 (云端同步)</h4>
                <div className="flex gap-2">
                  <input
                    value={newCatEmoji}
                    onChange={e => setNewCatEmoji(e.target.value)}
                    className="w-14 px-2 py-2 rounded-lg border border-indigo-200 text-center text-lg"
                    placeholder="📦"
                  />
                  <input
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="输入新品类名称..."
                    className="flex-1 px-3 py-2 rounded-lg border border-indigo-200"
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">添加</button>
                </div>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {cloudCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-indigo-100">
                      <span className="text-sm">{cat.emoji} {cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 hover:bg-red-50 rounded">删除</button>
                    </div>
                  ))}
                  {cloudCategories.length === 0 && <p className="text-xs text-indigo-400 italic">暂无品类，请添加。</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={e => setVerified(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-bold text-slate-700">已与卖家确认验证过?</span>
              </label>

              <div className="space-y-2">
                <input
                  value={customTag} onChange={e => setCustomTag(e.target.value)}
                  placeholder="🏷️ 自定义标签说明"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-500 uppercase">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder="Use markdown to format your post. You can insert images below."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-sm"
            />
            <div className="relative">
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                id="img-upload"
                accept="image/*"
              />
              <label
                htmlFor="img-upload"
                className="inline-flex items-center gap-2 text-sm text-blue-600 font-bold cursor-pointer hover:underline"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? "Uploading to R2..." : "Upload Image to R2"}
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-500 uppercase">Live Preview</label>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 prose prose-slate max-w-none shadow-inner min-h-[400px]">
            <h2 className="text-2xl font-bold mb-4">{title || "Post Title Preview"}</h2>

            {(category || priceDev || coreParams || customTag) && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-2 text-sm text-slate-700 not-prose">
                {category && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">📦 所属品类:</strong> {category}</div>}
                <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">💵 价格状态:</strong> {priceDev}</div>
                <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">⚙️ 核心参数:</strong> {coreParams || '-'}</div>
                <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">🕵️ 实况沟通:</strong> {verified ? <span className="text-green-600 font-bold">✅ 已与卖家实拍确认</span> : <span className="text-amber-600 font-bold">⚠️ 未深入沟通，存在页面图盲买风险</span>}</div>
                {customTag && <div className="flex items-center gap-2"><strong className="w-24 text-slate-900">🏷️ 补充说明:</strong> {customTag}</div>}
              </div>
            )}

            <ReactMarkdown>{content || "Start typing to see preview..."}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-bold mb-6">管理已发布帖子</h2>
        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className={cn("bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center transition-colors", editingPostId === post.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-100 hover:border-slate-300")}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase", post.type === 'recommend' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {post.type}
                  </span>
                  {post.category && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{post.category}</span>}
                  <span className="text-xs text-slate-400">创建: {new Date(post.date).toLocaleDateString()}</span>
                  {post.updated_date && <span className="text-xs text-blue-400">更新: {new Date(post.updated_date).toLocaleDateString()}</span>}
                </div>
                <p className="font-bold text-slate-700 mt-1 truncate">{post.title}</p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => startEditing(post)}
                  className="text-blue-500 hover:text-white font-bold px-4 py-2 hover:bg-blue-500 rounded-lg text-sm border border-blue-200 transition-all"
                >
                  编辑
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('确定要永久删除这篇帖子吗？')) {
                      try {
                        await fetch(`${workerUrl}/api/posts/${post.id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${pass}` }
                        });
                        if (editingPostId === post.id) clearForm();
                        onRefresh();
                      } catch (e) {
                        alert('Delete failed');
                      }
                    }
                  }}
                  className="text-red-500 hover:text-white font-bold px-4 py-2 hover:bg-red-500 rounded-lg text-sm border border-red-200 transition-all"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-slate-400 italic">No posts published yet.</p>}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function CategoryCard({ title, description, image, why }: { title: string, description: string, image: string, why: string }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
      <img src={image} alt={title} className="w-full h-48 object-cover border-b border-slate-200" />
      <div className="p-6 space-y-3 flex-1">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-600 text-sm">{description}</p>
        <p className="text-sm text-slate-700 mt-2 border-t border-slate-100 pt-3">
          <span className="font-semibold text-blue-600">Why us:</span> {why}
        </p>
      </div>
    </div>
  );
}

function Step({ icon, step, desc }: { icon: React.ReactNode, step: string, desc: string }) {
  return (
    <div className="space-y-3">
      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto text-blue-400">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" }) : icon}
      </div>
      <h3 className="font-bold">{step}</h3>
      <p className="text-slate-400">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
        <HelpCircle className={cn("w-6 h-6 text-blue-500 shrink-0 transition-transform", isOpen && "rotate-180")} />
        {question}
      </h3>
      {isOpen && (
        <motion.p
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="text-slate-600 pl-9 mt-2"
        >
          {answer}
        </motion.p>
      )}
    </div>
  );
}

