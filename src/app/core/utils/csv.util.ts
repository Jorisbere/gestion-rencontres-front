export interface ColonneCsv<T> {
  entete: string;
  valeur: (ligne: T) => string | number | boolean | null | undefined;
}

/** Échappe une valeur pour l'inclure dans une cellule CSV (RFC 4180 : guillemets doublés,
 * cellule entourée de guillemets si elle contient une virgule, un guillemet ou un saut de ligne). */
function echapperCellule(valeur: string | number | boolean | null | undefined): string {
  const texte = valeur === null || valeur === undefined ? '' : String(valeur);
  if (/[",\n;]/.test(texte)) {
    return `"${texte.replace(/"/g, '""')}"`;
  }
  return texte;
}

/** Génère un CSV côté client à partir des données déjà chargées dans la page et déclenche
 * son téléchargement — pas d'appel serveur nécessaire, la liste est déjà en mémoire. */
export function exporterCsv<T>(nomFichier: string, colonnes: ColonneCsv<T>[], lignes: T[]): void {
  const entetes = colonnes.map((c) => echapperCellule(c.entete)).join(';');
  const corps = lignes
    .map((ligne) => colonnes.map((c) => echapperCellule(c.valeur(ligne))).join(';'))
    .join('\r\n');

  // BOM UTF-8 : nécessaire pour qu'Excel affiche correctement les accents à l'ouverture.
  const contenu = '﻿' + entetes + '\r\n' + corps;
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier.endsWith('.csv') ? nomFichier : `${nomFichier}.csv`;
  lien.click();
  window.URL.revokeObjectURL(url);
}
