function QrTool({ qrInput, qrDataUrl, qrError, onQrInputChange, onGenerateQr }) {
  const isDownloadDisabled = !qrDataUrl;
  const renderDownloadAction = () =>
    isDownloadDisabled ? (
      <button type="button" className="ghost-link disabled-link" disabled>
        Download PNG
      </button>
    ) : (
      <a className="ghost-link" href={qrDataUrl} download="payloadkit-qr.png">
        Download PNG
      </a>
    );

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>QR Code Generator</h1>
          <p className="page-text">
            Generate QR codes for public links, staging previews, documentation, or internal
            handoff flows.
          </p>
        </div>
        <div className="button-row">
          <button type="button" onClick={onGenerateQr}>
            Generate QR
          </button>
          {renderDownloadAction()}
        </div>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="qr-input">Text or URL</label>
          <textarea
            id="qr-input"
            value={qrInput}
            onChange={(event) => onQrInputChange(event.target.value)}
            spellCheck="false"
          />
          {qrError ? <p className="error-text">{qrError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onGenerateQr}>
            Generate QR
          </button>
          {renderDownloadAction()}
        </div>

        <div className="qr-preview">
          {qrDataUrl ? <img src={qrDataUrl} alt="Generated QR code" /> : <p>No QR code yet.</p>}
        </div>
      </div>
    </section>
  );
}

export default QrTool;
