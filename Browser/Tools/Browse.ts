#!/usr/bin/env node
/**
 * Browse CLI Tool v2.0.1 - Debug-First Browser Automation
 *
 * Browser automation with debugging visibility by DEFAULT.
 * Console logs, network requests, and errors are always captured.
 * Cross-runtime: Works with both Bun and Node (tsx).
 * Windows-compatible: Uses cross-platform temp paths and settings.
 *
 * Usage:
 *   bun run Browse.ts <url>                    # Navigate with full diagnostics
 *   npx tsx Browse.ts <url>                    # Same, using Node
 *   bun run Browse.ts errors                   # Show console errors
 *   bun run Browse.ts network                  # Show network activity
 *   bun run Browse.ts failed                   # Show failed requests (4xx, 5xx)
 *   bun run Browse.ts screenshot [path]        # Take screenshot of current page
 *   bun run Browse.ts click <selector>         # Click element
 *   bun run Browse.ts fill <selector> <value>  # Fill input field
 *
 * Session auto-starts on first use. No explicit start needed.
 */

import { tmpdir } from 'os'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { PlaywrightBrowser } from '../index.ts'
import { fileExists, readFileCompat, sleep, isWindows, isBun } from './compat.ts'

const isMacOS = process.platform === 'darwin'

const STATE_FILE = join(tmpdir(), 'browser-session.json')
const DEFAULT_PORT = 9222
const SESSION_TIMEOUT = 5000 // 5s to wait for session start

// Settings path - cross-platform
function getSettingsPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || ''
  if (isWindows) {
    // On Windows, check for PAI_DIR or use default pai location
    const paiDir = process.env.PAI_DIR || join(home, 'pai')
    return join(paiDir, 'settings.json')
  }
  return join(home, '.claude', 'settings.json')
}

const SETTINGS_PATH = getSettingsPath()

// ============================================
// SETTINGS
// ============================================

interface Settings {
  techStack?: {
    browser?: string
    terminal?: string
    packageManager?: string
    devServerPort?: number
  }
}

async function getSettings(): Promise<Settings> {
  try {
    if (await fileExists(SETTINGS_PATH)) {
      return JSON.parse(await readFileCompat(SETTINGS_PATH))
    }
  } catch {}
  return {}
}

async function getBrowser(): Promise<string> {
  const settings = await getSettings()
  // Default browser per platform
  if (settings.techStack?.browser) {
    return settings.techStack.browser
  }
  if (isWindows) return 'chrome'
  if (isMacOS) return 'Dia'
  return 'chromium'
}

// ============================================
// TYPES
// ============================================

interface SessionState {
  pid: number
  port: number
  sessionId: string
  startedAt: string
  headless: boolean
  url: string
}

interface Diagnostics {
  errors: Array<{ type: string; text: string; timestamp: number }>
  warnings: Array<{ type: string; text: string; timestamp: number }>
  failedRequests: Array<{
    url: string
    method: string
    status?: number
    statusText?: string
    errorText?: string
  }>
  stats: {
    totalRequests: number
    totalResponses: number
    totalSize: number
    avgDuration: number
  }
  pageTitle: string
  pageUrl: string
}

// ============================================
// UTILITIES
// ============================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}

const A11Y_MAX_LINES = 200

function formatAccessibilityTree(tree: string): string {
  const lines = tree.split('\n')
  if (lines.length <= A11Y_MAX_LINES) return tree
  return lines.slice(0, A11Y_MAX_LINES).join('\n') +
    `\n[truncated — showing first ${A11Y_MAX_LINES} of ${lines.length} lines]`
}

// ============================================
// SESSION MANAGEMENT
// ============================================

async function getSessionState(): Promise<SessionState | null> {
  try {
    const state = JSON.parse(await readFileCompat(STATE_FILE)) as SessionState
    if (!state || !Number.isInteger(state.port) || state.port < 1 || state.port > 65535 ||
        typeof state.sessionId !== 'string' || state.sessionId.length === 0) {
      throw new Error('invalid state fields')
    }
    return state
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw new Error(`Browser session state is unreadable or invalid at ${STATE_FILE}; preserved for inspection`)
  }
}

