/*
 * مغامرة محققة المتجر الإلكتروني
 * GitHub Pages frontend + Google Apps Script / Google Sheets backend.
 * Configure APPS_SCRIPT_URL after deploying Code.gs.
 */
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwIwsWkMcgy6PfxOBsuv0owT0wiDnysHWCXbS7FY8prXIKwOU_jrvcGjTwpCAGRy9F6Sg/exec", // Paste the deployed Apps Script Web App URL ending in /exec.
  DRAFT_KEY: "boulevard-store-detective-draft-v1",
  POLL_ATTEMPTS: 8,
  POLL_INTERVAL_MS: 1500
};

const AXES = [
  {
    id: "market", title: "المحور الأول: واجهة المتجر وجودة عرض المنتجات", short: "واجهة المتجر", place: "جزيرة الأسواق", icon: "🏬", max: 25,
    intro: "تجوّلي في واجهة المتجر، وتأكدي من وضوح هويته وطريقة عرض منتجاته.",
    items: [
      ["m1", "وضوح اسم المتجر وهويته التجارية."],
      ["m2", "تنظيم الصفحة والقوائم وسهولة الانتقال بين الأقسام."],
      ["m3", "توافر صور المنتجات ووصف تفصيلي لها."],
      ["m4", "وضوح الأسعار والخصومات قبل الشراء."],
      ["m5", "إمكانية البحث عن المنتجات وترتيبها ومقارنة المنتجات والاطلاع على آراء العملاء."]
    ]
  },
  {
    id: "shopping", title: "المحور الثاني: تجربة التسوق وإدارة الطلبات", short: "تجربة التسوق", place: "جزيرة المشتريات", icon: "🛍️", max: 20,
    intro: "افحصي رحلة العميل من اختيار المنتج إلى مراجعة السلة والشحن.",
    items: [
      ["s1", "إمكانية إضافة المنتج إلى سلة المشتريات وتعديل الكمية أو حذف المنتج."],
      ["s2", "وضوح حالة توفر المنتج في المتجر."],
      ["s3", "وضوح تكاليف الشحن وبيانات التوصيل قبل إتمام الطلب."],
      ["s4", "توافر معلومات تأكيد الطلب وتتبع الشحنة وسياسة الإرجاع."]
    ]
  },
  {
    id: "payment", title: "المحور الثالث: وسائل الدفع الإلكتروني", short: "الدفع الإلكتروني", place: "مختبر الدفع", icon: "💳", max: 15,
    intro: "تحققي من طرق الدفع المعروضة ووضوح المبلغ والرسوم قبل الشراء.",
    items: [
      ["p1", "وضوح طرق الدفع المتاحة للعميل."],
      ["p2", "توافر وسائل دفع إلكترونية معروفة، مثل البطاقات والمحافظ الرقمية أو الدفع عبر الهاتف، بحسب ما يتيحه المتجر."],
      ["p3", "وضوح خطوات الدفع والمبلغ المطلوب والرسوم قبل تأكيد الطلب."]
    ]
  },
  {
    id: "security", title: "المحور الرابع: الأمان والخصوصية وإشارات الثقة", short: "الأمان والخصوصية", place: "قلعة الأمان", icon: "🛡️", max: 25,
    intro: "ابحثي عن مؤشرات الاتصال الآمن والخصوصية والحماية، ولا تعتبري مؤشرًا واحدًا ضمانًا للثقة.",
    items: [
      ["c1", "استخدام اتصال آمن HTTPS وظهور رمز القفل في عنوان الموقع."],
      ["c2", "وجود شعارات أمان أو شهادات رقمية يمكن التحقق منها."],
      ["c3", "وجود سياسة خصوصية توضّح كيفية التعامل مع بيانات العميل."],
      ["c4", "عدم طلب كلمات المرور أو رموز التحقق عبر البريد الإلكتروني أو وسائل التواصل."],
      ["c5", "وجود آلية مناسبة لحماية حساب المستخدم، مثل كلمة المرور القوية والمصادقة المزدوجة عند إتاحتها."]
    ]
  },
  {
    id: "fraud", title: "المحور الخامس: اكتشاف علامات الاحتيال الإلكتروني", short: "كشف الاحتيال", place: "محطة كشف الاحتيال", icon: "🔎", max: 20,
    intro: "ابحثي عن إشارات التحذير الظاهرة في عنوان الموقع والعروض والتصميم ووسائل التواصل.",
    items: [
      ["f1", "خلو عنوان الموقع من الأحرف أو الكلمات الغريبة والعناوين المضللة."],
      ["f2", "عدم وجود تخفيضات مبالغ فيها تثير الشك مقارنة بالأسعار المعتادة."],
      ["f3", "جودة تصميم الموقع وسلامة اللغة المستخدمة."],
      ["f4", "توافر وسائل اتصال رسمية وواضحة بالمتجر."]
    ]
  }
];

const STAGES = [
  { label: "المحققة", icon: "01" },
  { label: "المتجر", icon: "02" },
  { label: "الواجهة", icon: "03" },
  { label: "التسوق", icon: "04" },
  { label: "الدفع", icon: "05" },
  { label: "الأمان", icon: "06" },
  { label: "الاحتيال", icon: "07" },
  { label: "النتيجة", icon: "08" }
];

const state = {
  stage: 1,
  studentName: "",
  className: "ثالث 1",
  groupName: "",
  membersText: "",
  accessCode: "",
  storeName: "",
  storeUrl: "",
  productType: "ملابس وأزياء",
  tradeModel: "B2C",
  scores: {},
  notes: {},
  peerAssessments: {},
  recommendation: "",
  submissionId: null,
  saving: false
};

