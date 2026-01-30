import { cancel, confirm, isCancel, select, text } from "@clack/prompts";
import { consola } from "consola";
import { colors } from "consola/utils";
import { TYPE_FUNCTIONS } from "./constant.mts";
import {
  camelToDash,
  copyTemplateFiles,
  updateFirebaseConfigFile,
  updateMainPackageFile,
} from "./utils.mts";

export const FIRESTORE_EVENTS = {
  documentCreated: "documentCreated",
  documentUpdated: "documentUpdated",
  documentDeleted: "documentDeleted",
  documentWritten: "documentWritten",
} as const;

export async function createFirebaseTriggeredFunction(name: string) {
  const event = await select({
    message: "Select a Firestore event",
    options: [
      {
        label: "document Created",
        value: FIRESTORE_EVENTS.documentCreated,
        hint: "Triggered when a document is created",
      },
      {
        label: "document Updated",
        value: FIRESTORE_EVENTS.documentUpdated,
        hint: "Triggered when a document is updated",
      },
      {
        label: "document Deleted",
        value: FIRESTORE_EVENTS.documentDeleted,
        hint: "Triggered when a document is deleted",
      },
      {
        label: "document Written",
        value: FIRESTORE_EVENTS.documentWritten,
        hint: "Triggered when a document is created, updated, or deleted",
      },
    ],
    maxItems: 1,
  });

  const documentPath = await text({
    message: "Enter the Firestore document path (e.g., 'users/{userId}')",
  });

  if (isCancel(event) || isCancel(documentPath)) {
    cancel("👋 Operation cancelled by user, see you soon");

    return process.exit(0);
  }

  const forceDashCase = await confirm({
    message: `Should the function name be in dash case? (${camelToDash(name)})`,
    initialValue: true,
  });

  if (isCancel(forceDashCase)) {
    cancel("👋 Operation cancelled by user, see you soon");

    return process.exit(0);
  }

  await copyTemplateFiles(name, TYPE_FUNCTIONS.firestore, event, {
    forceDashCase,
    documentPath,
  });
  updateFirebaseConfigFile(name);
  updateMainPackageFile(name);

  consola.info(
    `Creating cloud function: ${colors.blueBright(name)} of type ${colors.greenBright(TYPE_FUNCTIONS.firestore)} with event ${colors.yellow(event)}`,
  );
}
