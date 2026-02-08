import { useQueryState } from "nuqs"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { QUERY_PARAMS } from "@/constants/mapping"

type Props = {
  children?: React.ReactNode
  title: string
  numberOfElements?: number
}

const AdminHeader = ({ children, title, numberOfElements }: Props) => {
  const [search, setSearch] = useQueryState(QUERY_PARAMS.SEARCH, { defaultValue: "" })

  return (
    <header className="py-4 sticky top-0 flex flex-col md:flex-row items-center w-full justify-between z-20">
      <div className="flex flex-col md:flex-row items-center justify-end gap-4">
        <h1 className="text-2xl font-semibold whitespace-nowrap">
          {title}
          {numberOfElements && (
            <span className="ml-2 text-neutral-400">
              (
              {numberOfElements}
              )

            </span>
          )}
        </h1>
        <Input
          type="search"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-end gap-4">{children}</div>
    </header>
  )
}

export default AdminHeader
