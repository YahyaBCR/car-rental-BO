/**
 * FlitCar Design System - Charte Graphique Officielle
 *
 * Palette FLIT basée sur l'Expression de Besoin
 * Vert émeraude FLIT comme identité principale
 */

export const FlitCarColors = {
  // ========================================================================
  // COULEURS PRINCIPALES
  // ========================================================================

  /** Vert Émeraude FLIT #00A88B - COULEUR PRIMAIRE
   * Usage: CTA, icônes actives, éléments interactifs principaux */
  primary: '#00A88B',

  /** Variant du primaire pour hover/pressed (plus foncé) */
  primaryDark: '#008A72',

  /** Gris Ardoise #2B2B2B - COULEUR SECONDAIRE
   * Usage: Texte principal, headers, titres premium */
  secondary: '#2B2B2B',

  /** Variant du secondaire pour hover */
  secondaryDark: '#1A1A1A',

  // ========================================================================
  // SURFACES ET BACKGROUNDS
  // ========================================================================

  /** Gris Clair #F3F3F3 - Fond
   * Usage: Fond principal de l'application, zones neutres */
  background: '#F3F3F3',

  /** Blanc Pur #FFFFFF - Contraste
   * Usage: Cartes, modals, surfaces principales */
  surface: '#FFFFFF',

  /** Variante du background pour séparations subtiles */
  surfaceVariant: '#E8E8E8',

  /** Hover state pour surfaces */
  surfaceHover: '#FAFAFA',

  // ========================================================================
  // COULEURS DE TEXTE
  // ========================================================================

  /** Noir #000000 - Titres premium */
  textPrimary: '#000000',

  /** Gris Ardoise #2B2B2B - Texte fort
   * Usage: Texte principal, paragraphes */
  textSecondary: '#2B2B2B',

  /** Gris moyen - Texte désactivé */
  textDisabled: '#9B9B9B',

  /** Alias pour compatibilité */
  textTertiary: '#9B9B9B',

  // ========================================================================
  // ÉTATS DE VALIDATION
  // ========================================================================

  /** Vert Clair #2ECC71 - Succès */
  success: '#2ECC71',

  /** Background success (vert très clair) */
  successLight: '#D5F4E6',

  /** Rouge Tomate #E74C3C - Erreur */
  error: '#E74C3C',

  /** Background erreur (rouge très clair) */
  errorLight: '#FDEDEC',

  /** Info */
  info: '#2196F3',

  /** Background info */
  infoLight: '#E3F2FD',

  /** Warning */
  warning: '#FFA726',

  /** Background warning */
  warningLight: '#FFF3E0',

  // ========================================================================
  // COULEURS DE STATUT (Badges, États de réservation)
  // ========================================================================

  /** Pending - En attente */
  statusPending: '#FFA726',

  /** Confirmed - Confirmé */
  statusConfirmed: '#2ECC71',

  /** Cancelled - Annulé */
  statusCancelled: '#7F8C8D',

  /** Completed - Terminé */
  statusCompleted: '#2C3E50',

  /** Waiting - En attente de réponse */
  statusWaiting: '#1ABC9C',

  // ========================================================================
  // BORDURES ET SÉPARATEURS
  // ========================================================================

  /** Gris moyen - Bordures principales */
  border: '#E0E0E0',

  /** Gris très clair - Dividers subtils */
  divider: '#F5F5F5',

  /** Bordure claire */
  borderLight: '#F5F5F5',

  /** Bordure foncée */
  borderDark: '#BDC3C7',

  // ========================================================================
  // OVERLAYS ET OMBRES
  // ========================================================================

  /** Overlay sombre pour modals (25% noir) */
  overlay: 'rgba(0, 0, 0, 0.25)',

  /** Overlay léger pour hover (4% noir) */
  overlayLight: 'rgba(0, 0, 0, 0.04)',

  // ========================================================================
  // GRADIENTS (basés sur la nouvelle charte FLIT)
  // ========================================================================

  /** Gradient primaire - Vert Émeraude FLIT */
  gradientStart: '#00A88B',
  gradientEnd: '#008A72',
} as const;

export type ColorName = keyof typeof FlitCarColors;
