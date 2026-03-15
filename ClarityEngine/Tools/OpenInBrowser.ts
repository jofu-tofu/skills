#!/usr/bin/env bun
/**
 * Opens a file in the user's default browser.
 * Cross-platform: Windows → start, WSL → Windows browser, macOS → open, Linux → xdg-open.
 *
 * Usage: bun open-in-browser.ts <file-path>
 */

import { existsSync } from "fs";
import { resolve } from "path";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: bun open-in-browser.ts <file-path>");
  process.exit(1);
}

const resolved = resolve(filePath);

if (!existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

function isWSL(): boolean {
  try {
    const release = require("fs").readFileSync("/proc/version", "utf8");
    return /microsoft|wsl/i.test(release);
  } catch {
    return false;
  }
}

async function openInBrowser(path: string): Promise<void> {
  let cmd: string;
  let args: string[];

  if (process.platform === "win32") {
    // Native Windows: use cmd.exe start (opens default browser)
    cmd = "cmd.exe";
    args = ["/c", "start", "", path];
  } else if (isWSL()) {
    // WSL: convert to Windows path, then use cmd.exe start
    const proc = Bun.spawnSync(["wslpath", "-w", path]);
    const winPath = proc.stdout.toString().trim();
    cmd = "cmd.exe";
    args = ["/c", "start", "", winPath || path];
  } else if (process.platform === "darwin") {
    cmd = "open";
    args = [path];
  } else {
    // Linux native
    cmd = "xdg-open";
    args = [path];
  }

  const result = Bun.spawnSync([cmd, ...args], {
    stdout: "ignore",
    stderr: "pipe",
  });

  if (result.exitCode !== 0) {
    const stderr = result.stderr.toString().trim();
    if (stderr) {
      console.error(`Warning: ${stderr}`);
    }
  }

  console.log(`Opened in browser: ${path}`);
}

await openInBrowser(resolved);
