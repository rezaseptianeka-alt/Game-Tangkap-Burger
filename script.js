const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==========================================
// --- 1. PENYIAPAN GAMBAR (SVG DATA URI) ---
// ==========================================

// Gambar Pemain (Karakter Manusia Stik)
const playerImage = new Image();
playerImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><circle cx="35" cy="25" r="18" fill="none" stroke="%231a1a2e" stroke-width="4"/><circle cx="30" cy="22" r="2" fill="%231a1a2e"/><circle cx="40" cy="22" r="2" fill="%231a1a2e"/><path d="M 28 32 Q 35 38 42 32" fill="none" stroke="%231a1a2e" stroke-width="3"/><path d="M 35 43 L 30 75 L 15 105 M 30 75 L 45 105" fill="none" stroke="%231a1a2e" stroke-width="4"/><path d="M 32 50 L 55 60 L 62 64" fill="none" stroke="%231a1a2e" stroke-width="3"/><rect x="62" y="65" width="32" height="22" fill="none" stroke="%231a1a2e" stroke-width="4" rx="2"/><line x1="62" y1="72" x2="94" y2="72" stroke="%231a1a2e" stroke-width="2"/><line x1="62" y1="80" x2="94" y2="80" stroke="%231a1a2e" stroke-width="2"/><line x1="72" y1="65" x2="72" y2="87" stroke="%231a1a2e" stroke-width="2"/><line x1="84" y1="65" x2="84" y2="87" stroke="%231a1a2e" stroke-width="2"/><circle cx="68" cy="91" r="4" fill="%231a1a2e"/><circle cx="88" cy="91" r="4" fill="%231a1a2e"/></svg>';

// Gambar Burger
const itemImage = new Image();
itemImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="30" rx="38" ry="20" fill="%23E67E22"/><rect x="15" y="45" width="70" height="8" rx="4" fill="%2327AE60"/><rect x="12" y="53" width="76" height="12" rx="4" fill="%23795548"/><rect x="18" y="65" width="64" height="6" rx="2" fill="%23F1C40F"/><ellipse cx="50" cy="73" rx="36" ry="12" fill="%23D35400"/><circle cx="35" cy="22" r="2" fill="%23FFF"/><circle cx="50" cy="18" r="2" fill="%23FFF"/><circle cx="65" cy="24" r="2" fill="%23FFF"/></svg>';

// ==========================================
// --- 2. DATA GAME & ANTREAN HURUF ---
// ==========================================

let player = { x: 150, y: 370, width: 90, height: 110 };

// Antrean Kata G O U R M E T
const wordSequence = ['G', 'O', 'U', 'R', 'M', 'E', 'T'];
let wordIndex = 0;

// Data Objek Burger Utama
let item = { 
    x: Math.random() * 350, 
    y: 0, 
    width: 45, 
    height: 45, 
    speed: 4, 
    letter: wordSequence[0] 
};

// Data Bom
let bomb = { x: Math.random() * 350, y: -200, width: 30, height: 30, speed: 10 };

let score = 0;
let lives = 2;
let isGameOver = false;

// ==========================================
// --- 3. KONTROL MOUSE & TOUCH (OTOMATIS) ---
// ==========================================

// Fungsi pergerakan berdasarkan koordinat X
function updatePlayerPosition(clientX) {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let targetX = (clientX - rect.left) * scaleX;

    // Posisikan tengah keranjang di posisi kursor
    player.x = targetX - (player.width / 2);

    // Batasi agar tidak keluar canvas
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

// 1. Bergerak Otomatis saat Mouse Digeser (Tanpa Perlu Klik)
window.addEventListener("mousemove", (e) => {
    updatePlayerPosition(e.clientX);
});

// 2. Bergerak Otomatis saat Layar HP Disentuh/Digeser
window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        updatePlayerPosition(e.touches[0].clientX);
    }
}, { passive: true });

window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
        updatePlayerPosition(e.touches[0].clientX);
    }
}, { passive: true });

// ==========================================
// --- 4. FUNGSI LOGIKA PERMAIANAN ---
// ==========================================

function resetItem() {
    wordIndex = (wordIndex + 1) % wordSequence.length;
    let currentLetter = wordSequence[wordIndex];

    item.y = -item.height;
    item.x = Math.random() * (canvas.width - item.width);
    item.letter = currentLetter;

    // Rasio Kecepatan 4:20 Khusus Huruf 'O'
    if (currentLetter === 'O') {
        item.speed = 20; // Sangat cepat
    } else {
        item.speed = 8;  // Normal
    }
}

function resetBomb() {
    bomb.y = -Math.random() * 300 - 100;
    bomb.x = Math.random() * (canvas.width - bomb.width);
}

function checkCollision(obj1, obj2) {
    return (
        obj1.y + obj1.height >= obj2.y + 50 && 
        obj1.x + obj1.width >= obj2.x + 40 &&
        obj1.x <= obj2.x + obj2.width
    );
}

// ==========================================
// --- 5. LOOP UTAMA GAME ---
// ==========================================

function gameLoop() {
    if (isGameOver) return; 

    // Update Posisi Objek Jatuh
    item.y += item.speed;
    bomb.y += bomb.speed;

    // Deteksi Tangkapan Burger
    if (checkCollision(item, player)) {
        score += 10;
        resetItem();
    }
    
    // Burger Luput / Jatuh ke Bawah
    if (item.y > canvas.height) {
        lives -= 1;
        resetItem();
    }
    
    // Deteksi Bom
    if (checkCollision(bomb, player)) {
        lives -= 1;
        resetBomb();
    }
    if (bomb.y > canvas.height) resetBomb();
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

    // 4. Gambar Bom
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(bomb.x + bomb.width/2, bomb.y + bomb.height/2, bomb.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(bomb.x + bomb.width/2 - 2, bomb.y - 4, 4, 6);

    // 5. Tampilan HUD (Skor, Nyawa & Target)
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("SKOR: " + score, 15, 30);
    ctx.fillText("NYAWA: " + lives, canvas.width - 100, 30);
    
    ctx.fillStyle = "#E67E22";
    ctx.fillText("TARGET: " + item.letter, 15, 55);

    // Kondisi Menang / Kalah
    if (score >= 140) {
        ctx.fillStyle = "#2e7d32";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GOURMET MASTER! 🏆", canvas.width / 2, canvas.height / 2);
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

// Otomatis Aktifkan Fokus Window & Jalankan Game
window.focus();
gameLoop();
