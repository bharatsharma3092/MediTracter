import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? process.env.ComSpec ?? 'cmd.exe' : 'npm'

const processes = [
  {
    name: 'backend',
    color: '\x1b[36m',
    cwd: join(rootDir, 'backend'),
    args: ['run', 'dev']
  },
  {
    name: 'frontend',
    color: '\x1b[35m',
    cwd: join(rootDir, 'frontend'),
    args: ['run', 'dev', '--', '--host', '127.0.0.1']
  }
]

let shuttingDown = false
const children = []

function prefixOutput(name, color, stream, chunk) {
  const reset = '\x1b[0m'
  const lines = chunk.toString().split(/\r?\n/)
  for (const line of lines) {
    if (line.trim().length > 0) {
      stream.write(`${color}[${name}]${reset} ${line}\n`)
    }
  }
}

function stopAll(signal = 'SIGTERM') {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (child.killed) continue
    if (isWindows && child.pid) {
      spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    } else {
      child.kill(signal)
    }
  }
}

for (const processConfig of processes) {
  const commandArgs = isWindows ? ['/d', '/s', '/c', `npm ${processConfig.args.join(' ')}`] : processConfig.args
  const child = spawn(npmCommand, commandArgs, {
    cwd: processConfig.cwd,
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe']
  })

  children.push(child)
  child.stdout.on('data', (chunk) => prefixOutput(processConfig.name, processConfig.color, process.stdout, chunk))
  child.stderr.on('data', (chunk) => prefixOutput(processConfig.name, processConfig.color, process.stderr, chunk))

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    const reason = signal ? `signal ${signal}` : `exit code ${code}`
    console.error(`[dev] ${processConfig.name} stopped with ${reason}. Stopping the other process.`)
    stopAll()
    process.exit(code ?? 1)
  })
}

process.on('SIGINT', () => {
  stopAll('SIGINT')
  setTimeout(() => process.exit(0), 300)
})

process.on('SIGTERM', () => {
  stopAll('SIGTERM')
  setTimeout(() => process.exit(0), 300)
})

console.log('[dev] Starting backend at http://localhost:4000 and frontend at http://localhost:5173')
console.log('[dev] Press Ctrl+C to stop both.')
