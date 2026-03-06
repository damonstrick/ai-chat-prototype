# AI Chat Demo (Presentation)

## Background video

To use your screen recording as the slide background:

1. Copy your video file into this folder.
2. Name it **`background.mov`** (or **`background.mp4`** for better browser support).
3. If you only have a `.mov`, you can use it as-is; Safari supports it. For Chrome/Firefox, converting to MP4 is recommended (e.g. with QuickTime export or `ffmpeg -i background.mov -c:v libx264 background.mp4`).

The page will use the first available source: `background.mov` then `background.mp4`. The video plays muted, looped, behind the phone mockup.

## Map (prototype)

The Anthropic-flow map is a **static screenshot** (no API). It looks like Google Maps but is just an image with price bubbles overlaid. Add a screenshot of Google Maps centered on San Francisco as **`assets/sf-map.png`** (e.g. zoom level ~12, standard map view). If the file is missing, a gray placeholder is shown.

## Layout

- **Full page:** Video fills the viewport (slide look).
- **Phone mockup:** Centered, 956px tall, rounded frame. The chat area inside scrolls automatically as content is added.
