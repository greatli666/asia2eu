# Project Redesign Plan: Personal Portal & Asia2EU Refactor
**Date**: 2026-04-21
**Status**: Confirmed & Ready for Implementation

---

## 1. Project Vision
Transform the existing `asia2eu` site into a comprehensive **Personal Portal** for Gary Li. The portal will serve as a hub for personal projects, a knowledge base, and professional identity. 

- **Home Page**: A high-end Bento Grid layout.
- **Asia2EU**: Sub-project/Sub-page.
- **Knowledge Base**: Dynamic latest/hot snippets.

---

## 2. Design Requirements (Antigravity & UI/UX Pro Max)
- **Aesthetic**: Premium modern look with strong focus on **Glassmorphism**.
- **Themes**: Full support for **Light/Dark mode** toggle.
- **Interactivity**: "Weightless" feel with standard hover responses (elevation, glow).
- **Typography**: Professional rich-text layout for blog/knowledge entries (Medium/Linear style).

---

## 3. Core Modules (Home Page Bento Grid)
1. **Bio Card**: Personal avatar, bio, and slogan.
2. **Projects Grid**: Standard-sized cards (including Asia2EU).
3. **Knowledge Feed**: Latest/Hot entries from the DB.
4. **Skills Cloud**: Tech stack and expertise visualization.
5. **Real-time Stats**: Geographic location and digital clock.
6. **Contact/Social**: Quick links to WhatsApp, Email, WeChat.

---

## 4. Proposed Architecture

### Folder Structure
```text
src/
├── components/          # Reusable UI components
│   ├── layout/          # Navbar, Footer, ThemeToggle
│   ├── bento/           # Grid modules (BioCard, ProjectCard, etc.)
│   └── shared/          # Typography & Professional Markdown Renderer
├── pages/               # Page entry points
│   ├── Portal.tsx       # New Home (Bento Grid)
│   ├── Asia2EU.tsx      # Refactored Asia2EU page
│   └── Knowledge.tsx    # Knowledge base listings/details
├── contexts/            # Global state
│   └── ThemeContext.tsx # Light/Dark theme provider
└── lib/                 # Utilities and Constants
```

### Technical Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Backend**: Cloudflare Workers + D1 (Existing)

---

## 5. Implementation Roadmap

### Phase 1: Infrastructure
- Implement `ThemeContext` and theme toggle logic.
- Setup `react-router-dom` or a robust routing system.
- Create global layout wrapper (Glassmorphism Nav).

### Phase 2: The Portal (Bento Grid)
- Build the Bento Engine (Responsive Grid).
- Implement the 5 core modules with `motion` hover effects.
- Style cards with glassmorphism (translucency + blur).

### Phase 3: Project Migration
- Move current `App.tsx` logic into `pages/Asia2EU.tsx`.
- Update navigation links.
- Refactor the Admin Panel to be accessible via sub-route.

### Phase 4: Content Presentation
- Develop a customized `MarkdownRenderer` component with professional spacing, typography, and image treatments.
- Optimize Light/Dark mode contrast for all article elements.

---

## 6. Decision Log
- **Decision**: Traditional Routing (B) over Single-page Hash.
- **Decision**: Online Admin Panel over Markdown files for content management.
- **Decision**: Standard hover effects (A) over complex 3D tilts for clean professional look.
