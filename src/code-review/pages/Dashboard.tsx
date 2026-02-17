import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  FileWarning,
  FileText,
  CheckCircle2,
  ArrowRight,
  Plus,
  Github,
  Upload,
  Settings2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@code-review/components/ui/card";
import { Button } from "@code-review/components/ui/button";
import { Badge } from "@code-review/components/ui/badge";
import { Review } from "@code-review/lib/types";
import { loadReviews } from "@code-review/lib/review-store";
import WebhookReceiver from "@code-review/components/WebhookReceiver";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-success"
      : score >= 60
      ? "text-warning"
      : "text-destructive";
  return (
    <div className="flex flex-col items-center">
      <div
        className={`text-5xl font-extrabold tabular-nums ${color}`}
      >
        {score}
      </div>
      <span className="mt-1 text-sm text-muted-foreground">Health Score</span>
    </div>
  );
}

const Dashboard = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const remote = await loadReviews();
        setReviews(remote);
        // Cache to localStorage for offline fallback
        localStorage.setItem('reviews', JSON.stringify(remote));
      } catch (error) {
        console.warn('Failed to load from Firestore, using localStorage fallback:', error);
        try {
          const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
          setReviews(storedReviews);
        } catch (err) {
          console.error('Error loading local fallback reviews:', err);
          setReviews([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : undefined;
  const totalIssues = reviews.reduce((s, r) => s + r.totalIssues, 0);
  const totalCritical = reviews.reduce((s, r) => s + r.critical, 0);
  const totalWarnings = reviews.reduce((s, r) => s + r.warnings, 0);
  const totalImprovements = reviews.reduce((s, r) => s + r.improvements, 0);

  const stats = [
    { label: "Total Issues", value: totalIssues, icon: FileWarning, color: "text-foreground" },
    { label: "Critical", value: totalCritical, icon: AlertTriangle, color: "text-destructive" },
    { label: "Warnings", value: totalWarnings, icon: FileWarning, color: "text-warning" },
    { label: "Improvements", value: totalImprovements, icon: CheckCircle2, color: "text-info" },
  ];

  // Generate trend data from actual reviews
  const trendData = reviews.slice(-8).map((review, index) => ({
    date: new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: review.score,
    issues: review.totalIssues,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild size="sm" className="gap-2 rounded-full">
          <Link to="/code-review/review/new">
            <Plus className="h-4 w-4" /> New Review
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Card className="glass-card sm:col-span-2 lg:col-span-1 flex items-center justify-center py-6">
          {latestReview ? (
            <ScoreGauge score={latestReview.score} />
          ) : (
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by analyzing a GitHub repository.
              </p>
              <Button asChild>
                <Link to="/code-review/review/new">Start Analysis</Link>
              </Button>
            </div>
          )}
        </Card>
        {stats.map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-secondary p-2.5">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      {trendData.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Health Score Trend</CardTitle>
              <CardDescription>Score over last {trendData.length} days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 13,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Issues Over Time</CardTitle>
              <CardDescription>Total issues per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="issues" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Trend Data</h3>
              <p className="text-muted-foreground">
                Start analyzing repositories to see trends.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reviews */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length > 0 ? (
            [...reviews].reverse().map((review) => (
              <Link
                key={review.id}
                to={`/review/${review.id}`}
                className="flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  {review.source === "github" ? (
                    <Github className="h-5 w-5" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{review.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()} •{" "}
                    {review.totalIssues} issues
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {review.critical > 0 && (
                    <Badge variant="destructive" className="font-mono text-xs">
                      {review.critical} critical
                    </Badge>
                  )}
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      review.score >= 80
                        ? "text-success"
                        : review.score >= 60
                        ? "text-warning"
                        : "text-destructive"
                    }`}
                  >
                    {review.score}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by analyzing a GitHub repository or uploading files.
              </p>
              <Button asChild>
                <Link to="/code-review/review/new">Start Analysis</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
