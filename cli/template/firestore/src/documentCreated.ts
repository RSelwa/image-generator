import { onDocumentCreated } from "firebase-functions/firestore"

export const {{FUNCTION_NAME}} = onDocumentCreated(
  "{{DOCUMENT_PATH}}",
  async (event) => {}
)
