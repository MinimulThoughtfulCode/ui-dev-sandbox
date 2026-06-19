import type { CSSProperties, Dispatch, SetStateAction, MouseEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import type { SandboxSettings } from './Settings';

interface ShapeProps {
  shape: string;
  settings: SandboxSettings;
  setSettings: Dispatch<SetStateAction<SandboxSettings>>;
}

const Shape = ({ shape, settings, setSettings }: ShapeProps) => {

  // Position state for dragging
  // Position state for dragging (initialized to 0, will be centered on mount)
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Drag handling refs
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: MouseEvent<HTMLDivElement>) => {
    // Ignore if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: globalThis.MouseEvent) => {
    if (!dragRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    // Determine container size (canvas-workspace) and compute bounds based on top‑left origin
    const container = wrapperRef.current?.parentElement;
    const PADDING = 0; // no wrapper padding
    let minX = -PADDING, maxX = 0, minY = -PADDING, maxY = 0;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      // Maximum allowed top‑left position so shape stays within container
      maxX = Math.max(0, containerWidth - (settings.width + 2 * PADDING));
      maxY = Math.max(0, containerHeight - (settings.height + 2 * PADDING));
    }
    const newX = Math.min(Math.max(dragRef.current.origX + deltaX, minX), maxX);
    const newY = Math.min(Math.max(dragRef.current.origY + deltaY, minY), maxY);
    setPosition({ x: newX, y: newY });
  };

  // Center the shape on initial render and when size changes
  useEffect(() => {
    const container = wrapperRef.current?.parentElement;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const PADDING = 0; // no wrapper padding
      const initX = Math.max(0, (containerWidth - (settings.width + 2 * PADDING)) / 2);
      const initY = Math.max(0, (containerHeight - (settings.height + 2 * PADDING)) / 2);
      setPosition({ x: initX, y: initY });
    }
  }, [settings.width, settings.height]);

  const handleDragEnd = () => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    dragRef.current = null;
  };

  const getShapeStyle = (): CSSProperties => {
    const style: CSSProperties = {
      width: `${settings.width}px`,
      height: `${settings.height}px`,
      transition: 'box-shadow 0.15s ease, background 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      position: 'relative',
    };

    // 1. Fill style (solid or gradient)
    if (settings.fillType === 'solid') {
      style.backgroundColor = settings.backgroundColor;
    } else {
      style.background = settings.gradientType === 'linear'
        ? `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientColorStart}, ${settings.gradientColorEnd})`
        : `radial-gradient(circle, ${settings.gradientColorStart}, ${settings.gradientColorEnd})`;
    }

    // 2. Border style
    if (settings.borderWidth > 0 && settings.borderStyle !== 'none') {
      style.border = `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`;
      style.boxSizing = 'border-box';
    }

    // 3. Border Radius
    if (shape === 'box') {
      style.borderRadius = `${settings.borderRadiusTopLeft}px ${settings.borderRadiusTopRight}px ${settings.borderRadiusBottomRight}px ${settings.borderRadiusBottomLeft}px`;
    } else if (shape === 'circle') {
      style.borderRadius = '50%';
    }

    // 4. Clip Path shapes
    if (shape === 'triangle') {
      style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (shape === 'star') {
      style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    } else if (shape === 'hexagon') {
      style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    }

    // 5. Box Shadow
    if (settings.shadowEnabled) {
      const insetStr = settings.shadowInset ? ' inset' : '';
      style.boxShadow = `${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${settings.shadowSpread}px ${settings.shadowColor}${insetStr}`;
    }

    // 6. CSS Filters
    const filters: string[] = [];
    if (settings.filterBlur > 0) filters.push(`blur(${settings.filterBlur}px)`);
    if (settings.filterBrightness !== 100) filters.push(`brightness(${settings.filterBrightness}%)`);
    if (settings.filterContrast !== 100) filters.push(`contrast(${settings.filterContrast}%)`);
    if (settings.filterGrayscale > 0) filters.push(`grayscale(${settings.filterGrayscale}%)`);
    if (settings.filterHueRotate > 0) filters.push(`hue-rotate(${settings.filterHueRotate}deg)`);
    if (settings.filterInvert > 0) filters.push(`invert(${settings.filterInvert}%)`);
    if (settings.filterOpacity !== 100) filters.push(`opacity(${settings.filterOpacity}%)`);
    if (settings.filterSaturate !== 100) filters.push(`saturate(${settings.filterSaturate}%)`);
    if (settings.filterSepia > 0) filters.push(`sepia(${settings.filterSepia}%)`);
    if (filters.length > 0) {
      style.filter = filters.join(' ');
    }

    // 7. 3D Transforms
    const transforms: string[] = [];
    if (settings.rotateX !== 0) transforms.push(`rotateX(${settings.rotateX}deg)`);
    if (settings.rotateY !== 0) transforms.push(`rotateY(${settings.rotateY}deg)`);
    if (settings.rotateZ !== 0) transforms.push(`rotateZ(${settings.rotateZ}deg)`);
    if (settings.scale !== 1) transforms.push(`scale(${settings.scale})`);
    if (settings.skewX !== 0) transforms.push(`skewX(${settings.skewX}deg)`);
    if (settings.skewY !== 0) transforms.push(`skewY(${settings.skewY}deg)`);


    if (transforms.length > 0) {
      style.transform = settings.perspective > 0 
        ? `perspective(${settings.perspective}px) ${transforms.join(' ')}`
        : transforms.join(' ');
    }

    return style;
  };

  // Drag to resize handler
  const handleResizeStart = (e: MouseEvent<HTMLDivElement>, direction: 'br' | 'r' | 'b') => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = settings.width;
    const startHeight = settings.height;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setSettings((prev) => {
        const updated = { ...prev };
        // Calculate container bounds to prevent overflow during resize
        const container = wrapperRef.current?.parentElement;
        const PADDING = 0; // no wrapper padding
        let maxWidth = 450;
        let maxHeight = 450;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          // Max size so that shape plus padding stays within container based on current position
          const maxPossibleWidth = Math.max(60, containerWidth - position.x - 2 * PADDING);
          const maxPossibleHeight = Math.max(60, containerHeight - position.y - 2 * PADDING);
          maxWidth = maxPossibleWidth;
          maxHeight = maxPossibleHeight;
        }
        if (direction === 'br' || direction === 'r') {
          updated.width = Math.max(60, Math.min(maxWidth, startWidth + deltaX));
        }
        if (direction === 'br' || direction === 'b') {
          updated.height = Math.max(60, Math.min(maxHeight, startHeight + deltaY));
        }
        return updated;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

    const wrapperStyle: CSSProperties = { transform: `translate(${position.x}px, ${position.y}px)` };
    return (
      <div className="shape-interactive-wrapper" style={wrapperStyle} ref={wrapperRef}>
      {/* Target Shape rendering */}
      <div 
        className="shape-preview-element" 
        style={getShapeStyle()}
        onMouseDown={handleDragStart}
      >
        {settings.textEnabled && (
          <span 
            style={{
              color: settings.textColor,
              fontSize: `${settings.fontSize}px`,
              fontWeight: 600,
              pointerEvents: 'none',
              padding: '10px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            {settings.textContent}
          </span>
        )}
      </div>

      {/* Resize Interactive Handles overlay */}
      <div 
        className="resize-handle r" 
        onMouseDown={(e) => handleResizeStart(e, 'r')}
        title="Resize Width"
        role="slider"
        aria-label="Resize Width"
        aria-valuemin={60}
        aria-valuemax={450}
        aria-valuenow={settings.width}
      />
      <div 
        className="resize-handle b" 
        onMouseDown={(e) => handleResizeStart(e, 'b')}
        title="Resize Height"
        role="slider"
        aria-label="Resize Height"
        aria-valuemin={60}
        aria-valuemax={450}
        aria-valuenow={settings.height}
      />
      <div 
        className="resize-handle br" 
        onMouseDown={(e) => handleResizeStart(e, 'br')}
        title="Resize Both Width and Height"
        role="slider"
        aria-label="Resize Both Width and Height"
      />
    </div>
  );
};

export default Shape;
