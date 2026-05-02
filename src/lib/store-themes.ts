// Tokens visuales para los 4 temas de la tienda pública del proveedor.
// Se aplican como style props inline — sin CSS global.

export type StoreTheme = 'moderno' | 'lujo' | 'minimal' | 'oscuro';

export interface ThemeTokens {
  bgPage: string;
  bgCard: string;
  bgSection: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBorderColor: string;
  cardBorderWidth: string;
  cardShadow: string;
  cardRadius: string;         // con cardStyle='rounded'; square fuerza '0'
  headerBg: string;
  headerBlur: boolean;
  headerTextColor: string;    // color del logo/nav cuando es transparente sobre hero
  fontHeadline: string;       // 'Playfair Display' | 'Inter'
  headlineStyle: 'normal' | 'italic';
  headlineWeight: number;
  heroBgOpacity: number;      // 0-1, opacidad del overlay oscuro sobre bannerUrl
  filterBarBg: string;
  filterBarBorder: string;
  inputBg: string;
  chipActiveBg: string;       // se sobreescribe con brandColor en el componente
  badgeBg: string;
  badgeText: string;
  // Para preview en el dashboard
  previewBg: string;
  previewText: string;
  previewAccent: string;
}

export const THEMES: Record<StoreTheme, ThemeTokens> = {
  moderno: {
    bgPage: '#FFFFFF',
    bgCard: '#FFFFFF',
    bgSection: '#F7F6F5',
    textPrimary: '#0A0A0A',
    textSecondary: '#6B6359',
    textMuted: '#A39E99',
    cardBorderColor: '#EDEBE8',
    cardBorderWidth: '1px',
    cardShadow: '0 2px 16px rgba(0,0,0,0.06)',
    cardRadius: '16px',
    headerBg: 'rgba(255,255,255,0.92)',
    headerBlur: true,
    headerTextColor: '#FFFFFF',
    fontHeadline: 'Playfair Display',
    headlineStyle: 'normal',
    headlineWeight: 900,
    heroBgOpacity: 0.55,
    filterBarBg: '#FFFFFF',
    filterBarBorder: '#EDEBE8',
    inputBg: '#FFFFFF',
    chipActiveBg: '#0A0A0A',
    badgeBg: 'rgba(0,0,0,0.55)',
    badgeText: '#FFFFFF',
    previewBg: '#FFFFFF',
    previewText: '#0A0A0A',
    previewAccent: '#0A0A0A',
  },

  lujo: {
    bgPage: '#FAF8F5',
    bgCard: '#FFFDF9',
    bgSection: '#F2EDE6',
    textPrimary: '#1A0F00',
    textSecondary: '#6B5A42',
    textMuted: '#A08D75',
    cardBorderColor: '#E0D4C4',
    cardBorderWidth: '1px',
    cardShadow: '0 4px 28px rgba(100,60,0,0.08)',
    cardRadius: '4px',
    headerBg: 'rgba(250,248,245,0.96)',
    headerBlur: true,
    headerTextColor: '#FFFFFF',
    fontHeadline: 'Playfair Display',
    headlineStyle: 'italic',
    headlineWeight: 400,
    heroBgOpacity: 0.42,
    filterBarBg: '#FAF8F5',
    filterBarBorder: '#E0D4C4',
    inputBg: '#FFFDF9',
    chipActiveBg: '#1A0F00',
    badgeBg: 'rgba(26,15,0,0.5)',
    badgeText: '#FAF8F5',
    previewBg: '#FAF8F5',
    previewText: '#1A0F00',
    previewAccent: '#8B6914',
  },

  minimal: {
    bgPage: '#FFFFFF',
    bgCard: '#FAFAFA',
    bgSection: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#888888',
    textMuted: '#BBBBBB',
    cardBorderColor: 'transparent',
    cardBorderWidth: '0px',
    cardShadow: 'none',
    cardRadius: '8px',
    headerBg: 'rgba(255,255,255,1)',
    headerBlur: false,
    headerTextColor: '#FFFFFF',
    fontHeadline: 'Inter',
    headlineStyle: 'normal',
    headlineWeight: 300,
    heroBgOpacity: 0.30,
    filterBarBg: '#FFFFFF',
    filterBarBorder: '#EEEEEE',
    inputBg: '#FAFAFA',
    chipActiveBg: '#111111',
    badgeBg: 'rgba(0,0,0,0.45)',
    badgeText: '#FFFFFF',
    previewBg: '#FFFFFF',
    previewText: '#111111',
    previewAccent: '#555555',
  },

  oscuro: {
    bgPage: '#0A0A0A',
    bgCard: '#141414',
    bgSection: '#111111',
    textPrimary: '#F5F5F5',
    textSecondary: '#999999',
    textMuted: '#555555',
    cardBorderColor: '#222222',
    cardBorderWidth: '1px',
    cardShadow: '0 4px 24px rgba(0,0,0,0.5)',
    cardRadius: '12px',
    headerBg: 'rgba(10,10,10,0.94)',
    headerBlur: true,
    headerTextColor: '#F5F5F5',
    fontHeadline: 'Playfair Display',
    headlineStyle: 'normal',
    headlineWeight: 700,
    heroBgOpacity: 0.65,
    filterBarBg: '#0A0A0A',
    filterBarBorder: '#222222',
    inputBg: '#141414',
    chipActiveBg: '#F5F5F5',
    badgeBg: 'rgba(245,245,245,0.15)',
    badgeText: '#F5F5F5',
    previewBg: '#0A0A0A',
    previewText: '#F5F5F5',
    previewAccent: '#F5F5F5',
  },
};

export function getTheme(theme?: StoreTheme): ThemeTokens {
  return THEMES[theme ?? 'moderno'];
}
