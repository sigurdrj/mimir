export function sanitizeForSolr(term: string): string {
  return term
    .replace('/[\'<>;.,´`"]/g', '')
    .replaceAll('\\+', '&2B')
}

export interface TextUtilsLib {
  sanitizeForSolr: (term: string) => string
}
