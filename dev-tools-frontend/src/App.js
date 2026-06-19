import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiHome, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import Base64Tool from './components/Base64Tool';
import HashTool from './components/HashTool';
import JsonTool from './components/JsonTool';
import JwtTool from './components/JwtTool';
import PythonTool from './components/PythonTool';
import QrTool from './components/QrTool';
import RegexTool from './components/RegexTool';
import TimestampTool from './components/TimestampTool';
import UrlTool from './components/UrlTool';
import UuidTool from './components/UuidTool';
import './App.css';
import { routeMap, pageToPath, visibleToolGroups } from './tools/toolRegistry';
import { decodeBase64, encodeBase64 } from './utils/base64';
import { copyText } from './utils/clipboard';
import { createHashValue } from './utils/hash';
import { formatJsonValue } from './utils/json';
import { parseJwtValue } from './utils/jwt';
import { runPythonCode } from './utils/python';
import { createQrCode } from './utils/qr';
import { parseRegexFlags, runRegexMatch } from './utils/regex';
import { convertTimestamp, createCurrentTimestamp } from './utils/timestamp';
import { decodeUrlValue, encodeUrlValue } from './utils/url';
import { createUuidBatch } from './utils/uuid';

const BRAND_NAME = 'PayloadKit';

const defaultJsonInput =
  '{\n  "project": "PayloadKit",\n  "visibility": "public",\n  "tools": ["JSON", "JWT", "QR", "Base64"]\n}';
