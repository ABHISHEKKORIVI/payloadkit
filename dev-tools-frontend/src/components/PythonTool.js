function PythonTool({
  pythonCode,
  pythonOutput,
  pythonError,
  pythonStatus,
  onPythonCodeChange,
  onRunPython,
  onCopy,
}) {
  const isBusy = pythonStatus === 'loading' || pythonStatus === 'running';
  const buttonLabel =
    pythonStatus === 'loading'
      ? 'Loading Python...'
      : pythonStatus === 'running'
        ? 'Running...'
        : 'Run Python';

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Python Compiler</h1>
          <p className="page-text">
            Run lightweight Python snippets directly in the browser using a client-side runtime.
            Great for quick logic checks, interview practice, and scratchpad experiments.
          </p>
        </div>
        <button type="button" onClick={onRunPython} disabled={isBusy}>
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
            Runs in your browser with Pyodide. Best for small scripts and supported standard
            Python workflows.
          </p>
          {pythonError ? <p className="error-text">{pythonError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onRunPython} disabled={isBusy}>
            {buttonLabel}
          </button>
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
