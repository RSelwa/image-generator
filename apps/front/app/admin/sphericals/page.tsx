"use client"

import { useGetSphericalInfiniteQuery } from "@/redux/api/admin"
import "@photo-sphere-viewer/core/index.css"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

const Page = () => {
  const { data, isLoading, fetchNextPage } = useGetSphericalInfiniteQuery()

  const spherical = data?.pages.flat() || []

  return (
    <main className="p-2 h-full-height-admin">
      <h1>Spherical</h1>
      <ul className="grid grid-cols-5">
        {isLoading && <li>Loading...</li>}

        {spherical?.map(({ image, id }) => {
          return (
            <li key={id}>
              <img src={image} alt="" />

              <ReactPhotoSphereViewer
                hideNavbarButton={true}
                navbar={false}
                src={`/api/proxy-image?url=${encodeURIComponent(image)}`}
                height={"100px"}
                width={"200px"}
              />
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default Page
