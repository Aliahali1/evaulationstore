/*
 * إضافات تعليمية: أيقونات مرسومة، أصوات قصيرة، إرشادات «كيف أتحقق؟»، المستوى التدريبي، وملخص الإتقان.
 * تُحمَّل قبل app.js وتستخدم state/render المعرّفة فيه عند الاستدعاء فقط.
 */

/* ===== أيقونات SVG مرسومة (بدل الرموز التعبيرية) ===== */
const ICON_PATHS = {
  detective: '<path d="M3 11h18"/><path d="M6 11c0-4 2-7 6-7s6 3 6 7"/><circle cx="10" cy="17" r="3"/><path d="m12.2 19.2 3 3"/>',
  store: '<path d="m2 7 2.6-4h14.8L22 7"/><path d="M4 10v10h16V10"/><path d="M9 20v-5h6v5"/><path d="M2 7c0 1.7 1.3 3 3.3 3S8.7 8.7 8.7 7c0 1.7 1.3 3 3.3 3s3.3-1.3 3.3-3c0 1.7 1.3 3 3.3 3S22 8.7 22 7"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
  scan: '<circle cx="11" cy="11" r="6.5"/><path d="m20.5 20.5-4.6-4.6"/><path d="M11 8v3.4"/><path d="M11 14h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  gem: '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="m8 3 4 6 4-6"/><path d="m12 9-2 13M12 9l2 13" opacity=".5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14c2.5.3 4 2 4 5"/>',
  trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  medal: '<circle cx="12" cy="15" r="5.5"/><path d="m8.5 10.5-2.3-7.5h4.3l1.5 4M15.5 10.5l2.3-7.5h-4.3l-1.5 4"/><path d="m12 12.6.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
  sparkles: '<path d="M11 3l1.9 5.4L18.3 10.3l-5.4 1.9L11 17.6l-1.9-5.4L3.7 10.3l5.4-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9.5h.01M15 9.5h.01"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cross: '<path d="M18 6 6 18M6 6l12 12"/>',
  warn: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5"/><path d="M22 9v5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  flag: '<path d="M5 22V3"/><path d="M5 4h12l-2 4 2 4H5"/>'
};
function icon(name, cls = "") {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ""}</svg>`;
}
function fillIconSlots(root = document) {
  root.querySelectorAll("[data-ico]").forEach(el => { if (!el.firstChild) el.innerHTML = icon(el.dataset.ico); });
}

/* ===== أصوات قصيرة (WebAudio) مع زر كتم ===== */
const SOUND_KEY = "boulevard-store-detective-muted";
const sound = {
  ctx: null, muted: false,
  init() {
    try { this.muted = localStorage.getItem(SOUND_KEY) === "1"; } catch (_) { /* storage may be blocked */ }
    this.paint();
  },
  paint() {
    const btn = document.getElementById("soundBtn"); if (!btn) return;
    btn.innerHTML = icon(this.muted ? "mute" : "volume");
    btn.setAttribute("aria-pressed", String(this.muted));
    btn.title = this.muted ? "تشغيل الأصوات" : "كتم الأصوات";
    btn.setAttribute("aria-label", btn.title);
    btn.classList.toggle("is-muted", this.muted);
  },
  toggle() {
    this.muted = !this.muted;
    try { localStorage.setItem(SOUND_KEY, this.muted ? "1" : "0"); } catch (_) { /* ignore */ }
    this.paint();
    if (!this.muted) this.play("tick");
  },
  tone(freq, start, dur, type = "sine", gain = 0.07) {
    const ctx = this.ctx, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  },
  play(name) {
    if (this.muted) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === "suspended") this.ctx.resume();
      const seq = {
        tick: [[660, 0, .07]],
        stage: [[523, 0, .12], [659, .1, .16]],
        axis: [[523, 0, .13], [659, .11, .13], [784, .22, .13], [1047, .33, .28]],
        ok: [[698, 0, .1], [880, .09, .16]],
        bad: [[300, 0, .16, "triangle"], [240, .13, .2, "triangle"]],
        win: [[523, 0, .12], [659, .1, .12], [784, .2, .12], [1047, .3, .12], [1319, .42, .36]]
      }[name];
      if (seq) seq.forEach(([f, s, d, type]) => this.tone(f, s, d, type || "sine"));
    } catch (_) { /* audio is optional */ }
  }
};

/* ===== إرشادات «كيف أتحقق؟» لكل معيار ===== */
const HOWTO = {
  m1: ["انظري إلى أعلى الصفحة الرئيسية وتذييلها، وافتحي صفحة «من نحن».", "الاسم والشعار ظاهران في كل الصفحات، وصفحة «من نحن» تذكر اسم الشركة ومقرها."],
  m2: ["جرّبي القائمة الرئيسية وانتقلي بين ثلاثة أقسام على الأقل.", "القائمة تضم 6 أقسام واضحة، وأعود للرئيسية بنقرة واحدة."],
  m3: ["افتحي صفحة منتج واحد وانظري إلى الصور والوصف والمقاسات أو المواصفات.", "المنتج له 4 صور ووصف يذكر الخامة والمقاسات."],
  m4: ["قارني السعر في صفحة القسم وصفحة المنتج والسلة، وانظري هل السعر شامل الضريبة.", "السعر 120 ريالًا شامل الضريبة، والخصم 20% مكتوب معه السعر الأصلي."],
  m5: ["ابحثي عن شريط البحث، وخيار الترتيب أو التصفية، وزر المقارنة، وتقييمات العملاء تحت المنتج.", "يوجد بحث وترتيب حسب السعر وتقييمات بالنجوم مع تعليقات العملاء."],
  s1: ["أضيفي منتجًا إلى السلة دون إتمام الطلب، ثم غيّري الكمية وجرّبي الحذف.", "تغيّرت الكمية من 1 إلى 2 وتحدّث المجموع، وزر الحذف عمل."],
  s2: ["في صفحة المنتج ابحثي عن «متوفر» أو «نفد» أو الكمية المتبقية.", "تظهر عبارة «متوفر»، ويوجد خيار «أبلغني عند التوفر» للمنتج غير المتوفر."],
  s3: ["في السلة أو صفحة الشحن (دون إدخال بيانات) انظري إلى تكلفة الشحن ومدته ومناطق التغطية.", "الشحن 25 ريالًا خلال 3 أيام، ومجاني للطلبات فوق 300 ريال."],
  s4: ["افتحي «الأسئلة الشائعة» و«سياسة الإرجاع»، وابحثي عن رابط تتبع الشحنة.", "سياسة الإرجاع خلال 14 يومًا مكتوبة، ويوجد رابط لتتبع الشحنة."],
  p1: ["اذهبي إلى صفحة الدفع دون إدخال أي بيانات، أو انظري إلى شعارات الدفع أسفل الصفحة.", "تظهر خيارات: بطاقة، مدى، أبل باي، والدفع عند الاستلام."],
  p2: ["ابحثي عن شعارات وسائل دفع معروفة، وتأكدي أنها وسائل مألوفة وليست أسماء غريبة.", "المتجر يقبل مدى وفيزا وأبل باي."],
  p3: ["راجعي ملخص الطلب قبل زر التأكيد: المبلغ والرسوم والضريبة وخطوات الدفع.", "ملخص الطلب يعرض المجموع 345 ريالًا شامل الرسوم قبل زر التأكيد."],
  c1: ["انظري إلى شريط العنوان: هل يبدأ بـ https:// ويظهر رمز القفل؟ اضغطي على القفل لقراءة معلومات الاتصال.", "العنوان يبدأ بـ https:// ويظهر قفل، ولا يوجد تحذير من المتصفح."],
  c2: ["في تذييل الصفحة ابحثي عن شعار توثيق أو شهادة، ثم اضغطي عليه وتأكدي أنه يفتح موقع الجهة المُصدِرة ويذكر اسم المتجر.", "شعار التوثيق يفتح صفحة الجهة المصدرة ويظهر فيها اسم المتجر نفسه."],
  c3: ["افتحي رابط «سياسة الخصوصية» في التذييل، واقرئي ما تجمعه من بيانات ولماذا ومع من تشاركها.", "السياسة تذكر أنها تجمع الاسم والعنوان للتوصيل فقط ولا تبيع البيانات."],
  c4: ["هل يطلب المتجر كلمة المرور أو رمز التحقق عبر واتساب أو رسالة أو بريد؟ المتجر الموثوق لا يطلبها أبدًا.", "لا توجد أي رسالة تطلب الرمز، وفي الموقع تنبيه بعدم مشاركة رمز التحقق."],
  c5: ["افتحي صفحة إنشاء حساب (دون إنشائه) وانظري هل تشترط كلمة مرور قوية أو تحققًا بخطوتين.", "صفحة التسجيل تشترط 8 أحرف مع أرقام وتتيح رمز تحقق."],
  f1: ["اقرئي عنوان الموقع بتأنٍّ: حروف مكررة أو رموز أو نطاق غريب مثل .xyz أو اسم يشبه علامة مشهورة.", "العنوان shop-brand-sale99.xyz يشبه علامة معروفة، وهذه إشارة تحذير."],
  f2: ["قارني سعر منتج مع متجر معروف آخر؛ الخصم من 70% إلى 90% مع عدّاد تنازلي يثير الشك.", "حقيبة سعرها 900 ريال في متجر معروف تُباع هنا بـ 99 مع عدّاد تنازلي، وهذه إشارة تحذير."],
  f3: ["تأملي الصفحة: أخطاء إملائية، صور منسوخة أو ضعيفة الجودة، ترجمة ركيكة، ألوان غير متناسقة.", "توجد أخطاء إملائية في عناوين الأقسام وصور بجودة منخفضة."],
  f4: ["افتحي صفحة «اتصل بنا»: عنوان فعلي، بريد باسم نطاق المتجر، رقم هاتف، رقم سجل تجاري.", "يوجد بريد بنفس نطاق المتجر ورقم هاتف ورقم سجل تجاري."]
};
const openHints = new Set();
function howPanelHtml(id) {
  const h = HOWTO[id]; if (!h) return "";
  return `<div class="how-panel" id="how-${id}" ${openHints.has(id) ? "" : "hidden"}>
    <div class="how-row"><b>${icon("search")} أين أبحث؟</b><p>${h[0]}</p></div>
    <div class="how-row"><b>${icon("clipboard")} مثال لما يُعد دليلًا</b><p>«${h[1]}»</p></div>
    <small>اكتبي ما شاهدتِه أنتِ في المتجر الذي تفحصينه، لا نص المثال.</small>
  </div>`;
}
function howButtonHtml(id) {
  return `<button class="how-btn" type="button" data-how="${id}" aria-expanded="${openHints.has(id)}" aria-controls="how-${id}">${icon("help")}<span>كيف أتحقق؟</span></button>`;
}
function bindHowButtons(root) {
  root.querySelectorAll("[data-how]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.how, panel = document.getElementById(`how-${id}`); if (!panel) return;
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    open ? openHints.add(id) : openHints.delete(id);
    sound.play("tick");
  }));
}

/* ===== الدليل: إلزامي عند التقييم بـ 5 أو 0 ===== */
function hasEvidence(text) {
  const t = String(text || "").trim();
  return t.length >= 2; // تكفي كلمة واحدة
}
function needsEvidence(id) { return state.scores[id] === 5 || state.scores[id] === 0; }
function missingEvidenceIds() { return allCriteria().filter(c => needsEvidence(c.id) && !hasEvidence(state.notes[c.id])).map(c => c.id); }

/* ===== المستوى التدريبي: متجران وهميان بإجابات معروفة ===== */
const TRAINING = [
  {
    key: "A", name: "بوتيك نسمة", verdict: "trust",
    url: "https://www.nasma-boutique.com.sa", secure: true,
    mock: {
      banner: "تشكيلة الخريف وصلت", sub: "شحن خلال 3 أيام · إرجاع خلال 14 يومًا",
      items: [["عباءة كريب", "189 ر.س", ""], ["حقيبة جلد", "240 ر.س", "بدل 282 (خصم 15%)"], ["وشاح حرير", "95 ر.س", ""]],
      footer: ["سياسة الخصوصية", "الإرجاع والاستبدال", "اتصل بنا: info@nasma-boutique.com.sa · 800 123 4567", "سجل تجاري موثّق · مدى · Visa · Apple Pay"],
      alert: ""
    },
    checks: [
      ["هل يستخدم الموقع HTTPS مع رمز القفل؟", true, "العنوان يبدأ بـ https:// ويظهر قفل، وهذا أول مؤشر أمان (لكنه وحده لا يكفي).", "c1"],
      ["هل توجد سياسة خصوصية وإرجاع واضحة؟", true, "روابط «سياسة الخصوصية» و«الإرجاع» موجودة في التذييل، ومكتوب أن الإرجاع خلال 14 يومًا.", "c3"],
      ["هل بيانات التواصل واضحة ورسمية؟", true, "بريد باسم نطاق المتجر، ورقم هاتف، وسجل تجاري ظاهر.", "f4"],
      ["هل الخصم يبدو معقولًا؟", true, "خصم 15% مع ذكر السعر الأصلي، وهذا معتاد ولا يثير الشك.", "f2"],
      ["هل يطلب المتجر رمز تحقق أو كلمة مرور بطريقة مريبة؟", false, "لا يوجد أي طلب لرمز أو كلمة مرور، وهذا هو الوضع الطبيعي.", "c4"]
    ],
    verdictWhy: "أغلب المؤشرات إيجابية: اتصال آمن، سياسات واضحة، تواصل رسمي، وخصم معقول. الحكم المناسب: متجر موثوق (مع بقاء الحذر المعتاد)."
  },
  {
    key: "B", name: "سوبر ديل 99", verdict: "fraud",
    url: "http://supperr-deal99.shopp-xyz.top", secure: false,
    mock: {
      banner: "خصم 90% لأول 50 زبونة فقط!!", sub: "ينتهي العرض بعد 09:59 · اشترى الان وفر الكتير",
      items: [["حقيبة ماركة", "99 ر.س", "بدل 1,899"], ["ساعة ذكية", "49 ر.س", "بدل 899"], ["عطر فاخر", "29 ر.س", "بدل 750"]],
      footer: ["واتساب فقط: 05xxxxxxxx", "مبروك! أرسلي رمز التحقق الذي وصلكِ على واتساب لتأكيد جائزتكِ"],
      alert: "غير آمن"
    },
    checks: [
      ["هل يستخدم الموقع HTTPS مع رمز القفل؟", false, "العنوان يبدأ بـ http:// فقط والمتصفح يكتب «غير آمن».", "c1"],
      ["هل توجد سياسة خصوصية وإرجاع واضحة؟", false, "لا توجد روابط للسياسات في الصفحة.", "c3"],
      ["هل بيانات التواصل واضحة ورسمية؟", false, "واتساب فقط، بلا بريد رسمي أو عنوان أو سجل تجاري.", "f4"],
      ["هل الخصم يبدو معقولًا؟", false, "خصم يصل إلى 97% مع عدّاد تنازلي: ضغط لدفعكِ للشراء السريع، وهذه إشارة تحذير قوية.", "f2"],
      ["هل يطلب المتجر رمز تحقق أو كلمة مرور بطريقة مريبة؟", true, "طلب رمز التحقق عبر واتساب أسلوب احتيال معروف؛ المتجر الموثوق لا يطلبه أبدًا.", "c4"]
    ],
    verdictWhy: "عنوان غير آمن وغريب (.top)، وأخطاء لغوية، وخصومات مبالغ فيها، وتواصل مجهول، وطلب رمز تحقق. الحكم المناسب: متجر احتيالي."
  }
];
const VERDICTS = [["trust", "موثوق"], ["caution", "يحتاج حذرًا"], ["fraud", "احتيالي"]];
const TRAIN_TOTAL = TRAINING.reduce((s, t) => s + t.checks.length + 1, 0);

function trainingData() { if (!state.training || typeof state.training !== "object") state.training = {}; return state.training; }
function trainingAnswered() { return Object.keys(trainingData()).length; }
function trainingScore() {
  const tr = trainingData();
  return TRAINING.reduce((sum, t) => sum + t.checks.reduce((s, c, i) => s + (tr[`${t.key}${i}`] === c[1] ? 1 : 0), 0) + (tr[`${t.key}v`] === t.verdict ? 1 : 0), 0);
}
function trainingComplete() { return TRAINING.every(t => t.checks.every((_, i) => trainingData()[`${t.key}${i}`] !== undefined) && trainingData()[`${t.key}v`] !== undefined); }

function mockStoreHtml(t) {
  const m = t.mock;
  return `<figure class="mock-store ${t.secure ? "safe" : "risky"}" aria-label="صورة توضيحية لمتجر تدريبي">
    <div class="mock-bar"><span class="mock-dots"><i></i><i></i><i></i></span><span class="mock-url" dir="ltr">${t.secure ? icon("lock") : icon("warn")}<span>${t.url}</span>${m.alert ? `<em>${m.alert}</em>` : ""}</span></div>
    <div class="mock-page">
      <div class="mock-brand">${t.name}</div>
      <div class="mock-banner"><b>${m.banner}</b><small>${m.sub}</small></div>
      <div class="mock-items">${m.items.map(([n, p, o]) => `<div class="mock-item"><span class="mock-img"></span><b>${n}</b><span class="mock-price">${p}</span>${o ? `<small>${o}</small>` : ""}</div>`).join("")}</div>
      <div class="mock-footer">${m.footer.map(f => `<span>${f}</span>`).join("")}</div>
    </div>
    <figcaption>صورة توضيحية لمتجر وهمي صُمم للتدريب فقط.</figcaption>
  </figure>`;
}
function trainStoreHtml(t, number) {
  const tr = trainingData();
  const checks = t.checks.map(([q, answer, why, crit], i) => {
    const chosen = tr[`${t.key}${i}`], done = chosen !== undefined, right = chosen === answer;
    return `<div class="tq ${done ? (right ? "right" : "wrong") : ""}"><p>${i + 1}. ${q}</p>
      <div class="tq-btns">${[[true, "نعم"], [false, "لا"]].map(([val, label]) => `<button type="button" class="tq-btn ${done && chosen === val ? "picked" : ""}" data-tq="${t.key}${i}" data-val="${val}" ${done ? "disabled" : ""}>${label}</button>`).join("")}</div>
      ${done ? `<div class="tq-fb">${icon(right ? "check" : "cross")}<span><b>${right ? "إجابة صحيحة." : "ليست دقيقة."}</b> ${why}</span></div>` : ""}</div>`;
  }).join("");
  const vc = tr[`${t.key}v`], vdone = vc !== undefined, vright = vc === t.verdict;
  const allChecks = t.checks.every((_, i) => tr[`${t.key}${i}`] !== undefined);
  return `<section class="train-store"><h4><span class="train-num">${number}</span> المتجر ${number === 1 ? "الأول" : "الثاني"}: ${t.name}</h4>
    ${mockStoreHtml(t)}
    <div class="tq-list">${checks}</div>
    <div class="tq verdict ${vdone ? (vright ? "right" : "wrong") : ""} ${allChecks ? "" : "locked"}"><p>حكمكِ على هذا المتجر:</p>
      <div class="tq-btns">${VERDICTS.map(([val, label]) => `<button type="button" class="tq-btn ${vdone && vc === val ? "picked" : ""}" data-tq="${t.key}v" data-val="${val}" ${vdone || !allChecks ? "disabled" : ""}>${label}</button>`).join("")}</div>
      ${!allChecks ? `<small class="field-help">أجيبي عن الأسئلة الخمسة أولًا.</small>` : ""}
      ${vdone ? `<div class="tq-fb">${icon(vright ? "check" : "cross")}<span><b>${vright ? "حكم صحيح." : "الحكم المتوقع: " + VERDICTS.find(v => v[0] === t.verdict)[1] + "."}</b> ${t.verdictWhy}</span></div>` : ""}</div>
  </section>`;
}
function renderTrainingDialog() {
  const dlg = document.getElementById("trainDialog"); if (!dlg) return;
  const score = trainingScore(), done = trainingComplete();
  dlg.innerHTML = `<button class="dialog-close" id="trainClose" type="button" aria-label="إغلاق">×</button>
    <span class="section-kicker">مستوى تدريبي</span><h2>تدرّبي قبل فحص المتجر الحقيقي</h2>
    <p class="field-help">أمامكِ متجران وهميان. افحصي كل واحد، أجيبي، وستظهر لكِ إجابة فورية مع السبب، ثم احكمي عليه بنفسكِ.</p>
    <div class="train-progress"><span style="width:${Math.round(trainingAnswered() / TRAIN_TOTAL * 100)}%"></span></div>
    ${TRAINING.map((t, i) => trainStoreHtml(t, i + 1)).join("")}
    <div class="train-foot">${done ? `<div class="train-result">${icon("medal")}<span>أنهيتِ التدريب بدرجة <b>${score} من ${TRAIN_TOTAL}</b>. ${score >= TRAIN_TOTAL - 2 ? "أنتِ جاهزة للمتجر الحقيقي!" : "راجعي الأسباب أعلاه ثم انتقلي للمتجر الحقيقي بتركيز."}</span></div>` : `<small class="field-help">أجيبي عن كل الأسئلة وأصدري الحكمين لإنهاء التدريب (${trainingAnswered()} من ${TRAIN_TOTAL}).</small>`}
      <button class="btn btn-primary" id="trainDone" type="button" ${done ? "" : "disabled"}>${done ? "إنهاء التدريب" : "أكملي التدريب"}</button></div>`;
  dlg.querySelectorAll("[data-tq]").forEach(btn => btn.addEventListener("click", () => {
    const key = btn.dataset.tq, raw = btn.dataset.val;
    const val = key.endsWith("v") ? raw : raw === "true";
    const t = TRAINING.find(x => x.key === key[0]);
    const correct = key.endsWith("v") ? t.verdict === val : t.checks[Number(key.slice(1))][1] === val;
    trainingData()[key] = val;
    persistDraft();
    sound.play(correct ? "ok" : "bad");
    const scroller = dlg.scrollTop;
    renderTrainingDialog();
    dlg.scrollTop = scroller;
    if (trainingComplete()) sound.play("win");
  }));
  dlg.querySelector("#trainClose").addEventListener("click", closeTraining);
  dlg.querySelector("#trainDone").addEventListener("click", () => { closeTraining(); if (typeof render === "function") render(); });
}
function openTraining() {
  const dlg = document.getElementById("trainDialog"); if (!dlg) return;
  renderTrainingDialog();
  if (!dlg.open) dlg.showModal();
}
function closeTraining() { const dlg = document.getElementById("trainDialog"); if (dlg && dlg.open) dlg.close(); if (typeof render === "function") render(); }
function trainingCardHtml() {
  const done = trainingComplete(), n = trainingAnswered();
  return `<div class="train-card ${done ? "done" : ""}">
    <div class="train-ico">${icon(done ? "medal" : "cap")}</div>
    <div class="train-text"><b>${done ? "أنهيتِ المستوى التدريبي" : "مستوى تدريبي (مطلوب قبل المتجر الحقيقي)"}</b>
      <p>${done ? `درجتكِ ${trainingScore()} من ${TRAIN_TOTAL}. يمكنكِ إعادة النظر في الإجابات متى شئتِ.` : "افحصي متجرين وهميين، أحدهما موثوق والآخر احتيالي، واحصلي على تصحيح فوري قبل أن تحكمي بنفسكِ."}</p>
      ${!done && n ? `<small>أجبتِ عن ${n} من ${TRAIN_TOTAL}.</small>` : ""}</div>
    <button class="btn ${done ? "btn-secondary" : "btn-primary"}" id="openTrain" type="button">${done ? "مراجعة" : n ? "متابعة التدريب" : "ابدئي التدريب"}</button>
  </div>`;
}

/* ===== نواتج التعلم وملخص الإتقان (مستقل عن حكم الطالبة على المتجر) ===== */
const OUTCOMES = [
  { id: "o1", icon: "lock", title: "فحص عنوان المتجر والتحقق من استخدام HTTPS عند توفره", items: ["c1", "f1"] },
  { id: "o2", icon: "shield", title: "البحث عن شهادات أو شعارات ثقة يمكن التحقق من مصدرها وكتابة الدليل", items: ["c2"] },
  { id: "o3", icon: "eye", title: "البحث عن سياسة واضحة وقراءة ما يتعلق بالمعلومات الشخصية", items: ["c3", "c4"] },
  { id: "o4", icon: "mail", title: "التحقق من وضوح معلومات البائع والتواصل والشروط وتسجيل ما وُجد", items: ["m1", "f4", "s4"] },
  { id: "o5", icon: "scan", title: "فحص السعر المبالغ في انخفاضه والعروض المريبة والروابط المشبوهة وتسجيل إشارة التحذير", items: ["f2", "m4", "f3"] },
  { id: "o6", icon: "link", title: "ربط قرار التوصية للمتجر بالأدلة السابقة", items: [] }
];
function decisionConsistent() {
  const idx = [
    "نوصي بالتعامل معه بناءً على المؤشرات التي فحصناها.",
    "نوصي بالحذر والتحقق من بعض الجوانب أولًا.",
    "لا نوصي بالشراء حتى تتم معالجة علامات الخطر والتحقق من موثوقية المتجر."
  ].indexOf(state.recommendation);
  if (idx < 0 || !getDenominator()) return false;
  const p = getPercent();
  if (p >= 75) return idx <= 1;
  if (p >= 60) return idx === 1;
  return idx === 2;
}
function outcomeStatus(o) {
  if (o.id === "o6") {
    const evidenced = allCriteria().filter(c => hasEvidence(state.notes[c.id])).length;
    if (!state.recommendation) return { level: "low", text: "لم تُختَر توصية بعد.", pct: 0 };
    if (decisionConsistent() && evidenced >= 3 && !missingEvidenceIds().length) return { level: "high", text: "توصيتكِ متسقة مع نتيجتكِ وأدلتكِ المكتوبة.", pct: 100 };
    if (!decisionConsistent()) return { level: "mid", text: "راجعي توصيتكِ: هل تناسب درجات المعايير والإشارات التي سجّلتِها؟", pct: 50 };
    return { level: "mid", text: "التوصية متسقة، لكن وثّقي أدلة أكثر (3 على الأقل) تدعمها.", pct: 60 };
  }
  const avail = o.items.filter(id => state.scores[id] !== undefined && state.scores[id] !== "NA");
  if (!avail.length) return { level: "na", text: "لا معايير متاحة لهذا الناتج في متجركِ.", pct: 0 };
  const evid = avail.filter(id => hasEvidence(state.notes[id])).length;
  const pct = Math.round(evid / avail.length * 100);
  if (pct === 100) return { level: "high", text: "فحصتِ ووثّقتِ الدليل لكل معيار مرتبط.", pct };
  if (pct >= 50) return { level: "mid", text: "فحصتِ، لكن بقي دليل مكتوب لبعض المعايير المرتبطة.", pct };
  return { level: "low", text: "اكتبي ما شاهدتِه كدليل في المعايير المرتبطة.", pct };
}
function masterySummaryHtml() {
  const rows = OUTCOMES.map(o => ({ o, s: outcomeStatus(o) }));
  const counted = rows.filter(r => r.s.level !== "na");
  const mastered = counted.filter(r => r.s.level === "high").length;
  const levelName = !counted.length ? "—" : mastered === counted.length ? "متقنة" : mastered >= Math.ceil(counted.length / 2) ? "متمكنة" : "في الطريق";
  const mark = { high: "check", mid: "target", low: "flag", na: "help" };
  return `<section class="result-panel mastery-panel" style="margin-top:14px">
    <div class="mastery-head"><div><h4>${icon("cap")} ملخص إتقانكِ</h4><p class="field-help">هذا الملخص عن <b>تعلّمكِ أنتِ</b> وطريقة فحصكِ، وهو منفصل عن حكمكِ على المتجر.</p></div>
      <div class="mastery-level"><b>${levelName}</b><small>${mastered} من ${counted.length} نواتج</small></div></div>
    ${rows.map(({ o, s }) => `<div class="outcome-row ${s.level}"><span class="outcome-mark">${icon(mark[s.level])}</span><div><b>${o.title}</b><small>${s.text}</small></div><span class="outcome-pct">${s.level === "na" ? "—" : s.pct + "%"}</span></div>`).join("")}
    <div class="outcome-row ${trainingComplete() ? "high" : "low"}"><span class="outcome-mark">${icon(trainingComplete() ? "medal" : "cap")}</span><div><b>المستوى التدريبي</b><small>${trainingComplete() ? "أنهيتِ التدريب على المتجرين الوهميين." : "لم يُنهَ التدريب بعد."}</small></div><span class="outcome-pct">${trainingComplete() ? trainingScore() + "/" + TRAIN_TOTAL : "—"}</span></div>
  </section>`;
}