async function sessionIdentity(state: SessionState): Promise<'owned' | 'unavailable' | 'mismatch'> {
  let res: Response
  try {
    res = await fetch(`http://localhost:${state.port}/health`, { signal: AbortSignal.timeout(1000) })
  } catch { return 'unavailable' }
  try {
    const payload = await res.json() as any
    return res.ok && payload.success === true && payload.data?.status === 'ok' &&
      typeof state.sessionId === 'string' && state.sessionId.length > 0 &&
      payload.data?.sessionId === state.sessionId ? 'owned' : 'mismatch'
  } catch { return 'mismatch' }
}

async function ensureSession(): Promise<number> {
  // Check if already running
  const state = await getSessionState()
  if (state) {
    const identity = await sessionIdentity(state)
    if (identity === 'owned') return state.port
    if (identity === 'mismatch') throw new Error('Browser session identity mismatch; refusing to control another service')
    if (await portMayBeActive(state.port)) throw new Error('Recorded browser session is unresponsive; session state preserved')
  }

  // Need to start session
  const port = DEFAULT_PORT

  // A listening but unresponsive service still owns its port.
  if (await portMayBeActive(port)) throw new Error('Browser port is occupied without matching session state; refusing to reuse it')

  // Start server in background
  const { spawn, spawnSync } = await import('child_process')
  const normalizedPath = fileURLToPath(new URL('./BrowserSession.ts', import.meta.url))

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    BROWSER_PORT: String(port),
    BROWSER_HEADLESS: process.env.BROWSER_HEADLESS === 'false' ? 'false' : 'true'
  }

  // On Windows, run the Playwright server under Node even when the CLI uses Bun.
  // Prefer available native TypeScript support; never download a loader implicitly.
  const nativeNode = isBun && isWindows && spawnSync('node',
    ['--experimental-strip-types', '-e', ''],
    { timeout: 2000, windowsHide: true, stdio: 'ignore' }).status === 0
  // A working Node invocation already has its required TypeScript support.
  // Reuse that runtime/loader instead of silently requiring an npx download.
  const runner = !isBun ? process.execPath : nativeNode ? 'node' : isWindows ? 'npx' : process.execPath
  const runnerArgs = !isBun
    ? [...process.execArgv, normalizedPath]
    : nativeNode ? ['--experimental-strip-types', normalizedPath]
    : isWindows ? ['--offline', '--no-install', 'tsx', normalizedPath] : ['run', normalizedPath]

  const child = spawn(runner, runnerArgs, {
    detached: true,
    stdio: 'ignore',
    env,
    ...(isWindows ? { shell: isBun && !nativeNode, windowsHide: true } : {})
  })
  child.unref()

  // Wait for server to be ready (longer timeout on Windows due to npx cold start)
  const maxAttempts = isWindows ? 50 : 30
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(200)
    try {
      const started = await getSessionState()
      if (started?.port === port && await sessionIdentity(started) === 'owned') {
        return port
      }
    } catch {}
  }

  throw new Error('Failed to start browser session')
}

async function sessionCommand(
  endpoint: string,
  body?: any,
  method = 'POST'
): Promise<any> {
  const port = await ensureSession()

  const options: RequestInit = {
    method,
    signal: AbortSignal.timeout(60000) // 60s for long operations
  }

  if (body && method !== 'GET') {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }

  const url = method === 'GET' && body
    ? `http://localhost:${port}/${endpoint}?${new URLSearchParams(body)}`
    : `http://localhost:${port}/${endpoint}`

  const res = await fetch(url, options)
  const data = await res.json() as { success: boolean; data?: any; error?: string }

  if (data.success) {
    return data.data
  } else {
    throw new Error(data.error || 'Unknown error')
  }
}

// ============================================
// DIAGNOSTIC FORMATTING
// ============================================