const defaultJwtInput =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJQYXlsb2FkS2l0IiwicGxhbiI6InB1YmxpYyIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo0MTAyNDQ0ODAwfQ.signature';
const defaultBase64Input = 'Launch-ready browser utilities for developers.';
const defaultUrlInput = 'https://payloadkit.app/callback?next=/workspace tools&env=staging';
const defaultHashInput = 'payloadkit-demo';
const defaultRegexPattern = 'payloadkit';
const defaultRegexSample = 'payloadkit-demo\npayloadkit.app\nlaunch payloadkit';
const defaultPythonCode = `numbers = [2, 4, 6, 8]
total = sum(numbers)
average = total / len(numbers)

print("Numbers:", numbers)
print("Total:", total)
print("Average:", average)
`;

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

  const [qrInput, setQrInput] = useState('https://payloadkit.in/');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');

  const [base64Input, setBase64Input] = useState(defaultBase64Input);
  const [base64Output, setBase64Output] = useState(() => encodeBase64(defaultBase64Input));
  const [base64Error, setBase64Error] = useState('');

  const [urlInput, setUrlInput] = useState(defaultUrlInput);
  const [urlOutput, setUrlOutput] = useState(() => encodeUrlValue(defaultUrlInput));
  const [urlError, setUrlError] = useState('');

  const [hashInput, setHashInput] = useState(defaultHashInput);
  const [hashOutput, setHashOutput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState('SHA-256');
  const [hashError, setHashError] = useState('');

  const [regexPattern, setRegexPattern] = useState(defaultRegexPattern);
  const [regexFlags, setRegexFlags] = useState('gi');
  const [regexSample, setRegexSample] = useState(defaultRegexSample);
  const [regexMatches, setRegexMatches] = useState(() =>
    runRegexMatch(defaultRegexPattern, 'gi', defaultRegexSample)
  );
  const [regexError, setRegexError] = useState('');

  const [uuidCount, setUuidCount] = useState('5');
  const [uuidOutput, setUuidOutput] = useState(() => createUuidBatch(5));
  const [uuidError, setUuidError] = useState('');

  const [pythonCode, setPythonCode] = useState(defaultPythonCode);
  const [pythonOutput, setPythonOutput] = useState('');
  const [pythonError, setPythonError] = useState('');
  const [pythonStatus, setPythonStatus] = useState('idle');

  const [timestampInput, setTimestampInput] = useState('1717000000');
  const [timestampResult, setTimestampResult] = useState(() => convertTimestamp('1717000000'));
  const [timestampError, setTimestampError] = useState('');

  const [copyStatus, setCopyStatus] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

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

  const handleUrlEncode = () => {
    try {
      setUrlOutput(encodeUrlValue(urlInput));
      setUrlError('');
    } catch (error) {
      setUrlOutput('');
      setUrlError(error.message);
    }
  };

  const handleUrlDecode = () => {
    try {
      setUrlOutput(decodeUrlValue(urlInput.trim()));
      setUrlError('');
    } catch (error) {
      setUrlOutput('');
      setUrlError(error.message);
    }
  };

  const handleHashGenerate = async () => {
    try {
      const hash = await createHashValue(hashInput, hashAlgorithm);

      setHashOutput(hash);
      setHashError('');
    } catch (error) {
      setHashOutput('');
      setHashError(error.message);
    }
  };

  const handleRunRegex = () => {
    try {
      setRegexMatches(runRegexMatch(regexPattern, regexFlags, regexSample));
      setRegexError('');
    } catch (error) {
      setRegexMatches([]);
      setRegexError(error.message);
    }
  };

  const handleRegexFlagsChange = (value) => {
    setRegexFlags(value);
    setRegexError('');

    try {
      parseRegexFlags(value);
    } catch (error) {
      setRegexMatches([]);
      setRegexError(error.message);
    }
  };

  const handleGenerateUuids = () => {
    try {
      const nextCount = Number.parseInt(uuidCount, 10);

      setUuidOutput(createUuidBatch(nextCount));
      setUuidError('');
    } catch (error) {
      setUuidOutput('');
      setUuidError(error.message);
    }
  };

  const handleRunPython = async () => {
    setPythonStatus('running');
    setPythonError('');

    try {
      const result = await runPythonCode(pythonCode);

      setPythonOutput(result.output);
      setPythonError(result.error);
      setPythonStatus(result.error ? 'error' : 'ready');
    } catch (error) {
      setPythonOutput('');
      setPythonError(error.message);
      setPythonStatus('error');
    }
  };

  const handleConvertTimestamp = () => {
    try {
      setTimestampResult(convertTimestamp(timestampInput));
      setTimestampError('');
    } catch (error) {
      setTimestampResult(null);
      setTimestampError(error.message);
    }
  };

  const handleUseCurrentTimestamp = () => {
    const current = createCurrentTimestamp();

    setTimestampInput(current.input);
    setTimestampResult(current.result);
    setTimestampError('');
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

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setOpenMenuId('');
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuId('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateTo = (page) => {
    const nextPath = pageToPath[page] || '/';

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setActivePage(page);
    setOpenMenuId('');
    setIsMobileMenuOpen(false);
  };

  const renderHome = () => (
    <section className="home-page">
      <div className="hero-copy home-hero">
        <h1>All your dev tools One clean workspace</h1>
        <p className="hero-text">
          A focused browser workspace for everyday developer tasks.
          Built to keep debugging, payload handling, and quick utility work fast, simple, and clean.
        </p>
        <p className="trust-line">Client-first utilities with backend power where it helps. No data stored</p>
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

        <div className="tool-group-list">
          {visibleToolGroups.map((group) => (
            <section
              className={group.id === 'backend' ? 'tool-group tool-group--compact' : 'tool-group'}
              key={group.id}
              aria-labelledby={`${group.id}-tools`}
            >
              <div className="tool-group-heading">
                <h3 id={`${group.id}-tools`}>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className="hero-grid">
                {group.tools.map((tool) => (
                  <button
                    type="button"
                    key={tool.id}
                    className="hero-card tool-card-button"
                    onClick={() => navigateTo(tool.id)}
                  >
                    <span className="tool-icon" aria-hidden="true">
                      <tool.icon />
                    </span>
                    <h2>{tool.navLabel}</h2>
                    <p>{tool.brief}</p>
                    <span className="card-link">Use Tool -&gt;</span>
                  </button>
                ))}
              </div>
            </section>
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
      case 'url':
        return (
          <UrlTool
            urlInput={urlInput}
            urlOutput={urlOutput}
            urlError={urlError}
            onUrlInputChange={setUrlInput}
            onEncode={handleUrlEncode}
            onDecode={handleUrlDecode}
            onCopy={runCopy}
          />
        );
      case 'hash':
        return (
          <HashTool
            hashInput={hashInput}
            hashOutput={hashOutput}
            hashError={hashError}
            hashAlgorithm={hashAlgorithm}
            onHashInputChange={setHashInput}
            onHashAlgorithmChange={setHashAlgorithm}
            onGenerateHash={handleHashGenerate}
            onCopy={runCopy}
          />
        );
      case 'regex':
        return (
          <RegexTool
            regexPattern={regexPattern}
            regexFlags={regexFlags}
            regexSample={regexSample}
            regexMatches={regexMatches}
            regexError={regexError}
            onRegexPatternChange={setRegexPattern}
            onRegexFlagsChange={handleRegexFlagsChange}
            onRegexSampleChange={setRegexSample}
            onRunRegex={handleRunRegex}
            onCopy={runCopy}
          />
        );
      case 'uuid':
        return (
          <UuidTool
            uuidCount={uuidCount}
            uuidOutput={uuidOutput}
            uuidError={uuidError}
            onUuidCountChange={setUuidCount}
            onGenerateUuids={handleGenerateUuids}
            onCopy={runCopy}
          />
        );
      case 'python':
        return (
          <PythonTool
            pythonCode={pythonCode}
            pythonOutput={pythonOutput}
            pythonError={pythonError}
            pythonStatus={pythonStatus}
            onPythonCodeChange={setPythonCode}
            onRunPython={handleRunPython}
            onCopy={runCopy}
          />
        );
      case 'timestamp':
        return (
          <TimestampTool
            timestampInput={timestampInput}
            timestampResult={timestampResult}
            timestampError={timestampError}
            onTimestampInputChange={setTimestampInput}
            onConvertTimestamp={handleConvertTimestamp}
            onUseCurrentTimestamp={handleUseCurrentTimestamp}
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
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          {isMobileMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>

        <button type="button" className="brand-mark" onClick={() => navigateTo('home')}>
          {BRAND_NAME}
        </button>

        <div className="nav-scroll-wrap">
          <nav className="topnav" aria-label="Primary navigation" ref={navRef}>
            <button
              type="button"
              className={activePage === 'home' ? 'nav-link active' : 'nav-link'}
              onClick={() => navigateTo('home')}
              aria-label="Home"
              title="Home"
            >
              <FiHome aria-hidden="true" />
            </button>
            {visibleToolGroups.map((group) => {
              const isGroupActive = group.tools.some((tool) => tool.id === activePage);
              const isOpen = openMenuId === group.id;

              return (
                <div className="nav-menu" key={group.id}>
                  <button
                    type="button"
                    className={isGroupActive ? 'nav-link nav-menu-trigger active' : 'nav-link nav-menu-trigger'}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenMenuId((current) => (current === group.id ? '' : group.id))}
                  >
                    {group.title}
                    <FiChevronDown aria-hidden="true" />
                  </button>

                  {isOpen ? (
                    <div className="tools-dropdown" role="menu" aria-label={group.title}>
                      {group.tools.map((tool) => (
                        <button
                          type="button"
                          key={tool.id}
                          className={activePage === tool.id ? 'tools-dropdown-item active' : 'tools-dropdown-item'}
                          onClick={() => navigateTo(tool.id)}
                          role="menuitem"
                        >
                          <span className="tools-dropdown-icon" aria-hidden="true">
                            <tool.icon />
                          </span>
                          <span>
                            <span className="tools-dropdown-label">{tool.navLabel}</span>
                            <span className="tools-dropdown-brief">{tool.brief}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setIsDarkMode((current) => !current)}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            <FiMoon
              className={isDarkMode ? 'theme-toggle-glyph theme-toggle-glyph--hidden theme-toggle-glyph--moon' : 'theme-toggle-glyph theme-toggle-glyph--visible theme-toggle-glyph--moon'}
            />
            <FiSun
              className={isDarkMode ? 'theme-toggle-glyph theme-toggle-glyph--visible theme-toggle-glyph--sun' : 'theme-toggle-glyph theme-toggle-glyph--hidden theme-toggle-glyph--sun'}
            />
          </span>
          <span className="theme-toggle-label" key={isDarkMode ? 'light' : 'dark'}>
            {isDarkMode ? 'Light' : 'Dark'}
          </span>
        </button>
      </header>

      <div className={isMobileMenuOpen ? 'mobile-nav-drawer mobile-nav-drawer--open' : 'mobile-nav-drawer'} id="mobile-nav-drawer">
        <div className="mobile-nav-groups">
          {visibleToolGroups.map((group) => (
            <section className="mobile-nav-group" key={group.id} aria-labelledby={`${group.id}-mobile-nav`}>
              <h3 id={`${group.id}-mobile-nav`}>{group.title}</h3>
              <div className="mobile-nav-tools">
                {group.tools.map((tool) => (
                  <button
                    type="button"
                    key={tool.id}
                    className={activePage === tool.id ? 'mobile-nav-tool active' : 'mobile-nav-tool'}
                    onClick={() => navigateTo(tool.id)}
                  >
                    <span className="mobile-nav-tool-icon" aria-hidden="true">
                      <tool.icon />
                    </span>
                    <span className="mobile-nav-tool-copy">
                      <span className="mobile-nav-tool-label">{tool.navLabel}</span>
                      <span className="mobile-nav-tool-brief">{tool.brief}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

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
