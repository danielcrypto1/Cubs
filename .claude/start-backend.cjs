const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const cwd = path.resolve(__dirname, "..", "apps", "backend");

// Load .env file from backend directory
const envFile = path.resolve(cwd, ".env");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    let val = trimmed.slice(eqIdx + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

// Resolve tsx CLI from within backend's node_modules scope
let tsxBin;
try {
  // tsx exports don't expose cli directly, find it relative to the package
  const tsxMain = require.resolve("tsx", { paths: [cwd] });
  tsxBin = path.resolve(path.dirname(tsxMain), "cli.mjs");
  if (!fs.existsSync(tsxBin)) {
    throw new Error("cli.mjs not found");
  }
} catch {
  console.error("Cannot find tsx binary. Run pnpm install first.");
  process.exit(1);
}

const child = spawn(process.execPath, [tsxBin, "watch", "src/index.ts"], {
  cwd,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code) => process.exit(code || 0));
