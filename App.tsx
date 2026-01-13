
import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bit, UserStats, AuthUser, Tutorial } from './types';
import BitCard from './components/BitCard';
import CreateBitModal from './components/CreateBitModal';
import BitDetailModal from './components/BitDetailModal';
import ShareModal from './components/ShareModal';
import { ToastType } from './components/Toast';
import VibeBackground from './components/VibeBackground';
import BitSwipeDeck from './components/BitSwipeDeck';
import NetworkStatus from './components/NetworkStatus';
import AuthModal from './components/AuthModal';
import UpgradeModal from './src/components/UpgradeModal';
import ProgressDashboard from './components/ProgressDashboard';
import ChatDrawer from './components/ChatDrawer';
import TutorialCard from './components/TutorialCard';
import TutorialReader from './components/TutorialReader';
import HomePage from './src/pages/HomePage';
import TopicsPage from './src/pages/TopicsPage';
import TopicPage from './src/pages/TopicPage';
import TracksPage from './src/pages/TracksPage';
import TrackPage from './src/pages/TrackPage';
import { IconSearch, IconPlus, IconCpu, IconFire, IconCompass, IconStar, IconMenu, IconBookmark, IconBook, IconHome } from './components/Icons';
import { slugify } from './utils';
import { INITIAL_BITS } from './src/data/bits';
import { INITIAL_TUTORIALS } from './src/data/tutorials';
import { INITIAL_STATS, DID_YOU_KNOW_FACTS } from './src/data/appData';


// Progress utility functions
function isCompleted(stats: UserStats, bitId: string): boolean {
    return stats.completedBits.includes(bitId);
}

function markCompleted(stats: UserStats, bitId: string): UserStats {
    if (isCompleted(stats, bitId)) return stats;
    return {
        ...stats,
        completedBits: [...stats.completedBits, bitId],
        lastSeenBitId: bitId
    };
}

// --- COMPONENTS ---

interface BitDetailRouteProps {
    bits: Bit[];
    onVote: (id: string) => void;
    showToast: (msg: string, type?: ToastType) => void;
    onAddXp: (amount: number) => void;
    onQuizWin: () => void;
    stats: UserStats;
    onBookmark: (bit: Bit) => void;
    user: AuthUser | null;
    onBitComplete: (bit: Bit, timeSpent: number) => void;
    onMarkCompleted: (id: string) => void;
    onShare: (bit: Bit) => void;
}

// Route wrapper for detail modal
const BitDetailRoute = ({ bits, onVote, showToast, onAddXp, onQuizWin, stats, onBookmark, user, onBitComplete, onMarkCompleted, onShare }: BitDetailRouteProps) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract navigation context from state
    const state = (location.state as any) || {};
    const from = state.from || '/';
    const context = state.context; // 'track' or 'topic'

    // Lookup by Slug OR ID (legacy)
    const bit = bits.find((b: Bit) => slugify(b.title) === slug || b.id === slug);

    if (!bit) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Bit Not Found</h2>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-600 rounded-lg text-white">Return Home</button>
                </div>
            </div>
        );
    }

    // Next/Prev Logic
    let onNext: (() => void) | undefined;
    let onPrevious: (() => void) | undefined;
    let currentIndex: number | undefined;
    let totalCount: number | undefined;
    let contextLabel: string | undefined;

    if (context === 'track' && state.trackBitIds) {
        const bitIds = state.trackBitIds;
        const idx = bitIds.indexOf(bit.id);
        currentIndex = idx;
        totalCount = bitIds.length;
        contextLabel = state.contextLabel;

        if (idx < bitIds.length - 1) {
            onNext = () => {
                const nextBitId = bitIds[idx + 1];
                const nextBit = bits.find(b => b.id === nextBitId);
                if (nextBit) {
                    navigate(`/bit/${slugify(nextBit.title)}`, { state: { ...state, currentIndex: idx + 1 } });
                }
            };
        }

        if (idx > 0) {
            onPrevious = () => {
                const prevBitId = bitIds[idx - 1];
                const prevBit = bits.find(b => b.id === prevBitId);
                if (prevBit) {
                    navigate(`/bit/${slugify(prevBit.title)}`, { state: { ...state, currentIndex: idx - 1 } });
                }
            };
        }
    } else if (context === 'topic' && state.topicBitIds) {
        const bitIds = state.topicBitIds;
        const idx = bitIds.indexOf(bit.id);
        currentIndex = idx;
        totalCount = bitIds.length;
        contextLabel = state.contextLabel;

        if (idx < bitIds.length - 1) {
            onNext = () => {
                const nextBitId = bitIds[idx + 1];
                const nextBit = bits.find(b => b.id === nextBitId);
                if (nextBit) {
                    navigate(`/bit/${slugify(nextBit.title)}`, { state: { ...state, currentIndex: idx + 1 } });
                }
            };
        }

        if (idx > 0) {
            onPrevious = () => {
                const prevBitId = bitIds[idx - 1];
                const prevBit = bits.find(b => b.id === prevBitId);
                if (prevBit) {
                    navigate(`/bit/${slugify(prevBit.title)}`, { state: { ...state, currentIndex: idx - 1 } });
                }
            };
        }
    }

    const isBookmarked = stats?.bookmarkedBits?.includes(bit.id) || false;

    return (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div></div>}>
            <BitDetailModal
                bit={bit}
                allBits={bits}
                isBookmarked={isBookmarked}
                onClose={() => navigate(from)}
                onVote={onVote}
                onBookmark={onBookmark}
                onShare={onShare}
                showToast={showToast}
                onAddXp={onAddXp}
                onQuizWin={onQuizWin}
                onComplete={onBitComplete}
                onMarkCompleted={onMarkCompleted}
                user={user}
                onNext={onNext}
                onPrevious={onPrevious}
                currentIndex={currentIndex}
                totalCount={totalCount}
                contextLabel={contextLabel}
            />
        </Suspense>
    );
};

