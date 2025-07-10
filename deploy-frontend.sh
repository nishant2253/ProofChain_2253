#!/bin/bash

# ProofChain Frontend Deployment Script for Vercel

echo "🚀 Starting ProofChain Frontend Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building the project..."
npm run build

echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo "📝 Don't forget to set environment variables in Vercel dashboard"