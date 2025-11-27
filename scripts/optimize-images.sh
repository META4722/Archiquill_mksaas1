#!/bin/bash

# Image Optimization Script for ArchiQuill
# This script compresses large images in the public directory

set -e

echo "🖼️  Starting image optimization..."

# Directory containing images
IMAGE_DIR="/Users/sarah/Cursor code/Rendaily_Mksaas1/public/images/archi"

# Create backup directory
BACKUP_DIR="$IMAGE_DIR/originals_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up original images to: $BACKUP_DIR"

# Function to optimize PNG images
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")

    echo "  Optimizing PNG: $filename"

    # Backup original
    cp "$file" "$BACKUP_DIR/"

    # Convert to WebP (much smaller)
    local webp_file="${file%.png}.webp"
    sips -s format webp "$file" --out "$webp_file" --resampleHeightWidthMax 1920 2>/dev/null || true

    # Also create optimized PNG version
    sips -s format png "$file" --out "${file}.tmp" --resampleHeightWidthMax 1920 2>/dev/null
    mv "${file}.tmp" "$file"

    echo "  ✅ Created WebP version: ${filename%.png}.webp"
}

# Function to optimize JPEG/JPG images
optimize_jpeg() {
    local file="$1"
    local filename=$(basename "$file")

    echo "  Optimizing JPEG: $filename"

    # Backup original
    cp "$file" "$BACKUP_DIR/"

    # Convert to WebP
    local ext="${file##*.}"
    local webp_file="${file%.$ext}.webp"
    sips -s format webp "$file" --out "$webp_file" --resampleHeightWidthMax 1920 2>/dev/null || true

    # Optimize JPEG with lower quality
    sips -s format jpeg "$file" --out "${file}.tmp" --resampleHeightWidthMax 1920 --setProperty formatOptions 85 2>/dev/null
    mv "${file}.tmp" "$file"

    echo "  ✅ Created WebP version and optimized JPEG"
}

# Process specific large images
cd "$IMAGE_DIR"

# Optimize the largest PNG files
for file in "Archi_Render_Flux_Max.png" "Archi_Sketch_Flux_Pro.png"; do
    if [ -f "$file" ]; then
        optimize_png "$file"
    fi
done

# Optimize large JPEG/JPG files
for file in "design-freedom-sketch.jpg" "quick-idea-sketch.jpeg" "sketch-styles.jpeg"; do
    if [ -f "$file" ]; then
        optimize_jpeg "$file"
    fi
done

echo ""
echo "✅ Image optimization complete!"
echo "📊 Checking file sizes..."
echo ""

# Show size comparison
for file in "$BACKUP_DIR"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        original_size=$(du -h "$file" | cut -f1)

        if [ -f "$IMAGE_DIR/$filename" ]; then
            new_size=$(du -h "$IMAGE_DIR/$filename" | cut -f1)
            echo "  $filename: $original_size → $new_size"
        fi
    fi
done

echo ""
echo "🎉 Done! WebP versions created alongside originals."
echo "💡 Tip: Use Next.js Image component to automatically serve WebP to supported browsers."
