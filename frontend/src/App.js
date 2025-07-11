import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ContentSubmitPage from "./pages/ContentSubmitPage";
import ConsensusDashboard from "./components/ConsensusDashboard";
import Profile from "./pages/Profile";
import useWallet from "./hooks/useWallet";

// Create a simple test component first to verify the theme system works
const TestHomePage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-gradient)',
      color: 'var(--text-main)',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '300',
          marginBottom: '1rem',
          color: 'var(--accent-blue)'
        }}>
          ProofChain
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          fontWeight: '300',
          color: 'var(--text-sub)',
          marginBottom: '2rem'
        }}>
          Decentralized Content Verification Platform
        </p>
        <div style={{
          background: 'var(--card-bg)',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow)',
          backdropFilter: 'blur(14px)'
        }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
            System Status
          </h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={{ padding: '1rem', background: 'rgba(91, 226, 255, 0.1)', borderRadius: '0.5rem' }}>
              <h3 style={{ color: 'var(--accent-blue)', margin: '0 0 0.5rem 0' }}>Frontend</h3>
              <p style={{ color: 'var(--text-sub)', margin: 0 }}>Running on Port 5003</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(91, 226, 255, 0.1)', borderRadius: '0.5rem' }}>
              <h3 style={{ color: 'var(--accent-blue)', margin: '0 0 0.5rem 0' }}>Backend</h3>
              <p style={{ color: 'var(--text-sub)', margin: 0 }}>API on Port 3000</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(91, 226, 255, 0.1)', borderRadius: '0.5rem' }}>
              <h3 style={{ color: 'var(--accent-blue)', margin: '0 0 0.5rem 0' }}>Blockchain</h3>
              <p style={{ color: 'var(--text-sub)', margin: 0 }}>Hardhat Local Network</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(91, 226, 255, 0.1)', borderRadius: '0.5rem' }}>
              <h3 style={{ color: 'var(--accent-blue)', margin: '0 0 0.5rem 0' }}>Contract</h3>
              <p style={{ color: 'var(--text-sub)', margin: 0, fontSize: '0.8rem' }}>0x5FbDB...80aa3</p>
            </div>
          </div>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(179, 136, 252, 0.1)', borderRadius: '0.5rem' }}>
            <h3 style={{ color: 'var(--accent-purple)', margin: '0 0 0.5rem 0' }}>Theme System</h3>
            <p style={{ color: 'var(--text-sub)', margin: 0 }}>CSS Custom Properties Working</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ConsensusDashboard />
              </ProtectedRoute>
            } />
            <Route path="/submit" element={
              <ProtectedRoute>
                <ContentSubmitPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile/:address" element={<Profile />} />
            <Route path="/test" element={<TestHomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;