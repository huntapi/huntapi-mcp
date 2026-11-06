// Copies the built server and its production dependencies into mcpb/server for `mcpb pack`.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("mcpb/server", { recursive: true, force: true });
mkdirSync("mcpb/server", { recursive: true });
cpSync("dist", "mcpb/server/dist", { recursive: true });
cpSync("package.json", "mcpb/server/package.json");
execFileSync(
  "npm",
  ["install", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund"],
  {
    cwd: "mcpb/server",
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);
