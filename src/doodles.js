/**
 * R. Jagadishwar Reddy - Sketchbook Portfolio
 * Procedural Hand-Drawn Canvas Doodle Generator
 */

// Helper to draw sketchy lines with double strokes and slight noise
export function drawSketchLine(ctx, x1, y1, x2, y2, color, thickness = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Split the line into small segments for wobbly effect
  const segments = Math.max(2, Math.floor(dist / 8));

  // Pass 1
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const wobbleX = (Math.random() - 0.5) * 1.8;
    const wobbleY = (Math.random() - 0.5) * 1.8;
    ctx.lineTo(x1 + dx * t + wobbleX, y1 + dy * t + wobbleY);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Pass 2 (slight offset double-draw for sketchbook look)
  ctx.beginPath();
  ctx.moveTo(x1 + (Math.random() - 0.5) * 0.5, y1 + (Math.random() - 0.5) * 0.5);
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const wobbleX = (Math.random() - 0.5) * 2.0;
    const wobbleY = (Math.random() - 0.5) * 2.0;
    ctx.lineTo(x1 + dx * t + wobbleX, y1 + dy * t + wobbleY);
  }
  ctx.lineTo(x2 + (Math.random() - 0.5) * 0.5, y2 + (Math.random() - 0.5) * 0.5);
  ctx.stroke();
}

// Draw a sketchy circle/ellipse
export function drawSketchCircle(ctx, cx, cy, rx, ry, color, thickness = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  
  const steps = 36;
  
  // Double pass
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const startAngle = Math.random() * 0.2;
    const startX = cx + rx * Math.cos(startAngle);
    const startY = cy + ry * Math.sin(startAngle);
    ctx.moveTo(startX, startY);
    
    // Draw spiral overlap
    for (let i = 1; i <= steps + 2; i++) {
      const angle = startAngle + (i / steps) * Math.PI * 2;
      const wobbleR = 1 + (Math.random() - 0.5) * 1.5;
      const x = cx + (rx + wobbleR) * Math.cos(angle);
      const y = cy + (ry + wobbleR) * Math.sin(angle);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// 1. Open Journal / Bio Doodle
export function drawBrainDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Left Page wobbly border
  drawSketchLine(ctx, cx - 80, cy - 50, cx - 5, cy - 53, color, 2);
  drawSketchLine(ctx, cx - 80, cy + 50, cx - 5, cy + 48, color, 2);
  drawSketchLine(ctx, cx - 80, cy - 50, cx - 80, cy + 50, color, 2);
  drawSketchLine(ctx, cx - 5, cy - 53, cx - 5, cy + 48, color, 2);
  
  // Right Page wobbly border
  drawSketchLine(ctx, cx + 5, cy - 53, cx + 80, cy - 50, color, 2);
  drawSketchLine(ctx, cx + 5, cy + 48, cx + 80, cy + 50, color, 2);
  drawSketchLine(ctx, cx + 5, cy - 53, cx + 5, cy + 48, color, 2);
  drawSketchLine(ctx, cx + 80, cy - 50, cx + 80, cy + 50, color, 2);
  
  // Spine binder coils
  for (let y = cy - 40; y <= cy + 40; y += 20) {
    drawSketchCircle(ctx, cx, y, 6, 4, color, 1.5);
  }
  
  // Content lines on left page
  for (let y = cy - 35; y <= cy + 35; y += 15) {
    drawSketchLine(ctx, cx - 70, y, cx - 15, y, color, 1.5);
  }
  
  // Content on right page: A sketchy lightbulb representing thoughts/ideas
  const rx = cx + 42;
  const ry = cy - 5;
  drawSketchCircle(ctx, rx, ry - 10, 12, 12, color, 1.5);
  drawSketchLine(ctx, rx - 6, ry + 2, rx + 6, ry + 2, color, 1.5);
  drawSketchLine(ctx, rx - 4, ry + 6, rx + 4, ry + 6, color, 1.5);
  drawSketchLine(ctx, rx, ry - 5, rx, ry - 15, color, 1);
  
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI - Math.PI / 4;
    drawSketchLine(ctx, rx + Math.cos(angle) * 15, ry - 10 + Math.sin(angle) * 15, rx + Math.cos(angle) * 22, ry - 10 + Math.sin(angle) * 22, color, 1.5);
  }

  // Draw a pencil resting diagonally across the bottom of the sketchbook
  const px1 = cx - 55;
  const py1 = cy + 40;
  const px2 = cx + 45;
  const py2 = cy + 15;
  drawSketchLine(ctx, px1, py1, px2, py2, color, 2.5);
  drawSketchCircle(ctx, px1 - 2, py1 + 1, 3, 3, color, 1.5);
  drawSketchLine(ctx, px2, py2, px2 + 8, py2 - 2, color, 2);
  drawSketchLine(ctx, px2, py2, px2 + 4, py2 - 8, color, 2);
  drawSketchLine(ctx, px2 + 8, py2 - 2, px2 + 4, py2 - 8, color, 2);
}

