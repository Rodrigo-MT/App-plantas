import { MD3LightTheme } from 'react-native-paper';

/**
 * Tema customizado para o aplicativo, baseado no MD3LightTheme do react-native-paper.
 * Define fontes e cores para manter a identidade visual consistente.
 */
export default {
  ...MD3LightTheme,
  /**
   * Configuração das fontes usadas no aplicativo.
   * Usa a família Quicksand, compatível com @expo-google-fonts/quicksand.
   * ATUALIZADO: Usar os nomes de variante corretos do React Native Paper v5+
   */
  fonts: {
    ...MD3LightTheme.fonts, // Mantém as fontes padrão do Paper
    // ✅ VARIANTES CORRETAS para React Native Paper v5+
    labelLarge: {
      fontFamily: 'Quicksand_700Bold',
      fontWeight: '700' as '700',
      fontSize: 16,
    },
    labelMedium: {
      fontFamily: 'Quicksand_600SemiBold',
      fontWeight: '600' as '600',
      fontSize: 14,
    },
    labelSmall: {
      fontFamily: 'Quicksand_400Regular',
      fontWeight: '400' as '400',
      fontSize: 12,
    },
    bodyLarge: {
      fontFamily: 'Quicksand_400Regular',
      fontWeight: '400' as '400',
      fontSize: 16,
    },
    bodyMedium: {
      fontFamily: 'Quicksand_400Regular',
      fontWeight: '400' as '400',
      fontSize: 14,
    },
    bodySmall: {
      fontFamily: 'Quicksand_400Regular',
      fontWeight: '400' as '400',
      fontSize: 12,
    },
    headlineLarge: {
      fontFamily: 'Quicksand_700Bold',
      fontWeight: '700' as '700',
      fontSize: 32,
    },
    headlineMedium: {
      fontFamily: 'Quicksand_700Bold',
      fontWeight: '700' as '700',
      fontSize: 28,
    },
    headlineSmall: {
      fontFamily: 'Quicksand_700Bold',
      fontWeight: '700' as '700',
      fontSize: 24,
    },
    titleLarge: {
      fontFamily: 'Quicksand_700Bold',
      fontWeight: '700' as '700',
      fontSize: 22,
    },
    titleMedium: {
      fontFamily: 'Quicksand_600SemiBold',
      fontWeight: '600' as '600',
      fontSize: 18,
    },
    titleSmall: {
      fontFamily: 'Quicksand_600SemiBold',
      fontWeight: '600' as '600',
      fontSize: 16,
    },
  },
  /**
   * Paleta de cores customizada.
   * Mantém as cores do MD3LightTheme e adiciona cores específicas do aplicativo.
   */
  colors: {
    ...MD3LightTheme.colors,
    // ✅ CORES PRINCIPAIS
    primary: '#32c273', // Verde claro - para botão ATIVO e tabs ATIVAS
    onPrimary: '#FFFFFF', // Branco - texto sobre fundo verde claro
    
    // ✅ CORES PARA BOTÕES INATIVOS/NAVEGAÇÃO
    secondary: '#1a7a4c', // Verde escuro - para botões INATIVOS e tabs INATIVAS
    onSecondary: '#FFFFFF', // Branco - texto sobre fundo verde escuro
    
    // ✅ CORES DE FUNDO
    background: '#F5F5F5', // Cinza claro para fundo geral
    surface: '#FFFFFF', // Branco para cards e superfícies
    
    // ✅ CORES DE ESTADO
    error: '#B00020', // Vermelho para mensagens de erro
    accent: '#28afd4', // Ciano para elementos secundários
    
    // ✅ CORES DE TEXTO
    text: '#333333', // Cinza escuro para textos principais
    onSurfaceVariant: '#666666', // Cinza médio para textos secundários
    placeholder: '#999999', // Cinza claro para placeholders
    
    // ✅ CORES PARA TABS INATIVAS (texto)
    onSurface: '#1a7a4c', // Verde escuro para texto de tabs inativas
  },
};