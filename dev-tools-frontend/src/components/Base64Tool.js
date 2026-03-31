function Base64Tool({
  base64Input,
  base64Output,
  base64Error,
  onBase64InputChange,
  onEncode,
  onDecode,
  onCopy,
}) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Base64 Encoder/Decoder</h1>
          <p className="page-text">
            Convert plain text and Base64 data quickly for headers, integrations, and debugging
            work.
          </p>
        </div>
        <div className="button-row">
          <button type="button" onClick={onEncode}>
            Encode
          </button>
          <button type="button" className="secondary-button" onClick={onDecode}>
            Decode
          </button>
        </div>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="base64-input">Input Text or Base64</label>
          <textarea
            id="base64-input"
            value={base64Input}
            onChange={(event) => onBase64InputChange(event.target.value)}
            spellCheck="false"
          />
          {base64Error ? <p className="error-text">{base64Error}</p> : null}
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Output</span>
            <button type="button" className="copy-button" onClick={() => onCopy(base64Output, 'Base64 result')}>
              Copy
            </button>
          </div>
          <pre className="plain-output">{base64Output || 'Encoded or decoded text will appear here.'}</pre>
        </div>
      </div>
    </section>
  );
}

export default Base64Tool;
