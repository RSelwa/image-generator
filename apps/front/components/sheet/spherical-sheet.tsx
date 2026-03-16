import { SquareArrowOutUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useQueryState } from "nuqs"
import { buildSubcollectionParam } from "@/components/modals/map-id"
import OpenFirestoreDoc from "@/components/open-firestore"
import { ReactSphere } from "@/components/providers/react-sphere"
import { EmptySheet } from "@/components/sheet/empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSphericalRef } from "@/constants/db-refs"
import { MODAL_KEYS, NEW_SEARCH_PARAM, QUERY_PARAMS, STATUS_TO_BADGE_VARIANT } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useModal } from "@/hooks/use-modal"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"

const SphericalSheet = () => {
  const [sphericalParam, setSphericalParam] = useQueryState(QUERY_PARAMS.SPHERICAL_ID)
  const open = Boolean(sphericalParam)

  const [gameId, sphericalId] = (sphericalParam || "").split("_")

  const { data: spherical } = useGetSphericalByIdQuery(
    { gameId: gameId || "", id: sphericalId || "" },
    { skip: !gameId || !sphericalId, refetchOnMountOrArgChange: true },
  )

  const editParam = buildSubcollectionParam(gameId || "", sphericalId || "")
  const { openModal: openSphericalIdModal } = useModal(MODAL_KEYS.EDIT_SPHERICAL_ID, editParam)
  const mapParam = buildSubcollectionParam(gameId || "", spherical?.mapId || NEW_SEARCH_PARAM)
  const { openModal: openMapIdModal } = useModal(MODAL_KEYS.MAP_ID, mapParam)

  if (!spherical || !sphericalParam) return <Sheet open={open} onOpenChange={(open) => !open && setSphericalParam(null)}><EmptySheet /></Sheet>

  const close = async (open: boolean) => {
    if (open) return
    setSphericalParam(null)
  }

  return (
    <Sheet key={sphericalParam} open={open} onOpenChange={close}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{spherical.id} <OpenFirestoreDoc docRef={getSphericalRef(gameId || "", sphericalId || "")} /></SheetTitle>
          <SheetDescription asChild>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_TO_BADGE_VARIANT[spherical.status]}>
                {spherical.status}
              </Badge>
              {spherical.game && <Badge variant="blue">{spherical.game.title}</Badge>}
            </div>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-5/6 space-y-2">
          <section className="px-2 space-y-4">
            {spherical.image && (
              <article className="relative">
                <div className="h-64 w-full">
                  <ReactSphere src={spherical.image} />
                </div>
                <Badge className="absolute top-2 left-2">360 Preview</Badge>
              </article>
            )}
            {!spherical.image && (
              <div className="h-64 w-full flex items-center justify-center bg-muted rounded-lg">
                No image available
              </div>
            )}
            <div className="flex items-center gap-2">
              {!spherical.mapId && <Badge variant="red">No map selected</Badge>}
              {!spherical.mapPosition && <Badge variant="red">Need map position</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="marathon-outline" onClick={() => openSphericalIdModal()}>Edit</Button>
              <Button variant="marathon-outline" onClick={() => openMapIdModal()}>Map</Button>
              {spherical.image && (
                <Button variant="marathon-link" asChild>
                  <Link href={`${PAGES.ADMIN_SPHERICAL_FULLSCREEN}/${gameId}/${sphericalId}`} target="_blank" className="flex gap-4 items-center cursor-pointer">
                    Spherical Image <SquareArrowOutUpRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </section>
        </ScrollArea>
        <SheetFooter />
      </SheetContent>
    </Sheet>
  )
}

export default SphericalSheet