function formatDiagnostics(
  diag: Diagnostics,
  screenshotPath?: string
): string {
  const lines: string[] = []

  // Screenshot (if taken)
  if (screenshotPath) {
    lines.push(`Screenshot: ${screenshotPath}`)
    lines.push('')
  }

  // Console errors
  if (diag.errors.length > 0) {
    lines.push(`Console Errors (${diag.errors.length}):`)
    for (const err of diag.errors.slice(0, 5)) {
      lines.push(`   - ${truncate(err.text, 100)}`)
    }
    if (diag.errors.length > 5) {
      lines.push(`   ... and ${diag.errors.length - 5} more`)
    }
    lines.push('')
  }

  // Console warnings
  if (diag.warnings.length > 0) {
    lines.push(`Console Warnings (${diag.warnings.length}):`)
    for (const warn of diag.warnings.slice(0, 3)) {
      lines.push(`   - ${truncate(warn.text, 100)}`)
    }
    if (diag.warnings.length > 3) {
      lines.push(`   ... and ${diag.warnings.length - 3} more`)
    }
    lines.push('')
  }

  // Failed requests
  if (diag.failedRequests.length > 0) {
    lines.push(`Failed Requests (${diag.failedRequests.length}):`)
    for (const req of diag.failedRequests.slice(0, 5)) {
      const urlPath = new URL(req.url).pathname
      lines.push(`   - ${req.method} ${truncate(urlPath, 50)} -> ${req.status ?? 'NETWORK'} ${req.errorText || req.statusText || ''}`)
    }
    if (diag.failedRequests.length > 5) {
      lines.push(`   ... and ${diag.failedRequests.length - 5} more`)
    }
    lines.push('')
  }

  // Network summary
  lines.push(`Network: ${diag.stats.totalRequests} requests | ${formatBytes(diag.stats.totalSize)} | avg ${Math.round(diag.stats.avgDuration)}ms`)

  lines.push(`URL: ${diag.pageUrl}`)

  // Final status
  const hasIssues = diag.errors.length > 0 || diag.failedRequests.length > 0
  if (hasIssues) {
    lines.push(`Page: "${diag.pageTitle}" loaded with issues`)
  } else {
    lines.push(`Page: "${diag.pageTitle}" loaded successfully`)
  }

  return lines.join('\n')
}

// ============================================
// COMMANDS
// ============================================

async function debugUrl(url: string): Promise<void> {
  // Navigate
  await sessionCommand('navigate', { url })

  // Take screenshot (fullPage captures content below the fold)
  const timestamp = Date.now()
  const screenshotPath = join(tmpdir(), `browse-${timestamp}.png`)
  await sessionCommand('screenshot', { path: screenshotPath, fullPage: true })

  // Get diagnostics and accessibility tree in parallel
  const [diag, a11yData] = await Promise.all([
    sessionCommand('diagnostics', {}, 'GET') as Promise<Diagnostics>,
    sessionCommand('accessibility', {}, 'GET').catch(() => null) as Promise<{ tree: string } | null>
  ])

  // Output diagnostics
  console.log(formatDiagnostics(diag, screenshotPath))

  // Output accessibility tree
  if (a11yData?.tree) {
    console.log('\nAccessibility Tree:')
    console.log(formatAccessibilityTree(a11yData.tree))
  }
}

async function showErrors(): Promise<void> {
  const diag = await sessionCommand('diagnostics', {}, 'GET') as Diagnostics

  if (diag.errors.length === 0) {
    console.log('No console errors')
    return
  }

  console.log(`Console Errors (${diag.errors.length}):\n`)
  for (const err of diag.errors) {
    const time = new Date(err.timestamp).toLocaleTimeString()
    console.log(`[${time}] ${err.text}\n`)
  }
}

async function showWarnings(): Promise<void> {
  const diag = await sessionCommand('diagnostics', {}, 'GET') as Diagnostics

  if (diag.warnings.length === 0) {
    console.log('No console warnings')
    return
  }

  console.log(`Console Warnings (${diag.warnings.length}):\n`)
  for (const warn of diag.warnings) {
    const time = new Date(warn.timestamp).toLocaleTimeString()
    console.log(`[${time}] ${warn.text}\n`)
  }
}

async function showConsole(): Promise<void> {
  const logs = await sessionCommand('console', {}, 'GET') as Array<{
    type: string
    text: string
    timestamp: number
  }>

  if (logs.length === 0) {
    console.log('No console output')
    return
  }

  console.log(`Console Output (${logs.length} entries):\n`)
  for (const log of logs) {
    const time = new Date(log.timestamp).toLocaleTimeString()
    const icon = log.type === 'error' ? '[ERROR]' :
                 log.type === 'warning' ? '[WARN]' :
                 log.type === 'info' ? '[INFO]' : '       '
    console.log(`${icon} [${time}] ${log.text}`)
  }
}

