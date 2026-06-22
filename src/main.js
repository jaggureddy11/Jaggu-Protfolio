import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  drawBrainDoodle,
  drawProject1Doodle,
  drawProject2Doodle,
  drawAndroidDoodle,
  drawCertsDoodle,
  drawMailboxDoodle
} from './doodles.js';

import mascotImgUrl from './assets/mascot.png';
import mascotPointImgUrl from './assets/mascot_point.png';
import mascotWalkSheetUrl from './assets/gemini_walk_sheet.png';

// --- State Management ---
let isChalkboard = false;
let soundEnabled = false;
let audioCtx = null;
let scrollGainNode = null;
let activeSectionIndex = 0;
const floatingSkills = [];

const sectionZPositions = [0, -15, -30, -45, -60, -75, -90];
const sections = ['cover', 'bio', 'skills', 'projects', 'intern', 'certs', 'connect'];

// Ink Colors based on Theme
const getInkColor = () => isChalkboard ? '#eaeaea' : '#1a1a1a';
const getAccentColor = () => isChalkboard ? '#f4d068' : '#2b5c8f';

// --- Web Audio API Synthesizer ---
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create continuous white noise for pencil scratch
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  
  // Bandpass filter to model pencil scratch frequency response
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 4.0;
  
  scrollGainNode = audioCtx.createGain();
  scrollGainNode.gain.value = 0;
  
  noise.connect(filter);
  filter.connect(scrollGainNode);
  scrollGainNode.connect(audioCtx.destination);
  
  noise.start();
}

function playClickSound() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.08);
  
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

function playScribbleSound() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  
  osc.frequency.setValueAtTime(700, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.06);
  osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.12);
  osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.18);
  
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.06);
  gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.22);
}

// --- Three.js Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Start outside

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // Transparent to show CSS paper background grid
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5, 30);
pointLight.position.set(0, 2, -10);
scene.add(pointLight);

// --- Corridor Procedural Line Generator ---
let corridorLines = [];

function drawWobblyCorridor() {
  // Clear existing lines
  corridorLines.forEach(line => scene.remove(line));
  corridorLines = [];

  const inkColor = isChalkboard ? 0xdddddd : 0x222222;
  const lineMaterial = new THREE.LineBasicMaterial({ color: inkColor, linewidth: 2 });
  
  // Corridor bounds
  const w = 5;  // half-width
  const h = 3.5; // half-height
  const length = -105;
  const segmentLength = 15;
  
  // Helper to create wobbly line vertices in 3D
  const createSketchySegment = (start, end) => {
    const points = [];
    const dist = start.distanceTo(end);
    const steps = Math.max(2, Math.floor(dist / 2));
    points.push(start);
    
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const pt = new THREE.Vector3().lerpVectors(start, end, t);
      // Add slight jitter perpendicular to the line
      pt.x += (Math.random() - 0.5) * 0.08;
      pt.y += (Math.random() - 0.5) * 0.08;
      pt.z += (Math.random() - 0.5) * 0.05;
      points.push(pt);
    }
    points.push(end);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, lineMaterial);
  };

  // 1. Draw Longitudinal Lines (corridor frame structure)
  // Bottom Left
  scene.add(createSketchySegment(new THREE.Vector3(-w, -h, 5), new THREE.Vector3(-w, -h, length)));
  // Bottom Right
  scene.add(createSketchySegment(new THREE.Vector3(w, -h, 5), new THREE.Vector3(w, -h, length)));
  // Top Left
  scene.add(createSketchySegment(new THREE.Vector3(-w, h, 5), new THREE.Vector3(-w, h, length)));
  // Top Right
  scene.add(createSketchySegment(new THREE.Vector3(w, h, 5), new THREE.Vector3(w, h, length)));

  // 2. Draw Transverse Arch Frames (rings going deep)
  for (let z = 5; z >= length; z -= segmentLength) {
    // Floor
    scene.add(createSketchySegment(new THREE.Vector3(-w, -h, z), new THREE.Vector3(w, -h, z)));
    // Ceiling
    scene.add(createSketchySegment(new THREE.Vector3(-w, h, z), new THREE.Vector3(w, h, z)));
    // Left Wall
    scene.add(createSketchySegment(new THREE.Vector3(-w, -h, z), new THREE.Vector3(-w, h, z)));
    // Right Wall
    scene.add(createSketchySegment(new THREE.Vector3(w, -h, z), new THREE.Vector3(w, h, z)));
    
    // Draw some sketchy hatching on the floor to simulate planks/hatching
    if (z > length) {
      for (let offset = 2; offset < segmentLength; offset += 4) {
        scene.add(createSketchySegment(
          new THREE.Vector3(-w, -h, z - offset), 
          new THREE.Vector3(-w + 1.5, -h, z - offset - 1.5)
        ));
        scene.add(createSketchySegment(
          new THREE.Vector3(w, -h, z - offset), 
          new THREE.Vector3(w - 1.5, -h, z - offset - 1.5)
        ));
      }
    }
  }

  // Collect references for cleanup
  scene.traverse(child => {
    if (child instanceof THREE.Line) {
      corridorLines.push(child);
    }
  });
}

