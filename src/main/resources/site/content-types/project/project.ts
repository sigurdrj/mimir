/* eslint-disable prettier/prettier */ 
 // WARNING: This file was automatically generated by no.item.xp.codegen. You may lose your changes if you edit it.
export interface Project {
  /**
   * Stikktittel
   */
  introTitle?: string;

  /**
   * Prosjekt/modellansvarlig
   */
  manager?: string;

  /**
   * Velg mellom prosjekt eller modell
   */
  projectType?: 'project' | 'model';

  /**
   * Periode
   */
  projectPeriod?: string;

  /**
   * Finansiør
   */
  financier?: string;

  /**
   * Om Prosjekt/Modell
   */
  ingress?: string;

  /**
   * Prosjekttekst
   */
  body?: string;

  /**
   * Prosjektdeltakere
   */
  participants?: string;

  /**
   * Samarbeidspartnere
   */
  collaborators?: string;
}
