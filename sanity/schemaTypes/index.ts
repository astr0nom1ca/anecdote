import { type SchemaTypeDefinition } from 'sanity'
import mood from './mood'
import update from './update'
import user from './user'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [update, mood, user],
}

