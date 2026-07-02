// Partes faciales compartidas entre avatares. Solo primitivas + flatShading
// (regla de DESIGN_SYSTEM.md → Low-poly 3D / Avatares).

export function Eyes({
  y = 0.68,
  x = 0.26,
  z = 0.48,
  size = 0.09,
}: {
  y?: number;
  x?: number;
  z?: number;
  size?: number;
}) {
  return (
    <>
      {[-x, x].map((ex) => (
        <mesh key={ex} position={[ex, y, z]}>
          <icosahedronGeometry args={[size, 0]} />
          <meshStandardMaterial color="#0d0d0d" flatShading />
        </mesh>
      ))}
    </>
  );
}

export function Glasses({ y = 0.66, z = 0.52 }: { y?: number; z?: number }) {
  return (
    <group position={[0, y, z]}>
      {[-0.27, 0.27].map((gx) => (
        <group key={gx} position={[gx, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.36, 0.3, 0.06]} />
            <meshStandardMaterial color="#0d0d0d" flatShading />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[0.28, 0.22, 0.03]} />
            <meshStandardMaterial color="#d9e4ec" flatShading />
          </mesh>
        </group>
      ))}
      <mesh>
        <boxGeometry args={[0.2, 0.06, 0.06]} />
        <meshStandardMaterial color="#0d0d0d" flatShading />
      </mesh>
    </group>
  );
}

export function Mouth({
  y = 0.24,
  z = 0.48,
  width = 0.32,
}: {
  y?: number;
  z?: number;
  width?: number;
}) {
  return (
    <mesh position={[0, y, z]}>
      <boxGeometry args={[width, 0.08, 0.05]} />
      <meshStandardMaterial color="#0d0d0d" flatShading />
    </mesh>
  );
}
