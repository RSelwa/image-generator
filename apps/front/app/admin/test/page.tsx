"use client"

import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { URL_DEV_TEST } from "@/constants/api"
import { useGetSphericalByIdQuery } from "@/redux/api/spherical"

const Page = () => {
  const gameId = "100377"
  const sphericalId = "1raXNUPqIiEfTCdKD6D3"

  const handleClick = async () => {
    const x = await fetch(`${URL_DEV_TEST}/test-create-game`)
    const res = await x.json()

    console.log(res)
  }

  const { data } = useGetSphericalByIdQuery({
    gameId,
    id: sphericalId,
  })

  return (
    <main>
      <Button onClick={handleClick}>Test Admin Page</Button>
      {data && data.storageImage && (
        <>
          <img src={data.storageImage} alt="" />
          <ReactSphere src={data.storageImage} />
        </>
      )}
    </main>
  )
}

export default Page
