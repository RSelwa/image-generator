const PNPM = "/home/debian/.nvm/versions/node/v24.14.1/bin/pnpm"
const FRONT_START = "-F @repo/front start"

module.exports = {
  apps: [
    {
      name: "prod",
      cwd: "/var/www/prod",
      script: PNPM,
      args: FRONT_START,
      env: { PORT: 3000 },
    },
    {
      name: "dev",
      cwd: "/var/www/dev",
      script: PNPM,
      args: FRONT_START,
      env: { PORT: 3001 },
    },
  ],
}
