'use client';
import Link from 'next/link';
import { useMemo } from 'react';

type Point = {
  id: string;
  slug: string;
  title: string;
  artifactNumber: number;
  shippedAt: string | null;
};

const WIDTH = 800;
const HEIGHT = 480;

/**
 * Lay out points as a quiet, non-grid star chart.
 *
 * A deterministic pseudo-random scatter seeded by artifact number. We use a
 * stable hash so the position is the same on every render — no flickering, no
 * jiggling, no marketing-grade motion.
 */
function layout(points: Point[]): Array<Point & { x: number; y: number }> {
  return points.map((p) => {
    const seed = (p.artifactNumber * 9301 + 49297) % 233280;
    const rx = (seed / 233280) % 1;
    const ry = ((seed * 1103515245 + 12345) >>> 0) / 0xffffffff;
    const x = 80 + rx * (WIDTH - 160);
    const y = 80 + ry * (HEIGHT - 160);
    return { ...p, x, y };
  });
}

export function ConstellationMap({ points }: { points: Point[] }) {
  const laid = useMemo(() => layout(points), [points]);

  // Draw very faint lines between adjacent artifact numbers — implies lineage.
  const lines = laid.slice(1).map((p, i) => {
    const prev = laid[i]!;
    return { x1: prev.x, y1: prev.y, x2: p.x, y2: p.y };
  });

  return (
    <div className="rounded-xl border border-edge card-quiet overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full h-auto"
        role="img"
        aria-label="The AhTohMoh artifact constellation."
      >
        <rect width={WIDTH} height={HEIGHT} fill="#141414" />
        {/* Subtle backdrop dots — atmospheric, not decorative. */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = (i * 9301 + 49297) % WIDTH;
          const y = ((i * 1103515245 + 12345) >>> 0) % HEIGHT;
          return <circle key={`bg-${i}`} cx={x} cy={y} r={0.5} fill="#2A2A2A" />;
        })}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#3A3A3A"
            strokeWidth={0.5}
            strokeDasharray="2 4"
          />
        ))}
        {laid.map((p) => (
          <g key={p.id}>
            <Link href={`/projects/${p.slug}`}>
              <g className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={5} fill="#E8C547" />
                <circle cx={p.x} cy={p.y} r={12} fill="#E8C547" opacity={0.15} />
                <text
                  x={p.x + 14}
                  y={p.y + 4}
                  className="text-xs"
                  fill="#F5F5F5"
                  fontFamily="ui-monospace, monospace"
                  fontSize={11}
                >
                  · {String(p.artifactNumber).padStart(3, '0')}
                </text>
                <text
                  x={p.x + 14}
                  y={p.y + 18}
                  fill="#A8A8A8"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={11}
                >
                  {p.title}
                </text>
              </g>
            </Link>
          </g>
        ))}
      </svg>
    </div>
  );
}
