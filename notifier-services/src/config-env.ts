import { loadEnvFile } from "node:process";

// APP_ENV selects configuration; NODE_ENV remains a standard Node runtime mode.
const selected = process.env.APP_ENV || process.env.NODE_ENV || "local";
export const appEnvironment = selected === "developer" ? "development" : selected;
if (!["local", "development", "production", "test"].includes(appEnvironment)) {
  throw new Error(`Unsupported APP_ENV/NODE_ENV: ${selected}`);
}
export const envFilePath = `.env.${appEnvironment}`;
process.env.APP_ENV = appEnvironment;
process.env.NODE_ENV = appEnvironment === "local" ? "development" : appEnvironment;

try {
  // Existing process/Docker variables take precedence over file values.
  loadEnvFile(envFilePath);
} catch (error) {
  // Containers may provide all configuration without a file.
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
