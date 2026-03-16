import { type DocumentReference } from "@firebase/firestore"
import { SquareArrowUpRightIcon } from "lucide-react"
import { Link } from "@/i18n/routing"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { getFirestoreDocumentUrl } from "@/utils/firebase"

const OpenFirestoreDoc = ({ docRef }: { docRef: DocumentReference }) => {
    return (
        <Button variant="marathon-link" size="icon-sm" asChild>
            <Link onClick={(e) => e.stopPropagation()} href={getFirestoreDocumentUrl(docRef)} target="_blank" rel="noopener noreferrer" className="ml-2">
                <SquareArrowUpRightIcon className="size-4" />
            </Link>
        </Button>
    )
}

export default OpenFirestoreDoc
