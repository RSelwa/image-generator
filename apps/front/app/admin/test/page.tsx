"use client"

import { Button } from "@/components/ui/button"
import { URL_DEV_TEST } from "@/constants/api"

const Page = () => {
  const handleClick = async () => {
    const x = await fetch(`${URL_DEV_TEST}/test-create-game`)
    const res = await x.json()

    console.log(res)
  }

  return (
    <main>
      <Button onClick={handleClick}>Test Admin Page</Button>
    </main>
  )
}

export default Page
