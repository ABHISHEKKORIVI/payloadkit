import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth/mammoth.browser';
import { FaBan, FaCompressArrowsAlt, FaFilePdf, FaInfoCircle, FaObjectGroup, FaSpinner, FaTrashAlt, FaUpload } from 'react-icons/fa';

const MAX_PDF_FILES = 10;

const TOOL_COPY = {
  pdf: {
    kicker: 'File Tool',
    title: 'PDF Merge & Split',
    description: 'Combine PDFs or extract selected pages locally in your browser. Your files stay on this device.',
  },
  image: {
    kicker: 'File Tool',
    title: 'Image Compressor',
    description: 'Resize and compress JPG, PNG, or WebP images before sharing or uploading them.',
  },
  spreadsheet: {
    kicker: 'Office Tool',
    title: 'Spreadsheet Converter',
    description: 'Preview spreadsheet data and convert CSV, XLS, and XLSX files into CSV or JSON.',
  },
  word: {
    kicker: 'Office Tool',
    title: 'Word Document Reader',
    description: 'Open DOCX files locally, preview their text, and download a clean text copy.',
  },
  text: {
    kicker: 'Everyday Tool',
    title: 'Text Cleaner',
    description: 'Clean copied text by removing extra spaces, duplicate lines, or empty lines.',
  },
  password: {
    kicker: 'Security Tool',
    title: 'Password Generator',
    description: 'Create strong passwords locally with controls for length and character types.',
  },
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const readFileAsArrayBuffer = (file) => file.arrayBuffer();

const getFileStem = (filename) => filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

const createMergeFilename = (selectedFiles) => {
  const names = selectedFiles.map((file) => getFileStem(file.name)).filter(Boolean);
  const visibleNames = names.length > 3 ? [...names.slice(0, 2), `${names.length - 2}-more`] : names;
  return `${visibleNames.join('-and-') || 'documents'}-merged.pdf`;
};

function ToolFrame({ type, children }) {
  const copy = TOOL_COPY[type];

  return (
    <section className="page-panel utility-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p className="page-text">{copy.description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PdfTool() {
  const [mode, setMode] = useState('merge');
  const [files, setFiles] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [previewPage, setPreviewPage] = useState(0);
  const [previewImage, setPreviewImage] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (mode === 'split') {
      setFiles(selectedFiles.slice(0, 1));
      loadPageList(selectedFiles[0]);
    } else {
      const existingNames = new Set(files.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const newFiles = selectedFiles.filter((file) => !existingNames.has(`${file.name}-${file.size}-${file.lastModified}`));
      const nextFiles = [...files, ...newFiles];
      setFiles(nextFiles.slice(0, MAX_PDF_FILES));
      setError(nextFiles.length > MAX_PDF_FILES ? `You can merge up to ${MAX_PDF_FILES} PDF files at a time.` : '');
    }
    setStatus('');
    if (mode === 'split') setError('');
    event.target.value = '';
  };

  const loadPageList = async (file) => {
    setPageCount(0);
    setSelectedPages([]);
    setPreviewPage(0);
    setPreviewImage('');
    if (!file) return;

    setError('');
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      setPageCount(pdf.getPageCount());
      setPreviewPage(1);
      loadPagePreview(file, 1);
    } catch (previewError) {
      setError(previewError.message || 'Unable to read this PDF.');
    }
  };

  const loadPagePreview = async (file, pageNumber) => {
    if (!file || !pageNumber) return;
    setPreviewLoading(true);
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'data:application/javascript,;';
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), disableWorker: true }).promise;
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(1, 680 / baseViewport.width) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      setPreviewImage(canvas.toDataURL('image/jpeg', 0.86));
    } catch (previewError) {
      setError(previewError.message || 'Unable to preview this page.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setFiles([]);
    setStatus('');
    setError('');
    setPageCount(0);
    setSelectedPages([]);
    setPreviewPage(0);
    setPreviewImage('');
  };

  const removeFile = (fileToRemove) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file !== fileToRemove));
    setStatus('');
    setError('');
  };

  const createMergedPdf = async () => {
    const merged = await PDFDocument.create();
    for (const file of files) {
      const source = await PDFDocument.load(await readFileAsArrayBuffer(file));
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }
    return new Blob([await merged.save()], { type: 'application/pdf' });
  };

  const createSplitPdf = async () => {
    const source = await PDFDocument.load(await readFileAsArrayBuffer(files[0]));
    const validPages = selectedPages.filter((page) => page >= 1 && page <= source.getPageCount());

    if (!validPages.length) {
      throw new Error('Select at least one page to extract.');
    }

    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, validPages.map((page) => page - 1));
    pages.forEach((page) => output.addPage(page));
    return new Blob([await output.save()], { type: 'application/pdf' });
  };

  const togglePage = (pageNumber) => {
    setPreviewPage(pageNumber);
    loadPagePreview(files[0], pageNumber);
    setSelectedPages((currentPages) => currentPages.includes(pageNumber)
      ? currentPages.filter((page) => page !== pageNumber)
      : [...currentPages, pageNumber].sort((first, second) => first - second));
  };

  const isSinglePagePdf = mode === 'split' && pageCount === 1;

  const processPdfs = async () => {
    setBusy(true);
    setProcessingStage('merging');
    setError('');
    setStatus('');
    try {
      if (mode === 'merge') {
        if (files.length < 2) throw new Error('Choose at least two PDF files to merge.');
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        const mergedPdf = await createMergedPdf();
        setProcessingStage('downloading');
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        downloadBlob(mergedPdf, createMergeFilename(files));
        setFiles([]);
        setStatus(`${files.length} PDFs merged and downloaded successfully.`);
      } else {
        if (files.length !== 1) throw new Error('Choose one PDF to split.');
        if (isSinglePagePdf) throw new Error('This PDF has only one page and cannot be split.');
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        const splitPdf = await createSplitPdf();
        setProcessingStage('downloading');
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        downloadBlob(splitPdf, `${getFileStem(files[0].name) || 'document'}-pages-${selectedPages.join('-')}.pdf`);
        setFiles([]);
        setPageCount(0);
        setSelectedPages([]);
        setPreviewImage('');
        setPreviewPage(0);
        setStatus('Selected pages downloaded successfully.');
      }
    } catch (processError) {
      setError(processError.message || 'Unable to process the PDF.');
    } finally {
      setBusy(false);
      setProcessingStage('');
    }
  };

  return (
    <ToolFrame type="pdf">
      <div className="utility-controls pdf-utility-controls">
        <div className="pdf-operation-tabs" role="tablist" aria-label="PDF operation">
          <button type="button" className={mode === 'merge' ? 'pdf-operation-tab active' : 'pdf-operation-tab'} onClick={() => changeMode('merge')} role="tab" aria-selected={mode === 'merge'}>
            <FaObjectGroup aria-hidden="true" />
            <span>Merge PDFs</span>
            <small>Combine two or more files</small>
          </button>
          <button type="button" className={mode === 'split' ? 'pdf-operation-tab active' : 'pdf-operation-tab'} onClick={() => changeMode('split')} role="tab" aria-selected={mode === 'split'}>
            <FaCompressArrowsAlt aria-hidden="true" />
            <span>Split PDF</span>
            <small>Extract selected pages</small>
          </button>
        </div>

        <label className="stacked-label" htmlFor="pdf-files">{mode === 'merge' ? 'PDF files to merge' : 'PDF file to split'}</label>
        <input id="pdf-files" className="pdf-file-input" type="file" accept="application/pdf" multiple={mode === 'merge'} onChange={handleFiles} />
        <label className="pdf-file-picker" htmlFor="pdf-files">
          <FaUpload aria-hidden="true" />
          <span>{mode === 'merge' && files.length ? 'Add more PDF files' : 'Choose PDF file' + (mode === 'merge' ? 's' : '')}</span>
        </label>
        {mode === 'merge' ? <p className="helper-text pdf-limit-hint">You can select up to {MAX_PDF_FILES} PDF files.</p> : null}
        {mode === 'merge' && files.length ? (
          <div className="selected-files" aria-live="polite">
            <div className="selected-files-heading"><strong>Selected PDF{files.length === 1 ? '' : 's'} ({files.length})</strong><button type="button" className="copy-button clear-files-button" onClick={() => setFiles([])}><FaTrashAlt aria-hidden="true" /> Clear all</button></div>
            <ul className="selected-files-list">{files.map((file) => <li key={`${file.name}-${file.size}-${file.lastModified}`}><FaFilePdf aria-hidden="true" /><span>{file.name}</span><button type="button" className="file-remove-button" onClick={() => removeFile(file)} aria-label={`Remove ${file.name}`} title={`Remove ${file.name}`}><FaTrashAlt aria-hidden="true" /></button></li>)}</ul>
          </div>
        ) : null}
        {mode === 'split' && files.length ? (
          <div className="split-page-picker">
            <p className="split-picker-help">This PDF has {pageCount} page{pageCount === 1 ? '' : 's'}. Select the pages you want to extract.</p>
            <div className="split-picker-heading"><strong>{selectedPages.length} of {pageCount} pages selected</strong><div className="button-row"><button type="button" className="copy-button" onClick={() => setSelectedPages(Array.from({ length: pageCount }, (_, index) => index + 1))}>Select all</button><button type="button" className="copy-button" onClick={() => setSelectedPages([])}>Clear selection</button></div></div>
            {isSinglePagePdf ? <p className="pdf-single-page-note"><FaInfoCircle aria-hidden="true" /> This PDF has only one page, so there is nothing to split.</p> : null}
            <div className="split-content"><div className="pdf-page-grid">{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} className={selectedPages.includes(pageNumber) ? 'pdf-page-card selected' : 'pdf-page-card'} onClick={() => togglePage(pageNumber)} aria-pressed={selectedPages.includes(pageNumber)}><span className="pdf-page-number">{pageNumber}</span><span>Page {pageNumber}</span></button>)}</div><aside className="pdf-page-preview"><strong>Page {previewPage || 1} preview</strong>{previewLoading ? <p className="helper-text">Loading preview...</p> : previewImage ? <img src={previewImage} alt={`Preview of page ${previewPage}`} /> : <p className="helper-text">Select a page to preview it.</p>}</aside></div>
          </div>
        ) : null}
        {mode === 'split' && !files.length ? <p className="helper-text">Choose one PDF file to see and select its pages.</p> : null}
        <button type="button" className={((mode === 'merge' && files.length < 2) || (mode === 'split' && (!selectedPages.length || isSinglePagePdf))) ? 'pdf-process-button disabled' : 'pdf-process-button'} onClick={processPdfs} disabled={busy || (mode === 'merge' && files.length < 2) || (mode === 'split' && (!selectedPages.length || isSinglePagePdf))}>
          {busy ? <><FaSpinner className="loading-icon" aria-hidden="true" /> {processingStage === 'merging' ? mode === 'merge' ? 'Merging PDFs...' : 'Extracting pages...' : 'Preparing download...'}</> : mode === 'merge' && files.length < 2 ? <><FaBan aria-hidden="true" /> Merge and Download</> : mode === 'merge' ? 'Merge and Download' : 'Extract Selected Pages'}
        </button>
        {mode === 'merge' && files.length < 2 ? <p className="helper-text pdf-requirement"><FaInfoCircle aria-hidden="true" /> <span>Choose at least two PDF files to merge. You can select another file above.</span></p> : null}
        {mode === 'split' && !files.length ? <p className="helper-text">Choose one PDF file, then enter the pages you want to extract.</p> : null}
        {status ? <p className="success-text">{status}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </ToolFrame>
  );
}

