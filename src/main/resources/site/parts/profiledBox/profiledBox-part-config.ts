/* eslint-disable prettier/prettier */ 
 // WARNING: This file was automatically generated by no.item.xp.codegen. You may lose your changes if you edit it.
export interface ProfiledBoxPartConfig {
  /**
   * Retning
   */
  cardOrientation: 'horizontal' | 'vertical';

  /**
   * Bilde
   */
  image: string;

  /**
   * Innhold
   */
  content?: string;

  /**
   * Dato
   */
  date?: string;

  /**
   * Tittel
   */
  title: string;

  /**
   * Ingress
   */
  preamble: string;

  /**
   * Lenke
   */
  urlContentSelector:
    | {
        /**
         * Selected
         */
        _selected: 'optionLink';

        /**
         * URL
         */
        optionLink: {
          /**
           * Lenke
           */
          link?: string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: 'optionXPContent';

        /**
         * XP-innhold
         */
        optionXPContent: {
          /**
           * Innhold i XP
           */
          xpContent?: string;
        };
      };
}
