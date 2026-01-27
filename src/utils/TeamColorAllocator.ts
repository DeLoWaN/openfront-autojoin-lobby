import seedrandom from 'seedrandom';

import {
  FALLBACK_COLORS,
  HUMAN_COLORS,
  TEAM_BASE_COLORS,
  type RGB,
} from '@/config/clanColors';

export type Lab = { l: number; a: number; b: number };

export function rgbToCss(rgb: RGB): string {
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

export function rgbaToCss(rgb: RGB, alpha: number): string {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

class PseudoRandom {
  private rng: seedrandom.PRNG;

  constructor(seed: number) {
    this.rng = seedrandom(String(seed));
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min)) + min;
  }
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToXyz(rgb: RGB): { x: number; y: number; z: number } {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  return { x: x * 100, y: y * 100, z: z * 100 };
}

function xyzToLab(xyz: { x: number; y: number; z: number }): Lab {
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let x = xyz.x / refX;
  let y = xyz.y / refY;
  let z = xyz.z / refZ;

  const delta = 6 / 29;
  const delta3 = delta * delta * delta;

  const f = (t: number) =>
    t > delta3 ? Math.cbrt(t) : t / (3 * delta * delta) + 4 / 29;

  x = f(x);
  y = f(y);
  z = f(z);

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
}

function rgbToLab(rgb: RGB): Lab {
  return xyzToLab(rgbToXyz(rgb));
}

function deltaE2000(lab1: Lab, lab2: Lab): number {
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  const avgLp = (L1 + L2) / 2;
  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (c1 + c2) / 2;

  const g =
    0.5 *
    (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));

  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;

  const c1p = Math.sqrt(a1p * a1p + b1 * b1);
  const c2p = Math.sqrt(a2p * a2p + b2 * b2);

  const avgCp = (c1p + c2p) / 2;

  const h1p = Math.atan2(b1, a1p) * (180 / Math.PI);
  const h2p = Math.atan2(b2, a2p) * (180 / Math.PI);

  const h1pMod = h1p < 0 ? h1p + 360 : h1p;
  const h2pMod = h2p < 0 ? h2p + 360 : h2p;

  let deltahp = h2pMod - h1pMod;
  if (Math.abs(deltahp) > 180) {
    deltahp += deltahp > 0 ? -360 : 360;
  }

  const deltaLp = L2 - L1;
  const deltaCp = c2p - c1p;
  const deltaHp =
    2 * Math.sqrt(c1p * c2p) * Math.sin((deltahp * Math.PI) / 360);

  let avgHp = 0;
  if (c1p * c2p === 0) {
    avgHp = h1pMod + h2pMod;
  } else if (Math.abs(h1pMod - h2pMod) > 180) {
    avgHp = (h1pMod + h2pMod + 360) / 2;
  } else {
    avgHp = (h1pMod + h2pMod) / 2;
  }

  const t =
    1 -
    0.17 * Math.cos(((avgHp - 30) * Math.PI) / 180) +
    0.24 * Math.cos(((2 * avgHp) * Math.PI) / 180) +
    0.32 * Math.cos(((3 * avgHp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * avgHp - 63) * Math.PI) / 180);

  const deltaRo = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2));
  const rc =
    2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));

  const sl = 1 + (0.015 * Math.pow(avgLp - 50, 2)) / Math.sqrt(20 + Math.pow(avgLp - 50, 2));
  const sc = 1 + 0.045 * avgCp;
  const sh = 1 + 0.015 * avgCp * t;

  const rt = -Math.sin((2 * deltaRo * Math.PI) / 180) * rc;

  const kl = 1;
  const kc = 1;
  const kh = 1;

  const deltaE =
    Math.sqrt(
      Math.pow(deltaLp / (sl * kl), 2) +
        Math.pow(deltaCp / (sc * kc), 2) +
        Math.pow(deltaHp / (sh * kh), 2) +
        rt * (deltaCp / (sc * kc)) * (deltaHp / (sh * kh))
    );

  return deltaE;
}

function minDeltaE(candidate: RGB, assigned: RGB[]): number {
  const labCandidate = rgbToLab(candidate);
  let min = Infinity;
  for (const color of assigned) {
    const delta = deltaE2000(labCandidate, rgbToLab(color));
    if (delta < min) {
      min = delta;
    }
  }
  return min;
}

function selectDistinctColorIndex(available: RGB[], assigned: RGB[]): number {
  let maxDelta = -Infinity;
  let maxIndex = 0;

  for (let i = 0; i < available.length; i++) {
    const delta = minDeltaE(available[i]!, assigned);
    if (delta > maxDelta) {
      maxDelta = delta;
      maxIndex = i;
    }
  }

  return maxIndex;
}

export class ColorAllocator {
  private baseColors: RGB[];
  private availableColors: RGB[];
  private fallbackColors: RGB[];
  private assigned = new Map<string, RGB>();

  constructor(colors: RGB[], fallback: RGB[]) {
    this.baseColors = [...colors];
    this.availableColors = [...colors];
    this.fallbackColors = [...colors, ...fallback];
  }

  reset(): void {
    this.availableColors = [...this.baseColors];
    this.assigned.clear();
  }

  assignColor(id: string): RGB {
    if (this.assigned.has(id)) {
      return this.assigned.get(id)!;
    }

    if (this.availableColors.length === 0) {
      this.availableColors = [...this.fallbackColors];
    }

    let selectedIndex = 0;

    if (this.assigned.size === 0 || this.assigned.size > 50) {
      const rand = new PseudoRandom(simpleHash(id));
      selectedIndex = rand.nextInt(0, this.availableColors.length);
    } else {
      const assignedColors = Array.from(this.assigned.values());
      selectedIndex = selectDistinctColorIndex(this.availableColors, assignedColors);
    }

    const color = this.availableColors.splice(selectedIndex, 1)[0]!;
    this.assigned.set(id, color);
    return color;
  }
}

export class TeamColorAllocator {
  private teamAllocator: ColorAllocator;

  constructor() {
    this.teamAllocator = new ColorAllocator(HUMAN_COLORS, FALLBACK_COLORS);
  }

  reset(): void {
    this.teamAllocator.reset();
  }

  getTeamColor(team: string): RGB {
    const baseColor = TEAM_BASE_COLORS[team as keyof typeof TEAM_BASE_COLORS];
    if (baseColor) {
      return baseColor;
    }
    return this.teamAllocator.assignColor(team);
  }

  getTeamColorMap(teams: string[]): Map<string, RGB> {
    const map = new Map<string, RGB>();
    for (const team of teams) {
      map.set(team, this.getTeamColor(team));
    }
    return map;
  }
}

export const DEFAULT_TEAM_COLOR_ALLOCATOR = new TeamColorAllocator();
export const DEFAULT_CLAN_COLOR_ALLOCATOR = new ColorAllocator(HUMAN_COLORS, FALLBACK_COLORS);
