import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'user',
  type: 'document',
  title: 'Users',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Display Name',
    }),
    defineField({
      name: 'username',
      type: 'string',
      title: 'Handle',
      description: 'The @username (e.g., torivega)',
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      title: 'Profile Picture',
      options: { hotspot: true },
    }),
  ],
})