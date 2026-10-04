import * as THREE from "three";

const canvas = document.querySelector("#gameCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4ae62);
scene.fog = new THREE.Fog(0xf4ae62, 32, 118);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 7.1, 13.8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
scene.add(new THREE.HemisphereLight(0xfff0cb, 0x40554a, 2.1));
const sun = new THREE.DirectionalLight(0xffe3ae, 3.2);
sun.position.set(-7, 12, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);

const mat = (color, roughness = 0.76, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const materials = {
  road: mat(0x343c37), lane: mat(0xe8d6a5), curb: mat(0xe8c77d), sidewalk: mat(0xb88e62),
  lime: mat(0xd1f064, 0.4), coral: mat(0xf26d4b, 0.53), cream: mat(0xffe8bd, 0.52),
  dark: mat(0x283630), denim: mat(0x437768), shoe: mat(0xe9ecdc), skin: mat(0xb87950),
  gold: new THREE.MeshStandardMaterial({ color: 0xffcf57, roughness: 0.26, metalness: 0.72 }),
};

const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), mat(0xd6a06a));
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.14, -35);
ground.receiveShadow = true;
scene.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 190), materials.road);
road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.07, -75);
road.receiveShadow = true;
scene.add(road);

const roadBits = [];
for (const side of [-1, 1]) {
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 190), materials.sidewalk);
  sidewalk.position.set(side * 6.3, -0.06, -75);
  sidewalk.receiveShadow = true;
  scene.add(sidewalk);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 190), materials.curb);
  edge.position.set(side * 5.14, 0.005, -75);
  scene.add(edge);
}
for (let index = 0; index < 28; index++) {
  for (const x of [-1.7, 1.7]) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 2.65), materials.lane);
    dash.position.set(x, 0.018, 8 - index * 6);
    scene.add(dash);
    roadBits.push(dash);
  }
}

const blocks = [];
const buildingMaterials = [mat(0x8f755d), mat(0x727d70), mat(0xc28c68), mat(0x69786d), mat(0xb47f62)];
for (let index = 0; index < 34; index++) {
  const side = index % 2 ? 1 : -1;
  const width = 3 + Math.random() * 4.5;
  const height = 5 + Math.random() * 15;
  const depth = 5 + Math.random() * 6;
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMaterials[index % buildingMaterials.length]);
  building.position.set(side * (9.6 + Math.random() * 5.7), height / 2 - 0.12, -index * 8 - Math.random() * 5);
  building.receiveShadow = true;
  scene.add(building);
  blocks.push(building);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, 0.35, depth * 0.82), materials.cream);
  roof.position.set(building.position.x, height + 0.03, building.position.z);
  scene.add(roof);
  blocks.push(roof);
}

function box(parent, size, material, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const player = new THREE.Group();
player.position.set(0, 0, 4);
scene.add(player);
const torso = new THREE.Group();
torso.position.y = 1.17;
player.add(torso);
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.58, 5, 8), materials.denim);
body.castShadow = true;
torso.add(body);
box(torso, [0.57, 0.28, 0.4], materials.lime, [0, 0.22, -0.02]);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 12), materials.skin);
head.position.y = 0.68;
head.castShadow = true;
torso.add(head);
const hair = new THREE.Mesh(new THREE.SphereGeometry(0.257, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.46), materials.dark);
hair.position.y = 0.72;
torso.add(hair);

