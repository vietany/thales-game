function getCol(prop, fallback) {
    try {
        const val = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
        return val || fallback;
    } catch (e) {
        return fallback;
    }
}

const PAL = {
    sky: getCol('--c-sky', '#bae6fd'),
    sun: getCol('--c-sun', '#fef08a'),
    grass: getCol('--c-grass', '#4ade80'),
    grassEdge: getCol('--c-grass-edge', '#16a34a'),
    rockFill: getCol('--c-rock-fill', 'rgba(254, 243, 199, 0.4)'),
    rockOuter: getCol('--c-rock-outer', '#64748b'),
    rockInner: getCol('--c-rock-inner', '#94a3b8'),
    notchFill: getCol('--c-notch-fill', '#334155'),
    notchStroke: getCol('--c-notch-stroke', '#e2e8f0'),
    plankWood: getCol('--c-plank-wood', '#b45309'),
    plankWin: getCol('--c-plank-win', '#059669'),
    plankLose: getCol('--c-plank-lose', '#e11d48'),
    peg: getCol('--c-peg', '#fde68a'),
    potClay: getCol('--c-pot-clay', '#ea580c'),
    potStroke: getCol('--c-pot-stroke', '#c2410c'),
    potSoil: getCol('--c-pot-soil', '#78350f'),
    plantLeaf: getCol('--c-plant-leaf', '#16a34a'),
    flowerHappy: getCol('--c-flower-happy', '#ec4899'),
    flowerSad: getCol('--c-flower-sad', '#f43f5e'),
    flowerCenter: getCol('--c-flower-center', '#fde047'),
    sparkle: getCol('--c-sparkle', '#f59e0b'),
    textDark: getCol('--c-text-dark', '#1e293b'),
    badgeStroke: getCol('--c-badge-stroke', '#cbd5e1'),
    badgeTargetFill: getCol('--c-badge-target-fill', '#e11d48'),
    badgeTargetStroke: getCol('--c-badge-target-stroke', '#fda4af'),
    bannerFill: getCol('--c-banner-fill', '#ffffff'),
    bannerStroke: getCol('--c-banner-stroke', '#16a34a'),
    bannerText: getCol('--c-banner-text', '#15803d')
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    setTimeout(() => {
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e) {}
    }, delay * 1000);
}

function playWinSound() {
    playTone(523.25, 'triangle', 0.15, 0.0);
    playTone(659.25, 'triangle', 0.15, 0.1);
    playTone(783.99, 'triangle', 0.15, 0.2);
    playTone(1046.50, 'triangle', 0.35, 0.3);
}

function playPlaceSound() {
    playTone(320, 'sine', 0.08, 0.0);
    playTone(480, 'sine', 0.1, 0.05);
}

function playSlideSound() {
    if (!soundEnabled) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch(e) {}
}

function playSmashSound() {
    playTone(140, 'square', 0.12, 0.0);
    playTone(80, 'sawtooth', 0.35, 0.06);
}

const levels = [
    {
        name: "Cấp 1: Vòm đá suối mơ",
        AD: 4,
        DB: 2,
        AE: 6,
        EC: 3,
        BC: 10,
        target: 'EC',
        display: { AD: '4 dm', DB: '2 dm', AE: '6 dm', EC: '?' },
        result: 3,
        options: [1.5, 3, 4.5, 6]
    },
    {
        name: "Cấp 2: Vách đá dốc đứng",
        AD: 3,
        DB: 6,
        AE: 2.5,
        EC: 5,
        BC: 9.5,
        target: 'AD',
        display: { AD: '?', DB: '6 dm', AE: '2.5 dm', EC: '5 dm' },
        result: 3,
        options: [1.5, 3, 4, 5]
    },
    {
        name: "Cấp 3: Tính AE khi biết AD, DB, AC",
        AD: 4,
        DB: 2,
        AE: 6,
        EC: 3,
        BC: 10,
        target: 'AE',
        display: { AD: '4 dm', DB: '2 dm', AC: '9 dm', AE: '?' },
        result: 6,
        options: [3, 4.5, 6, 7]
    },
    {
        name: "Cấp 4: Đẩy vách đá qua độ dài AB (biết AD, AE, EC)",
        mode: 'ROCK_PHYSICS_TILT',
        AD: 3,
        DB: 6,
        AE: 4,
        EC: 8,
        BC: 11,
        target: 'AB',
        display: { AD: '3 dm', AE: '4 dm', EC: '8 dm', AB: '?' },
        result: 9,
        options: [6, 7.5, 9, 12]
    },
    {
        name: "Cấp 5: Tính EC khi biết AD, DB, AC",
        AD: 3,
        DB: 6,
        AE: 4,
        EC: 8,
        BC: 11,
        target: 'EC',
        display: { AD: '3 dm', DB: '6 dm', AC: '12 dm', EC: '?' },
        result: 8,
        options: [4, 6, 8, 9]
    }
];

