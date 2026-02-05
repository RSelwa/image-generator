# Bash commands

- pnpm --filter @repo/front build: Build the front
- pnpm run typecheck: Run the typechecker
- pnpm build:libs: Build all libs of the monorepo
- pnpm lint: run the linter

# Code style

- Use pnpm instead of npm
- use container in css if possible
- in the libs/schemas, use instead "~/zod" of "../zod"
- use {condition && <code>} and {!condition && <fallback>} instead of {condition ? <code> : <fallback> }
- use || instead of ??
- use mocked urls from "libs/common/src/constants/testing.ts" when need mockedImages in tests
- use if instead of switch
- use () => x instead of () => { return x } when possible
- use Arrow functions
- use visible/invisible instead of opacity
- Use CONSTANTS instead of "variable" when possible
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow

- Always launch commands from root directory and use '--filter <package>' when launching commands
- Be sure to typecheck when you’re done making a series of code changes
<!-- - Be sure to format everything with 'pnpm lint:fix' -->
