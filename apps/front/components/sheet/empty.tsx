import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export const EmptySheet = () => (
    <SheetContent>
        <SheetHeader>
            <SheetTitle>No data found</SheetTitle>
            <SheetDescription>No data found for the id given.</SheetDescription>
        </SheetHeader>
    </SheetContent>
)