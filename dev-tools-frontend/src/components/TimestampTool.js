function TimestampTool({
  timestampInput,
  timestampResult,
  timestampError,
  onTimestampInputChange,
  onConvertTimestamp,
  onUseCurrentTimestamp,
  onCopy,
}) {
  const output = timestampResult
    ? `ISO: ${timestampResult.iso}
Local: ${timestampResult.local}
UTC: ${timestampResult.utc}
Seconds: ${timestampResult.seconds}
Milliseconds: ${timestampResult.milliseconds}`
    : '';

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Timestamp Converter</h1>
          <p className="page-text">
            Convert Unix timestamps into ISO, UTC, local time, seconds, and milliseconds for API
            debugging and test data.
          </p>
        </div>
        <div className="button-row">
          <button type="button" onClick={onConvertTimestamp}>
            Convert
          </button>
          <button type="button" className="secondary-button" onClick={onUseCurrentTimestamp}>
            Use Current
          </button>
        </div>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="timestamp-input">Unix Timestamp</label>
          <input
            id="timestamp-input"
            className="tool-input"
            value={timestampInput}
            onChange={(event) => onTimestampInputChange(event.target.value)}
            placeholder="1717000000 or 1717000000000"
          />
          <p className="helper-text">
            Accepts seconds or milliseconds. Ten digits or fewer are treated as seconds.
          </p>
          {timestampError ? <p className="error-text">{timestampError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onConvertTimestamp}>
            Convert
          </button>
          <button type="button" className="secondary-button" onClick={onUseCurrentTimestamp}>
            Use Current
          </button>
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Converted Time</span>
            <button type="button" className="copy-button" onClick={() => onCopy(output, 'Timestamp output')}>
              Copy
            </button>
          </div>
          <pre className="plain-output">{output || 'Converted timestamp values will appear here.'}</pre>
        </div>
      </div>
    </section>
  );
}

export default TimestampTool;