function calculateTriangleGeometry(lv) {
    const AB = lv.AD + lv.DB;
    const AC = lv.AE + lv.EC;
    const BC = lv.BC;

    const cosB = (AB * AB + BC * BC - AC * AC) / (2 * AB * BC);
    const sinB = Math.sqrt(Math.max(0, 1 - cosB * cosB));

    const h = AB * sinB;
    const dX = AB * cosB;

    const baseLineY = 320;
    const maxPixelHeight = 220;
    const maxPixelWidth = 420;

    const scaleY = maxPixelHeight / h;
    const scaleX = maxPixelWidth / BC;
    const scale = Math.min(scaleX, scaleY);

    const pixelBC = BC * scale;
    const leftX = (700 - pixelBC) / 2;
    const rightX = leftX + pixelBC;

    const apexX = leftX + dX * scale;
    const apexY = baseLineY - h * scale;

    return {
        A: { x: apexX, y: apexY },
        B: { x: leftX, y: baseLineY },
        C: { x: rightX, y: baseLineY },
        scale: scale
    };
}

let currentLevel = 0;
let score = 0;
let correctCount = 0;
let state = 'IDLE';
let chosenValue = null;
let isCorrect = false;

let startTime = null;
let timerInterval = null;
let totalElapsedSeconds = 0;

let rotateStartTime = 0;
const ROTATE_DURATION = 900;

let shakeStartTime = 0;
const SHAKE_DURATION = 400;

let slideStartTime = 0;
const SLIDE_DURATION = 1200;

let currentHangAngle = Math.PI / 2;
let startRotateAngle = Math.PI / 2;
let targetAngle = 0;
let tiltDirection = 1;

let startGeom = null;
let targetGeom = null;

let potPieces = [];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const levelBadge = document.getElementById('level-badge');
const scoreBadge = document.getElementById('score-badge');
const timerBadge = document.getElementById('timer-badge');
const optionsGrid = document.getElementById('options-grid');
const targetVar = document.getElementById('target-var');
const missionTitle = document.getElementById('mission-title');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackTitle = document.getElementById('feedback-title');
const summaryOverlay = document.getElementById('summary-overlay');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');
const finalAccuracy = document.getElementById('final-accuracy');
const restartBtn = document.getElementById('restart-btn');
const soundBtn = document.getElementById('sound-btn');

soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
});

function formatTime(totalSec) {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        totalElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        timerBadge.innerText = formatTime(totalElapsedSeconds);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function loadLevel(idx) {
    currentLevel = idx;
    state = 'IDLE';
    chosenValue = null;
    potPieces = [];
    startGeom = null;
    targetGeom = null;
    feedbackOverlay.classList.add('hidden');

    const lv = levels[currentLevel];
    const geom = calculateTriangleGeometry(lv);
    lv.A = geom.A;
    lv.B = geom.B;
    lv.C = geom.C;
    lv.scale = geom.scale;

    levelBadge.innerText = `${currentLevel + 1} / ${levels.length}`;
    missionTitle.innerText = `${lv.name} - Tính giá trị ${lv.target}`;
    targetVar.innerText = lv.target + ' = ?';

    optionsGrid.innerHTML = '';
    lv.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'bg-emerald-50 hover:bg-emerald-600 hover:text-white border-2 border-emerald-300 text-emerald-950 font-black py-3 rounded-2xl text-lg shadow-sm btn-bounce';
        btn.innerText = opt + ' dm';
        btn.addEventListener('click', () => handleChoice(opt));
        optionsGrid.appendChild(btn);
    });
}

function rotatePoint(pt, center, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = pt.x - center.x;
    const dy = pt.y - center.y;
    return {
        x: center.x + dx * cos - dy * sin,
        y: center.y + dx * sin + dy * cos
    };
}

