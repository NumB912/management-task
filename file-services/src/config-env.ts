import { loadEnvFile } from "node:process";
const selected = process.env.APP_ENV || process.env.NODE_ENV || "local";
export const appEnvironment = selected === "developer" ? "development" : selected;
if (!["local", "development", "production", "test"].includes(appEnvironment)) {
  throw new Error(`Unsupported APP_ENV/NODE_ENV: ${selected}`);
}
export const envFilePath = `.env.${appEnvironment}`;
process.env.APP_ENV = appEnvironment;
process.env.NODE_ENV = appEnvironment === "local" ? "development" : appEnvironment;

try {
  loadEnvFile(envFilePath);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
