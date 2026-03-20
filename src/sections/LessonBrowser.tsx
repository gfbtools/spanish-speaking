import { useMemo } from 'react';
import type { Dialect } from '@/types';
import { Play, CheckCircle, Clock, Lock, Star } from 'lucide-react';

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
  completedLessons: Set<string>;
}

const moduleColors: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  'A1 Foundations': { bg: 'bg-amber-100',   text: 'text-amber-800',   bar: 'bg-amber-500',   border: 'border-amber-300' },
  'A1 Daily Life':  { bg: 'bg-green-100',   text: 'text-green-800',   bar: 'bg-green-500',   border: 'border-green-300' },
  'A1 Travel':      { bg: 'bg-blue-100',    text: 'text-blue-800',    bar: 'bg-blue-500',    border: 'border-blue-300' },
  'A2 Past & Future':{ bg: 'bg-purple-100', text: 'text-purple-800',  bar: 'bg-purple-500',  border: 'border-purple-300' },
  'A2 Grammar':     { bg: 'bg-rose-100',    text: 'text-rose-800',    bar: 'bg-rose-500',    border: 'border-rose-300' },
  'A2 Life & World':{ bg: 'bg-teal-100',    text: 'text-teal-800',    bar: 'bg-teal-500',    border: 'border-teal-300' },
  'A3 Advanced Grammar': { bg: 'bg-indigo-100', text: 'text-indigo-800', bar: 'bg-indigo-500', border: 'border-indigo-300' },
  'A3 Communication':    { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500', border: 'border-orange-300' },
  'A3 Topics':           { bg: 'bg-cyan-100',   text: 'text-cyan-800',   bar: 'bg-cyan-500',   border: 'border-cyan-300' },
};

const levelColors: Record<string, { badge: string }> = {
  A1: { badge: 'bg-amber-500' },
  A2: { badge: 'bg-purple-500' },
  A3: { badge: 'bg-indigo-500' },
};

const dialectLabel: Record<Dialect, string> = {
  'es-MX': 'Mexican Spanish',
  'es-ES': 'Spain Spanish',
  'es-PR': 'Puerto Rican Spanish',
  'es-419': 'Latin American Spanish',
};

export function LessonBrowser({ lessons, currentLessonId, onSelectLesson, dialect, progress: _progress, completedLessons }: LessonBrowserProps) {
  const completed = completedLessons.size;
  const pct = Math.round((completed / lessons.length) * 100);

  // Group by module preserving order
  const { modules, grouped } = useMemo(() => {
    const modules: string[] = [];
    const grouped: Record<string, LessonInfo[]> = {};
    for (const lesson of lessons) {
      if (!grouped[lesson.module]) {
        grouped[lesson.module] = [];
        modules.push(lesson.module);
      }
      grouped[lesson.module].push(lesson);
    }
    return { modules, grouped };
  }, [lessons]);

  // Build a flat index for unlock logic
  const lessonIndex = useMemo(() => {
    const map: Record<string, number> = {};
    lessons.forEach((l, i) => { map[l.id] = i; });
    return map;
  }, [lessons]);

  const isUnlocked = (lessonId: string) => {
    const idx = lessonIndex[lessonId];
    if (idx === 0) return true; // first lesson always unlocked
    const prevLesson = lessons[idx - 1];
    return completedLessons.has(prevLesson.id);
  };

  // Find the first lesson the user should do next
  const nextLessonId = useMemo(() => {
    for (const lesson of lessons) {
      if (!completedLessons.has(lesson.id) && isUnlocked(lesson.id)) return lesson.id;
    }
    return null;
  }, [completedLessons, lessons]);

  let lessonNumber = 0;

  // Group completions by level for badges
  const a1Done = lessons.filter(l => l.level === 'A1').every(l => completedLessons.has(l.id));
  const a2Done = lessons.filter(l => l.level === 'A2').every(l => completedLessons.has(l.id));
  const a3Done = lessons.filter(l => l.level === 'A3').every(l => completedLessons.has(l.id));

  return (
    <div className="space-y-6">

      {/* Progress header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90 mb-1">{dialectLabel[dialect]}</p>
        <h1 className="text-2xl font-bold mb-3">¡Hola! Ready to learn? 👋</h1>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>{completed} of {lessons.length} lessons done</span>
          <span className="font-bold">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/30">
          <div className="h-2 rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Level badges */}
      {(a1Done || a2Done || a3Done) && (
        <div className="flex gap-3">
          {a1Done && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-amber-700">A1 Complete</span>
            </div>
          )}
          {a2Done && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
              <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
              <span className="text-sm font-bold text-purple-700">A2 Complete</span>
            </div>
          )}
          {a3Done && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
              <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              <span className="text-sm font-bold text-indigo-700">A3 Complete</span>
            </div>
          )}
        </div>
      )}

      {/* Module groups */}
      {modules.map((module) => {
        const color = moduleColors[module] ?? moduleColors['A1 Foundations'];
        const moduleLessons = grouped[module];
        const moduleCompleted = moduleLessons.filter(l => completedLessons.has(l.id)).length;

        return (
          <div key={module}>
            {/* Module header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${color.bg} border ${color.border}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-5 rounded-full ${color.bar}`} />
                <h2 className={`font-bold text-base ${color.text}`}>{module}</h2>
              </div>
              <span className={`text-xs font-semibold ${color.text} opacity-80`}>
                {moduleCompleted}/{moduleLessons.length}
              </span>
            </div>

            {/* Lesson list */}
            <div className="space-y-2">
              {moduleLessons.map((lesson) => {
                lessonNumber++;
                const num = lessonNumber;
                const isCurrent = currentLessonId === lesson.id;
                const isDone = completedLessons.has(lesson.id);
                const unlocked = isUnlocked(lesson.id);
                const isNext = lesson.id === nextLessonId;
                const levelBadge = levelColors[lesson.level] ?? levelColors['A1'];

                return (
                  <button
                    key={lesson.id}
                    onClick={() => unlocked && onSelectLesson(lesson.id)}
                    disabled={!unlocked}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                      ${isDone
                        ? 'border-green-300 bg-green-50'
                        : isNext
                        ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-300 ring-offset-1'
                        : isCurrent
                        ? 'border-amber-400 bg-amber-50 shadow-md'
                        : !unlocked
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 active:scale-[0.98]'
                      }
                    `}
                  >
                    {/* Emoji badge */}
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
                      ${isDone ? 'bg-green-100' : isNext ? 'bg-amber-100' : 'bg-gray-100'}
                    `}>
                      {isDone ? '✅' : lesson.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-xs font-bold text-white ${levelBadge.badge} px-2 py-0.5 rounded-full`}>
                          {lesson.level} #{num}
                        </span>
                        {isNext && !isCurrent && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            Up Next
                          </span>
                        )}
                        {isCurrent && !isDone && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className={`font-semibold text-base leading-tight ${isDone ? 'text-green-800' : 'text-gray-800'}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>~20 min</span>
                      </div>
                    </div>

                    {/* Right icon */}
                    <div className="shrink-0">
                      {!unlocked
                        ? <Lock className="w-5 h-5 text-gray-400" />
                        : isDone
                        ? <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
                        : isNext
                        ? <Play className="w-6 h-6 text-amber-500 fill-amber-500" />
                        : <Play className="w-5 h-5 text-gray-300" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="h-4" />
    </div>
  );
}
