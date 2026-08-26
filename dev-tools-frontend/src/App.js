import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiGrid, FiHome, FiMenu, FiMoon, FiSettings, FiSun, FiX } from 'react-icons/fi';
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
import UtilityTool from './components/UtilityTool';
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

const translations = {
  hi: {
    preferences: 'प्राथमिकताएं',
    pdf: 'पीडीएफ टूल्स',
    home: 'होम',
    settings: 'सेटिंग्स',
    appearance: 'दिखावट',
    appearanceHelp: 'PayloadKit का रूप चुनें।',
    language: 'भाषा',
    languageHelp: 'अपनी पसंदीदा भाषा चुनें।',
    applyLanguage: 'भाषा लागू करें',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    dashboardMenu: 'डैशबोर्ड मेनू',
    closeSettings: 'सेटिंग्स बंद करें',
    files: 'फाइल टूल्स',
    everyday: 'दैनिक उपयोगिताएं',
    runtime: 'रनटाइम टूल्स',
    payload: 'पेलोड टूल्स',
    generators: 'जनरेटर और टेस्ट टूल्स',
    heroTitle: 'काम, फाइलों और विकास के लिए रोजमर्रा के टूल्स',
    heroText: 'दस्तावेजों, फाइलों और रोजमर्रा के डेवलपर कार्यों के लिए एक केंद्रित वर्कस्पेस।',
    toolsForWork: 'काम, फाइलों और विकास के लिए टूल्स',
    useTool: 'टूल खोलें ->',
    settingsNote: 'लॉगिन सपोर्ट के साथ यहां और प्राथमिकताएं जोड़ी जा सकती हैं।',
    tools: {
      pdf: ['पीडीएफ मर्ज और स्प्लिट', 'संवेदनशील दस्तावेज अपलोड किए बिना पीडीएफ फाइलों को मिलाएं या पेज निकालें।'],
      pdfMerge: ['पीडीएफ मर्जर', 'दो या अधिक पीडीएफ फाइलों को एक दस्तावेज में मिलाएं।'],
      pdfSplit: ['पीडीएफ स्प्लिटर', 'पीडीएफ से पेज चुनकर नया दस्तावेज डाउनलोड करें।'],
      reorder: ['पीडीएफ पेज क्रम बदलें', 'पीडीएफ पेजों का क्रम बदलकर नया दस्तावेज डाउनलोड करें।'],
      imagesToPdf: ['इमेज से पीडीएफ', 'JPG, PNG और WebP इमेज को एक पीडीएफ में मिलाएं।'],
      pdfCompress: ['पीडीएफ कंप्रेसर', 'ब्राउज़र में स्थानीय रूप से छोटी पीडीएफ कॉपी बनाएं।'],
      pdfToImages: ['पीडीएफ से इमेज', 'चुने हुए पीडीएफ पेजों को PNG इमेज के रूप में डाउनलोड करें।'],
      image: ['इमेज कंप्रेसर', 'JPG, PNG और WebP इमेज का आकार और गुणवत्ता कम करें।'],
      spreadsheet: ['स्प्रेडशीट कन्वर्टर', 'CSV और Excel फाइलों को देखें और CSV या JSON में बदलें।'],
      word: ['वर्ड डॉक्यूमेंट रीडर', 'DOCX टेक्स्ट पढ़ें और साफ टेक्स्ट कॉपी डाउनलोड करें।'],
      text: ['टेक्स्ट क्लीनर', 'कॉपी किए गए टेक्स्ट से अतिरिक्त स्पेस और डुप्लिकेट लाइनें हटाएं।'],
      password: ['पासवर्ड जनरेटर', 'लंबाई और कैरेक्टर सेट के साथ मजबूत पासवर्ड बनाएं।'],
      qr: ['क्यूआर जनरेटर', 'URL, टेक्स्ट और लिंक के लिए डाउनलोड करने योग्य QR कोड बनाएं।'],
      uuid: ['UUID जनरेटर', 'टेस्ट और डेटा के लिए एक या कई UUID बनाएं।'],
      json: ['JSON फॉर्मेटर', 'JSON पेलोड को फॉर्मेट, जांच और पढ़ने योग्य बनाएं।'],
      jwt: ['JWT डिकोडर', 'ऑथ फ्लो को डीबग करते समय JWT हेडर और क्लेम देखें।'],
      base64: ['Base64 टूल', 'टेक्स्ट को Base64 में एन्कोड या डिकोड करें।'],
      url: ['URL एनकोडर', 'URL और क्वेरी स्ट्रिंग को एन्कोड या डिकोड करें।'],
    },
  },
  es: {
    preferences: 'Preferencias',
    pdf: 'Herramientas PDF',
    home: 'Inicio',
    settings: 'Configuración',
    appearance: 'Apariencia',
    appearanceHelp: 'Elige el aspecto de PayloadKit.',
    language: 'Idioma',
    languageHelp: 'Elige tu idioma preferido.',
    applyLanguage: 'Aplicar idioma',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    dashboardMenu: 'Menú del panel',
    closeSettings: 'Cerrar configuración',
    files: 'Herramientas de archivos',
    everyday: 'Utilidades diarias',
    runtime: 'Herramientas de ejecución',
    payload: 'Herramientas de payload',
    generators: 'Generadores y pruebas',
    heroTitle: 'Herramientas diarias para trabajo, archivos y desarrollo',
    heroText: 'Un espacio de trabajo enfocado para documentos, archivos y tareas de desarrollo.',
    toolsForWork: 'Herramientas para trabajo, archivos y desarrollo',
    useTool: 'Abrir herramienta ->',
    settingsNote: 'Aquí se añadirán más preferencias con el soporte de inicio de sesión.',
    tools: {
      pdf: ['Unir y dividir PDF', 'Combina archivos PDF o extrae páginas sin subir documentos sensibles.'],
      pdfMerge: ['Unir PDF', 'Combina dos o más archivos PDF en un documento.'],
      pdfSplit: ['Dividir PDF', 'Selecciona páginas de un PDF y descarga un documento nuevo.'],
      reorder: ['Reordenar páginas PDF', 'Cambia el orden de las páginas y descarga el nuevo documento.'],
      imagesToPdf: ['Imágenes a PDF', 'Combina imágenes JPG, PNG y WebP en un PDF.'],
      pdfCompress: ['Compresor de PDF', 'Crea una copia PDF más pequeña directamente en el navegador.'],
      pdfToImages: ['PDF a imágenes', 'Descarga páginas PDF seleccionadas como imágenes PNG.'],
      image: ['Compresor de imágenes', 'Reduce el tamaño y la calidad de imágenes JPG, PNG y WebP.'],
      spreadsheet: ['Conversor de hojas de cálculo', 'Convierte archivos CSV y Excel a CSV o JSON.'],
      word: ['Lector de documentos Word', 'Lee archivos DOCX y descarga una copia de texto limpio.'],
      text: ['Limpiador de texto', 'Elimina espacios adicionales y líneas duplicadas del texto copiado.'],
      password: ['Generador de contraseñas', 'Crea contraseñas seguras con longitud y caracteres configurables.'],
      qr: ['Generador de QR', 'Crea códigos QR descargables para URL, texto y enlaces.'],
      uuid: ['Generador de UUID', 'Genera uno o varios UUID para pruebas y datos.'],
      json: ['Formateador JSON', 'Formatea, valida y revisa payloads JSON.'],
      jwt: ['Decodificador JWT', 'Inspecciona encabezados y claims JWT.'],
      base64: ['Herramienta Base64', 'Codifica o decodifica texto en Base64.'],
      url: ['Codificador URL', 'Codifica o decodifica URL y cadenas de consulta.'],
    },
  },
};

