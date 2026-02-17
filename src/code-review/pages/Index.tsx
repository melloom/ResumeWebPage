import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Upload,
  Shield,
  Zap,
  Code2,
  Layout,
  Database,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@code-review/components/ui/button";
import { Card, CardContent } from "@code-review/components/ui/card";
import { categoryLabels, categoryIcons } from "@code-review/lib/types";

const features = [
  {
    icon: Shield,
    title: "Security Analysis",
    description: "Detect vulnerabilities, hardcoded secrets, and unsafe patterns",
  },
  {
    icon: Zap,
    title: "Performance Review",
    description: "Find re-render issues, missing memoization, and bundle bloat",
  },
  {
    icon: Layout,
    title: "Architecture Audit",
    description: "Evaluate folder structure, module boundaries, and separation of concerns",
  },
  {
    icon: Code2,
    title: "Code Quality",
    description: "Check naming conventions, type safety, dead code, and formatting",
  },
  {
    icon: Database,
    title: "State Management",
    description: "Detect state mutations, global vs local issues, and hook cleanup",
  },
  {
    icon: AlertTriangle,
    title: "Error Handling",
    description: "Find missing try/catch blocks, error boundaries, and edge cases",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Index = () => {
  return (
    <div className="relative">
      {/* Lite Version Banner */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Lite Version</span> — Try the analyzer without signing in. 
            For GitHub integration, data storage, and advanced features, visit{" "}
            <a 
              href="https://codeguard.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              codeguard.netlify.app
            </a>
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="absolute inset-0 gradient-primary opacity-[0.03] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center pointer-events-auto"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
            <span className="animate-pulse-glow inline-block h-2 w-2 rounded-full bg-primary" />
            AI-Powered Code Analysis
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Ship better code with{" "}
            <span className="gradient-text">intelligent reviews</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Scan your GitHub repos or upload files for instant AI analysis across
            7 critical categories — architecture, security, performance, and more.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row pointer-events-auto relative z-10">
            <Button asChild size="lg" className="gap-2 rounded-full px-8 pointer-events-auto relative z-10 button-fix">
              <Link to="/code-review/review/new?tab=github" className="pointer-events-auto relative z-10">
                <Github className="h-4 w-4" />
                Connect GitHub Repo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-8 pointer-events-auto relative z-10 button-fix">
              <Link to="/code-review/review/new?tab=upload" className="pointer-events-auto relative z-10">
                <Upload className="h-4 w-4" />
                Upload Files
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Categories overview */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              7 review categories, one comprehensive report
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every angle of your codebase analyzed in seconds
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={itemVariants}>
                <Card className="glass-card h-full transition-colors hover:border-primary/30">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="rounded-lg bg-accent p-2.5">
                      <f.icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-accent/50 p-8 text-center sm:p-12"
        >
          <TrendingUp className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">Want the full experience?</h2>
          <p className="mt-3 text-muted-foreground">
            Get GitHub integration, data storage, trend charts, and historical reviews with the full version.
          </p>
          <Button asChild className="mt-6 gap-2 rounded-full" size="lg">
            <a href="https://codeguard.netlify.app" target="_blank" rel="noopener noreferrer">
              Visit Full Version <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
