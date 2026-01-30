import { ModalBase } from "@/components/modals/base"
import { MODAL_KEYS } from "@/constants/mapping"
import { useQueryState } from "nuqs"


const ModalMapId = () => {
    const [mapId] = useQueryState(MODAL_KEYS.MAP_ID)
    
  return (
    <ModalBase modalKey={MODAL_KEYS.MAP_ID}>ModalMapId</ModalBase>
  )
}

export default ModalMapId