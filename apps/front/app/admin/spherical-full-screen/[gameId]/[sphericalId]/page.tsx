import { SphericalFullScreen } from "@/components/full-screen-spherical"

const Page = async ({
  params
}: {
  params: Promise<{ gameId: string, sphericalId: string }>
}) => {
  const { sphericalId: id, gameId } = await params

  return (
    <SphericalFullScreen {...{ id, gameId }} />
  )
}

export default Page
