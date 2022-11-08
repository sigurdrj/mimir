// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export interface Default {
  /**
   * Sidetype
   */
  pageType: "default" | "municipality" | "factPage";

  /**
   * Hovedemne eller Delemne
   */
  subjectType?: "mainSubject" | "subSubject";

  /**
   * Emnekode
   */
  subjectCode?: string;

  /**
   * Skjul Brødsmulesti
   */
  hide_breadcrumb: boolean;

  /**
   * Velg bakgrunnsfarge
   */
  bkg_color: "white" | "grey";

  /**
   * Region
   */
  regions: Array<{
    /**
     * Tittel
     */
    title?: string;

    /**
     * Skjul tittel
     */
    hideTitle: boolean;

    /**
     * Visningstype
     */
    view: "full" | "card" | "plainSection";

    /**
     * Region
     */
    region: "Rad_A" | "Rad_B" | "Rad_C" | "Rad_D" | "Rad_E" | "Rad_F" | "Rad_G" | "Rad_H" | "Rad_I" | "Rad_J" | "Rad_K" | "Rad_L" | "Rad_M" | "Rad_N" | "Rad_O" | "Rad_P" | "Rad_Q" | "Rad_R" | "Rad_S" | "Rad_T" | "Rad_U" | "Rad_V" | "Rad_W" | "Rad_X" | "Rad_Y" | "Rad_Z";

    /**
     * Med mørk og skrå bakgrunn
     */
    showGreyTriangle: boolean;

    /**
     * Grå bakgrunn på region
     */
    showGreyBackground: boolean;

    /**
     * Toppramme
     */
    topBorder: boolean;
  }>;
}
