import React from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';

type ExcelUploaderProps<T> = {
  onDataLoaded: (rows: T[]) => void;
  mapRow: (row: any) => T | null; // convert raw row to typed row
  label?: string;
};

function ExcelUploader<T>({ onDataLoaded, mapRow, label = 'Upload Excel' }: ExcelUploaderProps<T>) {
  const [fileName, setFileName] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const mapped = json
        .map(mapRow)
        .filter((r): r is T => r !== null);

      if (mapped.length === 0) {
        setError('No valid rows found in the Excel file. Please check the format.');
      } else {
        onDataLoaded(mapped);
        setError('');
      }
    } catch (err) {
      setError(`Error reading file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      // Reset the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  return (
    <div className="mb-4 p-4 border border-black/20 rounded-xl bg-black/5">
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-black bg-white hover:bg-black/5 transition-colors">
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="hidden"
          disabled={isProcessing}
        />
      </label>

      {fileName && (
        <div className="mt-2 text-sm text-black/60">
          {isProcessing ? (
            <span>Processing {fileName}...</span>
          ) : (
            <span>✓ Loaded {fileName}</span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 border border-red-300 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

export default ExcelUploader;
