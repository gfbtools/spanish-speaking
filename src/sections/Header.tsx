import type { Dialect } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface HeaderProps {
  dialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
}

const dialectLabels: Record<Dialect, string> = {
  'es-ES': '🇪🇸 Spain',
  'es-MX': '🇲🇽 Mexico',
  'es-PR': '🇵🇷 Puerto Rico',
  'es-419': '🌎 Latin America',
};

export function Header({ dialect, onDialectChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-amber-200 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗣️</span>
          <span className="font-bold text-gray-800 text-lg">Spanish4U</span>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-600 shrink-0" />
          <Select value={dialect} onValueChange={(v) => onDialectChange(v as Dialect)}>
            <SelectTrigger className="h-9 border-amber-200 focus:ring-amber-500 text-sm min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es-MX">{dialectLabels['es-MX']}</SelectItem>
              <SelectItem value="es-ES">{dialectLabels['es-ES']}</SelectItem>
              <SelectItem value="es-PR">{dialectLabels['es-PR']}</SelectItem>
              <SelectItem value="es-419">{dialectLabels['es-419']}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
