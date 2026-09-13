"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/authStore";
import { API_URLS } from "@/app/Services/Urls";
import getAuthHeaders from "@/lib/getAuthHeaders";

/* ── Helpers ── */
/**
 * Pulls a human-readable error from a Laravel JSON response.
 * Laravel validation shapes: { message, errors: { field: [msg, ...] } }
 * Plain failures: { message: "..." }
 */
function extractApiError(body: unknown): string | null {
    if (!body || typeof body !== "object") return null;
    const b = body as {
        message?: string;
        errors?: Record<string, string[] | string>;
    };
    if (b.errors && typeof b.errors === "object") {
        const first = Object.values(b.errors).find(Boolean);
        if (Array.isArray(first) && first[0]) return String(first[0]);
        if (typeof first === "string" && first) return first;
    }
    if (typeof b.message === "string" && b.message) return b.message;
    return null;
}

/* ── Types ── */
type AuthMode = "login" | "signup";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: AuthMode;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

/* ── Google Icon ── */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

/* ── Field ── */
interface FieldProps {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    autoComplete?: string;
    suffix?: React.ReactNode;
    isRTL?: boolean;
}

function Field({
    label,
    id,
    type = "text",
    value,
    onChange,
    error,
    autoComplete,
    suffix,
    isRTL = false,
}: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-xs font-semibold uppercase tracking-wide text-shop_light_gray/80"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={cn(
                        "w-full rounded-xl border bg-shop_dark_primary/70 px-4 py-2.5 text-sm text-shop_white placeholder:text-shop_light_gray/40 transition-colors focus:outline-none focus:ring-2",
                        error
                            ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30"
                            : "border-shop_light_gray/20 focus:border-shop_secondary/60 focus:ring-shop_secondary/30",
                        suffix && (isRTL ? "ps-11" : "pe-11"),
                    )}
                />
                {suffix ? (
                    <div
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 text-shop_light_gray/60 transition-colors hover:text-shop_light_gray",
                            isRTL ? "start-3" : "end-3",
                        )}
                    >
                        {suffix}
                    </div>
                ) : null}
            </div>
            {error ? (
                <span className="text-xs text-red-300">{error}</span>
            ) : null}
        </div>
    );
}

