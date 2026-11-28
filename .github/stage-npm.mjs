import { execFileSync } from 'node:child_process';

export function prepare(_pluginConfig, { cwd, env }) {
  execFileSync('npm', ['stage', 'publish', '--registry=https://registry.npmjs.org/'], {
    cwd,
    env,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}
