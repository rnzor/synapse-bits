
# 🧠 SYNAPSE BITS | Neural Knowledge Stream

**Codename:** `Neural_Stream`  
**Version:** 1.0.0 (Gold Master)  
**Target:** 2026-Ready Architecture

## 1. Executive Overview

**SYNAPSE BITS** is a high-velocity micro-learning platform engineered for developers and network architects. It bridges the gap between the depth of technical documentation and the engagement of short-form social feeds.

*   **Core Value:** Master distributed systems, low-level networking, and advanced coding patterns in <30 seconds.
*   **Key Differentiator:** Hybrid content generation engine combining **Neural Synthesis** (AI-generated structured tutorials) and **Manual Protocol** (community authoring).

---

## 2. Technical Stack

### Frontend Core
*   **Runtime:** React 18 (Client-Side Rendering)
*   **Build System:** ESBuild / Vite ecosystem (via `importmap` implementation).
*   **Routing:** `react-router-dom` v6 with dynamic slug resolution.
*   **State Persistence:** `localStorage` (MVP) acting as a pseudo-database for User, Bits, and Stats.
*   **Meta/SEO:** `react-helmet-async` for dynamic head management.

### UI & Design System ("Cyber-Glass")
*   **Styling:** Tailwind CSS v3 (Utility-first).
*   **Visual Language:** Deep Void (`#02040a`) background, holographic gradients, glassmorphism (`backdrop-blur-xl`), and noise textures.
*   **Motion:** CSS Transitions + Custom Canvas Particle System (`VibeBackground.tsx`).
*   **Iconography:** Custom SVG library (`components/Icons.tsx`) optimized for React.

### Artificial Intelligence
*   **Provider:** Google Gemini API (`@google/genai`).
*   **Models:**
    *   `gemini-3-flash-preview`: Context-aware Chat, Content Generation, Reasoning.
    *   `gemini-2.5-flash-preview-tts`: Neural Text-to-Speech audio generation.
*   **Capabilities:** JSON Schema Enforcement, Context Injection, Multi-turn Chat.

---

## 3. Architecture & Data Flow

### A. The "Bit" Entity
The atomic unit of the platform. A "Bit" is a structured JSON object containing technical knowledge.

```typescript
interface Bit {
  id: string;          // UUID
  title: string;       // Topic Title
  summary: string;     // 1-2 sentence hook
  content: string;     // Deep dive (Markdown compatible)
  codeSnippet: string; // Syntax-highlighted example
  language: string;    // Language key for prism/highlighting
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];      // Taxonomy
  votes: number;       // Social proof
}
```

### B. Content Generation Pipelines (`CreateBitModal.tsx`)
1.  **Neural Synthesis (AI Mode):**
    *   User inputs topic (e.g., "Raft Consensus").
    *   `geminiService.ts` prompts LLM with strict JSON schema.
    *   LLM returns structured data.
    *   Client hydrates form for user review before publishing.
2.  **Manual Protocol:**
    *   User authors content directly via the built-in editor.
    *   Live preview of Syntax Highlighting and card layout.

### C. Gamification Engine (`UserStats`)
A reactive state machine that tracks engagement without a backend (MVP).
*   **XP System:** Actions trigger `handleAddXp` (Read: +10, Create: +50, Vote: +2).
*   **Streak Logic:** Compares `lastLogin` timestamp with `Date.now()`. Resets if > 48 hours.
*   **Badges:** Evaluated reactively in `App.tsx` via the `AVAILABLE_BADGES` registry.
    *   *Example:* `condition: (s) => s.streak >= 3` triggers the "On Fire" badge.

### D. Context-Aware AI Assistant (`ChatDrawer.tsx`)
A global overlay that persists across navigation.
*   **Context Injection:** When a user navigates to `/bit/react-hooks`, the chat prompt automatically prepends: `[System: User is viewing "React Hooks"]`.
*   **Grounding:** Uses Gemini's Search Grounding to provide cited sources for answers.

---

## 4. Project Structure

```bash
/
├── index.html              # Entry point, PWA meta tags, Tailwind CDN
├── index.tsx               # React Root, Providers (Router, Helmet, ErrorBoundary)
├── App.tsx                 # Main Logic: Routing, Global State, Layout
├── types.ts                # TypeScript Interfaces (Source of Truth)
├── utils.ts                # Helpers: Slugify, ID Generation, Formatting
├── metadata.json           # App manifest
│
├── services/
│   ├── geminiService.ts    # AI API wrappers (Generation, Chat, TTS)
│   ├── discordService.ts   # Webhook simulations for gamification
│   └── userService.ts      # Mock API for user progress aggregation
│
├── components/
│   ├── BitCard.tsx         # Desktop Grid Item (3D Tilt effect)
│   ├── BitSwipeDeck.tsx    # Mobile Tinder-like Interface (Touch events)
│   ├── BitDetailModal.tsx  # Full screen reading view
│   ├── CreateBitModal.tsx  # Dual-mode content factory
│   ├── ChatDrawer.tsx      # Global AI Assistant
│   ├── ProgressDashboard.tsx # Visualization of UserStats
│   ├── SimpleSyntaxHighlighter.tsx # Regex-based code colorizer
│   ├── VibeBackground.tsx  # Canvas particle animation
│   └── ... (Icons, Toast, Auth, etc.)
```

---

## 5. Component Architecture

A detailed breakdown of the UI/UX engineering choices.

