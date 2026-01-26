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

        {spherical?.map(({ image, id, game, difficulty }) => {
          return (
            <li
              key={id}
              className="relative h-64 cursor-pointer overflow-hidden rounded-xl border border-grey-100"
              onClick={() => {
                setModalId(id)
                setModalType(MODAL_TYPES_VALUES.SPHERICAL)
              }}
            >
              <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between gap-2">
                <span className="inline-flex h-6 items-center rounded-full px-2 align-middle text-xs leading-none focus:outline-hidden uppercase border border-grey-100 bg-transparent backdrop-blur-sm text-neutral-100">
                  {game.title}
                </span>
                <div className="flex gap-2">
                  <span className="h-6 items-center rounded-full px-2 align-middle text-xs leading-none focus:outline-hidden bg-neutral-950 text-white flex gap-1">
                    {difficulty}
                  </span>
                </div>
              </div>
              <img src={image} alt="" className="size-full object-cover" />
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default Page
