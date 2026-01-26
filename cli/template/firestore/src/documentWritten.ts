import {  onDocumentWritten } from "firebase-functions/firestore"

export const {{FUNCTION_NAME}} = onDocumentWritten(
  "{{DOCUMENT_PATH}}",
  async (event) => {}
)