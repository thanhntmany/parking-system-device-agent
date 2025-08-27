import { readdir } from 'fs/promises'
import { join, basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const directoryPath = 'models'

export default async app => {
  const models = {}
  const dir = join(import.meta.dirname, directoryPath)

  var enties = []
  try {
    enties = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    console.error(err)
    return models
  }

  for (const ent of enties) {
    if (!ent.isFile()) continue
    const id = basename(ent.name, ".js")
    models[id] = await (await import(pathToFileURL(join(dir, ent.name)))).default(app) // #TODO: parellel
  }

  return models
}
