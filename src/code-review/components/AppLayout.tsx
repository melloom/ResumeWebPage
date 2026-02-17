import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  GitPullRequest,
  Settings,
  Home,
  Menu,
  X,
  Code2,
  ChevronRight,
  Webhook,
  Github,
  ArrowLeft,
  History,
  Clock,
} from "lucide-react";
import { Button } from "@code-review/components/ui/button";
import { cn } from "@code-review/lib/utils";

const navItems = [
  { path: "/code-review", label: "Home", icon: Home },
  { path: "/code-review/review/new", label: "New Review", icon: Plus },
  { path: "/code-review/review", label: "History", icon: History },
  { path: "/ai-lab", label: "Back to Portfolio", icon: ArrowLeft },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const location = useLocation();

  // Load reviews from localStorage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        setReviews(parsedReviews);
      } catch (error) {
        console.error('Failed to load reviews from localStorage:', error);
      }
    }
  }, []);

  // Listen for review updates
  useEffect(() => {
    const handleReviewUpdate = (event: CustomEvent) => {
      const newReview = event.detail;
      setReviews(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(r => r.id === newReview.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = newReview;
        } else {
          updated.unshift(newReview);
        }
        // Keep only last 50 reviews
        const limited = updated.slice(0, 50);
        localStorage.setItem('reviews', JSON.stringify(limited));
        return limited;
      });
    };

    window.addEventListener('review-updated', handleReviewUpdate);
    
    return () => {
      window.removeEventListener('review-updated', handleReviewUpdate);
    };
  }, []);

  return (
    <div
      className="flex min-h-screen bg-background"
      style={{
        background: 'linear-gradient(180deg, hsl(220 20% 97%), hsl(220 15% 94%))',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          top: 'env(safe-area-inset-top)',
          left: 'env(safe-area-inset-left)',
          bottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            Code<span className="text-primary">Review</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.path === "/code-review"
                ? location.pathname === "/code-review"
                : item.path === "/code-review/review"
                  ? location.pathname.startsWith("/code-review/review")
                  : location.pathname.startsWith(item.path) && item.path !== "/ai-lab";
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-3 w-3" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-xs font-medium text-primary">Lite Version</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No sign-in required • Instant analysis
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header 
          className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4"
          style={{
            top: 'env(safe-area-inset-top)',
            left: 'env(safe-area-inset-left)',
            right: 'env(safe-area-inset-right)',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        <main 
          className="flex-1 overflow-auto"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          {children}
        </main>

        <footer className="border-t border-border bg-background/95 backdrop-blur-sm px-4 py-4">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2026 Melvin's Code Review Copilot - Lite Version</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://codeguard.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Full Version
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
