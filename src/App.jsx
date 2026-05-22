import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo } from "react";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// ─── Detect mobile ────────────────────────────────────────────────
const isMobile = () => window.innerWidth < 768;

// ─── Desktop scroll phases (unchanged) ───────────────────────────
const PHASES = {
  SPIN_ONLY_END:     700,
  SHRINK_END:        1500,
  CUBES_START:       1900,
  STAGGER:           220,
  SOCIALS_OUT_START: 3000,
  SOCIALS_OUT_END:   3600,
  EMBED_START:       4200,
  EMBED_END:         4800,
  TOTAL_HEIGHT:      6000,
};

// ─── Socials ──────────────────────────────────────────────────────
const SOCIALS = [
  { model: "/models/instagram_logo.glb", url: "https://instagram.com" },
  { model: "/models/beatstars_logo.glb", url: "https://beatstars.com" },
  { model: "/models/email_logo.glb",     url: "mailto:your@email.com" },
];

// ─── Chrome material ──────────────────────────────────────────────
const chromeMat = new THREE.MeshPhysicalMaterial({
  metalness: 1,
  roughness: 0,
  color: new THREE.Color("white"),
  envMapIntensity: 2.5,
});

// ═══════════════════════════════════════════════════════════════════
// MOBILE COMPONENTS (your working version, untouched)
// ═══════════════════════════════════════════════════════════════════

function SocialLogo({ position, modelPath, scaleBase, onClick }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);

  const normalized = useMemo(() => {
    const obj = scene.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    obj.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    obj.scale.setScalar(1 / maxDim);
    obj.traverse((child) => {
      if (child.isMesh) child.material = chromeMat;
    });
    return obj;
  }, [scene]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.x += 0.004;
    }
  });

  return (
    <group ref={ref} position={position} scale={[scaleBase, scaleBase, scaleBase]} onClick={onClick}>
      <primitive object={normalized} />
    </group>
  );
}

function LogosScene({ onCubeClick }) {
  const mobile = isMobile();
  const spacing = mobile ? 1 : 1.3;
  const scaleBase = mobile ? 0.75 : 1;
  const startX = -((SOCIALS.length - 1) * spacing) / 2;

  return (
    <>
      {SOCIALS.map((s, i) => (
        <SocialLogo
          key={i}
          modelPath={s.model}
          position={[startX + i * spacing, 0, 0]}
          scaleBase={scaleBase}
          onClick={() => onCubeClick(s.url)}
        />
      ))}
    </>
  );
}

function MobileSite() {
  const [logoToggle, setLogoToggle] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLogoToggle((p) => !p), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      overflow: "hidden",
      position: "fixed",
      inset: 0,
      background: "black",
    }}>
      {/* BACKGROUND */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: 'url("/BG.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0,
      }} />

      {/* LOGO */}
      <img
        src={logoToggle ? "/logo1.png" : "/logo2.png"}
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "180px",
          zIndex: 10,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* TEXT */}
      <div style={{
        position: "absolute",
        top: "130px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "white",
        fontSize: "13px",
        letterSpacing: "2px",
        opacity: 0.7,
        zIndex: 10,
        textAlign: "center",
        width: "90%",
      }}>
        open on desktop for full site
      </div>

      {/* SOCIALS */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}
          style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <Environment preset="park" />
          <LogosScene onCubeClick={(url) => window.open(url, "_blank")} />
        </Canvas>
      </div>

      {/* FOOTER */}
      <div style={{
        position: "absolute",
        bottom: "30px",
        width: "100%",
        textAlign: "center",
        fontSize: "12px",
        letterSpacing: "2px",
        color: "white",
        opacity: 0.6,
        zIndex: 10,
      }}>
        made by FERA
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DESKTOP COMPONENTS (original, untouched)
// ═══════════════════════════════════════════════════════════════════

// ─── Desktop-only social logo (with pop/disappear animation) ──────
function DesktopSocialLogo({ position, popProgress, disappearProgress, modelPath, scaleBase, onClick }) {
  const ref = useRef();
  const { scene } = useGLTF(modelPath);

  const normalized = useMemo(() => {
    const obj = scene.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    obj.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    obj.scale.setScalar(1 / maxDim);
    obj.traverse((child) => {
      if (child.isMesh) child.material = chromeMat;
    });
    return obj;
  }, [scene]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.x += 0.004;
    }
  });

  let s = 0;
  if (popProgress > 0) {
    s = popProgress < 0.7
      ? (popProgress / 0.7) * 1.2
      : 1.2 - ((popProgress - 0.7) / 0.3) * 0.2;
  }
  if (disappearProgress > 0) s *= 1 - disappearProgress;
  s *= scaleBase;

  return (
    <group ref={ref} position={position} scale={[s, s, s]} onClick={onClick}>
      <primitive object={normalized} />
    </group>
  );
}