// 2. Bookshelf / Skills Doodle
export function drawBookshelfDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const w = canvas.width;
  const h = canvas.height;
  
  // Draw two shelves
  drawSketchLine(ctx, 20, h - 80, w - 20, h - 80, color, 4);
  drawSketchLine(ctx, 30, h - 180, w - 30, h - 180, color, 3.5);
  
  // Books on bottom shelf
  // Vertical book 1
  drawSketchLine(ctx, 50, h - 80, 50, h - 150, color, 2);
  drawSketchLine(ctx, 70, h - 80, 70, h - 150, color, 2);
  drawSketchLine(ctx, 50, h - 150, 70, h - 150, color, 2);
  ctx.font = '16px Architects Daughter';
  ctx.fillStyle = color;
  ctx.fillText('JAVA', 52, h - 100);
  
  // Leaning book 2
  drawSketchLine(ctx, 80, h - 80, 110, h - 140, color, 2);
  drawSketchLine(ctx, 95, h - 80, 125, h - 140, color, 2);
  drawSketchLine(ctx, 110, h - 140, 125, h - 140, color, 2);
  
  // Stack of 3 books on top shelf
  // Bottom book
  drawSketchLine(ctx, 100, h - 180, 180, h - 180, color, 2);
  drawSketchLine(ctx, 100, h - 195, 180, h - 195, color, 2);
  drawSketchLine(ctx, 100, h - 180, 100, h - 195, color, 2);
  drawSketchLine(ctx, 180, h - 180, 180, h - 195, color, 2);
  // Middle book
  drawSketchLine(ctx, 105, h - 195, 175, h - 195, color, 2);
  drawSketchLine(ctx, 105, h - 210, 175, h - 210, color, 2);
  drawSketchLine(ctx, 105, h - 195, 105, h - 210, color, 2);
  drawSketchLine(ctx, 175, h - 195, 175, h - 210, color, 2);
  
  // Coffee mug (Java!)
  const mx = 200;
  const my = h - 80;
  drawSketchLine(ctx, mx - 15, my, mx - 15, my - 30, color, 2);
  drawSketchLine(ctx, mx + 15, my, mx + 15, my - 30, color, 2);
  drawSketchLine(ctx, mx - 15, my, mx + 15, my, color, 2);
  // Handle
  drawSketchCircle(ctx, mx + 20, my - 15, 6, 8, color, 2);
  // Steam lines
  drawSketchLine(ctx, mx - 5, my - 35, mx - 2, my - 45, color, 1.5);
  drawSketchLine(ctx, mx + 5, my - 35, mx + 8, my - 45, color, 1.5);
  
  // A database drum representing SQL
  const dbx = w - 80;
  const dby = h - 80;
  drawSketchCircle(ctx, dbx, dby - 40, 20, 6, color, 2);
  drawSketchLine(ctx, dbx - 20, dby - 40, dbx - 20, dby, color, 2);
  drawSketchLine(ctx, dbx + 20, dby - 40, dbx + 20, dby, color, 2);
  drawSketchCircle(ctx, dbx, dby, 20, 6, color, 2);
  // Lines on drum
  drawSketchCircle(ctx, dbx, dby - 20, 20, 6, color, 1.5);
  ctx.fillText('SQL', dbx - 14, dby - 25);
  
  // A cute python snake hanging from top shelf
  const sx = w - 80;
  const sy = h - 180;
  drawSketchCircle(ctx, sx, sy - 25, 10, 10, color, 2); // Head
  // Body wave
  ctx.beginPath();
  ctx.moveTo(sx, sy - 15);
  ctx.quadraticCurveTo(sx - 15, sy, sx, sy + 20);
  ctx.quadraticCurveTo(sx + 15, sy + 40, sx, sy + 60);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillText('Python', sx - 25, sy - 40);
}

