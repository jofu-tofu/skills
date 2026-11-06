#!/usr/bin/env node
/** Standalone URL verification through the shared diagnostic CLI.
 * Usage: node verify-page.ts <url> [selector]
 * For an existing interaction state use Browse.ts check directly; this example
 * deliberately navigates to its supplied URL.
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

async function main() {
  const url = process.argv[2]
  const selector = process.argv[3]
  if (!url) {
    console.error('Usage: verify-page.ts <url> [selector]')
    process.exitCode = 1
    return
  }
  const cli = fileURLToPath(new URL('../Tools/Browse.ts', import.meta.url))
  const runtimeArgs = typeof (globalThis as any).Bun !== 'undefined' ? ['run'] : process.execArgv
  const run = (args: string[]) => new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [...runtimeArgs, cli, ...args], {
      stdio: 'inherit', windowsHide: true
    })
    child.once('error', reject)
    child.once('close', code => code === 0 ? resolve() : reject(new Error(`Verification command failed (${code})`)))
  })
  try {
    await run([url])
    if (selector) await run(['check', selector])
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}

if (import.meta.main) await main()
export { main }
