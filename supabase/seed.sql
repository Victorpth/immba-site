-- Seed public.faculty from src/content/faculty.ts, in the current display order.
-- title, education, and research_fields use the English text. The table has one text column each.
-- type "full" maps to category 'full-time'. type "part" maps to 'adjunct' (no part-time value in the check).
-- No portrait is stored in the source file, so image_url is null. Apostrophes are escaped as ''.

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Yi-Ning Tu',
  'Associate Professor, Chair of imMBA',
  'Ph.D. in Information Management, National Chengchi University',
  'Data mining, text mining, artificial intelligence, machine learning, information retrieval',
  '082435@mail.fju.edu.tw',
  'Ext. 3988',
  'https://sites.google.com/view/yiningtu',
  null,
  'full-time',
  1
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Michael T. S. Lee',
  'Chair Professor',
  'Ph.D. in Operations Research and Industrial Engineering, University of Texas at Austin',
  'Operations research and industrial engineering',
  '036665@mail.fju.edu.tw',
  'Ext. 2905',
  null,
  null,
  'full-time',
  2
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Yaonan Lin',
  'Professor',
  'Ph.D. in Marketing, Golden Gate University',
  'Marketing management',
  '065999@mail.fju.edu.tw',
  'Ext. 2735, 2021',
  null,
  null,
  'full-time',
  3
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Yu-Ming Hsu',
  'Associate Professor, Director of the MS Program in Technology Management',
  'Ph.D. in International Business, National Taiwan University',
  'Marketing, digital marketing, IT marketing, social commerce, international business',
  '155456@mail.fju.edu.tw',
  'Ext. 3977',
  null,
  null,
  'full-time',
  4
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Chih-An Lin',
  'Associate Professor, Director of the Academic Exchange Center',
  'Ph.D. in International Business, National Taiwan University',
  'Supply chain management, media communication, integrated marketing, brand management',
  '144629@mail.fju.edu.tw',
  'Ext. 2924',
  null,
  null,
  'full-time',
  5
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Kai-Ping Huang',
  'Associate Professor',
  'Ph.D. in Business Administration, University of Technology Sydney',
  'Business administration',
  '129741@mail.fju.edu.tw',
  'Ext. 2906',
  null,
  null,
  'full-time',
  6
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Hsiang-Ching Tseng',
  'Associate Professor',
  'Ph.D. in Marketing, National Chengchi University',
  'Marketing management',
  '142652@mail.fju.edu.tw',
  'Ext. 2737',
  null,
  null,
  'full-time',
  7
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Mei-Chun Lin',
  'Associate Professor',
  'Ph.D. in Industrial and Information Management, National Cheng Kung University',
  'AI in industry, service marketing, industry analysis, competitive strategy, supply chain',
  '151308@mail.fju.edu.tw',
  'Ext. 2968',
  null,
  null,
  'full-time',
  8
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Shu-Ling Cheng',
  'Associate Professor',
  'Ph.D. in Business Administration, National Cheng Kung University',
  'Strategic management, marketing research, data analysis, international financial management',
  '151667@mail.fju.edu.tw',
  'Ext. 2725',
  null,
  null,
  'full-time',
  9
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Pi-Chan Hu',
  'Associate Professor',
  'Ph.D. in Applied Linguistics, National Chengchi University',
  'International business negotiation, translation, interpretation, applied and forensic linguistics',
  '128144@mail.fju.edu.tw',
  'Ext. 2145',
  null,
  null,
  'full-time',
  10
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Tsui-Lin Chiang',
  'Assistant Professor',
  'Ph.D. in Business Administration, Fu Jen Catholic University',
  'Economics, corporate governance, financial management, investment',
  '051266@mail.fju.edu.tw',
  'Ext. 2852',
  null,
  null,
  'full-time',
  11
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Shu-wen Lin',
  'Assistant Professor',
  'Ed.D., School of Education, Durham University',
  'English for general and specific purposes, Global Englishes',
  '156503@mail.fju.edu.tw',
  'Ext. 3362',
  null,
  null,
  'full-time',
  12
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Meng-Hsien Yen',
  'Assistant Professor',
  'Ph.D. in Business Policy, National Chengchi University',
  'General management and business policy',
  '145785@mail.fju.edu.tw',
  'Ext. 2648',
  null,
  null,
  'full-time',
  13
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Hao-Hsin Hsu',
  'Assistant Professor',
  'Ph.D. in Management Science, National Chiao Tung University',
  'Organizational behavior, workplace health psychology, human resources, efficiency and productivity',
  '144779@mail.fju.edu.tw',
  'Ext. 2771',
  null,
  null,
  'full-time',
  14
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Kai-Pin Huang',
  'Assistant Professor',
  'Ph.D. in Industrial Engineering and Management, National Chiao Tung University',
  'Statistical inference, quality and reliability, data mining, machine learning, AI in renewable energy',
  '152400@mail.fju.edu.tw',
  'Ext. 6265',
  null,
  null,
  'full-time',
  15
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Lai Ferry Sugianto',
  'Assistant Professor',
  'Ph.D. in Finance, National Chung Cheng University',
  'Investment, behavioral finance, environmental and climate finance, ESG',
  '158325@mail.fju.edu.tw',
  'Ext. 2678',
  null,
  null,
  'full-time',
  16
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Tsang-Hsien Wang',
  'Assistant Professor',
  'Ph.D. in Management, National Taiwan University of Science and Technology',
  'Consumer behavior, marketing, innovation and product management, international business, branding',
  '167167@mail.fju.edu.tw',
  'Ext. 3931',
  null,
  null,
  'full-time',
  17
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Chia-Hua Lin',
  'Assistant Professor',
  'Ph.D. in Psychology, National Chung Cheng University',
  'Organizational behavior, industrial and organizational psychology',
  '167208@mail.fju.edu.tw',
  'Ext. 2966',
  null,
  null,
  'full-time',
  18
);

insert into public.faculty (name, title, education, research_fields, email, phone, website, image_url, category, sort_order)
values (
  'Hui-Mei Wang',
  'Part-time Associate Professor',
  'Ph.D. in International Business, National Taiwan University',
  'International business and international marketing',
  'wanghm.tw@gmail.com',
  null,
  null,
  null,
  'adjunct',
  19
);