// 3. Project 1 Portal — Rocket Launch
export function drawProject1Doodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- Rocket body (hand-drawn polygon) ---
  ctx.lineWidth = 3;
  ctx.beginPath();
  // nose
  ctx.moveTo(cx, cy - 85);
  // right side going down
  ctx.bezierCurveTo(cx + 28, cy - 60, cx + 32, cy - 10, cx + 28, cy + 25);
  // right fin
  ctx.lineTo(cx + 50, cy + 55);
  ctx.lineTo(cx + 28, cy + 45);
  // bottom between fins
  ctx.lineTo(cx + 18, cy + 55);
  ctx.lineTo(cx - 18, cy + 55);
  // left fin
  ctx.lineTo(cx - 28, cy + 45);
  ctx.lineTo(cx - 50, cy + 55);
  ctx.lineTo(cx - 28, cy + 25);
  // left side going up to nose
  ctx.bezierCurveTo(cx - 32, cy - 10, cx - 28, cy - 60, cx, cy - 85);
  ctx.closePath();
  ctx.stroke();

  // --- Porthole window ---
  drawSketchCircle(ctx, cx, cy - 20, 16, 16, color, 2.5);
  drawSketchCircle(ctx, cx + 3, cy - 24, 4, 4, color, 1.2);

  // --- Exhaust flame (3 wavy tongues) ---
  ctx.lineWidth = 2;
  // center flame
  ctx.beginPath();
  ctx.moveTo(cx, cy + 55);
  ctx.bezierCurveTo(cx + 6, cy + 72, cx - 8, cy + 85, cx, cy + 100);
  ctx.stroke();
  // left flame
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 55);
  ctx.bezierCurveTo(cx - 18, cy + 68, cx - 10, cy + 78, cx - 8, cy + 90);
  ctx.stroke();
  // right flame
  ctx.beginPath();
  ctx.moveTo(cx + 12, cy + 55);
  ctx.bezierCurveTo(cx + 18, cy + 68, cx + 10, cy + 78, cx + 8, cy + 90);
  ctx.stroke();

  // --- Stars scattered around ---
  const stars = [[-60, -75], [62, -68], [-68, 10], [72, 5], [-55, -30], [58, -35]];
  stars.forEach(([dx, dy]) => {
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy + dy - 5);
    ctx.lineTo(cx + dx, cy + dy + 5);
    ctx.moveTo(cx + dx - 5, cy + dy);
    ctx.lineTo(cx + dx + 5, cy + dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + dx - 3, cy + dy - 3);
    ctx.lineTo(cx + dx + 3, cy + dy + 3);
    ctx.moveTo(cx + dx + 3, cy + dy - 3);
    ctx.lineTo(cx + dx - 3, cy + dy + 3);
    ctx.stroke();
  });

  // --- Label ---
  ctx.font = 'bold 16px Caveat';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('LAUNCH PROJECTS', cx, cy - 98);

  // --- Click hint ---
  ctx.font = 'bold 15px Caveat';
  ctx.fillText('OPEN PORTAL', cx, cy + 115);
  ctx.textAlign = 'left';
}