function ImageTool() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState('0.8');
  const [maxWidth, setMaxWidth] = useState('1600');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const compressImage = () => {
    if (!file) {
      setError('Choose an image first.');
      return;
    }
    setError('');
    const image = new Image();
    image.onload = () => {
      const width = Math.min(image.naturalWidth, Number(maxWidth) || image.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(image.naturalHeight * (width / image.naturalWidth));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('This image could not be compressed.');
          return;
        }
        downloadBlob(blob, `compressed-${file.name.replace(/\.[^.]+$/, '')}.jpg`);
        setStatus(`${Math.round(blob.size / 1024)} KB JPG downloaded.`);
      }, 'image/jpeg', Number(quality));
    };
    image.onerror = () => setError('This image could not be read.');
    image.src = URL.createObjectURL(file);
  };

  return (
    <ToolFrame type="image">
      <div className="utility-controls">
        <label htmlFor="image-file">Image file</label>
        <input id="image-file" className="tool-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setFile(event.target.files?.[0] || null); setStatus(''); setError(''); }} />
        <label className="stacked-label" htmlFor="image-quality">Quality: {Math.round(Number(quality) * 100)}%</label>
        <input id="image-quality" type="range" min="0.2" max="1" step="0.05" value={quality} onChange={(event) => setQuality(event.target.value)} />
        <label className="stacked-label" htmlFor="image-width">Maximum width in pixels</label>
        <input id="image-width" className="tool-input" type="number" min="100" value={maxWidth} onChange={(event) => setMaxWidth(event.target.value)} />
        <button type="button" onClick={compressImage}>Compress and Download</button>
        {status ? <p className="success-text">{status}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </ToolFrame>
  );
}

