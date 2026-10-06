"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tx, type Lang } from "@/lib/i18n";
import { FormEvent, useState } from "react";

const topics = [
  { value: "admissions", en: "Admissions", zh: "招生" },
  { value: "dual", en: "Dual degree", zh: "跨國雙碩士" },
  { value: "curriculum", en: "Curriculum", zh: "課程" },
  { value: "student", en: "Current student", zh: "在學生事務" },
  { value: "other", en: "Something else", zh: "其他" },
];

type Fields = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const empty: Fields = { name: "", email: "", topic: "admissions", message: "" };

export function ContactForm({ lang }: { lang: Lang }) {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [reference, setReference] = useState<string | null>(null);

  function validate(next: Fields) {
    const found: Partial<Record<keyof Fields, string>> = {};
    if (next.name.trim().length < 2) {
      found.name = tx(lang, { en: "Please enter your name.", zh: "請填寫姓名。" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      found.email = tx(lang, { en: "Enter a valid email address.", zh: "請填寫有效的電子郵件。" });
    }
    if (next.message.trim().length < 12) {
      found.message = tx(lang, {
        en: "Write a short message so the office knows how to help.",
        zh: "請用幾句話說明想詢問的事情。",
      });
    }
    return found;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const topic = topics.find((item) => item.value === fields.topic);
    const stamp = new Date();
    const ref = `IM${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}-${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}`;
    const body = [
      `Reference: ${ref}`,
      `Name: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      `Topic: ${topic ? topic[lang] : fields.topic}`,
      "",
      fields.message.trim(),
    ].join("\n");
    const mailto = `mailto:imMBA@mail.fju.edu.tw?subject=${encodeURIComponent(`[imMBA] ${topic ? topic.en : "Inquiry"} · ${fields.name.trim()}`)}&body=${encodeURIComponent(body)}`;
    setReference(ref);
    window.location.href = mailto;
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-border bg-cream p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-burgundy uppercase">
          {tx(lang, { en: "Ready to send", zh: "已備好信件" })}
        </p>
        <h2 className="mt-3 text-3xl text-ink">
          {tx(lang, { en: "Your note is addressed to the office.", zh: "這封信已寫給所辦。" })}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {tx(lang, {
            en: "If your email app did not open, write to imMBA@mail.fju.edu.tw and include this reference so the office can match your message.",
            zh: "若郵件軟體沒有自動開啟，請寄信至 imMBA@mail.fju.edu.tw，並附上這組編號，方便所辦對應您的來信。",
          })}
        </p>
        <p className="mt-5 font-display text-2xl text-ink">{reference}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 h-10 px-4"
          onClick={() => {
            setReference(null);
            setFields(empty);
          }}
        >
          {tx(lang, { en: "Write another message", zh: "再寫一封" })}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-cream p-6 sm:p-8">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">{tx(lang, { en: "Name", zh: "姓名" })}</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            value={fields.name}
            aria-invalid={Boolean(errors.name)}
            className="h-10"
            onChange={(event) => setFields({ ...fields, name: event.target.value })}
          />
          {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{tx(lang, { en: "Email", zh: "電子郵件" })}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            aria-invalid={Boolean(errors.email)}
            className="h-10"
            onChange={(event) => setFields({ ...fields, email: event.target.value })}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="topic">{tx(lang, { en: "Topic", zh: "事由" })}</Label>
          <select
            id="topic"
            name="topic"
            value={fields.topic}
            onChange={(event) => setFields({ ...fields, topic: event.target.value })}
            className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic[lang]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">{tx(lang, { en: "Message", zh: "訊息" })}</Label>
          <Textarea
            id="message"
            name="message"
            rows={6}
            value={fields.message}
            aria-invalid={Boolean(errors.message)}
            onChange={(event) => setFields({ ...fields, message: event.target.value })}
          />
          {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
        </div>
        <Button type="submit" className="h-11 px-5">
          {tx(lang, { en: "Email the imMBA office", zh: "寄信給國際經管辦公室" })}
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tx(lang, {
            en: "The button opens your email app with this message addressed to imMBA@mail.fju.edu.tw. Nothing is stored on this website.",
            zh: "按下按鈕後會開啟您的郵件軟體，收件者為 imMBA@mail.fju.edu.tw。本網站不會儲存這封信。",
          })}
        </p>
      </div>
    </form>
  );
}
