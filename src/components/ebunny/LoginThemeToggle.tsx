import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { themeColorsApi } from '@/api/themeColors';
import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@/components/icons';

export function EbunnyLoginThemeToggle({ top }: { top: number }) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { data } = useQuery({
    queryKey: ['enabled-themes'],
    queryFn: themeColorsApi.getEnabledThemes,
    staleTime: 300_000,
  });
  if (data && !(data.dark && data.light)) return null;
  return (
    <button
      type="button"
      className="ebunny-login-theme btn-secondary"
      onClick={toggleTheme}
      style={{ top: top > 0 ? `${top + 12}px` : 'calc(12px + env(safe-area-inset-top, 0px))' }}
      aria-label={isDark ? t('theme.light', 'Light mode') : t('theme.dark', 'Dark mode')}
    >
      {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  );
}
