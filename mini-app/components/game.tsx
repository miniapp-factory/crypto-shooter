"use client";

import { useEffect, useRef } from "react";

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  img: HTMLImageElement;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ENEMY_TYPES = [
      { type: "btc", src: "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/refs/heads/mainx/PNG/btc.png" },
      { type: "eth", src: "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/refs/heads/mainx/PNG/eth.png" },
      { type: "doge", src: "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/refs/heads/mainx/PNG/doge.png" },
      { type: "sol", src: "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/refs/heads/mainx/PNG/sol.png" },
      { type: "shib", src: "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/refs/heads/mainx/PNG/shib.png" },
      { type: "gwap", src: "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/refs/heads/mainx/PNG/gwap.png" }
    ];

    const playerImg = new Image();
    playerImg.src = "https://raw.githubusercontent.com/weatherfu/wojak/refs/heads/master/wj(3).jpg";

    let enemies: Enemy[] = [];
    let bullets: Bullet[] = [];
    let score = 0;
    let lives = 3;
    let gameState = "menu";

    const player = { x: canvas.width / 2 - 40, y: canvas.height / 2 - 40, width: 80, height: 80, speed: 5 };
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const resetGame = () => {
      enemies = [];
      bullets = [];
      score = 0;
      lives = 3;
      player.x = canvas.width / 2 - 40;
      player.y = canvas.height / 2 - 40;
      gameState = "playing";
    };

    const spawnEnemy = () => {
      if (gameState !== "playing") return;
      const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const img = new Image();
      img.src = type.src;
      img.onload = () => {
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        if (side === 0) { x = Math.random() * canvas.width; y = -50; }
        if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
        if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
        if (side === 3) { x = -50; y = Math.random() * canvas.height; }
        enemies.push({ x, y, width: 50, height: 50, img });
      };
    };

    const fireBullet = () => {
      if (gameState !== "playing") return;
      const mx = player.x + player.width / 2;
      const my = player.y + player.height / 2;
      const angle = 0; // straight up
      bullets.push({ x: mx, y: my, width: 10, height: 10, dx: Math.cos(angle) * 8, dy: Math.sin(angle) * 8 });
    };

    const shootBullet = (e: MouseEvent) => {
      if (gameState !== "playing") return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const angle = Math.atan2(my - (player.y + player.height / 2), mx - (player.x + player.width / 2));
      bullets.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, width: 10, height: 10, dx: Math.cos(angle) * 8, dy: Math.sin(angle) * 8 });
    };

    const handleClick = (e: MouseEvent) => {
      if (gameState === "menu" || gameState === "gameover") { resetGame(); return; }
      shootBullet(e);
    };
    canvas.addEventListener("click", handleClick);

    const update = () => {
      if (gameState !== "playing") return;
      if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
      if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
      if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
      if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

      bullets.forEach((b: Bullet, i: number) => {
        b.x += b.dx;
        b.y += b.dy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
      });

      enemies.forEach((e: Enemy, i: number) => {
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);
        e.x += dx / dist * 1.5;
        e.y += dy / dist * 1.5;

        bullets.forEach((b: Bullet, j: number) => {
          if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            score++;
          }
        });

        if (player.x < e.x + e.width && player.x + player.width > e.x && player.y < e.y + e.height && player.y + player.height > e.y) {
          enemies.splice(i, 1);
          lives--;
        }
      });

      if (lives <= 0) gameState = "gameover";
    };

    const drawMenu = () => {
      ctx.fillStyle = "black";
      ctx.font = "36px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Crypto Shooter", canvas.width/2, canvas.height/2 - 80);
      ctx.font = "24px Arial";
      ctx.fillText("Wojak is tired of losing crypto trade!", canvas.width/2, canvas.height/2 - 40);
      ctx.fillText("That's why he's shooting the crypto coins!", canvas.width/2, canvas.height/2 - 10);
      ctx.fillText("Use WASD or arrow keys to move, mouse to shoot", canvas.width/2, canvas.height/2 + 30);
      ctx.fillStyle = "#1e40af";
      ctx.fillRect(canvas.width/2 - 80, canvas.height/2 + 60, 160, 40);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText("Click to Play", canvas.width/2, canvas.height/2 + 85);
    };

    const drawGameOver = () => {
      ctx.fillStyle = "black";
      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 40);
      ctx.font = "30px Arial";
      ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2);
      ctx.fillText("Click to Play Again", canvas.width/2, canvas.height/2 + 50);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (gameState === "menu") return drawMenu();
      if (gameState === "gameover") return drawGameOver();
      if (playerImg.complete) ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
      bullets.forEach(b => { ctx.fillStyle = "red"; ctx.fillRect(b.x, b.y, b.width, b.height); });
      enemies.forEach(e => { if (e.img.complete) ctx.drawImage(e.img, e.x, e.y, e.width, e.height); });
      ctx.fillStyle = "black";
      ctx.font = "24px Arial";
      ctx.textAlign = "left";
      ctx.fillText("Score: " + score, 8, 32);
      ctx.fillText("Lives: " + lives, 8, 60);
    };

    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    const interval = setInterval(spawnEnemy, 1000);

    playerImg.onload = () => {
      gameLoop();
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("click", handleClick);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <canvas ref={canvasRef} id="gameCanvas" width={600} height={600} style={{ maxWidth: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        <button
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: '#1e40af',
            color: 'white',
            fontSize: '24px',
            pointerEvents: 'auto',
          }}
          onTouchStart={(e) => { e.preventDefault(); keys['ArrowUp'] = true; }}
          onTouchEnd={(e) => { e.preventDefault(); keys['ArrowUp'] = false; }}
          onMouseDown={() => { keys['ArrowUp'] = true; }}
          onMouseUp={() => { keys['ArrowUp'] = false; }}
        >
          ⬆️
        </button>
        <button
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: '#1e40af',
            color: 'white',
            fontSize: '24px',
            pointerEvents: 'auto',
          }}
          onTouchStart={(e) => { e.preventDefault(); keys['ArrowDown'] = true; }}
          onTouchEnd={(e) => { e.preventDefault(); keys['ArrowDown'] = false; }}
          onMouseDown={() => { keys['ArrowDown'] = true; }}
          onMouseUp={() => { keys['ArrowDown'] = false; }}
        >
          ⬇️
        </button>
        <button
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: '#1e40af',
            color: 'white',
            fontSize: '24px',
            pointerEvents: 'auto',
          }}
          onTouchStart={(e) => { e.preventDefault(); keys['ArrowLeft'] = true; }}
          onTouchEnd={(e) => { e.preventDefault(); keys['ArrowLeft'] = false; }}
          onMouseDown={() => { keys['ArrowLeft'] = true; }}
          onMouseUp={() => { keys['ArrowLeft'] = false; }}
        >
          ⬅️
        </button>
        <button
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: '#1e40af',
            color: 'white',
            fontSize: '24px',
            pointerEvents: 'auto',
          }}
          onTouchStart={(e) => { e.preventDefault(); keys['ArrowRight'] = true; }}
          onTouchEnd={(e) => { e.preventDefault(); keys['ArrowRight'] = false; }}
          onMouseDown={() => { keys['ArrowRight'] = true; }}
          onMouseUp={() => { keys['ArrowRight'] = false; }}
        >
          ➡️
        </button>
        <button
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: '#e11d48',
            color: 'white',
            fontSize: '28px',
            pointerEvents: 'auto',
          }}
          onTouchStart={(e) => { e.preventDefault(); fireBullet(); }}
          onMouseDown={() => { fireBullet(); }}
        >
          🔫
        </button>
      </div>
    </div>
  );
}
