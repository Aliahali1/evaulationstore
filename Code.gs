/**
 * مغامرة محققة المتجر الإلكتروني — الخادم (Google Apps Script)
 * - يستقبل المشاركات ويحفظها في Google Sheets الخاص بحساب المعلمة.
 * - يؤكد حالة الحفظ للموقع (JSONP).
 * - يقدّم "صفحة المعلمة" على الرابط: <رابط /exec>?page=teacher  (محمية برمز المعلمة).
 *
 * خطوات الإعداد (مرة واحدة):
 *  1) setupProject      : إنشاء ملف Google Sheets والأوراق.
 *  2) setClassAccessCode: ضبط رمز دخول الطالبات (غيّري القيمة ثم شغّليها).
 *  3) setTeacherCode    : ضبط رمز المعلمة (غيّري القيمة ثم شغّليها).
 *  4) Deploy > New deployment > Web app (Execute as: Me) ثم اختيار من يصل إلى الرابط.
 */

var SHEET_NAMES = {
  records: 'Student_Records',
  store: 'Store_Info',
  criteria: 'Criteria_Scores',
  summary: 'Assessment_Summary',
  peers: 'Peer_Assessment',
  achievements: 'Achievements'
};

var HEADERS = {
  Student_Records: ['submissionId', 'receivedAt', 'studentName', 'className', 'groupName', 'members', 'recommendation', 'clientCreatedAt'],
  Store_Info: ['submissionId', 'studentName', 'className', 'storeName', 'storeUrl', 'productType', 'tradeModel'],
  Criteria_Scores: ['submissionId', 'studentName', 'className', 'storeName', 'axisId', 'axisTitle', 'criterionId', 'criterion', 'score', 'note'],
  Assessment_Summary: ['submissionId', 'receivedAt', 'studentName', 'className', 'groupName', 'storeName', 'totalScore', 'maxScore', 'percent', 'naCount', 'recommendation'],
  Peer_Assessment: ['submissionId', 'assessor', 'className', 'groupName', 'peerName', 'contribution', 'role', 'collaboration', 'ideas', 'respect', 'average', 'positive', 'suggestion'],
  Achievements: ['submissionId', 'studentName', 'className', 'identityPts', 'axesPts', 'evidencePts', 'peersPts', 'totalPts', 'badges']
};

var PEER_KEYS = ['contribution', 'role', 'collaboration', 'ideas', 'respect'];
var EXPECTED_CRITERIA = 21;

/* ---------- الإعداد (تُشغّل يدويًا من المحرر) ---------- */

function setupProject() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  var ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('مغامرة محققة المتجر الإلكتروني - السجل');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]).setFontWeight('bold').setBackground('#e9defa');
      sh.setFrozenRows(1);
    }
  });
  var first = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1') || ss.getSheetByName('ورقة1');
  if (first && ss.getSheets().length > 1) ss.deleteSheet(first);
  Logger.log('رابط ملف Google Sheets: ' + ss.getUrl());
  return ss.getUrl();
}

function setClassAccessCode() {
  var code = 'CHANGE-THIS-CLASS-CODE'; // استبدليه برمز قوي ثم شغّلي الدالة مرة واحدة
  if (!code || code === 'CHANGE-THIS-CLASS-CODE') {
    throw new Error('غيّري قيمة code إلى رمز صف قوي قبل التشغيل.');
  }
  PropertiesService.getScriptProperties().setProperty('CLASS_ACCESS_CODE', code);
  Logger.log('تم حفظ رمز دخول الصف.');
}

function setTeacherCode() {
  var code = 'CHANGE-THIS-TEACHER-CODE'; // رمز المعلمة لصفحة الإدارة، يختلف عن رمز الصف
  if (!code || code === 'CHANGE-THIS-TEACHER-CODE' || code.length < 8) {
    throw new Error('غيّري قيمة code إلى رمز معلمة قوي (8 أحرف فأكثر) قبل التشغيل.');
  }
  PropertiesService.getScriptProperties().setProperty('TEACHER_CODE', code);
  Logger.log('تم حفظ رمز المعلمة.');
}

