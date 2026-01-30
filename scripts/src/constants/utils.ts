import { parseArgs } from "@std/cli/parse-args"

export function getFlag(name: string, defaultValue?: string): string {
  const args = parseArgs(Deno.args)

  return args[name] ?? defaultValue
}
