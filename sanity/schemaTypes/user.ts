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
      name: 'email',
      type: 'email', 
      title: 'Email Address',
      description: 'Used securely for account recovery and notifications.',
      validation: (Rule) => Rule.required(), // Let Next.js handle the casing formatting
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
      title: 'Hashed Password',
      type: 'string',
      readOnly: true, //  Prevents admins from accidentally changing/deleting hashes by hand
      hidden: false,  // Set to true if you don't want it visible in the Studio UI
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