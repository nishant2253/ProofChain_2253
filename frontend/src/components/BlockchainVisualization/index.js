import React from "react";
import useTheme from "../../hooks/useTheme";

const BlockchainVisualization = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className="relative w-full max-w-[440px] aspect-square mx-auto select-none pointer-events-none glass blockchain-container"
      style={{
        background: isDarkMode 
          ? '' 
          : 'linear-gradient(120deg, #e3f2fd 0%, #ffffff 100%)',
        border: isDarkMode ? '' : '1.5px solid #bbdefb',
        boxShadow: isDarkMode ? '' : '0 8px 40px #29b6f61a'
      }}
    >
      <svg
        viewBox="0 0 440 440"
        fill="none"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Glowing background gradient */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop
              offset="0%"
              stopColor="var(--accent-blue)"
              stopOpacity="0.33"
            />
            <stop
              offset="65%"
              stopColor="var(--text-main)"
              stopOpacity="0"
            />
          </radialGradient>
          <radialGradient id="bgGlowLight" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#e3f2fd" stopOpacity="0.82" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cubeBlue" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--accent-blue)" />
            <stop offset="1" stopColor="var(--accent-purple)" />
          </linearGradient>
          <linearGradient id="cubeCyan" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--accent-cyan)" />
            <stop offset="1" stopColor="var(--accent-blue)" />
          </linearGradient>
          <linearGradient id="cubeBlueLight" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#4fc3f7" />
            <stop offset="1" stopColor="#29b6f6" />
          </linearGradient>
          <linearGradient id="cubeCyanLight" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#e3f2fd" />
            <stop offset="1" stopColor="#4fc3f7" />
          </linearGradient>
        </defs>

        {/* Background Glow */}
        <ellipse
          cx="220"
          cy="220"
          rx="190"
          ry="190"
          fill="url(#bgGlow)"
          className="bg-glow-dark"
          style={{ display: isDarkMode ? 'block' : 'none' }}
        />
        <ellipse
          cx="220"
          cy="220"
          rx="190"
          ry="190"
          fill="url(#bgGlowLight)"
          className="bg-glow-light"
          style={{ display: isDarkMode ? 'none' : 'block' }}
        />

        {/* Blockchain cubes and edges */}
        <g
          stroke="var(--accent-blue)"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        >
          <line x1="140" y1="140" x2="220" y2="85" />
          <line x1="220" y1="85" x2="300" y2="140" />
          <line x1="300" y1="140" x2="220" y2="195" />
          <line x1="220" y1="195" x2="140" y2="140" />
          <line x1="140" y1="140" x2="220" y2="255" />
          <line x1="220" y1="255" x2="220" y2="195" />
          <line x1="220" y1="255" x2="300" y2="320" />
          <line x1="300" y1="320" x2="300" y2="140" />
          <line x1="220" y1="255" x2="140" y2="320" />
          <line x1="140" y1="320" x2="140" y2="140" />
          <line x1="300" y1="320" x2="220" y2="375" />
          <line x1="220" y1="375" x2="140" y2="320" />
        </g>

        {/* Cubes */}
        <g>
          {/* Top cube */}
          <polygon
            points="220,85 300,140 220,195 140,140"
            fill={isDarkMode ? "url(#cubeBlue)" : "url(#cubeBlueLight)"}
          />
          
          {/* Bottom cube */}
          <polygon
            points="220,255 300,320 220,375 140,320"
            fill={isDarkMode ? "url(#cubeCyan)" : "url(#cubeCyanLight)"}
          />
          
          {/* Left side */}
          <polygon
            points="140,140 220,195 220,255 140,320"
            fill={isDarkMode ? "#232459" : "#f3f0fa"}
            opacity="0.94"
          />
          
          {/* Right side */}
          <polygon
            points="300,140 220,195 220,255 300,320"
            fill={isDarkMode ? "#1a2a5e" : "#e8f4fd"}
            opacity="0.88"
          />
        </g>
      </svg>
    </div>
  );
};

export default BlockchainVisualization;