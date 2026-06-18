import {
  FaCode,
  FaExchangeAlt,
  FaFingerprint,
  FaKey,
  FaLink,
  FaPlayCircle,
  FaQrcode,
  FaRandom,
  FaSearch,
  FaClock,
} from 'react-icons/fa';

export const toolGroups = [
  {
    id: 'backend',
    title: 'Runtime Tools',
    description: 'Tools that benefit from Python, server runtimes, or heavier execution boundaries.',
    tools: [
      {
        id: 'python',
        icon: FaPlayCircle,
        navLabel: 'Python Compiler',
        brief: 'Run Python snippets through the FastAPI backend for quick logic tests and debugging work.',
      },
    ],
  },
  {
    id: 'payload',
    title: 'Payload Tools',
    description: 'Format, inspect, encode, and transform API payloads without losing flow.',
    tools: [
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
        id: 'base64',
        icon: FaExchangeAlt,
        navLabel: 'Base64 Tool',
        brief: 'Encode or decode text safely for API work, headers, and quick utility tasks.',
      },
      {
        id: 'url',
        icon: FaLink,
        navLabel: 'URL Encoder',
        brief: 'Encode or decode URLs, query strings, and redirect parameters without leaving the browser.',
      },
    ],
  },
  {
    id: 'generation',
    title: 'Generators and Test Helpers',
    description: 'Generate fixtures, links, hashes, timestamps, and quick checks for everyday development.',
    tools: [
      {
        id: 'qr',
        icon: FaQrcode,
        navLabel: 'QR Generator',
        brief: 'Generate downloadable QR codes for URLs, text, onboarding links, or internal tools.',
      },
      {
        id: 'uuid',
        icon: FaRandom,
        navLabel: 'UUID Generator',
        brief: 'Generate one or many UUIDs for payloads, seeds, fixtures, and integration testing work.',
      },
      {
        id: 'hash',
        icon: FaFingerprint,
        navLabel: 'Hash Generator',
        brief: 'Generate SHA-256 or SHA-512 hashes for payload checks, signatures, and integrity checks.',
      },
      {
        id: 'regex',
        icon: FaSearch,
        navLabel: 'Regex Tester',
        brief: 'Test regular expressions against sample text and inspect matches, groups, and flags locally.',
      },
      {
        id: 'timestamp',
        icon: FaClock,
        navLabel: 'Timestamp Converter',
        brief: 'Convert Unix timestamps into readable dates and generate current epoch values for tests.',
        visible: false,
      },
    ],
  },
];

export const visibleToolGroups = toolGroups
  .map((group) => ({
    ...group,
    tools: group.tools.filter((tool) => tool.visible !== false),
  }))
  .filter((group) => group.tools.length > 0);

export const tools = visibleToolGroups.flatMap((group) => group.tools);

export const routeMap = {
  '/': 'home',
  '/json-formatter': 'json',
  '/jwt-decoder': 'jwt',
  '/qr-generator': 'qr',
  '/base64-tool': 'base64',
  '/url-encoder': 'url',
  '/hash-generator': 'hash',
  '/regex-tester': 'regex',
  '/uuid-generator': 'uuid',
  '/python-runner': 'python',
  '/timestamp-converter': 'timestamp',
};

export const pageToPath = {
  home: '/',
  json: '/json-formatter',
  jwt: '/jwt-decoder',
  qr: '/qr-generator',
  base64: '/base64-tool',
  url: '/url-encoder',
  hash: '/hash-generator',
  regex: '/regex-tester',
  uuid: '/uuid-generator',
  python: '/python-runner',
  timestamp: '/timestamp-converter',
};
