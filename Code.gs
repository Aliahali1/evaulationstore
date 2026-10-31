/**
 * مغامرة محققة المتجر الإلكتروني — الخادم (Google Apps Script)
 * ينشئ ملف Google Sheets خاصًا بحساب المعلمة، ويستقبل المشاركات، ويؤكد حالة الحفظ.
 *
 * خطوات الإعداد المختصرة:
 *  1) شغّلي الدالة setupProject مرة واحدة (إنشاء الملف والأوراق).
 *  2) غيّري قيمة CHANGE-THIS-CLASS-CODE داخل setClassAccessCode ثم شغّليها مرة واحدة.
 *  3) Deploy > New deployment > Web app (Execute as: Me).
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

/* ---------- التحقق من حالة الحفظ (JSONP) ---------- */

function doGet(e) {
  var params = (e && e.parameter) || {};
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

/* ---------- دوال مساعدة ---------- */

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
  if (String(p.accessCode || '') !== expected) return 'invalid_access_code';
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
