import { highlightJson } from '../utils/json';

function JwtTool({ jwtInput, jwtHeader, jwtPayload, jwtError, jwtStatus, onJwtInputChange, onDecodeJwt, onCopy }) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="panel-kicker">Developer Tool</p>
          <h1>JWT Decoder</h1>
          <p className="page-text">
            Review JWT headers and claims locally to debug authentication, sessions, and identity
            flows.
          </p>
        </div>
        <button type="button" onClick={onDecodeJwt}>
          Decode JWT
        </button>
      </div>

      <div className="input-panel">
        <label htmlFor="jwt-input">JWT Token</label>
        <textarea
          id="jwt-input"
          value={jwtInput}
          onChange={(event) => onJwtInputChange(event.target.value)}
          spellCheck="false"
        />
        {jwtStatus ? <p className={`status-chip ${jwtStatus.toLowerCase().replace(/\s+/g, '-')}`}>Status: {jwtStatus}</p> : null}
        {jwtError ? <p className="error-text">{jwtError}</p> : null}
      </div>

      <div className="mobile-action-row">
        <button type="button" onClick={onDecodeJwt}>
          Decode JWT
        </button>
      </div>

      <div className="tool-grid">
        <div className="output-block">
          <div className="output-header">
            <span>Header</span>
            <button type="button" className="copy-button" onClick={() => onCopy(jwtHeader, 'JWT header')}>
              Copy
            </button>
          </div>
          <pre
            className="code-output"
            dangerouslySetInnerHTML={{
              __html: jwtHeader ? highlightJson(jwtHeader) : 'Decoded header will appear here.',
            }}
          />
        </div>

        <div className="output-block">
          <div className="output-header">
            <span>Payload</span>
            <button type="button" className="copy-button" onClick={() => onCopy(jwtPayload, 'JWT payload')}>
              Copy
            </button>
          </div>
          <pre
            className="code-output"
            dangerouslySetInnerHTML={{
              __html: jwtPayload ? highlightJson(jwtPayload) : 'Decoded payload will appear here.',
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default JwtTool;