const getText = (language, key, fallback) => translations[language]?.[key] || fallback;

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
  const [language, setLanguage] = useState(() => window.localStorage.getItem('payloadkit-language') || 'en');
  const [pendingLanguage, setPendingLanguage] = useState(() => window.localStorage.getItem('payloadkit-language') || 'en');
  const text = (key, fallback) => getText(language, key, fallback);
  const localizedToolGroups = visibleToolGroups.map((group) => ({
    ...group,
    title: text({ 'pdf-tools': 'pdf', files: 'files', everyday: 'everyday', backend: 'runtime', payload: 'payload', generation: 'generators' }[group.id], group.title),
    tools: group.tools.map((tool) => ({
      ...tool,
      navLabel: translations[language]?.tools?.[tool.id]?.[0] || tool.navLabel,
      brief: translations[language]?.tools?.[tool.id]?.[1] || tool.brief,
    })),
  }));

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
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navRef = useRef(null);
  const utilityMenuRef = useRef(null);

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
    document.documentElement.lang = language;
  }, [language]);

  const applyLanguage = () => {
    setLanguage(pendingLanguage);
    window.localStorage.setItem('payloadkit-language', pendingLanguage);
    setIsSettingsOpen(false);
  };

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
      if (!navRef.current?.contains(event.target) && !utilityMenuRef.current?.contains(event.target)) {
        setOpenMenuId('');
        setIsUtilityMenuOpen(false);
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
    setIsUtilityMenuOpen(false);
  };

  const renderHome = () => (
    <section className="home-page">
      <div className="hero-copy home-hero">
        <h1>{text('heroTitle', 'Everyday tools for work, files, and development')}</h1>
        <p className="hero-text">
          {text('heroText', 'A focused workspace for documents, files, and everyday developer tasks.')}
        </p>
      </div>

      <div className="cards-section" id="tools-section">
        <div className="tool-group-list">
          {localizedToolGroups.map((group) => (
            <section
              className={group.id === 'backend' ? 'tool-group tool-group--compact' : 'tool-group'}
              key={group.id}
              aria-labelledby={`${group.id}-tools`}
            >
              <div className="tool-group-heading">
                <h3 id={`${group.id}-tools`}>{group.title}</h3>
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
                    <span className="card-link">{text('useTool', 'Use Tool -&gt;')}</span>
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
      case 'pdf':
        return <UtilityTool type="pdf" language={language} />;
      case 'pdfMerge':
        return <UtilityTool type="pdfMerge" language={language} />;
      case 'pdfSplit':
        return <UtilityTool type="pdfSplit" language={language} />;
      case 'image':
        return <UtilityTool type="image" language={language} />;
      case 'spreadsheet':
        return <UtilityTool type="spreadsheet" language={language} />;
      case 'word':
        return <UtilityTool type="word" language={language} />;
      case 'reorder':
        return <UtilityTool type="reorder" language={language} />;
      case 'imagesToPdf':
        return <UtilityTool type="imagesToPdf" language={language} />;
      case 'pdfCompress':
        return <UtilityTool type="pdfCompress" language={language} />;
      case 'pdfToImages':
        return <UtilityTool type="pdfToImages" language={language} />;
      case 'text':
        return <UtilityTool type="text" language={language} />;
      case 'password':
        return <UtilityTool type="password" language={language} />;
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
            {localizedToolGroups.map((group) => {
              const isGroupActive = group.tools.some((tool) => tool.id === activePage);
              const isOpen = openMenuId === group.id;

              return (
                <div
                  className="nav-menu"
                  key={group.id}
                >
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

        <div className="utility-menu" ref={utilityMenuRef}>
          <button
            type="button"
            className="utility-menu-toggle"
            onClick={() => setIsUtilityMenuOpen((current) => !current)}
            aria-label={text('dashboardMenu', 'Open dashboard menu')}
            aria-expanded={isUtilityMenuOpen}
            aria-haspopup="menu"
            title="Dashboard menu"
          >
            <FiGrid aria-hidden="true" />
          </button>
          {isUtilityMenuOpen ? (
            <div className="utility-menu-dropdown" role="menu" aria-label={text('dashboardMenu', 'Dashboard menu')}>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setIsDarkMode((current) => !current)}
                aria-label={isDarkMode ? text('lightMode', 'Switch to light mode') : text('darkMode', 'Switch to dark mode')}
                role="menuitem"
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
                  {isDarkMode ? text('lightMode', 'Light theme') : text('darkMode', 'Dark theme')}
                </span>
              </button>
              <button type="button" className="utility-menu-home" onClick={() => { setIsSettingsOpen(true); setIsUtilityMenuOpen(false); }} role="menuitem">
                <FiSettings aria-hidden="true" />
                <span>{text('settings', 'Settings')}</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className={isMobileMenuOpen ? 'mobile-nav-drawer mobile-nav-drawer--open' : 'mobile-nav-drawer'} id="mobile-nav-drawer">
        <div className="mobile-nav-groups">
          {localizedToolGroups.map((group) => (
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

      {isSettingsOpen ? (
        <div className="settings-backdrop" role="presentation" onMouseDown={() => setIsSettingsOpen(false)}>
          <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="settings-dialog-header">
              <div>
                <p className="panel-kicker">{text('preferences', 'Preferences')}</p>
                <h2 id="settings-title">{text('settings', 'Settings')}</h2>
              </div>
              <button type="button" className="settings-close-button" onClick={() => setIsSettingsOpen(false)} aria-label={text('closeSettings', 'Close settings')}><FiX aria-hidden="true" /></button>
            </div>
            <div className="settings-row">
              <div><strong>{text('appearance', 'Appearance')}</strong><p>{text('appearanceHelp', 'Choose how PayloadKit looks.')}</p></div>
              <button type="button" className="settings-theme-button" onClick={() => setIsDarkMode((current) => !current)}>{isDarkMode ? text('darkMode', 'Dark mode') : text('lightMode', 'Light mode')}</button>
            </div>
            <div className="settings-row">
              <div><strong>{text('language', 'Language')}</strong><p>{text('languageHelp', 'Choose your preferred language.')}</p></div>
              <select className="settings-language-select" value={pendingLanguage} onChange={(event) => setPendingLanguage(event.target.value)} aria-label="Language">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <button type="button" className="settings-apply-button" onClick={applyLanguage} disabled={pendingLanguage === language}>{text('applyLanguage', 'Apply language')}</button>
            <p className="settings-note">{text('settingsNote', 'More preferences, saved tools, and account settings can be added here with login support.')}</p>
          </section>
        </div>
      ) : null}

      <main className="app-content">
        {copyStatus ? <p className="status-banner">{copyStatus}</p> : null}
        {renderPage()}
      </main>

      <footer className="site-footer">
        <p>&copy; 2026 PayloadKit</p>
        <p>{text('toolsForWork', 'Tools for work, files, and development')}</p>
      </footer>
    </div>
  );
}

export default App;
