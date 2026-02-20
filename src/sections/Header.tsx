import type { Dialect } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, GraduationCap } from 'lucide-react';

interface HeaderProps {
  dialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
}

const dialectLabels: Record<Dialect, string> = {
  'es-ES': 'Español (Spain)',
  'es-MX': 'Español (Mexico)',
  'es-PR': 'Español (Puerto Rico)',
  'es-419': 'Español (Latin America)',
};

const dialectDescriptions: Record<Dialect, string> = {
  'es-ES': 'With distinción (θ) and Castilian pronunciation',
  'es-MX': 'Standard Mexican Spanish',
  'es-PR': 'Caribbean Spanish with unique vocabulary',
  'es-419': 'Neutral Latin American Spanish',
};

export function Header({ dialect, onDialectChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-amber-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              Spanish Learning
            </h1>
            <p className="text-xs text-gray-500">Master Español</p>
          </div>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right mr-2">
            <p className="text-xs text-gray-500">Current dialect</p>
            <p className="text-xs text-amber-600 font-medium">{dialectDescriptions[dialect]}</p>
          </div>
          <Globe className="w-5 h-5 text-amber-600" />
          <Select value={dialect} onValueChange={(value) => onDialectChange(value as Dialect)}>
            <SelectTrigger className="w-[200px] bg-white border-amber-300 focus:ring-amber-500">
              <SelectValue placeholder="Select dialect" />
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