function computePhysicalGroundedTriangle(lv, chosenAB) {
    const origAB = lv.AD + lv.DB;
    const groundY = 320;
    const ratio = chosenAB / origAB;

    let A = { x: lv.A.x, y: lv.A.y };
    let C = { x: lv.C.x, y: lv.C.y };
    let B = {
        x: A.x + (lv.B.x - A.x) * ratio,
        y: A.y + (lv.B.y - A.y) * ratio
    };

    if (Math.abs(chosenAB - origAB) < 0.001) {
        return { A, B, C };
    }

    if (chosenAB < origAB) {
        const pivot = C;
        const distC_B = Math.hypot(B.x - pivot.x, B.y - pivot.y);
        const currAngle = Math.atan2(B.y - pivot.y, B.x - pivot.x);
        const targetAngle = Math.PI - Math.asin(Math.max(-1, Math.min(1, (groundY - pivot.y) / distC_B)));
        const dTheta = targetAngle - currAngle;

        return {
            A: rotatePoint(A, pivot, dTheta),
            B: rotatePoint(B, pivot, dTheta),
            C: C
        };
    } else {
        const pivot = { x: B.x, y: groundY };
        const shiftY = groundY - B.y;
        A.y += shiftY;
        C.y += shiftY;

        const distB_C = Math.hypot(C.x - pivot.x, C.y - pivot.y);
        const currAngle = Math.atan2(C.y - pivot.y, C.x - pivot.x);
        const targetAngle = Math.asin(Math.max(-1, Math.min(1, (groundY - pivot.y) / distB_C)));
        const dTheta = targetAngle - currAngle;

        return {
            A: rotatePoint(A, pivot, dTheta),
            B: pivot,
            C: rotatePoint(C, pivot, dTheta)
        };
    }
}

function handleChoice(val) {
    if (state !== 'IDLE') return;
    chosenValue = val;
    const lv = levels[currentLevel];
    isCorrect = Math.abs(val - lv.result) < 0.001;

    const isLeftQuestion = (lv.target === 'AD' || lv.target === 'DB');

    if (lv.mode === 'ROCK_PHYSICS_TILT') {
        const origAB = lv.AD + lv.DB;
        const ratio = chosenValue / origAB;
        startGeom = {
            A: { x: lv.A.x, y: lv.A.y },
            B: {
                x: lv.A.x + (lv.B.x - lv.A.x) * ratio,
                y: lv.A.y + (lv.B.y - lv.A.y) * ratio
            },
            C: { x: lv.C.x, y: lv.C.y }
        };
        targetGeom = computePhysicalGroundedTriangle(lv, chosenValue);

        tiltDirection = chosenValue < lv.result ? -1 : 1;

        rotateStartTime = performance.now();
        state = 'ROTATING';
        return;
    }

    let rLeft = lv.AD / (lv.AD + lv.DB);
    let rRight = lv.AE / (lv.AE + lv.EC);

    if (lv.target === 'AD') {
        rLeft = Math.min(0.92, Math.max(0.08, chosenValue / (chosenValue + lv.DB)));
    } else if (lv.target === 'AE') {
        const totalAC = lv.AE + lv.EC;
        rRight = Math.min(0.92, Math.max(0.08, chosenValue / totalAC));
    } else if (lv.target === 'EC') {
        const totalAC = lv.AE + lv.EC;
        rRight = Math.min(0.92, Math.max(0.08, (totalAC - chosenValue) / totalAC));
    }

    const ptD = getInterpolatedPoint(lv.A, lv.B, rLeft);
    const ptE = getInterpolatedPoint(lv.A, lv.C, rRight);

    if (isLeftQuestion) {
        targetAngle = Math.atan2(ptD.y - ptE.y, ptD.x - ptE.x);
    } else {
        targetAngle = Math.atan2(ptE.y - ptD.y, ptE.x - ptD.x);
    }

    startRotateAngle = currentHangAngle;
    rotateStartTime = performance.now();
    state = 'ROTATING';

    tiltDirection = rRight > rLeft ? 1 : -1;
}

function createPotDebris(x, y) {
    potPieces = [];
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 6;
        potPieces.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 3,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.3,
            size: 6 + Math.random() * 8,
            color: Math.random() > 0.4 ? PAL.potClay : (Math.random() > 0.5 ? PAL.flowerSad : PAL.potSoil)
        });
    }
}

