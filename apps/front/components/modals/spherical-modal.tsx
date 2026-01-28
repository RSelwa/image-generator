import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { MODAL_KEYS } from "@/constants/mapping"
import { copy } from "@/lib/utils"
import { useGetSphericalsByGameIdQuery } from "@/redux/api/games"
import {
  useDeleteSphericalMutation,
  useGetSphericalByIdQuery,
} from "@/redux/api/spherical"
import Image from "next/image"
import { useQueryState } from "nuqs"
import { useState } from "react"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

export const SphericalModal = () => {
  const [sphericalId] = useQueryState(MODAL_KEYS.SPHERICAL_ID)
  const [gameId] = useQueryState(MODAL_KEYS.GAME_ID)

  if (!sphericalId || !gameId) return null
  const { data } = useGetSphericalByIdQuery({ gameId, id: sphericalId })

  if (!data) return null

  const img = `/api/proxy-image?url=${encodeURIComponent(data?.image)}`
  return (
    <section className="w-full h-96" style={{ backgroundImage: img }}>
      <ReactPhotoSphereViewer
        hideNavbarButton={true}
        navbar={false}
        canvasBackground={img}
        src={img}
        height={"100%"}
        width={"100%"}
      />
    </section>
  )
}

export const SphericalGalleryModal = () => {
  const [selectedId, setSelectedId] = useState<string[]>([])
  const [gameId] = useQueryState(MODAL_KEYS.GAME_ID)
  const [deleteSpherical, { isLoading }] = useDeleteSphericalMutation()

  const { data } = useGetSphericalsByGameIdQuery({ gameId: gameId || "" })

  if (!data || !gameId) return null

  const hasSelected = selectedId.length > 0

  const deleteSelectedSphericals = async () => {
    await Promise.all(selectedId.map((id) => deleteSpherical({ gameId, id })))

    setSelectedId([])
  }

  return (
    <section className="h-125">
      <div className="grid-cols-5 grid gap-3">
        {data.map((spherical) => {
          const isSelected = selectedId.includes(spherical.id)

          const setChecked = (checked: boolean) => {
            setSelectedId((prev) =>
              checked
                ? [...prev, spherical.id]
                : prev.filter((id) => id !== spherical.id),
            )
          }

          return (
            <div
              data-selected={isSelected}
              data-has-selected={hasSelected}
              key={spherical.id}
              className="relative w-full aspect-video data-[selected=true]:border-2 data-[has-selected=true]:cursor-pointer border-red-500"
            >
              <Image
                src={`/api/proxy-image?url=${encodeURIComponent(spherical.image)}`}
                alt={spherical.id}
                className="size-full object-cover"
                width={110}
                height={90}
              />
              <Checkbox
                checked={isSelected}
                onCheckedChange={setChecked}
                className="absolute bottom-2 left-2"
              />
            </div>
          )
        })}
      </div>
      <Separator className="my-4 mt-full" />
      <article className="w-full flex gap-4">
        {selectedId.length > 0 && (
          <>
            <Button
              variant="destructive"
              onClick={deleteSelectedSphericals}
              disabled={isLoading}
            >
              Delete {selectedId.length} selected spherical(s)
            </Button>
            <Button
              variant="default"
              onClick={() => copy(`["${selectedId.join('", "')}"]`)}
            >
              Copy Selected Id
            </Button>
            <Button variant="outline" onClick={() => copy(`${gameId}`)}>
              Copy Game Id
            </Button>
            <Button
              onClick={() =>
                copy(`export const gameId = "${gameId}"
                export const sphericalIdsToSave: string[] = ["${selectedId.join('", "')}"]`)
              }
            >
              Copy All
            </Button>
          </>
        )}
      </article>
    </section>
  )
}
