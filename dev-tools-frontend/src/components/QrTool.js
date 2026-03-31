function QrTool({ qrInput, qrDataUrl, qrError, onQrInputChange, onCopy }) {
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
          <button type="button" className="secondary-button" onClick={() => onCopy(qrInput, 'QR source text')}>
            Copy Text
          </button>
          <a className="ghost-link" href={qrDataUrl} download="payloadkit-qr.png">
            Download PNG
          </a>
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

        <div className="qr-preview">
          {qrDataUrl ? <img src={qrDataUrl} alt="Generated QR code" /> : <p>No QR code yet.</p>}
        </div>
      </div>
    </section>
  );
}

export default QrTool;
