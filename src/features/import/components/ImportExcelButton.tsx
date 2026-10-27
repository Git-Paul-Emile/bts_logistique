import type { ChangeEvent } from 'react';
import { useId, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { importHistoryApi } from '@/api/endpoints/importHistory.api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { reportError } from '@/lib/reportError';
import type { ImportBatch, ImportDefinition, ImportPlan } from '../importTypes';
import { readFirstSheet, SpreadsheetFileError } from '../spreadsheetFiles';
import { validateImport } from '../validateImport';
import { ImportColumnsHelp } from './ImportColumnsHelp';
import { ImportSummary } from './ImportSummary';

interface ImportExcelButtonProps<Item, Context, Patch> {
  definition: ImportDefinition<Item, Context, Patch>;
  /** Données enregistrées, lues sur le serveur au moment de la vérification (doublons, fiches à compléter). */
  getContext: () => Promise<Context>;
  /** Enregistre les lignes valides : nouvelles fiches et cases vides à compléter. */
  onImport: (batch: ImportBatch<Item, Patch>) => Promise<void>;
}

type Step<Item, Patch> =
  | { name: 'idle' }
  | { name: 'reading' }
  | { name: 'fileError'; message: string }
  | { name: 'checked'; fileName: string; plan: ImportPlan<Item, Patch> }
  | { name: 'importing'; fileName: string; plan: ImportPlan<Item, Patch> };

function plural(value: number, singular: string, pluralForm: string): string {
  return `${value} ${value > 1 ? pluralForm : singular}`;
}

export function ImportExcelButton<Item, Context, Patch>({
  definition,
  getContext,
  onImport,
}: ImportExcelButtonProps<Item, Context, Patch>) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step<Item, Patch>>({ name: 'idle' });
  const fileInputId = useId();

  function close() {
    setIsOpen(false);
    setStep({ name: 'idle' });
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Permet de choisir à nouveau le même fichier après l'avoir corrigé.
    event.target.value = '';
    if (!file) return;

    setStep({ name: 'reading' });
    try {
      const [sheet, imported, context] = await Promise.all([
        readFirstSheet(file),
        importHistoryApi.getFingerprints(definition.entity),
        getContext(),
      ]);
      const plan = validateImport(definition, sheet, context, imported);
      setStep({ name: 'checked', fileName: file.name, plan });
    } catch (error) {
      if (!(error instanceof SpreadsheetFileError)) reportError('Lecture du fichier Excel', error);
      const message =
        error instanceof SpreadsheetFileError ? error.message : 'Le fichier n’a pas pu être lu.';
      setStep({ name: 'fileError', message });
    }
  }

  async function handleImport(fileName: string, plan: ImportPlan<Item, Patch>) {
    setStep({ name: 'importing', fileName, plan });
    try {
      const { fingerprint, entity } = definition;
      await onImport({
        creates: plan.creates.map(({ item }) => item),
        completions: plan.completions.map(({ targetId, changes }) => ({ targetId, changes })),
        markImported: async (item) => {
          if (fingerprint) await importHistoryApi.addFingerprints(entity, [fingerprint(item)]);
        },
      });
      close();
    } catch (error) {
      reportError('Import Excel', error);
      setStep({
        name: 'fileError',
        message:
          'L’enregistrement s’est interrompu. Importez à nouveau le même fichier : les lignes déjà enregistrées seront ignorées.',
      });
    }
  }

  const checked = step.name === 'checked' || step.name === 'importing' ? step : null;
  const actionable = checked ? checked.plan.creates.length + checked.plan.completions.length : 0;
  const hasErrors = Boolean(checked && checked.plan.issues.length > 0);

  return (
    <>
      <Button
        variant="outline"
        icon={<FileSpreadsheet size={16} />}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Importer
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Importer des ${definition.plural}`}
        description="Chaque ligne du fichier est vérifiée comme un formulaire avant l’enregistrement."
        maxWidth="2xl"
      >
        <div className="space-y-5 text-sm text-slate-700">
          {!checked && <ImportColumnsHelp columns={definition.columns} />}

          <div>
            <label htmlFor={fileInputId} className="mb-1.5 block text-xs font-semibold">
              {checked ? 'Choisir un autre fichier (.xlsx)' : 'Fichier Excel à importer (.xlsx)'}
            </label>
            <input
              id={fileInputId}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFile}
              disabled={step.name === 'reading' || step.name === 'importing'}
              className="block w-full text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#003366] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#002244]"
            />
          </div>

          {step.name === 'reading' && (
            <p role="status" className="text-slate-500">
              Vérification du fichier…
            </p>
          )}

          {step.name === 'fileError' && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              {step.message}
            </p>
          )}

          {checked && (
            <ImportSummary
              definition={definition}
              fileName={checked.fileName}
              plan={checked.plan}
            />
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            {hasErrors && (
              <Button
                variant="outline"
                onClick={() => setStep({ name: 'idle' })}
                disabled={step.name === 'importing'}
              >
                Corriger le fichier et recommencer
              </Button>
            )}
            {!hasErrors && (
              <Button variant="outline" onClick={close}>
                {checked && actionable === 0 ? 'Fermer' : 'Annuler'}
              </Button>
            )}
            {checked && actionable > 0 && (
              <Button
                loading={step.name === 'importing'}
                onClick={() => void handleImport(checked.fileName, checked.plan)}
              >
                {hasErrors
                  ? actionable > 1
                    ? `Importer quand même les ${actionable} lignes valides`
                    : 'Importer quand même la ligne valide'
                  : `Importer ${plural(actionable, 'ligne', 'lignes')}`}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
