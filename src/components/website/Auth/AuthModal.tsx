"use client"

import { useState, useEffect, useRef, JSX } from "react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/authStore"

/* ── Types ── */
type AuthMode = "login" | "signup"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: AuthMode
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

/* ── Eye Icon ── */
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
)

/* ── Google Icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

/* ── Field Component ── */
import React from "react"
import { API_URLS } from "@/app/Services/Urls"


interface FieldProps {
  label: string
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  suffix?: React.ReactNode
  isRTL?: boolean
}

function Field({ label, id, type = "text", value, onChange, error, suffix, isRTL = false }: FieldProps): JSX.Element {
  const [focused, setFocused] = useState(false)

  const handleChange = (v: string) => {
    onChange(v)
  }

  const handleBlur = () => {
    setFocused(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "inherit" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          dir={isRTL ? "rtl" : "ltr"}
          style={{
            width: "100%",
            padding: "11px 14px",
            paddingRight: suffix && !isRTL ? 42 : 14,
            paddingLeft: suffix && isRTL ? 42 : 14,
            border: `1.5px solid ${error ? "#ef4444" : focused ? "#111" : "#e5e7eb"}`,
            borderRadius: 10, fontSize: 14, fontFamily: "inherit",
            outline: "none", background: focused ? "#fff" : "#fafafa", color: "#111",
            boxShadow: focused ? "0 0 0 3px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.15s", boxSizing: "border-box",
            textAlign: isRTL ? "right" : "left",
          }}
        />
        {suffix && (
          <div style={{
            position: "absolute",
            right: isRTL ? "auto" : 12,
            left: isRTL ? 12 : "auto",
            top: "50%", transform: "translateY(-50%)",
            color: "#9ca3af", cursor: "pointer",
          }}>
            {suffix}
          </div>
        )}
      </div>
      {/*animated error message */}
      {error && (
        <span style={{
          fontSize: 12, color: "#ef4444",
          animation: "errorIn 0.2s ease",
        }}>
          {error}
        </span>
      )}
    </div>
  )
}

/* ── Main Modal ── */
export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("Auth")
  const isRTL = locale === "ar"

  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [errors, setErrors] = useState<FormErrors>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  const setToken = useAuthStore((state) => state.setToken)
  const setAuthEmail = useAuthStore((state) => state.setEmail)
  const setName = useAuthStore((state) => state.setName)
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated)


  // Sync mode with prop
  useEffect(() => { setMode(defaultMode) }, [defaultMode])

  // Reset on mode switch
  useEffect(() => {
    setErrors({})
    setGlobalError(null)
    setPassword("")
    setConfirmPassword("")
    setSuccess(false)
  }, [mode])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!email) e.email = t("email_required")
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t("email_invalid")
    if (!password) e.password = t("password_required")
    else if (password.length < 8) e.password = t("password_min")
    if (mode === "signup") {

      if (password !== confirmPassword) e.confirmPassword = t("passwords_no_match")
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGlobalError(null)


   if (mode === "login") {
  const res = await fetch(API_URLS.AUTHENTECATEION.LOGIN(locale), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const result = await res.json()  //named "result" to avoid any conflict

  if (!res.ok) {
    setGlobalError(result?.message ?? t("authentication_failed"))
    return
  }

  // Laravel returns { id, email, name, token } at root level
  setToken(result.token)
  setName(result.name ?? null)
  setEmail(result.email)
  setHasHydrated(true)

  setSuccess(true)
  setTimeout(() => {
    onClose()
    router.push(`/${locale}`)
    router.refresh()
  }, 900)
}
     else {
      const { error } = await authClient.signUp.email(
        { email, password, name: "User" },
        {
          onSuccess: () => {
            setSuccess(true)
            setTimeout(() => { setMode("login"); setSuccess(false) }, 1400)
          },
          onError: (ctx) => setGlobalError(ctx.error.message ?? t("signup_failed")),
        }
      )
      if (error) setGlobalError(error.message ?? t("signup_failed"))
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({ provider: "google" })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        .auth-overlay { animation: fadeIn 0.2s ease; }
        .auth-modal  { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        .submit-btn:hover:not(:disabled) { background:#222 !important; transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,0.2) !important; }
        .google-btn:hover  { background:#f3f4f6 !important; }
        .close-btn:hover   { background:rgba(255,255,255,0.25) !important; }
        .switch-link { cursor:pointer; font-weight:600; color:#111; text-decoration:underline; text-underline-offset:2px; }
        .switch-link:hover { color:#555; }
        .success-check { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn { from { transform:scale(0) } to { transform:scale(1) } }
      `}</style>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="auth-overlay"
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, fontFamily: "'Sora', sans-serif",
        }}
      >
        {/* Modal */}
        <div
          className="auth-modal"
          style={{
            background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420,
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)", overflow: "hidden", position: "relative",
          }}
        >
          {/* Close */}
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: isRTL ? "auto" : 16,  // LTR → top right
                left:  isRTL ? 16 : "auto", zIndex: 10,
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.8)", fontSize: 20, lineHeight: 1,
              transition: "background 0.15s",
            }}
          >×</button>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #111 0%, #374151 100%)",
            padding: "28px 32px 24px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}/>
            <div style={{ position: "absolute", bottom: -30, left: -10, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }}/>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              {t("welcome")}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>
              {mode === "login" ? t("sign_in_title") : t("sign_up_title")}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1.5px solid #f3f4f6" }}>
            {(["login", "signup"] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: "14px 0", border: "none", background: "transparent",
                  fontSize: 14, fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? "#111" : "#9ca3af", cursor: "pointer", fontFamily: "inherit",
                  borderBottom: mode === m ? "2px solid #111" : "2px solid transparent",
                  marginBottom: -1.5, transition: "all 0.2s",
                }}
              >
                {m === "login" ? t("sign_in") : t("sign_up")}
              </button>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div className="success-check" style={{
                  width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4",
                  border: "2px solid #86efac", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 16px", fontSize: 24,
                }}>✓</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "#111" }}>
                  {mode === "login" ? t("welcome_back") : t("account_created")}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                  {mode === "login" ? t("redirecting") : t("switching_to_login")}
                </div>
              </div>
            ) : (
              <>
                {globalError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 20 }}>
                    {globalError}
                  </div>
                )}

                {/* Google */}
                <button
                  type="button"
                  className="google-btn"
                  onClick={handleGoogleSignIn}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "11px 0", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff",
                    fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer", fontFamily: "inherit",
                    marginBottom: 20, transition: "all 0.15s",
                  }}
                >
                  <GoogleIcon /> {t("continue_with_google")}
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: "#f3f4f6" }}/>
                  <span style={{ fontSize: 12, color: "#d1d5db", fontWeight: 500 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "#f3f4f6" }}/>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {mode === "signup" && (
                    <Field label={t("full_name")} id="name" value={name} onChange={setName} error={errors.name}/>
                  )}
                  <Field label={t("email")} id="email" type="email" value={email} onChange={setEmail} error={errors.email} isRTL={isRTL}/>
                  <Field
                    label={t("password")} id="password"
                    type={showPw ? "text" : "password"}
                    value={password} onChange={setPassword} error={errors.password}
                    suffix={<span onClick={() => setShowPw(p => !p)}><EyeIcon open={showPw}/></span>}
                    isRTL={isRTL}
                  />
                  {mode === "signup" && (
                    <Field
                      label={t("confirm_password")} id="confirmPw"
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword}
                      suffix={<span onClick={() => setShowConfirmPw(p => !p)}><EyeIcon open={showConfirmPw}/></span>}
                      isRTL={isRTL}
                    />
                  )}
                  {mode === "login" && (
                    <div style={{ textAlign: "right", marginTop: -8 }}>
                      <span style={{ fontSize: 13, color: "#6b7280", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>
                        {t("forgot_password")}
                      </span>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "13px 0",
                      background: loading ? "#d1d5db" : "#111",
                      color: "#fff", border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "inherit", marginTop: 4, letterSpacing: 0.3,
                      transition: "all 0.15s",
                    }}
                  >
                    {loading
                      ? (mode === "login" ? t("signing_in") : t("creating_account"))
                      : (mode === "login" ? t("sign_in") : t("sign_up"))
                    }
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
                  {mode === "login" ? t("no_account") : t("have_account")}{" "}
                  <span className="switch-link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                    {mode === "login" ? t("sign_up") : t("sign_in")}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