// --- Dynamic Doodle Object Factory ---
const interactiveObjects = [];

function createDoodleMesh(drawFunc, width, height, position, id) {
  // Create HTML Canvas for Texture
  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 512;
  canvasTexture.height = 512;
  
  // Initial draw
  drawFunc(canvasTexture, getInkColor());
  
  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.minFilter = THREE.LinearFilter;
  
  // Sketchy material (double-sided transparent card)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.userData = { id, drawFunc, canvasTexture, texture };
  
  scene.add(mesh);
  interactiveObjects.push(mesh);
  return mesh;
}

// --- Dynamic Real Icon Badge Factory ---
function createRealIconDoodleMesh(iconUrl, size, position, id) {
  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 512;
  canvasTexture.height = 512;
  const ctx = canvasTexture.getContext('2d');
  
  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.minFilter = THREE.LinearFilter;
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const geometry = new THREE.PlaneGeometry(size, size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  
  let loadedImg = null;
  
  const drawBadge = (canvas, color) => {
    const inkColor = color || getInkColor();
    ctx.clearRect(0, 0, 512, 512);
    
    const renderImg = (img) => {
      const logoSize = 340;
      ctx.save();
      if (isChalkboard) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 25;
      }
      ctx.drawImage(img, 256 - logoSize / 2, 256 - logoSize / 2, logoSize, logoSize);
      ctx.restore();
      texture.needsUpdate = true;
    };
    
    if (loadedImg) {
      renderImg(loadedImg);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = iconUrl;
      img.onload = () => {
        loadedImg = img;
        renderImg(img);
      };
    }
  };
  
  drawBadge();
  
  mesh.userData = { id, drawFunc: drawBadge, canvasTexture, texture };
  scene.add(mesh);
  interactiveObjects.push(mesh);
  return mesh;
}

