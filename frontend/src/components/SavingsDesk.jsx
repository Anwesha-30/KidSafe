import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function Box({ size, color, radius = .08, metalness = 0, roughness = .45, ...props }) {
  const geometry = useMemo(() => new RoundedBoxGeometry(...size, 3, radius), [size[0], size[1], size[2], radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh {...props} geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} metalness={metalness} roughness={roughness} /></mesh>;
}

function Label({ text, sub, color = "#153d4c", background = "#b1f1d9", size = [1, .5], ...props }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 384;
    const ctx = canvas.getContext("2d"); ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 384);
    ctx.fillStyle = color; ctx.textAlign = "center"; ctx.font = "bold 70px sans-serif"; ctx.fillText(text, 384, 180);
    ctx.font = "26px sans-serif"; ctx.fillText(sub || "", 384, 255);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; return map;
  }, [text, sub, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh {...props}><planeGeometry args={size} /><meshStandardMaterial map={texture} roughness={.55} /></mesh>;
}

function Coin(props) {
  return <group {...props}>
    <mesh castShadow><cylinderGeometry args={[.23, .23, .065, 40]} /><meshStandardMaterial color="#eebc52" metalness={.78} roughness={.23} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .037, 0]}><torusGeometry args={[.185, .013, 8, 40]} /><meshStandardMaterial color="#ffe2a0" metalness={.7} roughness={.2} /></mesh>
    <mesh position={[0, .039, 0]}><boxGeometry args={[.025, .01, .21]} /><meshStandardMaterial color="#bd8627" metalness={.65} /></mesh>
  </group>;
}

function Jar({ progress }) {
  const drop = useRef();
  const points = useMemo(() => [[0,0],[.62,0],[.72,.1],[.74,.25],[.74,1.7],[.67,1.9],[.6,2],[.6,2.14],[.55,2.14],[.55,2],[.62,1.85],[.68,1.68],[.68,.2],[.58,.1],[0,.1]].map(p => new THREE.Vector2(...p)), []);
  useFrame(() => {
    const phase = THREE.MathUtils.clamp((progress.current - .12) / .65, 0, 1);
    drop.current.position.y = 3.05 - phase * 2.32;
    drop.current.rotation.set(phase * .35, phase * 5, phase * .25);
  });
  return <group position={[-.65, .12, .1]}>
    <mesh><latheGeometry args={[points, 64]} /><meshPhysicalMaterial color="#dcfff7" metalness={0} roughness={.08} transmission={.94} thickness={.12} ior={1.45} transparent opacity={.6} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.582, .055, 12, 64]} /><meshPhysicalMaterial color="#d0eee9" metalness={.15} roughness={.16} /></mesh>
    {Array.from({ length: 13 }, (_, i) => <Coin key={i} position={[Math.sin(i * 2.4) * .32, .17 + Math.floor(i / 3) * .09, Math.cos(i * 2.4) * .32]} rotation={[i % 2 * .08, i, i % 3 * .06]} />)}
    <group ref={drop}><Coin /></group>
    <Label text="little dreams" sub="SAVINGS CLUB" size={[.95, .47]} position={[0, 1.03, .75]} background="#f2ead7" />
  </group>;
}

function Backpack() {
  return <group position={[1.9, .76, -.7]} rotation={[0, -.3, -.08]}>
    <Box size={[1.05, 1.43, .55]} radius={.22} color="#d99064" />
    <Box size={[.8, .55, .19]} position={[0, -.29, .35]} color="#c27750" radius={.12} />
    <Box size={[.63, .025, .025]} position={[0, -.06, .46]} color="#e9c799" radius={.008} metalness={.6} />
    <mesh position={[0, .72, 0]}><torusGeometry args={[.17, .045, 10, 24, Math.PI]} /><meshStandardMaterial color="#99583b" roughness={.8} /></mesh>
    {[-.32, .32].map(x => <Box key={x} size={[.12, 1.15, .14]} position={[x, -.04, -.34]} color="#99583b" />)}
    <Label text="GO!" sub="" size={[.27, .135]} position={[0, .28, .286]} background="#ecd5b0" />
  </group>;
}

