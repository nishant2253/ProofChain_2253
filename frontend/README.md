# 🎨 ProofChain Frontend

> React.js application for decentralized content verification platform

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3+-06B6D4.svg)](https://tailwindcss.com/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-5.7+-purple.svg)](https://docs.ethers.io/)

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- MetaMask browser extension

### **Installation**
```bash
cd frontend
npm install
```

### **Environment Setup**
```bash
cp .env.example .env
```

**Required Environment Variables:**
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3000/api

# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_BLOCKCHAIN_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_MERKLE_PROOF=["0x..."]

# IPFS Configuration
REACT_APP_IPFS_GATEWAY=https://your-pinata-gateway.mypinata.cloud/ipfs/

# Development Configuration
REACT_APP_LOCALHOST_RPC_URL=http://127.0.0.1:8545
REACT_APP_ENABLE_TESTNET=true
```

### **Development Server**
```bash
npm start
# Runs on http://localhost:5003
```

### **Build for Production**
```bash
npm run build
```

## 🏗️ **Architecture**

### **Technology Stack**
- **React 18+** - Component framework
- **Tailwind CSS** - Utility-first styling
- **Ethers.js** - Ethereum interaction
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Chart.js** - Data visualization

### **Project Structure**
```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Layout/          # Main layout wrapper
│   │   ├── WalletConnect/   # MetaMask integration
│   │   ├── VotingInterface/ # Voting UI components
│   │   ├── ConsensusDashboard/ # Real-time dashboard
│   │   └── ThemeToggle/     # Dark/light mode
│   ├── pages/               # Route components
│   │   ├── HomePage.js      # Landing page
│   │   ├── ContentSubmitPage.js # Content upload
│   │   ├── ContentDetailPage.js # Content details
│   │   └── Profile/         # User profile
│   ├── context/             # React Context providers
│   │   ├── WalletContext.js # Wallet state management
│   │   └── ThemeContext.js  # Theme state management
│   ├── hooks/               # Custom React hooks
│   │   ├── useWallet.js     # Wallet operations
│   │   └── useTheme.js      # Theme operations
│   ├── utils/               # Utility functions
│   │   ├── api.js           # API client
│   │   ├── blockchain.js    # Blockchain utilities
│   │   └── helpers.js       # General helpers
│   ├── App.js               # Main app component
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
├── config-overrides.js      # Webpack overrides
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## 🔗 **Key Components**

### **WalletConnect Component**
```javascript
// Handles MetaMask connection and wallet state
import { useWallet } from '../hooks/useWallet';

const { isConnected, account, connect, disconnect } = useWallet();
```

### **VotingInterface Component**
```javascript
// Interactive voting with token staking
const handleVote = async (contentId, vote, tokenType, stakeAmount) => {
  // 1. MetaMask transaction for blockchain
  // 2. Backend API call for database
  // 3. UI state updates
};
```

### **ConsensusDashboard Component**
```javascript
// Real-time consensus data with auto-refresh
useEffect(() => {
  const interval = setInterval(fetchConsensusData, 30000);
  return () => clearInterval(interval);
}, []);
```

## 🎨 **Styling System**

### **Tailwind CSS Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#5BE2FF',
        secondary: '#B388FC',
        accent: '#FF6B9D'
      }
    }
  }
}
```

### **CSS Custom Properties**
```css
/* index.css - Theme variables */
:root {
  --bg-gradient: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%);
  --text-main: #FFFFFF;
  --text-sub: #B0B0B0;
  --accent-blue: #5BE2FF;
  --accent-purple: #B388FC;
  --card-bg: rgba(255, 255, 255, 0.05);
  --shadow: 0 8px 32px rgba(91, 226, 255, 0.1);
}
```

## 🔌 **API Integration**

### **API Client Setup**
```javascript
// utils/api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### **Key API Functions**
```javascript
// Content operations
export const submitContent = (contentData) => api.post('/content', contentData);
export const getContentList = (page, limit) => api.get('/content', { params: { page, limit } });
export const getContentById = (id) => api.get(`/content/${id}`);

// Voting operations
export const submitVote = (voteData) => api.post('/consensus/vote', voteData);
export const getConsensusStats = () => api.get('/consensus/stats');

// User operations
export const registerUser = (userData) => api.post('/users', userData);
export const getMyProfile = () => api.get('/users/me');
```

## ⚡ **State Management**

### **Wallet Context**
```javascript
// context/WalletContext.js
const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  
  const connect = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };
  
  return (
    <WalletContext.Provider value={{ account, isConnected, connect }}>
      {children}
    </WalletContext.Provider>
  );
};
```

### **Theme Context**
```javascript
// context/ThemeContext.js
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## 🔧 **Development Tools**

### **Available Scripts**
```bash
npm start          # Development server (port 5003)
npm run build      # Production build
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### **Webpack Configuration**
```javascript
// config-overrides.js - Polyfills for blockchain libraries
const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url')
  };
  
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  );
  
  return config;
};
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. MetaMask Connection Fails**
```bash
# Check if MetaMask is installed
if (!window.ethereum) {
  alert('Please install MetaMask');
}

# Check network configuration
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
```

#### **2. API Connection Errors**
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check CORS configuration
# Ensure backend allows frontend origin
```

#### **3. Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for polyfill issues
npm install --save-dev react-app-rewired
```

#### **4. Styling Issues**
```bash
# Rebuild Tailwind CSS
npm run build:css

# Check for conflicting CSS
# Inspect browser dev tools
```

### **Environment Debugging**
```bash
# Check environment variables
echo $REACT_APP_API_URL
echo $REACT_APP_CONTRACT_ADDRESS

# Verify .env file
cat .env | grep REACT_APP
```

## 📱 **Features**

### **Responsive Design**
- Mobile-first approach
- Breakpoint system: sm, md, lg, xl
- Touch-friendly interactions
- Progressive Web App (PWA) ready

### **Real-time Updates**
- Auto-refresh consensus data every 30 seconds
- WebSocket integration for live updates
- Optimistic UI updates for better UX

### **Accessibility**
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### **Performance Optimizations**
- Code splitting with React.lazy()
- Image optimization and lazy loading
- API response caching
- Bundle size optimization

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
# Creates optimized build in build/ directory
```

### **Environment Variables for Production**
```bash
REACT_APP_API_URL=https://api.proofchain.com
REACT_APP_CONTRACT_ADDRESS=0xProductionContractAddress
REACT_APP_BLOCKCHAIN_NETWORK=mainnet
REACT_APP_CHAIN_ID=1
```

### **Deployment Options**
- **Netlify**: Connect GitHub repo for auto-deployment
- **Vercel**: Zero-config deployment with Git integration
- **AWS S3 + CloudFront**: Static hosting with CDN
- **IPFS**: Decentralized hosting option

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow React best practices and ESLint rules
4. Test thoroughly on different browsers
5. Submit pull request with detailed description

## 📚 **Additional Resources**

- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [MetaMask Developer Docs](https://docs.metamask.io/)