// --- Setup Portfolio Doodles in 3D Hallway ---
function initDoodles() {
  // Remove existing
  interactiveObjects.forEach(obj => {
    scene.remove(obj);
    obj.geometry.dispose();
    obj.material.map.dispose();
    obj.material.dispose();
  });
  interactiveObjects.length = 0;
  floatingSkills.length = 0;

  // About Me Doodle (Z = -15, Left Wall)
  createDoodleMesh(drawBrainDoodle, 3.2, 3.2, new THREE.Vector3(-3.2, 0.2, -15), 'doodle-bio');

  // Individual Floating Skill Icon Mesh Cards (spread out slightly for parallax depth)
  const skillConfigs = [
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg', id: 'doodle-skill-languages' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg', id: 'doodle-skill-languages' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg', id: 'doodle-skill-frontend' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg', id: 'doodle-skill-databases' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', id: 'doodle-skill-cloud' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg', id: 'doodle-skill-cloud' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/jest/jest-plain.svg', id: 'doodle-skill-testing' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/pytorch/pytorch-original.svg', id: 'doodle-skill-ai' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg', id: 'doodle-skill-frontend' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg', id: 'doodle-skill-backend' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg', id: 'doodle-skill-languages' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg', id: 'doodle-skill-databases' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg', id: 'doodle-skill-tools' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg', id: 'doodle-skill-databases' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg', id: 'doodle-skill-backend' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg', id: 'doodle-skill-frontend' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg', id: 'doodle-skill-frontend' },
    { iconUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/linux/linux-original.svg', id: 'doodle-skill-tools' }
  ];

  skillConfigs.forEach((cfg, idx) => {
    // Create icons with smaller uniform size to look clean
    const iconSize = 0.7;
    const mesh = createRealIconDoodleMesh(cfg.iconUrl, iconSize, new THREE.Vector3(0, 0, -30), cfg.id);
    
    // Distribute them evenly around a circle
    const angleOffset = (idx / skillConfigs.length) * Math.PI * 2;
    
    mesh.userData.floating = {
      centerX: -2.2, // Move firmly to the left side to balance right-aligned text
      centerY: 0.0,  // Centered vertically
      centerZ: -30.0,
      radiusX: 2.2,  // Perfect circle width
      radiusY: 2.2,  // Perfect circle height
      radiusZ: 0.5,  // Slight 3D depth to the wheel
      angleOffset: angleOffset,
      speed: 0.0006, // Smooth rotation speed
      phaseX: idx * 0.8 // For subtle rotation of the icon itself
    };
    floatingSkills.push(mesh);
  });

  // Projects portals (Z = -45)
  // Project 1 Portal (Left side)
  createDoodleMesh(drawProject1Doodle, 3.2, 3.2, new THREE.Vector3(-2.8, 0, -45), 'doodle-proj1');
  // Project 2 Portal (Right side)
  createDoodleMesh(drawProject2Doodle, 3.2, 3.2, new THREE.Vector3(2.8, 0, -45), 'doodle-proj2');

  // Internship / Experience Doodle (Z = -60, Left Wall)
  createDoodleMesh(drawAndroidDoodle, 3.4, 3.4, new THREE.Vector3(-3.0, 0, -60), 'doodle-intern');

  // Certifications / Publication Frame (Z = -75, Right Wall)
  createDoodleMesh(drawCertsDoodle, 3.5, 3.5, new THREE.Vector3(3.0, 0.4, -75), 'doodle-certs');

  // Mailbox / Contact Doodle (Z = -90, Center Wall)
  createDoodleMesh(drawMailboxDoodle, 3.4, 3.4, new THREE.Vector3(0, 0, -90), 'doodle-connect');
}

// Redraw all doodles when switching theme
function redrawAllDoodles() {
  interactiveObjects.forEach(mesh => {
    const { drawFunc, canvasTexture, texture } = mesh.userData;
    drawFunc(canvasTexture, getInkColor());
    texture.needsUpdate = true;
  });
}

// --- Guide Mascot (Doodle-Bot) ---
let mascotSprite;
let mascotCanvas;
let mascotTexture;
let mascotPointTexture;
let mascotWalkTexture;
let mascotPoseState = 'idle'; // idle, walk, point
let mascotFacingDir = 1; // 1 = right, -1 = left
let walkCycleTime = 0;

function initMascot() {
  const textureLoader = new THREE.TextureLoader();
  mascotTexture = textureLoader.load(mascotImgUrl);
  mascotPointTexture = textureLoader.load(mascotPointImgUrl);
  
  mascotWalkTexture = textureLoader.load(mascotWalkSheetUrl);
  // Spritesheet configuration: 8 horizontal frames (672x720 each)
  mascotWalkTexture.wrapS = THREE.RepeatWrapping;
  mascotWalkTexture.wrapT = THREE.ClampToEdgeWrapping;
  mascotWalkTexture.repeat.set(0.125, 1.0);
  mascotWalkTexture.offset.set(0.0, 0.0);
  
  // Clean pixel rendering
  mascotTexture.minFilter = THREE.LinearFilter;
  mascotPointTexture.minFilter = THREE.LinearFilter;
  mascotWalkTexture.minFilter = THREE.LinearFilter;
  
  const material = new THREE.MeshBasicMaterial({
    map: mascotTexture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  // Image is 682x1024, so aspect ratio is ~0.666. If width is 1.4, height should be ~2.1.
  // Note: the frames in the new walk spritesheet have aspect ratio 238/720 = 0.33.
  // To match the default standing mesh proportions (width 1.4, height 2.1), we keep scale.y = 1.0.
  const geometry = new THREE.PlaneGeometry(1.4, 2.1);
  mascotSprite = new THREE.Mesh(geometry, material);
  
  // Position completely locked to camera viewport later
  mascotSprite.position.set(-1.2, -0.4, 0);
  scene.add(mascotSprite);
}

function updateMascotPose(pose, direction = 1) {
  const directionChanged = mascotFacingDir !== direction;
  const poseChanged = mascotPoseState !== pose;
  
  if (poseChanged || directionChanged) {
    mascotPoseState = pose;
    mascotFacingDir = direction;
    
    // Switch texture depending on pose and adjust mesh scales to prevent distortion
    if (pose === 'point') {
      mascotSprite.material.map = mascotPointTexture;
      mascotSprite.scale.set(1.0 * direction, 1.0, 1.0);
    } else if (pose === 'walk') {
      mascotSprite.material.map = mascotWalkTexture;
      // Scale walk frames (238x720) to match the visual screen size of the standing boy.
      // We use a positive X scale (0.44) to ensure the 'Jaggu' text on the bag reads correctly.
      mascotSprite.scale.set(0.44 * direction, 0.89, 1.0);
    } else {
      mascotSprite.material.map = mascotTexture;
      mascotSprite.scale.set(1.0 * direction, 1.0, 1.0);
    }
    
    mascotSprite.material.needsUpdate = true;
  }
}

// --- Mascot Movement & Scrolling Control ---

// --- Camera & Scrolling Control ---
let scrollPercent = 0;
let targetCameraZ = 5;
let currentCameraZ = 5;

// Scroll Listener
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
  
  // Map scroll percent (0 to 1) to camera Z (5 to -105)
  targetCameraZ = 5 - scrollPercent * 110;
  
  // Audio trigger
  if (soundEnabled) {
    initAudio();
    // Dynamic scratch sound volume based on scroll velocity
    const speed = Math.min(1.0, Math.abs(targetCameraZ - currentCameraZ) * 8);
    gsap.to(scrollGainNode.gain, { value: speed * 0.15, duration: 0.1 });
  }
});

// Reset scratch sound volume when scrolling stops
let scrollStopTimer;
window.addEventListener('scroll', () => {
  clearTimeout(scrollStopTimer);
  scrollStopTimer = setTimeout(() => {
    if (scrollGainNode) {
      gsap.to(scrollGainNode.gain, { value: 0, duration: 0.3 });
    }
  }, 150);
});

// Handle Navigation Ribbon Clicks
document.querySelectorAll('.nav-ribbon ul li').forEach(item => {
  item.addEventListener('click', (e) => {
    const zTarget = parseFloat(item.getAttribute('data-target'));
    const targetCamZ = -zTarget;
    const scrollTargetPercent = (5 - targetCamZ) / 110;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    playClickSound();
    
    window.scrollTo({
      top: scrollTargetPercent * docHeight,
      behavior: 'smooth'
    });
  });
});

// Update the wiggling seed of SVG filter dynamically for wobbly doodle wiggles!
const turbulenceNode = document.getElementById('turbulence-node');
let seed = 0;
setInterval(() => {
  seed = (seed + 1) % 100;
  if (turbulenceNode) {
    turbulenceNode.setAttribute('seed', seed.toString());
  }
}, 180);

// Update active 2D Overlay panels based on camera Z depth
function updateUIOverlays(z) {
  let activeIndex = 0;
  
  if (z > -8) {
    activeIndex = 0; // Cover
  } else if (z <= -8 && z > -23) {
    activeIndex = 1; // Bio
  } else if (z <= -23 && z > -38) {
    activeIndex = 2; // Skills
  } else if (z <= -38 && z > -53) {
    activeIndex = 3; // Projects
  } else if (z <= -53 && z > -68) {
    activeIndex = 4; // Intern
  } else if (z <= -68 && z > -83) {
    activeIndex = 5; // Certs
  } else {
    activeIndex = 6; // Connect
  }
  
  if (activeIndex !== activeSectionIndex) {
    // Play page flip sound
    playScribbleSound();
    
    // Deactivate current panel
    const currentPanel = document.getElementById(`sec-${sections[activeSectionIndex]}`);
    if (currentPanel) currentPanel.classList.remove('visible');
    
    // Activate new panel
    const newPanel = document.getElementById(`sec-${sections[activeIndex]}`);
    if (newPanel) newPanel.classList.add('visible');
    
    // Update navigation items
    const navItems = document.querySelectorAll('.nav-ribbon ul li');
    navItems.forEach((nav, idx) => {
      if (idx === activeIndex) nav.classList.add('active');
      else nav.classList.remove('active');
    });
    
    activeSectionIndex = activeIndex;
  }
}

// --- Raycaster & Clicking 3D Objects ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // Disable clicking on 3D elements if modals are open
  if (document.querySelector('.modal-overlay.visible')) return;

  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects);
  
  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    const clickedId = clickedMesh.userData.id;
    
    playClickSound();
    
    if (clickedId === 'doodle-proj1') {
      openProjectModal(1);
    } else if (clickedId === 'doodle-proj2') {
      openProjectModal(2);
    } else if (clickedId.startsWith('doodle-skill-')) {
      const skillName = clickedId.replace('doodle-skill-', '');
      highlightSkillByName(skillName);
    } else if (clickedId === 'doodle-bio') {
      // Wiggle mascot speech bubble
      triggerMascotSpeak("Yep, that's Jaggu's brain! Keep scrolling to check out his skills!");
    } else if (clickedId === 'doodle-intern') {
      triggerMascotSpeak("Mindmatrix Intern area! He wrote Java backends and GenAI workflows here!");
    } else if (clickedId === 'doodle-certs') {
      triggerMascotSpeak("Jaggu is Anthropic AI Fluency, OCI, and GitHub certified!");
    } else if (clickedId === 'doodle-connect') {
      triggerMascotSpeak("Shoot him an email at jaggureddy2004@gmail.com! Say hello!");
    }
  }
});

