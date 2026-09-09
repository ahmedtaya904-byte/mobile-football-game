// متغيرات اللعبة
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// حالة اللعبة
let gameState = {
    isRunning: false,
    isPaused: false,
    score1: 0,
    score2: 0,
    time: 2700, // 45 دقيقة بالثواني
    gameHalf: 1
};

// الكرة
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    vx: 0,
    vy: 0,
    friction: 0.98,
    maxSpeed: 8
};

// اللاعب الأول (أزرق)
const player1 = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 30,
    speed: 5,
    vx: 0,
    vy: 0,
    team: 1,
    color: '#0066cc'
};

// اللاعب الثاني (أحمر)
const player2 = {
    x: canvas.width - 50,
    y: canvas.height / 2,
    width: 20,
    height: 30,
    speed: 5,
    vx: 0,
    vy: 0,
    team: 2,
    color: '#ff3333'
};

// مفاتيح الضغط
const keys = {};

// استمع لأحداث لوحة المفاتيح
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        kickBall();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// أزرار التحكم
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// دالة بدء اللعبة
function startGame() {
    gameState.isRunning = true;
    gameState.isPaused = false;
    document.getElementById('startBtn').textContent = '▶ جارية';
    document.getElementById('startBtn').disabled = true;
    gameLoop();
}

// دالة إيقاف اللعبة
function pauseGame() {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseBtn').textContent = gameState.isPaused ? '▶ استئناف' : '⏸ إيقاف';
}

// دالة إعادة تعيين اللعبة
function resetGame() {
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.score1 = 0;
    gameState.score2 = 0;
    gameState.time = 2700;
    gameState.gameHalf = 1;
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    
    player1.x = 50;
    player1.y = canvas.height / 2;
    
    player2.x = canvas.width - 50;
    player2.y = canvas.height / 2;
    
    document.getElementById('startBtn').textContent = '▶ ابدأ اللعبة';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '⏸ إيقاف';
    
    updateScore();
    updateTimer();
    draw();
}

// دالة تحديث درجة النقاط
function updateScore() {
    document.getElementById('score1').textContent = gameState.score1;
    document.getElementById('score2').textContent = gameState.score2;
}

// دالة تحديث المؤقت
function updateTimer() {
    const minutes = Math.floor(gameState.time / 60);
    const seconds = gameState.time % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeStr;
}

// دالة ركل الكرة
function kickBall() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const ballDistance = Math.sqrt(
        Math.pow(ball.x - player1.x, 2) + Math.pow(ball.y - player1.y, 2)
    );
    
    if (ballDistance < 40) {
        ball.vx = 6;
        ball.vy = (Math.random() - 0.5) * 4;
    }
}

// دالة تحديث موضع اللاعبين
function updatePlayers() {
    // لاعب 1
    player1.vx = 0;
    player1.vy = 0;
    
    if (keys['w'] || keys['arrowup']) player1.vy = -player1.speed;
    if (keys['s'] || keys['arrowdown']) player1.vy = player1.speed;
    if (keys['a'] || keys['arrowleft']) player1.vx = -player1.speed;
    if (keys['d'] || keys['arrowright']) player1.vx = player1.speed;
    
    player1.x += player1.vx;
    player1.y += player1.vy;
    
    // حد الملعب
    player1.x = Math.max(10, Math.min(canvas.width * 0.5 - 10, player1.x));
    player1.y = Math.max(15, Math.min(canvas.height - 15, player1.y));
    
    // لاعب 2 (AI بسيط)
    const distToBall = Math.sqrt(
        Math.pow(player2.x - ball.x, 2) + Math.pow(player2.y - ball.y, 2)
    );
    
    if (distToBall < 150) {
        if (player2.y > ball.y) {
            player2.y -= player2.speed * 0.8;
        } else if (player2.y < ball.y) {
            player2.y += player2.speed * 0.8;
        }
        
        if (player2.x > ball.x) {
            player2.x -= player2.speed * 0.8;
        }
    } else {
        player2.x = canvas.width - 50;
        if (player2.y > canvas.height / 2) {
            player2.y -= player2.speed * 0.5;
        } else {
            player2.y += player2.speed * 0.5;
        }
    }
    
    player2.x = Math.max(canvas.width * 0.5 + 10, Math.min(canvas.width - 10, player2.x));
    player2.y = Math.max(15, Math.min(canvas.height - 15, player2.y));
}

// دالة تحديث الكرة
function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // احتكاك
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    
    // حدود الملعب
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -0.8;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.8;
    }
    
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -0.8;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.8;
    }
    
    // التصادم مع اللاعبين
    checkCollision(ball, player1);
    checkCollision(ball, player2);
    
    // فحص الأهداف
    checkGoal();
}

// دالة فحص التصادم
function checkCollision(ball, player) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < ball.radius + 15) {
        const angle = Math.atan2(dy, dx);
        const speed = 6;
        
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
        
        ball.x = player.x + Math.cos(angle) * (ball.radius + 15);
        ball.y = player.y + Math.sin(angle) * (ball.radius + 15);
    }
}

// دالة فحص الأهداف
function checkGoal() {
    const goalWidth = 80;
    const goalX1 = (canvas.width - goalWidth) / 2 - 40;
    const goalX2 = (canvas.width + goalWidth) / 2 + 40;
    
    // مرمى الفريق الأول
    if (ball.x < 5 && ball.y > canvas.height / 2 - 50 && ball.y < canvas.height / 2 + 50) {
        gameState.score2++;
        resetBallPosition();
        updateScore();
    }
    
    // مرمى الفريق الثاني
    if (ball.x > canvas.width - 5 && ball.y > canvas.height / 2 - 50 && ball.y < canvas.height / 2 + 50) {
        gameState.score1++;
        resetBallPosition();
        updateScore();
    }
}

// إعادة تعيين موضع الكرة
function resetBallPosition() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
}

// دالة الرسم
function draw() {
    // رسم الملعب
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // خط الملعب الأبيض
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // دائرة المنتصف
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    // نقطة المنتصف
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // مناطق المرمى
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, canvas.height / 2 - 50, 15, 100);
    ctx.strokeRect(canvas.width - 15, canvas.height / 2 - 50, 15, 100);
    
    // رسم اللاعبين
    drawPlayer(player1);
    drawPlayer(player2);
    
    // رسم الكرة
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();
}

// دالة رسم اللاعب
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(
        player.x - player.width / 2,
        player.y - player.height / 2,
        player.width,
        player.height
    );
    
    // عينان
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x - 5, player.y - 5, 3, 3);
    ctx.fillRect(player.x + 2, player.y - 5, 3, 3);
}

// حلقة اللعبة الرئيسية
function gameLoop() {
    if (!gameState.isRunning) return;
    
    if (!gameState.isPaused) {
        updatePlayers();
        updateBall();
        
        // تحديث الوقت
        if (gameState.time > 0) {
            gameState.time--;
        } else {
            gameState.isRunning = false;
            document.getElementById('startBtn').textContent = '⏹ انتهت اللعبة';
        }
        
        updateTimer();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// رسم أولي
updateScore();
updateTimer();
draw();