function DesktopLogosScene({ cubeProgresses, disappearProgress, onCubeClick }) {
  const startX = -((SOCIALS.length - 1) * 1.3) / 2;
  return (
    <>
      {SOCIALS.map((s, i) => (
        <DesktopSocialLogo
          key={i}
          modelPath={s.model}
          position={[startX + i * 1.3, 0, 0]}
          popProgress={cubeProgresses[i]}
          disappearProgress={disappearProgress}
          scaleBase={1}
          onClick={() => onCubeClick(s.url)}
        />
      ))}
    </>
  );
}

function Model() {
  const ref = useRef();
  const { scene } = useGLTF("/models/model.glb");
  const velocity = useRef(0);
  const lastScroll = useRef(0);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) child.material = chromeMat;
    });
    const handleScroll = () => {
      const sy = window.scrollY;
      const delta = sy - lastScroll.current;
      lastScroll.current = sy;
      velocity.current += delta * 0.0008;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scene]);

  useEffect(() => {
    let id;
    const animate = () => {
      if (ref.current) {
        ref.current.rotation.y += 0.002;
        ref.current.rotation.y += velocity.current;
        velocity.current *= 0.92;
        const sy = window.scrollY;
        let scale = 0.28;
        let posY = 0;
        if (sy > PHASES.SPIN_ONLY_END) {
          const t = Math.min(
            (sy - PHASES.SPIN_ONLY_END) / (PHASES.SHRINK_END - PHASES.SPIN_ONLY_END),
            1
          );
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          scale = 0.28 * (1 - eased * 0.85);
          posY = eased * 3.5;
        }
        ref.current.scale.setScalar(scale);
        ref.current.position.y = posY;
      }
      id = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

function DesktopSite() {
  const [logoToggle, setLogoToggle] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  const cubeProgresses = SOCIALS.map((_, i) => {
    const start = PHASES.CUBES_START + i * PHASES.STAGGER;
    return clamp((scrollY - start) / 500, 0, 1);
  });

  const disappearProgress = clamp(
    (scrollY - PHASES.SOCIALS_OUT_START) / (PHASES.SOCIALS_OUT_END - PHASES.SOCIALS_OUT_START),
    0, 1
  );

  const embedProgress = clamp(
    (scrollY - PHASES.EMBED_START) / (PHASES.EMBED_END - PHASES.EMBED_START),
    0, 1
  );

  const anyCubeVisible = cubeProgresses[0] > 0 && disappearProgress < 1;

  useEffect(() => {
    const id = setInterval(() => setLogoToggle((p) => !p), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      minHeight: `${PHASES.TOTAL_HEIGHT}px`,
      overflowX: "hidden",
      backgroundImage: 'url("/BG.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      WebkitOverflowScrolling: "touch",
    }}>
      {/* LOGO */}
      <img
        src={logoToggle ? "/logo1.png" : "/logo2.png"}
        style={{
          position: "fixed",
          top: "1px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "260px",
          zIndex: 20,
          pointerEvents: "none",
        }}
      />

      {/* MAIN CANVAS */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        events={false}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          touchAction: "auto",
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Environment preset="studio" />
        <Model />
      </Canvas>

      {/* SOCIALS */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 6,
        pointerEvents: anyCubeVisible ? "auto" : "none",
        touchAction: "auto",
        opacity: anyCubeVisible ? 1 : 0,
      }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}
          style={{ width: "100%", height: "100%" }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <Environment preset="park" />
          <DesktopLogosScene
            cubeProgresses={cubeProgresses}
            disappearProgress={disappearProgress}
            onCubeClick={(url) => window.open(url, "_blank")}
          />
        </Canvas>
      </div>

      {/* EMBED */}
      <div style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: `
          translate(-50%, -50%)
          translateY(${(1 - embedProgress) * 120}px)
          scale(${0.9 + embedProgress * 0.1})
        `,
        width: "90%",
        maxWidth: "900px",
        opacity: embedProgress,
        pointerEvents: embedProgress > 0.1 ? "auto" : "none",
        zIndex: 10,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: `0px 30px 80px rgba(0,0,0,${0.15 + embedProgress * 0.25})`,
      }}>
        <iframe
          src="https://untitled.stream/embed/mfatSJg8Dk4U"
          style={{ width: "100%", height: "344px", border: "none", display: "block" }}
          allowFullScreen
          allow="picture-in-picture"
        />
      </div>

      {/* FOOTER */}
      <div style={{
        position: "absolute",
        bottom: "40px",
        width: "100%",
        textAlign: "center",
        fontSize: "14px",
        letterSpacing: "2px",
        color: "white",
        opacity: 0.7,
      }}>
        made by FERA
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════<
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  return isMobile() ? <MobileSite /> : <DesktopSite />;
}