// Click listener to toggle skills details
document.querySelectorAll('.project-summary-item').forEach(item => {
  item.addEventListener('click', () => {
    const projId = parseInt(item.getAttribute('data-proj'));
    playClickSound();
    openProjectModal(projId);
  });
});

let currentSkillIndex = 0;
const skillsIds = ['languages', 'backend', 'ai', 'databases', 'cloud', 'testing'];

function highlightNextSkill() {
  // Hide all details
  document.getElementById('skills-default-text').classList.remove('active');
  skillsIds.forEach(id => {
    document.getElementById(`skill-desc-${id}`).classList.remove('active');
  });
  
  // Show active one
  const targetId = skillsIds[currentSkillIndex];
  document.getElementById(`skill-desc-${targetId}`).classList.add('active');
  
  // Update mascot pointing direction
  updateMascotPose('point', 1); // point right (skills are on right side)
  triggerMascotSpeak(`Here are his skills on ${targetId.toUpperCase()}!`);
  
  currentSkillIndex = (currentSkillIndex + 1) % skillsIds.length;
}

function highlightSkillByName(targetId) {
  // Hide all details
  document.getElementById('skills-default-text').classList.remove('active');
  skillsIds.forEach(id => {
    document.getElementById(`skill-desc-${id}`).classList.remove('active');
  });
  
  // Show active one
  const targetEl = document.getElementById(`skill-desc-${targetId}`);
  if (targetEl) {
    targetEl.classList.add('active');
  }
  
  // Update mascot pointing direction
  updateMascotPose('point', 1); // point right (skills are on right side)
  triggerMascotSpeak(`Here are my skills on ${targetId.toUpperCase()}!`);
}