function makeLimb(length, radius, material) {
  const pivot = new THREE.Group();
  const limb = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 3, 7), material);
  limb.position.y = -length * 0.43;
  pivot.add(limb);
  return pivot;
}
const legs = [];
const arms = [];
for (const side of [-1, 1]) {
  const leg = makeLimb(0.59, 0.13, materials.dark);
  leg.position.set(side * 0.19, 0.75, 0);
  player.add(leg);
  box(leg, [0.23, 0.13, 0.34], materials.shoe, [0, -0.39, -0.11]);
  legs.push(leg);
  const arm = makeLimb(0.51, 0.105, materials.skin);
  arm.position.set(side * 0.43, 1.4, 0);
  player.add(arm);
  arms.push(arm);
}
const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.63, 20), new THREE.MeshBasicMaterial({ color: 0x18211c, transparent: true, opacity: 0.25 }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(0, 0.012, 4);
scene.add(shadow);

const objects = [];
const lanes = [-3.2, 0, 3.2];
const coinGeometry = new THREE.TorusGeometry(0.32, 0.11, 8, 18);
const obstacleMats = [materials.coral, materials.lime, materials.cream];
let lane = 1;
let state = "menu";
let distance = 0;
let coinCount = 0;
let speed = 16;
let jumpVelocity = 0;
let jumpHeight = 0;
let slideTime = 0;
let spawnClock = 0;
let soundEnabled = true;
let audioContext;
let toastTimeout;
let bestScore = Number(localStorage.getItem("rush-hour-best") || 0);
const ui = {
  intro: document.querySelector("#introScreen"), hud: document.querySelector("#hud"),
  pause: document.querySelector("#pauseScreen"), over: document.querySelector("#gameOverScreen"),
  controls: document.querySelector("#touchControls"), pauseButton: document.querySelector("#pauseButton"),
  score: document.querySelector("#score"), coins: document.querySelector("#coins"),
  best: document.querySelector("#bestScore"), finalScore: document.querySelector("#finalScore"),
  finalCoins: document.querySelector("#finalCoins"), toast: document.querySelector("#toast"),
};
ui.best.textContent = String(bestScore).padStart(6, "0");

function playTone(frequency = 680, duration = 0.09) {
  if (!soundEnabled) return;
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.085, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch { /* Sound is optional; gameplay remains available without audio. */ }
}

function addObstacle(targetLane, kind, z) {
  const group = new THREE.Group();
  group.position.set(lanes[targetLane], 0, z);
  if (kind === "overhead") {
    box(group, [2.35, 0.25, 0.55], materials.coral, [0, 1.72, 0]);
    box(group, [0.19, 1.63, 0.47], materials.dark, [-1.05, 0.81, 0]);
    box(group, [0.19, 1.63, 0.47], materials.dark, [1.05, 0.81, 0]);
  } else {
    const height = kind === "barrier" ? 1.35 : 0.8;
    box(group, [1.7, height, 0.8], obstacleMats[(Math.random() * obstacleMats.length) | 0], [0, height / 2, 0]);
    if (kind === "barrier") {
      box(group, [1.8, 0.13, 0.88], materials.cream, [0, height * 0.7, 0.01]);
      for (const side of [-1, 1]) box(group, [0.11, height + 0.08, 0.9], materials.dark, [side * 0.62, 0, 0]);
    }
  }
  scene.add(group);
  objects.push({ mesh: group, type: kind, lane: targetLane, z, collected: false });
}

function addCoin(targetLane, z) {
  const mesh = new THREE.Mesh(coinGeometry, materials.gold);
  mesh.position.set(lanes[targetLane], 1.15, z);
  mesh.castShadow = true;
  scene.add(mesh);
  objects.push({ mesh, type: "coin", lane: targetLane, z, collected: false });
}

function spawnPattern() {
  const safeLane = Math.floor(Math.random() * 3);
  for (const targetLane of [0, 1, 2].filter((item) => item !== safeLane)) {
    const roll = Math.random();
    addObstacle(targetLane, roll < 0.4 ? "crate" : roll < 0.73 ? "barrier" : "overhead", -88);
  }
  if (Math.random() < 0.72) {
    for (let index = 0; index < 5; index++) addCoin(safeLane, -58 - index * 3.5);
  }
}

function startGame() {
  for (const item of objects) scene.remove(item.mesh);
  objects.length = 0;
  distance = 0;
  coinCount = 0;
  speed = 16;
  lane = 1;
  jumpHeight = 0;
  jumpVelocity = 0;
  slideTime = 0;
  spawnClock = 0.9;
  player.position.set(0, 0, 4);
  player.scale.y = 1;
  ui.score.textContent = "000000";
  ui.coins.textContent = "0";
  state = "running";
  ui.intro.classList.add("hidden");
  ui.pause.classList.add("hidden");
  ui.over.classList.add("hidden");
  ui.hud.classList.remove("hidden");
  ui.controls.classList.remove("hidden");
  ui.pauseButton.classList.remove("hidden");
}

function endGame() {
  if (state !== "running") return;
  state = "over";
  const score = Math.floor(distance);
  ui.finalScore.innerHTML = `${score} <small>M</small>`;
  ui.finalCoins.textContent = String(coinCount);
  ui.hud.classList.add("hidden");
  ui.controls.classList.add("hidden");
  ui.pauseButton.classList.add("hidden");
  ui.over.classList.remove("hidden");
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("rush-hour-best", String(bestScore));
    ui.best.textContent = String(bestScore).padStart(6, "0");
    ui.toast.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => ui.toast.classList.add("hidden"), 2300);
  }
  playTone(220, 0.24);
}

function move(direction) {
  if (state !== "running") return;
  if (direction === "left") lane = Math.max(0, lane - 1);
  if (direction === "right") lane = Math.min(2, lane + 1);
  if (direction === "jump" && jumpHeight <= 0.01 && slideTime <= 0) jumpVelocity = 10.5;
  if (direction === "slide" && jumpHeight <= 0.01) slideTime = 0.68;
}

function togglePause() {
  if (state === "running") {
    state = "paused";
    ui.pause.classList.remove("hidden");
  } else if (state === "paused") {
    state = "running";
    ui.pause.classList.add("hidden");
  }
}

