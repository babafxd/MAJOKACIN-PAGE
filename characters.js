import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Original procedural characters. Every part is owned by the scene's resource registry.
export function buildCharacter(kind, { mesh, mat, group }) {
 const physical = (color, roughness = 0.32, metalness = 0.05) =>
  mat(new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: 0.7, clearcoatRoughness: 0.32 }));
 const sphere = (r, m, parent, pos, scale = [1, 1, 1]) =>
  mesh(new THREE.SphereGeometry(r, 48, 32), m, parent, pos, scale);
 const capsule = (r, l, m, parent, pos) =>
  mesh(new THREE.CapsuleGeometry(r, l, 8, 24), m, parent, pos);
 const box = (w, h, d, r, m, parent, pos) =>
  mesh(new RoundedBoxGeometry(w, h, d, 4, r), m, parent, pos);

 const head = new THREE.Group();
 group.add(head);
 const eyes = [], ears = [], arms = [];

 if (kind === 'mimo') {
  const honey = physical(0xffc329, 0.3);
  const cream = physical(0xffeac7, 0.38);
  const rose = physical(0xd93158, 0.44);
  const ink = physical(0x211d28, 0.13);
  const glint = mat(new THREE.MeshBasicMaterial({ color: 0xfff9e8 }));

  head.position.y = 0.5;
  sphere(1.13, honey, head, [0, 0, 0], [1.04, 0.92, 0.86]);

  for (const side of [-1, 1]) {
   const ear = new THREE.Group();
   ear.position.set(side * 0.67, 0.75, -0.06);
   head.add(ear);
   ear.rotation.z = side * -0.16;
   ears.push(ear);

   capsule(0.245, 0.71, honey, ear, [0, 0.37, 0]);
   const innerEar = capsule(0.115, 0.49, rose, ear, [0, 0.37, 0.242]);
   innerEar.scale.z = 0.16;

   sphere(0.43, cream, head, [side * 0.31, -0.34, 0.78], [1, 0.72, 0.4]);

   const eye = sphere(0.17, ink, head, [side * 0.43, 0.09, 0.865], [0.82, 1.2, 0.6]);
   eyes.push(eye);
   sphere(0.047, glint, eye, [-0.03, 0.04, 0.092], [1, 1, 0.3]);

   sphere(0.12, rose, head, [side * 0.77, -0.26, 0.74], [1, 0.52, 0.12]);
  }

  sphere(0.12, ink, head, [0, -0.27, 0.956], [1, 0.65, 0.62]);
  const smile = mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 32, Math.PI), ink, head, [0, -0.37, 0.943]);
  smile.rotation.z = Math.PI;

  sphere(0.78, honey, group, [0, -0.96, -0.09], [0.89, 1.14, 0.77]);
  sphere(0.54, cream, group, [0, -1.05, 0.42], [0.83, 1.1, 0.22]);
  mesh(new THREE.TorusGeometry(0.49, 0.17, 16, 64), rose, group, [0, -0.46, 0.01]).rotation.x = Math.PI / 2;
  const scarf = box(0.26, 0.7, 0.12, 0.09, rose, group, [0.38, -0.8, 0.52]);
  scarf.rotation.z = 0.23;

  for (const side of [-1, 1]) {
   const arm = new THREE.Group();
   arm.position.set(side * 0.58, -0.68, 0);
   group.add(arm);
   arms.push(arm);
   capsule(0.22, 0.42, honey, arm, [side * 0.12, -0.27, 0.08]).rotation.z = side * 0.35;
   sphere(0.32, honey, group, [side * 0.44, -1.74, 0.17], [1.1, 0.7, 1.35]);
  }

  group.rotation.set(0, -0.13, -0.055);
 } else {
  const shell = physical(0xcbd0bb, 0.29, 0.32);
  const dark = physical(0x101b22, 0.27, 0.38);
  const lime = physical(0xd2ff32, 0.3, 0.2);
  const joint = physical(0x373f42, 0.54, 0.3);
  const eyeMat = mat(new THREE.MeshBasicMaterial({ color: 0xe2ff93 }));

  head.position.y = 0.66;
  sphere(1.13, shell, head, [0, 0, 0], [1, 1, 0.93]);
  sphere(1.0, joint, head, [0, -0.07, 0.49], [1, 0.79, 0.63]);
  sphere(0.94, dark, head, [0, -0.06, 0.59], [1, 0.77, 0.61]);

  for (const side of [-1, 1]) {
   const eye = capsule(0.065, 0.15, eyeMat, head, [side * 0.34, -0.035, 1.18]);
   eyes.push(eye);
   const hinge = mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.15, 40), joint, head, [side * 1.09, -0.08, 0]);
   hinge.rotation.z = Math.PI / 2;
   const cap = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.18, 40), lime, head, [side * 1.14, -0.08, 0]);
   cap.rotation.z = Math.PI / 2;
  }

  box(0.3, 0.075, 0.055, 0.025, lime, head, [0, 0.87, 0.62]);
  capsule(0.025, 0.38, joint, head, [-0.83, 1.01, -0.15]).rotation.z = 0.24;
  sphere(0.065, lime, head, [-0.89, 1.22, -0.15]);
  box(1.33, 1.25, 0.7, 0.2, joint, group, [0, -0.83, -0.55]);

  for (const side of [-1, 1]) {
   capsule(0.22, 0.7, shell, group, [side * 0.77, -0.85, -0.43]);
   mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.2, 24), lime, group, [side * 0.77, -1.39, -0.43]);
  }

  mesh(new THREE.TorusGeometry(0.48, 0.14, 16, 64), joint, group, [0, -0.43, 0]).rotation.x = Math.PI / 2;
  box(1.25, 1.14, 0.87, 0.3, shell, group, [0, -1.0, 0]);
  box(0.65, 0.39, 0.12, 0.08, joint, group, [0, -0.92, 0.458]);

  for (let i = 0; i < 3; i++) {
   box(0.09, 0.17, 0.04, 0.02, lime, group, [-0.18 + i * 0.18, -0.92, 0.535]);
  }

  for (const side of [-1, 1]) {
   const arm = new THREE.Group();
   arm.position.set(side * 0.66, -0.65, 0);
   arm.rotation.z = side * 0.27;
   group.add(arm);
   arms.push(arm);
   sphere(0.24, joint, arm, [0, 0, 0]);
   capsule(0.23, 0.3, shell, arm, [side * 0.1, -0.28, 0]);
   mesh(new THREE.TorusGeometry(0.215, 0.055, 10, 32), lime, arm, [side * 0.12, -0.54, 0]).rotation.x = Math.PI / 2;
   sphere(0.23, shell, arm, [side * 0.12, -0.66, 0.025], [1, 1.05, 1]);
   capsule(0.23, 0.3, joint, group, [side * 0.33, -1.62, 0]);
   box(0.54, 0.46, 0.8, 0.16, shell, group, [side * 0.34, -1.93, 0.14]);
   box(0.55, 0.09, 0.79, 0.04, lime, group, [side * 0.34, -2.14, 0.14]);
  }

  group.rotation.set(0.04, -0.2, 0.12);
 }

 const baseEyes = eyes.map(e => e.position.x);

 return {
  head,
  update(t, p, gesture) {
   head.rotation.set(-p.y * 0.2, p.x * 0.36, Math.sin(t * 0.8) * 0.025);
   const blink = 1 - Math.pow(Math.max(0, Math.cos(t * 1.1)), 60) * 0.92;
   eyes.forEach((eye, i) => {
    eye.scale.y = (kind === 'mimo' ? 1.2 : 1) * blink;
    eye.position.x = baseEyes[i] + p.x * 0.025;
   });
   group.position.y = Math.sin(t * 1.2) * 0.07 + (kind === 'kiro' ? Math.sin(Math.min(gesture, 1) * Math.PI) * 0.24 : 0);
   ears.forEach((ear, i) => {
    ear.rotation.z = (i ? -0.16 : 0.16) + Math.sin(t * 1.8 + i) * 0.045 + Math.sin(gesture * 7) * 0.12;
   });
   arms.forEach((arm, i) => {
    arm.rotation.z = (i ? 1 : -1) * (0.15 + Math.sin(t + i) * 0.035) + (i === 1 ? Math.sin(gesture * 8) * 0.4 : 0);
   });
  }
 };
}
