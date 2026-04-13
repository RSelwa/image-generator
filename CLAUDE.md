# Project context

This project is a game made in Next.js, it's the same style as the geo guessr but in video games. We're working with firebase, NextJs, Shadcn and tailwind. We have multiples entities: users, games, sphericals (uni rectangular images), flats images, maps, etc...

# Bash commands

- pnpm --filter @repo/front build: Build the front
- pnpm build:libs: Build all libs of the monorepo and install local dependencies
- pnpm lint: run the linter

# Code style

- For jobs, don't clean dockerfile
- In front, if you want to have a page that take the full height, use the class `h-full-height` instead of `h-[calc(...)]`
- In test wait for url in "" instead of anti slash
- Use pnpm instead of npm
- Never do non null assertion
- in e2e tests, never use text selector
- in test, use firebase admin sdk instead of custom helpers
- in tests, use page instead of browser
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
