import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PDFToolkit from './pages/PDFToolkit';
import ImageTools from './pages/ImageTools';
import Pricing from './pages/Pricing';
import UpgradeSuccess from './pages/UpgradeSuccess';



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

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/pdf" element={<PageWrapper><PDFToolkit /></PageWrapper>} />
        <Route path="/images" element={<PageWrapper><ImageTools /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><Pricing /></PageWrapper>} />
        <Route path="/upgrade-success" element={<PageWrapper><UpgradeSuccess /></PageWrapper>} />


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Navbar />
            <main className="container mx-auto">
              <AnimatedRoutes />
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
