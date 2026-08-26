import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import mammoth from 'mammoth/mammoth.browser';
import { FaBan, FaCompressArrowsAlt, FaFilePdf, FaInfoCircle, FaObjectGroup, FaSpinner, FaTrashAlt, FaUpload } from 'react-icons/fa';

const MAX_PDF_FILES = 10;

const TOOL_COPY = {
  pdf: {
    kicker: 'File Tool',
    title: 'PDF Merge & Split',
    description: 'Combine PDFs or extract selected pages locally in your browser. Your files stay on this device.',
  },
  pdfMerge: {
    kicker: 'PDF Tool',
    title: 'PDF Merger',
    description: 'Combine two or more PDF files into one document locally in your browser.',
  },
  pdfSplit: {
    kicker: 'PDF Tool',
    title: 'PDF Splitter',
    description: 'Select pages from a PDF and download them as a new document locally.',
  },
  reorder: {
    kicker: 'File Tool',
    title: 'PDF Page Reorder',
    description: 'Arrange PDF pages in a new order and download the updated document locally.',
  },
  imagesToPdf: {
    kicker: 'File Tool',
    title: 'Images to PDF',
    description: 'Combine JPG, PNG, and WebP images into one PDF without uploading your files.',
  },
  pdfCompress: {
    kicker: 'File Tool',
    title: 'PDF Compressor',
    description: 'Create a smaller, optimized copy of a PDF directly in your browser.',
  },
  pdfToImages: {
    kicker: 'File Tool',
    title: 'PDF to Images',
    description: 'Convert selected PDF pages into downloadable PNG images locally.',
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

const UTILITY_TRANSLATIONS = {
  hi: {
    pdf: ['पीडीएफ मर्ज और स्प्लिट', 'संवेदनशील दस्तावेज अपलोड किए बिना पीडीएफ फाइलों को मिलाएं या चुने हुए पेज निकालें।'],
    pdfMerge: ['पीडीएफ मर्जर', 'दो या अधिक पीडीएफ फाइलों को एक दस्तावेज में मिलाएं।'],
    pdfSplit: ['पीडीएफ स्प्लिटर', 'पीडीएफ से पेज चुनकर नया दस्तावेज डाउनलोड करें।'],
    image: ['इमेज कंप्रेसर', 'शेयर या अपलोड करने से पहले JPG, PNG या WebP इमेज का आकार कम करें।'],
    spreadsheet: ['स्प्रेडशीट कन्वर्टर', 'CSV, XLS और XLSX फाइलों को देखें और CSV या JSON में बदलें।'],
    word: ['वर्ड डॉक्यूमेंट रीडर', 'DOCX फाइल खोलें, उसका टेक्स्ट देखें और साफ टेक्स्ट कॉपी डाउनलोड करें।'],
    text: ['टेक्स्ट क्लीनर', 'कॉपी किए गए टेक्स्ट से अतिरिक्त स्पेस, खाली लाइन और डुप्लिकेट लाइन हटाएं।'],
    password: ['पासवर्ड जनरेटर', 'लंबाई और कैरेक्टर प्रकार चुनकर मजबूत पासवर्ड बनाएं।'],
  },
  es: {
    pdf: ['Unir y dividir PDF', 'Combina archivos PDF o extrae páginas seleccionadas sin subir documentos sensibles.'],
    pdfMerge: ['Unir PDF', 'Combina dos o más archivos PDF en un documento.'],
    pdfSplit: ['Dividir PDF', 'Selecciona páginas de un PDF y descarga un documento nuevo.'],
    image: ['Compresor de imágenes', 'Reduce imágenes JPG, PNG o WebP antes de compartirlas o subirlas.'],
    spreadsheet: ['Conversor de hojas de cálculo', 'Previsualiza archivos CSV, XLS y XLSX y conviértelos a CSV o JSON.'],
    word: ['Lector de documentos Word', 'Abre archivos DOCX, revisa su texto y descarga una copia limpia.'],
    text: ['Limpiador de texto', 'Elimina espacios adicionales, líneas vacías y duplicados del texto copiado.'],
    password: ['Generador de contraseñas', 'Crea contraseñas seguras eligiendo longitud y tipos de caracteres.'],
  },
};

const utilityText = (language, type, index) => UTILITY_TRANSLATIONS[language]?.[type]?.[index] || TOOL_COPY[type][index === 0 ? 'title' : 'description'];

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const readFileAsArrayBuffer = (file) => file.arrayBuffer();
const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const getFileStem = (filename) => filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

const createMergeFilename = (selectedFiles) => {
  const names = selectedFiles.map((file) => getFileStem(file.name)).filter(Boolean);
  const visibleNames = names.length > 3 ? [...names.slice(0, 2), `${names.length - 2}-more`] : names;
  return `${visibleNames.join('-and-') || 'documents'}-merged.pdf`;
};

function ToolFrame({ type, language = 'en', children }) {
  const copy = TOOL_COPY[type];

  return (
    <section className="page-panel utility-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">{copy.kicker}</p>
          <h1>{utilityText(language, type, 0)}</h1>
          <p className="page-text">{utilityText(language, type, 1)}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PdfTool({ language, initialMode }) {
  const isDedicatedSplitter = initialMode === 'split';
  const [mode, setMode] = useState(() => (isDedicatedSplitter ? 'split' : 'merge'));
  const [files, setFiles] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
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
    if (!file) return;

    setError('');
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch (previewError) {
      setError(previewError.message || 'Unable to read this PDF.');
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setFiles([]);
    setStatus('');
    setError('');
    setPageCount(0);
    setSelectedPages([]);
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
    setSelectedPages((currentPages) => currentPages.includes(pageNumber)
      ? currentPages.filter((page) => page !== pageNumber)
      : [...currentPages, pageNumber].sort((first, second) => first - second));
  };

  const isSinglePagePdf = mode === 'split' && pageCount === 1;
  const canMerge = mode === 'merge' && files.length >= 2 && files.length <= MAX_PDF_FILES;
  const canSplit = mode === 'split' && files.length === 1 && pageCount >= 2 && selectedPages.length > 0;

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
        if (pageCount < 2) throw new Error('This PDF must have at least two pages to split.');
        if (!selectedPages.length) throw new Error('Select at least one page to extract.');
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        const splitPdf = await createSplitPdf();
        setProcessingStage('downloading');
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        downloadBlob(splitPdf, `${getFileStem(files[0].name) || 'document'}-pages-${selectedPages.join('-')}.pdf`);
        setFiles([]);
        setPageCount(0);
        setSelectedPages([]);
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
    <ToolFrame type={initialMode === 'split' ? 'pdfSplit' : 'pdfMerge'} language={language}>
      <div className="utility-controls pdf-utility-controls">
        {!initialMode ? <div className="pdf-operation-tabs" role="tablist" aria-label="PDF operation">
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
        </div> : null}

        <label className="stacked-label" htmlFor="pdf-files">{isDedicatedSplitter || mode === 'split' ? 'PDF file to split' : 'PDF files to merge'}</label>
        <input id="pdf-files" className="pdf-file-input" type="file" accept="application/pdf" multiple={!isDedicatedSplitter && mode === 'merge'} onChange={handleFiles} />
        <label className="pdf-file-picker" htmlFor="pdf-files">
          <FaUpload aria-hidden="true" />
          <span>{!isDedicatedSplitter && mode === 'merge' && files.length ? 'Add more PDF files' : 'Choose PDF file' + (!isDedicatedSplitter && mode === 'merge' ? 's' : '')}</span>
        </label>
        {!isDedicatedSplitter && mode === 'merge' ? <p className="helper-text pdf-limit-hint">You can select up to {MAX_PDF_FILES} PDF files.</p> : null}
        {!isDedicatedSplitter && mode === 'merge' && files.length ? (
          <div className="selected-files" aria-live="polite">
            <div className="selected-files-heading"><strong>Selected PDF{files.length === 1 ? '' : 's'} ({files.length})</strong><button type="button" className="copy-button clear-files-button" onClick={() => setFiles([])}><FaTrashAlt aria-hidden="true" /> Clear all</button></div>
            <ul className="selected-files-list">{files.map((file) => <li key={`${file.name}-${file.size}-${file.lastModified}`}><FaFilePdf aria-hidden="true" /><span>{file.name}</span><button type="button" className="file-remove-button" onClick={() => removeFile(file)} aria-label={`Remove ${file.name}`} title={`Remove ${file.name}`}><FaTrashAlt aria-hidden="true" /></button></li>)}</ul>
          </div>
        ) : null}
        {(isDedicatedSplitter || mode === 'split') && files.length ? (
          <div className="split-page-picker">
            <p className="split-picker-help">This PDF has {pageCount} page{pageCount === 1 ? '' : 's'}. Select the pages you want to extract.</p>
            <div className="split-picker-heading"><strong>{selectedPages.length} of {pageCount} pages selected</strong><div className="button-row"><button type="button" className="copy-button" onClick={() => setSelectedPages(Array.from({ length: pageCount }, (_, index) => index + 1))}>Select all</button><button type="button" className="copy-button" onClick={() => setSelectedPages([])}>Clear selection</button></div></div>
            {isSinglePagePdf ? <p className="pdf-single-page-note"><FaInfoCircle aria-hidden="true" /> This PDF has only one page, so there is nothing to split.</p> : null}
            <div className="pdf-page-grid">{Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} className={selectedPages.includes(pageNumber) ? 'pdf-page-card selected' : 'pdf-page-card'} onClick={() => togglePage(pageNumber)} aria-pressed={selectedPages.includes(pageNumber)}><span className="pdf-page-number">{pageNumber}</span><span>Page {pageNumber}</span></button>)}</div>
          </div>
        ) : null}
        {(isDedicatedSplitter || mode === 'split') && !files.length ? <p className="helper-text">Choose one PDF file to see and select its pages.</p> : null}
        <button type="button" className={((!isDedicatedSplitter && mode === 'merge' && !canMerge) || ((isDedicatedSplitter || mode === 'split') && !canSplit)) ? 'pdf-process-button disabled' : 'pdf-process-button'} onClick={processPdfs} disabled={busy || ((!isDedicatedSplitter && mode === 'merge') ? !canMerge : !canSplit)}>
          {busy ? <><FaSpinner className="loading-icon" aria-hidden="true" /> {processingStage === 'merging' ? (!isDedicatedSplitter && mode === 'merge' ? 'Merging PDFs...' : 'Extracting pages...') : 'Preparing download...'}</> : !isDedicatedSplitter && mode === 'merge' && files.length < 2 ? <><FaBan aria-hidden="true" /> Merge and Download</> : !isDedicatedSplitter && mode === 'merge' ? 'Merge and Download' : 'Extract Selected Pages'}
        </button>
        {!isDedicatedSplitter && mode === 'merge' && files.length < 2 ? <p className="helper-text pdf-requirement"><FaInfoCircle aria-hidden="true" /> <span>Choose at least two PDF files to merge. You can select another file above.</span></p> : null}
        {(isDedicatedSplitter || mode === 'split') && !files.length ? <p className="helper-text">Choose one PDF file, then select the pages you want to extract.</p> : null}
        {status ? <p className="success-text">{status}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </ToolFrame>
  );
}

function PdfFileInput({ id, label, multiple, onChange }) {
  return (
    <>
      <label className="stacked-label" htmlFor={id}>{label}</label>
      <input id={id} className="pdf-file-input" type="file" accept="application/pdf" multiple={multiple} onChange={onChange} />
      <label className="pdf-file-picker" htmlFor={id}><FaUpload aria-hidden="true" /><span>{multiple ? 'Choose PDF files' : 'Choose PDF file'}</span></label>
    </>
  );
}

function ReorderTool({ language }) {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [draggedPage, setDraggedPage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');

  const loadFile = async (nextFile) => {
    setFile(nextFile);
    setPages([]);
    setError('');
    if (!nextFile) return;
    try {
      const pdf = await PDFDocument.load(await nextFile.arrayBuffer());
      setPages(Array.from({ length: pdf.getPageCount() }, (_, index) => index + 1));
    } catch (loadError) {
      setError(loadError.message || 'Unable to read this PDF.');
    }
  };

  const movePage = (targetPage) => {
    if (!draggedPage || draggedPage === targetPage) return;
    setPages((currentPages) => {
      const nextPages = [...currentPages];
      const fromIndex = nextPages.indexOf(draggedPage);
      const toIndex = nextPages.indexOf(targetPage);
      nextPages.splice(fromIndex, 1);
      nextPages.splice(toIndex, 0, draggedPage);
      return nextPages;
    });
    setDraggedPage(null);
  };

  const downloadReordered = async () => {
    if (!file || pages.length < 2) return;
    setBusy(true);
    setStage('processing');
    setError('');
    try {
      await wait(2000);
      const source = await PDFDocument.load(await file.arrayBuffer());
      const output = await PDFDocument.create();
      const copiedPages = await output.copyPages(source, pages.map((page) => page - 1));
      copiedPages.forEach((page) => output.addPage(page));
      const reorderedPdf = new Blob([await output.save()], { type: 'application/pdf' });
      setStage('downloading');
      await wait(2000);
      downloadBlob(reorderedPdf, `${getFileStem(file.name) || 'document'}-reordered.pdf`);
      setFile(null);
      setPages([]);
    } catch (downloadError) { setError(downloadError.message || 'Unable to reorder this PDF.'); }
    finally { setBusy(false); setStage(''); }
  };

  return <ToolFrame type="reorder" language={language}><div className="utility-controls"><PdfFileInput id="reorder-file" label="PDF to reorder" onChange={(event) => loadFile(event.target.files?.[0] || null)} />{pages.length ? <><p className="split-picker-help">Drag pages into the order you want. This PDF has {pages.length} pages.</p><div className="reorder-page-grid">{pages.map((pageNumber) => <button type="button" draggable key={pageNumber} className="reorder-page-card" onDragStart={() => setDraggedPage(pageNumber)} onDragOver={(event) => event.preventDefault()} onDrop={() => movePage(pageNumber)}><span className="pdf-page-number">{pageNumber}</span><span>Page {pageNumber}</span></button>)}</div><button type="button" onClick={downloadReordered} disabled={busy || pages.length < 2}>{busy ? `${stage === 'processing' ? 'Reordering...' : 'Preparing download...'}` : 'Reorder and Download'}</button></> : null}{error ? <p className="error-text">{error}</p> : null}</div></ToolFrame>;
}

const imageToJpegBytes = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = async () => {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1400 / image.naturalWidth);
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => resolve(new Uint8Array(await blob.arrayBuffer())), 'image/jpeg', 0.9);
  };
  image.onerror = reject;
  image.src = URL.createObjectURL(file);
});

