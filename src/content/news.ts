import type { Bi } from "@/lib/i18n";

export type NewsCategory = "admissions" | "courses" | "partnerships" | "campus" | "careers";

export type NewsLink = { label: Bi; href: string };

export type NewsItem = {
  slug: string;
  date: string;
  pinned?: boolean;
  category: NewsCategory;
  title: Bi;
  summary: Bi;
  body: { en: string[]; zh: string[] };
  links?: NewsLink[];
};

export const categoryLabel: Record<NewsCategory, Bi> = {
  admissions: { en: "Admissions", zh: "招生" },
  courses: { en: "Courses", zh: "課程" },
  partnerships: { en: "Partnerships", zh: "國際合作" },
  campus: { en: "Campus", zh: "校園" },
  careers: { en: "Careers", zh: "職涯" },
};

export const news: NewsItem[] = [
  {
    slug: "spring-2027-international",
    date: "2026-08-19",
    pinned: true,
    category: "admissions",
    title: {
      en: "Spring 2027 is open for international applicants",
      zh: "2027 春季班外國學生申請開放",
    },
    summary: {
      en: "International students may apply from 14 September to 14 October 2026.",
      zh: "外國學生報名期間為 2026 年 9 月 14 日至 10 月 14 日。",
    },
    body: {
      en: [
        "The Spring 2027 intake of the MBA in International Management is open to international students. Apply between 14 September and 14 October 2026 through the university’s international application system, and send the documents listed in the admission brochure.",
        "The program is taught entirely in English. Applicants prepare an autobiography and a study plan in English, an English-proficiency certificate (CEFR B2 preferred), two recommendation letters, and any other material that strengthens the file. The brochure is the complete checklist for this round.",
        "Two degree routes are available: the two-year imMBA at Fu Jen, or a dual master’s with the first year in Taiwan and the second year at UM-Flint, KEDGE, or IQS.",
      ],
      zh: [
        "國際經營管理碩士班 2027 春季班開放外國學生申請。報名期間為 2026 年 9 月 14 日至 10 月 14 日，請透過輔大外國學生申請系統線上報名，並依招生簡章備齊文件。",
        "本班全英語授課。申請時請準備英文自傳與讀書計畫、英語能力證明（建議 CEFR B2）、推薦信兩封，以及其他有助審查的資料。完整清單以該梯次簡章為準。",
        "學位路徑有兩種：兩年輔大 imMBA，或第一年在輔大、第二年前往密西根大學 Flint 分校、法國 KEDGE 或西班牙 IQS 的雙碩士。",
      ],
    },
    links: [
      {
        label: { en: "Apply online", zh: "線上報名" },
        href: "http://idsasys.oie.fju.edu.tw/",
      },
      {
        label: { en: "Spring 2027 brochure", zh: "春季班簡章" },
        href: "http://idsa.oie.docs.fju.edu.tw/Spring2027/FJCU_115-2Admission.pdf",
      },
    ],
  },
  {
    slug: "ay116-local-screening",
    date: "2026-08-19",
    pinned: true,
    category: "admissions",
    title: {
      en: "AY116 screening registration: 30 Sep–13 Oct",
      zh: "116 甄試招生報名：2026/09/30–10/13",
    },
    summary: {
      en: "Local applicants register online from 30 September at 10:00 to 13 October at 12:00.",
      zh: "本地生網路報名自 9 月 30 日 10:00 至 10 月 13 日 12:00。",
    },
    body: {
      en: [
        "The AY116 screening intake for local students opens online on 30 September 2026 at 10:00 and closes on 13 October 2026 at 12:00. There is no written exam. The committee reviews the file and then interviews candidates, mainly in English with Chinese as support.",
        "Please prepare the review form, a copy of the national ID and degree certificate, undergraduate transcripts, an autobiography and study plan, one recommendation letter, proof of English, and any other helpful material.",
        "Admitted students may enter in the spring term of this academic year, if they already hold a bachelor’s degree, or in the fall of the following academic year. The interview notice will be posted when the office releases it.",
      ],
      zh: [
        "116 學年度甄試開放本地生網路報名，時間為 2026 年 9 月 30 日 10:00 至 10 月 13 日 12:00。本管道免筆試，先進行書面審查，再以英文為主、中文為輔口試。",
        "請備妥書面資料審查表、身分證與學位證書影本、學士班歷年成績單、自傳暨讀書計畫、推薦信一封、英文能力證明，以及其他有助審查的資料。",
        "錄取後可於該學年度第二學期提早入學（須已取得畢業證書），或於次學年度第一學期入學。口試通知將於所辦公告後公布。",
      ],
    },
    links: [
      {
        label: { en: "Full brochure", zh: "完整簡章" },
        href: "https://exam.fju.edu.tw/admission/251",
      },
    ],
  },
  {
    slug: "career-platform",
    date: "2025-01-30",
    pinned: true,
    category: "careers",
    title: {
      en: "College of Management career platform",
      zh: "管理學院職涯平台・工作職缺",
    },
    summary: {
      en: "Current job openings for College of Management students and alumni are collected on the college career platform.",
      zh: "管理學院學生與校友可於學院職涯平台查看最新工作職缺。",
    },
    body: {
      en: [
        "The College of Management keeps a career platform for job openings aimed at its students and alumni. imMBA students who are exploring roles in international firms, marketing, analytics, or general management should check the latest listings with the college.",
        "Questions about a posting can be directed to the imMBA office or the college career contact named on the listing.",
      ],
      zh: [
        "管理學院職涯平台持續彙整適合本院學生與校友的工作職缺。正在尋找外商、行銷、數據或一般管理工作的 imMBA 同學，可留意學院公布的最新職缺。",
        "對職缺有疑問時，可先寫信給國際經管所辦，或依職缺頁上的學院窗口聯繫。",
      ],
    },
    links: [
      {
        label: { en: "College of Management", zh: "輔大管理學院" },
        href: "https://www.management.fju.edu.tw/",
      },
    ],
  },
  {
    slug: "info-session-recap",
    date: "2026-09-29",
    category: "admissions",
    title: {
      en: "29 September info session: applications open next",
      zh: "9/29 招生說明會重點回顧",
    },
    summary: {
      en: "Chair Yi-Ning Tu walked through the admissions guide, and a first-year student shared how her English grew inside the program.",
      zh: "涂以寧主任說明招生重點，碩一同學也分享全英語環境帶來的英文進步。",
    },
    body: {
      en: [
        "At the 29 September admissions session, imMBA Chair Yi-Ning Tu walked through the admissions guide: the application steps, program resources, and routes for study abroad. She also noted conversations with possible new partner universities in Europe and the United States.",
        "First-year student Zoe described her own file. Her TOEIC score was in the 500s when she applied. After a year of English-taught classes and international classmates, she reached 805. She also shared practical notes on materials and on what helps a file stand out.",
        "Printed admissions guides are available at the imMBA office, LM208-1. Local applications for the AY116 screening run from 30 September to 13 October.",
      ],
      zh: [
        "9 月 29 日招生說明會上，國際經管主任涂以寧說明招生指南，涵蓋申請流程、學程資源與出國進修機會，並分享與歐美潛在新夥伴學校洽談雙碩士的進展。",
        "碩一同學 Zoe 分享自己的申請經驗。她報名時多益約 500 多分，在全英語課堂與國際同學相處一年後，成績來到 805。她也談了備審資料如何呈現個人特點。",
        "招生指南可至 LM208-1 國際經管辦公室索取。116 甄試本地生報名為 9 月 30 日至 10 月 13 日。",
      ],
    },
  },
  {
    slug: "two-degrees",
    date: "2026-09-22",
    category: "partnerships",
    title: {
      en: "Two years, more than one master’s degree",
      zh: "碩士兩年，不只一個學位",
    },
    summary: {
      en: "The 1+1 dual degree can lead to a second master’s in the United States, France, or Spain.",
      zh: "1+1 雙碩士有機會在美國、法國或西班牙再取得一個碩士學位。",
    },
    body: {
      en: [
        "Two years of graduate study at imMBA can stay on the Fu Jen campus, or continue into a second master’s. Unlike a term of exchange, students who meet both universities’ requirements earn two degrees.",
        "Partner schools currently on the dual-degree page are the University of Michigan–Flint, KEDGE Business School (Bordeaux or Marseille), and IQS School of Management in Barcelona.",
        "The 29 September information session in LM202 was the place to ask whether a fully English program, and a second year abroad, fits a particular plan.",
      ],
      zh: [
        "在國際經管的兩年，可以全程留在輔大，也可以接上第二個碩士。這與一學期交換不同：兩邊畢業條件都完成時，可以取得兩個學位。",
        "目前雙碩士合作學校為美國密西根大學 Flint 分校、法國 KEDGE（波爾多或馬賽），以及位於巴塞隆納的 IQS 管理學院。",
        "9 月 29 日中午在 LM202 的說明會，就是用來確認全英語課程與第二年出國是否適合自己的規劃。",
      ],
    },
    links: [
      {
        label: { en: "Dual degree pathways", zh: "跨國雙碩士" },
        href: "/dual-degree",
      },
    ],
  },
  {
    slug: "international-info-session",
    date: "2026-09-15",
    category: "admissions",
    title: {
      en: "An information session for international students",
      zh: "邀請正在考慮 MBA 的國際學生",
    },
    summary: {
      en: "A noon session on 1 October, in English, for applicants with a bachelor’s degree and roughly TOEIC 700 or equivalent.",
      zh: "10 月 1 日中午以英語舉辦說明會，適合已有學士學歷、多益約 700 或同等英語能力者。",
    },
    body: {
      en: [
        "imMBA hosted an information session for international students on 1 October. It was aimed at applicants who hold a bachelor’s degree, or who are in the junior or senior year, and who have a TOEIC score around 700 or an equivalent.",
        "The session, conducted in English, covered the all-English classroom, four scholarship routes, and dual master’s options in the United States, Spain, and France. Registered guests were offered lunch while supplies lasted. The meeting place was emailed after registration closed on 29 September.",
      ],
      zh: [
        "國際經管於 10 月 1 日中午為國際學生舉辦說明會，對象是已取得學士學位，或正在就讀大三、大四，且多益約 700 分或具同等英語能力的同學。",
        "說明會以英語進行，介紹全英語課堂、四項獎學金機會，以及赴美、西、法攻讀雙碩士的路徑。完成報名者可領取限量午餐，地點於 9 月 29 日報名截止後以電子郵件通知。",
      ],
    },
  },
  {
    slug: "two-years-possible",
    date: "2026-09-08",
    category: "admissions",
    title: {
      en: "How much is possible in two years?",
      zh: "碩士兩年，可以有多大可能？",
    },
    summary: {
      en: "An English-taught cohort, classmates from many countries, and a route abroad if you want one.",
      zh: "全英語班級、多國同學，以及想出國時可以接上的路徑。",
    },
    body: {
      en: [
        "imMBA is a fully English-taught MBA. Local and international students share the classroom, often in something close to a one-to-one mix, so cross-cultural work is part of the week rather than a separate activity.",
        "Students who want a second campus can apply for the dual degree or for Fu Jen’s tuition-free exchange. The September information session was organized for anyone still comparing those choices.",
      ],
      zh: [
        "國際經管是全英語授課的 MBA。本地生與國際生合班上課，課堂比例常常接近一比一，跨文化協作是每週功課的一部分。",
        "想換一個校園的同學，可以申請雙碩士，或參加輔大姊妹校的免學費交換。九月的說明會就是為還在比較這些選擇的人準備的。",
      ],
    },
  },
  {
    slug: "ai-product-90-seconds",
    date: "2026-09-02",
    category: "courses",
    title: {
      en: "90 seconds with the professor: AI and product",
      zh: "教授 90 秒｜AI × Product",
    },
    summary: {
      en: "A short introduction to AI-Assisted Digital Product Development, from a business idea to a working product.",
      zh: "用很短的時間介紹「AI 輔助數位產品開發」：從商業點子走到可用的產品。",
    },
    body: {
      en: [
        "AI-Assisted Digital Product Development asks a practical question: starting from a business idea, how can AI help a student build a digital product, even without a coding background?",
        "In a 90-second briefing, the professor outlines the skills the course is designed to leave with business students: framing the product, using AI as a building tool, and judging whether the result solves a real problem.",
      ],
      zh: [
        "「AI 輔助數位產品開發」問的是一件具體的事：從一個商業想法出發，即使沒有寫過程式，AI 如何幫忙把數位產品做出來？",
        "授課教師用約 90 秒說明這門課希望商管學生帶走的能力：定義產品、把 AI 當成開發工具，以及判斷成品是否真的解決問題。",
      ],
    },
    links: [
      {
        label: { en: "Program updates", zh: "學程動態" },
        href: "https://www.facebook.com/profile.php?id=61579964994616",
      },
    ],
  },
  {
    slug: "data-analytics-course",
    date: "2026-08-26",
    category: "courses",
    title: {
      en: "New course: Data Analytics for International Business",
      zh: "新課程｜國際企業數據分析",
    },
    summary: {
      en: "Visualization, statistical analysis, and machine learning applied to international business decisions.",
      zh: "以視覺化、統計分析與機器學習，支援國際企業決策。",
    },
    body: {
      en: [
        "This academic year imMBA adds Data Analytics for International Business. The course works through data visualization, statistical analysis, and machine learning on business problems, with an eye on decisions that cross markets.",
        "Together with AI-Assisted Digital Product Development, it is the program’s response to the skills managers are now expected to have: see a pattern in data, and turn an idea into something that can be tried.",
      ],
      zh: [
        "本學年國際經管開設「國際企業數據分析」，內容包含資料視覺化、統計分析與機器學習，並把這些工具用在跨市場的商業問題上。",
        "它與「AI 輔助數位產品開發」互為一組：一邊練習從資料裡看見趨勢，一邊練習把想法做成可以試用的產品。",
      ],
    },
  },
  {
    slug: "ai-product-course",
    date: "2026-08-19",
    category: "courses",
    title: {
      en: "New course: AI-Assisted Digital Product Development",
      zh: "新課程｜AI 輔助數位產品開發",
    },
    summary: {
      en: "Product design, web development, and data management for business students building a working digital product.",
      zh: "商管學生學習產品設計、網頁開發與資料管理，並完成一個可用的數位產品。",
    },
    body: {
      en: [
        "The new course AI-Assisted Digital Product Development is for students who want to turn a business idea into a working digital product. Coding experience is not the entry ticket.",
        "Classes cover product design, web development, and data management. The point is judgment as much as tools: what should be built, for whom, and how to tell whether it works.",
      ],
      zh: [
        "新課「AI 輔助數位產品開發」給想把商業想法做成可用數位產品的同學。沒有寫過程式，也可以修這門課。",
        "課程涵蓋產品設計、網頁開發與資料管理。重點不只是工具，也包括判斷：該做什麼、做給誰，以及如何知道它是否有用。",
      ],
    },
  },
  {
    slug: "summer-pause",
    date: "2026-08-05",
    category: "campus",
    title: { en: "Summer pause", zh: "暑假暫停辦公一週" },
    summary: {
      en: "The imMBA office closed for the university’s August recess and reopened on 17 August.",
      zh: "配合學校八月暑假，所辦暫停一週，8 月 17 日恢復辦公。",
    },
    body: {
      en: [
        "Each August, Fu Jen takes a one-week summer recess. During the 2026 break the imMBA office was closed, and mail received that week was answered after the office reopened on 17 August.",
        "For current opening questions, write to imMBA@mail.fju.edu.tw or call +886 2 2905 2750.",
      ],
      zh: [
        "輔仁大學每年八月有一週暑假。2026 年這段期間國際經管辦公室暫停辦公，期間來信於 8 月 17 日恢復後回覆。",
        "若要確認目前洽公時間，請寫信至 imMBA@mail.fju.edu.tw，或撥 +886 2 2905 2750。",
      ],
    },
  },
  {
    slug: "partner-iqs",
    date: "2026-07-29",
    category: "partnerships",
    title: {
      en: "Partner spotlight: IQS School of Management",
      zh: "合作學校｜IQS 管理學院",
    },
    summary: {
      en: "A second year in Barcelona, in industrial management or digital international marketing, with a tuition discount under the agreement.",
      zh: "第二年可在巴塞隆納攻讀工業管理或數位國際行銷，合約內享有學費優惠。",
    },
    body: {
      en: [
        "IQS School of Management, in Barcelona, is part of IQS and a founding member of Universitat Ramon Llull. Founded in 1905, it is AACSB-accredited and works across management, technology, and innovation.",
        "imMBA students on the 1+1 pathway may spend the second year in the Master in Industrial Business Management or the Master in International Marketing in a Digital Environment. Degrees are awarded by both universities when both sets of requirements are met. The agreement includes a tuition discount at IQS.",
      ],
      zh: [
        "IQS 管理學院位於巴塞隆納，是 IQS 的一部分，也是拉孟大學的創始成員。學院創於 1905 年，通過 AACSB 認證，教學橫跨管理、科技與創新。",
        "選擇 1+1 的同學，第二年可以攻讀工業企業管理碩士，或數位環境國際行銷碩士。兩邊條件都完成時，兩校各自授與學位。依合約，雙碩士學生在 IQS 可適用學費優惠。",
      ],
    },
  },
  {
    slug: "iajbs-forum",
    date: "2026-07-22",
    category: "campus",
    title: {
      en: "What kind of leaders should a business school form?",
      zh: "快速變化的世界，要培養什麼樣的領導者？",
    },
    summary: {
      en: "Notes from the 2026 IAJBS World Forum on disruption, professional excellence, and the common good.",
      zh: "2026 年耶穌會商管學院世界論壇：在變動之中，把專業與公益放在一起。",
    },
    body: {
      en: [
        "The 2026 World Forum of the International Association of Jesuit Business Schools met under the theme “Disruption as a Catalyst for the Common Good.” Artificial intelligence, sustainability, geopolitics, and global industry were on the table, along with the kind of judgment future managers need.",
        "Fu Jen’s College of Management shares that frame. The aim of imMBA is a graduate who can work across borders and who treats professional skill as a way to contribute, not only to compete.",
      ],
      zh: [
        "2026 年國際耶穌會商管學院聯盟世界論壇以「以斷裂催生公益」為題，討論人工智慧、永續、地緣政治與全球產業，以及未來管理者需要的判斷力。",
        "輔大管理學院認同這個方向。國際經管要培養的，是能跨界工作的畢業生，也是把專業能力用來貢獻、而不只是用來競爭的人。",
      ],
    },
  },
  {
    slug: "cal-poly-pomona",
    date: "2026-07-15",
    category: "partnerships",
    title: {
      en: "A conversation with Cal Poly Pomona",
      zh: "跨過太平洋，再談一個全球夥伴",
    },
    summary: {
      en: "Faculty visited California State Polytechnic University, Pomona, to discuss a possible 1+1 pathway.",
      zh: "管理學院教師訪問加州州立理工大學波莫納分校，討論 1+1 雙碩士的可能。",
    },
    body: {
      en: [
        "Faculty from the College of Management visited California State Polytechnic University, Pomona, a sister school in the California State University system. The talks covered collaboration in general and a possible 1+1 dual master’s for imMBA.",
        "Pomona’s College of Business Administration holds AACSB accreditation in both business and accounting and is known for a learn-by-doing approach. Centers on campus work on customer insight, entrepreneurship, digital innovation, business analytics, and cyber risk. Curriculum alignment and credit transfer are still under discussion.",
      ],
      zh: [
        "管理學院教師前往姊妹校加州州立理工大學波莫納分校。雙方討論一般合作，也討論國際經管 1+1 雙碩士的可能。",
        "該校商學院的商管與會計均通過 AACSB 認證，以做中學著稱，研究與實務中心涵蓋顧客洞察、創業、數位創新、商業分析與網路風險。課程對接與學分抵免仍在討論。",
      ],
    },
  },
  {
    slug: "macquarie-visit",
    date: "2026-07-07",
    category: "partnerships",
    title: {
      en: "Macquarie University visits the college",
      zh: "麥覺理大學來訪，談新的合作",
    },
    summary: {
      en: "A Sydney business school, AACSB and AMBA accredited, discussed a 1+1 degree and student exchange.",
      zh: "這所雪梨的商學院同時具 AACSB 與 AMBA 認證，雙方談了 1+1 與交換。",
    },
    body: {
      en: [
        "Macquarie University visited the College of Management to discuss a 1+1 dual master’s, student exchange, and further work with imMBA. The university sits in Sydney and is widely ranked among the top one percent of universities worldwide.",
        "Its business school holds AACSB and AMBA accreditation, with particular strength in finance, marketing, and business analytics. The visit opened a closer round of talks. It is not yet a signed dual-degree pathway.",
      ],
      zh: [
        "麥覺理大學來訪管理學院，與國際經管討論 1+1 雙碩士、學生交換與後續合作。該校位於雪梨，在多項排名中位於全球前 1%。",
        "其商學院具 AACSB 與 AMBA 認證，財務、行銷與商業分析受到肯定。這次來訪是更具體討論的開始，尚未簽署雙碩士合約。",
      ],
    },
  },
];

export function getNews(slug: string) {
  return news.find((item) => item.slug === slug);
}
