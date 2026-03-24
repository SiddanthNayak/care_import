import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";

/**
 * Vite plugin that auto-generates public/manifest.json
 * by scanning the dataset folders for CSV files.
 */
function masterDataManifestPlugin() {
  const DATASET_FOLDERS = [
    "product-knowledge",
    "specimen-definition",
    "observation-definition",
    "activity-definition",
  ];

  function generate(publicDir) {
    const manifest = { basePath: "/" };

    for (const folder of DATASET_FOLDERS) {
      const folderPath = path.join(publicDir, folder);
      if (!fs.existsSync(folderPath)) {
        manifest[folder] = [];
        continue;
      }
      manifest[folder] = fs
        .readdirSync(folderPath)
        .filter((f) => f.endsWith(".csv"))
        .sort()
        .map((f) => `${folder}/${f}`);
    }

    fs.writeFileSync(
      path.join(publicDir, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
  }

  return {
    name: "master-data-manifest",
    buildStart() {
      generate(path.resolve(__dirname, "public"));
    },
    configureServer(server) {
      const publicDir = path.resolve(__dirname, "public");
      // Re-generate manifest when CSV files change during dev
      for (const folder of DATASET_FOLDERS) {
        const folderPath = path.join(publicDir, folder);
        if (fs.existsSync(folderPath)) {
          server.watcher.add(folderPath);
        }
      }
      server.watcher.on("all", (event, filePath) => {
        if (filePath.endsWith(".csv") && DATASET_FOLDERS.some((f) => filePath.includes(f))) {
          generate(publicDir);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    masterDataManifestPlugin(),
    federation({
      name: "care_import",
      filename: "remoteEntry.js",
      exposes: {
        "./manifest": "./src/manifest.ts",
      },
      shared: [
        "react",
        "react-dom",
        "react-i18next",
        "@tanstack/react-query",
        "raviger",
      ],
    }),
    tailwindcss(),
    react(),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      external: [],
      input: {
        main: "./src/index.ts",
      },
      output: {
        format: "esm",
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
      },
    },
  },
  preview: {
    port: 5273,
    allowedHosts: true,
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envPrefix: "REACT_",
});