function ImagesToPdfTool({ language }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const createPdf = async () => {
    if (!files.length) { setError('Choose at least one image.'); return; }
    try {
      setBusy(true); setStage('processing');
      await wait(2000);
      const pdf = await PDFDocument.create();
      for (const file of files) {
        const image = await pdf.embedJpg(await imageToJpegBytes(file));
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const imagePdf = new Blob([await pdf.save()], { type: 'application/pdf' });
      setStage('downloading');
      await wait(2000);
      downloadBlob(imagePdf, 'images-document.pdf');
      setFiles([]);
    } catch (createError) { setError(createError.message || 'Unable to create the PDF.'); }
    finally { setBusy(false); setStage(''); }
  };
  return <ToolFrame type="imagesToPdf" language={language}><div className="utility-controls"><label className="stacked-label" htmlFor="images-to-pdf">Image files</label><input id="images-to-pdf" className="pdf-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { setFiles(Array.from(event.target.files || [])); setError(''); }} /><label className="pdf-file-picker" htmlFor="images-to-pdf"><FaUpload aria-hidden="true" /><span>{files.length ? 'Add more images' : 'Choose image files'}</span></label>{files.length ? <p className="helper-text">{files.length} image{files.length === 1 ? '' : 's'} ready to combine.</p> : null}<button type="button" onClick={createPdf} disabled={busy || !files.length}>{busy ? `${stage === 'processing' ? 'Creating PDF...' : 'Preparing download...'}` : 'Create PDF and Download'}</button>{error ? <p className="error-text">{error}</p> : null}</div></ToolFrame>;
}

function PdfCompressTool({ language }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const compress = async () => {
    if (!file) { setError('Choose a PDF first.'); return; }
    try {
      setBusy(true); setStage('processing');
      await wait(2000);
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'data:application/javascript,;';
      const source = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), disableWorker: true }).promise;
      const output = await PDFDocument.create();
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
        const page = await source.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.9 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.62));
        const embedded = await output.embedJpg(await jpeg.arrayBuffer());
        const outputPage = output.addPage([embedded.width, embedded.height]);
        outputPage.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }
      const optimizedPdf = new Blob([await output.save({ useObjectStreams: true })], { type: 'application/pdf' });
      setStage('downloading');
      await wait(2000);
      downloadBlob(optimizedPdf, `${getFileStem(file.name) || 'document'}-compressed.pdf`);
      setFile(null);
      setStatus('Compressed PDF downloaded.');
    } catch (compressError) { setError(compressError.message || 'Unable to optimize this PDF.'); }
    finally { setBusy(false); setStage(''); }
  };
  return <ToolFrame type="pdfCompress" language={language}><div className="utility-controls"><PdfFileInput id="compress-file" label="PDF to compress" onChange={(event) => { setFile(event.target.files?.[0] || null); setStatus(''); setError(''); }} /><button type="button" onClick={compress} disabled={busy || !file}>{busy ? `${stage === 'processing' ? 'Compressing PDF...' : 'Preparing download...'}` : 'Compress and Download'}</button>{status ? <p className="success-text">{status}</p> : null}{error ? <p className="error-text">{error}</p> : null}</div></ToolFrame>;
}