async function showNetwork(): Promise<void> {
  const logs = await sessionCommand('network', {}, 'GET') as Array<{
    type: string
    url: string
    method: string
    status?: number
    duration?: number
    size?: number
    errorText?: string
  }>

  if (logs.length === 0) {
    console.log('No network activity')
    return
  }

  // Include transport failures, which never receive an HTTP response.
  const responses = logs.filter(l => l.type === 'response' || l.type === 'failure')

  console.log(`Network Activity (${responses.length} responses/failures):\n`)
  for (const log of responses.slice(-20)) {
    const urlPath = new URL(log.url).pathname
    const status = log.status ?? 'NETWORK'
    const icon = log.type === 'failure' || (log.status ?? 0) >= 400 ? '[FAIL]' : (log.status ?? 0) >= 300 ? '[REDIR]' : '[OK]'
    const size = log.size ? formatBytes(log.size) : ''
    const duration = log.duration ? `${log.duration}ms` : ''
    console.log(`${icon} ${status} ${log.method} ${truncate(urlPath, 50)} ${size} ${duration}${log.errorText ? ` ${log.errorText}` : ''}`)
  }
}

async function showFailed(): Promise<void> {
  const diag = await sessionCommand('diagnostics', {}, 'GET') as Diagnostics

  if (diag.failedRequests.length === 0) {
    console.log('No failed requests')
    return
  }

  console.log(`Failed Requests (${diag.failedRequests.length}):\n`)
  for (const req of diag.failedRequests) {
    console.log(`[FAIL] ${req.status ?? 'NETWORK'} ${req.method} ${req.url}${req.errorText ? ` ${req.errorText}` : ''}`)
  }
}

async function takeScreenshot(path?: string): Promise<void> {
  const screenshotPath = path || join(tmpdir(), `screenshot-${Date.now()}.png`)
  await sessionCommand('screenshot', { path: screenshotPath })
  console.log(`Screenshot: ${screenshotPath}`)
}

async function getA11yTree(): Promise<string | null> {
  try {
    const data = await sessionCommand('accessibility', {}, 'GET') as { tree: string }
    return data?.tree || null
  } catch {
    return null
  }
}

async function printA11yTree(): Promise<void> {
  const tree = await getA11yTree()
  if (tree) {
    console.log('\nAccessibility Tree:')
    console.log(formatAccessibilityTree(tree))
  }
}

async function showAccessibilityTree(): Promise<void> {
  const tree = await getA11yTree()
  if (tree) {
    console.log('Accessibility Tree:')
    console.log(formatAccessibilityTree(tree))
  } else {
    console.log('No accessibility tree available (navigate to a page first)')
  }
}

async function navigate(url: string): Promise<void> {
  const result = await sessionCommand('navigate', { url })
  console.log(`Navigated to: ${result.url}`)
  await printA11yTree()
}

async function click(selector: string): Promise<void> {
  await sessionCommand('click', { selector })
  console.log(`Clicked: ${selector}`)
  await printA11yTree()
}

async function checkTarget(selector: string, state: string = 'visible'): Promise<void> {
  if (state !== 'visible' && state !== 'attached') throw new Error('Target state must be visible or attached')
  await sessionCommand('wait', { selector, state, timeout: 5000 })
  // Text lookup is strict: ambiguous selectors must not silently verify the first match.
  const { text } = await sessionCommand('text', { selector }, 'GET')
  const session = await sessionCommand('session', {}, 'GET')
  console.log(`Target ${state}: ${selector}`)
  console.log(`URL: ${session.url}`)
  console.log(`Text: ${text}`)
  console.log('This verifies the target condition only; inspect diagnostics and rendering for page-level claims.')
}

async function fill(selector: string, value: string): Promise<void> {
  await sessionCommand('fill', { selector, value })
  console.log(`Filled: ${selector}`)
  await printA11yTree()
}

async function type(selector: string, text: string): Promise<void> {
  await sessionCommand('type', { selector, text })
  console.log(`Typed in: ${selector}`)
  await printA11yTree()
}

