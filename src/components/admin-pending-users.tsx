"use client";

import { reviewAccount, type ReviewState } from "@/app/[lang]/admin/users/actions";
import type { PendingAccount } from "@/lib/auth-access";
import { formatDate, tx, type Lang } from "@/lib/i18n";
import { useActionState } from "react";

const copy: Record<string, { en: string; zh: string }> = {
  invalid_request: { en: "That account could not be updated.", zh: "這個帳號無法更新。" },
  unauthorized: { en: "Sign in again.", zh: "請重新登入。" },
  forbidden: { en: "Only a super admin can change accounts.", zh: "只有超級管理員可以變更帳號。" },
  not_pending: { en: "That account is no longer waiting.", zh: "這個帳號已經不在待核准名單。" },
  save_failed: { en: "The change could not be saved.", zh: "這次變更無法儲存。" },
};

function PendingRow({ lang, person }: { lang: Lang; person: PendingAccount }) {
  const [state, action, pending] = useActionState(reviewAccount, {} as ReviewState);
  const date = person.created_at.slice(0, 10);
  return (
    <li className="rounded-2xl border border-border bg-cream p-5">
      <form
        action={action}
        onSubmit={(event) => {
          const submitter = event.nativeEvent instanceof SubmitEvent ? event.nativeEvent.submitter : null;
          if (!(submitter instanceof HTMLButtonElement) || submitter.value !== "reject") return;
          const confirmed = window.confirm(
            tx(lang, {
              en: "Reject this account and delete it?",
              zh: "要拒絕並刪除這個帳號嗎？",
            }),
          );
          if (!confirmed) event.preventDefault();
        }}
      >
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="id" value={person.id} />
        <p className="font-semibold text-ink">{person.email ?? tx(lang, { en: "No email", zh: "沒有電子郵件" })}</p>
        {/^\d{4}-\d{2}-\d{2}/.test(date) ? <p className="mt-1 text-sm text-muted-foreground">{formatDate(lang, date)}</p> : null}
        {state.error ? <p className="mt-3 text-sm text-burgundy">{tx(lang, copy[state.error] ?? copy.save_failed)}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            name="intent"
            value="approve"
            disabled={pending}
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {tx(lang, { en: "Approve", zh: "核准" })}
          </button>
          <button
            type="submit"
            name="intent"
            value="reject"
            disabled={pending}
            className="inline-flex h-11 items-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {tx(lang, { en: "Reject", zh: "拒絕" })}
          </button>
        </div>
      </form>
    </li>
  );
}

export function AdminPendingUsers({ lang, people }: { lang: Lang; people: PendingAccount[] }) {
  if (people.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        {tx(lang, { en: "No accounts are waiting for approval.", zh: "目前沒有待核准的帳號。" })}
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {people.map((person) => (
        <PendingRow key={person.id} lang={lang} person={person} />
      ))}
    </ul>
  );
}
