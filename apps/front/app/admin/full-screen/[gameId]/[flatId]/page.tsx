import { FlatFullScreen } from "@/components/full-screen-spherical"

const Page = async ({
  params
}: {
  params: Promise<{ gameId: string, flatId: string }>
}) => {
  const { flatId: id, gameId } = await params

  return (

    <FlatFullScreen {...{ id, gameId }} />
  )
}

export default Page