async function evaluate(script: string): Promise<void> {
  const result = await sessionCommand('evaluate', { script })
  console.log(JSON.stringify(result.result, null, 2))
}

async function showStatus(): Promise<void> {
  const state = await getSessionState()
  if (!state) {
    console.log('No recorded browser session')
    return
  }
  const identity = await sessionIdentity(state)
  if (identity !== 'owned') throw new Error(`Recorded session ${identity}; status did not start or change a browser`)
  const response = await fetch(`http://localhost:${state.port}/session`, { signal: AbortSignal.timeout(2000) })
  const payload = await response.json() as any
  if (!response.ok || payload.success !== true || payload.data?.sessionId !== state.sessionId) {
    throw new Error('Unable to verify recorded session status')
  }
  const session = payload.data
  console.log('Browser Session:')
  console.log(`  ID: ${session.sessionId}`)
  console.log(`  Port: ${session.port}`)
  console.log(`  URL: ${session.url || '(none)'}`)
  console.log(`  Title: ${session.title || '(none)'}`)
  console.log(`  Started: ${session.startedAt}`)
  console.log(`  Idle timeout: ${session.idleTimeout}`)
}

async function portMayBeActive(port: number): Promise<boolean> {
  const { createConnection } = await import('node:net')
  return new Promise(resolve => {
    const socket = createConnection({ host: 'localhost', port })
    let settled = false
    const finish = (active: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(active)
    }
    socket.once('connect', () => finish(true))
    socket.once('error', (error: NodeJS.ErrnoException) => finish(error.code !== 'ECONNREFUSED'))
    socket.setTimeout(1000, () => finish(true)) // Unknown is not confirmed termination.
  })
}

async function waitForSessionStop(port: number): Promise<void> {
  const deadline = Date.now() + 3000
  while (await portMayBeActive(port)) {
    if (Date.now() >= deadline) throw new Error('Stop is unconfirmed; session state preserved')
    await sleep(100)
  }
}

async function restart(): Promise<void> {
  const current = await getSessionState()
  if (current) {
    const identity = await sessionIdentity(current)
    if (identity === 'mismatch') throw new Error('Browser session identity mismatch; refusing to restart another service')
    if (identity === 'owned') {
      try {
        const response = await fetch(`http://localhost:${current.port}/stop`, {
          method: 'POST', signal: AbortSignal.timeout(2000)
        })
        if (!response.ok) throw new Error(`Stop failed: HTTP ${response.status}`)
      } catch (error) {
        if (await portMayBeActive(current.port)) {
          throw new Error(`Restart could not confirm stop; session state preserved: ${error instanceof Error ? error.message : error}`)
        }
      }
      await waitForSessionStop(current.port)
    } else if (await portMayBeActive(current.port)) {
      throw new Error('Browser session is unresponsive; restart refused and session state preserved')
    }
  }

  // Remove stale ownership only after the recorded endpoint is unavailable.
  try {
    const fs = await import('fs/promises')
    await fs.unlink(STATE_FILE)
  } catch {}
  await ensureSession()
  console.log('Session restarted')
}

async function stop(): Promise<void> {
  const state = await getSessionState()
  if (!state) {
    console.log('No recorded browser session')
    return
  }

  const identity = await sessionIdentity(state)
  if (identity === 'mismatch') throw new Error('Browser session identity mismatch; refusing to stop another service')
  if (identity === 'unavailable') {
    if (await portMayBeActive(state.port)) throw new Error('Session is unresponsive; unable to confirm stop')
    console.log('Session already stopped')
    return
  }
  try {
    const response = await fetch(`http://localhost:${state.port}/stop`, {
      method: 'POST',
      signal: AbortSignal.timeout(2000)
    })
    if (!response.ok) throw new Error(`Stop failed: HTTP ${response.status}`)
    await waitForSessionStop(state.port)
    console.log('Session stopped')
  } catch (error) {
    throw new Error(`Unable to confirm session stop: ${error instanceof Error ? error.message : error}`)
  }
}

