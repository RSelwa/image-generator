import {  onDocumentDeleted } from "firebase-functions/firestore"

export const {{FUNCTION_NAME}} = onDocumentDeleted(
  "{{DOCUMENT_PATH}}",
  async (event) => {}
)
