"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---- tiny seamless 3D value-noise so the texture wraps around the sphere ---- */
function hash(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
}
function fbm(x: number, y: number, z: number, oct: number): number {
  let v = 0, a = 0.5, f = 1, norm = 0;
  for (let o = 0; o < oct; o++) { v += a * noise(x * f, y * f, z * f); norm += a; a *= 0.5; f *= 2.05; }
  return v / norm;
}
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

/** Procedurally paints a Martian surface (colour + height) – no image download needed. */
function makeTextures(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const W = 512, H = 256;
  const col = document.createElement("canvas"); col.width = W; col.height = H;
  const hgt = document.createElement("canvas"); hgt.width = W; hgt.height = H;
  const cc = col.getContext("2d")!, hc = hgt.getContext("2d")!;
  const ci = cc.createImageData(W, H), hi = hc.createImageData(W, H);
  const rust = [120, 44, 22], orange = [196, 90, 46], sand = [226, 166, 106], dark = [64, 24, 16], ice = [244, 232, 222];
  for (let py = 0; py < H; py++) {
    const lat = (0.5 - py / H) * Math.PI;
    for (let px = 0; px < W; px++) {
      const lon = (px / W) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
      const n = fbm(x * 2.4 + 9, y * 2.4 + 3, z * 2.4 + 5, 5);
      const d = fbm(x * 9, y * 9, z * 9, 3);
      let c = n < 0.5 ? mix(rust, orange, n / 0.5) : mix(orange, sand, (n - 0.5) / 0.5);
      const patch = smooth(Math.min(1, Math.max(0, (fbm(x * 1.4 + 40, y * 1.4, z * 1.4 + 11, 4) - 0.52) * 6)));
      c = mix(c, dark, patch * 0.75);
      c = mix(c, [c[0] * 0.8, c[1] * 0.8, c[2] * 0.8], d * 0.5);
      const cap = smooth(Math.min(1, Math.max(0, (Math.abs(y) - 0.86) / 0.1)));
      c = mix(c, ice, cap * 0.92);
      const i = (py * W + px) * 4;
      ci.data[i] = c[0]; ci.data[i + 1] = c[1]; ci.data[i + 2] = c[2]; ci.data[i + 3] = 255;
      const h = Math.min(255, (n * 0.7 + d * 0.3) * 255);
      hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = h; hi.data[i + 3] = 255;
    }
  }
  cc.putImageData(ci, 0, 0); hc.putImageData(hi, 0, 0);
  const map = new THREE.CanvasTexture(col); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  return { map, bump: new THREE.CanvasTexture(hgt) };
}

function Planet() {
  const group = useRef<THREE.Group>(null);
  const { map, bump } = useMemo(makeTextures, []);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.14; });
  return (
    <group rotation={[0.1, 0, 0.44]}>
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial map={map} bumpMap={bump} bumpScale={2.2} roughness={0.95} metalness={0} />
        </mesh>
      </group>
      <mesh scale={1.045}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshBasicMaterial color="#ff8a5c" transparent opacity={0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function MarsPlanet({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.4], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      aria-hidden
    >
      <ambientLight intensity={0.28} color="#ffb99a" />
      <directionalLight position={[5, 2.5, 4]} intensity={3.1} color="#fff0e0" />
      <directionalLight position={[-5, -1, -3]} intensity={0.35} color="#ff6a3d" />
      <Planet />
    </Canvas>
  );
}