// Modal handling
function openProjectModal(id) {
  const modalOverlay = document.getElementById('project-modals');
  const modal1 = document.getElementById('modal-proj-1');
  const modal2 = document.getElementById('modal-proj-2');
  
  modalOverlay.classList.add('visible');
  if (id === 1) {
    modal1.style.display = 'block';
    modal2.style.display = 'none';
  } else {
    modal1.style.display = 'none';
    modal2.style.display = 'block';
  }
}

document.querySelectorAll('.close-modal-btn, .modal-overlay').forEach(element => {
  element.addEventListener('click', (e) => {
    // Only close if clicked close button or overlay backdrop itself
    if (e.target.classList.contains('close-modal-btn') || e.target.classList.contains('modal-overlay')) {
      playClickSound();
      document.getElementById('project-modals').classList.remove('visible');
    }
  });
});

// Mascot Dialog Speech bubble helper
let speechBubbleTimer;
function triggerMascotSpeak(text) {
  let bubble = document.querySelector('.mascot-speech-bubble');
  if (!bubble) return;
  bubble.textContent = text;
  
  // Pop animation
  bubble.parentElement.classList.remove('drawIn');
  void bubble.offsetWidth; // trigger reflow
  bubble.parentElement.classList.add('drawIn');
  
  // Revert back to idle guide dialog after 4 seconds
  clearTimeout(speechBubbleTimer);
  speechBubbleTimer = setTimeout(() => {
    bubble.textContent = "I'm Doodle-Bot, your guide! Keep scrolling to explore!";
  }, 4000);
}

