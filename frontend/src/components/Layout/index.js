import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import ThemeToggle from "../ThemeToggle";
import WalletConnect from "../WalletConnect";

const Layout = ({ children }) => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/submit", label: "Submit Content" },
    { path: "/profile", label: "Profile" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="header sticky top-0 w-full z-40">
        <nav className="max-w-7xl mx-auto flex items-center header-nav justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3 slide-in-x">
            <span
              className="flex items-center justify-center rounded-2xl shadow-xl logo-bg"
              style={{ 
                padding: "0.62rem 1.08rem",
                background: isDarkMode 
                  ? "linear-gradient(120deg, #5be2ff33, #b388fc33)" 
                  : "linear-gradient(120deg, #e3f2fd33, #bbdefb22)"
              }}
            >
              <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="22"
                  height="22"
                  rx="5.5"
                  stroke="var(--accent-blue)"
                  strokeWidth="2.3"
                />
                <path
                  d="M9 20L20 9"
                  stroke="var(--accent-purple)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="14" r="2.7" fill="var(--accent-blue)" />
              </svg>
            </span>
            <span
              className="text-3xl sm:text-4xl font-thin tracking-tight"
              style={{
                color: "var(--accent-blue)",
                letterSpacing: "-0.03em",
                fontWeight: 300,
              }}
            >
              ProofChain
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center nav-items gap-8 text-base font-thin fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <WalletConnect />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: "var(--text-main)" }}
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
        </nav>
        
        <div className="divider"></div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
              style={{ background: "var(--header-bg)" }}
            >
              <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
                {/* Mobile Navigation */}
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <WalletConnect />
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--text-sub)" }}>
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto pt-14 pb-7 px-6 text-center fade-in">
        <div
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 divider pb-5"
          style={{ fontWeight: 300 }}
        >
          <div className="flex gap-5 mb-3 md:mb-0">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a href="/docs" className="footer-link">
              Documentation
            </a>
            <a href="/privacy" className="footer-link">
              Privacy Policy
            </a>
          </div>
          <span className="text-xs font-thin" style={{ color: "var(--text-sub)" }}>
            &copy; {new Date().getFullYear()} ProofChain. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
