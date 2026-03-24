/**
 * Auto-generates public/manifest.json by scanning dataset folders
 * inside public/ for CSV files.
 *
 * Dataset folders:
 *   public/product-knowledge/
 *   public/specimen-definition/
 *   public/observation-definition/
 *   public/activity-definition/
 *
 * Usage:
 *   node scripts/generate-master-manifest.mjs
 *
 * This script is also invoked automatically by the Vite plugin during dev & build.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "public");

const DATASET_FOLDERS = [
  "product-knowledge",
  "specimen-definition",
  "observation-definition",
  "activity-definition",
];

function generateManifest() {
  const manifest = {
    basePath: "/",
  };

  for (const folder of DATASET_FOLDERS) {
    const folderPath = path.join(publicDir, folder);

    if (!fs.existsSync(folderPath)) {
      manifest[folder] = [];
      continue;
    }

    const csvFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".csv"))
      .sort();

    manifest[folder] = csvFiles.map((file) => `${folder}/${file}`);
  }

  const outputPath = path.join(publicDir, "manifest.json");
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`[generate-master-manifest] Written ${outputPath}`);
  for (const folder of DATASET_FOLDERS) {
    const files = manifest[folder];
    console.log(`  ${folder}: ${files.length} file(s)`);
  }

  return manifest;
}

// Run directly
generateManifest();

export { generateManifest };
