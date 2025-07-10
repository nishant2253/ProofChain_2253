# 🚀 Quick Deploy Guide for ProofChain

## One-Command Deployment

### Prerequisites (5 minutes)
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Have your environment variables ready

### Deploy Backend (2 minutes)
```bash
cd backend
vercel --prod
```

### Deploy Frontend (2 minutes)
```bash
cd frontend
vercel --prod
```

## 📋 Environment Variables Checklist

### Backend (Set in Vercel Dashboard)
```
✅ NODE_ENV=production
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=your-secret-key
✅ PINATA_API_KEY=your-key
✅ PINATA_SECRET_KEY=your-secret
✅ CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Set in Vercel Dashboard)
```
✅ REACT_APP_API_URL=https://your-backend.vercel.app
✅ REACT_APP_PINATA_API_KEY=your-key
✅ REACT_APP_PINATA_SECRET_KEY=your-secret
✅ REACT_APP_ENVIRONMENT=production
```

## 🔗 Quick Links After Deployment

1. **Set Environment Variables:**
   - Backend: `https://vercel.com/your-username/proofchain-backend/settings/environment-variables`
   - Frontend: `https://vercel.com/your-username/proofchain-frontend/settings/environment-variables`

2. **Monitor Deployments:**
   - Backend: `https://vercel.com/your-username/proofchain-backend`
   - Frontend: `https://vercel.com/your-username/proofchain-frontend`

## ⚡ Super Quick Setup Commands

```bash
# Clone and setup
git clone your-repo
cd proofchain

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend && vercel --prod

# Deploy frontend  
cd ../frontend && vercel --prod

# Done! 🎉
```

## 🆘 If Something Goes Wrong

1. **Build fails:** Check Node.js version (use v16+)
2. **API not working:** Verify environment variables in Vercel dashboard
3. **CORS errors:** Update CORS_ORIGIN in backend settings
4. **Database issues:** Check MongoDB URI and network access

## 📞 Need Help?

- Check the full `DEPLOYMENT_GUIDE.md` for detailed instructions
- Vercel docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/