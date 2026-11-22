(() => {
const canvas = document.getElementById('pineLoaderCanvas');
if (!(canvas instanceof HTMLCanvasElement)) return;

const ctx = canvas.getContext('2d', { alpha: true });
if (!ctx) return;

ctx.imageSmoothingEnabled = false;

// Native pixel art resolution (160 x 136)
const W = 160;
const H = 136;

// Offscreen buffer for static background dome + island so rendering is ultra-crisp and fast
const staticBuffer = document.createElement('canvas');
staticBuffer.width = W;
staticBuffer.height = H;
const sctx = staticBuffer.getContext('2d', { alpha: true });
sctx.imageSmoothingEnabled = false;

// Color Palette strictly matching the approved illustration:
// Purple ONLY in the sky dome; strictly earthy browns, greens, and snow whites on the island
const PAL = {
  outline: '#161b18',
  sky1: '#2b134d',
  sky2: '#3f1c6e',
  sky3: '#56278e',
  sky4: '#7238a8',
  sky5: '#9452bd',
  sky6: '#b675cf',
  skyGlow: '#d199db',
  starWhite: '#ffffff',
  starLavender: '#e3b8ff',
  starPink: '#f7c6f2',
  trunkDark: '#472511',
  trunkMid: '#6e3b1b',
  trunkLight: '#945429',
  pineDark: '#173d24',
  pineMid: '#266134',
  pineBright: '#3d8c40',
  pineLime: '#63b349',
  pineHighlight: '#8cd15a',
  snowShadow: '#9fc5e8',
  snowMid: '#cfe6fa',
  snowBright: '#ffffff',
  grassDark: '#234a1c',
  grassMid: '#3d7a24',
  grassLight: '#63a82c',
  grassTip: '#89cc3d',
  mudOutline: '#1c120c',
  mudDark: '#3d2312',
  mudMid: '#5c361c',
  mudLight: '#7a4a27',
  mudHighlight: '#965e34'
};

function px(targetCtx, x, y, color) {
  targetCtx.fillStyle = color;
  targetCtx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function rect(targetCtx, x, y, w, h, color) {
  targetCtx.fillStyle = color;
  targetCtx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

const domeCX = 80;
const domeCY = 68;
const domeR = 54;

function isInsideSkyDome(x, y) {
  const dx = x - domeCX;
  const dy = y - domeCY;
  const distSq = dx * dx + dy * dy;
  return distSq <= domeR * domeR && y <= 93;
}

function buildStaticScene() {
  sctx.clearRect(0, 0, W, H);

  // --- A. NIGHT SKY DOME (Concentric Pixel Bands) ---
  const glowCX = 80;
  const glowCY = 77;
  for (let y = 12; y <= 94; y++) {
    for (let x = 24; x <= 136; x++) {
      const dx = x - domeCX;
      const dy = y - domeCY;
      const dDome = Math.sqrt(dx * dx + dy * dy);
      if (dDome <= domeR && y <= 92) {
        const gx = (x - glowCX) * 0.92;
        const gy = (y - glowCY) * 1.08;
        const dGlow = Math.sqrt(gx * gx + gy * gy);

        let col = PAL.sky1;
        if (dGlow < 17) col = PAL.skyGlow;
        else if (dGlow < 24) col = PAL.sky6;
        else if (dGlow < 31) col = PAL.sky5;
        else if (dGlow < 38) col = PAL.sky4;
        else if (dGlow < 45) col = PAL.sky3;
        else if (dGlow < 52) col = PAL.sky2;
        else col = PAL.sky1;

        if (dDome > domeR - 1.15) {
          col = '#220e3d';
        }
        px(sctx, x, y, col);
      }
    }
  }

  const staticStars = [
    [53, 35, PAL.starLavender], [67, 24, PAL.starWhite], [83, 21, PAL.starPink],
    [98, 25, PAL.starWhite], [112, 34, PAL.starLavender], [43, 47, PAL.starWhite],
    [119, 46, PAL.starWhite], [37, 61, PAL.starLavender], [124, 62, PAL.starLavender],
    [46, 73, PAL.starWhite], [115, 74, PAL.starWhite], [60, 42, PAL.starPink],
    [102, 41, PAL.starLavender], [75, 31, PAL.starLavender], [91, 32, PAL.starWhite],
    [34, 75, PAL.starWhite], [127, 76, PAL.starWhite], [52, 56, PAL.starWhite],
    [109, 55, PAL.starPink]
  ];
  staticStars.forEach(([sx, sy, scol]) => {
    if (isInsideSkyDome(sx, sy)) px(sctx, sx, sy, scol);
  });

  // --- B. PINE TREES CLUSTER ---
  function drawPineTree(cx, baseY, height, maxHalfW, style) {
    const topY = baseY - height;
    const trunkH = Math.max(5, Math.round(height * 0.19));
    const foliageBottomY = baseY - trunkH;
    const foliageH = foliageBottomY - topY;

    const trunkW = maxHalfW >= 13 ? 4 : 3;
    const tx = Math.round(cx - trunkW / 2);
    rect(sctx, tx - 1, foliageBottomY - 1, trunkW + 2, trunkH + 2, PAL.outline);
    rect(sctx, tx, foliageBottomY, trunkW, trunkH, PAL.trunkMid);
    rect(sctx, tx, foliageBottomY, 1, trunkH, PAL.trunkDark);
    if (trunkW >= 4) {
      rect(sctx, tx + 2, foliageBottomY, 1, trunkH, PAL.trunkLight);
    }

    const tiers = maxHalfW >= 13 ? 5 : 4;
    const foliagePixels = new Map();

    for (let t = 0; t < tiers; t++) {
      const tRatio0 = t / tiers;
      const tRatio1 = (t + 1.22) / tiers;
      const tierTop = Math.round(topY + foliageH * tRatio0 * 0.86);
      const tierBot = Math.min(foliageBottomY, Math.round(topY + foliageH * Math.min(1, tRatio1)));
      const tierMaxW = Math.max(2, Math.round(maxHalfW * (0.34 + 0.66 * ((t + 1) / tiers))));

      for (let y = tierTop; y <= tierBot; y++) {
        const localProgress = (y - tierTop) / Math.max(1, tierBot - tierTop);
        let halfW = Math.round(tierMaxW * Math.pow(localProgress, 0.85));
        if (y === tierBot && tierMaxW > 3) halfW += 1;

        for (let dx = -halfW; dx <= halfW; dx++) {
          const x = cx + dx;
          const normX = dx / Math.max(1, halfW);

          let col = style === 'lime' ? PAL.pineLime : PAL.pineBright;
          if (normX < -0.45) {
            col = style === 'lime' ? PAL.pineBright : PAL.pineMid;
          } else if (normX > 0.35 || localProgress > 0.78) {
            col = style === 'lime' ? PAL.pineMid : PAL.pineDark;
          }
          if (style === 'lime' && normX < -0.1 && localProgress < 0.45) {
            col = PAL.pineHighlight;
          }

          if (y === tierBot && Math.abs(dx) % 2 === 1) {
            col = PAL.pineDark;
          }

          const hasSnowShelf =
            (t < tiers - 1 && localProgress >= 0.48 && localProgress <= 0.76 && Math.abs(dx) <= halfW - 1) ||
            (t === 0 && localProgress <= 0.45 && Math.abs(dx) <= 1);

          if (hasSnowShelf) {
            const snowNoise = ((x * 7 + y * 13 + t * 5) % 5);
            if (snowNoise !== 0) {
              col = localProgress > 0.66 ? PAL.snowShadow : PAL.snowBright;
            }
          }

          foliagePixels.set(`${x},${y}`, col);
        }
      }
    }

    foliagePixels.forEach((_, key) => {
      const [x, y] = key.split(',').map(Number);
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
      ];
      neighbors.forEach(([nx, ny]) => {
        if (!foliagePixels.has(`${nx},${ny}`)) {
          px(sctx, nx, ny, PAL.outline);
        }
      });
    });

    foliagePixels.forEach((col, key) => {
      const [x, y] = key.split(',').map(Number);
      px(sctx, x, y, col);
    });
  }

  drawPineTree(64, 86, 34, 10, 'lime');
  drawPineTree(83, 85, 33, 10, 'emerald');
  drawPineTree(95, 87, 29, 9, 'lime');
  drawPineTree(54, 90, 30, 10, 'emerald');
  drawPineTree(105, 90, 25, 8, 'lime');
  drawPineTree(76, 89, 39, 14, 'emerald');

  // --- C. FLOATING ISLAND TERRAIN ---
  const islandPixels = new Map();

  for (let x = 28; x <= 132; x++) {
    const nx = (x - 80) / 52;
    if (Math.abs(nx) > 1) continue;

    const edgeDrop = Math.pow(Math.abs(nx), 2.4) * 7;
    const waveTop = Math.sin(x * 0.22) * 1.2 + Math.cos(x * 0.45) * 0.7;
    const topY = Math.round(87 + edgeDrop + waveTop);

    const archBottom = Math.cos(nx * (Math.PI * 0.5)) * 12;
    const centerVPeak = Math.max(0, 1 - Math.abs(x - 79) / 14) * 8;
    const leftCrag = Math.exp(-Math.pow((x - 53) / 7, 2)) * 3.5;
    const rightCrag = Math.exp(-Math.pow((x - 105) / 7, 2)) * 3;
    const jagged = Math.sin(x * 0.52) * 1.1;

    const bottomY = Math.round(94 + archBottom + centerVPeak + leftCrag + rightCrag + jagged);

    const snowMask = Math.cos(nx * (Math.PI * 0.52));
    const snowThick = snowMask > 0.28
      ? Math.max(0, Math.round(snowMask * 7 + Math.sin(x * 0.35) * 1.2))
      : 0;

    const grassThick = Math.round(4 + Math.abs(Math.sin(x * 0.4)) * 2.5);

    for (let y = topY; y <= bottomY; y++) {
      const depthFromTop = y - topY;
      const distFromBottom = bottomY - y;
      let col = PAL.mudMid;

      if (depthFromTop < snowThick) {
        if (depthFromTop === 0) {
          col = PAL.snowBright;
        } else if (depthFromTop >= snowThick - 1) {
          col = PAL.snowShadow;
        } else {
          col = PAL.snowMid;
        }
      } else if (depthFromTop < snowThick + grassThick) {
        const grassRel = depthFromTop - snowThick;
        if (grassRel === 0) {
          col = (x % 3 === 0) ? PAL.grassTip : PAL.grassLight;
        } else if (grassRel >= grassThick - 1) {
          col = PAL.grassDark;
        } else {
          col = ((x + y) % 4 === 0) ? PAL.grassLight : PAL.grassMid;
        }
      } else {
        const shadeNoise = (x * 11 + y * 17) % 7;
        if (distFromBottom <= 2 || nx > 0.45) {
          col = PAL.mudDark;
        } else if (nx < -0.2 && shadeNoise < 3) {
          col = PAL.mudHighlight;
        } else if (shadeNoise < 4) {
          col = PAL.mudLight;
        } else {
          col = PAL.mudMid;
        }
      }

      islandPixels.set(`${x},${y}`, col);
    }
  }

  const snowPatches = [
    [38, 91, 7, 2],
    [46, 94, 5, 2],
    [74, 96, 6, 2],
    [116, 90, 6, 2]
  ];
  snowPatches.forEach(([sx, sy, sw, sh]) => {
    for (let pyOffset = 0; pyOffset < sh; pyOffset++) {
      for (let pxOffset = 0; pxOffset < sw; pxOffset++) {
        const key = `${sx + pxOffset},${sy + pyOffset}`;
        if (islandPixels.has(key)) {
          islandPixels.set(key, pyOffset === 0 ? PAL.snowBright : PAL.snowShadow);
        }
      }
    }
  });

  islandPixels.forEach((_, key) => {
    const [x, y] = key.split(',').map(Number);
    const neighbors = [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
    ];
    neighbors.forEach(([nx, ny]) => {
      if (!islandPixels.has(`${nx},${ny}`)) {
        const outlineCol = ny < 95 ? PAL.outline : PAL.mudOutline;
        px(sctx, nx, ny, outlineCol);
      }
    });
  });

  islandPixels.forEach((col, key) => {
    const [x, y] = key.split(',').map(Number);
    px(sctx, x, y, col);
  });

  const trunkBases = [
    [54, 89, 3], [64, 86, 3], [76, 88, 4], [83, 85, 3], [95, 87, 3], [105, 90, 3]
  ];
  trunkBases.forEach(([cx, baseY, tw]) => {
    const tx = Math.round(cx - tw / 2);
    rect(sctx, tx - 1, baseY - 2, tw + 2, 2, PAL.outline);
    rect(sctx, tx, baseY - 3, tw, 3, PAL.trunkMid);
    rect(sctx, tx, baseY - 3, 1, 3, PAL.trunkDark);
    rect(sctx, tx - 1, baseY, tw + 2, 1, PAL.snowShadow);
  });
}

buildStaticScene();

const twinkleStars = [
  { x: 56, y: 31, phase: 0.0, speed: 0.045, col: PAL.starPink },
  { x: 78, y: 23, phase: 1.8, speed: 0.038, col: PAL.starWhite },
  { x: 108, y: 38, phase: 3.4, speed: 0.052, col: PAL.starLavender },
  { x: 42, y: 53, phase: 2.1, speed: 0.042, col: PAL.starWhite },
  { x: 117, y: 57, phase: 4.5, speed: 0.048, col: PAL.starPink }
];

const snowflakes = Array.from({ length: 48 }, (_, i) => ({
  x: 32 + ((i * 29) % 96),
  y: 18 + ((i * 19) % 72),
  vy: 0.14 + (i % 4) * 0.05,
  swayAmp: 0.6 + (i % 3) * 0.45,
  swayFreq: 0.024 + (i % 5) * 0.006,
  phase: (i * 137.5) % 360,
  size: i % 6 === 0 ? 2 : 1,
  alpha: i % 3 === 0 ? 0.8 : 1
}));

let frame = 0;

function renderLoop() {
  if (!canvas.isConnected) return;

  frame++;
  ctx.clearRect(0, 0, W, H);

  const floatY = Math.round(Math.sin(frame * 0.045) * 2);
  ctx.drawImage(staticBuffer, 0, floatY);

  twinkleStars.forEach((st) => {
    const pulse = Math.sin(frame * st.speed + st.phase);
    const sy = st.y + floatY;
    if (!isInsideSkyDome(st.x, st.y)) return;

    if (pulse > 0.25) {
      px(ctx, st.x, sy, PAL.starWhite);
      px(ctx, st.x - 1, sy, st.col);
      px(ctx, st.x + 1, sy, st.col);
      px(ctx, st.x, sy - 1, st.col);
      px(ctx, st.x, sy + 1, st.col);
    } else if (pulse > -0.35) {
      px(ctx, st.x, sy, st.col);
    }
  });

  snowflakes.forEach((fl) => {
    fl.y += fl.vy;
    if (fl.y > 90) {
      fl.y = 18 + Math.random() * 14;
      fl.x = 34 + Math.random() * 92;
    }

    const rx = Math.round(fl.x + Math.sin(frame * fl.swayFreq + fl.phase) * fl.swayAmp);
    const ry = Math.round(fl.y);

    if (isInsideSkyDome(rx, ry)) {
      ctx.fillStyle = fl.alpha < 1 ? PAL.snowMid : PAL.snowBright;
      ctx.fillRect(rx, ry + floatY, fl.size, fl.size);
    }
  });

  requestAnimationFrame(renderLoop);
}

renderLoop();
})();
