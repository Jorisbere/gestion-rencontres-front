import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Personnalisation du thème Aura avec la charte graphique ASN Technology
 * (NAVY=#1F3864, BLUE=#2E75B6), déjà utilisée dans les documents Word du projet.
 */
export const AsnPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '#2E75B6',
      600: '#245D92',
      700: '#1F3864',
      800: '#17294A',
      900: '#101D33',
      950: '#0A121F'
    }
  }
});