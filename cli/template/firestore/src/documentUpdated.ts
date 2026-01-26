import {  onDocumentUpdated } from "firebase-functions/firestore"

export const {{FUNCTION_NAME}} = onDocumentUpdated(
  "{{DOCUMENT_PATH}}",
  async (event) => {}
)