function showResultToast(success) {
    feedbackOverlay.classList.remove('hidden');

    if (success) {
        feedbackIcon.innerText = '🌸';
        feedbackTitle.innerText = 'THÀNH CÔNG!';
        feedbackTitle.className = 'text-4xl font-black tracking-wide text-emerald-400 animate-pulse';
    } else {
        feedbackIcon.innerText = '🥀';
        feedbackTitle.innerText = 'THẤT BẠI!';
        feedbackTitle.className = 'text-4xl font-black tracking-wide text-rose-400 animate-pulse';
    }

    setTimeout(() => {
        feedbackOverlay.classList.add('hidden');
        goToNextQuestion();
    }, 1200);
}

function goToNextQuestion() {
    if (currentLevel + 1 < levels.length) {
        loadLevel(currentLevel + 1);
    } else {
        stopTimer();
        showFinalSummary();
    }
}

function showFinalSummary() {
    state = 'FINISHED';
    finalScore.innerText = score;
    finalTime.innerText = formatTime(totalElapsedSeconds);
    finalAccuracy.innerText = `${correctCount} / ${levels.length}`;
    summaryOverlay.classList.remove('hidden');
}

restartBtn.addEventListener('click', () => {
    summaryOverlay.classList.add('hidden');
    score = 0;
    correctCount = 0;
    scoreBadge.innerText = '0';
    timerBadge.innerText = '00:00';
    totalElapsedSeconds = 0;
    startTimer();
    loadLevel(0);
});

function getInterpolatedPoint(p1, p2, ratio) {
    return {
        x: p1.x + (p2.x - p1.x) * ratio,
        y: p1.y + (p2.y - p1.y) * ratio
    };
}

function interpolateObjPoint(p1, p2, progress) {
    return {
        x: p1.x + (p2.x - p1.x) * progress,
        y: p1.y + (p2.y - p1.y) * progress
    };
}

