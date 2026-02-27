import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'update',
  type: 'document',
  title: 'Status Update',
  fields: [
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'user' }],
      title: 'Post Author',
    }),
    defineField({
      name: 'content',
      type: 'text',
      title: 'Status Text',
      validation: (Rule) => Rule.max(280).error('You gotta keep it short, sorry!'),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Post Image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'feeling',
      type: 'reference',
      to: [{ type: 'mood' }],
      title: 'Current Feeling',
    }),
    defineField({
      name: 'reactions',
      type: 'array',
      title: 'Reactions',
      of: [
        {
          type: 'object',
          name: 'reaction',
          fields: [
            defineField({ name: 'user', type: 'reference', to: [{ type: 'user' }] }),
            defineField({ name: 'emoji', type: 'reference', to: [{ type: 'mood' }] }),
          ],
        },
      ],
    }),
  ],
})