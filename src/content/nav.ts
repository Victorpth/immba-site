import type { Bi } from "@/lib/i18n";

export type NavLink = {
  href: string;
  label: Bi;
  description: Bi;
};

export type NavGroup = {
  label: Bi;
  href: string;
  links: NavLink[];
};

export const navGroups: NavGroup[] = [
  {
    label: { en: "About", zh: "關於本班" },
    href: "/about",
    links: [
      {
        href: "/about",
        label: { en: "Overview and Ranking", zh: "特色與排名" },
        description: {
          en: "AACSB accreditation, Eduniversal ranking, and the international classroom.",
          zh: "AACSB 認證、Eduniversal 排名，以及國際化的課堂。",
        },
      },
      {
        href: "/environment",
        label: { en: "Our Learning Environment", zh: "我們的學習環境" },
        description: {
          en: "Campus, Guoxi Building, and how to reach Fu Jen.",
          zh: "校園、國璽樓，以及前往輔大的方式。",
        },
      },
      {
        href: "/regulations",
        label: { en: "Regulations", zh: "規定及辦法" },
        description: {
          en: "Program committees and the student scholarship regulations.",
          zh: "學程會議、課委會與學生獎助學金辦法。",
        },
      },
    ],
  },
  {
    label: { en: "Admissions", zh: "招生" },
    href: "/admissions",
    links: [
      {
        href: "/admissions",
        label: { en: "How to apply", zh: "招生資訊" },
        description: {
          en: "International and local application routes, documents, and deadlines.",
          zh: "外國學生與本地生管道、應備文件與報名期限。",
        },
      },
      {
        href: "/scholarships",
        label: { en: "Tuition and scholarships", zh: "學雜費與獎助學金" },
        description: {
          en: "Fees, government scholarships, and the President’s Scholarship.",
          zh: "學雜費、政府獎學金與校長獎學金。",
        },
      },
    ],
  },
  {
    label: { en: "Academics", zh: "教學" },
    href: "/curriculum",
    links: [
      {
        href: "/curriculum",
        label: { en: "Curriculum", zh: "課程與修業" },
        description: {
          en: "42 credits, prerequisites, waivers, and the current timetable.",
          zh: "42 學分、基礎課程、抵免與最新課表。",
        },
      },
      {
        href: "/faculty",
        label: { en: "Faculty", zh: "師資" },
        description: {
          en: "Full-time and part-time professors and their fields.",
          zh: "專任與兼任教師及其研究領域。",
        },
      },
      {
        href: "/guide",
        label: { en: "imMBA guide", zh: "imMBA 全攻略" },
        description: {
          en: "Who the program is for, and how the first year is organized.",
          zh: "適合誰就讀，以及碩一如何安排。",
        },
      },
      {
        href: "/graduation",
        label: { en: "Graduation", zh: "畢業與離校" },
        description: {
          en: "Thesis defense, formats, and leaving-school steps.",
          zh: "論文口試、格式與離校流程。",
        },
      },
    ],
  },
  {
    label: { en: "Global", zh: "國際" },
    href: "/dual-degree",
    links: [
      {
        href: "/dual-degree",
        label: { en: "Dual degree", zh: "跨國雙碩士" },
        description: {
          en: "1+1 pathways with UM-Flint, KEDGE, and IQS.",
          zh: "與 UM-Flint、KEDGE、IQS 的 1+1 雙碩士。",
        },
      },
      {
        href: "/exchange",
        label: { en: "Exchange", zh: "海外交換" },
        description: {
          en: "Tuition-free exchange across Fu Jen’s partner universities.",
          zh: "輔大全球姊妹校免學費交換。",
        },
      },
      {
        href: "/highlights",
        label: { en: "Highlights", zh: "活動集錦" },
        description: {
          en: "Sessions, new courses, and partnership stories.",
          zh: "說明會、新課程與國際合作故事。",
        },
      },
    ],
  },
];

