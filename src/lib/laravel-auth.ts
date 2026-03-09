import { API_URLS } from "@/app/Services/Urls"

interface LoginResponse {
  user: { id: number; email: string; name: string }
  token: string
}

interface AuthResult {
  data: LoginResponse | null
  error: string | null
}

export async function laravelSignIn(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(API_URLS.AUTHENTECATEION.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { data: null, error: data?.message ?? "Invalid credentials" }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: "Network error" }
  }
}

export async function laravelSignUp(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(API_URLS.AUTHENTECATEION.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { data: null, error: data?.message ?? "Registration failed" }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: "Network error" }
  }
}