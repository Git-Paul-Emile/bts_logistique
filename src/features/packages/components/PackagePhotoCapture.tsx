import { Camera, Trash2, X } from 'lucide-react';
import { useRef } from 'react';

interface PackagePhotoCaptureProps {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (index: number) => void;
}

/**
 * Prise de photos du colis via la caméra ou la galerie.
 * Les photos sont stockées en base64 dans le formulaire, à des fins de documentation locale
 * uniquement. Aucun upload vers le serveur : fonctionnalité hors cahier des charges initial.
 */
export function PackagePhotoCapture({ photos, onAdd, onRemove }: PackagePhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') onAdd(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-semibold text-slate-800">Photos du colis</h3>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Ajouter une photo du colis"
      />

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((src, index) => (
            <li key={index} className="group relative aspect-square overflow-hidden rounded-md">
              <img
                src={src}
                alt={`Photo colis ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 rounded-full bg-red-600 p-0.5 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                aria-label={`Supprimer la photo ${index + 1}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
      >
        <Camera size={16} aria-hidden="true" />
        {photos.length === 0 ? 'Prendre ou importer une photo' : 'Ajouter une photo'}
      </button>

      {photos.length > 0 && (
        <button
          type="button"
          onClick={() => {
            while (photos.length > 0) onRemove(0);
          }}
          className="flex w-full items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-700"
        >
          <Trash2 size={12} /> Tout supprimer
        </button>
      )}
    </div>
  );
}
