import { execSync, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, "..");
const targetPort = 3000;

function getListeningPidsOnPort(port) {
  try {
    if (process.platform === "win32") {
      const output = execSync("netstat -ano -p tcp", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      });

      const pids = new Set();
      for (const line of output.split(/\r?\n/)) {
        if (!line.includes(`:${port}`) || !line.includes("LISTENING")) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (/^\d+$/.test(pid)) pids.add(Number(pid));
      }
      return [...pids];
    }

    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return output
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
  } catch {
    return [];
  }
}

function killProcessTree(pid) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
      return;
    }
    process.kill(pid, "SIGTERM");
  } catch {
    // Ignore kill failures; best effort.
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeNextDirWithRetry() {
  const nextDir = resolve(webRoot, ".next");
  let lastError = null;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      rmSync(nextDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 120
      });
      return;
    } catch (error) {
      lastError = error;
      sleep(220);
    }
  }
  if (lastError) throw lastError;
}

const pids = getListeningPidsOnPort(targetPort);
for (const pid of pids) {
  killProcessTree(pid);
}

removeNextDirWithRetry();

const child = spawn("next", ["dev", "-p", String(targetPort)], {
  cwd: webRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
