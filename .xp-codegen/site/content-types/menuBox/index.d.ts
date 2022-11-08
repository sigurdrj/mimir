// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export interface MenuBox {
  /**
   * Kort
   */
  menu?: Array<{
    /**
     * Tittel
     */
    title?: string;

    /**
     * Undertittel
     */
    subtitle?: string;

    /**
     * Bilde
     */
    image?: string;

    /**
     * Lenkemål
     */
    urlSrc:
      | {
          /**
           * Selected
           */
          _selected: "manual";

          /**
           * Url
           */
          manual: {
            /**
             * Kildelenke
             */
            url: string;
          };
        }
      | {
          /**
           * Selected
           */
          _selected: "content";

          /**
           * Lenke til internt innhold
           */
          content: {
            /**
             * Relatert innhold
             */
            contentId: string;
          };
        };
  }>;

  /**
   * GraphQL name. Also used for separating unions in TypeScript
   */
  __typename?: "mimir_MenuBox_Data";
}
