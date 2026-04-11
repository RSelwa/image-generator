import { ModalBase } from "@/components/modals/base"
import { MODAL_KEYS } from "@/constants/mapping"

const KEY = MODAL_KEYS.JOIN_LOBBY

export const JoinLobbyModal = () => {
    return (
        <ModalBase modalKey={KEY} className="max-w-4xl">
            Join lobby
        </ModalBase>
    )
}