export const utilityLinks: NavLink[] = [
  {
    href: "/news",
    label: { en: "Announcements", zh: "公告" },
    description: { en: "Announcements and stories.", zh: "最新公告與報導。" },
  },
  {
    href: "/downloads",
    label: { en: "Downloads", zh: "表格下載" },
    description: { en: "Brochures, rules, and thesis forms.", zh: "簡章、修業規則與論文表格。" },
  },
  {
    href: "/marketplace",
    label: { en: "Marketplace", zh: "教材市集" },
    description: { en: "Where to find books and course materials.", zh: "書籍與上課教材的取得方式。" },
  },
  {
    href: "/events",
    label: { en: "Events", zh: "活動" },
    description: { en: "Sessions, visits, and gatherings.", zh: "說明會、來訪與活動。" },
  },
  {
    href: "/contact",
    label: { en: "Contact", zh: "聯絡我們" },
    description: { en: "Office, phone, and inquiry form.", zh: "辦公室、電話與聯絡表單。" },
  },
];

export type PrimaryItem = {
  label: Bi;
  href: string;
  children?: NavLink[];
};

/** Main bar. Items with children open a dropdown on hover or click. */
export const primaryMenu: PrimaryItem[] = [
  {
    label: { en: "About", zh: "關於" },
    href: "/about",
    children: [navGroups[0].links[0], navGroups[0].links[1]],
  },
  {
    label: { en: "Admissions", zh: "招生" },
    href: "/admissions",
    children: navGroups[1].links,
  },
  {
    label: { en: "Courses", zh: "課程" },
    href: "/curriculum",
    children: [navGroups[2].links[0], navGroups[2].links[3]],
  },
  {
    label: { en: "Faculty", zh: "師資" },
    href: "/faculty",
  },
  {
    label: { en: "imMBA Guide", zh: "imMBA 全攻略" },
    href: "/guide",
  },
  {
    label: { en: "Dual Degree", zh: "雙碩士" },
    href: "/dual-degree",
  },
  {
    label: { en: "Overseas Exchange", zh: "海外交換" },
    href: "/exchange",
  },
  { label: utilityLinks[2].label, href: utilityLinks[2].href },
  { label: utilityLinks[3].label, href: utilityLinks[3].href },
  { label: utilityLinks[0].label, href: utilityLinks[0].href },
  { label: utilityLinks[1].label, href: utilityLinks[1].href },
];

/** Flat bar from the homepage section plan, in that order. */
export const mainNav: NavLink[] = [
  {
    href: "/about",
    label: { en: "Intro", zh: "簡介" },
    description: {
      en: "AACSB accreditation, Eduniversal ranking, and the international classroom.",
      zh: "AACSB 認證、Eduniversal 排名，以及國際化的課堂。",
    },
  },
  {
    href: "/admissions",
    label: { en: "Admissions", zh: "招生" },
    description: {
      en: "International and local application routes, documents, and deadlines.",
      zh: "外國學生與本地生管道、應備文件與報名期限。",
    },
  },
  {
    href: "/curriculum",
    label: { en: "Curriculum", zh: "課程" },
    description: {
      en: "42 credits, prerequisites, waivers, and the current timetable.",
      zh: "42 學分、基礎課程、抵免與最新課表。",
    },
  },
  {
    href: "/faculty",
    label: { en: "Faculty", zh: "師資" },
    description: {
      en: "Full-time and part-time professors and their fields.",
      zh: "專任與兼任教師及其研究領域。",
    },
  },
  {
    href: "/guide",
    label: { en: "imMBA Guide", zh: "全攻略" },
    description: {
      en: "Who the program is for, and how the first year is organized.",
      zh: "適合誰就讀，以及碩一如何安排。",
    },
  },
  {
    href: "/graduation",
    label: { en: "Graduation", zh: "畢業" },
    description: {
      en: "Thesis defense, formats, and leaving-school steps.",
      zh: "論文口試、格式與離校流程。",
    },
  },
  {
    href: "/dual-degree",
    label: { en: "Dual Degree", zh: "雙碩士" },
    description: {
      en: "1+1 pathways with UM-Flint, KEDGE, and IQS.",
      zh: "與 UM-Flint、KEDGE、IQS 的 1+1 雙碩士。",
    },
  },
  {
    href: "/exchange",
    label: { en: "Overseas Exchange", zh: "海外交換" },
    description: {
      en: "Tuition-free exchange across Fu Jen’s partner universities.",
      zh: "輔大全球姊妹校免學費交換。",
    },
  },
  utilityLinks[2],
  utilityLinks[3],
  utilityLinks[0],
  utilityLinks[1],
];

export const searchablePages: NavLink[] = [
  ...new Map(
    [...navGroups.flatMap((group) => group.links), ...utilityLinks, ...mainNav].map((link) => [link.href, link]),
  ).values(),
];
