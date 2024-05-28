import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import { debug } from "openai/core.mjs";
import gsap from "gsap";

const debugObject = {};

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const canvas = document.querySelector("#bg");

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshBasicMaterial({
//   color: 0xff6347,
//   wireframe: true,
// }); // basic = no light source required

debugObject.color = 0xff6347;
debugObject.wireframe = false;

// const material = new THREE.MeshStandardMaterial({
//   color: debugObject.color,
//   wireframe: debugObject.wireframe,
// });

const material = new THREE.MeshPhysicalMaterial();
material.metalness = 0;
material.roughness = 0;
material.transmission = 0.999;
material.ior = 2.417; // diamond ior
material.thickness = 2.5;

const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff, 2000);
pointLight.position.set(20, 20, 20);

scene.add(pointLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load("starmap_2020_4k.jpeg");
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.colorSpace = THREE.SRGBColorSpace;
scene.background = textureEquirec;

// Avatar

const buweiTexture = textureLoader.load("buwei.png");
const buwei = new THREE.Mesh(
  new THREE.BoxGeometry(4, 4, 4),
  new THREE.MeshBasicMaterial({ map: buweiTexture })
);

scene.add(buwei);

function animate() {
  requestAnimationFrame(animate);
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  buwei.rotation.x -= 0.01;
  buwei.rotation.y -= 0.005;
  buwei.rotation.z -= 0.01;

  controls.update();

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Debug
const gui = new GUI({
  title: "debug",
  closeFolders: true,
});

gui.add(torus, "visible");
gui.add(debugObject, "wireframe").onChange(() => {
  material.wireframe = debugObject.wireframe;
});
// gui.addColor(debugObject, "color").onChange(() => {
//   material.color.set(debugObject.color);
// });

debugObject.spin = () => {
  gsap.to(torus.rotation, {
    duration: 1,
    y: torus.rotation.y + Math.PI * 2,
  });
};

gui.add(debugObject, "spin");
gui.add(material, "metalness").min(0).max(1).step(0.0001);
gui.add(material, "roughness").min(0).max(1).step(0.0001);
gui.add(material, "transmission").min(0).max(1).step(0.0001);
gui.add(material, "ior").min(0).max(10).step(0.0001);
gui.add(material, "thickness").min(0).max(10).step(0.0001);
