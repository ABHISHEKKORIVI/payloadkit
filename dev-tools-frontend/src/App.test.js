import { fireEvent, render, screen, within } from '@testing-library/react';
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
    screen.getByRole('heading', { name: /everyday tools for work, files, and development/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /why payloadkit/i })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { name: /runtime tools/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('heading', { name: /payload tools/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('heading', { name: /generators and test helpers/i }).length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /runtime tools/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /payload tools/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /generators and test helpers/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /json formatter/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /python compiler/i }).length).toBeGreaterThan(0);
  const primaryNav = screen.getByRole('navigation', { name: /primary navigation/i });
  expect(within(primaryNav).queryByRole('button', { name: /qr generator/i })).not.toBeInTheDocument();
  expect(within(primaryNav).queryByRole('button', { name: /timestamp converter/i })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /payload tools/i }));

  expect(screen.getByRole('menuitem', { name: /url encoder/i })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: /hash generator/i })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('heading', { name: /why payloadkit/i }));

  expect(screen.queryByRole('menuitem', { name: /url encoder/i })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /payload tools/i }));

  await userEvent.click(screen.getByRole('menuitem', { name: /jwt decoder/i }));

  expect(screen.getByRole('heading', { name: /jwt decoder/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/jwt token/i)).toBeInTheDocument();
  expect(window.location.pathname).toBe('/jwt-decoder');
});

test('guides users through selecting and removing PDF merge files', () => {
  window.history.pushState({}, '', '/pdf-tools');
  render(<App />);

  expect(screen.getByRole('heading', { name: /pdf merge & split/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /merge pdfs/i })).toHaveAttribute('aria-selected', 'true');

  const fileInput = screen.getByLabelText(/pdf files to merge/i);
  const firstFile = new File(['first'], 'first.pdf', { type: 'application/pdf' });
  const secondFile = new File(['second'], 'second.pdf', { type: 'application/pdf' });
  const mergeButton = screen.getByRole('button', { name: /merge and download/i });

  fireEvent.change(fileInput, { target: { files: [firstFile] } });
  expect(mergeButton).toBeDisabled();
  expect(screen.getByText(/selected pdf \(1\)/i)).toBeInTheDocument();
  expect(screen.getByText('first.pdf')).toBeInTheDocument();

  fireEvent.change(fileInput, { target: { files: [secondFile] } });
  expect(mergeButton).toBeEnabled();
  expect(screen.getByText(/selected pdfs \(2\)/i)).toBeInTheDocument();
  expect(screen.getByText('second.pdf')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /remove first\.pdf/i }));
  expect(screen.getByText(/selected pdf \(1\)/i)).toBeInTheDocument();
  expect(screen.queryByText('first.pdf')).not.toBeInTheDocument();
  expect(mergeButton).toBeDisabled();
});
