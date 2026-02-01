import { useQueryState } from "nuqs"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { QUERY_PARAMS } from "@/constants/mapping"

type Props = {
  children?: React.ReactNode
  title: string
}

const AdminHeader = ({ children, title }: Props) => {
  const [search, setSearch] = useQueryState(QUERY_PARAMS.SEARCH, { defaultValue: "" })

  return (
    <header className="py-4 sticky top-0 flex items-center w-full justify-between bg-white z-20">
      <div className="flex items-center justify-end gap-4">
        <h1 className="text-2xl font-semibold whitespace-nowrap">
          {title}
        </h1>
        <Input
          type="search"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-end gap-4">{children}</div>
    </header>
  )
}

export default AdminHeader
