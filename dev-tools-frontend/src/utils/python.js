import { postJson } from './api';

export const runPythonCode = async (code) => {
  if (!code.trim()) {
    throw new Error('Enter Python code before running it.');
  }

  const result = await postJson('/api/python/run', { code });
  const outputParts = [result.output, result.error].filter(Boolean);

  return {
    output: outputParts.join('\n'),
    error: result.exit_code === 0 ? '' : result.error || 'Python execution failed.',
  };
};
