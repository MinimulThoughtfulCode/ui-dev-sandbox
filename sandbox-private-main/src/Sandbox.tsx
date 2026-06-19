import { useState } from 'react';
import Settings from './Settings';
import type { SandboxSettings } from './Settings';
import Shape from './Shape';
import { 
  Grid, 
  Sun, 
  Moon, 
  RotateCcw, 
  Compass, 
  Palette, 
  Sliders, 
  FileCode,
  Sparkles
} from 'lucide-react';

const DEFAULT_SETTINGS: SandboxSettings = {
  // Dimensions
  width: 240,
  height: 240,

  // Fill
  fillType: 'solid',
  backgroundColor: '#3b82f6',
  gradientType: 'linear',
  gradientAngle: 135,
  gradientColorStart: '#3b82f6',
  gradientColorEnd: '#8b5cf6',

  // Borders
  borderWidth: 0,
  borderStyle: 'none',
  borderColor: '#a855f7',

  // Border Radius
  borderRadiusTopLeft: 16,
  borderRadiusTopRight: 16,
  borderRadiusBottomLeft: 16,
  borderRadiusBottomRight: 16,

  // Shadows
  shadowEnabled: true,
  shadowOffsetX: 15,
  shadowOffsetY: -15,
  shadowBlur: 24,
  shadowSpread: 8,
  shadowColor: 'rgba(1, 1, 1, 0.3)',
  shadowInset: false,

  // 3D Transforms
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  skewX: 0,
  skewY: 0,
  perspective: 800,

  // Filters
  filterBlur: 0,
  filterBrightness: 100,
  filterContrast: 100,
  filterGrayscale: 0,
  filterHueRotate: 0,
  filterInvert: 0,
  filterOpacity: 100,
  filterSaturate: 100,
  filterSepia: 0,

  // Content
  textEnabled: true,
  textContent: 'Drag or Tweak me!',
  textColor: '#ffffff',
  fontSize: 15,
};

const PRESETS: Record<string, { label: string; shape: string; settings: SandboxSettings }> = {
  glass: {
    label: 'Glassmorphism Card',
    shape: 'box',
    settings: {
      ...DEFAULT_SETTINGS,
      width: 260,
      height: 260,
      fillType: 'solid',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderRadiusTopLeft: 24,
      borderRadiusTopRight: 24,
      borderRadiusBottomLeft: 24,
      borderRadiusBottomRight: 24,
      shadowEnabled: true,
      shadowOffsetX: 0,
      shadowOffsetY: 20,
      shadowBlur: 40,
      shadowSpread: -10,
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      rotateX: 12,
      rotateY: -16,
      rotateZ: 0,
      textContent: 'Glassmorphism',
      textColor: '#ffffff',
    }
  },
  neon: {
    label: 'Neon Glow',
    shape: 'circle',
    settings: {
      ...DEFAULT_SETTINGS,
      width: 200,
      height: 200,
      fillType: 'solid',
      backgroundColor: '#090d16',
      borderWidth: 3,
      borderStyle: 'solid',
      borderColor: '#ec4899',
      borderRadiusTopLeft: 100,
      borderRadiusTopRight: 100,
      borderRadiusBottomLeft: 100,
      borderRadiusBottomRight: 100,
      shadowEnabled: true,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 30,
      shadowSpread: 4,
      shadowColor: '#ec4899',
      textContent: 'Glow Circle',
      textColor: '#f472b6',
    }
  },
  isometric: {
    label: '3D Floating Plate',
    shape: 'box',
    settings: {
      ...DEFAULT_SETTINGS,
      width: 280,
      height: 180,
      fillType: 'gradient',
      gradientType: 'linear',
      gradientAngle: 135,
      gradientColorStart: '#f43f5e',
      gradientColorEnd: '#fb7185',
      borderRadiusTopLeft: 16,
      borderRadiusTopRight: 16,
      borderRadiusBottomLeft: 16,
      borderRadiusBottomRight: 16,
      shadowEnabled: true,
      shadowOffsetX: 15,
      shadowOffsetY: 25,
      shadowBlur: 35,
      shadowSpread: -5,
      shadowColor: 'rgba(244, 63, 94, 0.4)',
      rotateX: 45,
      rotateY: -12,
      rotateZ: 18,
      perspective: 700,
      textContent: 'Floating 3D',
      textColor: '#ffffff',
      fontSize: 18,
    }
  },
  neumorphism: {
    label: 'Soft Press',
    shape: 'box',
    settings: {
      ...DEFAULT_SETTINGS,
      width: 200,
      height: 200,
      fillType: 'solid',
      backgroundColor: '#e2e8f0',
      borderWidth: 0,
      borderStyle: 'none',
      borderRadiusTopLeft: 30,
      borderRadiusTopRight: 30,
      borderRadiusBottomLeft: 30,
      borderRadiusBottomRight: 30,
      shadowEnabled: true,
      shadowOffsetX: 8,
      shadowOffsetY: 8,
      shadowBlur: 16,
      shadowSpread: 0,
      shadowColor: '#cbd5e1', // We can represent neumorphism nicely
      textContent: 'Pressed',
      textColor: '#64748b',
    }
  }
};

