import { loadEnvFile } from 'node:process';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const [environment, command, ...args] = process.argv.slice(2);
if (!['local', 'development', 'production'].includes(environment)) {
  throw new Error(`Unsupported APP_ENV: ${environment}`);
}
process.env.APP_ENV = environment;
process.env.NODE_ENV = command === 'dev' ? 'development' : 'production';
try {
  loadEnvFile(`.env.${environment}`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const require = createRequire(import.meta.url);
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), command, ...args], {
  stdio: 'inherit',
  env: process.env,
});
child.on('error', (error) => { console.error(error); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