function Books() {
  return <group position={[-2, .16, -.45]} rotation={[0, .2, 0]}>
    {["#376f8a", "#ebbb67", "#6daca0"].map((color, i) => <group key={color} position={[i * .04, i * .21, 0]} rotation={[0, (i - 1) * .13, 0]}>
      <Box size={[1.27, .16, .85]} color="#f6eedb" radius={.02} />
      {[-.092, .092].map(y => <Box key={y} size={[1.34, .025, .9]} position={[0, y, 0]} color={color} radius={.01} />)}
      <Box size={[.055, .2, .9]} position={[-.65, 0, 0]} color={color} radius={.015} />
    </group>)}
  </group>;
}

function Sneaker() {
  return <group position={[1.55, .18, 1.05]} rotation={[0, -.45, 0]}>
    <Box size={[1.3, .18, .57]} radius={.1} color="#f8f3e6" />
    <mesh position={[.07, .17, 0]} scale={[.62, .25, .265]} castShadow><sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color="#84b6b0" roughness={.8} /></mesh>
    <Box size={[.48, .39, .49]} position={[-.33, .22, 0]} color="#70a8a2" radius={.12} />
    <mesh position={[-.35, .43, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.15, 24]} /><meshStandardMaterial color="#274e51" /></mesh>
    {[0, 1, 2, 3].map(i => <Box key={i} size={[.028, .025, .34]} position={[-.11 + i * .105, .39 - i * .025, 0]} color="#fff8e7" radius={.01} />)}
  </group>;
}

function CardAndShield({ progress }) {
  const group = useRef();
  const shield = useMemo(() => { const s = new THREE.Shape(); s.moveTo(0,.46); s.lineTo(.34,.3); s.lineTo(.3,-.12); s.quadraticCurveTo(.2,-.36,0,-.47); s.quadraticCurveTo(-.2,-.36,-.3,-.12); s.lineTo(-.34,.3); s.closePath(); return s; }, []);
  useFrame(() => { group.current.rotation.y = -.28 + progress.current * .35; group.current.position.y = 1.35 + Math.sin(progress.current * Math.PI) * .18; });
  return <group ref={group} position={[.85, 1.35, .45]} rotation={[0, -.28, -.13]}>
    <Box size={[1.6, 1, .065]} color="#96dfc7" metalness={.35} roughness={.22} />
    <Label text="KidSafe" sub="125.00  /  SAMPLE mUSDC" size={[1.4, .7]} position={[0, .04, .037]} />
    <Box size={[.2, .15, .012]} position={[-.53, -.29, .046]} color="#ead48c" metalness={.7} radius={.02} />
    <group position={[.78, .52, .12]} scale={.82}>
      <mesh castShadow><extrudeGeometry args={[shield, { depth: .1, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 3, steps: 1 }]} /><meshStandardMaterial color="#367a91" metalness={.55} roughness={.23} /></mesh>
      <Box size={[.08, .22, .025]} position={[-.08, -.04, .14]} rotation={[0,0,.65]} color="#c5ffe8" radius={.02} />
      <Box size={[.08, .38, .025]} position={[.065, .01, .14]} rotation={[0,0,-.55]} color="#c5ffe8" radius={.02} />
    </group>
  </group>;
}

function FloatingItem({ children, progress, reduced, phase = 0 }) {
  const group = useRef();
  const time = useRef(0);
  useFrame((_, delta) => {
    if (!reduced) time.current += Math.min(delta, .05);
    group.current.position.y = reduced ? 0 : .12 + Math.sin(time.current * .8 + phase) * .09 + Math.sin(progress.current * Math.PI) * .15;
    group.current.rotation.z = reduced ? 0 : Math.sin(time.current * .5 + phase) * .025;
  });
  return <group ref={group}>{children}</group>;
}

