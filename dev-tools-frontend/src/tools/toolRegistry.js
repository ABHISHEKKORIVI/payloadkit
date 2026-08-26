import {
  FaCode,
  FaExchangeAlt,
  FaKey,
  FaLink,
  FaPlayCircle,
  FaQrcode,
  FaRandom,
  FaClock,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileAlt,
  FaAlignLeft,
  FaLock,
} from 'react-icons/fa';

export const toolGroups = [
  {
    id: 'pdf-tools',
    title: 'PDF Tools',
    description: 'Merge, split, reorder, compress, and convert PDF files locally.',
    tools: [
      {
        id: 'pdfMerge',
        icon: FaFilePdf,
        navLabel: 'PDF Merger',
        brief: 'Combine two or more PDF files into one document locally.',
      },
      {
        id: 'pdfSplit',
        icon: FaFilePdf,
        navLabel: 'PDF Splitter',
        brief: 'Select pages from a PDF and download them as a new document.',
      },
      {
        id: 'reorder',
        icon: FaFilePdf,
        navLabel: 'PDF Page Reorder',
        brief: 'Drag PDF pages into a new order and download the rearranged document.',
      },
      {
        id: 'imagesToPdf',
        icon: FaFileImage,
        navLabel: 'Images to PDF',
        brief: 'Combine JPG, PNG, and WebP images into one downloadable PDF.',
      },
      {
        id: 'pdfCompress',
        icon: FaFilePdf,
        navLabel: 'PDF Compressor',
        brief: 'Create an optimized, smaller PDF copy locally in your browser.',
      },
      {
        id: 'pdfToImages',
        icon: FaFileImage,
        navLabel: 'PDF to Images',
        brief: 'Export selected PDF pages as downloadable PNG images.',
      },
    ],
  },
  {
    id: 'files',
    title: 'File Tools',
    description: 'Work with Word documents, spreadsheets, and images locally before sharing or uploading them.',
    tools: [
      {
        id: 'image',
        icon: FaFileImage,
        navLabel: 'Image Compressor',
        brief: 'Resize and compress JPG, PNG, and WebP images for faster sharing and uploads.',
      },
      {
        id: 'spreadsheet',
        icon: FaFileExcel,
        navLabel: 'Spreadsheet Converter',
        brief: 'Preview CSV and Excel files, then convert the first sheet to CSV or JSON.',
      },
      {
        id: 'word',
        icon: FaFileAlt,
        navLabel: 'Word Document Reader',
        brief: 'Read DOCX text locally and download a clean plain-text copy.',
      },
    ],
  },
  {
    id: 'everyday',
    title: 'Everyday Utilities',
    description: 'Small, useful tools for cleaning text and handling common work tasks.',
    tools: [
      {
        id: 'text',
        icon: FaAlignLeft,
        navLabel: 'Text Cleaner',
        brief: 'Normalize spaces and remove empty or duplicate lines from copied text.',
      },
      {
        id: 'password',
        icon: FaLock,
        navLabel: 'Password Generator',
        brief: 'Generate strong passwords locally with adjustable length and character sets.',
      },
    ],
  },
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
        visible: false,
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
    description: 'Generate QR links and fixtures for everyday development tasks.',
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
  '/pdf-tools': 'pdfMerge',
  '/pdf-merger': 'pdfMerge',
  '/pdf-splitter': 'pdfSplit',
  '/image-compressor': 'image',
  '/spreadsheet-converter': 'spreadsheet',
  '/word-reader': 'word',
  '/pdf-page-reorder': 'reorder',
  '/images-to-pdf': 'imagesToPdf',
  '/pdf-compressor': 'pdfCompress',
  '/pdf-to-images': 'pdfToImages',
  '/text-cleaner': 'text',
  '/password-generator': 'password',
  '/json-formatter': 'json',
  '/jwt-decoder': 'jwt',
  '/qr-generator': 'qr',
  '/base64-tool': 'base64',
  '/url-encoder': 'url',
  '/uuid-generator': 'uuid',
  '/python-runner': 'python',
  '/timestamp-converter': 'timestamp',
};

export const pageToPath = {
  home: '/',
  pdf: '/pdf-tools',
  pdfMerge: '/pdf-merger',
  pdfSplit: '/pdf-splitter',
  image: '/image-compressor',
  spreadsheet: '/spreadsheet-converter',
  word: '/word-reader',
  reorder: '/pdf-page-reorder',
  imagesToPdf: '/images-to-pdf',
  pdfCompress: '/pdf-compressor',
  pdfToImages: '/pdf-to-images',
  text: '/text-cleaner',
  password: '/password-generator',
  json: '/json-formatter',
  jwt: '/jwt-decoder',
  qr: '/qr-generator',
  base64: '/base64-tool',
  url: '/url-encoder',
  uuid: '/uuid-generator',
  python: '/python-runner',
  timestamp: '/timestamp-converter',
};
