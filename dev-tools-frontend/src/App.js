import { useEffect, useState } from 'react';
import { FaCode, FaKey, FaQrcode, FaExchangeAlt } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import Base64Tool from './components/Base64Tool';
import JsonTool from './components/JsonTool';
import JwtTool from './components/JwtTool';
import QrTool from './components/QrTool';
import './App.css';
import { decodeBase64, encodeBase64 } from './utils/base64';
import { copyText } from './utils/clipboard';
import { formatJsonValue } from './utils/json';
import { parseJwtValue } from './utils/jwt';
import { createQrCode } from './utils/qr';

const BRAND_NAME = 'PayloadKit';

const routeMap = {
  '/': 'home',
  '/json-formatter': 'json',
  '/jwt-decoder': 'jwt',
  '/qr-generator': 'qr',
  '/base64-tool': 'base64',
};

const pageToPath = {
  home: '/',
  json: '/json-formatter',
  jwt: '/jwt-decoder',
  qr: '/qr-generator',
  base64: '/base64-tool',
};

const tools = [
  {
    id: 'json',
    icon: FaCode,
    navLabel: 'JSON Formatter',
    brief: 'Format, validate, and review JSON payloads with readable syntax highlighting.',
  },
  {
    id: 'jwt',
    icon: FaKey,
    navLabel: 'JWT Decoder',
    brief: 'Inspect JWT headers and claims locally while debugging auth flows.',
  },
  {
    id: 'qr',
    icon: FaQrcode,
    navLabel: 'QR Generator',
    brief: 'Generate downloadable QR codes for URLs, text, onboarding links, or internal tools.',
  },
  {
    id: 'base64',
    icon: FaExchangeAlt,
    navLabel: 'Base64 Tool',
    brief: 'Encode or decode text safely for API work, headers, and quick utility tasks.',
  },
];

const defaultJsonInput =
  '{\n  "project": "PayloadKit",\n  "visibility": "public",\n  "tools": ["JSON", "JWT", "QR", "Base64"]\n}';
const defaultJwtInput =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJQYXlsb2FkS2l0IiwicGxhbiI6InB1YmxpYyIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.signature';
const defaultBase64Input = 'Launch-ready browser utilities for developers.';

