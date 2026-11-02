// Sample CRM data in both languages. Company names stay in Latin script, as brands do.
export const OWNERS = [
  { id: "amira", en: "Amira Hassan", ar: "أميرة حسن" },
  { id: "omar", en: "Omar Farouk", ar: "عمر فاروق" },
  { id: "laila", en: "Laila Mansour", ar: "ليلى منصور" },
  { id: "youssef", en: "Youssef Nabil", ar: "يوسف نبيل" },
];
export const STAGES = [
  { id: "lead", en: "New lead", ar: "عميل جديد", tone: "neutral" },
  { id: "qualified", en: "Qualified", ar: "مؤهل", tone: "violet" },
  { id: "proposal", en: "Proposal sent", ar: "عرض مُرسل", tone: "warning" },
  { id: "negotiation", en: "Negotiation", ar: "تفاوض", tone: "info" },
  { id: "won", en: "Won", ar: "تم الفوز", tone: "success" },
  { id: "lost", en: "Lost", ar: "خسارة", tone: "danger" },
];
export const CONTACTS = [
  { id: 1, en: "Nadia Kamel", ar: "نادية كامل", titleEn: "Head of Operations", titleAr: "رئيسة العمليات", company: "Nile Foods", email: "nadia@nilefoods.com", phone: "+20 100 234 5678", owner: "amira", stage: "negotiation", value: 840000, days: 0 },
  { id: 2, en: "Tarek Saleh", ar: "طارق صالح", titleEn: "CFO", titleAr: "المدير المالي", company: "Delta Freight", email: "tarek@deltafreight.com", phone: "+20 122 410 9876", owner: "omar", stage: "proposal", value: 1250000, days: 1 },
  { id: 3, en: "Mona Fathy", ar: "منى فتحي", titleEn: "Procurement Lead", titleAr: "مسؤولة المشتريات", company: "Sinai Retail", email: "mona@sinairetail.com", phone: "+20 111 777 0021", owner: "laila", stage: "qualified", value: 460000, days: 2 },
  { id: 4, en: "Hany Ibrahim", ar: "هاني إبراهيم", titleEn: "IT Director", titleAr: "مدير تقنية المعلومات", company: "Alex Pharma", email: "hany@alexpharma.com", phone: "+20 109 552 3310", owner: "youssef", stage: "won", value: 2100000, days: 3 },
  { id: 5, en: "Salma Adel", ar: "سلمى عادل", titleEn: "Marketing Manager", titleAr: "مديرة التسويق", company: "Red Sea Resorts", email: "salma@redsearesorts.com", phone: "+20 128 300 4455", owner: "amira", stage: "lead", value: 180000, days: 5 },
  { id: 6, en: "Karim Mostafa", ar: "كريم مصطفى", titleEn: "COO", titleAr: "مدير العمليات", company: "Giza Motors", email: "karim@gizamotors.com", phone: "+20 100 909 1212", owner: "omar", stage: "lost", value: 620000, days: 9 },
  { id: 7, en: "Rana Youssef", ar: "رنا يوسف", titleEn: "Founder", titleAr: "المؤسِّسة", company: "Cairo Fintech", email: "rana@cairofintech.io", phone: "+20 115 640 7788", owner: "laila", stage: "proposal", value: 975000, days: 1 },
  { id: 8, en: "Ahmed Samir", ar: "أحمد سمير", titleEn: "Supply Chain Manager", titleAr: "مدير سلسلة الإمداد", company: "Luxor Textiles", email: "ahmed@luxortextiles.com", phone: "+20 106 233 8890", owner: "youssef", stage: "qualified", value: 390000, days: 4 },
  { id: 9, en: "Dina Ashraf", ar: "دينا أشرف", titleEn: "Head of Sales", titleAr: "رئيسة المبيعات", company: "Aswan Solar", email: "dina@aswansolar.com", phone: "+20 127 118 4402", owner: "amira", stage: "negotiation", value: 1530000, days: 2 },
  { id: 10, en: "Mahmoud Gaber", ar: "محمود جابر", titleEn: "Operations Analyst", titleAr: "محلل العمليات", company: "Port Said Logistics", email: "mahmoud@pslogistics.com", phone: "+20 101 456 1290", owner: "omar", stage: "lead", value: 95000, days: 12 },
  { id: 11, en: "Yasmin Hosny", ar: "ياسمين حسني", titleEn: "Product Director", titleAr: "مديرة المنتجات", company: "Mansoura Dairy", email: "yasmin@mansouradairy.com", phone: "+20 112 980 3345", owner: "laila", stage: "won", value: 720000, days: 6 },
  { id: 12, en: "Sherif Lotfy", ar: "شريف لطفي", titleEn: "General Manager", titleAr: "المدير العام", company: "Hurghada Marine", email: "sherif@hmarine.com", phone: "+20 120 334 7781", owner: "youssef", stage: "proposal", value: 540000, days: 7 },
];
export const stageOf = (id) => STAGES.find((s) => s.id === id);
export const ownerOf = (id) => OWNERS.find((o) => o.id === id);
