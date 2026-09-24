var CHARS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    nums: "0123456789",
    syms: "!@#$%^&*()-_=+[]{}?"
};

var WORDS = [
    "tigre", "luna", "montana", "rio", "bosque", "estrella", "cometa", "aguila",
    "trueno", "roble", "nube", "oceano", "viento", "fenix", "lobo", "cristal",
    "volcan", "sombra", "aurora", "relampago", "jaguar", "halcon", "desierto",
    "glaciar", "cascada", "cedro", "delfin", "meteoro"
];

function secureRandomInt(max) {
    var arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
}

var lenEl = document.getElementById('len'), lenVal = document.getElementById('lenVal');
var upper = document.getElementById('upper'), lower = document.getElementById('lower'),
    nums = document.getElementById('nums'), syms = document.getElementById('syms');
var pwEl = document.getElementById('pw');
var meterFill = document.getElementById('meterFill'), meterLabel = document.getElementById('meterLabel');

var wordCountEl = document.getElementById('wordCount'), wordCountVal = document.getElementById('wordCountVal');
var modeRandomBtn = document.getElementById('modeRandom'), modePhraseBtn = document.getElementById('modePhrase');
var randomOptions = document.getElementById('randomOptions'), phraseOptions = document.getElementById('phraseOptions');
var currentMode = 'random';

function generateRandom() {
    var pool = '';
    var sets = [];
    if (upper.checked) { pool += CHARS.upper; sets.push(CHARS.upper); }
    if (lower.checked) { pool += CHARS.lower; sets.push(CHARS.lower); }
    if (nums.checked) { pool += CHARS.nums; sets.push(CHARS.nums); }
    if (syms.checked) { pool += CHARS.syms; sets.push(CHARS.syms); }
    var len = parseInt(lenEl.value, 10);

    if (pool.length === 0) {
        pwEl.textContent = '(selecciona al menos una opcion)';
        meterFill.style.width = '0%';
        meterLabel.textContent = '';
        return;
    }

    var result = [];
    sets.forEach(function (s) { result.push(s[secureRandomInt(s.length)]); });
    while (result.length < len) {
        result.push(pool[secureRandomInt(pool.length)]);
    }
    for (var i = result.length - 1; i > 0; i--) {
        var j = secureRandomInt(i + 1);
        var tmp = result[i]; result[i] = result[j]; result[j] = tmp;
    }
    result = result.slice(0, len);
    pwEl.textContent = result.join('');
    updateMeter(meterFill, meterLabel, result.join('').length, sets.length);
}

function generatePhrase() {
    var count = parseInt(wordCountEl.value, 10);
    var chosen = [];
    for (var i = 0; i < count; i++) {
        chosen.push(WORDS[secureRandomInt(WORDS.length)]);
    }
    chosen = chosen.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); });
    var number = CHARS.nums[secureRandomInt(CHARS.nums.length)];
    var symbol = CHARS.syms[secureRandomInt(CHARS.syms.length)];
    var insertAt = secureRandomInt(chosen.length);
    chosen.splice(insertAt, 0, number);
    var phrase = chosen.join('') + symbol;

    pwEl.textContent = phrase;
    var varietyCount = 3;
    updateMeter(meterFill, meterLabel, phrase.length, 4);
}

function generate() {
    if (currentMode === 'random') generateRandom();
    else generatePhrase();
}

function updateMeter(fillEl, labelEl, len, varietyCount) {
    var score = 0;
    if (len >= 12) score += 40; else score += (len / 12) * 40;
    score += varietyCount * 15;
    score = Math.min(score, 100);

    fillEl.style.width = score + '%';
    if (score < 40) { fillEl.style.background = '#e35d5d'; labelEl.textContent = 'Débil'; }
    else if (score < 75) { fillEl.style.background = '#e3b23c'; labelEl.textContent = 'Aceptable'; }
    else { fillEl.style.background = '#3fd17a'; labelEl.textContent = 'Fuerte'; }
}

modeRandomBtn.addEventListener('click', function () {
    currentMode = 'random';
    modeRandomBtn.classList.add('active');
    modePhraseBtn.classList.remove('active');
    randomOptions.classList.remove('hidden');
    phraseOptions.classList.add('hidden');
    generate();
});

modePhraseBtn.addEventListener('click', function () {
    currentMode = 'phrase';
    modePhraseBtn.classList.add('active');
    modeRandomBtn.classList.remove('active');
    phraseOptions.classList.remove('hidden');
    randomOptions.classList.add('hidden');
    generate();
});

lenEl.addEventListener('input', function () { lenVal.textContent = lenEl.value; if (currentMode === 'random') generate(); });
wordCountEl.addEventListener('input', function () { wordCountVal.textContent = wordCountEl.value; if (currentMode === 'phrase') generate(); });
[upper, lower, nums, syms].forEach(function (el) { el.addEventListener('change', generate); });
document.getElementById('genBtn').addEventListener('click', generate);
document.getElementById('copyBtn').addEventListener('click', function () {
    var text = pwEl.textContent;
    navigator.clipboard.writeText(text).then(function () {
        var btn = document.getElementById('copyBtn');
        var old = btn.textContent;
        btn.textContent = 'Copiado';
        setTimeout(function () { btn.textContent = old; }, 1200);
    }).catch(function () { });
});