// 4. Project 2 Portal — Lightbulb + Circuit
export function drawProject2Doodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2 - 5;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- Lightbulb glass dome (big sketchy arc) ---
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy - 18, 52, Math.PI * 1.1, Math.PI * 1.9, false); // top dome
  ctx.stroke();
  // left side going down
  ctx.beginPath();
  ctx.moveTo(cx - 52 * Math.cos(Math.PI * 0.1), cy - 18 + 52 * Math.sin(Math.PI * 0.1));
  ctx.bezierCurveTo(cx - 38, cy + 34, cx - 28, cy + 42, cx - 22, cy + 52);
  ctx.lineTo(cx + 22, cy + 52);
  ctx.bezierCurveTo(cx + 28, cy + 42, cx + 38, cy + 34, cx + 36, cy + 14);
  ctx.stroke();

  // --- Filament (zig-zag inside) ---
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy + 20);
  ctx.lineTo(cx - 10, cy);
  ctx.lineTo(cx - 2, cy + 18);
  ctx.lineTo(cx + 6, cy - 4);
  ctx.lineTo(cx + 14, cy + 18);
  ctx.lineTo(cx + 22, cy);
  ctx.stroke();

  // --- Base / screw threads ---
  ctx.lineWidth = 2.5;
  drawSketchLine(ctx, cx - 22, cy + 52, cx + 22, cy + 52, color, 2.5);
  drawSketchLine(ctx, cx - 20, cy + 62, cx + 20, cy + 62, color, 2);
  drawSketchLine(ctx, cx - 17, cy + 72, cx + 17, cy + 72, color, 2);

  // --- Radiating glow lines ---
  const glowAngles = [-90, -60, -120, -30, -150, 0, -180];
  glowAngles.forEach(deg => {
    const rad = (deg * Math.PI) / 180;
    const r1 = 60, r2 = 78;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + r1 * Math.cos(rad), cy - 18 + r1 * Math.sin(rad));
    ctx.lineTo(cx + r2 * Math.cos(rad), cy - 18 + r2 * Math.sin(rad));
    ctx.stroke();
  });

  // --- Circuit nodes branching out from base ---
  // left branch
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy + 62);
  ctx.lineTo(cx - 55, cy + 62);
  ctx.lineTo(cx - 55, cy + 85);
  ctx.stroke();
  drawSketchCircle(ctx, cx - 55, cy + 85, 5, 5, color, 1.5);
  // right branch
  ctx.beginPath();
  ctx.moveTo(cx + 22, cy + 62);
  ctx.lineTo(cx + 55, cy + 62);
  ctx.lineTo(cx + 55, cy + 85);
  ctx.stroke();
  drawSketchCircle(ctx, cx + 55, cy + 85, 5, 5, color, 1.5);
  // center down
  ctx.beginPath();
  ctx.moveTo(cx, cy + 72);
  ctx.lineTo(cx, cy + 95);
  ctx.stroke();
  drawSketchCircle(ctx, cx, cy + 95, 5, 5, color, 1.5);

  // --- Label ---
  ctx.font = 'bold 16px Caveat';
  ctx.textAlign = 'center';
  ctx.fillText('IDEAS & CODE', cx, cy - 83);

  // --- Click hint ---
  ctx.font = 'bold 15px Caveat';
  ctx.fillText('OPEN PORTAL', cx, cy + 116);
  ctx.textAlign = 'left';
}

// 5. Android Intern / Experience Doodle
export function drawAndroidDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Draw Android Head (semicircle)
  ctx.beginPath();
  ctx.arc(cx, cy - 10, 50, Math.PI, 0, false);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Left eye
  drawSketchCircle(ctx, cx - 18, cy - 30, 4, 4, color, 2);
  // Right eye
  drawSketchCircle(ctx, cx + 18, cy - 30, 4, 4, color, 2);
  
  // Antenna left
  drawSketchLine(ctx, cx - 25, cy - 50, cx - 40, cy - 65, color, 2);
  // Antenna right
  drawSketchLine(ctx, cx + 25, cy - 50, cx + 40, cy - 65, color, 2);
  
  // Draw Android collar line
  drawSketchLine(ctx, cx - 55, cy - 5, cx + 55, cy - 5, color, 2.5);
  
  // Office desk divider behind Android
  drawSketchLine(ctx, cx - 90, cy + 10, cx + 90, cy + 10, color, 3);
  drawSketchLine(ctx, cx - 90, cy + 10, cx - 90, cy + 90, color, 2);
  drawSketchLine(ctx, cx + 90, cy + 10, cx + 90, cy + 90, color, 2);
  drawSketchLine(ctx, cx - 90, cy + 90, cx + 90, cy + 90, color, 2);
  
  // Laptop on desk divider
  drawSketchLine(ctx, cx - 50, cy + 90, cx - 40, cy + 50, color, 2);
  drawSketchLine(ctx, cx + 50, cy + 90, cx + 40, cy + 50, color, 2);
  drawSketchLine(ctx, cx - 40, cy + 50, cx + 40, cy + 50, color, 2);
  
  ctx.font = '16px Architects Daughter';
  ctx.fillStyle = color;
  ctx.fillText('MINDMATRIX', cx - 50, cy + 30);
  ctx.font = '14px Patrick Hand';
  ctx.fillText('Android Intern', cx - 35, cy + 75);
}

