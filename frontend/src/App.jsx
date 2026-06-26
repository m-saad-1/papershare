import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SearchPapers from './pages/papers/SearchPapers';
import PaperDetails from './pages/papers/PaperDetails';
import UploadPaper from './pages/papers/UploadPaper';
import RequestPaper from './pages/papers/RequestPaper';
import Universities from './pages/universities/Universities';
import UniversityCommunity from './pages/universities/UniversityCommunity';
import AcademicIntegrity from './pages/AcademicIntegrity';
import UserDashboard from './pages/user/Dashboard';
import EditPaper from './pages/user/EditPaper';
import AdminPanel from './pages/admin/AdminPanel';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ScrollToTop from './components/layout/ScrollToTop';
import Chat from './pages/user/Chat';
import UserProfilePage from './pages/user/UserProfile';
import Leaderboard from './pages/user/Leaderboard';
import ContactUs from './pages/ContactUs';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import HelpCenter from './pages/HelpCenter';
import StudyHub from './pages/study/StudyHub';
import NoteDetails from './pages/study/NoteDetails';



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const hideFooterOn = ['/messages', '/messages/'];
  const shouldHideFooter = hideFooterOn.some(path => location.pathname.startsWith(path));
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      {/* Define navbar height as a CSS variable for child components to use */}
      <main className="flex-grow flex flex-col pt-16 pb-16 md:pb-0" style={{ '--navbar-height': '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/papers" element={<SearchPapers />} />
          <Route path="/academic-integrity" element={<AcademicIntegrity />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/universities/:universityName" element={<UniversityCommunity />} />
          <Route path="/papers/:id" element={<PaperDetails />} />
          <Route path="/requests" element={<RequestPaper />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/notes" element={<StudyHub />} />
          <Route path="/notes/:id" element={<NoteDetails />} />
          <Route path="/study" element={<StudyHub />} />


          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadPaper />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-paper/:paperId" 
            element={
              <ProtectedRoute>
                <EditPaper />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/moderation" 
            element={
              <AdminRoute>
                <Navigate to="/admin" replace />
              </AdminRoute>
            } 
          />
          <Route 
            path="/messages/:recipientId?" 
            element={
              <ProtectedRoute>
                <Chat /> 
              </ProtectedRoute>
            } 
          />
          {/* Add other routes for your application here */}
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
      <Toaster 
        position="top-right"
        containerStyle={{
          top: 80,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;