const parsePageSelection = (value, pageCount) => value.split(',').flatMap((part) => { const [start, end = start] = part.trim().split('-').map(Number); return Number.isInteger(start) && Number.isInteger(end) && end >= start ? Array.from({ length: end - start + 1 }, (_, index) => start + index) : []; }).filter((page, index, pages) => page >= 1 && page <= pageCount && pages.indexOf(page) === index);

function PdfToImagesTool({ language }) {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selection, setSelection] = useState('1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const exportImages = async () => {
    if (!file) { setError('Choose a PDF first.'); return; }
    try {
      setBusy(true); setStage('processing');
      await wait(2000);
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'data:application/javascript,;';
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), disableWorker: true }).promise;
      const selected = parsePageSelection(selection, pdf.numPages);
      if (!selected.length) throw new Error('Enter valid pages, such as 1, 3-5.');
      const zip = new JSZip();
      for (const pageNumber of selected) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        zip.file(`${getFileStem(file.name) || 'document'}-page-${pageNumber}.png`, await blob.arrayBuffer());
      }
      const archive = await zip.generateAsync({ type: 'blob' });
      setStage('downloading');
      await wait(2000);
      downloadBlob(archive, `${getFileStem(file.name) || 'document'}-images.zip`);
      setFile(null); setPageCount(0); setSelection('1');
    } catch (exportError) { setError(exportError.message || 'Unable to convert this PDF.'); }
    finally { setBusy(false); setStage(''); }
  };
  return <ToolFrame type="pdfToImages" language={language}><div className="utility-controls"><PdfFileInput id="pdf-to-images-file" label="PDF to convert" onChange={async (event) => { const nextFile = event.target.files?.[0] || null; setFile(nextFile); setError(''); if (nextFile) { const pdf = await PDFDocument.load(await nextFile.arrayBuffer()); setPageCount(pdf.getPageCount()); setSelection('1'); } }} /><label className="stacked-label" htmlFor="image-pages">Pages to convert</label><input id="image-pages" className="tool-input" value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="1, 3-5" />{pageCount ? <p className="helper-text">This PDF has {pageCount} pages.</p> : null}<button type="button" onClick={exportImages} disabled={busy || !file}>{busy ? `${stage === 'processing' ? 'Converting pages...' : 'Preparing download...'}` : 'Convert and Download PNGs'}</button>{error ? <p className="error-text">{error}</p> : null}</div></ToolFrame>;
}

