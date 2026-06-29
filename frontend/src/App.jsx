import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ScrollToTop from './components/layout/ScrollToTop';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const SearchPapers = lazy(() => import('./pages/papers/SearchPapers'));
const PaperDetails = lazy(() => import('./pages/papers/PaperDetails'));
const UploadPaper = lazy(() => import('./pages/papers/UploadPaper'));
const RequestPaper = lazy(() => import('./pages/papers/RequestPaper'));
const Universities = lazy(() => import('./pages/universities/Universities'));
const UniversityCommunity = lazy(() => import('./pages/universities/UniversityCommunity'));
const AcademicIntegrity = lazy(() => import('./pages/AcademicIntegrity'));
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const EditPaper = lazy(() => import('./pages/user/EditPaper'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const Chat = lazy(() => import('./pages/user/Chat'));
const UserProfilePage = lazy(() => import('./pages/user/UserProfile'));
const Leaderboard = lazy(() => import('./pages/user/Leaderboard'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const StudyHub = lazy(() => import('./pages/study/StudyHub'));
const NoteDetails = lazy(() => import('./pages/study/NoteDetails'));



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
        <Suspense fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
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
        </Suspense>
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