// 6. Certifications & Publications Doodle
export function drawCertsDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Hanging Certificate Frame 1 (Left)
  const f1x = cx - 55;
  const f1y = cy - 20;
  // Hanging strings
  drawSketchLine(ctx, f1x, f1y - 50, f1x - 30, 10, color, 1.5);
  drawSketchLine(ctx, f1x, f1y - 50, f1x + 30, 10, color, 1.5);
  // Outer frame
  drawSketchLine(ctx, f1x - 40, f1y - 30, f1x + 40, f1y - 30, color, 2.5);
  drawSketchLine(ctx, f1x - 40, f1y + 30, f1x + 40, f1y + 30, color, 2.5);
  drawSketchLine(ctx, f1x - 40, f1y - 30, f1x - 40, f1y + 30, color, 2.5);
  drawSketchLine(ctx, f1x + 40, f1y - 30, f1x + 40, f1y + 30, color, 2.5);
  // Seal badge
  drawSketchCircle(ctx, f1x, f1y + 10, 10, 10, color, 1.5);
  // Seal ribbons
  drawSketchLine(ctx, f1x - 4, f1y + 18, f1x - 8, f1y + 26, color, 1.5);
  drawSketchLine(ctx, f1x + 4, f1y + 18, f1x + 8, f1y + 26, color, 1.5);
  ctx.font = '12px Architects Daughter';
  ctx.fillStyle = color;
  ctx.fillText('Anthropic', f1x - 26, f1y - 10);
  ctx.fillText('AI 2026', f1x - 22, f1y + 2);
  
  // Hanging Certificate Frame 2 (Right)
  const f2x = cx + 55;
  const f2y = cy + 15;
  // Hanging strings
  drawSketchLine(ctx, f2x, f2y - 45, f2x - 25, 20, color, 1.5);
  drawSketchLine(ctx, f2x, f2y - 45, f2x + 25, 20, color, 1.5);
  // Frame
  drawSketchLine(ctx, f2x - 35, f2y - 25, f2x + 35, f2y - 25, color, 2.5);
  drawSketchLine(ctx, f2x - 35, f2y + 25, f2x + 35, f2y + 25, color, 2.5);
  drawSketchLine(ctx, f2x - 35, f2y - 25, f2x - 35, f2y + 25, color, 2.5);
  drawSketchLine(ctx, f2x + 35, f2y - 25, f2x + 35, f2y + 25, color, 2.5);
  // Text lines inside
  drawSketchLine(ctx, f2x - 20, f2y - 10, f2x + 20, f2y - 10, color, 1);
  drawSketchLine(ctx, f2x - 20, f2y, f2x + 10, f2y, color, 1);
  drawSketchCircle(ctx, f2x, f2y + 12, 6, 6, color, 1.5);
  ctx.font = '12px Architects Daughter';
  ctx.fillText('OCI / GH', f2x - 24, f2y - 15);
}

