import z from "zod"

export const WITH_ID = z.object({
  id: z.string().min(1),
})

export function SchemaWithId<T extends z.ZodObject>(schema: T) {
  return schema.extend({
    id: z.string().min(1),
  })
}
