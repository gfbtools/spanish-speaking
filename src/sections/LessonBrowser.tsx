import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, CheckCircle, Clock, MapPin, Utensils, Users, Home, ShoppingBag, Plane } from 'lucide-react';
import type { Dialect } from '@/types';

interface LessonInfo {
  id: string;
  title: string;
  module: string;
  level: string;
}

interface LessonBrowserProps {
  lessons: LessonInfo[];
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  dialect: Dialect;
  progress?: { lessons_completed: number; lessons_total: number } | null;
}

const moduleIcons: Record<string, React.ElementType> = {
  'Travel': Plane,
  'Daily Life': Home,
  'Shopping': ShoppingBag,
  'Food': Utensils,
  'Social': Users,
  'Default': MapPin,
};

const moduleColors: Record<string, string> = {
  'Travel': 'bg-blue-100 text-blue-700 border-blue-200',
  'Daily Life': 'bg-green-100 text-green-700 border-green-200',
  'Shopping': 'bg-purple-100 text-purple-700 border-purple-200',
  'Food': 'bg-orange-100 text-orange-700 border-orange-200',
  'Social': 'bg-pink-100 text-pink-700 border-pink-200',
  'Default': 'bg-gray-100 text-gray-700 border-gray-200',
};

export function LessonBrowser({ lessons, currentLessonId, onSelectLesson, dialect, progress }: LessonBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');

  // Get unique modules
  const modules = [...new Set(lessons.map(l => l.module))];

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || lesson.module === filterModule;
    return matchesSearch && matchesModule;
  });

  // Group lessons by module
  const groupedLessons = filteredLessons.reduce((acc, lesson) => {
    if (!acc[lesson.module]) {
      acc[lesson.module] = [];
    }
    acc[lesson.module].push(lesson);
    return acc;
  }, {} as Record<string, LessonInfo[]>);

  const getDialectLabel = (d: Dialect) => {
    const labels: Record<Dialect, string> = {
      'es-ES': 'Spain',
      'es-MX': 'Mexico',
      'es-PR': 'Puerto Rico',
      'es-419': 'Latin America',
    };
    return labels[d];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Available Lessons</h2>
          <p className="text-gray-600">
            {lessons.length} lessons available • Currently viewing: {getDialectLabel(dialect)} Spanish
          </p>
        </div>
        <Badge variant="outline" className="self-start md:self-auto border-amber-300 text-amber-700">
          {dialect}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Your Progress</h3>
            <span className="text-sm text-gray-600">{progress?.lessons_completed ?? 0} / {lessons.length} completed</span>
          </div>
          <Progress value={progress ? Math.round((progress.lessons_completed / lessons.length) * 100) : 0} className="h-3" />
          <p className="text-sm text-gray-600 mt-2">
            Complete lessons to track your progress and build your Spanish skills!
          </p>
        </CardContent>
      </Card>

      {/* Lesson Modules */}
      <div className="space-y-6">
        {Object.entries(groupedLessons).map(([module, moduleLessons]) => {
          const Icon = moduleIcons[module] || moduleIcons.Default;
          const colorClass = moduleColors[module] || moduleColors.Default;
          
          return (
            <div key={module}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{module}</h3>
                <Badge variant="outline" className="text-xs">
                  {moduleLessons.length} lessons
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleLessons.map((lesson) => (
                  <Card 
                    key={lesson.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      currentLessonId === lesson.id 
                        ? 'ring-2 ring-amber-500 bg-amber-50/30' 
                        : ''
                    }`}
                    onClick={() => onSelectLesson(lesson.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={`text-xs mb-2 ${colorClass}`}>
                            {lesson.level}
                          </Badge>
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        </div>
                        {currentLessonId === lesson.id && (
                          <CheckCircle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        ~20 min
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        variant={currentLessonId === lesson.id ? "default" : "outline"}
                        size="sm"
                        className={`w-full ${
                          currentLessonId === lesson.id 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {currentLessonId === lesson.id ? 'Continue' : 'Start Lesson'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No lessons found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterModule('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Coming Soon */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">More lessons coming soon!</p>
          <p className="text-sm text-gray-400 mt-1">
            We're adding more modules: Shopping, Weather, Time, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
