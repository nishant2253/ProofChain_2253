import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useWallet from "../../hooks/useWallet";
import useTheme from "../../hooks/useTheme";
import WalletConnect from "../WalletConnect";
import ThemeToggle from "../ThemeToggle";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected } = useWallet();
  const { isDarkMode } = useTheme();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard", requiresAuth: true },
    { name: "Submit Content", href: "/submit", requiresAuth: true },
    { name: "Profile", href: "/profile", requiresAuth: true },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.requiresAuth || isConnected
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header 
        className="header sticky top-0 z-50"
        style={{
          background: 'var(--header-bg)',
          boxShadow: isDarkMode ? '0 2px 16px 0 #1e224010' : '0 1px 0 var(--divider)',
          backdropFilter: 'blur(14px)'
        }}
      >
        <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between header-nav">
          {/* Logo */}
          <Link to="/" className="flex items-center fade-in" style={{ animationDelay: '0.1s' }}>
            <div 
              className="logo-bg w-10 h-10 rounded-xl flex items-center justify-center mr-3"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(120deg, #5be2ff33, #b388fc33)'
                  : 'linear-gradient(120deg, #e3f2fd33, #bbdefb22)'
              }}
            >
              <span 
                className="text-xl font-bold"
                style={{ 
                  color: 'var(--accent-blue)',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}
              >
                PC
              </span>
            </div>
            <span 
              className="text-2xl font-light"
              style={{
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                fontWeight: '300'
              }}
            >
              ProofChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center nav-items gap-8 text-base font-thin fade-in" style={{ animationDelay: '0.18s', fontWeight: '300' }}>
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="nav-link"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md"
              style={{ color: 'var(--text-main)' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>
        <div className="divider"></div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
              style={{ background: 'var(--header-bg)' }}
            >
              <div className="px-6 py-4 space-y-2">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="nav-link block"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer 
        className="w-full max-w-7xl mx-auto px-6 py-8"
        style={{ borderTop: '1px solid var(--divider)' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <a href="#" className="footer-link" style={{ color: 'var(--text-sub)' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="#" className="footer-link" style={{ color: 'var(--text-sub)' }}>Documentation</a>
            <a href="#" className="footer-link" style={{ color: 'var(--text-sub)' }}>Privacy Policy</a>
          </div>
          <span className="text-xs font-thin" style={{ color: 'var(--text-sub)' }}>
            &copy; 2025 ProofChain. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;