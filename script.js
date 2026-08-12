const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==========================================
// --- 1. PENYIAPAN GAMBAR (SVG DATA URI) ---
// ==========================================

const playerImage = new Image();
playerImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><circle cx="35" cy="25" r="18" fill="none" stroke="%231a1a2e" stroke-width="4"/><circle cx="30" cy="22" r="2" fill="%231a1a2e"/><circle cx="40" cy="22" r="2" fill="%231a1a2e"/><path d="M 28 32 Q 35 38 42 32" fill="none" stroke="%231a1a2e" stroke-width="3"/><path d="M 35 43 L 30 75 L 15 105 M 30 75 L 45 105" fill="none" stroke="%231a1a2e" stroke-width="4"/><path d="M 32 50 L 55 60 L 62 64" fill="none" stroke="%231a1a2e" stroke-width="3"/><rect x="62" y="65" width="32" height="22" fill="none" stroke="%231a1a2e" stroke-width="4" rx="2"/><line x1="62" y1="72" x2="94" y2="72" stroke="%231a1a2e" stroke-width="2"/><line x1="62" y1="80" x2="94" y2="80" stroke="%231a1a2e" stroke-width="2"/><line x1="72" y1="65" x2="72" y2="87" stroke="%231a1a2e" stroke-width="2"/><line x1="84" y1="65" x2="84" y2="87" stroke="%231a1a2e" stroke-width="2"/><circle cx="68" cy="91" r="4" fill="%231a1a2e"/><circle cx="88" cy="91" r="4" fill="%231a1a2e"/></svg>';

const itemImage = new Image();
itemImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="30" rx="38" ry="20" fill="%23E67E22"/><rect x="15" y="45" width="70" height="8" rx="4" fill="%2327AE60"/><rect x="12" y="53" width="76" height="12" rx="4" fill="%23795548"/><rect x="18" y="65" width="64" height="6" rx="2" fill="%23F1C40F"/><ellipse cx="50" cy="73" rx="36" ry="12" fill="%23D35400"/><circle cx="35" cy="22" r="2" fill="%23FFF"/><circle cx="50" cy="18" r="2" fill="%23FFF"/><circle cx="65" cy="24" r="2" fill="%23FFF"/></svg>';

// ==========================================
// --- 2. DATA GAME & KOLEKSI HURUF ---
// ==========================================

let player = { x: 150, y: 370, width: 90, height: 110 };

// Kata Target & Status Koleksi
const targetLetters = ['G', 'O', 'U', 'R', 'M', 'E', 'T'];
let collectedLetters = { 'G': false, 'O': false, 'U': false, 'R': false, 'M': false, 'E': false, 'T': false };

let wordIndex = 0;

// Data Objek Burger
let item = { 
    x: Math.random() * 350, 
    y: 0, 
    width: 45, 
    height: 45, 
    speed: 6, 
    letter: targetLetters[0] 
};

// Data 3 BOM Sekaligus (Dibuat Lebih Cepat!)
let bombs = [
    { x: Math.random() * 350, y: -100, width: 30, height: 30, speed: 7.0 },
    { x: Math.random() * 350, y: -250, width: 30, height: 30, speed: 8.5 },
    { x: Math.random() * 350, y: -400, width: 30, height: 30, speed: 7.5 }
];

let score = 0;
let lives = 3;
let isGameOver = false;
let isWin = false;

// ==========================================
// --- 3. KONTROL MOUSE & TOUCH ---
// ==========================================

function updatePlayerPosition(clientX) {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let targetX = (clientX - rect.left) * scaleX;

    player.x = targetX - (player.width / 2);

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

window.addEventListener("mousemove", (e) => updatePlayerPosition(e.clientX));
window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) updatePlayerPosition(e.touches[0].clientX);
}, { passive: true });

// ==========================================
// --- 4. LOGIKA PERMAINAN ---
// ==========================================

