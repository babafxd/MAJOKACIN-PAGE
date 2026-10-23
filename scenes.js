import * as THREE from 'three';
import { buildCharacter } from './characters.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export async function mountScene(kind = 'mimo', portraitPath) {
 const isPortrait = Boolean(portraitPath);
 const hero = document.querySelector('.hero');
 const host = document.querySelector('#visual');
 if (!host) return;
 const mount = host.querySelector('.canvas-mount') || host;
 const status = document.querySelector('#metrics');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');

 let paused = reduced.matches;
 let visible = true;
 let disposed = false;
 let raf = 0;
 let last = 0;
 let elapsed = 0;
 let frameCount = 0;
 let measured = 0;
 let meanFrame = 0;
 let sayHi = 0;
 let reveal = false;
 let finish = 'cobre';

 const pointer = new THREE.Vector2(0, 0);
 const smooth = new THREE.Vector2(0, 0);

 let renderer;
 try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
 } catch (e) {
  if (status) status.textContent = 'WebGL no disponible. Se conserva la composición estática.';
  return;
 }

 renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.75));
 renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = kind === 'pliegue' ? 0.95 : ['tilo', 'mimo', 'kiro'].includes(kind) ? 0.76 : 1.0;
 renderer.setClearColor(0x000000, 0);
 mount.append(renderer.domElement);

 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
 camera.position.set(0, 0.15, 7.8);
 camera.lookAt(0, 0, 0);

 const group = new THREE.Group();
 scene.add(group);

 const geometries = new Set();
 const materials = new Set();
 const textures = new Set();
 const geo = g => (geometries.add(g), g);
 const mat = m => (materials.add(m), m);

 function mesh(g, m, parent = group, pos = [0, 0, 0], scale = [1, 1, 1]) {
  const n = new THREE.Mesh(geo(g), m);
  n.position.set(...pos);
  n.scale.set(...scale);
  parent.add(n);
  return n;
 }

 let character;
 let head, eyes = [], sculpture, portraitUniforms, envTarget, pmrem;

 if (!isPortrait) {
  pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  envTarget = pmrem.fromScene(room, 0.025);
  scene.environment = envTarget.texture;
  room.dispose();
  scene.environmentIntensity = kind === 'tilo' ? 0.7 : 0.55;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x434137, 0.75));
  const key = new THREE.DirectionalLight(0xffebd5, 2.3);
  key.position.set(-3, 5, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd4ecff, 1.3);
  fill.position.set(4, 1, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 3);
  rim.position.set(0, 3, -3);
  scene.add(rim);
 }

 if (kind === 'tilo') {
  const ceramic = mat(new THREE.MeshPhysicalMaterial({ color: 0xe9e3c7, roughness: 0.27, metalness: 0.16, clearcoat: 1, clearcoatRoughness: 0.25 }));
  const copper = mat(new THREE.MeshStandardMaterial({ color: 0xb4532e, roughness: 0.3, metalness: 0.7 }));
  const dark = mat(new THREE.MeshPhysicalMaterial({ color: 0x101b1a, roughness: 0.16, metalness: 0.35, clearcoat: 1 }));
  const trim = mat(new THREE.MeshStandardMaterial({ color: 0x777867, roughness: 0.25, metalness: 1 }));
  const glow = mat(new THREE.MeshBasicMaterial({ color: 0xe4ffb3 }));

  head = new THREE.Group();
  head.position.y = 0.43;
  group.add(head);

  mesh(new RoundedBoxGeometry(2.15, 1.76, 1.5, 5, 0.47), ceramic, head);
  mesh(new RoundedBoxGeometry(1.83, 1.16, 0.28, 5, 0.3), trim, head, [0, -0.04, 0.69]);
  mesh(new RoundedBoxGeometry(1.73, 1.06, 0.35, 5, 0.3), dark, head, [0, -0.04, 0.77]);

  for (const x of [-0.43, 0.43]) {
   const eye = mesh(new THREE.CapsuleGeometry(0.09, 0.18, 6, 14), glow, head, [x, 0.03, 0.967]);
   eyes.push(eye);
   const ear = mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 40), copper, head, [Math.sign(x) * 1.15, 0, 0]);
   ear.rotation.z = Math.PI / 2;
   const cap = mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.17, 40), ceramic, head, [Math.sign(x) * 1.23, 0, 0]);
   cap.rotation.z = Math.PI / 2;
  }

  mesh(new THREE.CapsuleGeometry(0.018, 0.23, 3, 8), copper, head, [0.15, 0.98, 0]).rotation.z = -0.2;
  mesh(new THREE.SphereGeometry(0.07, 20, 12), glow, head, [0.18, 1.13, 0]);

  const neck = mesh(new THREE.CylinderGeometry(0.33, 0.38, 0.38, 36), trim, group, [0, -0.57, 0]);
  mesh(new RoundedBoxGeometry(1.53, 1.2, 0.97, 5, 0.4), ceramic, group, [0, -1.2, 0]);
  const badge = mesh(new THREE.CircleGeometry(0.16, 32), copper, group, [0, -1.05, 0.49]);
  mesh(new THREE.CircleGeometry(0.075, 24), dark, group, [0, -1.05, 0.494]);

  for (let s of [-1, 1]) {
   const arm = mesh(new THREE.CapsuleGeometry(0.2, 0.52, 6, 24), ceramic, group, [s * 0.99, -1.13, 0]);
   arm.rotation.z = s * 0.3;
   mesh(new THREE.SphereGeometry(0.19, 24, 16), copper, group, [s * 1.1, -1.5, 0]);
  }

  group.rotation.y = -0.14;
  group.rotation.z = -0.035;
  group.position.y = 0.25;

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(54,49,26,.22)');
  gradient.addColorStop(1, 'rgba(54,49,26,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const st = new THREE.CanvasTexture(shadowCanvas);
  textures.add(st);
  const sm = mat(new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
  const shadow = mesh(new THREE.PlaneGeometry(4, 1), sm, scene, [0, -2.03, -0.5]);
  shadow.rotation.x = -0.2;
 }

 if (kind === 'mimo' || kind === 'kiro') {
  character = buildCharacter(kind, { mesh, mat, group });
  camera.position.set(0, 0.12, kind === 'mimo' ? 7.2 : 7.8);
  camera.lookAt(0, 0, 0);
 }

 if (isPortrait) {
  let texture;
  try {
   texture = await new THREE.TextureLoader().loadAsync(portraitPath);
  } catch (e) {
   if (status) status.textContent = 'No se pudo cargar el retrato. Se conserva la composición.';
   renderer.dispose();
   return;
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  textures.add(texture);
  camera.position.set(0, 0, 1);
  camera.lookAt(0, 0, 0);
  portraitUniforms = {
   uFocus: { value: new THREE.Vector2(0.5, 0.5) },
   uBaseLight: { value: ['onda', 'vertice'].includes(kind) ? 0.78 : 0.30 },
   uMap: { value: texture },
   uPointer: { value: new THREE.Vector2(0.55, 0.57) },
   uRatio: { value: 1 },
   uImageRatio: { value: texture.image.width / texture.image.height },
   uReveal: { value: 0 },
   uShift: { value: new THREE.Vector2() }
  };
  const shader = mat(new THREE.ShaderMaterial({
   uniforms: portraitUniforms,
   depthTest: false,
   depthWrite: false,
   toneMapped: false,
   vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
   fragmentShader: `
    varying vec2 vUv;uniform sampler2D uMap;uniform vec2 uPointer;uniform vec2 uShift;uniform vec2 uFocus;uniform float uRatio;uniform float uImageRatio;uniform float uReveal;uniform float uBaseLight;
    void main(){
      vec2 cover=vec2(min(uRatio/uImageRatio,1.),min(uImageRatio/uRatio,1.));
      vec2 center=clamp(uFocus,cover*.48+.01,1.-cover*.48-.01);
      vec2 texUv=(vUv-.5)*cover*.96+center+uShift;
      vec3 image=texture2D(uMap,texUv).rgb;
      vec2 delta=(vUv-uPointer)*vec2(uRatio,1.);
      float spot=1.-smoothstep(.06,.46,length(delta));
      float light=mix(uBaseLight,1.18,spot);
      light=mix(light,1.,uReveal);
      vec3 color=image*light;
      color+=image*vec3(.1,.055,.015)*spot;
      gl_FragColor=vec4(color,1.);
      #include <colorspace_fragment>
    }`
  }));
  mesh(new THREE.PlaneGeometry(2, 2), shader, scene);
 }

 function render(now = performance.now()) {
  raf = 0;
  if (disposed || !visible || document.hidden) return;

  const rawDt = (now - (last || now)) / 1000;
  const dt = Math.min(rawDt, 0.05);
  last = now;

  if (!paused) elapsed += dt;
  const damping = 1 - Math.exp(-dt * 6);
  if (!paused) smooth.lerp(pointer, damping);

  if (character && !paused) {
   sayHi = Math.max(0, sayHi - dt);
   character.update(elapsed, smooth, sayHi);
  }

  if (head) {
   if (!paused) {
    head.rotation.y = smooth.x * 0.4;
    head.rotation.x = -smooth.y * 0.23;
    head.rotation.z = Math.sin(elapsed * 0.7) * 0.025;
    group.position.y = 0.25 + Math.sin(elapsed * 1.35) * 0.055;
    const blink = Math.pow(Math.max(0, Math.cos(elapsed * 1.25)), 50);
    for (let i = 0; i < eyes.length; i++) {
     eyes[i].scale.y = 1 - blink * 0.91;
     eyes[i].position.x = (i ? 0.43 : -0.43) + smooth.x * 0.035;
    }
    if (sayHi > 0) {
     sayHi = Math.max(0, sayHi - dt);
     head.rotation.z += Math.sin(sayHi * 9) * 0.09;
    }
   }
  }

  if (sculpture && !paused) {
   group.rotation.y = smooth.x * 0.38 + Math.sin(elapsed * 0.25) * 0.08;
   group.rotation.x = -smooth.y * 0.24;
   sculpture.rotation.z = 0.45 + Math.sin(elapsed * 0.3) * 0.12;
  }

  if (portraitUniforms) {
   portraitUniforms.uReveal.value = THREE.MathUtils.damp(portraitUniforms.uReveal.value, reveal ? 1 : 0, 7, dt);
   if (!paused) {
    portraitUniforms.uPointer.value.set(smooth.x * 0.5 + 0.5, smooth.y * 0.5 + 0.5);
    portraitUniforms.uShift.value.set(smooth.x * 0.008, smooth.y * 0.005);
   }
  }

  renderer.render(scene, camera);
  if (hero) hero.classList.add('webgl-ready');

  frameCount++;
  if (rawDt > 0 && rawDt < 0.25 && !paused) {
   meanFrame += rawDt * 1000;
   measured++;
  }

  if (status && (frameCount % 60 === 0 || frameCount === 1 || paused)) {
   status.textContent = `Three.js r${THREE.REVISION} · ${renderer.info.render.calls} draw calls · ${renderer.info.render.triangles.toLocaleString('es')} triángulos · DPR ${renderer.getPixelRatio()} · ${measured ? (meanFrame / measured).toFixed(1) + ' ms medios entre cuadros (vista actual)' : 'sin medición aún'} · ${paused ? 'pausado' : 'activo'} · x ${smooth.x.toFixed(2)} / y ${smooth.y.toFixed(2)}`;
  }

  if ((!paused && (!isPortrait || smooth.distanceToSquared(pointer) > 0.000001)) ||
      (portraitUniforms && Math.abs(portraitUniforms.uReveal.value - (reveal ? 1 : 0)) > 0.001)) {
   raf = requestAnimationFrame(render);
  }
 }

 function wake() {
  if (!raf && !disposed) {
   last = performance.now();
   raf = requestAnimationFrame(render);
  }
 }

 function resize() {
  const r = host.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return;
  renderer.setSize(r.width, r.height);
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();
  if (portraitUniforms) {
   portraitUniforms.uRatio.value = camera.aspect;
   portraitUniforms.uFocus.value.set(
    kind === 'vertice' && camera.aspect < 1 ? 0.72 : 0.5,
    kind === 'iris' ? 0.99 : kind === 'vertice' && camera.aspect > 1.4 ? 0.59 : 0.5
   );
  }
  wake();
 }

 const resizeObserver = new ResizeObserver(resize);
 resizeObserver.observe(host);

 const onMove = e => {
  const r = host.getBoundingClientRect();
  pointer.set(
   THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1),
   THREE.MathUtils.clamp(1 - ((e.clientY - r.top) / r.height) * 2, -1, 1)
  );
  wake();
 };

 const onLeave = () => {
  pointer.set(0, 0);
  wake();
 };

 const onKey = e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) {
   e.preventDefault();
   if (e.key === 'Home') {
    pointer.set(0, 0);
   } else {
    pointer.x = THREE.MathUtils.clamp(pointer.x + (e.key === 'ArrowLeft' ? -0.2 : e.key === 'ArrowRight' ? 0.2 : 0), -1, 1);
    pointer.y = THREE.MathUtils.clamp(pointer.y + (e.key === 'ArrowUp' ? 0.2 : e.key === 'ArrowDown' ? -0.2 : 0), -1, 1);
   }
   wake();
  }
 };

 host.addEventListener('pointermove', onMove);
 host.addEventListener('pointerdown', onMove);
 host.addEventListener('pointerleave', onLeave);
 host.addEventListener('keydown', onKey);

 // Also track movements across the hero area so Mimo responds to cursor throughout the section
 const onHeroMove = e => {
  const r = host.getBoundingClientRect();
  pointer.set(
   THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1),
   THREE.MathUtils.clamp(1 - ((e.clientY - r.top) / r.height) * 2, -1, 1)
  );
  wake();
 };
 if (hero) {
  hero.addEventListener('pointermove', onHeroMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave, { passive: true });
 }

 const onPreference = () => {
  paused = reduced.matches;
  wake();
 };
 reduced.addEventListener('change', onPreference);

 const onVisibility = () => {
  if (document.hidden) {
   cancelAnimationFrame(raf);
   raf = 0;
  } else {
   wake();
  }
 };
 document.addEventListener('visibilitychange', onVisibility);

 let observer;
 if (hero) {
  observer = new IntersectionObserver(([entry]) => {
   visible = entry.isIntersecting;
   if (visible) {
    wake();
   } else {
    cancelAnimationFrame(raf);
    raf = 0;
   }
  }, { threshold: 0.01 });
  observer.observe(hero);
 }

 const actionBtn = document.querySelector('#action');
 const onAction = () => {
  const response = document.querySelector('#response');
  if (character) {
   sayHi = 2;
   if (paused) character.head.rotation.z = 0.12;
   if (response) response.textContent = kind === 'mimo' ? '¡Hola, tú!' : 'Listos para ir más lejos.';
  }
  if (kind === 'tilo') {
   sayHi = 2;
   if (response) response.textContent = 'Hola. Ya tienes toda mi atención.';
   if (paused && head) head.rotation.z = 0.12;
  }
  if (kind === 'pliegue' && sculpture) {
   finish = finish === 'cobre' ? 'cromo' : 'cobre';
   sculpture.material.color.set(finish === 'cobre' ? 0xb56f43 : 0xd8e3e9);
   if (response) response.textContent = `Acabado ${finish}.`;
  }
  if (isPortrait && portraitUniforms) {
   reveal = !reveal;
   if (actionBtn) {
    actionBtn.innerHTML = `${reveal ? (['onda', 'vertice'].includes(kind) ? 'Volver a la atmósfera' : 'Volver a la sombra') : kind === 'onda' ? 'Encender el estudio' : kind === 'vertice' ? 'Explorar la luz' : 'Revelar retrato'}`;
   }
   if (response) response.textContent = reveal ? 'Cada detalle, a plena luz.' : '';
  }
  wake();
 };
 if (actionBtn) actionBtn.addEventListener('click', onAction);

 function onContextLost(e) {
  e.preventDefault();
  cancelAnimationFrame(raf);
  raf = 0;
  if (hero) hero.classList.remove('webgl-ready');
  if (status) status.textContent = 'Contexto gráfico perdido. Se muestra la versión estática. Recarga para reintentar.';
  disposed = true;
 }
 renderer.domElement.addEventListener('webglcontextlost', onContextLost);

 function dispose() {
  disposed = true;
  cancelAnimationFrame(raf);
  resizeObserver.disconnect();
  if (observer) observer.disconnect();
  host.removeEventListener('pointermove', onMove);
  host.removeEventListener('pointerdown', onMove);
  host.removeEventListener('pointerleave', onLeave);
  host.removeEventListener('keydown', onKey);
  if (hero) {
   hero.removeEventListener('pointermove', onHeroMove);
   hero.removeEventListener('pointerleave', onLeave);
  }
  if (actionBtn) actionBtn.removeEventListener('click', onAction);
  document.removeEventListener('visibilitychange', onVisibility);
  reduced.removeEventListener('change', onPreference);
  geometries.forEach(g => g.dispose());
  materials.forEach(m => m.dispose());
  textures.forEach(t => t.dispose());
  envTarget?.dispose();
  pmrem?.dispose();
  renderer.dispose();
 }

 window.addEventListener('pagehide', dispose, { once: true });
 window.addEventListener('pageshow', e => {
  if (e.persisted) location.reload();
 });
 if (import.meta.hot) import.meta.hot.dispose(dispose);

 resize();
 wake();
}
