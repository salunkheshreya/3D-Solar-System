// === Basic Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.getElementById("container").appendChild(renderer.domElement);

// === Lighting ===
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0);
scene.add(light);

// === Sun ===
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// === Planets Data ===
const planetData = [
  { name: "Mercury", size: 0.4, distance: 8, color: 0xaaaaaa, speed: 0.04 },
  { name: "Venus", size: 0.9, distance: 11, color: 0xffcc99, speed: 0.015 },
  { name: "Earth", size: 1, distance: 14, color: 0x3399ff, speed: 0.01 },
  { name: "Mars", size: 0.6, distance: 17, color: 0xff6633, speed: 0.008 },
  { name: "Jupiter", size: 2.5, distance: 22, color: 0xffcc66, speed: 0.002 },
  { name: "Saturn", size: 2, distance: 27, color: 0xffe0b3, speed: 0.001 },
  { name: "Uranus", size: 1.4, distance: 31, color: 0x66ffff, speed: 0.0005 },
  { name: "Neptune", size: 1.4, distance: 35, color: 0x3333ff, speed: 0.0003 }
];

// === Planets, Orbits, and Sliders ===
const planets = [];
const speeds = {};

planetData.forEach((data, i) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = data.distance;
  scene.add(mesh);
  planets.push({ mesh, distance: data.distance, angle: Math.random() * Math.PI * 2, speed: data.speed, name: data.name });
  speeds[data.name] = data.speed;

  const label = document.createElement("label");
  label.innerHTML = '${data.name} Speed: <input type="range" min="0.0001" max="0.05" step="0.0001" value="${data.speed}" data-name="${data.name}" />';
  document.getElementById("sliders").appendChild(label);
});

// === Stars Background ===
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 10000;
  const starVertices = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars();

// === Camera Position ===
camera.position.z = 60;

// === Tooltip ===
const tooltip = document.getElementById("tooltip");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = planets.find(p => p.mesh === intersects[0].object);
    tooltip.style.display = "block";
    tooltip.style.left = '${e.clientX + 10}px';
    tooltip.style.top = '${e.clientY + 10}px';
    tooltip.textContent = planet.name;
  } else {
    tooltip.style.display = "none";
  }
});

// === Click Zoom to Planet ===
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const target = planet.position.clone().normalize().multiplyScalar(10);
    camera.position.copy(target);
    camera.lookAt(planet.position);
  }
});// === Animation Control ===
let isAnimating = true;
document.getElementById("toggleAnimation").addEventListener("click", () => {
  isAnimating = !isAnimating;
  document.getElementById("toggleAnimation").textContent = isAnimating ? "⏸ Pause Animation" : "▶ Resume Animation";
});

// === Speed Slider Change ===
document.querySelectorAll("input[type=range]").forEach(slider => {
  slider.addEventListener("input", (e) => {
    const name = e.target.dataset.name;
    const planet = planets.find(p => p.name === name);
    planet.speed = parseFloat(e.target.value);
  });
});

// === Animate Function ===
function animate() {
  requestAnimationFrame(animate);

  if (isAnimating) {
    planets.forEach(planet => {
      planet.angle += planet.speed;
      planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
      planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
      planet.mesh.rotation.y += 0.01;
    });
  }

  renderer.render(scene, camera);
}
animate();

// === Theme Toggle ===
const themeToggle = document.getElementById("toggleTheme");
let isDark = true;
document.body.classList.add("dark");

themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  if (isDark) {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    themeToggle.textContent = "🌙 Dark Mode";
    renderer.setClearColor(0x000000);
  } else {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    themeToggle.textContent = "☀ Light Mode";
    renderer.setClearColor(0xf0f0f0);
  }
});

// === Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});