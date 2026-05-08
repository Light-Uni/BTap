import { spawn } from "node:child_process";

const port = process.env.PORT || "4173";
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["vite", "preview", "--host", "0.0.0.0", "--port", port];

const child = spawn(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