function SpreadsheetTool() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('csv');
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');

  const loadSpreadsheet = async (nextFile) => {
    setFile(nextFile);
    setError('');
    setPreview([]);
    if (!nextFile) return;
    try {
      const workbook = XLSX.read(await nextFile.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      setPreview(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }).slice(0, 8));
    } catch (readError) {
      setError(readError.message || 'Unable to read this spreadsheet.');
    }
  };

  const convertSpreadsheet = async () => {
    if (!file) {
      setError('Choose a CSV, XLS, or XLSX file first.');
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const output = format === 'json'
        ? JSON.stringify(XLSX.utils.sheet_to_json(sheet, { defval: '' }), null, 2)
        : XLSX.utils.sheet_to_csv(sheet);
      downloadBlob(new Blob([output], { type: format === 'json' ? 'application/json' : 'text/csv' }), `converted.${format}`);
      setError('');
    } catch (conversionError) {
      setError(conversionError.message || 'Unable to convert this spreadsheet.');
    }
  };

  return (
    <ToolFrame type="spreadsheet">
      <div className="utility-controls">
        <label htmlFor="spreadsheet-file">Spreadsheet file</label>
        <input id="spreadsheet-file" className="tool-input" type="file" accept=".csv,.xls,.xlsx" onChange={(event) => loadSpreadsheet(event.target.files?.[0] || null)} />
        <label className="stacked-label" htmlFor="spreadsheet-format">Convert to</label>
        <select id="spreadsheet-format" className="tool-select" value={format} onChange={(event) => setFormat(event.target.value)}>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        <button type="button" onClick={convertSpreadsheet}>Convert and Download</button>
        {preview.length ? (
          <div className="table-wrap">
            <table>
              <tbody>{preview.map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`cell-${rowIndex}-${cellIndex}`}>{String(cell)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </ToolFrame>
  );
}

function WordTool() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const readDocument = async (nextFile) => {
    setFile(nextFile);
    setText('');
    setError('');
    if (!nextFile) return;
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: await nextFile.arrayBuffer() });
      setText(result.value);
    } catch (readError) {
      setError(readError.message || 'Unable to read this Word document.');
    }
  };

  return (
    <ToolFrame type="word">
      <div className="utility-controls">
        <label htmlFor="word-file">Word document</label>
        <input id="word-file" className="tool-input" type="file" accept=".docx" onChange={(event) => readDocument(event.target.files?.[0] || null)} />
        {file && text ? <button type="button" onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), `${file.name.replace(/\.docx$/i, '')}.txt`)}>Download Text Copy</button> : null}
        {text ? <div className="output-block"><div className="output-header"><span>Document text</span></div><pre className="plain-output">{text}</pre></div> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </ToolFrame>
  );
}

