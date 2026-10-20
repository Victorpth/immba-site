import type { Bi, Lang } from "@/lib/i18n";

/** Public list collected from the imMBA announcements page. AdminNews edits this same shape. */
export const announcementSource = "https://www.management.fju.edu.tw/subweb/immba/news.php";

export type AnnouncementStatus = "published" | "draft";

/** Snapshot of the last time the two languages were known to match. */
export type AnnouncementSync = {
  source: Lang;
  sourceTitle: string;
  sourceContent: string;
  targetTitle: string;
  targetContent: string;
};

export type Announcement = {
  id: string;
  date: string;
  linkUrl: string;
  order: number;
  status: AnnouncementStatus;
  title: Bi;
  content: Bi;
  /** Optional photo, stored with the announcement. Older records omit it. */
  imageUrl?: string;
  sync: AnnouncementSync | null;
};

const detail = "https://www.management.fju.edu.tw/subweb/immba/news-detail.php?NID=";

export function announcementHref(item: Pick<Announcement, "linkUrl">) {
  return item.linkUrl;
}

export function isSynchronized(item: Pick<Announcement, "title" | "content" | "sync">) {
  const sync = item.sync;
  if (!sync) return false;
  const target: Lang = sync.source === "en" ? "zh" : "en";
  if (!item.title.en.trim() || !item.title.zh.trim() || !item.content.en.trim() || !item.content.zh.trim()) {
    return false;
  }
  return (
    item.title[sync.source] === sync.sourceTitle &&
    item.content[sync.source] === sync.sourceContent &&
    item.title[target] === sync.targetTitle &&
    item.content[target] === sync.targetContent
  );
}

export function sortAnnouncements(items: Announcement[]) {
  return [...items].sort((a, b) => a.order - b.order || b.date.localeCompare(a.date));
}

export function publishedAnnouncements(items: Announcement[]) {
  return sortAnnouncements(items).filter((item) => item.status === "published");
}

function notice(order: number, id: string, date: string, title: Bi, content: Bi): Announcement {
  return {
    id,
    date,
    linkUrl: `${detail}${id}`,
    order,
    status: "published",
    title,
    content,
    sync: {
      source: "zh",
      sourceTitle: title.zh,
      sourceContent: content.zh,
      targetTitle: title.en,
      targetContent: content.en,
    },
  };
}