async function codegen(url?: string): Promise<void> {
  const { spawn } = await import('child_process')
  const args = ['playwright', 'codegen']
  if (url) args.push(url)

  console.log('Opening Playwright codegen...')
  console.log('Interact with the browser — code will be generated as you go.')
  console.log('Close the browser window when done.\n')

  await new Promise<void>((resolve, reject) => {
    const child = spawn('npx', args, { stdio: 'inherit' })
    child.on('close', (code) => {
      if (code === 0 || code === null) resolve()
      else reject(new Error(`playwright codegen exited with code ${code}`))
    })
    child.on('error', reject)
  })
}

async function openUrl(url: string): Promise<void> {
  // Use browser from settings.json techStack - cross-platform
  const browser = await getBrowser()
  const { spawn } = await import('child_process')

  if (isWindows) {
    // Windows: use 'start' command
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref()
  } else if (isMacOS) {
    // macOS: use 'open -a' command
    spawn('open', ['-a', browser, url], { detached: true, stdio: 'ignore' }).unref()
  } else {
    // Linux: use xdg-open
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
  }
  console.log(`Opened in browser: ${url}`)
}

// ============================================
// DEV SERVER DETECTION
// ============================================

async function detectDevServers(): Promise<void> {
  const ports = [3000, 3001, 3002, 4200, 5000, 5173, 8000, 8080, 9000, 1234]
  console.log('Scanning for local dev servers...\n')

  const results = await Promise.all(
    ports.map(async (port) => {
      try {
        const res = await fetch(`http://localhost:${port}`, {
          signal: AbortSignal.timeout(500)
        })
        return { port, status: res.status, ok: true }
      } catch {
        return { port, status: 0, ok: false }
      }
    })
  )

  const active = results.filter(r => r.ok)
  if (active.length === 0) {
    console.log('No dev servers found on common ports.')
    console.log(`Scanned: ${ports.join(', ')}`)
  } else {
    console.log(`Found ${active.length} active server(s):`)
    for (const s of active) {
      console.log(`  http://localhost:${s.port}  [HTTP ${s.status}]`)
    }
    console.log(`\nTip: bun run Browse.ts http://localhost:${active[0].port}`)
  }
}

// ============================================
// MAIN
// ============================================

function showHelp(): void {
  console.log(`
Browse CLI v2.0.0 - Debug-First Browser Automation

Usage:
  bun run Browse.ts <url>                    Navigate with full diagnostics
  bun run Browse.ts <url> --headed           Navigate in headed mode (visible browser window)
  bun run Browse.ts a11y                     Show accessibility tree of current page
  bun run Browse.ts errors                   Show console errors
  bun run Browse.ts warnings                 Show console warnings
  bun run Browse.ts console                  Show all console output
  bun run Browse.ts network                  Show network activity
  bun run Browse.ts failed                   Show failed requests (4xx, 5xx)
  bun run Browse.ts screenshot [path]        Take screenshot of current page
  bun run Browse.ts click <selector>         Click element
  bun run Browse.ts check <selector> [visible|attached]  Check current target without navigating
  bun run Browse.ts fill <selector> <value>  Fill input field
  bun run Browse.ts type <selector> <text>   Type with delay
  bun run Browse.ts status                   Show session info
  bun run Browse.ts restart                  Restart session (clear state)
  bun run Browse.ts stop                     Stop session

Session auto-starts on first use. No explicit start needed.
Browser runs HEADLESS by default. Use --headed to see the browser window for debugging.

Examples:
  bun run Browse.ts https://example.com
  bun run Browse.ts errors
  bun run Browse.ts click "#submit"
  bun run Browse.ts fill "#email" "test@example.com"
  `)
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2)

  // Parse --headed flag (can appear anywhere)
  if (rawArgs.includes('--headed')) {
    process.env.BROWSER_HEADLESS = 'false'
  }
  // Keep --headless for backwards compat
  if (rawArgs.includes('--headless')) {
    process.env.BROWSER_HEADLESS = 'true'
  }
  const args = rawArgs.filter(a => a !== '--headed' && a !== '--headless')

  const command = args[0]

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  try {
    // URL detection - if it looks like a URL, treat as debug command
    if (command.startsWith('http://') || command.startsWith('https://') || command.startsWith('localhost')) {
      const url = command.startsWith('localhost') ? `http://${command}` : command
      await debugUrl(url)
      return
    }

    // Named commands
    switch (command) {
      case 'a11y':
      case 'accessibility':
      case 'tree':
        await showAccessibilityTree()
        break

      case 'errors':
        await showErrors()
        break

      case 'warnings':
        await showWarnings()
        break

      case 'console':
        await showConsole()
        break

      case 'network':
        await showNetwork()
        break

      case 'failed':
        await showFailed()
        break

      case 'screenshot':
        await takeScreenshot(args[1])
        break

      case 'navigate':
        if (!args[1]) {
          console.error('URL required')
          process.exit(1)
        }
        await navigate(args[1])
        break

      case 'click':
        if (!args[1]) {
          console.error('Selector required')
          process.exit(1)
        }
        await click(args[1])
        break

      case 'check':
        if (!args[1]) throw new Error('Selector required')
        await checkTarget(args[1], args[2])
        break

      case 'fill':
        if (!args[1] || args.length < 3) {
          console.error('Selector and value required')
          process.exit(1)
        }
        await fill(args[1], args[2])
        break

      case 'type':
        if (!args[1] || !args[2]) {
          console.error('Selector and text required')
          process.exit(1)
        }
        await type(args[1], args[2])
        break

      case 'eval':
        if (!args[1]) {
          console.error('JavaScript code required')
          process.exit(1)
        }
        await evaluate(args[1])
        break

      case 'codegen':
        await codegen(args[1])
        break

      case 'open':
        if (!args[1]) {
          console.error('URL required')
          process.exit(1)
        }
        await openUrl(args[1])
        break

      case 'status':
        await showStatus()
        break

      case 'restart':
        await restart()
        break

      case 'stop':
        await stop()
        break

      case 'detect':
        await detectDevServers()
        break

      // Legacy session commands (redirect to new interface)
      case 'session':
        const subCmd = args[1]
        if (subCmd === 'start') {
          await ensureSession()
          console.log('Session started (auto-starts on any command now)')
        } else if (subCmd === 'stop') {
          await stop()
        } else if (subCmd === 'status') {
          await showStatus()
        } else {
          console.log('Session commands deprecated. Session auto-starts on first use.')
          console.log('Use: Browse.ts <url> | errors | network | failed | etc.')
        }
        break

      default:
        console.error(`Unknown command: ${command}`)
        console.log('Run with --help for usage')
        process.exit(1)
    }
  } catch (err: any) {
    handleError(err)
    process.exitCode = 1
  }
}

