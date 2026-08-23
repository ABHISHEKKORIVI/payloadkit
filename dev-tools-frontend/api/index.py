import subprocess
import sys
import tempfile
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="PayloadKit API", version="0.1.0")

MAX_CODE_LENGTH = 12000
RUN_TIMEOUT_SECONDS = 5


class PythonRunRequest(BaseModel):
    code: str = Field(..., max_length=MAX_CODE_LENGTH)


class PythonRunResponse(BaseModel):
    output: str
    error: str = ""
    exit_code: int


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/python/run", response_model=PythonRunResponse)
def run_python(payload: PythonRunRequest):
    code = payload.code.strip()

    if not code:
        return PythonRunResponse(
            output="",
            error="Enter Python code before running it.",
            exit_code=1,
        )

    with tempfile.TemporaryDirectory(prefix="payloadkit-python-") as temp_dir:
        script_path = Path(temp_dir) / "snippet.py"
        script_path.write_text(code, encoding="utf-8")

        try:
            completed = subprocess.run(
                [sys.executable, str(script_path)],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=RUN_TIMEOUT_SECONDS,
                check=False,
            )
        except subprocess.TimeoutExpired as error:
            partial_output = (error.stdout or "").strip()
            partial_error = (error.stderr or "").strip()
            message = f"Execution stopped after {RUN_TIMEOUT_SECONDS} seconds."
            return PythonRunResponse(
                output=partial_output,
                error="\n".join(value for value in [partial_error, message] if value),
                exit_code=124,
            )

    stdout = completed.stdout.strip()
    stderr = completed.stderr.strip()

    if completed.returncode == 0 and not stdout:
        stdout = "Code executed with no output."

    return PythonRunResponse(
        output=stdout,
        error=stderr,
        exit_code=completed.returncode,
    )
