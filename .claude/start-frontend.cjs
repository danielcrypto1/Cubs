const { spawn } = require("child_process");
const path = require("path");

const cwd = path.resolve(__dirname, "..", "apps", "frontend");

// Resolve next binary from within frontend's node_modules scope
let nextBin;
try {
  nextBin = require.resolve("next/dist/bin/next", { paths: [cwd] });
} catch {
  console.error("Cannot find next binary. Run pnpm install first.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev", "--turbopack", "--port", process.env.PORT || "3000"], {
  cwd,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code) => process.exit(code || 0));
