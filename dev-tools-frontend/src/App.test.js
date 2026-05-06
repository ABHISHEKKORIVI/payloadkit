import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,test'),
}));

Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer),
    },
    randomUUID: jest.fn(() => '11111111-1111-4111-8111-111111111111'),
  },
  configurable: true,
});

test('renders the public home page and opens a tool page', async () => {
  window.history.pushState({}, '', '/');
  render(<App />);

  expect(screen.getByRole('button', { name: /payloadkit/i })).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /all your dev tools one clean workspace/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/100% client-side\. no data stored/i)
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /why payloadkit/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /json formatter/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /url encoder/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /hash generator/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /regex tester/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /uuid generator/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /python compiler/i }).length).toBeGreaterThan(0);

  await userEvent.click(screen.getByRole('button', { name: /^jwt decoder$/i }));

  expect(screen.getByRole('heading', { name: /jwt decoder/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/jwt token/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/jwt-decoder');
});
