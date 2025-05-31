import fs from 'node:fs'
import path from 'node:path'

/**
 * Get the model name for a given task from .memory-bank/analyzes/document.json
 * @param taskName The task key to search for (e.g. 'documentVectorization')
 * @returns The model name (e.g. 'text-embedding-3-small')
 */
export function getModelForTask(taskName: string): string | undefined {
  const jsonPath = path.resolve(process.cwd(), '.memory-bank/analyzes/document.json')
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  const task = data.data.find((t: any) => t.task === taskName)
  return task?.modelRequired?.model
}