// --- Theme Toggle Control ---
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  isChalkboard = !isChalkboard;
  
  initAudio();
  playClickSound();
  
  // Toggle class on HTML and body
  if (isChalkboard) {
    document.documentElement.classList.add('chalkboard-mode');
    document.body.classList.add('chalkboard-mode');
    themeToggle.querySelector('.lamp-bulb').textContent = '🌙';
    themeToggle.querySelector('.toggle-text').textContent = 'Brighten Mind';
    document.getElementById('theme-toggle').style.transform = 'translateY(10px)';
    setTimeout(() => {
      document.getElementById('theme-toggle').style.transform = 'translateY(0)';
    }, 200);
  } else {
    document.documentElement.classList.remove('chalkboard-mode');
    document.body.classList.remove('chalkboard-mode');
    themeToggle.querySelector('.lamp-bulb').textContent = '💡';
    themeToggle.querySelector('.toggle-text').textContent = 'Darken Mind';
    document.getElementById('theme-toggle').style.transform = 'translateY(10px)';
    setTimeout(() => {
      document.getElementById('theme-toggle').style.transform = 'translateY(0)';
    }, 200);
  }
  
  // Re-draw WebGL lines and textures
  drawWobblyCorridor();
  redrawAllDoodles();
  // Redraw mascot (no-op since it's a static image now)
  // mascotTexture.needsUpdate = true;
});

