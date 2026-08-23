function PythonTool({
  pythonCode,
  pythonOutput,
  pythonError,
  pythonStatus,
  onPythonCodeChange,
  onRunPython,
  onCopy,
}) {
  const isRunning = pythonStatus === 'running';
  const buttonLabel = isRunning ? 'Running...' : 'Run Python';

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>Python Compiler</h1>
          <p className="page-text">
            Run small Python snippets through the PayloadKit backend and review stdout and errors
            in one place.
          </p>
        </div>
        <button
          type="button"
          className="python-run-button"
          disabled={isRunning}
          onClick={onRunPython}
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
            Keep snippets short. Long-running code is stopped automatically.
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
