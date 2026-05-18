// =============================================================================
// Helpers · tiny console logger
// =============================================================================
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
}

export const log = {
  step(label) {
    process.stdout.write(`\n${COLORS.bold}${COLORS.cyan}▶ ${label}${COLORS.reset}\n`)
  },
  info(msg) {
    process.stdout.write(`  ${COLORS.dim}·${COLORS.reset} ${msg}\n`)
  },
  ok(msg) {
    process.stdout.write(`  ${COLORS.green}✓${COLORS.reset} ${msg}\n`)
  },
  warn(msg) {
    process.stdout.write(`  ${COLORS.yellow}!${COLORS.reset} ${msg}\n`)
  },
  err(msg) {
    process.stderr.write(`  ${COLORS.red}✗${COLORS.reset} ${msg}\n`)
  },
  line() {
    process.stdout.write(`${COLORS.dim}─────────────────────────────────────────${COLORS.reset}\n`)
  },
}

/** In-place progress bar. */
export function progress(done, total, label = '') {
  const width = 24
  const ratio = total ? done / total : 1
  const filled = Math.round(ratio * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  const pct = String(Math.round(ratio * 100)).padStart(3)
  process.stdout.write(
    `\r  ${COLORS.dim}${bar}${COLORS.reset} ${pct}%  ${label}${' '.repeat(8)}`
  )
  if (done >= total) process.stdout.write('\n')
}