// 7. Mailbox / Contact Doodle
export function drawMailboxDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Mailbox stand
  drawSketchLine(ctx, cx, cy + 30, cx, cy + 90, color, 3);
  drawSketchLine(ctx, cx - 20, cy + 90, cx + 20, cy + 90, color, 3);
  
  // Mailbox body (curved cylinder back)
  drawSketchLine(ctx, cx - 40, cy + 30, cx + 40, cy + 30, color, 2.5);
  drawSketchLine(ctx, cx - 40, cy - 20, cx + 40, cy - 20, color, 2.5);
  drawSketchLine(ctx, cx - 40, cy - 20, cx - 40, cy + 30, color, 2.5);
  drawSketchLine(ctx, cx + 40, cy - 20, cx + 40, cy + 30, color, 2.5);
  // Curved top
  ctx.beginPath();
  ctx.arc(cx, cy - 20, 40, Math.PI, 0, false);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  
  // Flag (Up)
  drawSketchLine(ctx, cx + 40, cy + 10, cx + 60, cy + 10, color, 2);
  drawSketchLine(ctx, cx + 60, cy + 10, cx + 60, cy - 20, color, 2);
  // Flag red box (ink)
  drawSketchLine(ctx, cx + 60, cy - 20, cx + 72, cy - 20, color, 3);
  drawSketchLine(ctx, cx + 60, cy - 10, cx + 72, cy - 10, color, 3);
  drawSketchLine(ctx, cx + 72, cy - 20, cx + 72, cy - 10, color, 3);
  
  // Mailbox opening / letters sticking out
  drawSketchLine(ctx, cx - 30, cy + 10, cx + 30, cy + 10, color, 1.5);
  // Letter flap
  drawSketchLine(ctx, cx - 35, cy, cx - 15, cy - 15, color, 1.5);
  drawSketchLine(ctx, cx + 35, cy, cx + 15, cy - 15, color, 1.5);
  drawSketchLine(ctx, cx - 15, cy - 15, cx + 15, cy - 15, color, 1.5);
  
  // Floating paper airplane
  const ax = cx - 70;
  const ay = cy - 40;
  drawSketchLine(ctx, ax, ay, ax + 25, ay - 10, color, 2);
  drawSketchLine(ctx, ax, ay, ax + 15, ay + 15, color, 2);
  drawSketchLine(ctx, ax + 15, ay + 15, ax + 25, ay - 10, color, 2);
  // Folding line
  drawSketchLine(ctx, ax, ay, ax + 20, ay + 5, color, 1.5);
  // Trail
  drawSketchLine(ctx, ax - 10, ay + 10, ax - 5, ay + 7, color, 1);
  drawSketchLine(ctx, ax - 20, ay + 18, ax - 12, ay + 13, color, 1);
}