// Featured "Daily Bit" Component
const DailyBitHero = ({ bit, onClick }: { bit: Bit, onClick: (bit: Bit) => void }) => {
    // ... (Existing code)
    if (!bit) return null;
    return (
        <div className="mb-12 relative group cursor-pointer w-full" onClick={() => onClick(bit)}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000 pointer-events-none"></div>
            <div className="relative glass-panel rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-indigo-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-50"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center space-x-2 text-amber-400">
                                <IconStar className="w-3.5 h-3.5" fill />
                                <span className="text-xs font-bold uppercase tracking-widest">Daily Highlight</span>
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">{bit.title}</h2>
                        <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">{bit.summary}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sidebar Navigation Component
const Sidebar = ({
    activeTab,
    setActiveTab,
    categories,
    navigate,
    setSearchTerm,
    setCurrentPage
}: {
    activeTab: string,
    setActiveTab: (t: string) => void,
    categories: string[],
    navigate: (path: string) => void,
    setSearchTerm: (s: string) => void,
    setCurrentPage: (p: number) => void
}) => {

    const [randomFact, setRandomFact] = useState(() => DID_YOU_KNOW_FACTS[Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length)]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRandomFact(DID_YOU_KNOW_FACTS[Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length)]);
        }, 30000); // Change every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className="hidden lg:block w-72 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-4 scrollbar-hide">
            <nav className="space-y-10">

                {/* Main Nav */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">System Feed</h3>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => { setActiveTab('home'); navigate('/'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'home' || activeTab === ''
                                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconHome className={`w-5 h-5 ${activeTab === 'home' ? 'animate-pulse' : ''}`} />
                                    <span className="font-medium">Home</span>
                                </div>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setActiveTab('all'); navigate('/explore'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'all'
                                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconCompass className={`w-5 h-5 ${activeTab === 'all' ? 'animate-pulse' : ''}`} />
                                    <span className="font-medium">Explore</span>
                                </div>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setActiveTab('tutorials'); navigate('/tutorials'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'tutorials'
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconBook className="w-5 h-5" />
                                    <span className="font-medium">Tutorials</span>
                                </div>
                                {activeTab === 'tutorials' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setActiveTab('saved'); navigate('/saved'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'saved'
                                    ? 'bg-amber-600 text-white shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconBookmark className="w-5 h-5" />
                                    <span className="font-medium">Saved</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Topics */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Learning Paths</h3>
                    <ul className="space-y-2 mb-6">
                        <li>
                            <button
                                onClick={() => { setActiveTab('topics'); navigate('/topics'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'topics'
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconBook className="w-5 h-5" />
                                    <span className="font-medium">Topics</span>
                                </div>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setActiveTab('tracks'); navigate('/tracks'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'tracks'
                                    ? 'bg-purple-600 text-white shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconStar className="w-5 h-5" />
                                    <span className="font-medium">Tracks</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Data Streams */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Data Streams</h3>
                    <ul className="space-y-1">
                        {categories.slice(0, 8).map(cat => (
                            <li key={cat}>
                                <button
                                    onClick={() => { setSearchTerm(''); setActiveTab(cat); setCurrentPage(1); navigate('/explore'); }}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === cat
                                        ? 'text-emerald-400 bg-emerald-400/10 border-l-2 border-emerald-400 translate-x-2'
                                        : 'text-slate-500 hover:text-slate-300 hover:translate-x-1 border-l-2 border-transparent'
                                        }`}
                                >
                                    <span className="text-xs opacity-50 font-mono">#</span>
                                    <span className="capitalize">{cat}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Did You Know Section */}
                <div className="px-4">
                    <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                        <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider">Did You Know?</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{randomFact}</p>
                    </div>
                </div>

                {/* Quick Stats Module */}
                <div className="px-4">
                    <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
                        <div className="flex items-center space-x-2 mb-3">
                            <IconCpu className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Knowledge Base</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Total Bits</span>
                                <span className="text-sm font-bold text-white">101</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Categories</span>
                                <span className="text-sm font-bold text-white">{categories.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Active Learners</span>
                                <span className="text-sm font-bold text-emerald-400">2.5k+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
};

const ITEMS_PER_PAGE = 6;

const App: React.FC = () => {
// Wrapper components with access to state
const TracksPageWrapper = ({ bits }: { bits: Bit[] }) => <TracksPage bits={bits} />;
const TrackPageWrapper = ({ bits, stats, user }: { bits: Bit[], stats: UserStats, user: AuthUser | null }) => <TrackPage bits={bits} stats={stats} user={user} />;


    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Authentication State
    const [user, setUser] = useState<AuthUser | null>(() => {
        const savedUser = localStorage.getItem('ai-bits-user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Bits state: ONLY from INITIAL_BITS normalized
    const [bits] = useState<Bit[]>(INITIAL_BITS);

    const [tutorials] = useState<Tutorial[]>(INITIAL_TUTORIALS);

    const [xp, setXp] = useState<number>(() => {
        try { const saved = localStorage.getItem('ai-bits-xp'); return saved ? parseInt(saved) : 0; } catch { return 0; }
    });

    const [stats, setStats] = useState<UserStats>(() => {
        try {
            const saved = localStorage.getItem('ai-bits-stats');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure backward compatibility for new fields
                if (!parsed.bookmarkedBits) parsed.bookmarkedBits = [];
                if (!parsed.completedBits) parsed.completedBits = [];
                if (!parsed.lastSeenBitId) parsed.lastSeenBitId = undefined;
                return parsed;
            }
            return INITIAL_STATS;
        } catch {
            return INITIAL_STATS;
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [sharingBit, setSharingBit] = useState<Bit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'tutorials', 'saved', or tag
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate context
    const currentSlug = location.pathname.split('/bit/')[1];
    const currentBit = useMemo(() => {
        if (!currentSlug) return null;
        return bits.find(bit => slugify(bit.title) === currentSlug || bit.id === currentSlug) || null;
    }, [currentSlug, bits]);

    const currentBitContext = currentBit?.title;

    // Handle Tab Logic based on URL
    useEffect(() => {
        if (location.pathname === '/tutorials') {
            setActiveTab('tutorials');
        } else if (location.pathname === '/' && activeTab === 'tutorials') {
            setActiveTab('all');
        }
    }, [location.pathname]);

    // Persist stats to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('ai-bits-stats', JSON.stringify(stats));
        } catch (e) {
            console.error('Failed to save stats:', e);
        }
    }, [stats]);

    // Persist XP to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('ai-bits-xp', xp.toString());
        } catch (e) {
            console.error('Failed to save XP:', e);
        }
    }, [xp]);

    const addToast = (message: string, type: ToastType = 'info') => {
        // Log toast for now as UI for toasts is not yet implemented
        console.log(`Toast [${type}]: ${message}`);
    };

    const handleAddXp = (amount: number) => { setXp(prev => prev + amount); addToast(`+${amount} XP Gained!`, 'success'); };

    const handleBookmark = (bit: Bit) => {
        if (!user) { setIsLoginModalOpen(true); return; }
        const bitId = bit.id;
        setStats(prev => {
            const newStats = { ...prev };
            if (!newStats.bookmarkedBits) newStats.bookmarkedBits = [];
            if (newStats.bookmarkedBits.includes(bitId)) {
                newStats.bookmarkedBits = newStats.bookmarkedBits.filter(id => id !== bitId);
                addToast('Removed from saved bits', 'info');
            } else {
                newStats.bookmarkedBits = [...newStats.bookmarkedBits, bitId];
                addToast('Saved to bookmarks', 'success');
            }
            return newStats;
        });
    };

    const handleBitComplete = (_bit: Bit, _timeSpent: number = 0) => {
        if (!user) return;
        setStats(prev => {
            const newStats = { ...prev, bitsRead: (prev.bitsRead || 0) + 1 };
            handleAddXp(10);
            return newStats;
        });
    };

    const handleMarkCompleted = (bitId: string) => {
        if (!user) return;
        setStats(prev => markCompleted(prev, bitId));
        handleAddXp(10);
        addToast('Marked as learned', 'success');
    };

    const handleQuizWin = () => {
        if (!user) return;
        setStats(prev => ({ ...prev, quizzesWon: (prev.quizzesWon || 0) + 1 }));
        handleAddXp(25);
        addToast('Quiz completed! +25 XP', 'success');
    };

    const handleVote = (_id: string) => {
        if (!user) { setIsLoginModalOpen(true); return; }
        // Voting not persisted locally since INITIAL_BITS is the only source
        handleAddXp(2);
    };

    const handleUpgrade = () => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, isPro: true };
            localStorage.setItem('ai-bits-user', JSON.stringify(updated));
            return updated;
        });
        setIsUpgradeModalOpen(false);
        addToast('Welcome to Pro! Unlock all premium content.', 'success');
    };

    const categories = useMemo(() => {
        const allTags = bits.flatMap(b => b.tags);
        const counts: Record<string, number> = {};
        allTags.forEach(t => counts[t] = (counts[t] || 0) + 1);
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
    }, [bits]);

    return (
        <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col">
            <Helmet>
                <title>{currentBit ? `${currentBit.title} | SYNAPSE BITS` : 'SYNAPSE BITS | Neural Knowledge Stream'}</title>
                <meta name="description" content={currentBit ? currentBit.summary : 'Next-gen AI micro-learning for engineers. Master networking, distributed systems, and coding patterns with high-velocity data bits.'} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="SYNAPSE BITS" />
                <meta property="og:title" content={currentBit ? `${currentBit.title} | SYNAPSE BITS` : 'SYNAPSE BITS | Neural Knowledge Stream'} />
                <meta property="og:description" content={currentBit ? currentBit.summary : 'Next-gen AI micro-learning for engineers. Master networking, distributed systems, and coding patterns with high-velocity data bits.'} />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content={typeof window !== 'undefined' ? `${window.location.origin}/og-image.svg` : '/og-image.svg'} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={currentBit ? `${currentBit.title} | SYNAPSE BITS` : 'SYNAPSE BITS | Neural Knowledge Stream'} />
                <meta name="twitter:description" content={currentBit ? currentBit.summary : 'Next-gen AI micro-learning for engineers. Master networking, distributed systems, and coding patterns with high-velocity data bits.'} />
                <meta name="twitter:image" content={typeof window !== 'undefined' ? `${window.location.origin}/og-image.svg` : '/og-image.svg'} />
            </Helmet>
            <VibeBackground />
            <NetworkStatus />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col mb-24 md:mb-0">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-12 sticky top-4 z-40 bg-black/60 backdrop-blur-xl py-3 px-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => { setSearchTerm(''); navigate('/'); }}>
                            <div className="relative group/logo">
                                <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 group-hover/logo:opacity-40 transition-opacity"></div>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transform transition-transform group-hover/logo:scale-105">
                                    <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#premium_gradient)" />
                                    <path d="M22 11L16 20H21L19 29L26 18H20.5L22 11Z" fill="white" />
                                    <defs><linearGradient id="premium_gradient" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
                                </svg>
                            </div>
                            <div><h1 className="text-xl font-black tracking-tight text-white">SYNAPSE BITS</h1></div>
                        </div>
                        <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <IconMenu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:block flex-1 max-w-xl mx-auto md:ml-12 relative">
                        <div className="relative group">
                            <IconSearch className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:bg-black focus:border-indigo-500 transition-all"
                                placeholder="Search knowledge... (/)"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (location.pathname !== '/explore' && e.target.value) {
                                        navigate('/explore');
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* User Controls */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center space-x-4 bg-slate-900/50 border border-white/5 rounded-full px-5 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                                <div className="flex items-center space-x-1.5 text-orange-400"><IconFire className="w-4 h-4" /><span className="font-bold text-sm font-mono">{stats.streak}</span></div>
                                <div className="w-px h-4 bg-white/10"></div>
                                <div className="flex items-center space-x-2 text-indigo-400"><span className="text-xs font-bold font-mono">Lvl {Math.floor(xp / 100) + 1}</span></div>
                            </div>
                        ) : (
                            <button onClick={() => setIsLoginModalOpen(true)} className="px-5 py-2 text-sm font-bold text-white hover:text-indigo-400 transition-colors">Log In</button>
                        )}
                        <button onClick={() => user ? setIsModalOpen(true) : setIsLoginModalOpen(true)} className="flex items-center justify-center px-5 py-2 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform"><IconPlus className="mr-2 h-4 w-4" /><span>Create</span></button>
                    </div>
                </header>


                <div className="flex flex-col lg:flex-row gap-10">
                    <Sidebar
                        activeTab={location.pathname === '/' ? 'home' : location.pathname.substring(1) || 'all'}
                        setActiveTab={setActiveTab}
                        categories={categories}
                        navigate={navigate}
                        setSearchTerm={setSearchTerm}
                        setCurrentPage={setCurrentPage}
                    />

                    <main className="flex-1 min-w-0 pb-20">
                        <Routes>
                            <Route path="/" element={<HomePage bits={bits} stats={stats} user={user} xp={xp} onShare={(b: Bit) => setSharingBit(b)} onBookmark={handleBookmark} />} />
                            <Route path="/explore" element={
                                <ExploreView
                                    bits={bits}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    stats={stats}
                                    user={user}
                                    xp={xp}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    handleBookmark={handleBookmark}
                                    handleVote={handleVote}
                                    setSharingBit={setSharingBit}
                                    navigate={navigate}
                                />
                            } />
                            <Route path="/saved" element={
                                <ExploreView
                                    bits={bits}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    activeTab="saved"
                                    setActiveTab={setActiveTab}
                                    stats={stats}
                                    user={user}
                                    xp={xp}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    handleBookmark={handleBookmark}
                                    handleVote={handleVote}
                                    setSharingBit={setSharingBit}
                                    navigate={navigate}
                                />
                            } />
                            <Route path="/tutorials" element={
                                <TutorialsView tutorials={tutorials} user={user} />
                            } />
                            <Route path="/topics" element={<TopicsPage bits={bits} stats={stats} />} />
                            <Route path="/topic/:slug" element={<TopicPageWrapper bits={bits} stats={stats} user={user} />} />
                            <Route path="/tracks" element={<TracksPageWrapper bits={bits} />} />
                            <Route path="/track/:slug" element={<TrackPageWrapper bits={bits} stats={stats} user={user} />} />

                            <Route path="/bit/:slug" element={
                                <BitDetailRoute
                                    bits={bits}
                                    onVote={handleVote}
                                    showToast={addToast}
                                    onAddXp={handleAddXp}
                                    onQuizWin={handleQuizWin}
                                    stats={stats}
                                    onBookmark={handleBookmark}
                                    user={user}
                                    onBitComplete={handleBitComplete}
                                    onMarkCompleted={handleMarkCompleted}
                                    onShare={(b: Bit) => setSharingBit(b)}
                                />
                            } />

                            <Route path="/tutorial/:slug" element={
                                <TutorialReaderWrapper tutorials={tutorials} user={user} openLogin={() => setIsLoginModalOpen(true)} />
                            } />
                        </Routes>
                    </main>
                </div>

            </div>

            <ChatDrawer context={currentBitContext} />


            {/* Modals ... */}
            {isModalOpen && <CreateBitModal onClose={() => setIsModalOpen(false)} onSave={() => { }} showToast={addToast} />}
            {sharingBit && <ShareModal bit={sharingBit} onClose={() => setSharingBit(null)} />}
            {isLoginModalOpen && <AuthModal onClose={() => setIsLoginModalOpen(false)} onLogin={(u) => { setUser(u); setIsLoginModalOpen(false); addToast(`Welcome ${u.name}`); }} />}
            {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={handleUpgrade} />}
            {/* ... */}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const ExploreView = ({
    bits, searchTerm, setSearchTerm, activeTab, setActiveTab, stats, user, xp,
    currentPage, setCurrentPage, handleBookmark, handleVote: _handleVote, setSharingBit, navigate
}: {
    bits: Bit[],
    searchTerm: string,
    setSearchTerm: (s: string) => void,
    activeTab: string,
    setActiveTab: (s: string) => void,
    stats: UserStats,
    user: AuthUser | null,
    xp: number,
    currentPage: number,
    setCurrentPage: (p: number | ((prev: number) => number)) => void,
    handleBookmark: (bit: Bit) => void,
    handleVote: (id: string) => void,
    setSharingBit: (bit: Bit | null) => void,
    navigate: (path: string) => void
}) => {
    const filteredBits = useMemo(() => {
        return bits.filter((bit: Bit) => {
            const matchesSearch = bit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bit.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
            let matchesTab = true;
            if (activeTab === 'trending') matchesTab = bit.votes > 100;
            else if (activeTab === 'saved') matchesTab = stats.bookmarkedBits?.includes(bit.id) || false;
            else if (activeTab !== 'all' && activeTab !== 'home') matchesTab = bit.tags.includes(activeTab) || bit.language === activeTab;

            return matchesSearch && matchesTab;
        });
    }, [bits, searchTerm, activeTab, stats.bookmarkedBits]);

    const totalPages = Math.ceil(filteredBits.length / ITEMS_PER_PAGE);
    const paginatedBits = filteredBits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user && (activeTab === 'all' || activeTab === 'home') && !searchTerm && <ProgressDashboard user={user} localStats={stats} bits={bits} xp={xp} />}
            {(activeTab === 'all' || activeTab === 'home') && !searchTerm && currentPage === 1 && (
                <div className="hidden md:block">
                    <DailyBitHero bit={bits[0]} onClick={(b) => navigate(`/bit/${slugify(b.title)}`)} />
                </div>
            )}

            <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        {activeTab === 'all' ? (searchTerm ? 'Search Results' : 'Explore Feed') : activeTab === 'saved' ? 'Saved Bits' : <span className="capitalize">{activeTab}</span>}
                    </h2>
                </div>
            </div>

            <div>
                {paginatedBits.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {paginatedBits.map((bit: Bit) => (
                                <div key={bit.id} className="h-full">
                                    <BitCard
                                        bit={bit}
                                        isBookmarked={stats?.bookmarkedBits?.includes(bit.id) || false}
                                        navigationState={{ from: location.pathname }}
                                        onClick={() => {}}
                                        onShare={(b: Bit) => setSharingBit(b)}
                                        onTagClick={(tag: string) => { setSearchTerm(tag); setActiveTab('all'); }}
                                        onBookmark={() => handleBookmark(bit)}
                                    />
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center space-x-2">
                                <button onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30">Prev</button>
                                <span className="text-slate-500 px-4 text-sm font-medium">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 disabled:opacity-30">Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center border border-dashed border-white/5 rounded-3xl bg-white/5">
                        <h3 className="text-xl font-bold text-white">No bits found</h3>
                        <p className="text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            <div className="md:hidden mt-12 pb-24">
                <h3 className="text-xl font-bold text-white mb-6">Swipe to Learn</h3>
                <BitSwipeDeck bits={filteredBits} onVote={() => { }} onShare={(b: Bit) => setSharingBit(b)} />
            </div>
        </div>
    );
};

const TutorialsView = ({ tutorials, user }: { tutorials: Tutorial[], user: AuthUser | null }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                    <IconBook className="w-8 h-8 text-emerald-500" />
                    Deep Dive Tutorials
                </h2>
                <p className="text-slate-400 mt-2">Comprehensive guides and lessons for advanced engineering.</p>
            </div>

            <div className="grid gap-6">
                {tutorials.map((tutorial: Tutorial) => (
                    <TutorialCard
                        key={tutorial.id}
                        tutorial={tutorial}
                        isLocked={tutorial.isPremium && !user?.isPro}
                    />
                ))}
            </div>
        </div>
    );
};

// Wrapper components for new pages
const TopicPageWrapper = ({ bits, stats, user }: { bits: Bit[], stats: UserStats, user: AuthUser | null }) => {
    return <TopicPage bits={bits} stats={stats} user={user} />;
};


// Wrapper to handle finding tutorial
const TutorialReaderWrapper = ({ tutorials, user, openLogin }: { tutorials: Tutorial[], user: AuthUser | null, openLogin: () => void }) => {
    const { slug } = useParams();
    const tutorial = tutorials.find((t: Tutorial) => t.slug === slug);
    if (!tutorial) return <div>Not Found</div>;
    return <TutorialReader tutorial={tutorial} user={user} onLoginRequest={openLogin} />;
};

export default App;
