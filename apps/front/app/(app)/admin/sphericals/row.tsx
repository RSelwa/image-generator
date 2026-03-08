import { getDateString } from "@repo/common"
import { type SphericalEntity } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { type Dispatch, type SetStateAction } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"
import { getSphericalRef } from "@/constants/db-refs"
import { QUERY_PARAMS, RESOURCE_BADGE_VARIANT, STATUS_TO_BADGE_VARIANT } from "@/constants/mapping"

export const SphericalRow = ({ spherical, checkedIds, setCheckedIds }: {
    spherical: SphericalEntity
    checkedIds: string[]
    setCheckedIds: Dispatch<SetStateAction<string[]>>
}) => {
    const [_, setSphericalId] = useQueryState(QUERY_PARAMS.SPHERICAL_ID)

    const checked = checkedIds.includes(spherical.id)
    const onCheckedChange = (value: boolean) =>
        setCheckedIds((prev) => value ? [...prev, spherical.id] : prev.filter((id) => id !== spherical.id))

    const shouldDisplayNoImageBadge = !spherical.image
    const shouldDisplayNoThumbnailOrMapBadge = !spherical.thumbnail && !spherical.mapId
    const shouldDisplayNoPositionBadge = Boolean(spherical.mapId) && !spherical.mapPosition
    const hasThumbnail = Boolean(spherical.thumbnail)
    const hasMap = Boolean(spherical.mapId)

    return (
        <TableRow onClick={() => setSphericalId(`${spherical.gameId}_${spherical.id}`)} className="cursor-pointer">
            <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
            </TableCell>
            <TableCell className="max-w-20 truncate">
                <OpenFirestoreDoc docRef={getSphericalRef(spherical.gameId, spherical.id)} />
                {spherical.id}
            </TableCell>
            <TableCell>{spherical.game?.title || spherical.gameId}</TableCell>
            <TableCell>
                <Badge variant={STATUS_TO_BADGE_VARIANT[spherical.status]}>
                    {spherical.status}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    {shouldDisplayNoImageBadge && <Badge variant="red">No image</Badge>}
                    {shouldDisplayNoThumbnailOrMapBadge && <Badge variant="red">No thumbnail or map</Badge>}
                    {shouldDisplayNoPositionBadge && <Badge variant="red">No position</Badge>}
                    {hasThumbnail && <Badge variant={RESOURCE_BADGE_VARIANT.THUMBNAIL}>Thumbnail</Badge>}
                    {hasMap && <Badge variant={RESOURCE_BADGE_VARIANT.MAP}>Map</Badge>}
                </div>
            </TableCell>
            <TableCell className="font-medium">{getDateString(spherical.createdAt?.toDate())}</TableCell>
        </TableRow>
    )
}
