import JoinLobbyHandler from "@/components/join-lobby-handler"

const Page = async ({ params }: {
  params: Promise<{ code: string }>
}) => {
  const { code } = await params

  return <JoinLobbyHandler code={code} />
}

export default Page
