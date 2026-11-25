import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/landing/LandingPage';
import ChatDashboard from './components/chat/ChatDashboard';
import ParticleBackground from './components/ui/ParticleBackground';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatDashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-gotham-black overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10">
          <AnimatedRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}