/* ── Main Modal ── */
export default function AuthModal({
    isOpen,
    onClose,
    defaultMode = "login",
}: AuthModalProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Auth");
    const isRTL = locale === "ar";

    const [mode, setMode] = useState<AuthMode>(defaultMode);
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const setToken = useAuthStore((s) => s.setToken);
    const setAuthEmail = useAuthStore((s) => s.setEmail);
    const setAuthName = useAuthStore((s) => s.setName);
    const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

    // Sync mode with prop when reopened in a different mode
    useEffect(() => {
        setMode(defaultMode);
    }, [defaultMode]);

    // Reset on mode switch
    useEffect(() => {
        setErrors({});
        setGlobalError(null);
        setName("");
        setPassword("");
        setConfirmPassword("");
        setSuccess(false);
    }, [mode]);

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!email) e.email = t("email_required");
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = t("email_invalid");
        if (!password) e.password = t("password_required");
        else if (password.length < 8) e.password = t("password_min");
        if (mode === "signup") {
            if (!name.trim()) e.name = t("name_required");
            if (password !== confirmPassword)
                e.confirmPassword = t("passwords_no_match");
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setGlobalError(null);

        try {
            if (mode === "login") {
                const res = await fetch(API_URLS.AUTHENTECATEION.LOGIN(locale), {
                    method: "POST",
                    headers: getAuthHeaders() as HeadersInit,
                    body: JSON.stringify({ email, password }),
                });

                const result = await res.json();

                if (!res.ok) {
                    setGlobalError(
                        extractApiError(result) ?? t("authentication_failed"),
                    );
                    return;
                }

                setToken(result.token);
                setAuthName(result.name ?? null);
                setAuthEmail(result.email);
                setHasHydrated(true);

                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    router.push(`/${locale}`);
                    router.refresh();
                }, 900);
            } else {
                // Signup → Laravel /register (same contract as /login).
                // Laravel commonly validates `password_confirmation`, so we
                // send it even though the UI already checks equality.
                const res = await fetch(API_URLS.AUTHENTECATEION.REGISTER(locale), {
                    method: "POST",
                    headers: getAuthHeaders() as HeadersInit,
                    body: JSON.stringify({
                        name: name.trim(),
                        email,
                        password,
                        password_confirmation: confirmPassword,
                    }),
                });

                const result = await res.json();

                if (!res.ok) {
                    setGlobalError(
                        extractApiError(result) ?? t("signup_failed"),
                    );
                    return;
                }

                // If the backend returned a token, log the user in immediately.
                if (result?.token) {
                    setToken(result.token);
                    setAuthName(result.name ?? name.trim() ?? null);
                    setAuthEmail(result.email ?? email);
                    setHasHydrated(true);

                    setSuccess(true);
                    setTimeout(() => {
                        onClose();
                        router.push(`/${locale}`);
                        router.refresh();
                    }, 900);
                } else {
                    // No token → account created, switch to login tab.
                    setSuccess(true);
                    setTimeout(() => {
                        setMode("login");
                        setSuccess(false);
                    }, 1400);
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            setGlobalError(
                mode === "login" ? t("authentication_failed") : t("signup_failed"),
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({ provider: "google" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                dir={isRTL ? "rtl" : "ltr"}
                showCloseButton={false}
                className={cn(
                    "w-full max-w-md overflow-hidden border-shop_light_gray/15 bg-shop_dark_primary p-0 text-shop_white shadow-2xl shadow-black/40",
                    "sm:max-w-md",
                )}
            >
                {/* Accessible title/description (visually replaced by our custom header) */}
                <DialogTitle className="sr-only">
                    {mode === "login" ? t("sign_in_title") : t("sign_up_title")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {t("welcome")}
                </DialogDescription>

                {/* Header — gold accent gradient */}
                <div className="relative overflow-hidden bg-gradient-to-br from-shop_medium_primary via-shop_dark_primary to-shop_black px-8 py-7">
                    <div className="pointer-events-none absolute -top-16 end-[-3rem] h-40 w-40 rounded-full bg-shop_secondary/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-14 start-[-2rem] h-32 w-32 rounded-full bg-shop_secondary/10 blur-3xl" />

                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-shop_secondary/80">
                        {t("welcome")}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-shop_white">
                        {mode === "login" ? t("sign_in_title") : t("sign_up_title")}
                    </h2>

                    {/* Close button (themed, replaces default DialogClose icon) */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 end-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-shop_light_gray/20 bg-shop_dark_primary/50 text-shop_light_gray transition-colors hover:border-shop_secondary/40 hover:text-shop_white"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        >
                            <line x1="5" y1="5" x2="19" y2="19" />
                            <line x1="19" y1="5" x2="5" y2="19" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-shop_light_gray/10 bg-shop_dark_primary/60">
                    {(["login", "signup"] as AuthMode[]).map((m) => {
                        const active = mode === m;
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={cn(
                                    "relative flex-1 py-3.5 text-sm font-semibold transition-colors",
                                    active
                                        ? "text-shop_white"
                                        : "text-shop_light_gray/60 hover:text-shop_light_gray",
                                )}
                            >
                                {m === "login" ? t("sign_in") : t("sign_up")}
                                <span
                                    className={cn(
                                        "absolute inset-x-6 -bottom-px h-[2px] rounded-full transition-all",
                                        active ? "bg-shop_secondary" : "bg-transparent",
                                    )}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Body */}
                <div className="px-7 pb-8 pt-6 sm:px-8">
                    {success ? (
                        <div className="py-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-950/40 text-emerald-300">
                                <Check className="h-7 w-7" strokeWidth={2.5} />
                            </div>
                            <p className="text-base font-semibold text-shop_white">
                                {mode === "login"
                                    ? t("welcome_back")
                                    : t("account_created")}
                            </p>
                            <p className="mt-2 text-sm text-shop_light_gray/75">
                                {mode === "login"
                                    ? t("redirecting")
                                    : t("switching_to_login")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {globalError ? (
                                <div className="mb-5 rounded-xl border border-red-500/35 bg-red-950/35 px-4 py-2.5 text-sm text-red-200">
                                    {globalError}
                                </div>
                            ) : null}

                            {/* Google */}
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="mb-5 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-shop_light_gray/20 bg-shop_white px-4 py-2.5 text-sm font-semibold text-shop_black shadow-sm transition-colors hover:bg-shop_light_gray"
                            >
                                <GoogleIcon />
                                {t("continue_with_google")}
                            </button>

                            {/* Divider */}
                            <div className="mb-5 flex items-center gap-3">
                                <div className="h-px flex-1 bg-shop_light_gray/15" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-shop_light_gray/50">
                                    OR
                                </span>
                                <div className="h-px flex-1 bg-shop_light_gray/15" />
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                                noValidate
                            >
                                {mode === "signup" ? (
                                    <Field
                                        label={t("full_name")}
                                        id="name"
                                        value={name}
                                        onChange={setName}
                                        error={errors.name}
                                        autoComplete="name"
                                        isRTL={isRTL}
                                    />
                                ) : null}

                                <Field
                                    label={t("email")}
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={setEmail}
                                    error={errors.email}
                                    autoComplete="email"
                                    isRTL={isRTL}
                                />

                                <Field
                                    label={t("password")}
                                    id="password"
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={setPassword}
                                    error={errors.password}
                                    autoComplete={
                                        mode === "login"
                                            ? "current-password"
                                            : "new-password"
                                    }
                                    isRTL={isRTL}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((p) => !p)}
                                            aria-label={showPw ? "Hide" : "Show"}
                                            className="p-0.5"
                                        >
                                            {showPw ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    }
                                />

                                {mode === "signup" ? (
                                    <Field
                                        label={t("confirm_password")}
                                        id="confirmPw"
                                        type={showConfirmPw ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        error={errors.confirmPassword}
                                        autoComplete="new-password"
                                        isRTL={isRTL}
                                        suffix={
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPw((p) => !p)
                                                }
                                                aria-label={
                                                    showConfirmPw ? "Hide" : "Show"
                                                }
                                                className="p-0.5"
                                            >
                                                {showConfirmPw ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        }
                                    />
                                ) : null}

                                {mode === "login" ? (
                                    <div
                                        className={cn(
                                            "-mt-1 flex",
                                            isRTL ? "justify-start" : "justify-end",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-shop_light_gray/75 underline-offset-2 transition-colors hover:text-shop_secondary hover:underline"
                                        >
                                            {t("forgot_password")}
                                        </button>
                                    </div>
                                ) : null}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 h-11 rounded-xl bg-shop_secondary text-sm font-semibold tracking-wide text-shop_dark_primary hover:bg-shop_secondary/90 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {mode === "login"
                                                ? t("signing_in")
                                                : t("creating_account")}
                                        </>
                                    ) : mode === "login" ? (
                                        t("sign_in")
                                    ) : (
                                        t("sign_up")
                                    )}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-shop_light_gray/75">
                                {mode === "login"
                                    ? t("no_account")
                                    : t("have_account")}{" "}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMode(mode === "login" ? "signup" : "login")
                                    }
                                    className="font-semibold text-shop_secondary underline-offset-2 hover:underline"
                                >
                                    {mode === "login" ? t("sign_up") : t("sign_in")}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