### Core Logic & Layout
| Component | Type | Responsibility |
|:---|:---|:---|
| **`App.tsx`** | Orchestrator | Acts as the Root Controller. Manages `localStorage` hydration logic, `react-router` configuration, and Global State (User, Bits, XP). Handles the merging of "Seed Data" with "User Data". |
| **`ErrorBoundary.tsx`** | Wrapper | React Error Boundary implementation. Catches render-phase errors to prevent white-screen-of-death, providing a "System Malfunction" UI with a hard reload option. |
| **`NetworkStatus.tsx`** | Utility | Listens to `window.addEventListener('online'/'offline')`. Provides a toast-like overlay when the connection state changes. |

### Content Presentation
| Component | Type | Responsibility |
|:---|:---|:---|
| **`BitCard.tsx`** | Presentational | Displays bit metadata (Title, Summary, Tags). Implements **Physics-Based 3D Tilt**: Calculates `mousemove` deltas relative to the card center to apply CSS `perspective` and `rotate3d` transforms for a holographic feel. |
| **`BitSwipeDeck.tsx`** | Interaction | **Mobile-First Interaction Layer**. Replaces the grid view on mobile. Implements a touch gesture engine using `touchstart`/`touchmove` deltas to trigger voting (Right swipe) or skipping (Left swipe) via CSS transforms. |
| **`BitDetailModal.tsx`** | Modal | The "Read" view. Injects `JSON-LD` structured data via `react-helmet-async` for SEO. Handles the rendering of the full Markdown content and orchestrates sub-actions (Share, Bookmark, Vote). |

### Functional Features
| Component | Type | Responsibility |
|:---|:---|:---|
| **`CreateBitModal.tsx`** | Factory | **Dual-State Machine**. 1. **Neural Synthesis**: Async integration with `geminiService` to generate JSON. 2. **Manual Protocol**: Form-based editing. Validates inputs and generates UUIDs before persistence. |
| **`ChatDrawer.tsx`** | Global Overlay | Persistent AI Assistant. Maintains a singleton chat session. Implements **Context Injection** by observing Route params—if a user is viewing "React Hooks", the System Instruction is updated implicitly. |
| **`SimpleSyntaxHighlighter.tsx`** | Utility | Lightweight tokenizer. Avoids heavy dependencies (like PrismJS) for the MVP. Uses Regex replacement to wrap code tokens (`const`, `function`, strings) in `<span>` tags with Tailwind color classes. Supports multiple themes. |

### Visuals & Gamification
| Component | Type | Responsibility |
|:---|:---|:---|
| **`VibeBackground.tsx`** | Canvas FX | Pure HTML5 Canvas implementation. Runs outside the React render cycle via `requestAnimationFrame` to ensure 60fps particle physics without blocking the main thread. Handles mouse-repulsion physics. |
| **`ShareModal.tsx`** | Viral Loop | Uses `html2canvas` to rasterize a specific DOM node (the Bit Card) into a PNG blob, enabling "Share Image" functionality even for dynamically generated content. |
| **`UserProfileModal.tsx`** | Dashboard | Visualizes the `UserStats` state. Renders SVG-based progress bars and badge grids based on computed logic from `App.tsx`. |

---

## 6. Commercialization Protocols (2026 Vision)

Strategic monetization vectors designed to align with the developer ecosystem without degrading user experience.

### 1. Enterprise Neural Link (B2B SaaS)
*   **The Pitch:** "Internal Stack Overflow meets TikTok for Engineering Onboarding."
*   **Mechanism:** Companies pay per seat to host **Private Bits**.
*   **Use Case:** A Senior Architect at Netflix creates a 30-second Bit on *"How our specific Chaos Monkey config works"*. New hires swipe through company-specific knowledge during onboarding instead of reading stale Confluence pages.
*   **Value:** Drastically reduces "Time to First Commit" for new engineers.

### 2. Synapse Pro (B2C Subscription)
*   **The Pitch:** "Unlock the full power of the AI Architect."
*   **Features:**
    *   **Unlimited Neural Synthesis:** Access to `gemini-3-pro` for deeper, complex tutorials (Free tier limited to 3/day).
    *   **Interview Mode:** A dedicated AI agent that grills the user on specific tags (e.g., "System Design") with voice-to-voice interaction (Live API).
    *   **Audio Streams:** Auto-generate an "Audio Podcast" playlist of saved Bits to listen to while commuting.

### 3. The "Headhunter" Protocol (Recruitment)
*   **The Pitch:** "Proof of Work over Resumes."
*   **Mechanism:** Companies pay to access a filtered pool of elite users.
*   **Logic:** Recruiters search for *"Users in the top 1% of the 'Advanced React Patterns' quiz bracket who have maintained a 30-day streak"* rather than keyword matching resumes.
*   **Privacy:** Users opt-in to be "Discoverable" in exchange for a cut of the placement fee or free Pro status.

### 4. Sponsored "Deep Dive" Tracks
*   **The Pitch:** Native, high-value technical content.
*   **Mechanism:** Tech giants sponsor entire tags instead of banner ads.
*   **Example:** The `#edge-computing` tag is "Powered by **Cloudflare**". Cloudflare engineers contribute 50 high-quality, technically rigorous Bits about Workers/KV. Developers read them because they provide actual value.

---

## 7. Setup & Installation

### Prerequisites
*   Node.js v18+
*   Google Gemini API Key

### Environment Variables
Create a `.env` file (or set in your deployment environment):
```bash
API_KEY=your_google_gemini_api_key
```

### Running Locally
1.  **Install Dependencies:** (If migrating to local CLI)
    ```bash
    npm install
    ```
2.  **Start Dev Server:**
    ```bash
    npm run dev
    ```

*Note: The current environment uses ES Modules via `importmap` in `index.html` for instant browser execution without a heavy build step.*

---

## 8. License

Copyright © 2024 SYNAPSE BITS. All Rights Reserved.