function handleError(err: any): void {
  const msg = err.message || String(err)

  // Playwright not installed
  if (msg.includes('Cannot find module') && msg.includes('playwright') ||
      msg.includes('browserType.launch') ||
      msg.includes('Executable doesn\'t exist') ||
      msg.includes('executable doesn\'t exist')) {
    console.error('Error: Playwright is not installed or browsers are missing.\n')
    console.error('To fix, run:')
    console.error('  npx playwright install chromium\n')
    console.error('If Playwright itself is not installed:')
    console.error('  npm install playwright')
    console.error('  npx playwright install chromium')
    return
  }

  // Port in use
  if (msg.includes('EADDRINUSE') || msg.includes('address already in use')) {
    console.error(`Error: Port ${DEFAULT_PORT} is already in use.\n`)
    console.error('This may be another browser session or a different process.')
    console.error('To fix:')
    console.error(`  1. Stop the existing session: bun run Browse.ts stop`)
    console.error(`  2. Or kill the process: lsof -ti:${DEFAULT_PORT} | xargs kill`)
    console.error(`  3. Or restart: bun run Browse.ts restart`)
    return
  }

  // Session start timeout
  if (msg.includes('Failed to start browser session')) {
    console.error('Error: Browser session failed to start within timeout.\n')
    console.error('Common causes:')
    console.error('  1. Playwright browsers not installed → npx playwright install chromium')
    console.error('  2. Another session is stuck → bun run Browse.ts restart')
    console.error('  3. System resources exhausted → close other browser instances')
    if (!isWindows) {
      console.error(`  4. Check for orphan processes: ps aux | grep BrowserSession`)
    }
    return
  }

  // Connection refused (server died)
  if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
    console.error('Error: Cannot connect to browser session.\n')
    console.error('The session may have crashed. Try:')
    console.error('  bun run Browse.ts restart')
    return
  }

  // Generic fallback
  console.error(`Error: ${msg}`)
}

await main()
