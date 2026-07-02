#!/usr/bin/env bun

import { isAbsolute, normalize, resolve } from 'path';

const paths = {
  collectionRoot: 'C:\\EpicSource\\Bruno',
  workspaceRoot: 'C:\\Users\\jzfu\\AppData\\Roaming\\Bruno\\default-workspace',
  workspaceFile: 'C:\\Users\\jzfu\\AppData\\Roaming\\Bruno\\default-workspace\\workspace.yml',
  desktopExe: 'C:\\Users\\jzfu\\AppData\\Local\\Programs\\Bruno\\Bruno.exe',
  securityConfig: 'C:\\Users\\jzfu\\AppData\\Roaming\\Bruno\\collection-security.json',
} as const;

const args = process.argv.slice(2);

function printHelp(): void {
  console.log(`ResolvePath - Bruno path resolver

Usage:
  bun ResolvePath.ts [options] [path]

Options:
  --collection-root   Print the Bruno collection root
  --workspace-root    Print the Bruno workspace root
  --workspace-file    Print the Bruno workspace file
  --desktop-exe       Print the Bruno desktop executable
  --security-config   Print the Bruno collection security config
  --json              Print JSON output
  --help              Show this help text
`);
}

function resolveInput(input: string): string {
  if (isAbsolute(input)) {
    return normalize(input);
  }

  if (input.startsWith('collection:') || input.startsWith('bruno:')) {
    const stripped = input.replace(/^(collection:|bruno:)/, '');
    return normalize(resolve(paths.collectionRoot, stripped));
  }

  if (input.startsWith('workspace:')) {
    const stripped = input.replace(/^workspace:/, '');
    return normalize(resolve(paths.workspaceRoot, stripped));
  }

  return normalize(resolve(paths.collectionRoot, input));
}

const wantsJson = args.includes('--json');
const flag = args.find(arg => arg.startsWith('--') && arg !== '--json');
const pathArg = args.find(arg => !arg.startsWith('--'));

if (flag === '--help') {
  printHelp();
  process.exit(0);
}

const byFlag: Record<string, string> = {
  '--collection-root': paths.collectionRoot,
  '--workspace-root': paths.workspaceRoot,
  '--workspace-file': paths.workspaceFile,
  '--desktop-exe': paths.desktopExe,
  '--security-config': paths.securityConfig,
};

if (flag && byFlag[flag]) {
  const value = normalize(byFlag[flag]);
  if (wantsJson) {
    console.log(JSON.stringify({ kind: flag.slice(2), value }, null, 2));
  } else {
    console.log(value);
  }
  process.exit(0);
}

if (!flag && !pathArg) {
  console.log(
    JSON.stringify(
      {
        collectionRoot: paths.collectionRoot,
        workspaceRoot: paths.workspaceRoot,
        workspaceFile: paths.workspaceFile,
        desktopExe: paths.desktopExe,
        securityConfig: paths.securityConfig,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (flag && !byFlag[flag]) {
  console.error(`Unknown option: ${flag}`);
  process.exit(1);
}

if (!pathArg) {
  console.error('Missing path argument');
  process.exit(1);
}

const resolved = resolveInput(pathArg);

if (wantsJson) {
  console.log(
    JSON.stringify(
      {
        input: pathArg,
        resolved,
      },
      null,
      2,
    ),
  );
} else {
  console.log(resolved);
}
