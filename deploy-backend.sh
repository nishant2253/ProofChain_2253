#!/bin/bash

# ProofChain Backend Deployment Script for Vercel

echo "🚀 Starting ProofChain Backend Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to backend directory
cd backend

echo "📦 Installing dependencies..."
npm install

echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Backend deployment completed!"
echo "📝 Don't forget to set environment variables in Vercel dashboard"