function RegexTool({
  regexPattern,
  regexFlags,
  regexSample,
  regexMatches,
  regexError,
  onRegexPatternChange,
  onRegexFlagsChange,
  onRegexSampleChange,
  onRunRegex,
  onCopy,
}) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Regex Tester</h1>
          <p className="page-text">
            Try patterns against sample text, validate flags, and inspect matches before using
            them in forms, APIs, routes, or data processing flows.
          </p>
        </div>
        <button type="button" onClick={onRunRegex}>
          Run Regex
        </button>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="regex-pattern">Pattern</label>
          <input
            id="regex-pattern"
            className="tool-input"
            type="text"
            value={regexPattern}
            onChange={(event) => onRegexPatternChange(event.target.value)}
            spellCheck="false"
          />

          <label htmlFor="regex-flags" className="stacked-label">
            Flags
          </label>
          <input
            id="regex-flags"
            className="tool-input"
            type="text"
            value={regexFlags}
            onChange={(event) => onRegexFlagsChange(event.target.value)}
            spellCheck="false"
          />

          <label htmlFor="regex-sample" className="stacked-label">
            Sample Text
          </label>
          <textarea
            id="regex-sample"
            value={regexSample}
            onChange={(event) => onRegexSampleChange(event.target.value)}
            spellCheck="false"
          />
          {regexError ? <p className="error-text">{regexError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onRunRegex}>
            Run Regex
          </button>
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Matches</span>
            <button
              type="button"
              className="copy-button"
              onClick={() => onCopy(regexMatches.join('\n'), 'Regex matches')}
            >
              Copy
            </button>
          </div>
          <div className="match-list">
            {regexMatches.length ? (
              regexMatches.map((match, index) => (
                <article className="match-card" key={`${match}-${index}`}>
                  <p className="match-index">Match {index + 1}</p>
                  <pre className="plain-output compact-output">{match}</pre>
                </article>
              ))
            ) : (
              <p className="empty-state">No matches yet. Run a pattern against your sample text.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegexTool;
