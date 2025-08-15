#!/bin/bash

# Netlify Build Script for 德润万联教育平台
# This script handles pnpm lockfile issues automatically

set -e

echo "🚀 Starting Netlify build for 德润万联教育平台..."

# Check if pnpm-lock.yaml exists and is up to date
echo "📦 Checking pnpm lockfile..."

# Try frozen lockfile first (recommended for production)
if pnpm install --frozen-lockfile; then
    echo "✅ Dependencies installed with frozen lockfile"
else
    echo "⚠️  Frozen lockfile failed, regenerating..."
    
    # If frozen lockfile fails, install without it and update the lockfile
    pnpm install --no-frozen-lockfile
    echo "✅ Dependencies installed with updated lockfile"
fi

# Build the project
echo "🔨 Building the project..."
pnpm build

echo "✅ Build completed successfully!"

# Show build output info
echo "📊 Build output:"
ls -la dist/

echo "🎉 德润万联教育平台 build ready for deployment!"