// --- Sound Toggle Control ---
const soundToggle = document.getElementById('sound-toggle');
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  
  if (soundEnabled) {
    initAudio();
    soundToggle.querySelector('.sound-icon').textContent = '🔊';
    soundToggle.querySelector('.sound-text').textContent = 'Scribbles On';
    playClickSound();
  } else {
    soundToggle.querySelector('.sound-icon').textContent = '🔈';
    soundToggle.querySelector('.sound-text').textContent = 'Scribbles Off';
  }
});

// --- Window Resize Handling ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- Animation Loop ---
let lastTime = 0;

function animate(time) {
  requestAnimationFrame(animate);
  
  // 1. Smoothly interpolate camera Z
  const deltaZ = targetCameraZ - currentCameraZ;
  currentCameraZ += deltaZ * 0.07; // Lerp factor
  camera.position.z = currentCameraZ;
  
  // 2. Head Bobbing effect proportional to scroll speed (smoothed & capped to prevent excessive shaking)
  const scrollSpeed = Math.abs(deltaZ);
  const actualVelocity = scrollSpeed * 0.07; // Actual camera movement speed in this frame
  const bobFactor = Math.min(0.2, actualVelocity * 0.4); // Limit the maximum bobbing amplitude
  
  if (bobFactor > 0.001) {
    camera.position.y = Math.sin(time * 0.010) * bobFactor * 0.05;
    camera.position.x = Math.cos(time * 0.005) * bobFactor * 0.03;
  } else {
    // Return gently to center
    camera.position.y += (0 - camera.position.y) * 0.1;
    camera.position.x += (0 - camera.position.x) * 0.1;
  }
  
  // 3. Update Mascot floating and animation poses
  if (mascotSprite) {
    // Keep mascot completely locked to the camera viewport (HUD-style) to prevent shaking or bobbing
    mascotSprite.position.x = camera.position.x - 1.2;
    mascotSprite.position.y = camera.position.y - 0.55;
    mascotSprite.position.z = camera.position.z - 4.5;
    
    // Choose mascot pose based on movement
    if (scrollSpeed > 0.08) {
      updateMascotPose('walk', deltaZ < 0 ? 1 : -1);
      
      // Update spritesheet offset based on absolute camera Z coordinate.
      // Every 0.3 units of movement progresses to the next walk frame.
      const walkFrame = Math.floor(Math.abs(currentCameraZ) * 3.3) % 8;
      mascotWalkTexture.offset.x = walkFrame * 0.125;
    } else {
      // Return scale.y to 1.0 (default standing height)
      mascotSprite.scale.y = 1.0;
      
      // Pointing based on Z location (all UI panels are on the right)
      if (activeSectionIndex >= 1 && activeSectionIndex <= 6) {
        updateMascotPose('point', 1); // point right
      } else {
        updateMascotPose('idle', 1); // face forward for cover
      }
    }
  }
  
  // 4. Update active UI sections based on camera Z depth
  updateUIOverlays(currentCameraZ);
  
  // 5. Update floating skill icons dynamically (circular rotation)
  floatingSkills.forEach(mesh => {
    const float = mesh.userData.floating;
    if (float) {
      const currentAngle = float.angleOffset + time * float.speed;
      mesh.position.x = float.centerX + Math.cos(currentAngle) * float.radiusX;
      mesh.position.y = float.centerY + Math.sin(currentAngle) * float.radiusY;
      mesh.position.z = float.centerZ + Math.cos(currentAngle * 2) * float.radiusZ; // 3D depth wave
      
      // Keep subtle rotation on the z-axis for a floating effect
      mesh.rotation.z = Math.sin(time * 0.0015 + float.phaseX) * 0.08;
    }
  });
  
  renderer.render(scene, camera);
}

// --- Initialization ---
drawWobblyCorridor();
initMascot();
initDoodles();

// Start loop
requestAnimationFrame(animate);
