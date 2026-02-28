import { getDateString } from "@repo/common"
import { type SphericalEntity } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { type Dispatch, type SetStateAction } from "react"
import OpenFirestoreDoc from "@/components/open-firestore"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"
import { getSphericalRef } from "@/constants/db-refs"
import { QUERY_PARAMS, STATUS_TO_BADGE_VARIANT } from "@/constants/mapping"

export const SphericalRow = ({ spherical, checkedIds, setCheckedIds }: {
    spherical: SphericalEntity
    checkedIds: string[]
    setCheckedIds: Dispatch<SetStateAction<string[]>>
}) => {
    const [_, setSphericalId] = useQueryState(QUERY_PARAMS.SPHERICAL_ID)

    const checked = checkedIds.includes(spherical.id)
    const onCheckedChange = (value: boolean) =>
        setCheckedIds((prev) => value ? [...prev, spherical.id] : prev.filter((id) => id !== spherical.id))

    return (
        <TableRow onClick={() => setSphericalId(`${spherical.gameId}_${spherical.id}`)} className="cursor-pointer">
            <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
            </TableCell>
            <TableCell className="truncate lg:w-auto w-14">
                {spherical.id}
                <OpenFirestoreDoc docRef={getSphericalRef(spherical.gameId, spherical.id)} />
            </TableCell>
            <TableCell>{spherical.game?.title || spherical.gameId}</TableCell>
            <TableCell>
                <Badge variant={STATUS_TO_BADGE_VARIANT[spherical.status]}>
                    {spherical.status}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    {!spherical.image && <Badge variant="red">No image</Badge>}
                    {!spherical.mapId && <Badge variant="red">No map</Badge>}
                    {!spherical.mapPosition && <Badge variant="red">No position</Badge>}
                </div>
            </TableCell>
            <TableCell className="font-medium">{getDateString(spherical.createdAt?.toDate())}</TableCell>
        </TableRow>
    )
}