// 8. Custom Animated Character Mascot (Doodle-Bot) Poses
export function drawMascotPose(canvas, color, pose) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Doodle-Bot's Head (Square wobbly screen)
  drawSketchLine(ctx, cx - 25, cy - 50, cx + 25, cy - 50, color, 3);
  drawSketchLine(ctx, cx - 25, cy - 10, cx + 25, cy - 10, color, 3);
  drawSketchLine(ctx, cx - 25, cy - 50, cx - 25, cy - 10, color, 3);
  drawSketchLine(ctx, cx + 25, cy - 50, cx + 25, cy - 10, color, 3);
  
  // Screen inner border
  drawSketchLine(ctx, cx - 20, cy - 45, cx + 20, cy - 45, color, 1.5);
  drawSketchLine(ctx, cx - 20, cy - 15, cx + 20, cy - 15, color, 1.5);
  drawSketchLine(ctx, cx - 20, cy - 45, cx - 20, cy - 15, color, 1.5);
  drawSketchLine(ctx, cx + 20, cy - 45, cx + 20, cy - 15, color, 1.5);
  
  // Screen eyes & mouth (digital emotion in pencil!)
  if (pose === 'idle') {
    // Happy arc eyes
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 32, 4, Math.PI, 0, false);
    ctx.arc(cx + 10, cy - 32, 4, Math.PI, 0, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Happy smile
    ctx.beginPath();
    ctx.arc(cx, cy - 25, 6, 0, Math.PI, false);
    ctx.stroke();
  } else if (pose === 'walk') {
    // Solid circular walking focus eyes
    drawSketchCircle(ctx, cx - 10, cy - 30, 3, 3, color, 2.5);
    drawSketchCircle(ctx, cx + 10, cy - 30, 3, 3, color, 2.5);
    // Straight mouth
    drawSketchLine(ctx, cx - 6, cy - 23, cx + 6, cy - 23, color, 2);
  } else if (pose === 'point') {
    // Winking eyes
    drawSketchLine(ctx, cx - 13, cy - 30, cx - 7, cy - 30, color, 3); // wink left
    drawSketchCircle(ctx, cx + 10, cy - 30, 3, 3, color, 2.5); // circular right
    // Open happy mouth
    drawSketchCircle(ctx, cx, cy - 23, 4, 3, color, 2);
  }
  
  // Neck
  drawSketchLine(ctx, cx - 5, cy - 10, cx - 5, cy, color, 3);
  drawSketchLine(ctx, cx + 5, cy - 10, cx + 5, cy, color, 3);
  
  // Antenna
  drawSketchLine(ctx, cx, cy - 50, cx, cy - 65, color, 2);
  drawSketchCircle(ctx, cx, cy - 68, 4, 4, color, 2);
  
  // Body (Gear-like round pod)
  drawSketchCircle(ctx, cx, cy + 20, 24, 20, color, 3);
  // Center pocket
  drawSketchCircle(ctx, cx, cy + 20, 10, 8, color, 1.5);
  
  // Wheel (instead of legs, it rolls like a unicycle doodle!)
  if (pose === 'walk') {
    // Wheel rotated / motion blur lines
    const angle = (Date.now() / 100) % (Math.PI * 2);
    drawSketchCircle(ctx, cx, cy + 50, 10, 10, color, 3);
    drawSketchLine(ctx, cx, cy + 40, cx, cy + 60, color, 2); // spokes
    drawSketchLine(ctx, cx - 10, cy + 50, cx + 10, cy + 50, color, 2);
    // Dust motion trails
    drawSketchLine(ctx, cx - 22, cy + 55, cx - 14, cy + 52, color, 1);
    drawSketchLine(ctx, cx - 26, cy + 48, cx - 16, cy + 48, color, 1);
  } else {
    // Static wheel
    drawSketchCircle(ctx, cx, cy + 50, 10, 10, color, 3);
    drawSketchLine(ctx, cx, cy + 40, cx, cy + 60, color, 2);
    drawSketchLine(ctx, cx - 10, cy + 50, cx + 10, cy + 50, color, 2);
  }
  
  // Arms
  if (pose === 'idle') {
    // Left arm hanging down
    drawSketchLine(ctx, cx - 24, cy + 10, cx - 35, cy + 25, color, 2.5);
    drawSketchCircle(ctx, cx - 38, cy + 28, 3, 3, color, 2);
    // Right arm waving
    drawSketchLine(ctx, cx + 24, cy + 10, cx + 38, cy - 5, color, 2.5);
    drawSketchLine(ctx, cx + 38, cy - 5, cx + 45, cy - 15, color, 2.5);
    drawSketchCircle(ctx, cx + 48, cy - 18, 3, 3, color, 2);
  } else if (pose === 'walk') {
    // Arms pumping
    // Left arm pumping forward
    drawSketchLine(ctx, cx - 24, cy + 10, cx - 35, cy + 2, color, 2.5);
    drawSketchLine(ctx, cx - 35, cy + 2, cx - 42, cy - 5, color, 2.5);
    drawSketchCircle(ctx, cx - 44, cy - 8, 3, 3, color, 2);
    // Right arm pumping backward
    drawSketchLine(ctx, cx + 24, cy + 10, cx + 35, cy + 22, color, 2.5);
    drawSketchCircle(ctx, cx + 37, cy + 24, 3, 3, color, 2);
  } else if (pose === 'point') {
    // Left arm on hip
    drawSketchLine(ctx, cx - 24, cy + 10, cx - 32, cy + 18, color, 2.5);
    drawSketchLine(ctx, cx - 32, cy + 18, cx - 24, cy + 26, color, 2.5);
    // Right arm pointing straight to the right!
    drawSketchLine(ctx, cx + 24, cy + 10, cx + 46, cy + 10, color, 2.5);
    // Hand pointing finger
    drawSketchLine(ctx, cx + 46, cy + 10, cx + 54, cy + 10, color, 2.5); // pointer finger
    drawSketchCircle(ctx, cx + 46, cy + 13, 3, 2, color, 2); // closed hand
  }
}

// 9. Individual Skill Icons
export function drawJavaDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Draw coffee cup
  drawSketchLine(ctx, cx - 25, cy + 15, cx - 25, cy - 20, color, 3);
  drawSketchLine(ctx, cx + 25, cy + 15, cx + 25, cy - 20, color, 3);
  drawSketchLine(ctx, cx - 25, cy + 15, cx + 25, cy + 15, color, 3);
  
  // Handle
  drawSketchCircle(ctx, cx + 32, cy - 2, 8, 10, color, 2.5);
  
  // Steam lines
  drawSketchLine(ctx, cx - 10, cy - 28, cx - 7, cy - 44, color, 2);
  drawSketchLine(ctx, cx, cy - 28, cx + 3, cy - 44, color, 2);
  drawSketchLine(ctx, cx + 10, cy - 28, cx + 13, cy - 44, color, 2);
  
  // Text
  ctx.font = 'bold 24px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('Java', cx, cy + 45);
}