function ImageTool({ language }) {
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
    <ToolFrame type="image" language={language}>
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

function SpreadsheetTool({ language }) {
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
    <ToolFrame type="spreadsheet" language={language}>
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

function WordTool({ language }) {
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
    <ToolFrame type="word" language={language}>
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

function TextTool({ language }) {
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
    <ToolFrame type="text" language={language}>
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

function PasswordTool({ language }) {
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
    <ToolFrame type="password" language={language}>
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

export default function UtilityTool({ type, language }) {
  if (type === 'pdf') return <PdfTool language={language} />;
  if (type === 'pdfMerge') return <PdfTool language={language} initialMode="merge" />;
  if (type === 'pdfSplit') return <PdfTool language={language} initialMode="split" />;
  if (type === 'reorder') return <ReorderTool language={language} />;
  if (type === 'imagesToPdf') return <ImagesToPdfTool language={language} />;
  if (type === 'pdfCompress') return <PdfCompressTool language={language} />;
  if (type === 'pdfToImages') return <PdfToImagesTool language={language} />;
  if (type === 'image') return <ImageTool language={language} />;
  if (type === 'spreadsheet') return <SpreadsheetTool language={language} />;
  if (type === 'word') return <WordTool language={language} />;
  if (type === 'text') return <TextTool language={language} />;
  return <PasswordTool language={language} />;
}