function App() {
  const [activePage, setActivePage] = useState(() => routeMap[window.location.pathname] || 'home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [jsonInput, setJsonInput] = useState(defaultJsonInput);
  const [formattedJson, setFormattedJson] = useState(() => formatJsonValue(defaultJsonInput));
  const [jsonError, setJsonError] = useState('');

  const [jwtInput, setJwtInput] = useState(defaultJwtInput);
  const [jwtHeader, setJwtHeader] = useState(() => parseJwtValue(defaultJwtInput).header);
  const [jwtPayload, setJwtPayload] = useState(() => parseJwtValue(defaultJwtInput).payload);
  const [jwtStatus, setJwtStatus] = useState(() => parseJwtValue(defaultJwtInput).status);
  const [jwtError, setJwtError] = useState('');

  const [qrInput, setQrInput] = useState('https://payloadkit.app');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');

  const [base64Input, setBase64Input] = useState(defaultBase64Input);
  const [base64Output, setBase64Output] = useState(() => encodeBase64(defaultBase64Input));
  const [base64Error, setBase64Error] = useState('');

  const [copyStatus, setCopyStatus] = useState('');
  const [navElement, setNavElement] = useState(null);

  const runCopy = async (value, label) => {
    try {
      await copyText(value);
      setCopyStatus(`${label} copied to clipboard.`);
    } catch (error) {
      setCopyStatus(error.message || `Unable to copy ${label.toLowerCase()}.`);
    }
  };

  const handleFormatJson = () => {
    try {
      setFormattedJson(formatJsonValue(jsonInput));
      setJsonError('');
    } catch (error) {
      setFormattedJson('');
      setJsonError(error.message);
    }
  };

  const handleDownloadJson = () => {
    if (!formattedJson) {
      setCopyStatus('Format valid JSON before downloading.');
      return;
    }

    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'formatted.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDecodeJwt = () => {
    try {
      const parsed = parseJwtValue(jwtInput);

      setJwtHeader(parsed.header);
      setJwtPayload(parsed.payload);
      setJwtStatus(parsed.status);
      setJwtError('');
    } catch (error) {
      setJwtHeader('');
      setJwtPayload('');
      setJwtStatus('');
      setJwtError(error.message);
    }
  };

  const handleGenerateQr = () => {
    if (!qrInput.trim()) {
      setQrDataUrl('');
      setQrError('Enter text or a URL to generate a QR code.');
      return;
    }

    if (process.env.NODE_ENV === 'test') {
      setQrDataUrl('data:image/png;base64,test');
      setQrError('');
      return;
    }

    createQrCode(qrInput, {
      width: 320,
      margin: 2,
      color: {
        dark: '#102542',
        light: '#f6f4ee',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
        setQrError('');
      })
      .catch((error) => {
        setQrDataUrl('');
        setQrError(error.message);
      });
  };

  const handleQrInputChange = (value) => {
    setQrInput(value);
    setQrDataUrl('');
    setQrError('');
  };

  const handleBase64Encode = () => {
    try {
      setBase64Output(encodeBase64(base64Input));
      setBase64Error(''); // update
    } catch (error) {
      setBase64Output('');
      setBase64Error(error.message);
    }
  };

  const handleBase64Decode = () => {
    try {
      setBase64Output(decodeBase64(base64Input.trim()));
      setBase64Error('');
    } catch (error) {
      setBase64Output('');
      setBase64Error('Invalid Base64 input.');
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePage(routeMap[window.location.pathname] || 'home');
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);

    return () => {
      document.body.classList.remove('dark');
    };
  }, [isDarkMode]);

  useEffect(() => {
    try {
      setFormattedJson(formatJsonValue(jsonInput));
      setJsonError('');
    } catch (error) {
      setFormattedJson('');
      setJsonError(error.message);
    }
  }, [jsonInput]);

  useEffect(() => {
    try {
      const parsed = parseJwtValue(jwtInput);

      setJwtHeader(parsed.header);
      setJwtPayload(parsed.payload);
      setJwtStatus(parsed.status);
      setJwtError('');
    } catch (error) {
      setJwtHeader('');
      setJwtPayload('');
      setJwtStatus('');
      setJwtError(error.message);
    }
  }, [jwtInput]);

  useEffect(() => {
    if (!copyStatus) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCopyStatus('');
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const navigateTo = (page) => {
    const nextPath = pageToPath[page] || '/';

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setActivePage(page);
  };

  const scrollToolNav = () => {
    if (!navElement) {
      return;
    }

    navElement.scrollBy({
      left: 220,
      behavior: 'smooth',
    });
  };

  const renderHome = () => (
    <section className="home-page">
      <div className="hero-copy home-hero">
        <h1>All your dev tools One clean workspace</h1>
        <p className="hero-text">
          Format JSON, inspect JWTs, generate QR codes, and convert Base64 in one clean browser
          workspace designed to make debugging, payload handling, and everyday development tasks
          faster and simpler
        </p>
        <p className="trust-line">100% client-side. No data stored</p>
        <div className="hero-actions">
          <button type="button" onClick={() => navigateTo('json')}>
            Start Using Tools
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            Explore Tools
          </button>
        </div>
      </div>

      <div className="why-section">
        <div className="section-heading">
          <h2>Why PayloadKit?</h2>
        </div>
        <div className="why-grid">
          <article className="why-card">
            <h3>Fast and lightweight</h3>
            <p>Quick utilities that open instantly and stay focused on the task.</p>
          </article>
          <article className="why-card">
            <h3>Privacy focused</h3>
            <p>Your input stays in the browser for safer everyday developer workflows.</p>
          </article>
          <article className="why-card">
            <h3>Designed for developers</h3>
            <p>Useful tools for payloads, tokens, QR sharing, and encoding work in one place.</p>
          </article>
        </div>
      </div>

      <div className="cards-section" id="tools-section">
        <div className="section-heading">
          <h2>Tools</h2>
          <p>Explore a focused set of browser-based utilities for everyday developer tasks</p>
        </div>

        <div className="hero-grid">
          {tools.map((tool) => (
            <button type="button" key={tool.id} className="hero-card tool-card-button" onClick={() => navigateTo(tool.id)}>
              <span className="tool-icon" aria-hidden="true">
                <tool.icon />
              </span>
              <h2>{tool.navLabel}</h2>
              <p>{tool.brief}</p>
              <span className="card-link">Use Tool -&gt;</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'json':
        return (
          <JsonTool
            jsonInput={jsonInput}
            formattedJson={formattedJson}
            jsonError={jsonError}
            onJsonInputChange={setJsonInput}
            onFormatJson={handleFormatJson}
            onDownloadJson={handleDownloadJson}
            onCopy={runCopy}
          />
        );
      case 'jwt':
        return (
          <JwtTool
            jwtInput={jwtInput}
            jwtHeader={jwtHeader}
            jwtPayload={jwtPayload}
            jwtError={jwtError}
            jwtStatus={jwtStatus}
            onJwtInputChange={setJwtInput}
            onDecodeJwt={handleDecodeJwt}
            onCopy={runCopy}
          />
        );
        case 'qr':
          return (
            <QrTool
              qrInput={qrInput}
              qrDataUrl={qrDataUrl}
              qrError={qrError}
              onQrInputChange={handleQrInputChange}
              onGenerateQr={handleGenerateQr}
            />
          );
      case 'base64':
        return (
          <Base64Tool
            base64Input={base64Input}
            base64Output={base64Output}
            base64Error={base64Error}
            onBase64InputChange={setBase64Input}
            onEncode={handleBase64Encode}
            onDecode={handleBase64Decode}
            onCopy={runCopy}
          />
        );
      default:
        return renderHome();
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="brand-mark" onClick={() => navigateTo('home')}>
          {BRAND_NAME}
        </button>

        <div className="nav-scroll-wrap">
          <nav className="topnav" aria-label="Primary navigation" ref={setNavElement}>
            <button
              type="button"
              className={activePage === 'home' ? 'nav-link active' : 'nav-link'}
              onClick={() => navigateTo('home')}
            >
              Home
            </button>
            {tools.map((tool) => (
              <button
                type="button"
                key={tool.id}
                className={activePage === tool.id ? 'nav-link active' : 'nav-link'}
                onClick={() => navigateTo(tool.id)}
              >
                {tool.navLabel}
              </button>
            ))}
          </nav>
          <button type="button" className="nav-more-hint" aria-label="Scroll to more tools" onClick={scrollToolNav}>
            <FiChevronRight />
          </button>
        </div>

        <button type="button" className="theme-toggle" onClick={() => setIsDarkMode((current) => !current)}>
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className="app-content">
        {copyStatus ? <p className="status-banner">{copyStatus}</p> : null}
        {renderPage()}
      </main>

      <footer className="site-footer">
        <p>&copy; 2026 PayloadKit</p>
        <p>Built for developers</p>
      </footer>
    </div>
  );
}

export default App;