function TextTool() {
  const [text, setText] = useState('Paste text here to clean it.\n\nDuplicate line\nDuplicate line');
  const [output, setOutput] = useState('');
  const cleanText = (operation) => {
    const lines = text.split(/\r?\n/);
    const result = operation === 'spaces'
      ? text.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '')
      : lines.filter((line) => operation !== 'empty' || line.trim()).filter((line, index, values) => operation !== 'duplicates' || values.indexOf(line) === index).join('\n');
    setOutput(result);
  };

  return (
    <ToolFrame type="text">
      <div className="tool-layout">
        <div className="input-panel"><label htmlFor="text-input">Input text</label><textarea id="text-input" value={text} onChange={(event) => setText(event.target.value)} /></div>
        <div className="button-row utility-button-row">
          <button type="button" onClick={() => cleanText('spaces')}>Normalize spaces</button>
          <button type="button" onClick={() => cleanText('empty')}>Remove empty lines</button>
          <button type="button" onClick={() => cleanText('duplicates')}>Remove duplicates</button>
        </div>
        <div className="output-block"><div className="output-header"><span>Cleaned text</span></div><pre className="plain-output">{output || 'Your cleaned text will appear here.'}</pre></div>
      </div>
    </ToolFrame>
  );
}

function PasswordTool() {
  const [length, setLength] = useState(20);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState('');
  const generate = () => {
    const groups = [options.upper ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : '', options.lower ? 'abcdefghijkmnopqrstuvwxyz' : '', options.numbers ? '23456789' : '', options.symbols ? '!@#$%^&*_-+=' : ''].join('');
    if (!groups) return;
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    setPassword(Array.from(values, (value) => groups[value % groups.length]).join(''));
  };

  return (
    <ToolFrame type="password">
      <div className="utility-controls">
        <label htmlFor="password-length">Length: {length}</label>
        <input id="password-length" type="range" min="8" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} />
        <div className="checkbox-grid">{[['upper', 'Uppercase'], ['lower', 'Lowercase'], ['numbers', 'Numbers'], ['symbols', 'Symbols']].map(([key, label]) => <label key={key}><input type="checkbox" checked={options[key]} onChange={(event) => setOptions({ ...options, [key]: event.target.checked })} /> {label}</label>)}</div>
        <button type="button" onClick={generate}>Generate Password</button>
        <div className="output-block"><div className="output-header"><span>Generated password</span><button type="button" className="copy-button" onClick={() => navigator.clipboard?.writeText(password)}>Copy</button></div><pre className="plain-output compact-output">{password || 'Generate a password to see it here.'}</pre></div>
      </div>
    </ToolFrame>
  );
}

export default function UtilityTool({ type }) {
  if (type === 'pdf') return <PdfTool />;
  if (type === 'image') return <ImageTool />;
  if (type === 'spreadsheet') return <SpreadsheetTool />;
  if (type === 'word') return <WordTool />;
  if (type === 'text') return <TextTool />;
  return <PasswordTool />;
}
