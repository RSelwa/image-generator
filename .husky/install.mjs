if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
  process.exit(0)
}

// eslint-disable-next-line antfu/no-top-level-await
const husky = (await import("husky")).default

console.info(husky())