const INITIAL_STATE = JSON.parse(JSON.stringify(state));
const $ = (selector, root = document) => root.querySelector(selector);
const stageContent = $("#stageContent");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function allCriteria() {
  return AXES.flatMap(axis => axis.items.map(([id, text]) => ({ id, text, axisId: axis.id, axisTitle: axis.title })));
}
function getAnswered() { return allCriteria().filter(item => Object.prototype.hasOwnProperty.call(state.scores, item.id)); }
function getAvailable() { return getAnswered().filter(item => state.scores[item.id] !== "NA"); }
function getTotal() { return getAvailable().reduce((sum, item) => sum + Number(state.scores[item.id]), 0); }
function getDenominator() { return getAvailable().length * 5; }
function getPercent() { const d = getDenominator(); return d ? Math.round(getTotal() / d * 100) : 0; }
function getMissing() { return 21 - getAnswered().length; }
function getMembers() {
  const own = state.studentName.trim().toLocaleLowerCase();
  return [...new Set(String(state.membersText || "").split(/[\n,،؛;]+/).map(x => x.trim()).filter(x => x && x.toLocaleLowerCase() !== own))];
}
function peerEvaluationComplete(name) {
  const record = state.peerAssessments[name];
  return !!record && ["contribution", "role", "collaboration", "ideas", "respect"].every(key => record.scores && record.scores[key] !== undefined);
}
function peerComplete() { const members = getMembers(); return members.length > 0 && members.every(peerEvaluationComplete); }
function evidenceCount() { return Object.values(state.notes).filter(value => String(value || "").trim().length >= 8).length; }
function achievementPoints() {
  const identity = state.studentName && state.storeName ? 10 : 0;
  const axes = AXES.reduce((sum, axis) => sum + (axis.items.every(([id]) => state.scores[id] !== undefined) ? 15 : 0), 0);
  const evidence = evidenceCount() >= 3 ? 10 : 0;
  const peers = peerComplete() ? 5 : 0;
  return { identity, axes, evidence, peers, total: identity + axes + evidence + peers };
}
function achievementBadges() {
  const points = achievementPoints();
  const badges = [{ title: "محققة البداية", icon: "🔎", unlocked: points.identity === 10, desc: "أكملتِ بيانات المهمة." },
    { title: "عين الصقر", icon: "🦅", unlocked: points.axes === 75, desc: "أتممتِ تقييم المحاور الخمسة." },
    { title: "جامعة الأدلة", icon: "💎", unlocked: points.evidence === 10, desc: "وثّقتِ ثلاث ملاحظات أو أكثر." },
    { title: "روح الفريق", icon: "🤝", unlocked: points.peers === 5, desc: "أكملتِ تقييم زميلاتكِ." },
    { title: "المحققة الذهبية", icon: "🏆", unlocked: points.total === 100, desc: "حققتِ جميع نقاط الإنجاز." }];
  return badges;
}
function stageProgress() { return Math.round((state.stage - 1) / 7 * 100); }

