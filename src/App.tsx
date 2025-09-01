import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToolsProvider } from './context/ToolsContext';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import UserProfilePage from './pages/UserProfilePage';

// Authentication Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';

// Tool Components
import VideoValidator from './components/tools/VideoValidator';
import DocxConcatenator from './components/tools/DocxConcatenator';
import AIGenerator from './components/tools/AIGenerator';
import BuyTickets from './components/tools/BuyTickets';

const AdminRoute: React.FC = () => {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  return isAuthenticated ? <AdminPage /> : <Navigate to="/admin-login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToolsProvider>
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/pricing" element={<BuyTickets />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                
                {/* User Profile Route */}
                <Route path="/profile" element={<UserProfilePage />} />
                
                {/* Tool Routes */}
                <Route path="/tools/validate-videos" element={<VideoValidator />} />
                <Route path="/tools/docx-concatenator" element={<DocxConcatenator />} />
                <Route path="/tools/:toolId" element={<AIGenerator />} />
                <Route path="/buy-tickets" element={<BuyTickets />} />
                
                {/* Admin Routes */}
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/JgMsAC" element={<AdminRoute />} />
                <Route path="/JgMsAC/" element={<AdminRoute />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToolsProvider>
    </AuthProvider>
  );
}

export default App;