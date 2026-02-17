#!/usr/bin/env node
/**
 * Download face-api.js models into public/models for browser emotion detection.
 * Run: node scripts/download-models.mjs
 */
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
const OUT = path.join(__dirname, "..", "public", "models");

const FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_expression_model-weights_manifest.json",
  "face_expression_model-shard1",
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`${url} => ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const file of FILES) {
    const url = `${BASE}/${file}`;
    process.stdout.write(`Downloading ${file}... `);
    try {
      const buf = await get(url);
      fs.writeFileSync(path.join(OUT, file), buf);
      console.log(`${(buf.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.error("Failed:", e.message);
      process.exit(1);
    }
  }
  console.log("Models saved to public/models");
}

main();