/* ---------- استقبال المشاركات ---------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var raw = e && e.parameter && e.parameter.payload;
    if (!raw) return respond_({ ok: false, error: 'no_payload' });
    var p = JSON.parse(raw);
    var err = validate_(p);
    if (err) return respond_({ ok: false, error: err });

    var ss = openSpreadsheet_();
    if (findSubmission_(ss, p.submissionId)) return respond_({ ok: true, duplicate: true });

    var now = new Date();
    var members = (p.members || []).join('، ');
    var calc = calculate_(p.criteria);

    append_(ss, SHEET_NAMES.records, [[p.submissionId, now, p.studentName, p.className, p.groupName, members, p.recommendation, p.clientCreatedAt || '']]);
    append_(ss, SHEET_NAMES.store, [[p.submissionId, p.studentName, p.className, p.storeName, p.storeUrl, p.productType, p.tradeModel]]);

    append_(ss, SHEET_NAMES.criteria, p.criteria.map(function (c) {
      return [p.submissionId, p.studentName, p.className, p.storeName, c.axisId, c.axisTitle, c.id, c.criterion, c.score, c.note || ''];
    }));

    append_(ss, SHEET_NAMES.peers, (p.peerAssessments || []).map(function (a) {
      var s = a.scores || {};
      var vals = PEER_KEYS.map(function (k) { return Number(s[k]) || 0; });
      var avg = vals.reduce(function (x, y) { return x + y; }, 0) / PEER_KEYS.length;
      return [p.submissionId, p.studentName, p.className, p.groupName, a.peerName].concat(vals, [Math.round(avg * 100) / 100, a.positive || '', a.suggestion || '']);
    }));

    var ach = p.achievements || {};
    var pts = ach.points || {};
    append_(ss, SHEET_NAMES.achievements, [[p.submissionId, p.studentName, p.className, pts.identity || 0, pts.axes || 0, pts.evidence || 0, pts.peers || 0, pts.total || 0, (ach.badges || []).join('، ')]]);

    // يُكتب الملخص أخيرًا: وجوده يعني اكتمال الحفظ
    append_(ss, SHEET_NAMES.summary, [[p.submissionId, now, p.studentName, p.className, p.groupName, p.storeName, calc.total, calc.max, calc.percent, calc.na, p.recommendation]]);

    return respond_({ ok: true });
  } catch (error) {
    return respond_({ ok: false, error: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ---------- GET: حالة الحفظ (JSONP) + صفحة المعلمة ---------- */

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.page === 'teacher') {
    return HtmlService.createHtmlOutput(teacherHtml_())
      .setTitle('لوحة المعلمة - مغامرة محققة المتجر')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  var callback = String(params.callback || '');
  var result = { found: false };
  if (params.action === 'status' && params.id) {
    try {
      result.found = !!findSubmission_(openSpreadsheet_(), String(params.id));
    } catch (_) { result.found = false; }
  }
  if (/^[A-Za-z_$][A-Za-z0-9_$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return respond_(result);
}

/* ---------- واجهات صفحة المعلمة (تُستدعى عبر google.script.run) ---------- */

function teacherData(code) {
  teacherAuth_(code);
  var ss = openSpreadsheet_();

  var summary = readSheet_(ss, SHEET_NAMES.summary);
  var criteria = {}, peers = {}, ach = {};

  readSheet_(ss, SHEET_NAMES.criteria).forEach(function (r) {
    (criteria[r[0]] = criteria[r[0]] || []).push([r[5], r[6], r[7], r[8], r[9]]);
  });
  readSheet_(ss, SHEET_NAMES.peers).forEach(function (r) {
    (peers[r[0]] = peers[r[0]] || []).push(r.slice(4));
  });
  readSheet_(ss, SHEET_NAMES.achievements).forEach(function (r) {
    ach[r[0]] = r.slice(3);
  });

  return { summary: summary, criteria: criteria, peers: peers, ach: ach, sheetUrl: ss.getUrl() };
}

function teacherDelete(code, submissionId) {
  teacherAuth_(code);
  if (!submissionId) throw new Error('معرّف المشاركة مفقود.');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = openSpreadsheet_();
    var removed = 0;
    Object.keys(SHEET_NAMES).forEach(function (key) {
      var sh = ss.getSheetByName(SHEET_NAMES[key]);
      var last = sh.getLastRow();
      if (last < 2) return;
      var ids = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]) === String(submissionId)) { sh.deleteRow(i + 2); removed++; }
      }
    });
    return { ok: true, removed: removed };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- دوال مساعدة ---------- */