const Sandbox = () => {
  const [shape, setShape] = useState<string>('box');
  const [settings, setSettings] = useState<SandboxSettings>(DEFAULT_SETTINGS);
  
  // Canvas Toolbar State
  const [gridEnabled, setGridEnabled] = useState<boolean>(true);
  const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light'>('dark');

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<'shape' | 'fill' | 'shadows' | 'filters' | 'presets'>('shape');

  // Reset to default
  const handleReset = () => {
    setShape('box');
    setSettings(DEFAULT_SETTINGS);
  };

  // Load a preset
  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setShape(preset.shape);
      setSettings(preset.settings);
    }
  };

  return (
    <div className="sandbox-container">
      {/* Canvas column (left/center) */}
      <div className="canvas-column">
        {/* Toolbar */}
        <div className="canvas-toolbar">
          <button 
            className={`toolbar-btn ${gridEnabled ? 'active' : ''}`}
            onClick={() => setGridEnabled(!gridEnabled)}
            title="Toggle Grid Background"
            aria-label="Toggle Grid Background"
          >
            <Grid size={18} />
          </button>
          <button 
            className={`toolbar-btn ${canvasTheme === 'light' ? 'active' : ''}`}
            onClick={() => setCanvasTheme(canvasTheme === 'light' ? 'dark' : 'light')}
            title="Toggle Canvas Theme"
            aria-label="Toggle Canvas Theme"
          >
            {canvasTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            className="toolbar-btn"
            onClick={handleReset}
            title="Reset to Default"
            aria-label="Reset to Default"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Workspace Canvas */}
        <div className={`canvas-workspace ${gridEnabled ? 'grid-enabled' : ''} ${canvasTheme}-canvas`}>
          <Shape shape={shape} settings={settings} setSettings={setSettings} />
        </div>
      </div>

      {/* Control Sidebar Column (right) */}
      <div className="sidebar-column">
        {/* Category Tabs */}
        <div className="tabs-navigation">
          <button 
            className={`tab-button ${activeTab === 'shape' ? 'active' : ''}`}
            onClick={() => setActiveTab('shape')}
          >
            <Compass />
            Shape & Size
          </button>
          <button 
            className={`tab-button ${activeTab === 'fill' ? 'active' : ''}`}
            onClick={() => setActiveTab('fill')}
          >
            <Palette />
            Fill & Border
          </button>
          <button 
            className={`tab-button ${activeTab === 'shadows' ? 'active' : ''}`}
            onClick={() => setActiveTab('shadows')}
          >
            <Sliders />
            Shadows
          </button>
          <button 
            className={`tab-button ${activeTab === 'filters' ? 'active' : ''}`}
            onClick={() => setActiveTab('filters')}
          >
            <Sparkles />
            Effects & Text
          </button>
          <button 
            className={`tab-button ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            <FileCode />
            Export/Presets
          </button>
        </div>

        {/* Scrollable Sidebar Panel */}
        <div className="sidebar-content">
          <Settings 
            shape={shape} 
            setShape={setShape}
            settings={settings} 
            setSettings={setSettings} 
            activeTab={activeTab}
            presets={PRESETS}
            onSelectPreset={handlePresetSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
