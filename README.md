# God's Eye Scouts

A community scout reporting layer built on top of [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view) by Bilawal Sidhu / Halfpixel.

God's Eye shows you what's happening on Earth right now. Scouts adds a place to write it down, keep it, and find it again - numbered pins on the globe with observations, evidence, and threads attached to real coordinates.

Not a fork. A feature layer: `src/scouts/` plus five imports into `main.js`.

## What it adds

- **Numbered markers on the globe** at every scout post coordinate
- **Scout Places drawer** - sorted list with place name, report count, recency, and nearby report count
- **Bidirectional click** - click a list item to fly there, click a marker to open that report
- **Spatial threads** - observations, evidence, hypotheses, disputes attached to any coordinate
- **Evidence cards** - SHA-256 hashed, timestamped, source-labeled
- **AI analyst tab** - BYOK (Ollama, OpenAI, Gemini, Claude, DeepSeek, any OpenAI-compatible endpoint)
- **Reverse geocoding** - automatic place names via Nominatim (free, no key)
- **Help panel** - in-app ? explaining what Scout Places are

## Install

    git clone https://github.com/vanshannonideamine/gods-eye-scouts.git
    cd gods-eye-scouts
    npm install
    npm run dev

Open http://localhost:4173

## Drop the layer into your own God's Eye clone

Copy `src/scouts/` into your install, then add these lines to the very top of `src/main.js`:

    import './scouts/panel.js';
    import './scouts/viewPatch.js';
    import './scouts/markers.js';
    import './scouts/places.js';
    import './scouts/buttons.js';

**Critical:** ES module imports must come before any other statement. Any code above them will silently break the module.

## Files

    src/scouts/
      panel.js       Thread / Evidence / AI panel
      viewPatch.js   USE VIEW captures current camera position
      markers.js     Numbered pins on the Cesium globe
      places.js      Scout Places drawer with reverse-geocoded names
      buttons.js     Two labeled buttons matching God's Eye theme
      names.js       Nominatim reverse geocoding + caching
      hook.js        Legacy Cesium viewer capture (kept for compatibility)

## Storage

Everything is in the browser's localStorage under `ges.scouts.v1`. Nothing leaves your machine. Multi-user sync via Supabase is planned but not implemented.

## Credit

God's Eye View by Bilawal Sidhu / Halfpixel is the entire visual and architectural foundation. This project does not exist without it. All original code, design, and data providers belong to that project and its contributors.

## License

MIT - same as God's Eye View.