function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const lv = levels[currentLevel];
    const isTiltRockMode = lv.mode === 'ROCK_PHYSICS_TILT';
    const isLeftQuestion = (lv.target === 'AD' || lv.target === 'DB');

    ctx.fillStyle = PAL.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = PAL.sun;
    ctx.beginPath();
    ctx.arc(630, 70, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.grass;
    ctx.fillRect(0, 320, canvas.width, 90);
    ctx.fillStyle = PAL.grassEdge;
    ctx.fillRect(0, 320, canvas.width, 14);

    let curA = { x: lv.A.x, y: lv.A.y };
    let curB = { x: lv.B.x, y: lv.B.y };
    let curC = { x: lv.C.x, y: lv.C.y };

    if (isTiltRockMode && targetGeom) {
        if (state === 'ROTATING') {
            const elapsed = now - rotateStartTime;
            const p = Math.min(1, elapsed / ROTATE_DURATION);
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            curA = interpolateObjPoint(startGeom.A, targetGeom.A, ease);
            curB = interpolateObjPoint(startGeom.B, targetGeom.B, ease);
            curC = interpolateObjPoint(startGeom.C, targetGeom.C, ease);
        } else {
            curA = targetGeom.A;
            curB = targetGeom.B;
            curC = targetGeom.C;
        }
    }

    let rLeft = lv.AD / (lv.AD + lv.DB);
    let rRight = lv.AE / (lv.AE + lv.EC);

    if (isTiltRockMode && chosenValue !== null) {
        rLeft = lv.AD / chosenValue;
    }

    const refPtD = getInterpolatedPoint(curA, curB, rLeft);
    const refPtE = getInterpolatedPoint(curA, curC, rRight);

    let dynPtD = { x: refPtD.x, y: refPtD.y };
    let dynPtE = { x: refPtE.x, y: refPtE.y };

    if (!isTiltRockMode && chosenValue !== null) {
        if (lv.target === 'AD') {
            const r = Math.min(0.92, Math.max(0.08, chosenValue / (chosenValue + lv.DB)));
            dynPtD = getInterpolatedPoint(curA, curB, r);
        } else if (lv.target === 'AE') {
            const totalAC = lv.AE + lv.EC;
            const r = Math.min(0.92, Math.max(0.08, chosenValue / totalAC));
            dynPtE = getInterpolatedPoint(curA, curC, r);
        } else if (lv.target === 'EC') {
            const totalAC = lv.AE + lv.EC;
            const r = Math.min(0.92, Math.max(0.08, (totalAC - chosenValue) / totalAC));
            dynPtE = getInterpolatedPoint(curA, curC, r);
        }
    }

    const beamLen = Math.hypot(refPtE.x - refPtD.x, refPtE.y - refPtD.y);

    let curPtD = { x: refPtD.x, y: refPtD.y };
    let curPtE = { x: refPtE.x, y: refPtE.y };

    let plankShakeY = 0;
    let potX = (curPtD.x + curPtE.x) / 2;
    let potY = (curPtD.y + curPtE.y) / 2;
    let potAngle = Math.atan2(curPtE.y - curPtD.y, curPtE.x - curPtD.x);
    let showPot = false;
    let potBroken = false;

    if (isTiltRockMode) {
        showPot = true;
        potAngle = Math.atan2(curPtE.y - curPtD.y, curPtE.x - curPtD.x);
        potX = (curPtD.x + curPtE.x) / 2;
        potY = (curPtD.y + curPtE.y) / 2;

        if (state === 'ROTATING') {
            const elapsed = now - rotateStartTime;
            if (elapsed >= ROTATE_DURATION) {
                state = 'SHAKING';
                shakeStartTime = now;
                playPlaceSound();
            }
        } else if (state === 'SHAKING') {
            const elapsed = now - shakeStartTime;
            const p = Math.min(1, elapsed / SHAKE_DURATION);
            plankShakeY = Math.sin(now * 0.08) * 3 * (1 - p);
            potY += plankShakeY;

            if (p >= 1) {
                if (isCorrect) {
                    state = 'SUCCESS';
                    score += 100;
                    correctCount++;
                    scoreBadge.innerText = score;
                    playWinSound();
                    showResultToast(true);
                } else {
                    state = 'SLIDING';
                    slideStartTime = now;
                    playSlideSound();
                }
            }
        } else if (state === 'SUCCESS') {
            potAngle = Math.atan2(curPtE.y - curPtD.y, curPtE.x - curPtD.x);
            potX = (curPtD.x + curPtE.x) / 2;
            potY = (curPtD.y + curPtE.y) / 2;
        } else if (state === 'SLIDING') {
            const elapsed = now - slideStartTime;
            const p = Math.min(1, elapsed / SLIDE_DURATION);

            if (p < 0.6) {
                showPot = true;
                const slideEase = (p / 0.6) * (p / 0.6);
                const midX = (curPtD.x + curPtE.x) / 2;
                const midY = (curPtD.y + curPtE.y) / 2;
                const lowEnd = tiltDirection > 0 ? curPtE : curPtD;

                potX = midX + (lowEnd.x - midX) * slideEase * 1.25;
                potY = midY + (lowEnd.y - midY) * slideEase * 1.25;
            } else if (p < 0.85) {
                showPot = true;
                const fallP = (p - 0.6) / 0.25;
                const lowEnd = tiltDirection > 0 ? curPtE : curPtD;
                potX = lowEnd.x + tiltDirection * 15;
                potY = lowEnd.y + fallP * (320 - lowEnd.y);
                potAngle += fallP * 2 * tiltDirection;
            } else {
                showPot = false;
                potBroken = true;

                if (potPieces.length === 0) {
                    const lowEnd = tiltDirection > 0 ? curPtE : curPtD;
                    createPotDebris(lowEnd.x + tiltDirection * 15, 320);
                    playSmashSound();
                }

                if (p >= 1 && feedbackOverlay.classList.contains('hidden')) {
                    showResultToast(false);
                }
            }
        }
    } else {
        if (state === 'IDLE') {
            const swing = Math.sin(now * 0.0035) * 0.12;
            currentHangAngle = (Math.PI / 2) + swing;

            if (isLeftQuestion) {
                curPtE = { x: refPtE.x, y: refPtE.y };
                curPtD.x = refPtE.x + Math.cos(Math.PI - currentHangAngle) * (beamLen * 0.7);
                curPtD.y = refPtE.y + Math.sin(Math.PI - currentHangAngle) * (beamLen * 0.7);
            } else {
                curPtD = { x: refPtD.x, y: refPtD.y };
                curPtE.x = refPtD.x + Math.cos(currentHangAngle) * (beamLen * 0.7);
                curPtE.y = refPtD.y + Math.sin(currentHangAngle) * (beamLen * 0.7);
            }
        } else if (state === 'ROTATING') {
            const elapsed = now - rotateStartTime;
            const p = Math.min(1, elapsed / ROTATE_DURATION);
            const ease = p * (2 - p);
            const curAngle = startRotateAngle + (targetAngle - startRotateAngle) * ease;
            const curLen = (beamLen * 0.7) + (beamLen * 0.3) * ease;

            if (isLeftQuestion) {
                curPtE = { x: refPtE.x, y: refPtE.y };
                curPtD.x = refPtE.x + Math.cos(curAngle) * curLen;
                curPtD.y = refPtE.y + Math.sin(curAngle) * curLen;
            } else {
                curPtD = { x: refPtD.x, y: refPtD.y };
                curPtE.x = refPtD.x + Math.cos(curAngle) * curLen;
                curPtE.y = refPtD.y + Math.sin(curAngle) * curLen;
            }

            if (p >= 1) {
                state = 'SHAKING';
                shakeStartTime = now;
                playPlaceSound();
            }
        } else if (state === 'SHAKING') {
            curPtD = { x: dynPtD.x, y: dynPtD.y };
            curPtE = { x: dynPtE.x, y: dynPtE.y };
            showPot = true;
            const elapsed = now - shakeStartTime;
            const p = Math.min(1, elapsed / SHAKE_DURATION);

            plankShakeY = Math.sin(now * 0.08) * 3 * (1 - p);

            potAngle = Math.atan2(curPtE.y - curPtD.y, curPtE.x - curPtD.x);
            potX = (curPtD.x + curPtE.x) / 2;
            potY = (curPtD.y + curPtE.y) / 2 + plankShakeY;

            if (p >= 1) {
                if (isCorrect) {
                    state = 'SUCCESS';
                    score += 100;
                    correctCount++;
                    scoreBadge.innerText = score;
                    playWinSound();
                    showResultToast(true);
                } else {
                    state = 'SLIDING';
                    slideStartTime = now;
                    playSlideSound();
                }
            }
        } else if (state === 'SUCCESS') {
            curPtD = { x: dynPtD.x, y: dynPtD.y };
            curPtE = { x: dynPtE.x, y: dynPtE.y };
            showPot = true;
            potAngle = Math.atan2(curPtE.y - curPtD.y, curPtE.x - curPtD.x);
            potX = (curPtD.x + curPtE.x) / 2;
            potY = (curPtD.y + curPtE.y) / 2;
        } else if (state === 'SLIDING') {
            curPtD = { x: dynPtD.x, y: dynPtD.y };
            curPtE = { x: dynPtE.x, y: dynPtE.y };
            const elapsed = now - slideStartTime;
            const p = Math.min(1, elapsed / SLIDE_DURATION);

            potAngle = Math.atan2(curPtE.y - curPtD.y, curPtE.x - curPtD.x);

            if (p < 0.6) {
                showPot = true;
                const slideEase = (p / 0.6) * (p / 0.6);
                const midX = (curPtD.x + curPtE.x) / 2;
                const midY = (curPtD.y + curPtE.y) / 2;
                const lowEnd = tiltDirection > 0 ? curPtE : curPtD;

                potX = midX + (lowEnd.x - midX) * slideEase * 1.2;
                potY = midY + (lowEnd.y - midY) * slideEase * 1.2;
            } else if (p < 0.85) {
                showPot = true;
                const fallP = (p - 0.6) / 0.25;
                const lowEnd = tiltDirection > 0 ? curPtE : curPtD;
                potX = lowEnd.x + tiltDirection * 15;
                potY = lowEnd.y + fallP * (320 - lowEnd.y);
                potAngle += fallP * 2;
            } else {
                showPot = false;
                potBroken = true;

                if (potPieces.length === 0) {
                    const lowEnd = tiltDirection > 0 ? curPtE : curPtD;
                    createPotDebris(lowEnd.x + tiltDirection * 15, 320);
                    playSmashSound();
                }

                if (p >= 1 && feedbackOverlay.classList.contains('hidden')) {
                    showResultToast(false);
                }
            }
        }
    }

    drawMountainRockSelective(curA, curB, curC, isTiltRockMode && state === 'IDLE');

    drawSideRuler(curA, curB, lv.display.AD, lv.display.DB, rLeft, lv.target === 'AD', lv.target === 'DB', curC, lv.display.AB, lv.target === 'AB', isTiltRockMode && state === 'IDLE');
    drawSideRuler(curA, curC, lv.display.AE, lv.display.EC, rRight, lv.target === 'AE', lv.target === 'EC', curB, lv.display.AC, lv.target === 'AC', false);

    drawJointNotch(refPtD.x, refPtD.y);
    drawJointNotch(refPtE.x, refPtE.y);

    drawPointLabel('A (Chóp vòm đá)', curA.x, curA.y - 20);
    drawPointLabel('B', curB.x - 16, curB.y + 18);
    drawPointLabel('C', curC.x + 16, curC.y + 18);
    drawPointLabel('D', refPtD.x - 18, refPtD.y - 12);
    drawPointLabel('E', refPtE.x + 18, refPtE.y - 12);

    drawBaseBanner((curB.x + curC.x) / 2, Math.max(curB.y, curC.y) + 25, "Mặt đất BC");

    ctx.save();
    ctx.translate(0, plankShakeY);

    let plankColor = PAL.plankWood;
    if (state === 'SUCCESS') plankColor = PAL.plankWin;
    if (state === 'SLIDING') plankColor = PAL.plankLose;

    ctx.strokeStyle = plankColor;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(curPtD.x, curPtD.y);
    ctx.lineTo(curPtE.x, curPtE.y);
    ctx.stroke();

    ctx.fillStyle = PAL.peg;
    ctx.fillRect(curPtD.x - 4, curPtD.y - 4, 8, 8);
    ctx.fillRect(curPtE.x - 4, curPtE.y - 4, 8, 8);
    ctx.restore();

    if (showPot) {
        drawFlowerPot(potX, potY, potAngle, state === 'SUCCESS');
    }

    if (potBroken) {
        potPieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.rot += p.vrot;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
    }

    if (state === 'SUCCESS') {
        drawSparkles(now, (curPtD.x + curPtE.x) / 2, (curPtD.y + curPtE.y) / 2 - 35);
    }

    requestAnimationFrame(draw);
}

