// Writes docs/openapi.json and openapi.yaml at root (FR-I9). Run: pnpm openapi
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config";

async function getYamlStringifier(): Promise<(obj: unknown) => string> {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (s: string) => Promise<any>;
  try {
    const mod = await dynamicImport("yaml");
    if (mod && typeof mod.stringify === "function") return mod.stringify;
    if (mod.default && typeof mod.default.stringify === "function") return mod.default.stringify;
  } catch {
    // search in pnpm store
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    path.resolve(here, "../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js"),
    path.resolve(here, "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const mod = await dynamicImport(pathToFileURL(p).href);
      const stringify = mod.stringify || (mod.default && mod.default.stringify);
      if (typeof stringify === "function") return stringify;
    }
  }

  throw new Error("Could not find a YAML stringifier");
}

const app = await createApp({ config: loadConfig({ STORE: "memory" }) });
const spec = app.locals.openapi;

// 1. Write docs/openapi.json
const jsonOut = fileURLToPath(new URL("../../docs/openapi.json", import.meta.url));
fs.writeFileSync(jsonOut, JSON.stringify(spec, null, 2) + "\n");
console.log(`Wrote ${jsonOut}`);

// 2. Write openapi.yaml at root (FR-I9)
const yamlStringify = await getYamlStringifier();
const yamlContent = yamlStringify(spec);
const yamlOut = fileURLToPath(new URL("../../openapi.yaml", import.meta.url));
fs.writeFileSync(yamlOut, yamlContent);
console.log(`Wrote ${yamlOut}`);

// Also write docs/openapi.yaml for convenience
const docsYamlOut = fileURLToPath(new URL("../../docs/openapi.yaml", import.meta.url));
fs.writeFileSync(docsYamlOut, yamlContent);
console.log(`Wrote ${docsYamlOut}`);

process.exit(0);
