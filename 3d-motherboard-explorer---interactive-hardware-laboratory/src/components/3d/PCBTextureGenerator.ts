import * as THREE from 'three';

export function generatePCBTexture(theme: string = 'clean-light'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Authentic Classic Green PCB Solder Mask Colors
  // Vibrant emerald/forest green with layered copper tones
  let baseColor = '#0b522b'; // Rich classic motherboard green
  let groundPour = '#084021'; // Deep darker green copper pour areas
  let traceCopper = '#d97706'; // Polished golden copper
  let traceGoldBright = '#fbbf24'; // Radiant ENIG gold
  let traceSilver = '#e2e8f0'; // Tinned solder traces
  let traceCyan = '#38bdf8'; // High-speed digital signals
  let traceRuby = '#f43f5e'; // Power distribution traces
  let silkColor = '#f8fafc'; // Crisp white silkscreen notation

  if (theme === 'blueprint-cad') {
    baseColor = '#0a192f';
    groundPour = '#071224';
    traceCopper = '#38bdf8';
    traceGoldBright = '#818cf8';
    traceSilver = '#e0f2fe';
    traceCyan = '#38bdf8';
    silkColor = '#ffffff';
  } else if (theme === 'stealth-matrix') {
    baseColor = '#052e16';
    groundPour = '#021e0e';
    traceCopper = '#22c55e';
    traceGoldBright = '#4ade80';
    traceSilver = '#dcfce7';
    traceCyan = '#10b981';
    silkColor = '#f0fdf4';
  }

  // --- Step 1: Base Green Solder Mask ---
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Step 2: Realistic Multi-Layer Copper Polygon Pours ---
  ctx.fillStyle = groundPour;
  // VRM Area Ground Polygon
  ctx.beginPath();
  ctx.roundRect(100, 100, 1000, 520, 16);
  ctx.fill();

  // PCIe Area Ground Polygon
  ctx.beginPath();
  ctx.roundRect(100, 820, 920, 1100, 16);
  ctx.fill();

  // Chipset & Storage Area Ground Polygon
  ctx.beginPath();
  ctx.roundRect(1040, 820, 900, 1100, 16);
  ctx.fill();

  // --- Step 3: Microscopic FR-4 Fiberglass Matrix Texture ---
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let x = 0; x < canvas.width; x += 4) {
    ctx.fillRect(x, 0, 2, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  // --- Step 4: High-Density Copper Circuit Traces & Bus Pathways ---
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ==========================================
  // CIRCUIT BUS 1: CPU to DDR5 RAM Channel A & B (Serpentine Length-Matched Pairs)
  // ==========================================
  const ramStartX = 1180;
  const ramStartY = 360;

  for (let pair = 0; pair < 36; pair++) {
    const y = ramStartY + pair * 16;
    const isSerpentine = pair % 2 === 0;

    // Copper Trace with Golden Sheen
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = pair % 3 === 0 ? traceGoldBright : traceCopper;
    ctx.beginPath();
    ctx.moveTo(940, y);
    if (isSerpentine) {
      ctx.lineTo(990 + (pair % 4) * 8, y);
      ctx.lineTo(1005 + (pair % 4) * 8, y - 5);
      ctx.lineTo(1020 + (pair % 4) * 8, y + 5);
      ctx.lineTo(1035 + (pair % 4) * 8, y);
    }
    ctx.lineTo(ramStartX, y);
    ctx.stroke();

    // Paired Differential Trace
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = traceGoldBright;
    ctx.beginPath();
    ctx.moveTo(940, y + 3.5);
    if (isSerpentine) {
      ctx.lineTo(990 + (pair % 4) * 8, y + 3.5);
      ctx.lineTo(1005 + (pair % 4) * 8, y - 1.5);
      ctx.lineTo(1020 + (pair % 4) * 8, y + 8.5);
      ctx.lineTo(1035 + (pair % 4) * 8, y + 3.5);
    }
    ctx.lineTo(ramStartX, y + 3.5);
    ctx.stroke();

    // Gold Plated Contact Land on DIMM Slot
    ctx.fillStyle = traceGoldBright;
    ctx.fillRect(ramStartX, y - 1, 16, 5);
    ctx.fillStyle = traceSilver;
    ctx.fillRect(ramStartX + 12, y, 4, 3);
  }

  // ==========================================
  // CIRCUIT BUS 2: CPU to Primary PCIe Gen 5.0 x16 Differential Lanes
  // ==========================================
  const pcieStartX = 320;
  const pcieStartY = 1100;

  for (let lane = 0; lane < 16; lane++) {
    const x = pcieStartX + lane * 44;
    
    // Main High-Frequency Differential Track
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = lane % 2 === 0 ? traceGoldBright : traceCopper;
    ctx.beginPath();
    ctx.moveTo(780 + (lane % 8) * 18, 730);
    ctx.lineTo(780 + (lane % 8) * 18, 860 + (lane % 4) * 14);
    ctx.lineTo(x, 970);
    ctx.lineTo(x, pcieStartY);
    ctx.stroke();

    // Complementary Track
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = traceGoldBright;
    ctx.beginPath();
    ctx.moveTo(784 + (lane % 8) * 18, 730);
    ctx.lineTo(784 + (lane % 8) * 18, 864 + (lane % 4) * 14);
    ctx.lineTo(x + 5, 970);
    ctx.lineTo(x + 5, pcieStartY);
    ctx.stroke();

    // Gold ENIG SMT Landing Pad
    ctx.fillStyle = traceGoldBright;
    ctx.fillRect(x - 2, pcieStartY, 12, 20);
  }

  // ==========================================
  // CIRCUIT BUS 3: CPU to Intel Z790 Chipset DMI 4.0 x8 Bus
  // ==========================================
  for (let i = 0; i < 10; i++) {
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = i % 2 === 0 ? traceGoldBright : traceCopper;
    ctx.beginPath();
    ctx.moveTo(860 + i * 18, 760);
    ctx.lineTo(1080 + i * 18, 1020);
    ctx.lineTo(1320 + i * 18, 1300);
    ctx.stroke();
  }

  // ==========================================
  // CIRCUIT BUS 4: Chipset to M.2_2, M.2_3, SATA & Rear I/O Traces
  // ==========================================
  for (let i = 0; i < 20; i++) {
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = i % 3 === 0 ? traceGoldBright : traceCopper;
    ctx.beginPath();
    ctx.moveTo(1440, 1380 + i * 18);
    ctx.lineTo(1880, 1380 + i * 18);
    ctx.stroke();
  }

  // ==========================================
  // CIRCUIT BUS 5: High-Current VRM 12V EPS & VCore Power Distribution Planes
  // ==========================================
  ctx.lineWidth = 8.0;
  ctx.strokeStyle = traceRuby; // Red 12V Power Rails
  // Left VRM 12V power rail
  ctx.beginPath();
  ctx.moveTo(220, 160);
  ctx.lineTo(220, 740);
  ctx.stroke();

  // Top VRM 12V power rail
  ctx.beginPath();
  ctx.moveTo(220, 160);
  ctx.lineTo(840, 160);
  ctx.stroke();

  // Heavy Ground return bars (Silver)
  ctx.lineWidth = 6.0;
  ctx.strokeStyle = traceSilver;
  ctx.beginPath();
  ctx.moveTo(200, 160);
  ctx.lineTo(200, 740);
  ctx.moveTo(200, 140);
  ctx.lineTo(840, 140);
  ctx.stroke();

  // ==========================================
  // CIRCUIT BUS 6: Audio Subsystem Isolated Guard Trace
  // ==========================================
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = traceGoldBright;
  ctx.beginPath();
  ctx.moveTo(80, 1280);
  ctx.lineTo(400, 1280);
  ctx.lineTo(400, 1980);
  ctx.stroke();

  // Internal audio signal tracks (Pure Gold)
  for (let a = 0; a < 6; a++) {
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = traceGoldBright;
    ctx.beginPath();
    ctx.moveTo(120 + a * 20, 1320);
    ctx.lineTo(120 + a * 20, 1780);
    ctx.lineTo(260, 1920);
    ctx.stroke();
  }

  // ==========================================
  // CIRCUIT BUS 7: PCIe Secondary x16 & x1 Circuit Lanes
  // ==========================================
  for (let s = 0; s < 12; s++) {
    const ySec = 1520 + (s % 4) * 8;
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = traceCopper;
    ctx.beginPath();
    ctx.moveTo(1280, 1450 + s * 14);
    ctx.lineTo(800, ySec);
    ctx.lineTo(340 + s * 30, ySec);
    ctx.stroke();
  }

  // ==========================================
  // Step 5: Dense Gold Via Stitching Matrix & SMD Solder Lands Across Entire Board
  // ==========================================
  ctx.fillStyle = traceGoldBright;

  // Generate an authentic dense grid of circuit vias
  const viaClusters = [
    // CPU socket perimeter vias
    ...Array.from({ length: 48 }, (_, i) => [660 + (i % 8) * 52, 420 + Math.floor(i / 8) * 52]),
    // VRM power stage stitching vias
    ...Array.from({ length: 45 }, (_, i) => [180 + (i % 3) * 28, 200 + Math.floor(i / 3) * 36]),
    ...Array.from({ length: 45 }, (_, i) => [260 + Math.floor(i / 3) * 36, 120 + (i % 3) * 28]),
    // PCIe guard plane vias
    ...Array.from({ length: 32 }, (_, i) => [300 + i * 26, 1180]),
    ...Array.from({ length: 32 }, (_, i) => [300 + i * 26, 1420]),
    // Chipset perimeter vias
    ...Array.from({ length: 36 }, (_, i) => [1280 + (i % 6) * 44, 1340 + Math.floor(i / 6) * 44]),
    // Audio isolation vias
    ...Array.from({ length: 24 }, (_, i) => [410, 1300 + i * 28]),
    // Board perimeter ground stitching vias
    ...Array.from({ length: 40 }, (_, i) => [80 + i * 46, 80]),
    ...Array.from({ length: 40 }, (_, i) => [80 + i * 46, 1960]),
    ...Array.from({ length: 40 }, (_, i) => [80, 80 + i * 46]),
    ...Array.from({ length: 40 }, (_, i) => [1960, 80 + i * 46]),
  ];

  viaClusters.forEach(([vx, vy]) => {
    // Outer Gold Annular Ring
    ctx.fillStyle = traceGoldBright;
    ctx.beginPath();
    ctx.arc(vx, vy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Silver Plated Rim
    ctx.strokeStyle = traceSilver;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Central Laser-Drilled Through Hole
    ctx.fillStyle = '#03160a';
    ctx.beginPath();
    ctx.arc(vx, vy, 2.0, 0, Math.PI * 2);
    ctx.fill();
  });

  // SMD Resistor & Capacitor Landing Pads Arrays
  ctx.fillStyle = traceSilver;
  for (let r = 0; r < 40; r++) {
    const rx = 500 + (r % 8) * 70;
    const ry = 800 + Math.floor(r / 8) * 60;
    ctx.fillRect(rx, ry, 6, 10);
    ctx.fillRect(rx + 10, ry, 6, 10);
    // Connecting micro-trace
    ctx.strokeStyle = traceCopper;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx + 16, ry + 5);
    ctx.lineTo(rx + 28, ry + 5);
    ctx.stroke();
  }

  // ==========================================
  // Step 6: Crisp Silkscreen Engineering Notation & Typography
  // ==========================================
  ctx.fillStyle = silkColor;
  ctx.font = 'bold 22px "SF Mono", "Fira Code", monospace';
  ctx.fillText('Z790 APEX HERO // REV 1.04', 180, 1980);
  ctx.fillText('ATX FORM FACTOR 305x244mm (8-LAYER PCB)', 180, 2010);
  ctx.fillText('HIGH INTEGRITY SIGNAL ROUTING', 180, 2035);

  ctx.font = 'bold 16px "SF Mono", monospace';
  ctx.fillText('LGA1700 / AM5 SOCKET', 720, 440);
  ctx.fillText('DDR5 DUAL CHANNEL BOOST (CH-A / CH-B)', 1240, 330);
  ctx.fillText('PCIe 5.0 x16 DIRECT SAFE-SLOT', 340, 1080);
  ctx.fillText('PCIe 4.0 x16 EXPANSION SLOT', 340, 1540);
  ctx.fillText('PCIe 4.0 x1 EXPANSION SLOT', 340, 1710);
  ctx.fillText('M.2_1 PCIe Gen5 x4 (CPU)', 620, 1340);
  ctx.fillText('M.2_2 PCIe Gen4 x4 (PCH)', 1150, 1500);
  ctx.fillText('SATA 6Gb/s [PORT 1-6]', 1720, 1360);
  ctx.fillText('SUPREME-FX AUDIO HD (ISOLATED)', 120, 1260);
  ctx.fillText('INTEL Z790 PCH CHIPSET', 1340, 1340);

  // Pin 1 Gold Alignment Triangle
  ctx.fillStyle = traceGoldBright;
  ctx.beginPath();
  ctx.moveTo(680, 460);
  ctx.lineTo(704, 460);
  ctx.lineTo(692, 440);
  ctx.fill();

  // CE / FCC / RoHS Compliance Badges
  ctx.strokeStyle = silkColor;
  ctx.lineWidth = 2.0;
  ctx.strokeRect(1750, 1960, 45, 30);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CE', 1760, 1982);
  ctx.strokeRect(1810, 1960, 50, 30);
  ctx.fillText('FCC', 1820, 1982);
  ctx.strokeRect(1875, 1960, 60, 30);
  ctx.fillText('RoHS', 1885, 1982);

  // Barcode Serial Strip
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(1720, 1880, 220, 55);
  ctx.fillStyle = '#0f172a';
  for (let b = 0; b < 40; b++) {
    const w = (b % 3 === 0 ? 3 : b % 2 === 0 ? 2 : 1) * 2;
    ctx.fillRect(1730 + b * 5, 1888, w, 32);
  }
  ctx.font = '10px monospace';
  ctx.fillText('SN: MB-Z790-2026-X99482', 1735, 1930);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