function drawMountainRockSelective(A, B, C, dimLeftEdge) {
    ctx.save();

    ctx.fillStyle = PAL.rockFill;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    if (dimLeftEdge) ctx.globalAlpha = 0.25;
    ctx.strokeStyle = PAL.rockOuter;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(B.x, B.y);
    ctx.lineTo(A.x, A.y);
    ctx.stroke();

    ctx.strokeStyle = PAL.rockInner;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(B.x, B.y);
    ctx.lineTo(A.x, A.y);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = PAL.rockOuter;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();

    ctx.strokeStyle = PAL.rockInner;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

function drawFlowerPot(x, y, angle, isHappy) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = PAL.potClay;
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(14, -6);
    ctx.lineTo(10, -26);
    ctx.lineTo(-10, -26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.potStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = PAL.potSoil;
    ctx.fillRect(-12, -28, 24, 4);

    ctx.fillStyle = PAL.plantLeaf;
    ctx.beginPath();
    ctx.ellipse(-8, -32, 6, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -32, 6, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    const flowerColor = isHappy ? PAL.flowerHappy : PAL.flowerSad;
    ctx.fillStyle = flowerColor;
    ctx.beginPath();
    ctx.arc(0, -36, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.flowerCenter;
    ctx.beginPath();
    ctx.arc(0, -36, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawJointNotch(x, y) {
    ctx.fillStyle = PAL.notchFill;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.notchStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawPointLabel(txt, x, y) {
    ctx.font = '800 13px Nunito';
    ctx.fillStyle = PAL.textDark;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, x, y);
}

function drawSideRuler(p1, p2, txt1, txt2, ratio, isT1, isT2, oppositePt, totalTxt, isTotalTarget, isDimmed) {
    const edgeDx = p2.x - p1.x;
    const edgeDy = p2.y - p1.y;
    const edgeLen = Math.hypot(edgeDx, edgeDy);
    const ux = edgeDx / edgeLen;
    const uy = edgeDy / edgeLen;

    let nx = -uy;
    let ny = ux;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const dot = (oppositePt.x - midX) * nx + (oppositePt.y - midY) * ny;
    if (dot > 0) {
        nx = -nx;
        ny = -ny;
    }

    const offsetDist = 48;
    const lineP1 = { x: p1.x + nx * offsetDist, y: p1.y + ny * offsetDist };
    const lineP2 = { x: p2.x + nx * offsetDist, y: p2.y + ny * offsetDist };

    const divPt = getInterpolatedPoint(p1, p2, ratio);
    const lineDiv = { x: divPt.x + nx * offsetDist, y: divPt.y + ny * offsetDist };

    let angle = Math.atan2(edgeDy, edgeDx);
    if (angle > Math.PI / 2) angle -= Math.PI;
    if (angle < -Math.PI / 2) angle += Math.PI;

    ctx.save();
    if (isDimmed) ctx.globalAlpha = 0.45;

    ctx.strokeStyle = PAL.rockInner;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(lineP1.x, lineP1.y);
    if (txt1 && txt2) {
        ctx.moveTo(divPt.x, divPt.y); ctx.lineTo(lineDiv.x, lineDiv.y);
    }
    ctx.moveTo(p2.x, p2.y); ctx.lineTo(lineP2.x, lineP2.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(lineP1.x, lineP1.y); ctx.lineTo(lineDiv.x, lineDiv.y);
    ctx.moveTo(lineDiv.x, lineDiv.y); ctx.lineTo(lineP2.x, lineP2.y);
    ctx.stroke();

    const tickLen = 4;
    [lineP1, lineDiv, lineP2].forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x - nx * tickLen, p.y - ny * tickLen);
        ctx.lineTo(p.x + nx * tickLen, p.y + ny * tickLen);
        ctx.stroke();
    });

    if (txt1) {
        const m1 = { x: (lineP1.x + lineDiv.x) / 2, y: (lineP1.y + lineDiv.y) / 2 };
        drawAngledBadge(m1.x, m1.y, txt1, isT1, angle);
    }
    if (txt2) {
        const m2 = { x: (lineDiv.x + lineP2.x) / 2, y: (lineDiv.y + lineP2.y) / 2 };
        drawAngledBadge(m2.x, m2.y, txt2, isT2, angle);
    }

    if (totalTxt) {
        const outerOffset = 90;
        const oP1 = { x: p1.x + nx * outerOffset, y: p1.y + ny * outerOffset };
        const oP2 = { x: p2.x + nx * outerOffset, y: p2.y + ny * outerOffset };

        ctx.strokeStyle = PAL.rockOuter;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(lineP1.x, lineP1.y); ctx.lineTo(oP1.x, oP1.y);
        ctx.moveTo(lineP2.x, lineP2.y); ctx.lineTo(oP2.x, oP2.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(oP1.x, oP1.y); ctx.lineTo(oP2.x, oP2.y);
        ctx.stroke();

        const mTotal = { x: (oP1.x + oP2.x) / 2, y: (oP1.y + oP2.y) / 2 };
        drawAngledBadge(mTotal.x, mTotal.y, totalTxt, isTotalTarget, angle);
    }

    ctx.restore();
}

function drawAngledBadge(x, y, txt, isTarget, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.font = '800 13px Nunito';
    const w = ctx.measureText(txt).width + 16;
    const h = 24;

    ctx.fillStyle = isTarget ? PAL.badgeTargetFill : PAL.bannerFill;
    ctx.strokeStyle = isTarget ? PAL.badgeTargetStroke : PAL.badgeStroke;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isTarget ? PAL.bannerFill : PAL.textDark;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 0, 0);

    ctx.restore();
}

function drawBaseBanner(x, y, txt) {
    ctx.save();
    ctx.font = '700 12px Nunito';
    const w = ctx.measureText(txt).width + 20;
    const h = 24;

    ctx.fillStyle = PAL.bannerFill;
    ctx.strokeStyle = PAL.bannerStroke;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PAL.bannerText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, x, y);
    ctx.restore();
}

function drawSparkles(t, cx, cy) {
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.003;
        const dist = 24 + Math.sin(t * 0.01 + i) * 12;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.fillStyle = PAL.sparkle;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

startTimer();
loadLevel(0);
requestAnimationFrame(draw);