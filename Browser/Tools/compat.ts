/**
 * Runtime Compatibility Layer - Bun + Node (tsx)
 *
 * Provides cross-runtime equivalents for Bun-specific APIs.
 * On Windows, Playwright hangs under Bun, so we need Node/tsx support.
 */

import { readFile, writeFile, unlink, access } from 'fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'

// Runtime detection
export const isBun = typeof globalThis.Bun !== 'undefined'
export const isWindows = process.platform === 'win32'
export const isWSL = !isWindows && process.platform === 'linux'
  && (process.env.WSL_DISTRO_NAME !== undefined || process.env.WSLENV !== undefined)

/**
 * Find Windows Chrome executable from WSL via /mnt/c/ paths.
 * Returns the path if found, undefined otherwise.
 */
export async function findWindowsChrome(): Promise<string | undefined> {
  if (!isWSL) return undefined
  const candidates = [
    '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
    '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ]
  for (const path of candidates) {
    if (await fileExists(path)) return path
  }
  return undefined
}

// ============================================
// FILE I/O
// ============================================

export async function writeFileCompat(path: string, content: string): Promise<void> {
  if (isBun) {
    await (globalThis as any).Bun.write(path, content)
  } else {
    await writeFile(path, content, 'utf-8')
  }
}

export async function readFileCompat(path: string): Promise<string> {
  if (isBun) {
    return await (globalThis as any).Bun.file(path).text()
  } else {
    return await readFile(path, 'utf-8')
  }
}

export async function fileExists(path: string): Promise<boolean> {
  if (isBun) {
    return await (globalThis as any).Bun.file(path).exists()
  } else {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }
}

export async function removeFile(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {}
}

// ============================================
// SLEEP
// ============================================

export function sleep(ms: number): Promise<void> {
  if (isBun) {
    return (globalThis as any).Bun.sleep(ms)
  } else {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ============================================
// HTTP SERVER (cross-runtime)
// ============================================

type FetchHandler = (req: Request) => Promise<Response> | Response

interface ServeOptions {
  port: number
  fetch: FetchHandler
}

interface ServerHandle {
  port: number
  stop: () => void
}

/**
 * Cross-runtime HTTP server.
 * Uses Bun.serve when available, falls back to Node's http.createServer.
 */
export function serve(options: ServeOptions): ServerHandle {
  if (isBun) {
    const server = (globalThis as any).Bun.serve(options)
    return { port: server.port, stop: () => server.stop() }
  }

  // Node fallback using http.createServer
  const server = createServer(async (nodeReq: IncomingMessage, nodeRes: ServerResponse) => {
    try {
      // Convert Node request to Web Request
      const url = `http://localhost:${options.port}${nodeReq.url || '/'}`
      const headers = new Headers()
      for (const [key, value] of Object.entries(nodeReq.headers)) {
        if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }

      let body: string | undefined
      if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
        body = await new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = []
          nodeReq.on('data', (chunk: Buffer) => chunks.push(chunk))
          nodeReq.on('end', () => resolve(Buffer.concat(chunks).toString()))
          nodeReq.on('error', reject)
        })
      }

      const webReq = new Request(url, {
        method: nodeReq.method || 'GET',
        headers,
        body: body || undefined,
      })

      // Call the fetch handler
      const webRes = await options.fetch(webReq)

      // Convert Web Response back to Node response
      const resHeaders: Record<string, string> = {}
      webRes.headers.forEach((value, key) => {
        resHeaders[key] = value
      })

      nodeRes.writeHead(webRes.status, resHeaders)
      const resBody = await webRes.text()
      nodeRes.end(resBody)
    } catch (err: any) {
      nodeRes.writeHead(500, { 'Content-Type': 'application/json' })
      nodeRes.end(JSON.stringify({ success: false, error: err.message }))
    }
  })

  server.listen(options.port)
  return {
    port: options.port,
    stop: () => server.close()
  }
}
