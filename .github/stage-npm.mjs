import { execFileSync } from 'node:child_process';

export function prepare(_pluginConfig, { cwd, env, options }) {
  if (options.dryRun) return;

  const args = ['stage', 'publish', '--registry=https://registry.npmjs.org/'];
  try {
    execFileSync('npm', args, {
      cwd,
      env,
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  } catch (cause) {
    throw new Error(`Failed to stage the npm release: npm ${args.join(' ')}`, { cause });
  }
}
