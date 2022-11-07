/* eslint-disable prettier/prettier */ 
 // WARNING: This file was automatically generated by no.item.xp.codegen. You may lose your changes if you edit it.
export interface MunicipalityAlert {
  /**
   * Tekst
   */
  message: string;

  /**
   * Velg hvilke sidetype varselet skal vises på
   */
  municipalPageType: 'kommunefakta' | 'kommuneareal' | 'barn-og-unge' | 'showOnAll';

  /**
   * Velg hvilken kommuner det gjelder her.
   */
  municipalCodes?: Array<string>;

  /**
   * Velg for å gjelde alle kommuner
   */
  selectAllMunicipals: boolean;
}
