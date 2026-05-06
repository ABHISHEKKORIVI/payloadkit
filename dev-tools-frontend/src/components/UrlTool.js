function UrlTool({ urlInput, urlOutput, urlError, onUrlInputChange, onEncode, onDecode, onCopy }) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>URL Encoder/Decoder</h1>
          <p className="page-text">
            Safely encode or decode URLs, query parameters, callback paths, and redirect values
            during API and auth debugging.
          </p>
        </div>
        <div className="button-row">
          <button type="button" onClick={onEncode}>
            Encode URL
          </button>
          <button type="button" className="secondary-button" onClick={onDecode}>
            Decode URL
          </button>
        </div>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="url-input">Raw URL or Encoded Value</label>
          <textarea
            id="url-input"
            value={urlInput}
            onChange={(event) => onUrlInputChange(event.target.value)}
            spellCheck="false"
          />
          {urlError ? <p className="error-text">{urlError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onEncode}>
            Encode URL
          </button>
          <button type="button" className="secondary-button" onClick={onDecode}>
            Decode URL
          </button>
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Output</span>
            <button type="button" className="copy-button" onClick={() => onCopy(urlOutput, 'URL result')}>
              Copy
            </button>
          </div>
          <pre className="plain-output">{urlOutput || 'Encoded or decoded URL output will appear here.'}</pre>
        </div>
      </div>
    </section>
  );
}

export default UrlTool;
