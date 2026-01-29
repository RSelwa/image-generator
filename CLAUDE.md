# Bash commands

- pnpm --filter @repo/front build: Build the front
- pnpm run typecheck: Run the typechecker
- pnpm build:libs: Build all libs of the monorepo

# Code style

- Use pnpm instead of npm
- Use CONSTANTS instead of "variable" when possible
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow

- Always launch commands from root directory and use '--filter <package>' when launching commands
- Be sure to typecheck when you’re done making a series of code changes
- Be sure to format everything with 'pnpm format'
