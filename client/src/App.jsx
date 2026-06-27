import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PDFToolkit = React.lazy(() => import('./pages/PDFToolkit'));
const ImageTools = React.lazy(() => import('./pages/ImageTools'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Success = React.lazy(() => import('./pages/Success'));
const Cancel = React.lazy(() => import('./pages/Cancel'));
const AIAssistant = React.lazy(() => import('./pages/AIAssistant'));
const OCRScanner = React.lazy(() => import('./pages/OCRScanner'));
const MediaConverter = React.lazy(() => import('./pages/MediaConverter'));
const BatchProcessing = React.lazy(() => import('./pages/BatchProcessing'));
const WebCapture = React.lazy(() => import('./pages/WebCapture'));
const TextToSpeech = React.lazy(() => import('./pages/TextToSpeech'));


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center dark:bg-slate-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
      />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const LoadingScreen = () => (
  <div className="flex h-[80vh] items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
    />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
          <Route path="/pdf" element={<PageWrapper><PDFToolkit /></PageWrapper>} />
          <Route path="/images" element={<PageWrapper><ImageTools /></PageWrapper>} />
          <Route path="/media" element={<PageWrapper><MediaConverter /></PageWrapper>} />
          <Route path="/batch" element={<PageWrapper><BatchProcessing /></PageWrapper>} />
          <Route path="/ocr" element={<PageWrapper><OCRScanner /></PageWrapper>} />
          <Route path="/ai-assistant" element={<PageWrapper><AIAssistant /></PageWrapper>} />
          <Route path="/web-capture" element={<PageWrapper><WebCapture /></PageWrapper>} />
          <Route path="/tts" element={<PageWrapper><TextToSpeech /></PageWrapper>} />
          <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
          <Route path="/success" element={<PageWrapper><Success /></PageWrapper>} />
          <Route path="/cancel" element={<PageWrapper><Cancel /></PageWrapper>} />
          <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageWrapper><Dashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 1.02, y: -10 }}
    transition={{
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <Router>
              <Toaster position="top-center" reverseOrder={false} />
              <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors relative bg-dots flex flex-col">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                
                <div className="relative z-10 flex flex-col flex-1">
                  <Navbar />
                  <main className="container mx-auto flex-1">
                    <AnimatedRoutes />
                  </main>
                  <Footer />
                </div>
              </div>
              </Router>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
