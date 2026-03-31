import { highlightJson } from '../utils/json';

function JsonTool({
  jsonInput,
  formattedJson,
  jsonError,
  onJsonInputChange,
  onFormatJson,
  onDownloadJson,
  onCopy,
}) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>JSON Formatter</h1>
          <p className="page-text">
            Clean and validate JSON before using it in APIs, config files, mock data, or test
            payloads.
          </p>
        </div>
        <div className="button-row">
          <button type="button" onClick={onFormatJson}>
            Format JSON
          </button>
          <button type="button" className="secondary-button" onClick={onDownloadJson}>
            Download JSON
          </button>
        </div>
      </div>

      <div className="tool-layout">
        <div className="input-panel">
          <label htmlFor="json-input">Raw JSON</label>
          <textarea
            id="json-input"
            value={jsonInput}
            onChange={(event) => onJsonInputChange(event.target.value)}
            spellCheck="false"
          />
          {jsonError ? <p className="error-text">{jsonError}</p> : null}
        </div>

        <div className="mobile-action-row">
          <button type="button" onClick={onFormatJson}>
            Format JSON
          </button>
          <button type="button" className="secondary-button" onClick={onDownloadJson}>
            Download JSON
          </button>
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Formatted Output</span>
            <button type="button" className="copy-button" onClick={() => onCopy(formattedJson, 'Formatted JSON')}>
              Copy
            </button>
          </div>
          <pre
            className="code-output"
            dangerouslySetInnerHTML={{
              __html: formattedJson ? highlightJson(formattedJson) : 'Waiting for valid JSON...',
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default JsonTool;
