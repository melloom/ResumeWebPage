import { Toaster } from "@code-review/components/ui/toaster";
import { Toaster as Sonner } from "@code-review/components/ui/sonner";
import { TooltipProvider } from "@code-review/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@code-review/components/ThemeProvider";
import { AppLayout } from "@code-review/components/AppLayout";
import { DataCleanupManager } from "@code-review/components/DataCleanupManager";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewReview from "./pages/NewReview";
import ReviewResults from "./pages/ReviewResults";
import PRReview from "./pages/PRReview";
import Settings from "./pages/Settings";
import WebhookReceiver from "./components/WebhookReceiver";
import GitHubOAuthIntegration from "./components/GitHubOAuthIntegration";
import Login from "./pages/Login";
import AuthGuard from "./components/AuthGuard";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import "./code-review.css";

const queryClient = new QueryClient();

const CodeReviewApp = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DataCleanupManager />
        <div className="code-review-root dark">
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="review" element={<ReviewResults />} />
              <Route path="review/" element={<ReviewResults />} />
              <Route path="review/new" element={<NewReview />} />
              <Route path="review/:id" element={<ReviewResults />} />
              <Route path="callback" element={<OAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default CodeReviewApp;
