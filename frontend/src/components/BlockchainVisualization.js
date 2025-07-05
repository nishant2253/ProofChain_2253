import React, { useEffect, useRef } from "react";
import useTheme from "../hooks/useTheme";

const BlockchainVisualization = () => {
  const { isDarkMode } = useTheme();
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const updateVisualForTheme = () => {
      const svg = svgRef.current;
      
      // Get all theme-dependent elements
      const bgGlowDark = svg.querySelector('.bg-glow-dark');
      const bgGlowLight = svg.querySelector('.bg-glow-light');
      const cubeBlueDark = svg.querySelectorAll('.cube-blue-dark');
      const cubeBlueLight = svg.querySelectorAll('.cube-blue-light');
      const cubeCyanDark = svg.querySelectorAll('.cube-cyan-dark');
      const cubeCyanLight = svg.querySelectorAll('.cube-cyan-light');
      const cubeSideDark = svg.querySelectorAll('.cube-side-dark');
      const cubeSideLight = svg.querySelectorAll('.cube-side-light');

      if (isDarkMode) {
        // Show dark theme elements
        if (bgGlowDark) bgGlowDark.style.display = 'block';
        if (bgGlowLight) bgGlowLight.style.display = 'none';
        
        cubeBlueDark.forEach(el => el.style.display = 'block');
        cubeBlueLight.forEach(el => el.style.display = 'none');
        cubeCyanDark.forEach(el => el.style.display = 'block');
        cubeCyanLight.forEach(el => el.style.display = 'none');
        cubeSideDark.forEach(el => el.style.display = 'block');
        cubeSideLight.forEach(el => el.style.display = 'none');
      } else {
        // Show light theme elements
        if (bgGlowDark) bgGlowDark.style.display = 'none';
        if (bgGlowLight) bgGlowLight.style.display = 'block';
        
        cubeBlueDark.forEach(el => el.style.display = 'none');
        cubeBlueLight.forEach(el => el.style.display = 'block');
        cubeCyanDark.forEach(el => el.style.display = 'none');
        cubeCyanLight.forEach(el => el.style.display = 'block');
        cubeSideDark.forEach(el => el.style.display = 'none');
        cubeSideLight.forEach(el => el.style.display = 'block');
      }
    };

    updateVisualForTheme();
  }, [isDarkMode]);

  return (
    <div className="relative w-full max-w-[440px] aspect-square mx-auto select-none pointer-events-none glass blockchain-container">
      <svg
        ref={svgRef}
        id="blockchain-svg"
        viewBox="0 0 440 440"
        fill="none"
        className="w-full h-full"
        style={{ overflow: "visible" }}
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
        />
        <ellipse
          cx="220"
          cy="220"
          rx="190"
          ry="190"
          fill="url(#bgGlowLight)"
          className="bg-glow-light"
          style={{ display: "none" }}
        />
        
        {/* Blockchain cubes and edges */}
        <g
          id="edges"
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
        <g id="cubes">
          <g>
            <polygon
              points="220,85 300,140 220,195 140,140"
              fill="url(#cubeBlue)"
              className="cube-blue-dark"
            />
            <polygon
              points="220,85 300,140 220,195 140,140"
              fill="url(#cubeBlueLight)"
              className="cube-blue-light"
              style={{ display: "none" }}
            />
            <polygon
              points="220,255 300,320 220,375 140,320"
              fill="url(#cubeCyan)"
              className="cube-cyan-dark"
            />
            <polygon
              points="220,255 300,320 220,375 140,320"
              fill="url(#cubeCyanLight)"
              className="cube-cyan-light"
              style={{ display: "none" }}
            />
            <polygon
              points="140,140 220,195 220,255 140,320"
              fill="#232459"
              opacity="0.94"
              className="cube-side-dark"
            />
            <polygon
              points="140,140 220,195 220,255 140,320"
              fill="#f7f9fc"
              opacity="0.96"
              className="cube-side-light"
              style={{ display: "none" }}
            />
            <polygon
              points="300,140 220,195 220,255 300,320"
              fill="#232459"
              opacity="0.96"
              className="cube-side-dark"
            />
            <polygon
              points="300,140 220,195 220,255 300,320"
              fill="#f7f9fc"
              opacity="0.97"
              className="cube-side-light"
              style={{ display: "none" }}
            />
          </g>
          {/* Small cubes (nodes) at corners */}
          <g>
            <rect
              x="214"
              y="79"
              width="12"
              height="12"
              rx="3"
              fill="var(--accent-blue)"
              opacity="0.98"
            />
            <rect
              x="294"
              y="134"
              width="12"
              height="12"
              rx="3"
              fill="var(--accent-purple)"
              opacity="0.95"
            />
            <rect
              x="214"
              y="369"
              width="12"
              height="12"
              rx="3"
              fill="var(--accent-cyan)"
              opacity="0.95"
            />
            <rect
              x="134"
              y="314"
              width="12"
              height="12"
              rx="3"
              fill="var(--accent-purple)"
              opacity="0.96"
            />
            <rect
              x="134"
              y="134"
              width="12"
              height="12"
              rx="3"
              fill="var(--accent-blue)"
              opacity="0.97"
            />
            <rect
              x="294"
              y="314"
              width="12"
              height="12"
              rx="3"
              fill="var(--accent-blue)"
              opacity="0.97"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BlockchainVisualization;