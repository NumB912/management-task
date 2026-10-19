import { FileConfig } from "../config/file.config";

export  function resolveSrc(value?: string | null) {
  if (!value) return undefined;
  if (/^(blob:|data:?:\/\/)/.test(value)) return value;
  return `${FileConfig.FILE_URL}/${value}`;
  }

