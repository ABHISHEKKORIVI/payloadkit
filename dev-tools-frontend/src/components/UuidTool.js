function UuidTool({ uuidCount, uuidOutput, uuidError, onUuidCountChange, onGenerateUuids, onCopy }) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>UUID Generator</h1>
          <p className="page-text">
            Generate one or more UUIDs in the browser for test data, records, queue jobs, or mock
            integration payloads.
          </p>
        </div>
        <button type="button" onClick={onGenerateUuids}>
          Generate UUIDs
        </button>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="uuid-count">How Many UUIDs</label>
          <input
            id="uuid-count"
            className="tool-input"
            type="number"
            min="1"
            max="50"
            value={uuidCount}
            onChange={(event) => onUuidCountChange(event.target.value)}
          />
          {uuidError ? <p className="error-text">{uuidError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onGenerateUuids}>
            Generate UUIDs
          </button>
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Generated UUIDs</span>
            <button type="button" className="copy-button" onClick={() => onCopy(uuidOutput, 'UUID list')}>
              Copy
            </button>
          </div>
          <pre className="plain-output">{uuidOutput || 'Generated UUIDs will appear here.'}</pre>
        </div>
      </div>
    </section>
  );
}

export default UuidTool;
