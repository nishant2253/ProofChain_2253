import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useWallet from "../hooks/useWallet";
import BlockchainVisualization from "../components/BlockchainVisualization";

const HomePage = () => {
  const { isConnected } = useWallet();

  // Add animation delays on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-in, .fade-in-blur, .slide-in-x').forEach((el, i) => {
        el.style.animationDelay = (0.07 * i + 0.11) + 's';
        el.classList.add('!opacity-100');
      });
    }, 60);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "Immutable Records",
      description: "Content verification stored permanently on blockchain",
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <circle cx="12" cy="16" r="1"></circle>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    {
      title: "Community Consensus",
      description: "Multi-token voting system for democratic verification",
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4"></path>
          <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h9l4 4 4-4z"></path>
        </svg>
      )
    },
    {
      title: "Transparent Process",
      description: "Open verification process with full audit trail",
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="w-full max-w-7xl mx-auto px-6 pt-14 pb-10 flex hero-section items-center gap-10 sm:gap-16 z-10"
        style={{ minHeight: '66vh' }}
      >
        {/* Left: Text */}
        <div
          className="flex-1 hero-left flex flex-col items-start justify-center fade-in-blur"
          style={{ animationDelay: '0.2s', minWidth: 0 }}
        >
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-thin tracking-tight mb-5"
            style={{
              color: 'var(--text-main)',
              fontWeight: '300',
              letterSpacing: '-0.045em',
              lineHeight: '1.14'
            }}
          >
            Decentralized<br />
            <span
              style={{
                color: 'var(--accent-blue)',
                fontWeight: '300',
                letterSpacing: '-0.045em'
              }}
            >
              Content Verification
            </span>
          </h1>
          <p
            className="text-lg md:text-xl font-thin mb-9"
            style={{ 
              fontWeight: '300', 
              maxWidth: '520px', 
              color: 'var(--text-sub)' 
            }}
          >
            Ensure authenticity, prevent fraud, and build trust through
            blockchain-powered content verification.
          </p>
          <div className="flex gap-4 flex-wrap">
            {isConnected ? (
              <>
                <Link to="/submit">
                  <motion.button 
                    className="btn-primary fade-in" 
                    style={{ animationDelay: '0.36s' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Content
                  </motion.button>
                </Link>
                <Link to="/dashboard">
                  <motion.button 
                    className="btn-secondary fade-in" 
                    style={{ animationDelay: '0.43s' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Dashboard
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <motion.button 
                  className="btn-primary fade-in" 
                  style={{ animationDelay: '0.36s' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    document.querySelector('.wallet-connect-button')?.click();
                  }}
                >
                  Get Started
                </motion.button>
                <motion.button 
                  className="btn-secondary fade-in" 
                  style={{ animationDelay: '0.43s' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Right: Blockchain Visual */}
        <div
          className="flex-1 hero-right flex items-center justify-center fade-in-blur hide-scrollbar"
          style={{ animationDelay: '0.28s', minWidth: 0, width: '100%' }}
        >
          <BlockchainVisualization />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl sm:text-4xl font-light mb-6"
            style={{ 
              color: 'var(--text-main)', 
              fontWeight: '300',
              letterSpacing: '-0.02em'
            }}
          >
            Why Choose ProofChain?
          </h2>
          <p 
            className="text-lg font-light max-w-2xl mx-auto"
            style={{ 
              color: 'var(--text-sub)', 
              fontWeight: '300' 
            }}
          >
            Our decentralized platform ensures content authenticity through advanced blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass p-8 text-center fade-in"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-4 flex justify-center">{feature.iconSvg}</div>
              <h3 
                className="text-xl font-medium mb-4"
                style={{ color: 'var(--text-main)', fontWeight: '400' }}
              >
                {feature.title}
              </h3>
              <p 
                className="font-light"
                style={{ color: 'var(--text-sub)', fontWeight: '300' }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isConnected && (
        <section className="w-full max-w-7xl mx-auto px-6 py-16">
          <div className="glass p-12 text-center">
            <h2 
              className="text-3xl font-light mb-6"
              style={{ 
                color: 'var(--text-main)', 
                fontWeight: '300',
                letterSpacing: '-0.02em'
              }}
            >
              Ready to Get Started?
            </h2>
            <p 
              className="text-lg font-light mb-8 max-w-xl mx-auto"
              style={{ 
                color: 'var(--text-sub)', 
                fontWeight: '300' 
              }}
            >
              Connect your wallet and start verifying content on the blockchain today
            </p>
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                document.querySelector('.wallet-connect-button')?.click();
              }}
            >
              Connect Wallet
            </motion.button>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;