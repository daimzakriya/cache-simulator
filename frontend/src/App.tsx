import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { SimProvider } from './store/useSimStore';
import { Menu } from 'lucide-react';

// We will lazy load or just import pages.
import LandingPage from './pages/LandingPage';
import ConfigurationPage from './pages/ConfigurationPage';
import TraceInputPage from './pages/TraceInputPage';
import SimulationDashboard from './pages/SimulationDashboard';
import ComparisonPage from './pages/ComparisonPage';
import ExportPage from './pages/ExportPage';
import AboutPage from './pages/AboutPage';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 overflow-y-auto relative bg-mesh">
        {/* Mobile Header Toggle */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-20 flex items-center px-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-textSecondary hover:text-white"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-2 font-black text-white text-sm tracking-tight">CacheSim</h1>
        </div>

        <div className="max-w-[1200px] mx-auto min-h-full md:pt-0 pt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SimProvider>
      <BrowserRouter>
        <Routes>
          {/* Unconstrained full-screen Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Main Dashboard Layout */}
          <Route element={<MainLayout />}>
            <Route path="/configure" element={<ConfigurationPage />} />
            <Route path="/trace" element={<TraceInputPage />} />
            <Route path="/simulate" element={<SimulationDashboard />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimProvider>
  );
}