document.querySelector("#playButton").addEventListener("click", startGame);
document.querySelector("#restartButton").addEventListener("click", startGame);
document.querySelector("#pauseButton").addEventListener("click", togglePause);
document.querySelector("#resumeButton").addEventListener("click", togglePause);
document.querySelector("#soundButton").addEventListener("click", (event) => {
  soundEnabled = !soundEnabled;
  event.currentTarget.classList.toggle("is-muted", !soundEnabled);
  event.currentTarget.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
  event.currentTarget.title = soundEnabled ? "Sound on" : "Sound off";
});
document.querySelectorAll(".touch-button").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    move(button.dataset.action);
  });
});
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) event.preventDefault();
  if (key === "arrowleft" || key === "a") move("left");
  if (key === "arrowright" || key === "d") move("right");
  if (key === "arrowup" || key === "w" || key === " ") move("jump");
  if (key === "arrowdown" || key === "s") move("slide");
  if (key === "p" || key === "escape") togglePause();
  if (key === "enter" && (state === "menu" || state === "over")) startGame();
});

let touchStart = null;
window.addEventListener("touchstart", (event) => {
  if (event.target.closest("button")) return;
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
window.addEventListener("touchend", (event) => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 28) {
    move(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "jump" : "slide"));
  }
  touchStart = null;
}, { passive: true });

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.045);
  if (state === "running") {
    speed = Math.min(29, speed + delta * 0.16);
    distance += delta * speed * 0.48;
    ui.score.textContent = String(Math.floor(distance)).padStart(6, "0");
    player.position.x = THREE.MathUtils.damp(player.position.x, lanes[lane], 13, delta);
    player.position.y = jumpHeight;
    player.scale.y = slideTime > 0 ? 0.57 : 1;
    player.rotation.z = THREE.MathUtils.damp(player.rotation.z, (lanes[lane] - player.position.x) * -0.08, 8, delta);
    shadow.position.x = player.position.x;
    shadow.scale.setScalar(1 - jumpHeight * 0.12);
    if (jumpVelocity !== 0 || jumpHeight > 0) {
      jumpHeight += jumpVelocity * delta;
      jumpVelocity -= 25 * delta;
      if (jumpHeight <= 0) { jumpHeight = 0; jumpVelocity = 0; }
    }
    slideTime = Math.max(0, slideTime - delta);
    const run = Math.sin(performance.now() * 0.018) * 0.72;
    legs.forEach((leg, index) => { leg.rotation.x = slideTime > 0 ? -0.8 : (index ? run : -run); });
    arms.forEach((arm, index) => { arm.rotation.x = slideTime > 0 ? 0.8 : (index ? -run : run); });
    torso.rotation.x = slideTime > 0 ? -0.48 : 0;
    spawnClock += delta;
    if (spawnClock > Math.max(0.72, 1.45 - speed * 0.025)) { spawnClock = 0; spawnPattern(); }
    for (let index = objects.length - 1; index >= 0; index--) {
      const item = objects[index];
      item.mesh.position.z += speed * delta;
      item.z = item.mesh.position.z;
      if (item.type === "coin") {
        item.mesh.rotation.y += delta * 2.8;
        if (item.lane === lane && Math.abs(item.z - player.position.z) < 1.12 && Math.abs(jumpHeight - 0.7) < 1.6) {
          item.collected = true;
          coinCount++;
          ui.coins.textContent = String(coinCount);
          playTone(690 + (coinCount % 5) * 75, 0.075);
        }
      } else if (item.lane === lane && Math.abs(item.z - player.position.z) < 1.05) {
        const cleared = item.type === "overhead" ? slideTime > 0.12 : jumpHeight > (item.type === "barrier" ? 1.42 : 0.92);
        if (!cleared) endGame();
      }
      if (item.collected || item.z > 18) {
        scene.remove(item.mesh);
        objects.splice(index, 1);
      }
    }
    roadBits.forEach((dash) => {
      dash.position.z += speed * delta;
      if (dash.position.z > 12) dash.position.z -= 168;
    });
    blocks.forEach((building) => {
      building.position.z += speed * delta * 0.26;
      if (building.position.z > 24) building.position.z -= 272;
    });
  } else if (state === "menu") {
    player.position.y = Math.sin(performance.now() * 0.0018) * 0.045;
    torso.rotation.y = Math.sin(performance.now() * 0.0007) * 0.08;
    player.rotation.y = Math.sin(performance.now() * 0.0007) * 0.05;
  }
  camera.position.x = THREE.MathUtils.damp(camera.position.x, player.position.x * 0.12, 2, delta);
  camera.lookAt(player.position.x * 0.08, 1.1, -8);
  renderer.render(scene, camera);
}
animate();
