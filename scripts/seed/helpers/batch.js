// =============================================================================
// Helpers · chunked inserts
// =============================================================================
import { admin } from '../config.js'

/**
 * Insert `rows` into `table` in chunks. Logs progress and aggregates errors.
 * Returns { inserted, errors }.
 */
export async function batchInsert(table, rows, chunkSize = 500, opts = {}) {
  const { onProgress } = opts
  if (!rows.length) return { inserted: 0, errors: [] }

  let inserted = 0
  const errors = []
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await admin
      .from(table)
      .insert(chunk, { defaultToNull: true })
    if (error) {
      errors.push({ chunk: i / chunkSize, message: error.message, hint: error.hint })
    } else {
      inserted += chunk.length
    }
    if (onProgress) onProgress(Math.min(i + chunkSize, rows.length), rows.length)
  }
  return { inserted, errors }
}