function Desk({ reduced }) {
  const progress = useRef(0);
  const target = useRef(0);
  const stage = useRef();
  const satellites = useRef();
  const elapsed = useRef(0);
  const { gl, scene, invalidate, size } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    invalidate();
    return () => { scene.environment = null; environment.dispose(); room.dispose(); pmrem.dispose(); };
  }, [gl, scene, invalidate]);
  useEffect(() => {
    const update = () => { const story = document.getElementById("savings-scene"); if (!story) return; const rect = story.getBoundingClientRect(); target.current = reduced ? .45 : THREE.MathUtils.clamp((window.innerHeight - rect.top) / (rect.height + window.innerHeight), 0, 1); invalidate(); };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [reduced, invalidate]);
  useFrame(({ camera }, delta) => {
    if (!reduced) elapsed.current += Math.min(delta, .05);
    progress.current = reduced ? target.current : THREE.MathUtils.damp(progress.current, target.current, 5, delta);
    const p = progress.current;
    const distance = 8.4 * Math.max(1, 1.15 / (size.width / size.height));
    camera.position.set(Math.sin((p - .5) * 1.15) * 4, 4.3 + p * .6, distance);
    camera.lookAt(0, .85, 0);
    stage.current.rotation.y = (p - .5) * .4;
    stage.current.position.y = -.5 + (reduced ? 0 : Math.sin(elapsed.current * .65) * .075);
    satellites.current.rotation.y = reduced ? .2 : elapsed.current * .12 + p * .8;
    satellites.current.rotation.z = Math.sin(elapsed.current * .3) * .035;
    if (Math.abs(p - target.current) > .0001) invalidate();
  });
  return <>
    <ambientLight intensity={.8} />
    <pointLight position={[-4, 2, 1]} color="#67ffce" intensity={12} />
    <pointLight position={[4, 3, -1]} color="#ac85ff" intensity={18} />
    <directionalLight position={[-3, 7, 4]} intensity={3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-.001} />
    <directionalLight position={[4, 3, -3]} intensity={1.4} color="#bfe9ff" />
    <group ref={stage} position={[0, -.5, 0]}>
      <mesh position={[0, -.12, 0]} receiveShadow><cylinderGeometry args={[3.5, 3.5, .22, 96]} /><meshStandardMaterial color="#152e47" metalness={.55} roughness={.3} /></mesh>
      <mesh position={[0,-.15,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[3.5,.018,8,96]} /><meshStandardMaterial color="#8bf6de" emissive="#38ceba" emissiveIntensity={2} /></mesh>
      <Jar progress={progress} />
      <FloatingItem progress={progress} reduced={reduced} phase={0}><Backpack /></FloatingItem>
      <FloatingItem progress={progress} reduced={reduced} phase={2}><Books /></FloatingItem>
      <FloatingItem progress={progress} reduced={reduced} phase={4}><Sneaker /></FloatingItem>
      <CardAndShield progress={progress} />
      <Coin position={[-1.25,.06,1.5]} /><Coin position={[-.7,.06,1.7]} /><Coin position={[-.95,.12,1.6]} rotation={[.1,.4,.1]} />
    </group>
    <group ref={satellites} position={[0,.4,0]}>
      {[0,1,2,3,4,5].map(i => <group key={i} position={[Math.cos(i * Math.PI / 3) * 4.15, Math.sin(i * 2) * .55 + .7, Math.sin(i * Math.PI / 3) * 3.4]} rotation={[.5,i,.35]}><Coin /></group>)}
      <mesh rotation={[Math.PI/2+.14,0,.2]}><torusGeometry args={[4.1,.009,6,128]} /><meshBasicMaterial color="#7acccc" transparent opacity={.24} /></mesh>
    </group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.75,0]} receiveShadow><planeGeometry args={[200,200]} /><shadowMaterial opacity={.14} /></mesh>
  </>;
}

export default function SavingsDesk({ paused = false }) {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => { const change = () => setVisible(!document.hidden); document.addEventListener("visibilitychange", change); return () => document.removeEventListener("visibilitychange", change); }, []);
  useEffect(() => { const query = window.matchMedia("(prefers-reduced-motion: reduce)"); const change = () => setReduced(query.matches); query.addEventListener("change", change); return () => query.removeEventListener("change", change); }, []);
  return <Canvas shadows dpr={[1, 1.5]} frameloop={reduced || paused || !visible ? "demand" : "always"} camera={{ position: [0, 4.5, 8.4], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} fallback={<div className="desk-fallback">Your next adventure starts with a little saving.</div>}><Desk reduced={reduced || paused || !visible} /></Canvas>;
}
