"use client"

import { MODAL_KEYS, MODAL_TYPES_VALUES } from "@/constants/mapping"
import { useGetSphericalInfiniteQuery } from "@/redux/api/admin"
import { useQueryState } from "nuqs"

const Page = () => {
  const [, setModalId] = useQueryState(MODAL_KEYS.ID)
  const [, setModalType] = useQueryState(MODAL_KEYS.MODAL_TYPE)

  const { data, isLoading } = useGetSphericalInfiniteQuery()

  const spherical = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <h1>Spherical</h1>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {isLoading && <li>Loading...</li>}

        {spherical?.map(({ image, id }) => {
          return (
            <li
              key={id}
              className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100"
              onClick={() => {
                setModalId(id)
                setModalType(MODAL_TYPES_VALUES.SPHERICAL)
              }}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default Page
