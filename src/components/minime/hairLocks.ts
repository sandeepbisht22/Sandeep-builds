import { BufferAttribute, BufferGeometry, CatmullRomCurve3, TubeGeometry, Vector3 } from "three";

export type Point = readonly [number, number, number];

/** One lock of hair: a tube along a smooth curve that narrows from root to tip. */
export interface LockSpec {
  points: readonly Point[];
  /** Radius at the root. */
  radius: number;
  /** Tip radius as a fraction of the root radius. */
  tip?: number;
  /** Radius at the very root as a fraction, growing to full within ROOT_GROWTH of the length; closes the tube's open end. */
  root?: number;
  /** Thickness kept along the head's normal (the head centre is the origin): 1 = round, 0.4 = a ribbon lying flat. */
  flat?: number;
}

const DEFAULT_TIP = 0.2;
const ROOT_GROWTH = 0.18;

const smoothstep = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Radius multiplier along the lock: grows out of the root, then narrows to the tip. */
function profile(t: number, tip: number, root: number): number {
  const taper = 1 - (1 - tip) * Math.pow(t, 1.3);
  return taper * (root + (1 - root) * smoothstep(t / ROOT_GROWTH));
}

/** A tapered tube along `spec.points`, optionally flattened against the head. */
export function lockGeometry(spec: LockSpec, tubular = 24, radial = 8): TubeGeometry {
  if (spec.points.length < 2) throw new Error("A hair lock needs at least two points");
  if (spec.flat !== undefined && (spec.flat <= 0 || spec.flat > 1)) throw new Error("A hair lock's flat must be in (0, 1]");
  const curve = new CatmullRomCurve3(
    spec.points.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    "centripetal",
  );
  const geometry = new TubeGeometry(curve, tubular, spec.radius, radial, false);
  const position = geometry.getAttribute("position");
  const shading = geometry.getAttribute("normal");
  const tip = spec.tip ?? DEFAULT_TIP;
  const root = spec.root ?? 1;
  const flat = spec.flat ?? 1;
  const squash = 1 - flat;
  // Normals take the inverse of the squash so a flattened lock still shades like a ribbon.
  const stretch = 1 / flat - 1;
  const centre = new Vector3();
  const normal = new Vector3();
  const offset = new Vector3();
  const shade = new Vector3();
  // TubeGeometry samples ring i at getPointAt(i / tubular), with radial + 1 vertices per ring.
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, centre);
    normal.copy(centre).normalize();
    const scale = profile(t, tip, root);
    for (let j = 0; j <= radial; j++) {
      const index = i * (radial + 1) + j;
      offset.fromBufferAttribute(position, index).sub(centre).multiplyScalar(scale);
      offset.addScaledVector(normal, -squash * offset.dot(normal));
      position.setXYZ(index, centre.x + offset.x, centre.y + offset.y, centre.z + offset.z);
      if (squash > 0) {
        shade.fromBufferAttribute(shading, index);
        shade.addScaledVector(normal, stretch * shade.dot(normal)).normalize();
        shading.setXYZ(index, shade.x, shade.y, shade.z);
      }
    }
  }
  position.needsUpdate = true;
  shading.needsUpdate = true;
  return geometry;
}

/** All locks as one geometry, so the whole head of hair is a single draw call. */
export function mergeLocks(specs: readonly LockSpec[], tubular = 24, radial = 8): BufferGeometry {
  const parts = specs.map((spec) => lockGeometry(spec, tubular, radial));
  const vertexCount = parts.reduce((sum, part) => sum + part.getAttribute("position").count, 0);
  const indexCount = parts.reduce((sum, part) => sum + (part.getIndex()?.count ?? 0), 0);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint32Array(indexCount);

  let vertexOffset = 0;
  let indexOffset = 0;
  for (const part of parts) {
    const count = part.getAttribute("position").count;
    positions.set(part.getAttribute("position").array as Float32Array, vertexOffset * 3);
    normals.set(part.getAttribute("normal").array as Float32Array, vertexOffset * 3);
    uvs.set(part.getAttribute("uv").array as Float32Array, vertexOffset * 2);
    const index = part.getIndex();
    if (index) {
      for (let k = 0; k < index.count; k++) indices[indexOffset + k] = index.getX(k) + vertexOffset;
      indexOffset += index.count;
    }
    vertexOffset += count;
    part.dispose();
  }

  const merged = new BufferGeometry();
  merged.setAttribute("position", new BufferAttribute(positions, 3));
  merged.setAttribute("normal", new BufferAttribute(normals, 3));
  merged.setAttribute("uv", new BufferAttribute(uvs, 2));
  merged.setIndex(new BufferAttribute(indices, 1));
  merged.computeBoundingSphere();
  return merged;
}
