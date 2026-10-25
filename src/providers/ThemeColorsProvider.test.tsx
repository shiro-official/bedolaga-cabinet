import { useContext, useEffect } from 'react';
import { AdminThemePreviewContext } from '@/components/ebunny/AdminThemePreviewContext';
// @vitest-environment jsdom
import { cleanup, render as rtlRender } from '@testing-library/react';
import { MemoryRouter, Link } from 'react-router';
import { fireEvent, screen } from '@testing-library/react';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Цвета клиента Telegram вокруг страницы.
 *
 * Шапка и нижняя панель клиента давно красятся в поверхность темы. Фон самого
 * мини-приложения оставался цветом клиента: на Android WebView лежит поверх
 * него прозрачным, и всё, что клиент не успел отрисовать (медленная
 * растеризация на Xiaomi, смена страницы), просвечивало чёрным — «цвета
 * прыгают», чёрные прямоугольники поверх карточек. Фон клиента обязан
 * совпадать с фоном страницы в обеих темах.
 */

const theme = {
  setHeaderColor: vi.fn(),
  setBottomBarColor: vi.fn(),
  setBackgroundColor: vi.fn(),
  getThemeParams: () => null,
};
let isDark = true;

vi.mock('@/platform', () => ({
  usePlatform: () => ({ theme, capabilities: { hasThemeSync: true } }),
}));
vi.mock('../hooks/useTheme', () => ({ useTheme: () => ({ isDark }) }));
vi.mock('../api/themeColors', () => ({
  themeColorsQueryOptions: () => ({ queryKey: ['theme-colors'] }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useQuery: () => ({
    data: {
      accent: '#a855f7',
      darkBackground: '#0b1f1c',
      darkSurface: '#123456',
      lightBackground: '#f7e7ce',
      lightSurface: '#fef9f0',
    },
  }),
}));

const { ThemeColorsProvider } = await import('./ThemeColorsProvider');
function render(ui: ReactNode, path = '/admin') {
  return rtlRender(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  isDark = true;
});

describe('ThemeColorsProvider — цвета клиента Telegram', () => {
  it('в тёмной теме фон клиента = тёмный фон страницы, шапка = поверхность', () => {
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
    );
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#1c1d22');
    expect(theme.setHeaderColor).toHaveBeenLastCalledWith('#23242c');
    expect(theme.setBottomBarColor).toHaveBeenLastCalledWith('#23242c');
  });

  it('в светлой теме фон клиента = светлый фон страницы', () => {
    isDark = false;
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
    );
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#f7f0e1');
    expect(theme.setHeaderColor).toHaveBeenLastCalledWith('#fffaf0');
  });
});

describe('eBunny presentation scope', () => {
  it('uses brand colors and enables the skin for a customer route', () => {
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
      '/',
    );
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#1c1d22');
    expect(theme.setHeaderColor).toHaveBeenLastCalledWith('#23242c');
    expect(document.documentElement.dataset.ebunny).toBe('true');
  });
  it('uses the paper palette in light mode', () => {
    isDark = false;
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
      '/login',
    );
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#f7f0e1');
    expect(theme.setHeaderColor).toHaveBeenLastCalledWith('#fffaf0');
  });
  it('enables the separate admin skin on nested admin routes', () => {
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
      '/admin/settings',
    );
    expect(document.documentElement.dataset.ebunny).toBeUndefined();
    expect(document.documentElement.dataset.ebunnyAdmin).toBe('true');
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#1c1d22');
  });
});

function TrafficConsumer() {
  const { colors } = useThemeColors();
  return <span data-testid="traffic-accent">{colors.accent}</span>;
}

describe('eBunny palette regression: violet operator settings', () => {
  it('traffic consumers use the brand palette without overwriting global CSS', () => {
    render(
      <ThemeColorsProvider>
        <TrafficConsumer />
      </ThemeColorsProvider>,
      '/',
    );
    expect(screen.getByTestId('traffic-accent').textContent).toBe('#ff87bb');
    expect(document.documentElement.style.getPropertyValue('--color-accent-500')).toBe(
      '255, 135, 187',
    );
  });
  it('restores the appropriate palette when navigating from admin to the customer UI and back', () => {
    render(
      <ThemeColorsProvider>
        <Link to="/">Customer</Link>
        <Link to="/admin/settings">Admin</Link>
        <TrafficConsumer />
      </ThemeColorsProvider>,
      '/admin/settings',
    );
    expect(screen.getByTestId('traffic-accent').textContent).toBe('#ff87bb');
    fireEvent.click(screen.getByText('Customer'));
    expect(screen.getByTestId('traffic-accent').textContent).toBe('#ff87bb');
    expect(document.documentElement.style.getPropertyValue('--color-accent-500')).toBe(
      '255, 135, 187',
    );
    fireEvent.click(screen.getByText('Admin'));
    expect(screen.getByTestId('traffic-accent').textContent).toBe('#ff87bb');
    expect(document.documentElement.dataset.ebunny).toBeUndefined();
    expect(document.documentElement.dataset.ebunnyAdmin).toBe('true');
    expect(document.documentElement.style.getPropertyValue('--color-accent-500')).toBe(
      '255, 135, 187',
    );
  });
});

function EditorPreview() {
  const setPreview = useContext(AdminThemePreviewContext);
  useEffect(() => {
    setPreview(true);
    return () => setPreview(false);
  }, [setPreview]);
  return <TrafficConsumer />;
}

describe('Admin theme editor remains functional', () => {
  it('allows the existing editor to preview operator colors', () => {
    render(
      <ThemeColorsProvider>
        <EditorPreview />
      </ThemeColorsProvider>,
      '/admin/settings',
    );
    expect(screen.getByTestId('traffic-accent').textContent).toBe('#a855f7');
    expect(document.documentElement.dataset.ebunnyAdmin).toBe('true');
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#0b1f1c');
  });
  it('clears the admin skin and keeps customer colors on navigation', () => {
    render(
      <ThemeColorsProvider>
        <Link to="/">Customer</Link>
        <TrafficConsumer />
      </ThemeColorsProvider>,
      '/admin',
    );
    fireEvent.click(screen.getByText('Customer'));
    expect(document.documentElement.dataset.ebunnyAdmin).toBeUndefined();
    expect(document.documentElement.dataset.ebunny).toBe('true');
    expect(screen.getByTestId('traffic-accent').textContent).toBe('#ff87bb');
  });
});
