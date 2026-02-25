import type { Dialect } from '@/types';
import { Play, CheckCircle, Clock, Lock } from 'lucide-react';

interface LessonInfo {
  id: string;
  title: string;
  module: string;
  level: string;
  emoji: string;
}

interface LessonBrowserProps {
  lessons: LessonInfo[];
  currentLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  dialect: Dialect;
  progress?: { lessons_completed: number; lessons_total: number } | null;
}

const moduleColors: Record<string, { bg: string; text: string; bar: string }> = {
  'Foundations': { bg: 'bg-amber-100',  text: 'text-amber-800',  bar: 'bg-amber-500' },
  'Daily Life':  { bg: 'bg-green-100',  text: 'text-green-800',  bar: 'bg-green-500' },
  'Travel':      { bg: 'bg-blue-100',   text: 'text-blue-800',   bar: 'bg-blue-500' },
};

const dialectLabel: Record<Dialect, string> = {
  'es-MX': 'Mexican Spanish',
  'es-ES': 'Spain Spanish',
  'es-PR': 'Puerto Rican Spanish',
  'es-419': 'Latin American Spanish',
};

export function LessonBrowser({ lessons, currentLessonId, onSelectLesson, dialect, progress }: LessonBrowserProps) {
  const completed = progress?.lessons_completed ?? 0;
  const pct = Math.round((completed / lessons.length) * 100);

  // Group by module, preserving registry order
  const modules: string[] = [];
  const grouped: Record<string, LessonInfo[]> = {};
  for (const lesson of lessons) {
    if (!grouped[lesson.module]) {
      grouped[lesson.module] = [];
      modules.push(lesson.module);
    }
    grouped[lesson.module].push(lesson);
  }

  // Assign sequential numbers across all lessons
  let lessonNumber = 0;

  return (
    <div className="space-y-6">

      {/* Welcome / progress header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90 mb-1">{dialectLabel[dialect]}</p>
        <h1 className="text-2xl font-bold mb-3">¡Hola! Ready to learn? 👋</h1>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>{completed} of {lessons.length} lessons done</span>
          <span className="font-bold">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/30">
          <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Module groups */}
      {modules.map((module) => {
        const color = moduleColors[module] ?? moduleColors['Foundations'];
        const moduleLessons = grouped[module];

        return (
          <div key={module}>
            {/* Module header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${color.bg}`}>
              <div className={`w-2 h-5 rounded-full ${color.bar}`} />
              <h2 className={`font-bold text-base ${color.text}`}>{module}</h2>
              <span className={`text-xs font-medium opacity-70 ${color.text}`}>
                {moduleLessons.length} lessons
              </span>
            </div>

            {/* Lesson list */}
            <div className="space-y-2">
              {moduleLessons.map((lesson) => {
                lessonNumber++;
                const num = lessonNumber;
                const isCurrent = currentLessonId === lesson.id;
                // Simple unlock: everything is unlocked for now
                const isLocked = false;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && onSelectLesson(lesson.id)}
                    disabled={isLocked}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                      ${isCurrent
                        ? 'border-amber-400 bg-amber-50 shadow-md'
                        : isLocked
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 active:scale-[0.98]'
                      }
                    `}
                  >
                    {/* Emoji / number badge */}
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
                      ${isCurrent ? 'bg-amber-100' : 'bg-gray-100'}
                    `}>
                      {lesson.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${color.text} ${color.bg} px-2 py-0.5 rounded-full`}>
                          #{num}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 text-base leading-tight">{lesson.title}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>~20 min</span>
                        <span className="mx-1">·</span>
                        <span>{lesson.level}</span>
                      </div>
                    </div>

                    {/* Right icon */}
                    <div className="shrink-0">
                      {isLocked
                        ? <Lock className="w-5 h-5 text-gray-400" />
                        : isCurrent
                        ? <Play className="w-6 h-6 text-amber-500 fill-amber-500" />
                        : <CheckCircle className="w-5 h-5 text-gray-300" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom breathing room */}
      <div className="h-4" />
    </div>
  );
}
