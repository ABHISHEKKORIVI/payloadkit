function HashTool({
  hashInput,
  hashOutput,
  hashError,
  hashAlgorithm,
  onHashInputChange,
  onHashAlgorithmChange,
  onGenerateHash,
  onCopy,
}) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Hash Generator</h1>
          <p className="page-text">
            Generate browser-side SHA hashes for payload integrity checks, webhook debugging, and
            quick verification work.
          </p>
        </div>
        <button type="button" onClick={onGenerateHash}>
          Generate Hash
        </button>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="hash-input">Text to Hash</label>
          <textarea
            id="hash-input"
            value={hashInput}
            onChange={(event) => onHashInputChange(event.target.value)}
            spellCheck="false"
          />

          <label htmlFor="hash-algorithm" className="stacked-label">
            Algorithm
          </label>
          <select
            id="hash-algorithm"
            className="tool-select"
            value={hashAlgorithm}
            onChange={(event) => onHashAlgorithmChange(event.target.value)}
          >
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>

          {hashError ? <p className="error-text">{hashError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onGenerateHash}>
            Generate Hash
          </button>
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>{hashAlgorithm} Output</span>
            <button type="button" className="copy-button" onClick={() => onCopy(hashOutput, 'Hash value')}>
              Copy
            </button>
          </div>
          <pre className="plain-output">{hashOutput || 'Generated hash output will appear here.'}</pre>
        </div>
      </div>
    </section>
  );
}

export default HashTool;