generate();

var evalInput = document.getElementById('evalInput');
var evalMeterFill = document.getElementById('evalMeterFill');
var evalMeterLabel = document.getElementById('evalMeterLabel');
var toggleEye = document.getElementById('toggleEye');

var COMMON_PASSWORDS = [
    "password", "123456", "12345678", "123456789", "qwerty", "abc123",
    "letmein", "admin", "welcome", "iloveyou", "111111", "000000",
    "1234567", "12345", "1234567890", "contraseña", "contrasena",
    "password1", "qwertyuiop", "asdfghjkl", "123123", "monkey"
];
var SEQUENCES = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function isCommon(v) {
    var lower = v.toLowerCase();
    return COMMON_PASSWORDS.some(function (p) { return lower === p || lower.indexOf(p) !== -1; });
}

function hasObviousPattern(v) {
    if (/(.)\1\1/.test(v)) return true;
    var lower = v.toLowerCase();
    for (var s = 0; s < SEQUENCES.length; s++) {
        var seq = SEQUENCES[s];
        for (var i = 0; i <= seq.length - 4; i++) {
            var chunk = seq.substring(i, i + 4);
            var chunkRev = chunk.split('').reverse().join('');
            if (lower.indexOf(chunk) !== -1 || lower.indexOf(chunkRev) !== -1) return true;
        }
    }
    return false;
}

var RULES = {
    len12: function (v) { return v.length >= 12; },
    upper: function (v) { return /[A-Z]/.test(v); },
    lower: function (v) { return /[a-z]/.test(v); },
    nums: function (v) { return /[0-9]/.test(v); },
    syms: function (v) { return /[^A-Za-z0-9]/.test(v); },
    common: function (v) { return v.length > 0 && !isCommon(v); },
    pattern: function (v) { return v.length > 0 && !hasObviousPattern(v); }
};

function evaluate() {
    var v = evalInput.value;
    var passed = 0;
    var total = 0;

    Object.keys(RULES).forEach(function (key) {
        total++;
        var ok = v.length > 0 && RULES[key](v);
        if (ok) passed++;
        var tag = document.getElementById('tag-' + key);
        tag.textContent = ok ? 'SI' : 'NO';
        tag.classList.toggle('ok', ok);
    });

    var score = v.length === 0 ? 0 : Math.round((passed / total) * 100);
    evalMeterFill.style.width = score + '%';

    if (v.length === 0) {
        evalMeterFill.style.background = 'transparent';
        evalMeterLabel.textContent = '\u00A0';
    } else if (score < 50) {
        evalMeterFill.style.background = '#e35d5d';
        evalMeterLabel.textContent = 'Débil';
    } else if (score < 85) {
        evalMeterFill.style.background = '#e3b23c';
        evalMeterLabel.textContent = 'Aceptable';
    } else {
        evalMeterFill.style.background = '#3fd17a';
        evalMeterLabel.textContent = 'Fuerte';
    }
}

evalInput.addEventListener('input', evaluate);

toggleEye.addEventListener('click', function () {
    var isPw = evalInput.type === 'password';
    evalInput.type = isPw ? 'text' : 'password';
    toggleEye.textContent = isPw ? '🙈' : '👁';
});

evaluate();

var lastChangedInput = document.getElementById('lastChanged');
var saveDateBtn = document.getElementById('saveDateBtn');
var reminderFill = document.getElementById('reminderFill');
var reminderLabel = document.getElementById('reminderLabel');
var RECOMMENDED_DAYS = 180;

function loadReminder() {
    try {
        var saved = localStorage.getItem('pwLastChanged');
        if (saved) {
            lastChangedInput.value = saved;
            renderReminder(saved);
        }
    } catch (e) { }
}

function renderReminder(dateStr) {
    var last = new Date(dateStr + 'T00:00:00');
    var now = new Date();
    var days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (days < 0) days = 0;
    var pct = Math.min((days / RECOMMENDED_DAYS) * 100, 100);

    reminderFill.style.width = pct + '%';
    if (days < 90) {
        reminderFill.style.background = '#3fd17a';
        reminderLabel.textContent = days + ' días desde el último cambio. Todo bien.';
    } else if (days < 180) {
        reminderFill.style.background = '#e3b23c';
        reminderLabel.textContent = days + ' días desde el último cambio. Considera renovarla pronto.';
    } else {
        reminderFill.style.background = '#e35d5d';
        reminderLabel.textContent = days + ' días desde el último cambio. Es momento de cambiarla.';
    }
}

saveDateBtn.addEventListener('click', function () {
    var val = lastChangedInput.value;
    if (!val) return;
    try { localStorage.setItem('pwLastChanged', val); } catch (e) { }
    renderReminder(val);
});

loadReminder();