/** Order matches the source list: pinned items first, then newest. */
export const announcements: Announcement[] = [
  {
    id: "learned-2026-10-13",
    date: "2026-10-13",
    linkUrl: "",
    order: 0,
    status: "published",
    title: {
      en: "What I learned today",
      zh: "今天學到的事",
    },
    content: {
      en: "Today I learned that a website is only as clear as the facts you put on the right page. The official imMBA site already holds the rankings, the fees, the dates, and the partner rules. My job was to place those facts on the matching pages, and to leave a gap when the official page itself is empty.\n\nI also learned that readable is not a new color. Larger type, stronger contrast, a menu that stays on one line, and a way to skip to the content make the same information easier to use. Publishing is the last step: the public link changes only after the work is sent live.",
      zh: "今天我學到，網站清不清楚，取決於資料有沒有放在對的頁面。官方 imMBA 網站已經寫了排名、學雜費、日期和合作學校的規則。我要做的是把這些事實放到對應的頁面；官方頁面本身是空的，就不要自己補內容。\n\n我也學到，好讀不是換一個顏色。字大一點、對比清楚、選單保持一行，再加上可以跳到主要內容，同一份資料就比較好用。發布是最後一步：內容送上線之後，公開連結才會更新。",
    },
    sync: {
      source: "en",
      sourceTitle: "What I learned today",
      sourceContent:
        "Today I learned that a website is only as clear as the facts you put on the right page. The official imMBA site already holds the rankings, the fees, the dates, and the partner rules. My job was to place those facts on the matching pages, and to leave a gap when the official page itself is empty.\n\nI also learned that readable is not a new color. Larger type, stronger contrast, a menu that stays on one line, and a way to skip to the content make the same information easier to use. Publishing is the last step: the public link changes only after the work is sent live.",
      targetTitle: "今天學到的事",
      targetContent:
        "今天我學到，網站清不清楚，取決於資料有沒有放在對的頁面。官方 imMBA 網站已經寫了排名、學雜費、日期和合作學校的規則。我要做的是把這些事實放到對應的頁面；官方頁面本身是空的，就不要自己補內容。\n\n我也學到，好讀不是換一個顏色。字大一點、對比清楚、選單保持一行，再加上可以跳到主要內容，同一份資料就比較好用。發布是最後一步：內容送上線之後，公開連結才會更新。",
    },
  },
  notice(
    1,
    "2689",
    "2026-08-19",
    {
      en: "(imMBA) AY116 screening registration: 30 Sep–13 Oct 2026",
      zh: "(國際經管-全英MBA) 116甄試招生報名：2026/09/30-10/13",
    },
    {
      en: "Local applicants can register for AY116 screening from 30 September, 10:00, through 13 October, 12:00, 2026.",
      zh: "本地生 116 學年度甄試網路報名自 2026 年 9 月 30 日 10:00 起，至 10 月 13 日 12:00 止。",
    },
  ),
  notice(
    2,
    "2905",
    "2025-01-30",
    {
      en: "College of Management career platform: job openings",
      zh: "管理學院職涯平台-工作職缺",
    },
    {
      en: "The College of Management career platform lists current job openings for students and graduates.",
      zh: "管理學院職涯平台刊登學生與校友可申請的工作職缺。",
    },
  ),
  notice(
    3,
    "3417",
    "2026-10-13",
    {
      en: "Next stop, Australia’s Gold Coast? imMBA talks with Bond University about a 1+1 dual degree",
      zh: "下一站，澳洲黃金海岸？國際經管 imMBA 與 Bond University 洽談 1+1 雙碩士合作",
    },
    {
      en: "imMBA is in talks with Bond University on Australia’s Gold Coast about a 1+1 dual master’s pathway.",
      zh: "國際經管 imMBA 正與澳洲黃金海岸的 Bond University 洽談 1+1 雙碩士途徑。",
    },
  ),
  notice(
    4,
    "3415",
    "2026-10-06",
    {
      en: "imMBA × UT Dallas: dual-degree cooperation continues",
      zh: "國際經管 imMBA × UT Dallas｜雙碩士合作持續推進中",
    },
    {
      en: "Cooperation on the dual master’s with the University of Texas at Dallas is still moving forward.",
      zh: "與美國德州大學達拉斯分校的雙碩士合作持續推進。",
    },
  ),
  notice(
    5,
    "3412",
    "2026-09-29",
    {
      en: "29 September info session recap: applications open next",
      zh: "9/29 招生說明會重點回顧｜明天開始報名！",
    },
    {
      en: "The 29 September information session reviewed the program, and applications open the following day.",
      zh: "9 月 29 日招生說明會回顧學程重點，報名於隔日開放。",
    },
  ),
  notice(
    6,
    "3408",
    "2026-09-22",
    {
      en: "Two years of a master’s, more than one degree",
      zh: "碩士兩年，不只一個學位。",
    },
    {
      en: "Two years in the master’s can lead to more than one degree through the dual-degree pathways.",
      zh: "碩士兩年，透過雙學位途徑可以取得不只一個學位。",
    },
  ),
  notice(
    7,
    "3402",
    "2026-09-15",
    {
      en: "Do you know an international student who is considering an MBA?",
      zh: "你身邊有正在考慮 MBA 的國際學生嗎？",
    },
    {
      en: "The office is asking the community to share the program with international students who are considering an MBA.",
      zh: "所辦邀請大家把學程分享給正在考慮就讀 MBA 的國際學生。",
    },
  ),
  notice(
    8,
    "3396",
    "2026-09-08",
    {
      en: "How much is possible in two years of a master’s?",
      zh: "碩士兩年，可以有多大可能？",
    },
    {
      en: "This note looks at what a student can take on during two years of the master’s.",
      zh: "這則公告談碩士兩年可以展開的學習可能。",
    },
  ),
  notice(
    9,
    "3391",
    "2026-09-02",
    {
      en: "90 Seconds with the Professor: AI × Product",
      zh: "90 Seconds with the Professor｜AI × Product",
    },
    {
      en: "A short faculty video introduces the AI and product theme in the program.",
      zh: "教師短片介紹學程中的 AI 與產品主題。",
    },
  ),
  notice(
    10,
    "3387",
    "2026-08-26",
    {
      en: "New Course Spotlight: Data Analytics for International Business",
      zh: "New Course Spotlight｜Data Analytics for International Business",
    },
    {
      en: "Data Analytics for International Business is highlighted as a new course.",
      zh: "新課程焦點：國際企業資料分析。",
    },
  ),
  notice(
    11,
    "3383",
    "2026-08-19",
    {
      en: "New Course Spotlight: AI-Assisted Digital Product Development",
      zh: "New Course Spotlight｜AI-Assisted Digital Product Development",
    },
    {
      en: "AI-Assisted Digital Product Development is highlighted as a new course.",
      zh: "新課程焦點：AI 輔助數位產品開發。",
    },
  ),
  notice(
    12,
    "3379",
    "2026-08-05",
    {
      en: "Summer Pause",
      zh: "Summer Pause｜暑假暫停辦公",
    },
    {
      en: "The office pauses regular service over the summer and will post the date it reopens.",
      zh: "所辦暑假期間暫停一般辦公，重新開放日期將另行公告。",
    },
  ),
  notice(
    13,
    "3376",
    "2026-07-29",
    {
      en: "Partner Spotlight: IQS School of Management",
      zh: "Partner Spotlight｜IQS School of Management",
    },
    {
      en: "A partner spotlight introduces IQS School of Management.",
      zh: "夥伴學校介紹：IQS School of Management。",
    },
  ),
  notice(
    14,
    "3370",
    "2026-07-22",
    {
      en: "When the world moves quickly, what kind of leaders should we form?",
      zh: "當世界快速變動，我們該培養什麼樣的領導者？",
    },
    {
      en: "The office asks what kind of leaders the program should form while the world changes quickly.",
      zh: "當世界快速變動，學程思考該培養什麼樣的領導者。",
    },
  ),
  notice(
    15,
    "3367",
    "2026-07-15",
    {
      en: "Across the Pacific: one more international partner",
      zh: "跨越太平洋，國際夥伴再＋1",
    },
    {
      en: "imMBA has added another international partner across the Pacific.",
      zh: "國際經管在太平洋另一端再增加一所國際夥伴學校。",
    },
  ),
  notice(
    16,
    "3366",
    "2026-07-07",
    {
      en: "Deeper international cooperation, and a possible dual master’s",
      zh: "深化國際合作，共創雙碩士學習機會",
    },
    {
      en: "Talks on deeper international cooperation include a possible dual master’s.",
      zh: "國際合作正在深化，並討論雙碩士的學習機會。",
    },
  ),
  notice(
    17,
    "3364",
    "2026-06-30",
    {
      en: "Business Insights: What are the SDGs?",
      zh: "Business Insights｜什麼是 SDGs？",
    },
    {
      en: "A short briefing explains what the Sustainable Development Goals are.",
      zh: "短文說明什麼是永續發展目標（SDGs）。",
    },
  ),
  notice(
    18,
    "3362",
    "2026-06-24",
    {
      en: "An international classroom, backed by a four-palmes business school",
      zh: "國際經管(imMBA)國際化學習環境，來自四棕櫚葉管理學院的支持",
    },
    {
      en: "The international classroom is supported by a business school ranked at four palmes.",
      zh: "國際化學習環境來自四棕櫚葉管理學院的支持。",
    },
  ),
  notice(
    19,
    "3360",
    "2026-06-16",
    {
      en: "If you had two weeks out of the classroom, what would you do?",
      zh: "如果有兩週不用進教室，你會拿來做什麼？",
    },
    {
      en: "The note invites students to imagine what they would do with two weeks outside the classroom.",
      zh: "這則公告邀請同學想像，若有兩週不用進教室，會如何運用。",
    },
  ),
  notice(
    20,
    "3356",
    "2026-06-09",
    {
      en: "A strong start, and a reason to remember Fu Jen",
      zh: "卓越啟程，也別忘了偶爾「熊熊」想起輔大",
    },
    {
      en: "A welcome to a strong start, and a reminder to remember Fu Jen.",
      zh: "以卓越啟程歡迎同學，也提醒大家偶爾想起輔大。",
    },
  ),
];
