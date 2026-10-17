# LabLens: AR Lab Guide (clean version)

Plain HTML + one Netlify function. No build step, no node_modules, no Vite.

Folder layout (keep it exactly):
  netlify.toml
  netlify/functions/recognize.js
  public/index.html

Netlify settings: build command EMPTY, publish directory `public`, functions directory `netlify/functions`.
Environment variable: ROBOFLOW_API_KEY = your Roboflow Private API key.
