// Every view and component, with English + Arabic names. Tokens become shareable links (#token).
export const NAV = [
  { group: ["Start", "البداية"], views: [
    { id: "overview", name: ["CRM example", "مثال إدارة العملاء"], icon: "Home", items: [] },
  ]},
  { group: ["Foundations", "الأساسيات"], views: [
    { id: "colors", name: ["Colour and tokens", "الألوان والرموز"], icon: "Palette", items: [
      ["color-tokens", "Colour tokens", "رموز الألوان"], ["spacing", "Spacing", "المسافات"], ["radius", "Radius and depth", "الحواف والعمق"]] },
    { id: "typography", name: ["Typography", "الخطوط"], icon: "Type", items: [
      ["type-scale", "Type scale", "مقاسات الخطوط"], ["mixed-text", "Mixed text", "نص مختلط"]] },
    { id: "logo", name: ["Logo", "الشعار"], icon: "Layers", items: [
      ["wordmark", "Wordmark", "الشعار الكتابي"], ["monogram", "Monogram", "الرمز المختصر"]] },
    { id: "countries", name: ["Countries and flags", "الدول والأعلام"], icon: "Globe", items: [
      ["flags", "Flags", "الأعلام"], ["country-picker", "Country picker", "منتقي الدولة"], ["country-list", "All countries", "كل الدول"]] },
    { id: "assistant", name: ["Assistant mark", "علامة المساعد"], icon: "Cursor", items: [
      ["orbit", "Rest and hover", "السكون والتمرير"], ["search-loading", "Search loading", "تحميل البحث"], ["talking", "Talking", "الحديث"]] },
  ]},
  { group: ["Components", "المكونات"], views: [
    { id: "buttons", name: ["Buttons and links", "الأزرار والروابط"], icon: "Cursor", items: [
      ["button", "Button", "زر"], ["icon-button", "Icon button and tooltip", "زر أيقونة وتلميح"], ["toggle-button", "Toggle button", "زر تبديل"],
      ["toggle-group", "Toggle button group", "مجموعة أزرار تبديل"], ["toolbar", "Toolbar", "شريط أدوات"], ["link", "Link", "رابط"], ["file-trigger", "File trigger", "رفع ملف"]] },
    { id: "forms", name: ["Form fields", "حقول النماذج"], icon: "FileText", items: [
      ["text-field", "Text field", "حقل نصي"], ["search-field", "Search field", "حقل بحث"], ["number-field", "Number field", "حقل رقمي"], ["phone-field", "Phone number", "رقم الهاتف"],
      ["checkbox", "Checkbox and switch", "مربع اختيار ومفتاح"], ["checkbox-group", "Checkbox group", "مجموعة مربعات"],
      ["radio", "Radio group", "مجموعة خيارات"], ["radio-cards", "Radio cards", "بطاقات خيارات"],
      ["slider", "Slider and range", "شريط تمرير ونطاق"], ["setting-rows", "Setting rows", "صفوف الإعدادات"], ["prompt-editor", "Prompt editor", "محرر الأوامر"], ["form", "Form validation", "التحقق من النموذج"]] },
    { id: "dates", name: ["Dates and times", "التواريخ والأوقات"], icon: "Calendar", items: [
      ["date-field", "Date field", "حقل تاريخ"], ["time-field", "Time field", "حقل وقت"], ["date-picker", "Date picker", "منتقي التاريخ"],
      ["date-range-picker", "Date range picker", "منتقي نطاق التاريخ"], ["calendar", "Calendar", "التقويم"], ["calendar-pickers", "Month and year pickers", "منتقي الشهر والسنة"], ["range-calendar", "Range calendar", "تقويم النطاق"]] },
    { id: "selection", name: ["Selection", "الاختيار"], icon: "List", items: [
      ["select", "Select", "قائمة اختيار"], ["combo-box", "Combo box", "بحث واختيار"], ["autocomplete", "Autocomplete", "إكمال تلقائي"],
      ["list-box", "List box", "قائمة خيارات"], ["multi-select", "Multi-select", "اختيار متعدد"], ["grid-list", "Grid list", "قائمة تفاعلية"], ["grid-sections", "Grouped list", "قائمة مجمعة"], ["infinite-list", "Infinite list", "قائمة لا نهائية"], ["tags", "Tag group", "الوسوم"]] },
    { id: "navigation", name: ["Navigation", "التنقل"], icon: "Layers", items: [
      ["tabs", "Tabs", "علامات التبويب"], ["breadcrumbs", "Breadcrumbs", "مسار التنقل"], ["disclosure", "Disclosure and accordion", "إفصاح وأكورديون"], ["pagination", "Pagination", "ترقيم الصفحات"], ["navigation-tree", "Navigation tree", "شجرة التنقل"], ["keyboard", "Keyboard shortcuts", "اختصارات لوحة المفاتيح"], ["preview", "Hover preview", "معاينة عند المرور"]] },
    { id: "overlays", name: ["Dialogs and overlays", "النوافذ والطبقات"], icon: "Layers", items: [
      ["dialog", "Dialog", "نافذة حوار"], ["confirm-dialog", "Confirmation", "تأكيد"], ["delete-dialog", "Destructive confirmation", "تأكيد الحذف"],
      ["full-dialog", "Large dialog", "نافذة كبيرة"], ["drawer", "Drawer", "لوحة جانبية"], ["sheet", "Sheet", "ورقة منزلقة"], ["popover", "Popover", "نافذة منبثقة"], ["menu", "Menu", "قائمة"], ["tooltip", "Tooltip", "تلميح"]] },
    { id: "feedback", name: ["Notifications and status", "الإشعارات والحالة"], icon: "Bell", items: [
      ["toast", "Toasts", "الإشعارات المنبثقة"], ["banner", "Alert banners", "تنبيهات"], ["notifications", "Notification centre", "مركز الإشعارات"],
      ["progress", "Progress bar", "شريط التقدم"], ["meter", "Meter", "مقياس"], ["badge", "Badges", "الشارات"], ["skeleton", "Loading skeleton", "هيكل التحميل"], ["empty-state", "Empty state", "حالة فارغة"]] },
    { id: "data", name: ["Tables", "الجداول"], icon: "Table2", items: [
      ["simple-table", "Simple table", "جدول بسيط"], ["sortable-table", "Sortable table", "جدول قابل للترتيب"], ["selectable-table", "Selection and bulk actions", "التحديد والإجراءات الجماعية"],
      ["resizable-table", "Resizable columns", "أعمدة قابلة لتغيير الحجم"], ["expandable-rows", "Expandable rows", "صفوف قابلة للتوسيع"],
      ["reorder-table", "Drag to reorder", "السحب لإعادة الترتيب"], ["table-footer", "Totals row", "صف الإجماليات"], ["infinite-table", "Infinite scroll", "تمرير لا نهائي"], ["virtual-table", "10,000 rows", "١٠٬٠٠٠ صف"], ["table-states", "Loading and empty", "التحميل والحالة الفارغة"]] },
    { id: "collections", name: ["Large collections", "المجموعات الكبيرة"], icon: "Layers", items: [
      ["virtual-list", "Virtualized list", "قائمة افتراضية"], ["virtual-grid", "Grid layout", "تخطيط شبكي"], ["masonry", "Masonry layout", "تخطيط متدرج"]] },
    { id: "layout", name: ["Cards and stats", "البطاقات والإحصاءات"], icon: "Kanban", items: [
      ["stat", "Stat tiles", "مربعات الإحصاءات"], ["card", "Cards", "البطاقات"], ["avatar", "Avatars", "الصور الرمزية"]] },
    { id: "color", name: ["Colour pickers", "منتقيات الألوان"], icon: "Palette", items: [
      ["color-picker", "Colour picker", "منتقي الألوان"], ["color-wheel", "Colour wheel", "عجلة الألوان"], ["swatches", "Swatches", "عينات الألوان"]] },
    { id: "drag-drop", name: ["Drag and drop", "السحب والإفلات"], icon: "Upload", items: [
      ["drop-zone", "File drop zone", "منطقة إفلات الملفات"], ["reorder-list", "Reorderable list", "قائمة قابلة لإعادة الترتيب"]] },
  ]},
  { group: ["Data visualisation", "عرض البيانات"], views: [
    { id: "charts", name: ["Charts", "الرسوم البيانية"], icon: "TrendUp", items: [
      ["chart-palette", "Palette", "الألوان"], ["line-chart", "Line", "خطي"], ["area-chart", "Stacked area", "مساحات متراكمة"], ["bar-charts", "Bars", "أعمدة"],
      ["ranked-bars", "Ranked bars", "أعمدة مرتبة"], ["combo-chart", "Bars with a line", "أعمدة مع خط"], ["pie-donut", "Donut and pie", "الحلقة والدائرة"],
      ["sparklines", "Sparklines", "خطوط مصغّرة"], ["scatter-chart", "Scatter", "تشتت"], ["radar-chart", "Radar", "رادار"], ["gauge", "Gauge", "مؤشر"],
      ["funnel-chart", "Funnel", "قمع"], ["treemap-chart", "Treemap", "خريطة شجرية"], ["heatmap", "Heatmap", "خريطة حرارية"]] },
    { id: "maps", name: ["Maps", "الخرائط"], icon: "Globe", items: [
      ["world-map", "Choropleth map", "خريطة ملونة"], ["live-map", "Live markers", "علامات مباشرة"], ["map-borders", "Border view", "عرض الحدود"]] },
  ]},
  { group: ["Voice AI", "الذكاء الصوتي"], views: [
    { id: "call-review", name: ["Call review", "مراجعة المكالمات"], icon: "Phone", items: [] },
    { id: "call-player", name: ["Call player", "مشغل المكالمات"], icon: "Headphones", items: [
      ["mini-player", "Mini player", "مشغل مصغّر"], ["stereo-player", "Stereo player", "مشغل ستيريو"], ["expanded-player", "Expanded player", "المشغل الموسّع"]] },
    { id: "workflow", name: ["Workflow builder", "منشئ سير العمل"], icon: "GitBranch", items: [] },
    { id: "live-call", name: ["Live call", "مكالمة مباشرة"], icon: "Mic", items: [] },
    { id: "developer", name: ["Developer tools", "أدوات المطورين"], icon: "Code", items: [
      ["json-viewer", "JSON viewer", "عارض JSON"], ["code-samples", "Code samples", "أمثلة الكود"], ["copy-id", "Copyable IDs", "معرّفات قابلة للنسخ"]] },
  ]},
  { group: ["Truvar OS", "Truvar OS"], views: [
    { id: "os-prototype", name: ["Prototype", "النموذج التفاعلي"], icon: "Cursor", items: [] },
    { id: "os-system", name: ["System UI", "واجهة النظام"], icon: "Layers", items: [
      ["os-icons", "System icons", "أيقونات النظام"], ["os-statusbar", "System bar", "شريط النظام"], ["os-dock", "Voice dock", "شريط الصوت"], ["os-notifications", "Notifications", "الإشعارات"]] },
    { id: "os-lock", name: ["Lock screen", "شاشة القفل"], icon: "User", items: [] },
    { id: "os-agent", name: ["Agent at work", "الوكيل أثناء العمل"], icon: "Mic", items: [
      ["os-listening", "Listening", "الاستماع"], ["os-task", "Task progress", "تقدّم المهمة"], ["os-approval", "Approval", "الموافقة"], ["os-done", "Done", "تم"]] },
    { id: "os-workspace", name: ["Workspace", "مساحة العمل"], icon: "Kanban", items: [
      ["os-multiapp", "Working across apps", "العمل على أكتر من تطبيق"], ["os-remote", "Another device's screen", "شاشة جهاز تاني"]] },
    { id: "os-home", name: ["Work and devices", "الشغل والأجهزة"], icon: "Home", items: [
      ["os-mywork", "My work", "شغلي"], ["os-devices", "Devices", "الأجهزة"]] },
    { id: "os-permissions", name: ["Permissions", "الصلاحيات"], icon: "Check", items: [] },
  ]},
  { group: ["Patterns", "الأنماط"], views: [
    { id: "record-panel", name: ["Record panel", "لوحة السجل"], icon: "User", items: [] },
    { id: "extending", name: ["Extending the system", "توسيع النظام"], icon: "Plus", items: [
      ["custom-behaviour", "Custom behaviour", "سلوك مخصص"], ["new-component", "New component", "مكوّن جديد"]] },
  ]},
];
export const VIEWS = NAV.flatMap((g) => g.views);
export const TOKEN_TO_VIEW = {};
VIEWS.forEach((v) => { TOKEN_TO_VIEW[v.id] = v.id; v.items.forEach(([id]) => { TOKEN_TO_VIEW[id] = v.id; }); });
