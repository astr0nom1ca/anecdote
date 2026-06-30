import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'user',
  type: 'document',
  title: 'Users',
  fields: [
    defineField({
      name: 'displayName',
      type: 'string',
      title: 'Display Name',
      description: 'The big bold name people see first (e.g., THE CHOSEN ONE).',
    }),
    defineField({
      name: 'username',
      type: 'string',
      title: 'Handle (@)',
      description: 'Your unique ID. No spaces or caps (e.g., bighead300).',
      validation: (Rule) => 
        Rule.required()
            .lowercase()
            .regex(/^[a-zA-Z0-9_]+$/, {
              name: 'username', 
              invert: false 
            })
            .error('Usernames can only contain letters, numbers, and underscores (no spaces).'),
    }),
    defineField({
      name: 'realName',
      type: 'string',
      title: 'Real Human Name',
      description: 'The boring legal name (e.g., Joe Adams).',
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      title: 'Profile Picture',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      type: 'text',
      title: 'Bio',
      rows: 3,
      description: 'Tell the Locker a bit about yourself.',
    }),
    defineField({
      name: 'password',
      type: 'string',
      hidden: true, // Hides it from the Sanity Studio UI for safety
    }),
  defineField({
    name: 'resetToken',
    type: 'string',
    hidden: true,
  }),
  defineField({
  name: 'resetToken',
  type: 'string',
  hidden: true,
}),
defineField({
  name: 'resetTokenExpiry',
  type: 'datetime',
  hidden: true,
}),
  ],
})