"use client";

import { requestPasswordReset, signIn, signUp, updatePassword, type AuthFormState } from "@/lib/auth-actions";
import { tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";

const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

const submitClass =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-50";

const copy: Record<string, { en: string; zh: string }> = {
  invalid_credentials: { en: "That email or password is not right.", zh: "電子郵件或密碼不正確。" },
  invalid_email: { en: "Enter a valid email address.", zh: "請輸入有效的電子郵件。" },
  weak_password: { en: "Use a password of at least 8 characters.", zh: "密碼至少需要 8 個字元。" },
  password_mismatch: { en: "The two passwords do not match.", zh: "兩次輸入的密碼不相同。" },
  auth_failed: { en: "The request could not be completed. Try again.", zh: "這次無法完成，請再試一次。" },
  check_email: { en: "Check your email to confirm the account. It stays pending until a super admin approves it.", zh: "請到信箱確認帳號。帳號會先保持待核准，直到超級管理員核准。" },
  reset_sent: { en: "If that email has an account, a reset link is on its way.", zh: "如果這個信箱已有帳號，重設連結已經寄出。" },
  reset_session: { en: "Open the reset link from your email, then choose a new password.", zh: "請先打開信裡的重設連結，再設定新密碼。" },
  callback_failed: { en: "That sign-in link has expired. Request a new one.", zh: "這個連結已失效，請重新取得。" },
};

function notice(lang: Lang, state: AuthFormState) {
  const code = state.error ?? state.message;
  if (!code) return null;
  return tx(lang, copy[code] ?? copy.auth_failed);
}

function AuthFields({
  lang,
  next,
  state,
  pending,
  passwordLabel,
  passwordAutoComplete,
  children,
}: {
  lang: Lang;
  next?: string | null;
  state: AuthFormState;
  pending: boolean;
  passwordLabel?: { en: string; zh: string };
  passwordAutoComplete?: string;
  children: ReactNode;
}) {
  const text = notice(lang, state);
  return (
    <div className="site-wrap max-w-xl py-14">
      <input type="hidden" name="lang" value={lang} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="block text-sm font-semibold text-ink">
        {tx(lang, { en: "Email", zh: "電子郵件" })}
        <input name="email" type="email" autoComplete="email" required className={fieldClass} />
      </label>
      {passwordLabel ? (
        <label className="mt-4 block text-sm font-semibold text-ink">
          {tx(lang, passwordLabel)}
          <input name="password" type="password" autoComplete={passwordAutoComplete} required minLength={8} className={fieldClass} />
        </label>
      ) : null}
      {text ? <p className={`mt-4 text-sm ${state.error ? "text-burgundy" : "text-[#1d4f86]"}`}>{text}</p> : null}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={submitClass}>
          {children}
        </button>
      </div>
    </div>
  );
}

export function AuthLoginForm({ lang, next, callbackFailed }: { lang: Lang; next: string | null; callbackFailed: boolean }) {
  const [state, action, pending] = useActionState(signIn, callbackFailed ? { error: "callback_failed" } : {});
  return (
    <form action={action}>
      <AuthFields
        lang={lang}
        next={next}
        state={state}
        pending={pending}
        passwordLabel={{ en: "Password", zh: "密碼" }}
        passwordAutoComplete="current-password"
      >
        {tx(lang, { en: "Sign in", zh: "登入" })}
      </AuthFields>
      <p className="site-wrap -mt-8 flex max-w-xl flex-wrap gap-x-4 gap-y-2 pb-14 text-sm">
        <Link className="underline underline-offset-2" href={withLang(lang, "/forgot-password")}>
          {tx(lang, { en: "Forgot password", zh: "忘記密碼" })}
        </Link>
        <Link className="underline underline-offset-2" href={withLang(lang, "/signup")}>
          {tx(lang, { en: "Create an account", zh: "建立帳號" })}
        </Link>
      </p>
    </form>
  );
}

function PasswordField({
  lang,
  name,
  label,
  autoComplete,
}: {
  lang: Lang;
  name: string;
  label: { en: string; zh: string };
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="mt-4 block text-sm font-semibold text-ink">
      {tx(lang, label)}
      <span className="relative mt-2 block">
        <input
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={8}
          className="w-full rounded-xl border border-input bg-white py-2 pr-20 pl-3 text-sm text-ink outline-none focus:border-burgundy"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-burgundy underline underline-offset-2"
        >
          {visible ? tx(lang, { en: "Hide", zh: "隱藏" }) : tx(lang, { en: "Show", zh: "顯示" })}
        </button>
      </span>
    </label>
  );
}

export function AuthSignupForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(signUp, {});
  const text = notice(lang, state);
  return (
    <form action={action}>
      <div className="site-wrap max-w-xl py-14">
        <input type="hidden" name="lang" value={lang} />
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Email", zh: "電子郵件" })}
          <input name="email" type="email" autoComplete="email" required className={fieldClass} />
        </label>
        <PasswordField lang={lang} name="password" label={{ en: "Password", zh: "密碼" }} autoComplete="new-password" />
        <PasswordField
          lang={lang}
          name="password_confirm"
          label={{ en: "Confirm password", zh: "確認密碼" }}
          autoComplete="new-password"
        />
        {text ? <p className={`mt-4 text-sm ${state.error ? "text-burgundy" : "text-[#1d4f86]"}`}>{text}</p> : null}
        <div className="mt-6">
          <button type="submit" disabled={pending} className={submitClass}>
            {tx(lang, { en: "Create account", zh: "建立帳號" })}
          </button>
        </div>
      </div>
      <p className="site-wrap -mt-8 max-w-xl pb-14 text-sm">
        <Link className="underline underline-offset-2" href={withLang(lang, "/login")}>
          {tx(lang, { en: "Already have an account? Sign in", zh: "已有帳號？前往登入" })}
        </Link>
      </p>
    </form>
  );
}

export function AuthForgotForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  return (
    <form action={action}>
      <AuthFields lang={lang} state={state} pending={pending}>
        {tx(lang, { en: "Send reset link", zh: "寄出重設連結" })}
      </AuthFields>
      <p className="site-wrap -mt-8 max-w-xl pb-14 text-sm">
        <Link className="underline underline-offset-2" href={withLang(lang, "/login")}>
          {tx(lang, { en: "Back to sign in", zh: "返回登入" })}
        </Link>
      </p>
    </form>
  );
}

export function AuthResetForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <form action={action}>
      <div className="site-wrap max-w-xl py-14">
        <input type="hidden" name="lang" value={lang} />
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "New password", zh: "新密碼" })}
          <input name="password" type="password" autoComplete="new-password" required minLength={8} className={fieldClass} />
        </label>
        {notice(lang, state) ? <p className="mt-4 text-sm text-burgundy">{notice(lang, state)}</p> : null}
        <button type="submit" disabled={pending} className={`${submitClass} mt-6`}>
          {tx(lang, { en: "Save password", zh: "儲存密碼" })}
        </button>
      </div>
    </form>
  );
}
