import type { Bi } from "@/lib/i18n";

export type FacultyMember = {
  id: string;
  name: string;
  type: "full" | "part";
  rank: Bi;
  education: Bi;
  specialties: Bi;
  email?: string;
  phone?: string;
  office?: string;
  website?: string;
};

export const faculty: FacultyMember[] = [
  {
    id: "yi-ning-tu",
    name: "Yi-Ning Tu",
    type: "full",
    rank: {
      en: "Associate Professor, Chair of imMBA",
      zh: "副教授、國際經營管理碩士班主任",
    },
    education: {
      en: "Ph.D. in Information Management, National Chengchi University",
      zh: "國立政治大學資訊管理博士",
    },
    specialties: {
      en: "Data mining, text mining, artificial intelligence, machine learning, information retrieval",
      zh: "資料探勘、文字探勘、人工智慧、機器學習、資訊檢索",
    },
    email: "082435@mail.fju.edu.tw",
    phone: "Ext. 3988",
    office: "LM208-2",
    website: "https://sites.google.com/view/yiningtu",
  },
  {
    id: "michael-lee",
    name: "Michael T. S. Lee",
    type: "full",
    rank: { en: "Chair Professor", zh: "講座教授" },
    education: {
      en: "Ph.D. in Operations Research and Industrial Engineering, University of Texas at Austin",
      zh: "美國德州大學奧斯汀分校作業研究與工業工程博士",
    },
    specialties: {
      en: "Operations research and industrial engineering",
      zh: "作業研究與工業工程",
    },
    email: "036665@mail.fju.edu.tw",
    phone: "Ext. 2905",
    office: "SL228",
  },
  {
    id: "yaonan-lin",
    name: "Yaonan Lin",
    type: "full",
    rank: { en: "Professor", zh: "教授" },
    education: {
      en: "Ph.D. in Marketing, Golden Gate University",
      zh: "美國金門大學行銷博士",
    },
    specialties: { en: "Marketing management", zh: "行銷管理" },
    email: "065999@mail.fju.edu.tw",
    phone: "Ext. 2735, 2021",
  },
  {
    id: "yu-ming-hsu",
    name: "Yu-Ming Hsu",
    type: "full",
    rank: {
      en: "Associate Professor, Director of the MS Program in Technology Management",
      zh: "副教授、科技管理碩士學位學程主任",
    },
    education: {
      en: "Ph.D. in International Business, National Taiwan University",
      zh: "國立臺灣大學國際企業博士",
    },
    specialties: {
      en: "Marketing, digital marketing, IT marketing, social commerce, international business",
      zh: "行銷管理、數位行銷、資訊科技行銷、社群商務、國際企業",
    },
    email: "155456@mail.fju.edu.tw",
    phone: "Ext. 3977",
    office: "SL225",
  },
  {
    id: "chih-an-lin",
    name: "Chih-An Lin",
    type: "full",
    rank: {
      en: "Associate Professor, Director of the Academic Exchange Center",
      zh: "副教授、學術交流中心主任",
    },
    education: {
      en: "Ph.D. in International Business, National Taiwan University",
      zh: "國立臺灣大學國際企業博士",
    },
    specialties: {
      en: "Supply chain management, media communication, integrated marketing, brand management",
      zh: "供應鏈管理、媒體傳播、整合行銷、品牌管理",
    },
    email: "144629@mail.fju.edu.tw",
    phone: "Ext. 2924",
    office: "SL221",
  },
  {
    id: "kai-ping-huang",
    name: "Kai-Ping Huang",
    type: "full",
    rank: { en: "Associate Professor", zh: "副教授" },
    education: {
      en: "Ph.D. in Business Administration, University of Technology Sydney",
      zh: "澳洲雪梨科技大學企業管理博士",
    },
    specialties: { en: "Business administration", zh: "企業管理" },
    email: "129741@mail.fju.edu.tw",
    phone: "Ext. 2906",
  },
  {
    id: "hsiang-ching-tseng",
    name: "Hsiang-Ching Tseng",
    type: "full",
    rank: { en: "Associate Professor", zh: "副教授" },
    education: {
      en: "Ph.D. in Marketing, National Chengchi University",
      zh: "國立政治大學行銷博士",
    },
    specialties: { en: "Marketing management", zh: "行銷管理" },
    email: "142652@mail.fju.edu.tw",
    phone: "Ext. 2737",
  },
  {
    id: "mei-chun-lin",
    name: "Mei-Chun Lin",
    type: "full",
    rank: { en: "Associate Professor", zh: "副教授" },
    education: {
      en: "Ph.D. in Industrial and Information Management, National Cheng Kung University",
      zh: "國立成功大學工業與資訊管理博士",
    },
    specialties: {
      en: "AI in industry, service marketing, industry analysis, competitive strategy, supply chain",
      zh: "產業 AI 應用、服務行銷、產業分析與競爭策略、供應鏈管理",
    },
    email: "151308@mail.fju.edu.tw",
    phone: "Ext. 2968",
    office: "SL408",
  },
  {
    id: "shu-ling-cheng",
    name: "Shu-Ling Cheng",
    type: "full",
    rank: { en: "Associate Professor", zh: "副教授" },
    education: {
      en: "Ph.D. in Business Administration, National Cheng Kung University",
      zh: "國立成功大學企業管理博士",
    },
    specialties: {
      en: "Strategic management, marketing research, data analysis, international financial management",
      zh: "策略管理、行銷研究、資料分析、國際財務管理",
    },
    email: "151667@mail.fju.edu.tw",
    phone: "Ext. 2725",
    office: "SL211",
  },
  {
    id: "pi-chan-hu",
    name: "Pi-Chan Hu",
    type: "full",
    rank: { en: "Associate Professor", zh: "副教授" },
    education: {
      en: "Ph.D. in Applied Linguistics, National Chengchi University",
      zh: "國立政治大學應用語言學博士",
    },
    specialties: {
      en: "International business negotiation, translation, interpretation, applied and forensic linguistics",
      zh: "國際商務談判、英譯、口譯、應用語言學、司法語言學",
    },
    email: "128144@mail.fju.edu.tw",
    phone: "Ext. 2145",
  },
  {
    id: "tsui-lin-chiang",
    name: "Tsui-Lin Chiang",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Business Administration, Fu Jen Catholic University",
      zh: "輔仁大學企業管理博士",
    },
    specialties: {
      en: "Economics, corporate governance, financial management, investment",
      zh: "經濟學、公司治理、財務管理、投資",
    },
    email: "051266@mail.fju.edu.tw",
    phone: "Ext. 2852",
    office: "SL472",
  },
  {
    id: "shu-wen-lin",
    name: "Shu-wen Lin",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ed.D., School of Education, Durham University",
      zh: "英國杜倫大學教育學院教育博士",
    },
    specialties: {
      en: "English for general and specific purposes, Global Englishes",
      zh: "一般與專業英語、全球英語",
    },
    email: "156503@mail.fju.edu.tw",
    phone: "Ext. 3362",
    office: "SF829",
  },
  {
    id: "meng-hsien-yen",
    name: "Meng-Hsien Yen",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Business Policy, National Chengchi University",
      zh: "國立政治大學企業政策博士",
    },
    specialties: {
      en: "General management and business policy",
      zh: "一般管理與企業政策",
    },
    email: "145785@mail.fju.edu.tw",
    phone: "Ext. 2648",
  },
  {
    id: "hao-hsin-hsu",
    name: "Hao-Hsin Hsu",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Management Science, National Chiao Tung University",
      zh: "國立交通大學管理科學博士",
    },
    specialties: {
      en: "Organizational behavior, workplace health psychology, human resources, efficiency and productivity",
      zh: "組織行為、職場健康心理學、人力資源、效率與生產力分析",
    },
    email: "144779@mail.fju.edu.tw",
    phone: "Ext. 2771",
  },
  {
    id: "kai-pin-huang",
    name: "Kai-Pin Huang",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Industrial Engineering and Management, National Chiao Tung University",
      zh: "國立交通大學工業工程與管理博士",
    },
    specialties: {
      en: "Statistical inference, quality and reliability, data mining, machine learning, AI in renewable energy",
      zh: "統計推論、品質工程與可靠度、資料探勘、機器學習、再生能源管理之 AI 應用",
    },
    email: "152400@mail.fju.edu.tw",
    phone: "Ext. 6265",
  },
  {
    id: "lai-ferry-sugianto",
    name: "Lai Ferry Sugianto",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Finance, National Chung Cheng University",
      zh: "國立中正大學財務金融博士",
    },
    specialties: {
      en: "Investment, behavioral finance, environmental and climate finance, ESG",
      zh: "投資學、行為財務、環境與氣候金融、ESG",
    },
    email: "158325@mail.fju.edu.tw",
    phone: "Ext. 2678",
  },
  {
    id: "tsang-hsien-wang",
    name: "Tsang-Hsien Wang",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Management, National Taiwan University of Science and Technology",
      zh: "國立臺灣科技大學管理博士",
    },
    specialties: {
      en: "Consumer behavior, marketing, innovation and product management, international business, branding",
      zh: "消費者行為、行銷管理、創新與產品管理、國際企業、品牌管理",
    },
    email: "167167@mail.fju.edu.tw",
    phone: "Ext. 3931",
  },
  {
    id: "chia-hua-lin",
    name: "Chia-Hua Lin",
    type: "full",
    rank: { en: "Assistant Professor", zh: "助理教授" },
    education: {
      en: "Ph.D. in Psychology, National Chung Cheng University",
      zh: "國立中正大學心理學博士",
    },
    specialties: {
      en: "Organizational behavior, industrial and organizational psychology",
      zh: "組織行為、工業與組織心理學",
    },
    email: "167208@mail.fju.edu.tw",
    phone: "Ext. 2966",
  },
  {
    id: "hui-mei-wang",
    name: "Hui-Mei Wang",
    type: "part",
    rank: { en: "Part-time Associate Professor", zh: "兼任副教授" },
    education: {
      en: "Ph.D. in International Business, National Taiwan University",
      zh: "國立臺灣大學國際企業博士",
    },
    specialties: {
      en: "International business and international marketing",
      zh: "國際企業、國際行銷",
    },
    email: "wanghm.tw@gmail.com",
  },
];
