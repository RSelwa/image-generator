import { refs } from "@repo/providers/db-refs"
import { Timestamp } from "@repo/providers/firebase"

const ORDER_TYPE = { ASC: "asc", DESC: "desc" } as const

export const retrieveInvitationForEmail = async (email: string) => {
  const snapshot = await refs.invitations
    .where("email", "==", email)
    .orderBy("createdAt", ORDER_TYPE.DESC)
    .limit(1)
    .get()

  if (snapshot.empty || !snapshot.docs[0]?.data()) return null

  const invitation = {
    ...snapshot.docs[0].data(),
    id: snapshot.docs[0].id || "",
  }

  if (
    invitation.expirationDate.toDate() < new Date() ||
    invitation.used ||
    invitation.expired
  )
    return null

  return invitation
}

export const updateUsedInvitation = async (id: string) => {
  const data = { used: true, usedAt: Timestamp.now() }
  await refs.invitations.doc(id).update(data)
}