export function drawPythonDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Upper body wave
  drawSketchCircle(ctx, cx - 12, cy - 15, 20, 12, color, 2.5);
  drawSketchLine(ctx, cx - 24, cy - 10, cx + 5, cy - 10, color, 2.5);
  // Lower body wave
  drawSketchCircle(ctx, cx + 12, cy + 12, 20, 12, color, 2.5);
  drawSketchLine(ctx, cx - 5, cy + 8, cx + 24, cy + 8, color, 2.5);
  
  // Eye dots
  drawSketchCircle(ctx, cx - 18, cy - 17, 2, 2, color, 2.5);
  drawSketchCircle(ctx, cx + 18, cy + 9, 2, 2, color, 2.5);
  
  ctx.font = 'bold 24px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('Python', cx, cy + 45);
}

export function drawJSDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Wobbly JS Box
  drawSketchLine(ctx, cx - 35, cy - 35, cx + 35, cy - 35, color, 3);
  drawSketchLine(ctx, cx - 35, cy + 35, cx + 35, cy + 35, color, 3);
  drawSketchLine(ctx, cx - 35, cy - 35, cx - 35, cy + 35, color, 3);
  drawSketchLine(ctx, cx + 35, cy - 35, cx + 35, cy + 35, color, 3);
  
  ctx.font = 'bold 36px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('JS', cx + 10, cy + 20);
}

export function drawSQLDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Cylinder drum
  drawSketchCircle(ctx, cx, cy - 20, 26, 7, color, 2.5);
  drawSketchLine(ctx, cx - 26, cy - 20, cx - 26, cy + 15, color, 2.5);
  drawSketchLine(ctx, cx + 26, cy - 20, cx + 26, cy + 15, color, 2.5);
  drawSketchCircle(ctx, cx, cy + 15, 26, 7, color, 2.5);
  // Divider
  drawSketchCircle(ctx, cx, cy - 2, 26, 7, color, 1.8);
  
  ctx.font = 'bold 24px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('SQL', cx, cy + 45);
}

export function drawAWSDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Cloud humps
  drawSketchCircle(ctx, cx - 18, cy, 20, 18, color, 2.5);
  drawSketchCircle(ctx, cx + 18, cy, 20, 18, color, 2.5);
  drawSketchCircle(ctx, cx, cy - 18, 22, 22, color, 2.5);
  drawSketchLine(ctx, cx - 35, cy + 10, cx + 35, cy + 10, color, 3);
  
  ctx.font = 'bold 22px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('AWS', cx, cy + 40);
}

export function drawDockerDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Shipping container
  drawSketchLine(ctx, cx - 40, cy - 20, cx + 40, cy - 20, color, 3);
  drawSketchLine(ctx, cx - 40, cy + 20, cx + 40, cy + 20, color, 3);
  drawSketchLine(ctx, cx - 40, cy - 20, cx - 40, cy + 20, color, 3);
  drawSketchLine(ctx, cx + 40, cy - 20, cx + 40, cy + 20, color, 3);
  
  // Container lines
  drawSketchLine(ctx, cx - 20, cy - 20, cx - 20, cy + 20, color, 1.8);
  drawSketchLine(ctx, cx, cy - 20, cx, cy + 20, color, 1.8);
  drawSketchLine(ctx, cx + 20, cy - 20, cx + 20, cy + 20, color, 1.8);
  
  ctx.font = 'bold 22px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('Docker', cx, cy + 45);
}

export function drawJestDoodle(canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  // Clipboard
  drawSketchLine(ctx, cx - 25, cy - 30, cx + 25, cy - 30, color, 2.5);
  drawSketchLine(ctx, cx - 25, cy + 20, cx + 25, cy + 20, color, 2.5);
  drawSketchLine(ctx, cx - 25, cy - 30, cx - 25, cy + 20, color, 2.5);
  drawSketchLine(ctx, cx + 25, cy - 30, cx + 25, cy + 20, color, 2.5);
  
  // Tick mark
  drawSketchLine(ctx, cx - 14, cy - 2, cx - 4, cy + 8, color, 4.5);
  drawSketchLine(ctx, cx - 4, cy + 8, cx + 14, cy - 14, color, 4.5);
  
  ctx.font = 'bold 22px Architects Daughter';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('Jest', cx, cy + 45);
}

