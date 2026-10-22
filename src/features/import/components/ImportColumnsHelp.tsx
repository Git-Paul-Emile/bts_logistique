import { useState } from 'react';
import type { ImportColumn } from '../importTypes';

/** Repli « En savoir plus » : colonnes attendues, obligatoires ou non, avec un exemple. */
export function ImportColumnsHelp({ columns }: { columns: readonly ImportColumn[] }) {
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);

  return (
    <details
      className="rounded-md border border-slate-200 p-3"
      onToggle={(event) => setIsColumnsOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer font-semibold text-slate-800">
        {isColumnsOpen ? 'En savoir moins' : 'En savoir plus'}
      </summary>
      <p className="mt-2 text-xs text-slate-500">
        L’ordre des colonnes n’a pas d’importance. Les autres colonnes du fichier sont ignorées.
      </p>
      <table className="mt-2 w-full text-left text-xs">
        <thead className="text-slate-500">
          <tr>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Colonne
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Obligatoire
            </th>
            <th scope="col" className="py-1 font-semibold">
              Exemple de valeur
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {columns.map((column) => (
            <tr key={column.header}>
              <td className="py-1 pr-3 font-medium text-slate-800">{column.header}</td>
              <td className="py-1 pr-3">{column.required ? 'Oui' : 'Non'}</td>
              <td className="py-1">{String(column.example)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
