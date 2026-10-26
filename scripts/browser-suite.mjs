import { spawn } from "node:child_process";
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  stdio: ["ignore", "pipe", "inherit"],
});
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Preview did not start")),
      10000,
    );
    server.stdout.once("data", () => {
      clearTimeout(timer);
      resolve();
    });
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error("Preview exited: " + code));
    });
  });
  for (const script of [
    "scripts/browser-check.mjs",
    "scripts/interaction-check.mjs",
  ])
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [script], { stdio: "inherit" });
      child.once("error", reject);
      child.once("exit", (code) =>
        code === 0 ? resolve() : reject(Error(script + " failed")),
      );
    });
} finally {
  server.kill();
}