function teacherAuth_(code) {
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('teacher_fails') || 0);
  if (fails >= 8) throw new Error('محاولات كثيرة خاطئة. انتظري 10 دقائق ثم أعيدي المحاولة.');
  var expected = PropertiesService.getScriptProperties().getProperty('TEACHER_CODE');
  if (!expected) throw new Error('لم يُضبط رمز المعلمة بعد (شغّلي setTeacherCode).');
  if (!safeEqual_(String(code || ''), expected)) {
    cache.put('teacher_fails', String(fails + 1), 600);
    throw new Error('رمز المعلمة غير صحيح.');
  }
  cache.remove('teacher_fails');
}

function safeEqual_(a, b) {
  var len = Math.max(a.length, b.length), diff = a.length ^ b.length;
  for (var i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function readSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  return values.map(function (row) {
    return row.map(function (v) { return v instanceof Date ? v.toISOString() : v; });
  });
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function openSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('شغّلي setupProject أولًا.');
  return SpreadsheetApp.openById(id);
}

function append_(ss, name, rows) {
  if (!rows || !rows.length) return;
  var sh = ss.getSheetByName(name);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function findSubmission_(ss, id) {
  var sh = ss.getSheetByName(SHEET_NAMES.summary);
  var last = sh.getLastRow();
  if (last < 2) return false;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return true;
  return false;
}

function calculate_(criteria) {
  var total = 0, count = 0, na = 0;
  criteria.forEach(function (c) {
    if (c.score === 'NA') { na++; return; }
    total += Number(c.score); count++;
  });
  var max = count * 5;
  return { total: total, max: max, na: na, percent: max ? Math.round(total / max * 100) : 0 };
}

function validate_(p) {
  if (!p || typeof p !== 'object') return 'bad_payload';
  if (p.honeypot) return 'rejected';
  var expected = PropertiesService.getScriptProperties().getProperty('CLASS_ACCESS_CODE');
  if (!expected) return 'access_code_not_configured';
  if (!safeEqual_(String(p.accessCode || ''), expected)) return 'invalid_access_code';
  if (!p.submissionId || String(p.submissionId).length > 80) return 'bad_submission_id';
  if (!p.studentName || String(p.studentName).length > 80) return 'bad_student_name';
  if (!/^ثالث [1-6]$/.test(String(p.className || ''))) return 'bad_class';
  if (!p.groupName || String(p.groupName).length > 60) return 'bad_group';
  if (!p.storeName || String(p.storeName).length > 120) return 'bad_store';
  if (!/^https?:\/\//i.test(String(p.storeUrl || '')) || String(p.storeUrl).length > 500) return 'bad_url';
  if (!p.recommendation) return 'no_recommendation';
  if (!Array.isArray(p.criteria) || p.criteria.length !== EXPECTED_CRITERIA) return 'bad_criteria';
  var okScores = { '0': 1, '3': 1, '5': 1, 'NA': 1 };
  var available = 0;
  for (var i = 0; i < p.criteria.length; i++) {
    var s = String(p.criteria[i].score);
    if (!okScores[s]) return 'bad_score';
    if (s !== 'NA') available++;
  }
  if (available === 0) return 'no_available_criteria';
  var peers = p.peerAssessments || [];
  if (!peers.length || peers.length > 8) return 'bad_peers';
  for (var j = 0; j < peers.length; j++) {
    for (var k = 0; k < PEER_KEYS.length; k++) {
      var v = Number((peers[j].scores || {})[PEER_KEYS[k]]);
      if (!(v >= 1 && v <= 4)) return 'bad_peer_score';
    }
  }
  return null;
}

/* ---------- صفحة المعلمة (HTML) ---------- */

function teacherHtml_() {
  return [
'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><base target="_top">',
'<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">',
'<style>',
':root{--ink:#35294b;--muted:#81778f;--purple:#7958bd;--line:#eee8f5;--good:#2f9a74;--warn:#b98524;--bad:#b3505d}',
'*{box-sizing:border-box}body{margin:0;font-family:Tajawal,Tahoma,Arial,sans-serif;color:var(--ink);background:linear-gradient(140deg,#f6f0ff,#f2f8ff 45%,#fff5fa);min-height:100vh}',
'button,input,select{font:inherit}.wrap{max-width:1250px;margin:auto;padding:18px}',
'.card{background:#fff;border:1px solid #fff;border-radius:20px;box-shadow:0 14px 38px rgba(75,49,113,.10);padding:18px}',
'#login{max-width:420px;margin:12vh auto}#login h1{font-size:22px;margin:0 0 6px}#login p{color:var(--muted);font-size:13px;line-height:1.7;margin:0 0 14px}',
'input,select{width:100%;border:1px solid #e7e0ee;border-radius:12px;padding:11px 12px;background:#fff;color:var(--ink);outline:none}input:focus,select:focus{border-color:#a78cda;box-shadow:0 0 0 3px #a78cda25}',
'.btn{border:0;border-radius:12px;padding:10px 16px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#8061be,#70b5d7);color:#fff}.btn.sec{background:#f4f0f8;color:#755a9c;border:1px solid #ebe3f3}.btn.del{background:#fff0f1;color:var(--bad);border:1px solid #f0c9ce}.btn:disabled{opacity:.5;cursor:not-allowed}',
'.top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.top h1{font-size:22px;margin:0}.top small{color:var(--muted)}.actions{display:flex;gap:8px;flex-wrap:wrap}',
'.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.stat{background:#fff;border-radius:16px;padding:14px;box-shadow:0 8px 22px rgba(75,49,113,.08)}.stat b{display:block;font-size:28px;color:var(--purple)}.stat span{font-size:12px;color:var(--muted)}',
'.classes{display:grid;gap:8px;margin-bottom:14px}.crow{display:grid;grid-template-columns:90px 1fr 110px;gap:10px;align-items:center;font-size:12px}.bar{height:9px;background:#f0ecf4;border-radius:20px;overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,#8e72c8,#79bdd9)}',
'.filters{display:grid;grid-template-columns:200px 1fr 200px;gap:10px;margin-bottom:12px}',
'.tbl{overflow:auto;border-radius:14px;border:1px solid var(--line)}table{width:100%;border-collapse:collapse;font-size:13px;min-width:900px}th,td{padding:10px;border-bottom:1px solid var(--line);text-align:right;vertical-align:top}th{background:#f8f4ff;color:#6a5888;position:sticky;top:0;cursor:pointer;white-space:nowrap}tr:hover td{background:#fcfaff}',
'.pill{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:800}.pill.good{background:#e8f8ef;color:var(--good)}.pill.warn{background:#fff5df;color:var(--warn)}.pill.bad{background:#fff0f0;color:var(--bad)}',
'.empty{padding:30px;text-align:center;color:var(--muted)}.err{color:var(--bad);font-size:13px;margin-top:10px;min-height:18px}',
'.modal{position:fixed;inset:0;background:#27183b88;display:none;align-items:flex-start;justify-content:center;padding:24px;overflow:auto;z-index:10}.modal.on{display:flex}.sheet{background:#fff;border-radius:20px;max-width:900px;width:100%;padding:22px}',
'.sheet h2{margin:0 0 4px}.sheet h3{margin:18px 0 8px;font-size:15px;color:#6a5888}.kv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:12px;color:var(--muted)}.kv b{color:var(--ink)}',
'.crit{display:grid;grid-template-columns:1fr 70px;gap:8px;padding:7px 0;border-top:1px dashed var(--line);font-size:12px}.crit small{display:block;color:var(--muted);margin-top:2px}',
'@media(max-width:760px){.stats{grid-template-columns:1fr 1fr}.filters{grid-template-columns:1fr}.kv{grid-template-columns:1fr}.crow{grid-template-columns:70px 1fr 90px}}',
'</style></head><body>',

'<div id="login" class="card"><h1>لوحة المعلمة</h1><p>أدخلي رمز المعلمة لعرض مشاركات الطالبات وإدارتها. الرمز يختلف عن رمز دخول الصف.</p>',
'<input id="code" type="password" autocomplete="off" placeholder="رمز المعلمة"><div class="err" id="loginErr"></div>',
'<div style="margin-top:12px"><button class="btn" id="loginBtn" style="width:100%">دخول</button></div></div>',

'<div id="app" class="wrap" hidden>',
'<div class="top"><div><h1>لوحة المعلمة · مغامرة محققة المتجر</h1><small id="updated"></small></div>',
'<div class="actions"><button class="btn sec" id="refreshBtn">تحديث</button><button class="btn sec" id="csvBtn">تصدير CSV</button><button class="btn sec" id="sheetBtn">فتح Google Sheets</button><button class="btn del" id="logoutBtn">خروج</button></div></div>',
'<div class="stats"><div class="stat"><b id="sCount">0</b><span>عدد المشاركات</span></div><div class="stat"><b id="sAvg">—</b><span>متوسط نسبة المتاجر</span></div><div class="stat"><b id="sPts">—</b><span>متوسط نقاط الإنجاز / 100</span></div><div class="stat"><b id="sGroups">0</b><span>عدد المجموعات</span></div></div>',
'<div class="card" style="margin-bottom:14px"><b>المشاركات حسب الفصل</b><div class="classes" id="classes" style="margin-top:12px"></div></div>',
'<div class="card"><div class="filters"><select id="fClass"><option value="">كل الفصول</option></select><input id="fSearch" placeholder="بحث باسم الطالبة أو المجموعة أو المتجر"><select id="fSort"><option value="new">الأحدث أولًا</option><option value="old">الأقدم أولًا</option><option value="pct">الأعلى نسبة</option><option value="pts">الأعلى نقاط إنجاز</option><option value="name">الاسم</option></select></div>',
'<div class="tbl"><table><thead><tr><th>#</th><th>الطالبة</th><th>الفصل</th><th>المجموعة</th><th>المتجر</th><th>الدرجة</th><th>النسبة</th><th>نقاط الإنجاز</th><th>التوصية</th><th>التاريخ</th><th></th></tr></thead><tbody id="rows"></tbody></table></div><div id="empty" class="empty" hidden>لا توجد مشاركات مطابقة.</div></div>',
'</div>',

'<div class="modal" id="modal"><div class="sheet"><div id="detail"></div><div style="margin-top:16px;text-align:left"><button class="btn sec" id="closeBtn">إغلاق</button></div></div></div>',

'<script>',
'var CODE="",DATA=null;',
'function $(id){return document.getElementById(id)}',
'function esc(s){return String(s==null?"":s).replace(/[&<>"\']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"}[c]})}',
'function fmt(d){try{return new Date(d).toLocaleString("ar-SA",{dateStyle:"medium",timeStyle:"short"})}catch(e){return d}}',
'function cls(p){return p>=75?"good":p>=60?"warn":"bad"}',
'function fail(e){var m=(e&&e.message)||String(e);m=m.replace(/^Error:\\s*/,"");$("loginErr").textContent=m;$("loginBtn").disabled=false;$("refreshBtn").disabled=false;if(!$("app").hidden)alert(m)}',
'function load(){$("loginBtn").disabled=true;$("refreshBtn").disabled=true;google.script.run.withSuccessHandler(function(d){DATA=d;$("login").hidden=true;$("app").hidden=false;$("loginBtn").disabled=false;$("refreshBtn").disabled=false;$("updated").textContent="آخر تحديث: "+new Date().toLocaleTimeString("ar-SA");fillClasses();render()}).withFailureHandler(fail).teacherData(CODE)}',
'$("loginBtn").onclick=function(){CODE=$("code").value.trim();$("loginErr").textContent="";if(!CODE){$("loginErr").textContent="اكتبي الرمز.";return}load()};',
'$("code").onkeydown=function(e){if(e.key==="Enter")$("loginBtn").click()};',
'$("refreshBtn").onclick=load;',
'$("logoutBtn").onclick=function(){CODE="";DATA=null;$("app").hidden=true;$("login").hidden=false;$("code").value=""};',
'$("sheetBtn").onclick=function(){if(DATA)window.open(DATA.sheetUrl,"_blank")};',
'$("fClass").onchange=$("fSearch").oninput=$("fSort").onchange=render;',
'$("closeBtn").onclick=function(){$("modal").classList.remove("on")};',
'function fillClasses(){var cur=$("fClass").value;var set={};DATA.summary.forEach(function(r){set[r[3]]=1});var h="<option value=\\"\\">كل الفصول</option>";Object.keys(set).sort().forEach(function(c){h+="<option>"+esc(c)+"</option>"});$("fClass").innerHTML=h;$("fClass").value=cur}',
'function filtered(){var c=$("fClass").value,q=$("fSearch").value.trim().toLowerCase(),s=$("fSort").value;var rows=DATA.summary.filter(function(r){if(c&&r[3]!==c)return false;if(q&&(r[2]+" "+r[4]+" "+r[5]).toLowerCase().indexOf(q)<0)return false;return true});',
' var pts=function(r){var a=DATA.ach[r[0]];return a?Number(a[4]):0};',
' rows.sort(function(a,b){if(s==="old")return new Date(a[1])-new Date(b[1]);if(s==="pct")return b[8]-a[8];if(s==="pts")return pts(b)-pts(a);if(s==="name")return String(a[2]).localeCompare(String(b[2]),"ar");return new Date(b[1])-new Date(a[1])});return rows}',
'function render(){var all=DATA.summary,rows=filtered();',
' $("sCount").textContent=all.length;var avg=all.length?Math.round(all.reduce(function(s,r){return s+Number(r[8])},0)/all.length):null;$("sAvg").textContent=avg==null?"—":avg+"%";',
' var tp=0,tn=0;all.forEach(function(r){var a=DATA.ach[r[0]];if(a){tp+=Number(a[4]);tn++}});$("sPts").textContent=tn?Math.round(tp/tn):"—";',
' var g={};all.forEach(function(r){g[r[3]+"|"+r[4]]=1});$("sGroups").textContent=Object.keys(g).length;',
' var byC={};all.forEach(function(r){var o=byC[r[3]]=byC[r[3]]||{n:0,s:0};o.n++;o.s+=Number(r[8])});var ch="";Object.keys(byC).sort().forEach(function(k){var o=byC[k],a=Math.round(o.s/o.n);ch+="<div class=\\"crow\\"><span>"+esc(k)+"</span><div class=\\"bar\\"><i style=\\"width:"+a+"%\\"></i></div><span>"+o.n+" مشاركة · "+a+"%</span></div>"});$("classes").innerHTML=ch||"<span class=\\"empty\\">لا توجد بيانات بعد.</span>";',
' var h="";rows.forEach(function(r,i){var a=DATA.ach[r[0]],p=Number(r[8]);h+="<tr><td>"+(i+1)+"</td><td><b>"+esc(r[2])+"</b></td><td>"+esc(r[3])+"</td><td>"+esc(r[4])+"</td><td>"+esc(r[5])+"</td><td>"+esc(r[6])+" / "+esc(r[7])+"</td><td><span class=\\"pill "+cls(p)+"\\">"+p+"%</span></td><td>"+(a?esc(a[4]):"—")+"</td><td style=\\"max-width:240px;font-size:12px\\">"+esc(r[10])+"</td><td style=\\"white-space:nowrap;font-size:12px\\">"+esc(fmt(r[1]))+"</td><td style=\\"white-space:nowrap\\"><button class=\\"btn sec\\" data-v=\\""+esc(r[0])+"\\">تفاصيل</button> <button class=\\"btn del\\" data-d=\\""+esc(r[0])+"\\">حذف</button></td></tr>"});',
' $("rows").innerHTML=h;$("empty").hidden=rows.length>0;',
' Array.prototype.forEach.call(document.querySelectorAll("[data-v]"),function(b){b.onclick=function(){detail(b.getAttribute("data-v"))}});',
' Array.prototype.forEach.call(document.querySelectorAll("[data-d]"),function(b){b.onclick=function(){del(b.getAttribute("data-d"))}})}',
'function sc(v){return v==="NA"?"<span class=\\"pill warn\\">غير متاح</span>":v==5?"<span class=\\"pill good\\">5</span>":v==3?"<span class=\\"pill warn\\">3</span>":"<span class=\\"pill bad\\">0</span>"}',
'function detail(id){var r=DATA.summary.filter(function(x){return x[0]===id})[0];if(!r)return;var a=DATA.ach[id],cr=DATA.criteria[id]||[],pe=DATA.peers[id]||[];',
' var h="<h2>"+esc(r[2])+"</h2><div class=\\"kv\\"><span>الفصل: <b>"+esc(r[3])+"</b></span><span>المجموعة: <b>"+esc(r[4])+"</b></span><span>المتجر: <b>"+esc(r[5])+"</b></span><span>الدرجة: <b>"+esc(r[6])+" / "+esc(r[7])+" ("+esc(r[8])+"%)</b></span><span>معايير غير متاحة: <b>"+esc(r[9])+"</b></span><span>التاريخ: <b>"+esc(fmt(r[1]))+"</b></span></div><p style=\\"font-size:13px\\"><b>التوصية:</b> "+esc(r[10])+"</p>";',
' h+="<h3>المعايير</h3>";var ax="";cr.forEach(function(c){if(c[0]!==ax){ax=c[0];h+="<div style=\\"margin-top:12px;font-weight:800;font-size:13px\\">"+esc(ax)+"</div>"}h+="<div class=\\"crit\\"><div>"+esc(c[2])+(c[4]?"<small>الدليل: "+esc(c[4])+"</small>":"")+"</div><div>"+sc(c[3])+"</div></div>"});',
' h+="<h3>تقييم الأقران (من "+esc(r[2])+")</h3>";if(!pe.length)h+="<p class=\\"empty\\">لا يوجد.</p>";pe.forEach(function(p){h+="<div class=\\"crit\\" style=\\"grid-template-columns:1fr\\"><div><b>"+esc(p[0])+"</b> — المشاركة "+p[1]+" · الدور "+p[2]+" · التعاون "+p[3]+" · الأفكار "+p[4]+" · الاحترام "+p[5]+" · المتوسط <b>"+p[6]+"</b>"+(p[7]?"<small>إيجابي: "+esc(p[7])+"</small>":"")+(p[8]?"<small>اقتراح: "+esc(p[8])+"</small>":"")+"</div></div>"});',
' if(a)h+="<h3>الإنجاز</h3><p style=\\"font-size:13px\\">بيانات المهمة "+a[0]+"/10 · المحاور "+a[1]+"/75 · الأدلة "+a[2]+"/10 · الأقران "+a[3]+"/5 · <b>الإجمالي "+a[4]+"/100</b>"+(a[5]?"<br>الشارات: "+esc(a[5]):"")+"</p>";',
' $("detail").innerHTML=h;$("modal").classList.add("on")}',
'function del(id){var r=DATA.summary.filter(function(x){return x[0]===id})[0];if(!r)return;if(!confirm("حذف مشاركة "+r[2]+" نهائيًا من كل أوراق Google Sheets؟ لا يمكن التراجع."))return;google.script.run.withSuccessHandler(function(){load()}).withFailureHandler(fail).teacherDelete(CODE,id)}',
'$("csvBtn").onclick=function(){var rows=filtered();var head=["الطالبة","الفصل","المجموعة","المتجر","الدرجة","من","النسبة %","نقاط الإنجاز","التوصية","التاريخ"];var out=[head];rows.forEach(function(r){var a=DATA.ach[r[0]];out.push([r[2],r[3],r[4],r[5],r[6],r[7],r[8],a?a[4]:"",r[10],r[1]])});',
' var csv="\\uFEFF"+out.map(function(l){return l.map(function(v){return "\\""+String(v==null?"":v).replace(/"/g,"\\"\\"")+"\\""}).join(",")}).join("\\r\\n");',
' var blob=new Blob([csv],{type:"text/csv;charset=utf-8"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="student-detective-results.csv";document.body.appendChild(a);a.click();a.remove()};',
'</script></body></html>'
  ].join('\n');
}
