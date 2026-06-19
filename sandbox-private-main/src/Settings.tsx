import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';


import { HexColorPicker } from 'react-colorful';
import {
  Square,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star,
  Hexagon,
  Copy,
  Check,
  Sparkles,
  Type,
  Move,
  Layout,
  Sliders,
  Maximize2,
  Palette
} from 'lucide-react';

export interface SandboxSettings {
  // Dimensions
  width: number;
  height: number;

  // Fill
  fillType: 'solid' | 'gradient';
  backgroundColor: string;
  gradientType: 'linear' | 'radial';
  gradientAngle: number;
  gradientColorStart: string;
  gradientColorEnd: string;

  // Borders
  borderWidth: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor: string;

  // Border Radius
  borderRadiusTopLeft: number;
  borderRadiusTopRight: number;
  borderRadiusBottomLeft: number;
  borderRadiusBottomRight: number;

  // Shadows
  shadowEnabled: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  shadowInset: boolean;

  // 3D Transforms
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  skewX: number;
  skewY: number;
  perspective: number;

  // Filters
  filterBlur: number;
  filterBrightness: number;
  filterContrast: number;
  filterGrayscale: number;
  filterHueRotate: number;
  filterInvert: number;
  filterOpacity: number;
  filterSaturate: number;
  filterSepia: number;

  // Content Text
  textEnabled: boolean;
  textContent: string;
  textColor: string;
  fontSize: number;
}

interface SettingsProps {
  shape: string;
  setShape: Dispatch<SetStateAction<string>>;
  settings: SandboxSettings;
  setSettings: Dispatch<SetStateAction<SandboxSettings>>;
  activeTab: 'shape' | 'fill' | 'shadows' | 'filters' | 'presets';
  presets: Record<string, { label: string; shape: string; settings: SandboxSettings }>;
  onSelectPreset: (presetKey: string) => void;
}

