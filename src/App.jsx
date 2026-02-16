import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageLoader from './components/common/PageLoader';
import PageTransition from './components/common/PageTransition';
import InstallPWA from './components/common/InstallPWA';
import AdminLoginModal from './components/common/AdminLoginModal';
import AddProjectModal from './components/common/AddProjectModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import useKeyboardShortcut from './hooks/useKeyboardShortcut';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getProjects } from './services/projectService';
import BackToTop from './components/common/BackToTop';
import AIWidget from './components/ai/AIWidget';
import { initPWA } from './utils/pwaHelper';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Resume = lazy(() => import('./pages/Resume'));
const Contact = lazy(() => import('./pages/Contact'));
const Projects = lazy(() => import('./pages/Projects'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AILab = lazy(() => import('./pages/AILab'));

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const location = useLocation();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Initialize PWA helpers
  useEffect(() => {
    initPWA();
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Keyboard shortcut for admin login (Ctrl+A or Ctrl+L) - only when not authenticated
  useKeyboardShortcut('ctrl+a', () => {
    setIsAdminModalOpen(true);
  }, !isAuthenticated);

  useKeyboardShortcut('ctrl+l', () => {
    setIsAdminModalOpen(true);
  }, !isAuthenticated);

  // Reset scroll position when navigating to a new page
  useEffect(() => {
    if (location.hash === '') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // Handle adding new project
  const handleAddProject = () => {
    setIsAddProjectModalOpen(true);
  };

  // Handle project added callback
  const handleProjectAdded = (newProject) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };

  // Handle project deleted callback
  const handleProjectDeleted = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  // Load projects from Firebase on mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const result = await getProjects();
        if (result.success) {
          setProjects(result.projects);
        } else {
          console.error('Failed to load projects:', result.error);
          // Fallback to localStorage if Firebase fails
          const savedProjects = localStorage.getItem('userProjects');
          if (savedProjects) {
            try {
              setProjects(JSON.parse(savedProjects));
            } catch (error) {
              console.error('Error loading projects from localStorage:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to localStorage
        const savedProjects = localStorage.getItem('userProjects');
        if (savedProjects) {
          try {
            setProjects(JSON.parse(savedProjects));
          } catch (error) {
            console.error('Error loading projects from localStorage:', error);
          }
        }
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Update localStorage as backup when projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('userProjects', JSON.stringify(projects));
    }
  }, [projects]);

  return (
      <div className="app-container">
        <ThemeProvider>
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onAddProject={handleAddProject}
        />
          <Suspense fallback={<PageLoader />}>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects userProjects={projects} isLoading={isLoadingProjects} onProjectDeleted={handleProjectDeleted} />} />
              <Route path="/ai-lab" element={<AILab />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </Suspense>
          <Footer />
          <BackToTop />
          <AIWidget />
          <InstallPWA />
        <AdminLoginModal 
          isOpen={isAdminModalOpen} 
          onClose={() => setIsAdminModalOpen(false)} 
        />
        <AddProjectModal 
          isOpen={isAddProjectModalOpen} 
          onClose={() => setIsAddProjectModalOpen(false)}
          onProjectAdded={handleProjectAdded}
        />
        </ThemeProvider>
      </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;