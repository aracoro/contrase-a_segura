var CHARS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    nums: "0123456789",
    syms: "!@#$%^&*()-_=+[]{}?"
};

var lenEl = document.getElementById('len'), lenVal = document.getElementById('lenVal');
var upper = document.getElementById('upper'), lower = document.getElementById('lower'),
    nums = document.getElementById('nums'), syms = document.getElementById('syms');
var pwEl = document.getElementById('pw');
var meterFill = document.getElementById('meterFill'), meterLabel = document.getElementById('meterLabel');

function secureRandomInt(max) {
    var arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
}

function generate() {
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
    updateMeter(len, sets.length);
}

function updateMeter(len, varietyCount) {
    var score = 0;
    if (len >= 12) score += 40; else score += (len / 12) * 40;
    score += varietyCount * 15;
    score = Math.min(score, 100);

    meterFill.style.width = score + '%';
    if (score < 40) { meterFill.style.background = '#b33a3a'; meterLabel.textContent = 'Debil'; }
    else if (score < 75) { meterFill.style.background = '#c99a1e'; meterLabel.textContent = 'Aceptable'; }
    else { meterFill.style.background = '#3a7d3a'; meterLabel.textContent = 'Fuerte'; }
}

lenEl.addEventListener('input', function () { lenVal.textContent = lenEl.value; generate(); });
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