const Settings = ({
  shape,
  setShape,
  settings,
  setSettings,
  activeTab,
  presets,
  onSelectPreset
}: SettingsProps) => {
  const [activeColorProp, setActiveColorProp] = useState<'bg' | 'gradStart' | 'gradEnd' | 'border' | 'shadow' | 'text'>('bg');
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'react'>('css');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Reset activeColorProp when switching tabs or fill type
  useEffect(() => {
    if (activeTab === 'fill') {
      setActiveColorProp(settings.fillType === 'solid' ? 'bg' : 'gradStart');
    } else if (activeTab === 'shadows') {
      setActiveColorProp('shadow');
    } else if (activeTab === 'filters') {
      // keep current for text color or other filters
    }
  }, [activeTab, settings.fillType]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'range' || e.target.classList.contains('number-input')) {
      parsedValue = Number(value);
    }

    setSettings((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const showCopyToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setCopied(true);
    setTimeout(() => {
      setShowToast(false);
      setCopied(false);
    }, 2000);
  };

  // Helper to resolve color picker binding
  const getActiveColor = (): string => {
    switch (activeColorProp) {
      case 'gradStart': return settings.gradientColorStart;
      case 'gradEnd': return settings.gradientColorEnd;
      case 'border': return settings.borderColor;
      case 'shadow': return settings.shadowColor.startsWith('rgba') ? '#000000' : settings.shadowColor;
      case 'text': return settings.textColor;
      case 'bg':
      default: return settings.backgroundColor;
    }
  };

  const handleColorChange = (color: string) => {
    setSettings((prev) => {
      switch (activeColorProp) {
        case 'bg': return { ...prev, backgroundColor: color };
        case 'gradStart': return { ...prev, gradientColorStart: color };
        case 'gradEnd': return { ...prev, gradientColorEnd: color };
        case 'border': return { ...prev, borderColor: color };
        case 'shadow': return { ...prev, shadowColor: color };
        case 'text': return { ...prev, textColor: color };
        default: return prev;
      }
    });
  };

  // Code Gen Helpers
  const getCSSCode = () => {
    const lines: string[] = [];
    lines.push(`width: ${settings.width}px;`);
    lines.push(`height: ${settings.height}px;`);

    // Background fill
    if (settings.fillType === 'solid') {
      lines.push(`background-color: ${settings.backgroundColor};`);
    } else {
      const grad = settings.gradientType === 'linear'
        ? `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientColorStart}, ${settings.gradientColorEnd})`
        : `radial-gradient(circle, ${settings.gradientColorStart}, ${settings.gradientColorEnd})`;
      lines.push(`background: ${grad};`);
    }

    // Border
    if (settings.borderWidth > 0 && settings.borderStyle !== 'none') {
      lines.push(`border: ${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor};`);
    }

    // Border radius
    if (shape === 'box') {
      const tl = settings.borderRadiusTopLeft;
      const tr = settings.borderRadiusTopRight;
      const bl = settings.borderRadiusBottomLeft;
      const br = settings.borderRadiusBottomRight;
      if (tl === tr && tr === bl && bl === br) {
        if (tl > 0) lines.push(`border-radius: ${tl}px;`);
      } else {
        lines.push(`border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`);
      }
    } else if (shape === 'circle') {
      lines.push(`border-radius: 50%;`);
    }

    // Clip-path shapes
    if (shape === 'triangle') {
      lines.push(`clip-path: polygon(50% 0%, 0% 100%, 100% 100%);`);
    } else if (shape === 'star') {
      lines.push(`clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);`);
    } else if (shape === 'hexagon') {
      lines.push(`clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);`);
    }

    // Shadows
    if (settings.shadowEnabled) {
      const inset = settings.shadowInset ? ' inset' : '';
      lines.push(`box-shadow: ${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${settings.shadowSpread}px ${settings.shadowColor}${inset};`);
    }

    // Filters
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
      lines.push(`filter: ${filters.join(' ')};`);
    }

    // 3D Transforms
    const transforms: string[] = [];
    if (settings.rotateX !== 0) transforms.push(`rotateX(${settings.rotateX}deg)`);
    if (settings.rotateY !== 0) transforms.push(`rotateY(${settings.rotateY}deg)`);
    if (settings.rotateZ !== 0) transforms.push(`rotateZ(${settings.rotateZ}deg)`);
    if (settings.scale !== 1) transforms.push(`scale(${settings.scale})`);
    if (settings.skewX !== 0) transforms.push(`skewX(${settings.skewX}deg)`);
    if (settings.skewY !== 0) transforms.push(`skewY(${settings.skewY}deg)`);

    if (transforms.length > 0) {
      if (settings.perspective > 0) {
        lines.push(`transform: perspective(${settings.perspective}px) ${transforms.join(' ')};`);
      } else {
        lines.push(`transform: ${transforms.join(' ')};`);
      }
    }

    return lines.join('\n');
  };

  const getTailwindCode = () => {
    const classes: string[] = [];

    // Width & Height
    classes.push(`w-[${settings.width}px]`);
    classes.push(`h-[${settings.height}px]`);

    // Background fill
    if (settings.fillType === 'solid') {
      classes.push(`bg-[${settings.backgroundColor}]`);
    } else {
      const gradType = settings.gradientType === 'linear' ? 'bg-gradient-to-r' : 'bg-radial';
      classes.push(gradType);
      classes.push(`from-[${settings.gradientColorStart}]`);
      classes.push(`to-[${settings.gradientColorEnd}]`);
    }

    // Border
    if (settings.borderWidth > 0 && settings.borderStyle !== 'none') {
      classes.push(`border-[${settings.borderWidth}px]`);
      classes.push(`border-${settings.borderStyle}`);
      classes.push(`border-[${settings.borderColor}]`);
    }

    // Border radius
    if (shape === 'box') {
      const tl = settings.borderRadiusTopLeft;
      const tr = settings.borderRadiusTopRight;
      const bl = settings.borderRadiusBottomLeft;
      const br = settings.borderRadiusBottomRight;
      if (tl === tr && tr === bl && bl === br) {
        if (tl > 0) classes.push(`rounded-[${tl}px]`);
      } else {
        classes.push(`rounded-tl-[${tl}px]`);
        classes.push(`rounded-tr-[${tr}px]`);
        classes.push(`rounded-br-[${br}px]`);
        classes.push(`rounded-bl-[${bl}px]`);
      }
    } else if (shape === 'circle') {
      classes.push('rounded-full');
    }

    // Shadows
    if (settings.shadowEnabled) {
      classes.push(`shadow-[${settings.shadowOffsetX}px_${settings.shadowOffsetY}px_${settings.shadowBlur}px_${settings.shadowSpread}px_${settings.shadowColor.replace(/ /g, '')}]`);
    }

    // Transforms
    const transforms: string[] = [];
    if (settings.rotateX !== 0) transforms.push(`rotate-x-[${settings.rotateX}deg]`);
    if (settings.rotateY !== 0) transforms.push(`rotate-y-[${settings.rotateY}deg]`);
    if (settings.rotateZ !== 0) transforms.push(`rotate-[${settings.rotateZ}deg]`);
    if (settings.scale !== 1) transforms.push(`scale-[${settings.scale}]`);

    if (transforms.length > 0) {
      classes.push('transform');
      classes.push(...transforms);
    }

    return classes.join(' ');
  };

  const getReactStyleCode = () => {
    const styleObj: Record<string, string | number> = {
      width: `${settings.width}px`,
      height: `${settings.height}px`,
    };

    if (settings.fillType === 'solid') {
      styleObj.backgroundColor = settings.backgroundColor;
    } else {
      styleObj.background = settings.gradientType === 'linear'
        ? `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientColorStart}, ${settings.gradientColorEnd})`
        : `radial-gradient(circle, ${settings.gradientColorStart}, ${settings.gradientColorEnd})`;
    }

    if (settings.borderWidth > 0 && settings.borderStyle !== 'none') {
      styleObj.border = `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`;
    }

    if (shape === 'box') {
      const tl = settings.borderRadiusTopLeft;
      const tr = settings.borderRadiusTopRight;
      const bl = settings.borderRadiusBottomLeft;
      const br = settings.borderRadiusBottomRight;
      if (tl === tr && tr === bl && bl === br) {
        if (tl > 0) styleObj.borderRadius = `${tl}px`;
      } else {
        styleObj.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
      }
    } else if (shape === 'circle') {
      styleObj.borderRadius = '50%';
    }

    if (shape === 'triangle') {
      styleObj.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (shape === 'star') {
      styleObj.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    } else if (shape === 'hexagon') {
      styleObj.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    }

    if (settings.shadowEnabled) {
      const inset = settings.shadowInset ? ' inset' : '';
      styleObj.boxShadow = `${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${settings.shadowSpread}px ${settings.shadowColor}${inset}`;
    }

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
      styleObj.filter = filters.join(' ');
    }

    const transforms: string[] = [];
    if (settings.rotateX !== 0) transforms.push(`rotateX(${settings.rotateX}deg)`);
    if (settings.rotateY !== 0) transforms.push(`rotateY(${settings.rotateY}deg)`);
    if (settings.rotateZ !== 0) transforms.push(`rotateZ(${settings.rotateZ}deg)`);
    if (settings.scale !== 1) transforms.push(`scale(${settings.scale})`);

    if (transforms.length > 0) {
      styleObj.transform = settings.perspective > 0
        ? `perspective(${settings.perspective}px) ${transforms.join(' ')}`
        : transforms.join(' ');
    }

    return JSON.stringify(styleObj, null, 2);
  };

  const handleCopyCode = () => {
    const code = exportFormat === 'css'
      ? getCSSCode()
      : exportFormat === 'tailwind'
        ? getTailwindCode()
        : getReactStyleCode();

    navigator.clipboard.writeText(code);
    showCopyToast('Code Copied to Clipboard!');
  };

  return (
    <>
      {/* Toast Feedback */}
      <div className={`toast-message ${showToast ? 'show' : ''}`}>
        <Check size={18} />
        {toastMessage}
      </div>

      {/* Render based on active tab */}
      {activeTab === 'shape' && (
        <>
          {/* Shape Selection */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Square size={16} /> Shape Type
            </h3>
            <div className="shape-selector-grid">
              <button
                className={`shape-btn ${shape === 'box' ? 'active' : ''}`}
                onClick={() => setShape('box')}
              >
                <Square size={16} />
                Box
              </button>
              <button
                className={`shape-btn ${shape === 'circle' ? 'active' : ''}`}
                onClick={() => setShape('circle')}
              >
                <CircleIcon size={16} />
                Circle
              </button>
              <button
                className={`shape-btn ${shape === 'triangle' ? 'active' : ''}`}
                onClick={() => setShape('triangle')}
              >
                <TriangleIcon size={16} />
                Triangle
              </button>
              <button
                className={`shape-btn ${shape === 'star' ? 'active' : ''}`}
                onClick={() => setShape('star')}
              >
                <Star size={16} />
                Star
              </button>
              <button
                className={`shape-btn ${shape === 'hexagon' ? 'active' : ''}`}
                onClick={() => setShape('hexagon')}
              >
                <Hexagon size={16} />
                Hexagon
              </button>
            </div>
          </div>

          {/* Size Dimensions */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Maximize2 size={16} /> Dimensions
            </h3>
            <div className="control-item">
              <div className="control-header">
                <label>Width</label>
                <span className="control-value">{settings.width}px</span>
              </div>
              <input
                type="range"
                name="width"
                min="60"
                max="450"
                value={settings.width}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Height</label>
                <span className="control-value">{settings.height}px</span>
              </div>
              <input
                type="range"
                name="height"
                min="60"
                max="450"
                value={settings.height}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Corner Radius (Only box) */}
          {shape === 'box' && (
            <div className="settings-section-card">
              <h3 className="settings-section-title">
                <Move size={16} /> Corner Radius
              </h3>
              <div className="border-radius-quad">
                <div className="control-item">
                  <div className="control-header">
                    <label>Top-Left</label>
                    <span className="control-value">{settings.borderRadiusTopLeft}px</span>
                  </div>
                  <input
                    type="range"
                    name="borderRadiusTopLeft"
                    min="0"
                    max="150"
                    value={settings.borderRadiusTopLeft}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Top-Right</label>
                    <span className="control-value">{settings.borderRadiusTopRight}px</span>
                  </div>
                  <input
                    type="range"
                    name="borderRadiusTopRight"
                    min="0"
                    max="150"
                    value={settings.borderRadiusTopRight}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Bottom-Right</label>
                    <span className="control-value">{settings.borderRadiusBottomRight}px</span>
                  </div>
                  <input
                    type="range"
                    name="borderRadiusBottomRight"
                    min="0"
                    max="150"
                    value={settings.borderRadiusBottomRight}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Bottom-Left</label>
                    <span className="control-value">{settings.borderRadiusBottomLeft}px</span>
                  </div>
                  <input
                    type="range"
                    name="borderRadiusBottomLeft"
                    min="0"
                    max="150"
                    value={settings.borderRadiusBottomLeft}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'fill' && (
        <>
          {/* Fill Type */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Sparkles size={16} /> Fill Background
            </h3>
            <div className="control-item">
              <select
                className="ui-select"
                name="fillType"
                value={settings.fillType}
                onChange={handleChange}
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient Fill</option>
              </select>
            </div>

            {settings.fillType === 'gradient' && (
              <>
                <div className="control-item">
                  <label className="control-header">Gradient Type</label>
                  <select
                    className="ui-select"
                    name="gradientType"
                    value={settings.gradientType}
                    onChange={handleChange}
                  >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>

                {settings.gradientType === 'linear' && (
                  <div className="control-item">
                    <div className="control-header">
                      <label>Angle</label>
                      <span className="control-value">{settings.gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      name="gradientAngle"
                      min="0"
                      max="360"
                      value={settings.gradientAngle}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Borders */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Layout size={16} /> Borders
            </h3>
            <div className="control-item">
              <label className="control-header">Style</label>
              <select
                className="ui-select"
                name="borderStyle"
                value={settings.borderStyle}
                onChange={handleChange}
              >
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>

            {settings.borderStyle !== 'none' && (
              <div className="control-item">
                <div className="control-header">
                  <label>Border Width</label>
                  <span className="control-value">{settings.borderWidth}px</span>
                </div>
                <input
                  type="range"
                  name="borderWidth"
                  min="1"
                  max="25"
                  value={settings.borderWidth}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Combined Color Picker Section */}
          <div className="settings-section-card color-picker-row">
            <h3 className="settings-section-title">
              <Palette size={16} /> Color Picker
            </h3>
            <div className="export-format-nav">
              {settings.fillType === 'solid' ? (
                <button
                  className={`format-btn ${activeColorProp === 'bg' ? 'active' : ''}`}
                  onClick={() => setActiveColorProp('bg')}
                >
                  Fill
                </button>
              ) : (
                <>
                  <button
                    className={`format-btn ${activeColorProp === 'gradStart' ? 'active' : ''}`}
                    onClick={() => setActiveColorProp('gradStart')}
                  >
                    Start
                  </button>
                  <button
                    className={`format-btn ${activeColorProp === 'gradEnd' ? 'active' : ''}`}
                    onClick={() => setActiveColorProp('gradEnd')}
                  >
                    End
                  </button>
                </>
              )}
              {settings.borderStyle !== 'none' && (
                <button
                  className={`format-btn ${activeColorProp === 'border' ? 'active' : ''}`}
                  onClick={() => setActiveColorProp('border')}
                >
                  Border
                </button>
              )}
            </div>

            <HexColorPicker color={getActiveColor()} onChange={handleColorChange} />
            <div className="color-input-with-preview">
              <div
                className="color-swatch-preview"
                style={{ backgroundColor: getActiveColor() }}
              />
              <input
                type="text"
                className="ui-text-input"
                value={getActiveColor()}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'shadows' && (
        <>
          <div className="settings-section-card">
            <div className="switch-control">
              <h3 className="settings-section-title">
                <Sliders size={16} /> Box Shadow
              </h3>
              <label className="switch-wrapper">
                <input
                  type="checkbox"
                  name="shadowEnabled"
                  checked={settings.shadowEnabled}
                  onChange={handleChange}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {settings.shadowEnabled && (
              <div className="shadow-list">
                <div className="control-item">
                  <div className="control-header">
                    <label>Offset X</label>
                    <span className="control-value">{settings.shadowOffsetX}px</span>
                  </div>
                  <input
                    type="range"
                    name="shadowOffsetX"
                    min="-60"
                    max="60"
                    value={settings.shadowOffsetX}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Offset Y</label>
                    <span className="control-value">{settings.shadowOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    name="shadowOffsetY"
                    min="-60"
                    max="60"
                    value={settings.shadowOffsetY}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Blur Radius</label>
                    <span className="control-value">{settings.shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    name="shadowBlur"
                    min="0"
                    max="100"
                    value={settings.shadowBlur}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Spread Radius</label>
                    <span className="control-value">{settings.shadowSpread}px</span>
                  </div>
                  <input
                    type="range"
                    name="shadowSpread"
                    min="-30"
                    max="30"
                    value={settings.shadowSpread}
                    onChange={handleChange}
                  />
                </div>
                <div className="switch-control">
                  <span className="control-header">Inset Shadow</span>
                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      name="shadowInset"
                      checked={settings.shadowInset}
                      onChange={handleChange}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {settings.shadowEnabled && (
            <div className="settings-section-card">
              <h3 className="settings-section-title">
                <Palette size={16} /> Shadow Color
              </h3>
              <div className="export-format-nav">
                <button
                  className={`format-btn ${activeColorProp === 'shadow' ? 'active' : ''}`}
                  onClick={() => setActiveColorProp('shadow')}
                >
                  Shadow Color
                </button>
              </div>
              <HexColorPicker color={getActiveColor()} onChange={handleColorChange} />
              <div className="color-input-with-preview">
                <div
                  className="color-swatch-preview"
                  style={{ backgroundColor: settings.shadowColor }}
                />
                <input
                  type="text"
                  className="ui-text-input"
                  value={settings.shadowColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'filters' && (
        <>
          {/* 3D Transforms */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Move size={16} /> 3D Transforms
            </h3>
            <div className="control-item">
              <div className="control-header">
                <label>Rotate X</label>
                <span className="control-value">{settings.rotateX}°</span>
              </div>
              <input
                type="range"
                name="rotateX"
                min="-180"
                max="180"
                value={settings.rotateX}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Rotate Y</label>
                <span className="control-value">{settings.rotateY}°</span>
              </div>
              <input
                type="range"
                name="rotateY"
                min="-180"
                max="180"
                value={settings.rotateY}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Rotate Z</label>
                <span className="control-value">{settings.rotateZ}°</span>
              </div>
              <input
                type="range"
                name="rotateZ"
                min="-180"
                max="180"
                value={settings.rotateZ}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Perspective</label>
                <span className="control-value">{settings.perspective}px</span>
              </div>
              <input
                type="range"
                name="perspective"
                min="200"
                max="2000"
                value={settings.perspective}
                onChange={handleChange}
              />
            </div>
            {/* Scale */}
            <div className="control-item">
              <div className="control-header">
                <label>Scale</label>
                <span className="control-value">{settings.scale}</span>
              </div>
              <input
                type="range"
                name="scale"
                min="0.5"
                max="3"
                step="0.1"
                value={settings.scale}
                onChange={handleChange}
              />
            </div>
            {/* Skew X */}
            <div className="control-item">
              <div className="control-header">
                <label>Skew X</label>
                <span className="control-value">{settings.skewX}°</span>
              </div>
              <input
                type="range"
                name="skewX"
                min="-45"
                max="45"
                value={settings.skewX}
                onChange={handleChange}
              />
            </div>
            {/* Skew Y */}
            <div className="control-item">
              <div className="control-header">
                <label>Skew Y</label>
                <span className="control-value">{settings.skewY}°</span>
              </div>
              <input
                type="range"
                name="skewY"
                min="-45"
                max="45"
                value={settings.skewY}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* CSS Filters */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Sparkles size={16} /> CSS Filters
            </h3>
            <div className="control-item">
              <div className="control-header">
                <label>Blur</label>
                <span className="control-value">{settings.filterBlur}px</span>
              </div>
              <input
                type="range"
                name="filterBlur"
                min="0"
                max="30"
                value={settings.filterBlur}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Brightness</label>
                <span className="control-value">{settings.filterBrightness}%</span>
              </div>
              <input
                type="range"
                name="filterBrightness"
                min="0"
                max="200"
                value={settings.filterBrightness}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Contrast</label>
                <span className="control-value">{settings.filterContrast}%</span>
              </div>
              <input
                type="range"
                name="filterContrast"
                min="0"
                max="200"
                value={settings.filterContrast}
                onChange={handleChange}
              />
            </div>
            <div className="control-item">
              <div className="control-header">
                <label>Grayscale</label>
                <span className="control-value">{settings.filterGrayscale}%</span>
              </div>
              <input
                type="range"
                name="filterGrayscale"
                min="0"
                max="100"
                value={settings.filterGrayscale}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Text Content inside Shape */}
          <div className="settings-section-card">
            <div className="switch-control">
              <h3 className="settings-section-title">
                <Type size={16} /> Text Overlay (Preview)
              </h3>
              <label className="switch-wrapper">
                <input
                  type="checkbox"
                  name="textEnabled"
                  checked={settings.textEnabled}
                  onChange={handleChange}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {settings.textEnabled && (
              <>
                <div className="control-item">
                  <label className="control-header">Text Content</label>
                  <input
                    type="text"
                    name="textContent"
                    className="ui-text-input"
                    value={settings.textContent}
                    onChange={handleChange}
                  />
                </div>
                <div className="control-item">
                  <div className="control-header">
                    <label>Font Size</label>
                    <span className="control-value">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    name="fontSize"
                    min="10"
                    max="48"
                    value={settings.fontSize}
                    onChange={handleChange}
                  />
                </div>

                {/* Text Color Picker Selector */}
                <div className="control-item">
                  <label className="control-header">Text Color</label>
                  <div className="export-format-nav" style={{ marginBottom: '0.5rem' }}>
                    <button
                      className={`format-btn ${activeColorProp === 'text' ? 'active' : ''}`}
                      onClick={() => setActiveColorProp('text')}
                    >
                      Pick Text Color
                    </button>
                  </div>
                  {activeColorProp === 'text' && (
                    <>
                      <HexColorPicker color={settings.textColor} onChange={handleColorChange} />
                      <div className="color-input-with-preview" style={{ marginTop: '0.5rem' }}>
                        <div
                          className="color-swatch-preview"
                          style={{ backgroundColor: settings.textColor }}
                        />
                        <input
                          type="text"
                          className="ui-text-input"
                          value={settings.textColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'presets' && (
        <>
          {/* Code Exporter view */}
          <div className="settings-section-card exporter-panel">
            <h3 className="settings-section-title">
              <Copy size={16} /> Code Exporter
            </h3>

            <div className="export-format-nav">
              <button
                className={`format-btn ${exportFormat === 'css' ? 'active' : ''}`}
                onClick={() => setExportFormat('css')}
              >
                CSS
              </button>
              <button
                className={`format-btn ${exportFormat === 'tailwind' ? 'active' : ''}`}
                onClick={() => setExportFormat('tailwind')}
              >
                Tailwind
              </button>
              <button
                className={`format-btn ${exportFormat === 'react' ? 'active' : ''}`}
                onClick={() => setExportFormat('react')}
              >
                React
              </button>
            </div>

            <div className="code-container">
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyCode}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <pre>
                {exportFormat === 'css' && getCSSCode()}
                {exportFormat === 'tailwind' && getTailwindCode()}
                {exportFormat === 'react' && getReactStyleCode()}
              </pre>
            </div>
          </div>

          {/* Quick Presets Gallery */}
          <div className="settings-section-card">
            <h3 className="settings-section-title">
              <Sparkles size={16} /> Quick Presets
            </h3>
            <div className="presets-grid">
              {Object.entries(presets).map(([key, item]) => {
                const getMiniStyle = () => {
                  const style: React.CSSProperties = {
                    backgroundColor: item.settings.backgroundColor,
                  };
                  if (item.settings.fillType === 'gradient') {
                    style.background = item.settings.gradientType === 'linear'
                      ? `linear-gradient(${item.settings.gradientAngle}deg, ${item.settings.gradientColorStart}, ${item.settings.gradientColorEnd})`
                      : `radial-gradient(circle, ${item.settings.gradientColorStart}, ${item.settings.gradientColorEnd})`;
                  }
                  if (item.shape === 'circle') {
                    style.borderRadius = '50%';
                  } else {
                    style.borderRadius = '6px';
                  }
                  return style;
                };

                return (
                  <div
                    key={key}
                    className="preset-card"
                    onClick={() => onSelectPreset(key)}
                  >
                    <div className="preset-mini-preview" style={getMiniStyle()} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Settings;
