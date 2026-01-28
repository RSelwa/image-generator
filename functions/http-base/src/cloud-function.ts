import { region } from "@repo/providers/config"
import { stripe } from "@repo/providers/stripe"
import { https } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"
import { defineSecret } from "firebase-functions/params"

const apiKey = defineSecret("SECRET_KEY")
const stripeApiKey = defineSecret("STRIPE_API_KEY")

/**
 * This is a bit of a contrived example, and by no means a demonstration of how
 * to implement a counter efficiently.
 *
 * I tend to name v2 functions exports using snake_case because cloud run in CGP
 * overview will ignore casing.
 */
export const http_endpoint = https.onRequest(
  {
    secrets: [apiKey, stripeApiKey],
    region: region as string,
    cors: "*",
    labels: {
      service: "update-counter",
      "service-type": "http",
      "service-version": "v2",
    },
  },
  async (_, res) => {
    try {
      const customers = await stripe.customers.list({ limit: 2 })

      res.status(200).json({
        customers,
        apiKey: apiKey.value(),
        stripeApiKey: stripeApiKey.value(),
      })
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        throw new HttpsError("internal", error.message)
      }

      new HttpsError("cancelled", "Request was cancelled")
    }
  },
)

export const http_endpoint_authenticated = https.onCall(
  {
    region: region as string,
    secrets: [stripeApiKey],
    cors: "*",
    labels: {
      service: "update-counter",
      "service-type": "http",
      "service-version": "v2",
    },
  },
  async ({ auth }) => {
    try {
      if (!auth?.uid) {
        throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      const customers = await stripe.customers.list({ limit: 2 })

      return { customers }
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        throw new HttpsError("internal", error.message)
      }

      new HttpsError("cancelled", "Request was cancelled")
    }
  },
)