function persistDraft() {
  const draft = { ...state, saving: false };
  try { localStorage.setItem(CONFIG.DRAFT_KEY, JSON.stringify(draft)); } catch (_) { /* storage may be disabled */ }
}
function loadDraft() {
  try {
    const raw = localStorage.getItem(CONFIG.DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (draft && typeof draft === "object") Object.assign(state, draft, { saving: false });
  } catch (_) { /* ignore invalid local draft */ }
}

function renderStepper() {
  const stepper = $("#stepper");
  stepper.innerHTML = STAGES.map((item, index) => {
    const n = index + 1;
    const cls = n === state.stage ? "active" : n < state.stage ? "done" : "";
    return `<button class="step-node ${cls}" data-goto="${n}" type="button" aria-label="${item.label}" ${n > state.stage ? "disabled" : ""}>
      <span class="node-circle">${n < state.stage ? "✓" : item.icon}</span><small>${item.label}</small></button>`;
  }).join("");
  stepper.querySelectorAll("[data-goto]").forEach(btn => btn.addEventListener("click", () => {
    const target = Number(btn.dataset.goto);
    if (target <= state.stage) goTo(target);
  }));
  $("#stepCount").textContent = `المرحلة ${state.stage} من 8`;
  $("#progressFill").style.width = `${Math.max(12.5, state.stage / 8 * 100)}%`;
}

function updateSidebar() {
  $("#sideStudent").textContent = state.studentName || "المحققة الجديدة";
  $("#sideClass").textContent = `الفصل: ${state.className || "لم يحدد بعد"}`;
  $("#sideProgress").textContent = `${stageProgress()}%`;
  $("#sideProgressFill").style.width = `${stageProgress()}%`;
  $("#sideCriteria").textContent = `${getAnswered().length} / 21`;
  $("#sideScore").textContent = getDenominator() ? getTotal() : "—";
  const tips = [
    "اختاري الدليل قبل الحكم؛ لا تعتمدي على الانطباع وحده.",
    "قارني بين المعلومات الظاهرة ولا تدخلي بيانات شخصية.",
    "افحصي عنوان الموقع ووصف المنتجات والأسعار.",
    "راجعي السلة والشحن دون تأكيد طلب حقيقي.",
    "لاحظي طرق الدفع ولا تدخلي بيانات بطاقة.",
    "HTTPS يشفر الاتصال، لكنه لا يثبت وحده موثوقية المتجر.",
    "العروض المبالغ فيها والعناوين المضللة تستحق التحقق.",
    "اكتبي توصية متوازنة مبنية على ما فحصتِه بالفعل."
  ];
  $("#tipText").textContent = tips[state.stage - 1];
}

function pageHeader(icon, title, description, pill) {
  return `<div class="stage-head"><div class="stage-title-wrap"><div class="stage-icon">${icon}</div><div><h2>${title}</h2><p>${description}</p></div></div><span class="stage-pill">${pill}</span></div>`;
}
function stageActions(prev, next, nextLabel = "التالي") {
  return `<div class="stage-actions">${prev ? `<button class="btn btn-secondary" data-action="prev" type="button">→ السابق</button>` : `<span class="empty-hint">أكملي الحقول المطلوبة للمتابعة</span>`}<button class="btn btn-next" data-action="next" type="button">${nextLabel} ←</button></div>`;
}

function renderStudentStage() {
  return `<div class="stage-card">
    ${pageHeader("🕵🏻‍♀️", "بوابة المحققات", "عرّفي بنفسكِ للبدء في مغامرة تقييم المتجر الإلكتروني.", "المحطة الأولى")}
    <div class="form-grid">
      <div class="field full"><label for="studentName">اسم الطالبة *</label><input id="studentName" maxlength="80" autocomplete="name" placeholder="اكتبي اسمكِ" value="${escapeHtml(state.studentName)}"></div>
      <div class="field"><label for="className">الفصل *</label><select id="className">${[1,2,3,4,5,6].map(n => `<option value="ثالث ${n}" ${state.className === `ثالث ${n}` ? "selected" : ""}>ثالث ${n}</option>`).join("")}</select><small class="field-help">اختاري فصلكِ من القائمة.</small></div>
      <div class="field"><label for="groupName">اسم المجموعة *</label><input id="groupName" maxlength="60" placeholder="مثال: المحققات الذهبيات" value="${escapeHtml(state.groupName)}"></div>
      <div class="field full"><label for="membersText">أسماء زميلات المجموعة *</label><textarea id="membersText" maxlength="500" placeholder="اكتبي اسم كل زميلة في سطر مستقل">${escapeHtml(state.membersText)}</textarea><small class="field-help">ستظهر الأسماء في قسم تقييم الأقران، ولن تتمكني من تقييم نفسكِ.</small></div>
      <div class="field full"><label for="accessCode">رمز دخول الصف (إن زودتكِ به المعلمة)</label><input id="accessCode" maxlength="60" autocomplete="off" placeholder="اتركيه فارغًا إذا لم يُطلب منكِ" value="${escapeHtml(state.accessCode)}"><small class="field-help">يستخدم الرمز عند تفعيله من إعدادات المشروع لحماية المشاركات من الإرسال العشوائي.</small></div>
    </div>
    <div class="soft-notice">✨ مهمتكِ: فحص متجر إلكتروني، وتوثيق ما تشاهدينه، ثم إصدار حكم مستند إلى الأدلة. لا تشاركي أي معلومات شخصية أو مالية.</div>
    ${stageActions(false, true, "الانتقال إلى بيانات المتجر")}
  </div>`;
}

function renderStoreStage() {
  const productTypes = ["ملابس وأزياء", "أجهزة إلكترونية", "كتب ومستلزمات دراسية", "أغذية ومنتجات استهلاكية", "منتجات تجميل", "خدمات رقمية", "أخرى"];
  return `<div class="stage-card">
    ${pageHeader("🛍️", "بطاقة تعريف المتجر", "اختاري متجرًا إلكترونيًا يمكن فحص صفحاته العامة.", "المحطة الثانية")}
    <div class="axis-banner"><small>وجهتكِ التالية · شارع المتاجر</small><h3>كل متجر يحكي قصة… اكتشفي تفاصيلها</h3><p>ابدئي بجمع المعلومات الأساسية قبل تقييم المعايير.</p></div>
    <div class="form-grid">
      <div class="field"><label for="storeName">اسم المتجر *</label><input id="storeName" maxlength="120" placeholder="مثال: اسم المتجر" value="${escapeHtml(state.storeName)}"></div>
      <div class="field"><label for="storeUrl">رابط المتجر *</label><input id="storeUrl" maxlength="500" type="url" dir="ltr" placeholder="https://example.com" value="${escapeHtml(state.storeUrl)}"><small class="field-help">استخدمي رابط الموقع الرسمي الذي تريدين تقييمه.</small></div>
      <div class="field"><label for="productType">نوع المنتجات</label><select id="productType">${productTypes.map(x => `<option ${state.productType === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label for="tradeModel">نموذج التجارة الإلكترونية</label><select id="tradeModel"><option value="B2C" ${state.tradeModel === "B2C" ? "selected" : ""}>B2C – من شركة إلى مستهلك</option><option value="C2C" ${state.tradeModel === "C2C" ? "selected" : ""}>C2C – من مستهلك إلى مستهلك</option><option value="سوق إلكتروني" ${state.tradeModel === "سوق إلكتروني" ? "selected" : ""}>سوق إلكتروني يضم عدة بائعين</option></select></div>
      <div class="field"><label>الفصل</label><input disabled value="${escapeHtml(state.className)}"></div>
      <div class="field"><label>اسم المجموعة</label><input disabled value="${escapeHtml(state.groupName || "لم يحدد")}"></div>
    </div>
    <div class="soft-notice">🔐 تنبيه أمني: تصفحي الصفحات العامة فقط. لا تنشئي حسابًا جديدًا ولا تدخلي بيانات بطاقة أو كلمة مرور، ولا تضغطي على تأكيد الطلب.</div>
    ${stageActions(true, true, "ابدئي فحص المتجر")}
  </div>`;
}

function renderAxisStage(axisIndex) {
  const axis = AXES[axisIndex];
  const scoreLabels = [
    { value: "5", name: "متحقق بوضوح", sub: "5 درجات", cls: "good" },
    { value: "3", name: "متحقق جزئيًا", sub: "3 درجات", cls: "partial" },
    { value: "0", name: "غير متحقق", sub: "0 درجة", cls: "zero" },
    { value: "NA", name: "غير متاح", sub: "لا يدخل بالحساب", cls: "na" }
  ];
  const complete = axis.items.filter(([id]) => state.scores[id] !== undefined).length;
  const axisScore = axis.items.reduce((sum, [id]) => sum + (state.scores[id] === "NA" || state.scores[id] === undefined ? 0 : Number(state.scores[id])), 0);
  const axisDenom = axis.items.filter(([id]) => state.scores[id] !== "NA" && state.scores[id] !== undefined).length * 5;
  return `<div class="stage-card">
    ${pageHeader(axis.icon, axis.title, axis.intro, `المحطة ${axisIndex + 1} من 5`)}
    <div class="axis-banner"><small>بوليفارد الرياض · ${axis.place}</small><h3>${axis.short}</h3><p>ابحثي عن الدليل، ثم اختاري مستوى تحقق المعيار.</p></div>
    <div class="criteria-list">${axis.items.map(([id, text], i) => `
      <article class="criterion-card ${state.scores[id] !== undefined ? "selected" : ""}" data-criterion="${id}">
        <div class="criterion-top"><span class="criterion-number">${i + 1}</span><div class="criterion-text">${text}</div></div>
        <div class="score-options" role="radiogroup" aria-label="تقييم المعيار ${i + 1}">
          ${scoreLabels.map(option => `<div class="score-option ${option.cls}"><input type="radio" id="${id}-${option.value}" name="score-${id}" value="${option.value}" ${String(state.scores[id]) === option.value ? "checked" : ""}><label for="${id}-${option.value}"><b>${option.value === "NA" ? "—" : option.value}</b><small>${option.name}</small></label></div>`).join("")}
        </div>
        <div class="note-wrap"><input class="note-input" data-note="${id}" maxlength="500" placeholder="الدليل أو الملاحظة (اختياري)" value="${escapeHtml(state.notes[id] || "")}"></div>
      </article>`).join("")}</div>
    <div class="axis-bottom"><span>المعايير المكتملة: ${complete} من ${axis.items.length}</span><span class="axis-score">${axisScore} / ${axisDenom || axis.max} درجة محتسبة</span></div>
    ${stageActions(true, true, axisIndex === 4 ? "عرض النتيجة النهائية" : "المحطة التالية")}
  </div>`;
}

function labelForPercent(percent) {
  if (percent >= 90) return { text: "مؤشرات إيجابية مرتفعة", cls: "good" };
  if (percent >= 75) return { text: "جيد مع الحاجة للتحقق من بعض الجوانب", cls: "good" };
  if (percent >= 60) return { text: "يحتاج إلى مزيد من الحذر والتحقق", cls: "warn" };
  return { text: "مؤشرات تستدعي الحذر الشديد", cls: "danger" };
}
function renderPeerSection() {
  const members = getMembers();
  const keys = [
    ["contribution", "المشاركة الفعلية في تنفيذ المهمة"],
    ["role", "الالتزام بالدور والمسؤولية"],
    ["collaboration", "التعاون ومساعدة عضوات المجموعة"],
    ["ideas", "تقديم أفكار وملاحظات مفيدة"],
    ["respect", "احترام آراء الزميلات والالتزام بوقت العمل"]
  ];
  if (!members.length) return `<div class="soft-notice">لم تُسجل أسماء زميلات للمجموعة. عودي إلى بيانات المحققة وأضيفي أسماء عضوات الفريق لإكمال تقييم الأقران.</div>`;
  return `<section class="result-panel" style="margin-top:14px"><h4>🤝 تقييم الأقران – عين المحققة على فريقها</h4><p class="field-help">قيّمي مساهمة كل زميلة بموضوعية. لا تقيّمي نفسكِ، وستكون التقييمات متاحة للمعلمة فقط.</p>
    ${members.map((name, index) => {
      const record = state.peerAssessments[name] || { scores: {}, positive: "", suggestion: "" };
      const done = peerEvaluationComplete(name);
      return `<div class="peer-card" data-peer-card="${escapeHtml(name)}"><div class="peer-card-title"><span class="peer-avatar">${index + 1}</span><b>${escapeHtml(name)}</b><span class="peer-status ${done ? "done" : ""}">${done ? "مكتمل" : "بانتظار التقييم"}</span></div>
        ${keys.map(([key, label]) => `<div class="peer-score-row"><span>${label}</span><div class="peer-score-options">${[1,2,3,4].map(value => `<label class="peer-score ${record.scores[key] === value ? "chosen" : ""}"><input type="radio" name="peer-${index}-${key}" data-peer="${escapeHtml(name)}" data-peer-key="${key}" value="${value}" ${record.scores[key] === value ? "checked" : ""}><b>${value}</b></label>`).join("")}</div></div>`).join("")}
        <div class="peer-notes"><label>أبرز مساهمة إيجابية</label><input data-peer-note="positive" data-peer="${escapeHtml(name)}" maxlength="250" value="${escapeHtml(record.positive || "")}" placeholder="ما أفضل مساهمة قدمتها زميلتك؟"><label>اقتراح للتطوير</label><input data-peer-note="suggestion" data-peer="${escapeHtml(name)}" maxlength="250" value="${escapeHtml(record.suggestion || "")}" placeholder="ما اقتراحك لمساعدتها على التطور؟"></div>
      </div>`;
    }).join("")}
    <p class="field-help">مقياس التقييم: 4 متميزة جدًا · 3 جيدة · 2 تحتاج إلى تطوير · 1 لم يظهر السلوك بوضوح.</p>
  </section>`;
}
function renderResultsStage() {
  const total = getTotal(), denominator = getDenominator(), percent = getPercent();
  const label = denominator ? labelForPercent(percent) : { text: "لا توجد معايير كافية لحساب النتيجة", cls: "warn" };
  const axisRows = AXES.map(axis => {
    const scored = axis.items.filter(([id]) => state.scores[id] !== undefined && state.scores[id] !== "NA");
    const value = scored.reduce((sum, [id]) => sum + Number(state.scores[id]), 0);
    const max = scored.length * 5;
    const p = max ? Math.round(value / max * 100) : 0;
    return `<div class="result-axis-row"><div class="result-axis-head"><span>${axis.short}</span><b>${max ? `${p}%` : "غير متاح"}</b></div><div class="result-axis-track"><span style="width:${p}%"></span></div></div>`;
  }).join("");
  const recommendOptions = [
    "نوصي بالتعامل معه بناءً على المؤشرات التي فحصناها.",
    "نوصي بالحذر والتحقق من بعض الجوانب أولًا.",
    "لا نوصي بالشراء حتى تتم معالجة علامات الخطر والتحقق من موثوقية المتجر."
  ];
  const points = achievementPoints();
  const badges = achievementBadges();
  return `<div class="stage-card">
    ${pageHeader("🏆", "حصيلة التحقيق", "راجعي نتائج المحاور، وقيّمي مساهمة زميلاتكِ، ثم أصدري التوصية.", "المحطة الأخيرة")}
    <div class="result-hero"><div><h3>اكتمل فحص المتجر!</h3><p>أحسنتِ يا ${escapeHtml(state.studentName || "محققة")}, جمعتِ الأدلة وأصبحتِ جاهزة لإصدار الحكم.</p></div><div class="result-medal">🏅</div></div>
    <div class="result-score"><strong>${denominator ? `${total} / ${denominator}` : "—"}</strong><span>درجة من مجموع الدرجات المتاحة</span><strong class="percent">${denominator ? `${percent}%` : "—"}</strong><div style="margin-top:9px"><span class="result-badge ${label.cls}">${label.text}</span></div></div>
    <div class="result-columns"><section class="result-panel"><h4>تحليل محاور التحقيق</h4>${axisRows}</section><section class="result-panel"><h4>بيانات المشاركة</h4><p class="field-help">الطالبة: <b>${escapeHtml(state.studentName)}</b></p><p class="field-help">الفصل: <b>${escapeHtml(state.className)}</b></p><p class="field-help">المجموعة: <b>${escapeHtml(state.groupName || "لم يحدد")}</b></p><p class="field-help">المتجر: <b>${escapeHtml(state.storeName)}</b></p><p class="field-help">المعايير المكتملة: <b>${getAnswered().length} / 21</b></p><p class="field-help">المعايير غير المتاحة: <b>${getAnswered().filter(x => state.scores[x.id] === "NA").length}</b></p></section></div>
    <section class="result-panel" style="margin-top:14px"><h4>التوصية النهائية للمجموعة *</h4><div class="recommendations">${recommendOptions.map(value => `<label class="recommendation"><input type="radio" name="recommendation" value="${escapeHtml(value)}" ${state.recommendation === value ? "checked" : ""}><span>${value}</span></label>`).join("")}</div></section>
    ${renderPeerSection()}
    <section class="result-panel rewards-panel" style="margin-top:14px"><div class="rewards-heading"><div><h4>✨ رصيد الإنجاز والجوائز</h4><p class="field-help">تُمنح النقاط لإكمال العمل والتوثيق والتعاون، وليس لكون المتجر حصل على درجة مرتفعة.</p></div><div class="rewards-total"><b>${points.total}</b><small>/ 100</small></div></div>
      <div class="points-breakdown"><span>بيانات المهمة <b>${points.identity}/10</b></span><span>المحاور الخمسة <b>${points.axes}/75</b></span><span>توثيق الأدلة <b>${points.evidence}/10</b></span><span>تقييم الأقران <b>${points.peers}/5</b></span></div>
      <div class="badge-grid">${badges.map(b => `<div class="badge-tile ${b.unlocked ? "unlocked" : "locked"}"><span>${b.icon}</span><b>${b.title}</b><small>${b.unlocked ? "تم فتح الشارة" : b.desc}</small></div>`).join("")}</div>
    </section>
    <div class="soft-notice">هذه النتيجة تقيس المؤشرات الظاهرة التي أمكن فحصها فقط، ولا تعد شهادة تضمن سلامة المتجر. لا تنفذي عملية شراء حقيقية ولا تدخلي بيانات مالية.</div>
    <div class="save-panel"><b>📩 حفظ مشاركة المحققة</b><p>بعد اعتماد التوصية وإكمال تقييم الأقران، أرسلي مشاركتكِ لحفظ بياناتكِ ودرجات المعايير والتقييمات والإنجازات في Google Sheets.</p><div class="stage-actions" style="border:0;padding:0;margin:12px 0 0"><button class="btn btn-print" id="printBtn" type="button">طباعة / PDF</button><button class="btn btn-save" id="saveBtn" type="button" ${state.saving ? "disabled" : ""}>${state.saving ? "جارٍ الحفظ…" : "إرسال وحفظ المشاركة"} ←</button></div><div id="saveStatus" class="save-status" role="status"></div></div>
    <div class="stage-actions"><button class="btn btn-secondary" data-action="prev" type="button">→ مراجعة التقييم</button><button class="exit-icon exit-icon-lg js-exit" id="exitBtnResult" type="button" title="خروج من لوحة الطالبة" aria-label="خروج من لوحة الطالبة"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span>خروج</span></button><button class="copy-icon" id="copyBtn" type="button" title="نسخ التقرير" aria-label="نسخ التقرير">📋</button></div>
  </div>`;
}
function render() {
  renderStepper(); updateSidebar();
  if (state.stage === 1) stageContent.innerHTML = renderStudentStage();
  else if (state.stage === 2) stageContent.innerHTML = renderStoreStage();
  else if (state.stage >= 3 && state.stage <= 7) stageContent.innerHTML = renderAxisStage(state.stage - 3);
  else stageContent.innerHTML = renderResultsStage();
  bindStageEvents();
  persistDraft();
  updateScene(); updateTourBar(); checkAxisCompletion();
}

function collectCurrentInputs() {
  const ids = ["studentName", "className", "groupName", "membersText", "accessCode", "storeName", "storeUrl", "productType", "tradeModel"];
  ids.forEach(id => { const el = document.getElementById(id); if (el) state[id] = el.value.trim(); });
}
function validateStudent() {
  collectCurrentInputs();
  if (!state.studentName) return "اكتبي اسم الطالبة للمتابعة.";
  if (!/^ثالث [1-6]$/.test(state.className)) return "اختاري فصلًا من ثالث 1 إلى ثالث 6.";
  if (!state.groupName.trim()) return "اكتبي اسم المجموعة.";
  if (getMembers().length < 1) return "أضيفي اسم زميلة واحدة على الأقل لإكمال تقييم الأقران.";
  if (getMembers().length > 8) return "أضيفي ما لا يزيد على 8 زميلات في المجموعة.";
  return null;
}
function validateStore() {
  collectCurrentInputs();
  if (!state.storeName) return "اكتبي اسم المتجر الإلكتروني.";
  if (!state.storeUrl) return "أدخلي رابط المتجر.";
  try {
    const parsed = new URL(state.storeUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocol");
  } catch (_) { return "أدخلي رابطًا صحيحًا يبدأ بـ https:// أو http://"; }
  return null;
}
function validateAxis(axisIndex) {
  const axis = AXES[axisIndex];
  const missing = axis.items.filter(([id]) => state.scores[id] === undefined);
  if (missing.length) return `بقي ${missing.length} من المعايير دون تقييم في هذه المحطة.`;
  return null;
}
function goTo(stage) {
  if (stage < 1 || stage > 8) return;
  state.stage = stage; render();
  document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
}
function nextStage() {
  let error = null;
  if (state.stage === 1) error = validateStudent();
  else if (state.stage === 2) error = validateStore();
  else if (state.stage >= 3 && state.stage <= 7) error = validateAxis(state.stage - 3);
  else if (state.stage === 8 && !state.recommendation) error = "اختاري التوصية النهائية قبل الإرسال.";
  if (error) { showToast(error); return; }
  if (state.stage < 8) goTo(state.stage + 1);
}
function bindStageEvents() {
  const next = stageContent.querySelector('[data-action="next"]');
  const prev = stageContent.querySelector('[data-action="prev"]');
  if (next) next.addEventListener("click", nextStage);
  if (prev) prev.addEventListener("click", () => goTo(state.stage - 1));
  ["studentName", "className", "groupName", "membersText", "accessCode", "storeName", "storeUrl", "productType", "tradeModel"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => { state[id] = el.value.trim(); updateSidebar(); persistDraft(); });
    el.addEventListener("change", () => { state[id] = el.value.trim(); updateSidebar(); persistDraft(); });
  });
  stageContent.querySelectorAll('input[type="radio"][name^="score-"]').forEach(radio => radio.addEventListener("change", () => {
    const id = radio.name.replace("score-", "");
    state.scores[id] = radio.value === "NA" ? "NA" : Number(radio.value);
    render();
  }));
  stageContent.querySelectorAll("[data-note]").forEach(input => input.addEventListener("input", () => {
    state.notes[input.dataset.note] = input.value;
    persistDraft();
  }));
  stageContent.querySelectorAll('input[name="recommendation"]').forEach(input => input.addEventListener("change", () => {
    state.recommendation = input.value; persistDraft();
  }));
  stageContent.querySelectorAll('input[data-peer][data-peer-key]').forEach(input => input.addEventListener("change", () => {
    const name = input.dataset.peer, key = input.dataset.peerKey;
    if (!state.peerAssessments[name]) state.peerAssessments[name] = { scores: {}, positive: "", suggestion: "" };
    state.peerAssessments[name].scores[key] = Number(input.value);
    render();
  }));
  stageContent.querySelectorAll('input[data-peer-note]').forEach(input => input.addEventListener("input", () => {
    const name = input.dataset.peer, key = input.dataset.peerNote;
    if (!state.peerAssessments[name]) state.peerAssessments[name] = { scores: {}, positive: "", suggestion: "" };
    state.peerAssessments[name][key] = input.value;
    persistDraft();
  }));
  const saveBtn = $("#saveBtn");
  if (saveBtn) saveBtn.addEventListener("click", saveSubmission);
  const copyBtn = $("#copyBtn");
  if (copyBtn) copyBtn.addEventListener("click", copyReport);
  const printBtn = $("#printBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());
}

function makePayload() {
  return {
    submissionId: state.submissionId || (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`),
    studentName: state.studentName,
    className: state.className,
    groupName: state.groupName,
    members: getMembers(),
    peerAssessments: getMembers().map(peerName => ({ peerName, scores: state.peerAssessments[peerName]?.scores || {}, positive: state.peerAssessments[peerName]?.positive || "", suggestion: state.peerAssessments[peerName]?.suggestion || "" })),
    achievements: { points: achievementPoints(), badges: achievementBadges().filter(b => b.unlocked).map(b => b.title) },
    accessCode: state.accessCode,
    storeName: state.storeName,
    storeUrl: state.storeUrl,
    productType: state.productType,
    tradeModel: state.tradeModel,
    recommendation: state.recommendation,
    criteria: allCriteria().map(item => ({
      id: item.id, criterion: item.text, axisId: item.axisId, axisTitle: item.axisTitle,
      score: state.scores[item.id] === "NA" ? "NA" : Number(state.scores[item.id]),
      note: state.notes[item.id] || ""
    })),
    clientCreatedAt: new Date().toISOString(),
    honeypot: ""
  };
}
function jsonpStatus(url, submissionId) {
  return new Promise((resolve, reject) => {
    const callbackName = `__storeDetectiveCb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => finish(new Error("انتهت مهلة التحقق من الحفظ.")), 9000);
    function cleanup() { clearTimeout(timer); delete window[callbackName]; script.remove(); }
    function finish(error, result) { cleanup(); error ? reject(error) : resolve(result); }
    window[callbackName] = result => finish(null, result);
    script.onerror = () => finish(new Error("تعذر الاتصال بخدمة التحقق."));
    script.src = `${url}${url.includes("?") ? "&" : "?"}action=status&id=${encodeURIComponent(submissionId)}&callback=${callbackName}&_=${Date.now()}`;
    document.body.appendChild(script);
  });
}
async function confirmSaved(url, submissionId) {
  for (let attempt = 0; attempt < CONFIG.POLL_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, CONFIG.POLL_INTERVAL_MS));
    const status = await jsonpStatus(url, submissionId);
    if (status && status.found === true) return status;
  }
  throw new Error("لم يصل تأكيد من Google Sheets بعد. راجعي اتصال الخدمة أو أعيدي المحاولة.");
}
async function saveSubmission() {
  if (state.saving) return;
  if (!CONFIG.APPS_SCRIPT_URL) {
    setSaveStatus("أضيفي رابط Google Apps Script المنشور داخل CONFIG في ملف app.js أولًا.", "error");
    return;
  }
  if (!state.recommendation) { setSaveStatus("اختاري التوصية النهائية أولًا.", "error"); return; }
  if (getDenominator() === 0) { setSaveStatus("لا يمكن حفظ النتيجة؛ يجب أن يوجد معيار واحد على الأقل قابل للتقييم.", "error"); return; }
  if (getMissing()) { setSaveStatus("توجد معايير لم يتم تقييمها بعد.", "error"); return; }
  if (!peerComplete()) { setSaveStatus("أكملي تقييم جميع زميلات المجموعة قبل إرسال المشاركة.", "error"); return; }
  state.saving = true;
  const btn = $("#saveBtn"); if (btn) { btn.disabled = true; btn.textContent = "جارٍ إرسال التحقيق…"; }
  setSaveStatus("جارٍ إرسال البيانات والتحقق من وصولها إلى سجل المشروع…", "pending");
  const payload = makePayload();
  state.submissionId = payload.submissionId;
  persistDraft();
  try {
    const body = new URLSearchParams({ payload: JSON.stringify(payload) });
    // A simple form-encoded POST is a CORS-safelisted request. Its opaque response is not trusted;
    // success is confirmed separately through a JSONP status lookup by the unique submission ID.
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST", mode: "no-cors", redirect: "follow",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body
    });
    await confirmSaved(CONFIG.APPS_SCRIPT_URL, payload.submissionId);
    setSaveStatus("تم حفظ مشاركتكِ بنجاح في سجل المشروع. أحسنتِ يا محققة!", "success");
    showToast("وصلت مشاركتكِ بنجاح إلى سجل المشروع ✨");
    localStorage.removeItem(CONFIG.DRAFT_KEY);
    state.submissionId = null;
  } catch (error) {
    setSaveStatus(`${error.message} لم نحذف إجاباتكِ؛ يمكنك إعادة المحاولة.`, "error");
  } finally {
    state.saving = false;
    const save = $("#saveBtn"); if (save) { save.disabled = false; save.textContent = "إرسال وحفظ المشاركة ←"; }
  }
}
function setSaveStatus(message, type) {
  const el = $("#saveStatus"); if (!el) return;
  el.className = `save-status ${type}`; el.textContent = message;
}
function copyReport() {
  const text = [
    "استمارة محققة المتاجر الإلكترونية", `الطالبة: ${state.studentName}`, `الفصل: ${state.className}`,
    `المجموعة: ${state.groupName}`, `المتجر: ${state.storeName}`, `الرابط: ${state.storeUrl}`,
    `نوع المنتجات: ${state.productType}`, `نموذج التجارة: ${state.tradeModel}`,
    `النتيجة: ${getTotal()} من ${getDenominator()}`, `النسبة: ${getPercent()}%`, `التوصية: ${state.recommendation}`,
    ...AXES.map(axis => `\n${axis.title}\n${axis.items.map(([id, label]) => `${label}: ${state.scores[id] === "NA" ? "غير متاح" : state.scores[id]}${state.notes[id] ? ` — ${state.notes[id]}` : ""}`).join("\n")}`)
  ].join("\n");
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => showToast("تم نسخ التقرير.")).catch(() => fallbackCopy(text));
  else fallbackCopy(text);
}
function fallbackCopy(text) {
  const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select();
  try { document.execCommand("copy"); showToast("تم نسخ التقرير."); } catch (_) { showToast("تعذر النسخ تلقائيًا؛ استخدمي الطباعة."); }
  area.remove();
}
function showToast(message) {
  const toast = document.createElement("div"); toast.className = "toast"; toast.textContent = message;
  $("#toastRegion").appendChild(toast); setTimeout(() => toast.remove(), 3800);
}

$("#startBtn").addEventListener("click", () => { goTo(1); });
$("#howBtn").addEventListener("click", () => $("#helpDialog").showModal());
(function(){["#teacherLink","#teacherLinkFoot"].forEach(function(s){var el=$(s);if(el)el.href="teacher.html"})})();
$("#helpBtn").addEventListener("click", () => $("#helpDialog").showModal());
$("#closeHelp").addEventListener("click", () => $("#helpDialog").close());
$("#closeHelpBottom").addEventListener("click", () => $("#helpDialog").close());


/* ===== جولة بوليفارد الرياض: خلفيات المراحل ومسار الرحلة ومؤثر الإضاءة =====
   طبقة بصرية فقط: لا تقرأ ولا تكتب في بيانات الاستمارة ولا في الدرجات، وتتبع state.stage وحده. */
const SCENES = [
  { src: "assets/stage-01-investigator-gate.webp", place: "بوابة المحققة", short: "البوابة" },
  { src: "assets/stage-02-store-profile.webp", place: "بطاقة تعريف المتجر", short: "المتجر" },
  { src: "assets/stage-03-market-investigation.webp", place: "جزيرة الأسواق", short: "الأسواق" },
  { src: "assets/stage-04-shopping-experience.webp", place: "تجربة التسوق", short: "التسوق" },
  { src: "assets/stage-05-payment-laboratory.webp", place: "مختبر الدفع", short: "الدفع" },
  { src: "assets/stage-06-security-castle.webp", place: "قلعة الأمان والخصوصية", short: "الأمان" },
  { src: "assets/stage-07-fraud-detection.webp", place: "كشف الاحتيال الإلكتروني", short: "الاحتيال" },
  { src: "assets/stage-08-investigation-results.webp", place: "حصيلة التحقيق", short: "الحصيلة" }
];
const AXIS_GLOW = ["#ffd98a", "#ff9fd0", "#8fd3ff", "#b9a0ff", "#ffb985"];
const TOUR_MS = 1900;
const scene = { a: $("#sceneA"), b: $("#sceneB"), front: null, current: 0, timer: null, token: 0 };

function preloadScene(stage) {
  const item = SCENES[stage - 1]; if (!item) return;
  const img = new Image(); img.decoding = "async"; img.src = item.src;
}
function settleScene() {
  clearTimeout(scene.timer); scene.timer = null;
  [scene.a, scene.b].forEach(layer => { layer.className = "scene-layer" + (layer === scene.front ? " front" : ""); });
}
function showCaption(stage) {
  const el = $("#sceneCaption"); if (!el) return;
  el.innerHTML = `<span>📍</span><b>${SCENES[stage - 1].place}</b><small>المحطة ${stage} من 8</small>`;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 3400);
}
function updateScene() {
  if (!scene.a || state.stage === scene.current) return;
  const stage = state.stage, previous = scene.current, data = SCENES[stage - 1];
  if (!data) return;
  scene.current = stage;
  settleScene();
  const outgoing = scene.front;
  const incoming = scene.front === scene.a ? scene.b : scene.a;
  incoming.src = data.src;
  if (!outgoing) { scene.front = incoming; settleScene(); }
  else {
    const dir = stage > previous ? "fwd" : "back";
    const token = ++scene.token;
    const go = () => {
      if (token !== scene.token) return;
      scene.front = incoming;
      incoming.className = `scene-layer enter-${dir}`;
      outgoing.className = `scene-layer leave-${dir}`;
      const sweep = $("#sceneSweep"); if (sweep) { sweep.classList.remove("go"); void sweep.offsetWidth; sweep.classList.add("go"); }
      showCaption(stage);
      scene.timer = setTimeout(settleScene, TOUR_MS + 80);
    };
    (incoming.decode ? incoming.decode() : Promise.resolve()).then(go, go);
  }
  preloadScene(stage + 1); preloadScene(stage - 1);
}

function buildTourBar() {
  const list = $("#tourStops"); if (!list) return;
  list.innerHTML = SCENES.map((item, index) => `<li class="tour-stop"><button class="tour-dot" type="button" data-tour="${index + 1}" aria-label="${item.place}"><span></span></button><small>${item.short}</small></li>`).join("");
  list.addEventListener("click", event => {
    const dot = event.target.closest("[data-tour]"); if (!dot) return;
    const target = Number(dot.dataset.tour);
    if (target < state.stage) goTo(target);
  });
}
function updateTourBar() {
  const route = $("#tourRoute"); if (!route) return;
  route.style.setProperty("--p", String((state.stage - 1) / 7));
  route.querySelectorAll(".tour-stop").forEach((li, index) => {
    const n = index + 1, dot = li.querySelector(".tour-dot");
    li.classList.toggle("active", n === state.stage);
    li.classList.toggle("done", n < state.stage);
    dot.disabled = n >= state.stage;
    dot.querySelector("span").textContent = n < state.stage ? "✓" : String(n);
    if (n === state.stage) dot.setAttribute("aria-current", "step"); else dot.removeAttribute("aria-current");
  });
  const now = $("#tourNow");
  if (now) now.innerHTML = `<b>📍 ${SCENES[state.stage - 1].place}</b><span>المحطة ${state.stage} من 8</span>`;
}

const axisDone = new Set();
let axisReady = false;
function axisIsComplete(axis) { return axis.items.every(([id]) => state.scores[id] !== undefined); }
function checkAxisCompletion() {
  AXES.forEach((axis, index) => {
    const done = axisIsComplete(axis);
    if (done && !axisDone.has(index)) { axisDone.add(index); if (axisReady) fireAxisGlow(index); }
    else if (!done) axisDone.delete(index);
  });
}
function fireAxisGlow(index) {
  const glow = $("#sceneGlow");
  if (glow) {
    glow.style.setProperty("--glow", AXIS_GLOW[index]);
    glow.innerHTML = Array.from({ length: 16 }, (_, i) => `<i style="left:${8 + Math.random() * 60}%;top:${30 + Math.random() * 55}%;animation-delay:${(i * 60)}ms;font-size:${12 + Math.random() * 16}px">✦</i>`).join("");
    glow.classList.remove("burst"); void glow.offsetWidth; glow.classList.add("burst");
  }
  const card = stageContent.querySelector(".stage-card");
  if (card) { card.style.setProperty("--glow", AXIS_GLOW[index]); card.classList.add("axis-glow"); }
  const li = document.querySelectorAll(".tour-stop")[index + 2];
  if (li) li.classList.add("just-done");
  showToast(`✨ اكتمل محور «${AXES[index].short}» — أضاءت المحطة!`);
}

/* ===== الخروج من لوحة الطالبة: يمسح الجلسة المحلية ويعيد البداية، ولا يمس البيانات المحفوظة في Google Sheets ===== */
function hasUnsavedWork() {
  return !!(state.studentName || state.groupName || state.membersText || state.storeName || Object.keys(state.scores).length);
}
function openExitDialog() {
  if (state.saving) { showToast("يرجى الانتظار حتى ينتهي إرسال المشاركة ثم اخرجي."); return; }
  $("#exitMsg").textContent = hasUnsavedWork()
    ? "سيتم مسح بياناتكِ وإجاباتكِ غير المرسلة من هذا الجهاز والعودة إلى بوابة المحققة. المشاركات التي أُرسلت وحُفظت سابقًا لا تتأثر."
    : "ستعودين إلى بوابة المحققة.";
  $("#exitDialog").showModal();
}
function exitStudentPanel() {
  if (state.saving) return;
  $("#exitDialog").close();
  Object.keys(state).forEach(key => delete state[key]);
  Object.assign(state, JSON.parse(JSON.stringify(INITIAL_STATE)));
  axisDone.clear();
  try { localStorage.removeItem(CONFIG.DRAFT_KEY); } catch (_) { /* storage may be disabled */ }
  render();
  try { localStorage.removeItem(CONFIG.DRAFT_KEY); } catch (_) { /* storage may be disabled */ }
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("تم الخروج من لوحة الطالبة. نراكِ في مهمة جديدة! 👋");
}
document.addEventListener("click", e => { if (e.target.closest(".js-exit")) openExitDialog(); });
$("#exitStay").addEventListener("click", () => $("#exitDialog").close());
$("#exitConfirm").addEventListener("click", exitStudentPanel);

buildTourBar();
loadDraft();
AXES.forEach((axis, index) => { if (axisIsComplete(axis)) axisDone.add(index); });
render();
axisReady = true;
