import { useState, useMemo } from 'react';
import type { VocabularyEntry, Dialect } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Search, Filter, BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTTS } from '@/hooks/useTTS';

interface VocabularyBrowserProps {
  vocabulary: VocabularyEntry[];
  dialect: Dialect;
}

export function VocabularyBrowser({ vocabulary, dialect }: VocabularyBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDialect, setFilterDialect] = useState<string>(dialect);
  const [filterPOS, setFilterPOS] = useState<string>('all');

  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(entry => {
      const matchesSearch = 
        entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.translation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filterLevel === 'all' || entry.cefr === filterLevel;
      const matchesDialect = filterDialect === 'all' || 
        entry.dialect === 'universal' || 
        entry.dialect === filterDialect;
      const matchesPOS = filterPOS === 'all' || entry.pos === filterPOS;

      return matchesSearch && matchesLevel && matchesDialect && matchesPOS;
    });
  }, [vocabulary, searchTerm, filterLevel, filterDialect, filterPOS]);

  const stats = useMemo(() => {
    const total = vocabulary.length;
    const byDialect = vocabulary.reduce((acc, v) => {
      acc[v.dialect] = (acc[v.dialect] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byLevel = vocabulary.reduce((acc, v) => {
      acc[v.cefr] = (acc[v.cefr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, byDialect, byLevel };
  }, [vocabulary]);

  const posCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vocabulary.forEach(entry => {
      counts[entry.pos] = (counts[entry.pos] || 0) + 1;
    });
    return counts;
  }, [vocabulary]);

  const { speak } = useTTS(dialect);

  const playAudio = (word: string) => {
    speak(word);
  };

  const getDialectColor = (d: string) => {
    switch (d) {
      case 'universal': return 'bg-green-100 text-green-700';
      case 'es-ES': return 'bg-blue-100 text-blue-700';
      case 'es-MX': return 'bg-amber-100 text-amber-700';
      case 'es-PR': return 'bg-red-100 text-red-700';
      case 'es-419': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDialectLabel = (d: string) => {
    const labels: Record<string, string> = {
      'universal': 'Universal',
      'es-ES': 'Spain',
      'es-MX': 'Mexico',
      'es-PR': 'Puerto Rico',
      'es-419': 'Latin America',
    };
    return labels[d] || d;
  };

  const getPOSLabel = (pos: string) => {
    const labels: Record<string, string> = {
      'noun': 'Noun',
      'verb': 'Verb',
      'adjective': 'Adjective',
      'adverb': 'Adverb',
      'pronoun': 'Pronoun',
      'preposition': 'Preposition',
      'article': 'Article',
      'determiner': 'Determiner',
      'possessive': 'Possessive',
      'expression': 'Expression',
    };
    return labels[pos] || pos;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Words</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.byLevel['A1'] || 0}
            </p>
            <p className="text-sm text-gray-600">A1 Level</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats.byDialect['es-PR'] || 0}
            </p>
            <p className="text-sm text-gray-600">Puerto Rican</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.byDialect['universal'] || 0}
            </p>
            <p className="text-sm text-gray-600">Universal</p>
          </CardContent>
        </Card>
      </div>

      {/* Dialect Highlight */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Puerto Rican Spanish Vocabulary</h3>
              <p className="text-sm text-gray-600">
                Discover unique words like <strong>guagua</strong> (bus), <strong>china</strong> (orange), 
                and <strong>zafacón</strong> (trash can) used in Puerto Rico!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search words or translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterDialect} onValueChange={setFilterDialect}>
                <SelectTrigger className="w-[150px]">
                  <Globe className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Dialect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dialects</SelectItem>
                  <SelectItem value="universal">Universal</SelectItem>
                  <SelectItem value="es-ES">Spain</SelectItem>
                  <SelectItem value="es-MX">Mexico</SelectItem>
                  <SelectItem value="es-PR">Puerto Rico</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPOS} onValueChange={setFilterPOS}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(posCounts).map(([pos, count]) => (
                    <SelectItem key={pos} value={pos}>
                      {getPOSLabel(pos)} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <strong>{filteredVocabulary.length}</strong> of {vocabulary.length} words
        </p>
        {filterDialect !== 'all' && (
          <Badge className={getDialectColor(filterDialect)}>
            {getDialectLabel(filterDialect)}
          </Badge>
        )}
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocabulary.map((entry, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-lg transition-shadow border-l-4 ${
              entry.dialect === 'es-PR' ? 'border-l-red-400' :
              entry.dialect === 'es-MX' ? 'border-l-amber-400' :
              entry.dialect === 'es-ES' ? 'border-l-blue-400' :
              'border-l-green-400'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{entry.word}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(entry.word)}
                      className="h-6 w-6 p-0"
                    >
                      <Volume2 className="w-4 h-4 text-amber-600" />
                    </Button>
                  </div>
                  
                  <p className="text-amber-600 font-mono text-sm mb-2">
                    {entry.ipa}
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    {entry.translation}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {getPOSLabel(entry.pos)}
                    </Badge>
                    <Badge className={`text-xs ${getDialectColor(entry.dialect)}`}>
                      {getDialectLabel(entry.dialect)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {entry.cefr}
                    </Badge>
                    {entry.register !== 'neutral' && (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                        {entry.register}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVocabulary.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No words found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterLevel('all');
              setFilterDialect('all');
              setFilterPOS('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
