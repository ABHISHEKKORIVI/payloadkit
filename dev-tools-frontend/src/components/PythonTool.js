function PythonTool({
  pythonCode,
  pythonOutput,
  pythonError,
  onPythonCodeChange,
  onCopy,
}) {
  const buttonLabel = 'Run Python';

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Python Compiler</h1>
          <p className="page-text">
            Python execution still needs the backend, so the button stays in a disabled-looking
            state for this UI-only release.
          </p>
        </div>
        <button
          type="button"
          className="python-run-button python-run-button--unavailable"
          aria-disabled="true"
          title="Backend unavailable in this release"
        >
          {buttonLabel}
        </button>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="python-code">Python Code</label>
          <textarea
            id="python-code"
            value={pythonCode}
            onChange={(event) => onPythonCodeChange(event.target.value)}
            spellCheck="false"
          />
          <p className="helper-text">
            Hover the button above to see the unavailable state.
          </p>
          {pythonError ? <p className="error-text">{pythonError}</p> : null}
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Output</span>
            <button type="button" className="copy-button" onClick={() => onCopy(pythonOutput, 'Python output')}>
              Copy
            </button>
          </div>
          <pre className="plain-output">
            {pythonOutput || 'Run your Python code to see printed output and expression results here.'}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default PythonTool;
