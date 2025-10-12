#!/bin/bash

# Download images from ori369.com
# Usage: bash download-images.sh

IMAGES_DIR="./public/images/therapies"
mkdir -p "$IMAGES_DIR"

echo "Downloading images from ori369.com..."

# List of pages to scrape
PAGES=(
  "https://ori369.com/"
  "https://ori369.com/elektrostimulacija/"
  "https://ori369.com/manualna-terapija/"
  "https://ori369.com/tecar-terapija/"
  "https://ori369.com/magnetna-terapija/"
  "https://ori369.com/mis/"
  "https://ori369.com/laserska-terapija/"
  "https://ori369.com/media-taping/"
  "https://ori369.com/cupping/"
  "https://ori369.com/dryneedeling-terapija/"
  "https://ori369.com/o-nas/"
  "https://ori369.com/kontakt/"
)

# Download images from each page
for PAGE in "${PAGES[@]}"; do
  echo "Scraping: $PAGE"
  curl -s "$PAGE" | grep -oP 'https://ori369\.com/wp-content/uploads/[^"]+\.(jpg|jpeg|png|gif|webp)' | sort -u | while read -r IMAGE_URL; do
    FILENAME=$(basename "$IMAGE_URL" | sed 's/\?.*$//')
    if [ ! -f "$IMAGES_DIR/$FILENAME" ]; then
      echo "  Downloading: $FILENAME"
      wget -q -O "$IMAGES_DIR/$FILENAME" "$IMAGE_URL"
    else
      echo "  Skipping (exists): $FILENAME"
    fi
  done
done

echo ""
echo "Download complete!"
echo "Images saved to: $IMAGES_DIR"
echo "Total images: $(ls -1 $IMAGES_DIR | wc -l)"
