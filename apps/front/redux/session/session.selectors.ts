import type { RootState } from "@/redux/store"

export const selectUser = ({ session }: RootState) => session.user
