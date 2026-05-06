const PYODIDE_SCRIPT_ID = 'pyodide-runtime-script';
const PYODIDE_SCRIPT_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';

let pyodidePromise;

const loadScript = () =>
  new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(PYODIDE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load the Python runtime.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = PYODIDE_SCRIPT_ID;
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load the Python runtime.'));
    document.body.appendChild(script);
  });

export const loadPythonRuntime = async () => {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript();

      if (!window.loadPyodide) {
        throw new Error('Python runtime is unavailable right now.');
      }

      return window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
      });
    })().catch((error) => {
      pyodidePromise = undefined;
      throw error;
    });
  }

  return pyodidePromise;
};

export const runPythonCode = async (code) => {
  if (!code.trim()) {
    throw new Error('Enter Python code before running it.');
  }

  const pyodide = await loadPythonRuntime();
  pyodide.globals.set('__payloadkit_code', code);

  try {
    await pyodide.runPythonAsync(`
import contextlib
import io
import traceback

_payloadkit_stdout = io.StringIO()
_payloadkit_result = ""
__payloadkit_output = ""

with contextlib.redirect_stdout(_payloadkit_stdout):
    try:
        exec(__payloadkit_code, {})
    except Exception:
        _payloadkit_result = traceback.format_exc()

_payloadkit_stdout_value = _payloadkit_stdout.getvalue().strip()

if _payloadkit_result:
    __payloadkit_output = _payloadkit_result
elif _payloadkit_stdout_value:
    __payloadkit_output = _payloadkit_stdout_value
else:
    __payloadkit_output = "Code executed with no output."
`);

    const output = pyodide.globals.get('__payloadkit_output');

    return String(output ?? 'Code executed with no output.');
  } catch (error) {
    throw new Error(error.message || 'Python execution failed.');
  } finally {
    pyodide.globals.delete('__payloadkit_code');
    try {
      pyodide.globals.delete('__payloadkit_output');
    } catch (error) {
      // Ignore cleanup issues if the runtime variable was never created.
    }
  }
};