function resetItem() {
    wordIndex = (wordIndex + 1) % targetLetters.length;
    let currentLetter = targetLetters[wordIndex];

    item.y = -item.height;
    item.x = Math.random() * (canvas.width - item.width);
    item.letter = currentLetter;

    // Rasio Kecepatan Khusus Huruf 'O' (Super Cepat)
    if (currentLetter === 'O') {
        item.speed = 22; // Huruf O sangat kilat!
    } else {
        item.speed = 6;  // Kecepatan biasa ditingkatkan jadi 6
    }
}

function resetBomb(b) {
    b.y = -Math.random() * 300 - 100;
    b.x = Math.random() * (canvas.width - b.width);
}

function checkCollision(obj1, obj2) {
    return (
        obj1.y + obj1.height >= obj2.y + 50 && 
        obj1.x + obj1.width >= obj2.x + 40 &&
        obj1.x <= obj2.x + obj2.width
    );
}

// Cek Wajib Lengkap SEMUA Huruf Termasuk 'O'
function checkWinCondition() {
    return Object.values(collectedLetters).every(status => status === true);
}

// ==========================================
// --- 5. LOOP UTAMA GAME ---
// ==========================================

function gameLoop() {
    if (isGameOver || isWin) return; 

    // Update Pergerakan Burger & 3 Bom
    item.y += item.speed;
    bombs.forEach(b => b.y += b.speed);

    // Deteksi Tangkapan Burger
    if (checkCollision(item, player)) {
        score += 10;
        collectedLetters[item.letter] = true;
        
        if (checkWinCondition()) {
            isWin = true;
        } else {
            resetItem();
        }
    }
    
    // Burger Luput / Jatuh
    if (item.y > canvas.height) {
        resetItem();
    }
    
    // Deteksi 3 Bom
    bombs.forEach(b => {
        if (checkCollision(b, player)) {
            lives -= 1;
            resetBomb(b);
        }
        if (b.y > canvas.height) resetBomb(b);
    });

    if (lives <= 0) isGameOver = true;

    // --- RENDER GRAFIK ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Pemain
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // 2. Gambar Burger
    ctx.drawImage(itemImage, item.x, item.y, item.width, item.height);

    // 3. Gambar Huruf di Dalam Burger
    ctx.fillStyle = item.letter === 'O' ? "#FF0000" : "#FFFFFF";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(item.letter, item.x + (item.width / 2), item.y + (item.height / 2) + 6);

    // 4. MENGGAMBAR 3 BOM
    bombs.forEach(b => {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(b.x + b.width/2 - 2, b.y - 4, 4, 6);
    });

    // 5. TAMPILAN HUD (SKOR, NYAWA & PAPAN TARGET G O U R M E T)
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "left";
    ctx.fillText("SKOR: " + score, 15, 25);
    ctx.fillText("NYAWA: " + lives, canvas.width - 90, 25);

    // --- PAPAN TARGET VISUAL G O U R M E T ---
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    let startX = canvas.width / 2 - 75;

    targetLetters.forEach((char, index) => {
        let posX = startX + (index * 25);
        if (collectedLetters[char]) {
            ctx.fillStyle = char === 'O' ? "#E67E22" : "#2E7D32";
            ctx.fillText(char, posX, 50);
        } else {
            ctx.fillStyle = "#CCCCCC";
            ctx.fillText("_", posX, 50);
        }
    });

    // Kondisi Menang / Kalah
    if (isWin) {
        ctx.fillStyle = "#2e7d32";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GOURMET MASTER! 🏆", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = "#333";
        ctx.font = "15px Arial";
        ctx.fillText("Semua huruf G O U R M E T lengkap!", canvas.width / 2, canvas.height / 2 + 20);
        return; 
    }
    if (isGameOver) {
        ctx.fillStyle = "#d32f2f";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER 💀", canvas.width / 2, canvas.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);
}

window.focus();
gameLoop();
