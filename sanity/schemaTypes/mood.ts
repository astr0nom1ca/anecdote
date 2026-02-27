import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'mood',
  type: 'document',
  title: 'Mood Pool',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      title: 'Feeling Text',
      description: 'The word that follows "Feeling:" (e.g., Content, Iconic, Tragic)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'emoji',
      type: 'string',
      title: 'Emoji',
      description: 'The visual character (e.g., ✨, ☕, 🎭)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      type: 'string',
      title: 'Tag Color',
      description: 'Hex code for the UI accent (e.g., #E91E63 for Pink)',
      initialValue: '#7C4DFF', // Default purple "Victorious" color
    }),
  ],
  // This makes the list view in Sanity look like the actual app
  preview: {
    select: {
      title: 'label',
      emoji: 'emoji',
    },
    prepare({ title, emoji }) {
      return {
        title: `Feeling: ${title} ${emoji}`,
      }
    },
  },
})