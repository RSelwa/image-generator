import z from "zod"
import { MEMBERSHIPS_EVENTS } from "@/constants/mapping"

const membershipData = z.object({
  id: z.number(),
  amount: z.number(),
  object: z.literal("membership"),
  paused: z.string(),
  status: z.string(),
  canceled: z.string(),
  currency: z.string(),
  psp_id: z.string(),
  duration_type: z.string(),
  membership_level_id: z.number(),
  membership_level_name: z.string(),
  started_at: z.number(),
  canceled_at: z.number().nullable(),
  note_hidden: z.boolean(),
  support_note: z.string().nullable(),
  supporter_name: z.string(),
  supporter_id: z.number(),
  supporter_email: z.string(),
  current_period_end: z.number(),
  current_period_start: z.number(),
})

export const payloadMembershipStarted = z.object({
  type: z.literal(MEMBERSHIPS_EVENTS.STARTED),
  live_mode: z.boolean(),
  attempt: z.number(),
  created: z.number(),
  event_id: z.number(),
  data: membershipData,
})

export const payloadMembershipUpdated = z.object({
  type: z.literal(MEMBERSHIPS_EVENTS.UPDATED),
  live_mode: z.boolean(),
  attempt: z.number(),
  created: z.number(),
  event_id: z.number(),
  data: membershipData.extend({
    supporter_feedback: z.string(),
    cancel_at_period_end: z.string(),
  }),
})

export const payloadMembershipCancelled = z.object({
  type: z.literal(MEMBERSHIPS_EVENTS.CANCELLED),
  live_mode: z.boolean(),
  attempt: z.number(),
  created: z.number(),
  event_id: z.number(),
  data: membershipData.extend({
    supporter_feedback: z.string(),
  }),
})

export const payloadSchema = z.discriminatedUnion("type", [
  payloadMembershipStarted,
  payloadMembershipUpdated,
  payloadMembershipCancelled,
])

export type PayloadMembershipStarted = z.infer<typeof payloadMembershipStarted>
export type PayloadMembershipUpdated = z.infer<typeof payloadMembershipUpdated>
export type PayloadMembershipCancelled = z.infer<typeof payloadMembershipCancelled>
export type Payload = z.infer<typeof payloadSchema>
