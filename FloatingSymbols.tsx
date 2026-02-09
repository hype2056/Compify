import React, { useEffect, useRef, useState } from '.react';

interface Shape {
  id: number;
  x: number;
  y: number;
  size: number;
  symbol: string;
  baseSpeed: number;
  rotateX: number;
  rotateY: number;
  color1: string;
  color2: string;
}

const CONFIGS: Omit<Shape, 'id' | 'baseSpeed' | 'rotateX' | 'rotateY'>[] = [
  { x: 6,  y: 12, size: 160, symbol: '=',  color1: 'rgba(99, 102, 241, 0.15)',  color2: 'rgba(168, 85, 247, 0.08)' },
  { x: 78, y: 8,  size: 140, symbol: '+',  color1: 'rgba(34, 211, 238, 0.15)',  color2: 'rgba(59, 130, 246, 0.08)' },
  { x: 82, y: 62, size: 150, symbol: '×',  color1: 'rgba(244, 114, 182, 0.15)', color2: 'rgba(251, 146, 60, 0.08)' },
  { x: 10, y: 68, size: 170, symbol: '÷',  color1: 'rgba(52, 211, 153, 0.15)',  color2: 'rgba(34, 211, 238, 0.08)' },
];

const FloatingSymbols: React.FC = () => {
  const [shapes] = useState<Shape[]>(() =>
    CONFIGS.map((c, i) => ({
      id: i,
      ...c,
      baseSpeed: 0.25 + i * 0.06,
      rotateX: i * 90,
      rotateY: i * 60,
    }))
  );
  const mouseRef = useRef({ x: -1, y: -1 });
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<number>(0);
  const rotationsRef = useRef(shapes.map(s => ({ x: s.rotateX, y: s.rotateY })));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const mouse = mouseRef.current;

      shapes.forEach((shape, i) => {
        const el = shapesRef.current[i];
        if (!el) return;

        const rot = rotationsRef.current[i];
        const dx = (shape.x / 100) - mouse.x;
        const dy = (shape.y / 100) - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const proximity = Math.max(0, 1 - dist / 0.35);
        const speed = shape.baseSpeed * (1 + proximity * 5);

        rot.x += speed * 0.5;
        rot.y += speed * 0.7;

        el.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animRef.current);
    };
  }, [shapes]);

  const face = (c1: string, c2: string): React.CSSProperties => ({
    position: 'absolute',
    background: `linear-gradient(135deg, ${c1}, ${c2})`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
  });

  // Builds a fully-extruded 3D box (6 faces) at position (cx, cy) within parent of size s
  const buildBox = (
    c1: string, c2: string,
    cx: number, cy: number, // center position relative to parent
    w: number, h: number, d: number, // width, height, depth (half-depth used for translateZ)
    br: number, // border-radius
    extraTransform?: string // optional pre-transform (e.g. rotateZ for diagonal bars)
  ): React.ReactNode[] => {
    const f = face(c1, c2);
    const hd = d / 2;
    const pre = extraTransform ? extraTransform + ' ' : '';
    const left = cx - w / 2;
    const top = cy - h / 2;

    return [
      // Front face
      <div key={`f`} style={{ ...f, width: w, height: h, left, top, transform: `${pre}translateZ(${hd}px)`, borderRadius: br }} />,
      // Back face
      <div key={`b`} style={{ ...f, width: w, height: h, left, top, transform: `${pre}translateZ(${-hd}px)`, borderRadius: br }} />,
      // Right side
      <div key={`r`} style={{ ...f, width: d, height: h, left: cx - d / 2, top, transform: `${pre}translateX(${w / 2}px) rotateY(90deg)`, borderRadius: br }} />,
      // Left side
      <div key={`l`} style={{ ...f, width: d, height: h, left: cx - d / 2, top, transform: `${pre}translateX(${-w / 2}px) rotateY(90deg)`, borderRadius: br }} />,
      // Top side
      <div key={`t`} style={{ ...f, width: w, height: d, left, top: cy - d / 2, transform: `${pre}translateY(${-h / 2}px) rotateX(90deg)`, borderRadius: br }} />,
      // Bottom side
      <div key={`bt`} style={{ ...f, width: w, height: d, left, top: cy - d / 2, transform: `${pre}translateY(${h / 2}px) rotateX(90deg)`, borderRadius: br }} />,
    ];
  };

  const renderEquals = (s: number, c1: string, c2: string) => {
    const barH = s * 0.18, barW = s * 0.7, depth = s * 0.3, gap = s * 0.14, br = barH / 3;
    const cx = s / 2;
    return (
      <>
        {buildBox(c1, c2, cx, s / 2 - barH / 2 - gap / 2, barW, barH, depth, br).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `t${i}` }))}
        {buildBox(c1, c2, cx, s / 2 + barH / 2 + gap / 2, barW, barH, depth, br).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `b${i}` }))}
      </>
    );
  };

  const renderPlus = (s: number, c1: string, c2: string) => {
    const barH = s * 0.18, barW = s * 0.7, depth = s * 0.3, br = barH / 3;
    const cx = s / 2, cy = s / 2;
    return (
      <>
        {buildBox(c1, c2, cx, cy, barW, barH, depth, br).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `h${i}` }))}
        {buildBox(c1, c2, cx, cy, barH, barW, depth, br).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `v${i}` }))}
      </>
    );
  };

  const renderMultiply = (s: number, c1: string, c2: string) => {
    const barH = s * 0.16, barW = s * 0.75, depth = s * 0.24, br = barH / 3;
    const cx = s / 2, cy = s / 2;
    return (
      <>
        {buildBox(c1, c2, cx, cy, barW, barH, depth, br, 'rotateZ(45deg)').map((el, i) => React.cloneElement(el as React.ReactElement, { key: `d1${i}` }))}
        {buildBox(c1, c2, cx, cy, barW, barH, depth, br, 'rotateZ(-45deg)').map((el, i) => React.cloneElement(el as React.ReactElement, { key: `d2${i}` }))}
      </>
    );
  };

  const renderDivide = (s: number, c1: string, c2: string) => {
    const barH = s * 0.16, barW = s * 0.6, dotSize = s * 0.17, depth = s * 0.24, br = barH / 3;
    const cx = s / 2;
    return (
      <>
        {buildBox(c1, c2, cx, s / 2, barW, barH, depth, br).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `bar${i}` }))}
        {buildBox(c1, c2, cx, s / 2 - barH - dotSize * 0.8, dotSize, dotSize, depth, dotSize / 2).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `td${i}` }))}
        {buildBox(c1, c2, cx, s / 2 + barH + dotSize * 0.8, dotSize, dotSize, depth, dotSize / 2).map((el, i) => React.cloneElement(el as React.ReactElement, { key: `bd${i}` }))}
      </>
    );
  };

  const renderers: Record<string, (s: number, c1: string, c2: string) => React.ReactNode> = {
    '=': renderEquals,
    '+': renderPlus,
    '×': renderMultiply,
    '÷': renderDivide,
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {shapes.map((shape, i) => (
        <div
          key={shape.id}
          style={{
            position: 'absolute',
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            perspective: '600px',
          }}
        >
          <div
            ref={el => { shapesRef.current[i] = el; }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {renderers[shape.symbol]?.(shape.size, shape.color1, shape.color2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingSymbols;
