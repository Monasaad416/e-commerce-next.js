import { API_URLS } from "@/app/Services/Urls"
import { useLocaleStore } from "@/stores/localeStore"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { getTranslations } from "next-intl/server"


export const auth = betterAuth({
  emailAndPassword: {
    enabled: false,
  },
  hooks: {
    async before(ctx) {

      const local = useLocaleStore.getState()
      const API_URL = API_URLS.AUTHENTECATEION.LOGIN(local.lang)

      const credentials = (ctx.body as unknown) as {
        email: string
        password: string
      }

      if (credentials?.email && credentials?.password) {
              const t = await getTranslations("auth")
        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json",
                      "Accept": "application/json"},
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.message ?? t("Invalid_Credentials"))
          }

          const data = await res.json()

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            authToken: data.token,
          }
        } catch (error: unknown) {
          throw new Error(
            error instanceof Error ? error.message : t("authentication_failed")
          )
        }
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [nextCookies()],
})