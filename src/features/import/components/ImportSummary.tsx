import { AlertTriangle, CheckCircle2, CircleSlash, PencilLine } from 'lucide-react';
import type { ImportDefinition, ImportPlan } from '../importTypes';

interface ImportSummaryProps<Item, Context, Patch> {
  definition: ImportDefinition<Item, Context, Patch>;
  fileName: string;
  plan: ImportPlan<Item, Patch>;
}

/** Nombre maximal d'erreurs affichées : au-delà, le fichier est probablement mal construit. */
const MAX_VISIBLE_ISSUES = 200;

function lines(count: number): string {
  return `${count} ligne${count > 1 ? 's' : ''}`;
}

export function ImportSummary<Item, Context, Patch>({
  definition,
  fileName,
  plan,
}: ImportSummaryProps<Item, Context, Patch>) {
  const rowsInError = new Set(plan.issues.map((issue) => issue.row)).size;
  const fileLevelError = plan.issues.some((issue) => issue.row === null || issue.row === 1);
  const nothingNew =
    plan.issues.length === 0 && plan.creates.length === 0 && plan.completions.length === 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Fichier vérifié : « {fileName} », {lines(plan.rowCount)} remplie
        {plan.rowCount > 1 ? 's' : ''}.
      </p>

      <ul className="space-y-2">
        {plan.creates.length > 0 && (
          <li className="flex items-start gap-2 text-emerald-800">
            <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              {lines(plan.creates.length)} valide{plan.creates.length > 1 ? 's' : ''}, à ajouter
              comme{' '}
              {plan.creates.length > 1
                ? `nouveaux ${definition.plural}`
                : `nouveau ${definition.singular}`}
              .
            </span>
          </li>
        )}
        {plan.completions.length > 0 && (
          <li className="flex items-start gap-2 text-[#003366]">
            <PencilLine size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <div>
              <p>
                {plan.completions.length > 1
                  ? `${lines(plan.completions.length)} complètent des fiches déjà enregistrées`
                  : '1 ligne complète une fiche déjà enregistrée'}{' '}
                (seules les cases vides sont remplies) :
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
                {plan.completions.map((completion) => (
                  <li key={completion.row}>
                    Ligne {completion.row} : {completion.label}, {completion.columns.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )}
        {plan.skipped.length > 0 && (
          <li className="flex items-start gap-2 text-slate-600">
            <CircleSlash size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              {lines(plan.skipped.length)} déjà enregistrée{plan.skipped.length > 1 ? 's' : ''},
              ignorée{plan.skipped.length > 1 ? 's' : ''} (ligne
              {plan.skipped.length > 1 ? 's' : ''} {plan.skipped.map((skip) => skip.row).join(', ')}
              ).
            </span>
          </li>
        )}
        {rowsInError > 0 && !fileLevelError && (
          <li className="flex items-start gap-2 text-red-700">
            <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>
              {rowsInError > 1
                ? `${lines(rowsInError)} avec des erreurs : elles ne seront pas importées tant qu’elles ne sont pas corrigées.`
                : '1 ligne avec des erreurs : elle ne sera pas importée tant qu’elle n’est pas corrigée.'}
            </span>
          </li>
        )}
      </ul>

      {nothingNew && (
        <p role="status" className="rounded-md border border-slate-200 bg-slate-50 p-3">
          Rien de nouveau dans ce fichier : toutes les lignes sont déjà enregistrées.
        </p>
      )}

      {plan.issues.length > 0 && (
        <div role="alert" className="space-y-2">
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            {fileLevelError
              ? 'Le fichier ne peut pas être importé :'
              : 'Ouvrez le fichier dans Excel et corrigez ces cases. Vous pouvez importer les lignes valides maintenant, puis réimporter le même fichier une fois corrigé : les lignes déjà enregistrées seront ignorées.'}
          </p>
          <div className="max-h-72 overflow-y-auto rounded-md border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Ligne Excel
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Colonne
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Valeur trouvée
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    À corriger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plan.issues.slice(0, MAX_VISIBLE_ISSUES).map((issue, index) => (
                  <tr key={`${issue.row}-${issue.column}-${index}`} className="align-top">
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">
                      {issue.row ?? 'Fichier'}
                    </td>
                    <td className="px-3 py-2">{issue.column ?? 'Toute la ligne'}</td>
                    <td className="px-3 py-2 break-all text-slate-500">{issue.value ?? ''}</td>
                    <td className="px-3 py-2">{issue.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plan.issues.length > MAX_VISIBLE_ISSUES && (
            <p className="text-xs text-slate-500">
              Seules les {MAX_VISIBLE_ISSUES} premières erreurs sont affichées.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
