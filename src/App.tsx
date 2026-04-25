import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Watch from './pages/Watch';
import Upload from './pages/Upload';
import MPPDashboard from './pages/MPPDashboard';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import WatchLater from './pages/WatchLater';
import LikedVideos from './pages/LikedVideos';
import Admin from './pages/Admin';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <div className="animate-pulse font-sans text-2xl tracking-widest uppercase">MoonTube</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen flex-col bg-[#050505] text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/mpp" element={<MPPDashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/watch-later" element={<WatchLater />} />
            <Route path="/liked" element={<LikedVideos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
