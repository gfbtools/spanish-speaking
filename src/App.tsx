import { useState, useEffect, useMemo } from 'react';
import { Header } from './sections/Header';
import { LessonViewer } from './sections/LessonViewer';
import { LessonBrowser } from './sections/LessonBrowser';
import { VocabularyBrowser } from './sections/VocabularyBrowser';
import { ProgressDashboard } from './sections/ProgressDashboard';
import type { Lesson, VocabularyEntry, UserProgress, Dialect } from './types';
import { BookOpen, Library, BookMarked, BarChart3, ChevronLeft } from 'lucide-react';

// ── Lesson JSON imports ───────────────────────────────────────────
import baseDirections from '../public/data/a1-directions.base.json';
import overrideDirectionsPR from '../public/data/a1-directions.overrides.es-PR.json';

import baseFamily from '../public/data/a1-family.base.json';
import overrideFamilyPR from '../public/data/a1-family.overrides.es-PR.json';
import overrideFamilyES from '../public/data/a1-family.overrides.es-ES.json';

import baseRestaurant from '../public/data/a1-restaurant.base.json';
import overrideRestaurantPR from '../public/data/a1-restaurant.overrides.es-PR.json';
import overrideRestaurantES from '../public/data/a1-restaurant.overrides.es-ES.json';

import baseGreetings from '../public/data/a1-greetings.base.json';
import overrideGreetingsPR from '../public/data/a1-greetings.overrides.es-PR.json';
import overrideGreetingsES from '../public/data/a1-greetings.overrides.es-ES.json';

import baseAlphabet from '../public/data/a1-alphabet-pronunciation.base.json';
import overrideAlphabetPR from '../public/data/a1-alphabet-pronunciation.overrides.es-PR.json';
import overrideAlphabetES from '../public/data/a1-alphabet-pronunciation.overrides.es-ES.json';

import baseNumbers from '../public/data/a1-numbers.base.json';
import overrideNumbersPR from '../public/data/a1-numbers.overrides.es-PR.json';
import overrideNumbersES from '../public/data/a1-numbers.overrides.es-ES.json';

import baseTimeDays from '../public/data/a1-time-days.base.json';
import overrideTimeDaysPR from '../public/data/a1-time-days.overrides.es-PR.json';
import overrideTimeDaysES from '../public/data/a1-time-days.overrides.es-ES.json';

import baseDescriptions from '../public/data/a1-descriptions.base.json';
import overrideDescriptionsPR from '../public/data/a1-descriptions.overrides.es-PR.json';
import overrideDescriptionsES from '../public/data/a1-descriptions.overrides.es-ES.json';

import baseShopping from '../public/data/a1-shopping.base.json';
import overrideShoppingPR from '../public/data/a1-shopping.overrides.es-PR.json';
import overrideShoppingES from '../public/data/a1-shopping.overrides.es-ES.json';

import baseDailyRoutine from '../public/data/a1-daily-routine.base.json';
import overrideDailyRoutinePR from '../public/data/a1-daily-routine.overrides.es-PR.json';
import overrideDailyRoutineES from '../public/data/a1-daily-routine.overrides.es-ES.json';

import baseWeather from '../public/data/a1-weather.base.json';
import overrideWeatherPR from '../public/data/a1-weather.overrides.es-PR.json';
import overrideWeatherES from '../public/data/a1-weather.overrides.es-ES.json';

import baseLikesDislikes from '../public/data/a1-likes-dislikes.base.json';
import overrideLikesDislikesPR from '../public/data/a1-likes-dislikes.overrides.es-PR.json';
import overrideLikesDislikesES from '../public/data/a1-likes-dislikes.overrides.es-ES.json';

import baseBasicQuestions from '../public/data/a1-basic-questions.base.json';
import overrideBasicQuestionsPR from '../public/data/a1-basic-questions.overrides.es-PR.json';
import overrideBasicQuestionsES from '../public/data/a1-basic-questions.overrides.es-ES.json';

import baseSerEstar from '../public/data/a1-ser-estar.base.json';
import overrideSerEstarPR from '../public/data/a1-ser-estar.overrides.es-PR.json';
import overrideSerEstarES from '../public/data/a1-ser-estar.overrides.es-ES.json';

import basePresentTense from '../public/data/a1-present-tense.base.json';
import overridePresentTensePR from '../public/data/a1-present-tense.overrides.es-PR.json';
import overridePresentTenseES from '../public/data/a1-present-tense.overrides.es-ES.json';

import vocabA1 from '../public/data/vocab_a1.json';
import vocabEsPR from '../public/data/vocab_es_pr.json';

import { mergeDialectLesson } from './utils/mergeDialectLesson';

// ── Lesson registry ───────────────────────────────────────────────
export const lessonRegistry = [
  { id: 'a1-greetings',               title: 'Greetings & Introductions',   module: 'Foundations', level: 'A1', emoji: '👋' },
  { id: 'a1-alphabet-pronunciation',  title: 'Alphabet & Sounds',           module: 'Foundations', level: 'A1', emoji: '🔤' },
  { id: 'a1-numbers',                 title: 'Numbers & Age',               module: 'Foundations', level: 'A1', emoji: '🔢' },
  { id: 'a1-ser-estar',               title: 'Ser vs Estar',                module: 'Foundations', level: 'A1', emoji: '⚖️' },
  { id: 'a1-present-tense',           title: 'Present Tense Verbs',         module: 'Foundations', level: 'A1', emoji: '📝' },
  { id: 'a1-basic-questions',         title: 'Question Formation',          module: 'Foundations', level: 'A1', emoji: '❓' },
  { id: 'a1-time-days',               title: 'Time, Days & Months',         module: 'Daily Life',  level: 'A1', emoji: '📅' },
  { id: 'a1-family',                  title: 'Family & Relationships',      module: 'Daily Life',  level: 'A1', emoji: '👨‍👩‍👧' },
  { id: 'a1-descriptions',            title: 'Basic Descriptions',          module: 'Daily Life',  level: 'A1', emoji: '🎨' },
  { id: 'a1-daily-routine',           title: 'Daily Routine',               module: 'Daily Life',  level: 'A1', emoji: '☀️' },
  { id: 'a1-weather',                 title: 'Weather & Seasons',           module: 'Daily Life',  level: 'A1', emoji: '🌤️' },
  { id: 'a1-likes-dislikes',          title: 'Likes & Preferences',         module: 'Daily Life',  level: 'A1', emoji: '❤️' },
  { id: 'a1-food-restaurant',         title: 'At the Restaurant',           module: 'Travel',      level: 'A1', emoji: '🍽️' },
  { id: 'a1-shopping',                title: 'Shopping & Money',            module: 'Travel',      level: 'A1', emoji: '🛍️' },
  { id: 'a1-travel-asking-for-directions', title: 'Asking for Directions',  module: 'Travel',      level: 'A1', emoji: '🗺️' },
];

type OverrideMap = { 'es-PR'?: any; 'es-ES'?: any };

function resolveLesson(base: any, overrides: OverrideMap, dialect: Dialect): Lesson {
  if (dialect === 'es-PR' && overrides['es-PR']) return mergeDialectLesson(base, overrides['es-PR']);
  if (dialect === 'es-ES' && overrides['es-ES']) return mergeDialectLesson(base, overrides['es-ES']);
  if (dialect === 'es-419') return { ...(base as Lesson), dialect };
  return base as Lesson;
}

const lessonMap: Record<string, { base: any; overrides: OverrideMap }> = {
  'a1-greetings':               { base: baseGreetings,      overrides: { 'es-PR': overrideGreetingsPR,      'es-ES': overrideGreetingsES } },
  'a1-alphabet-pronunciation':  { base: baseAlphabet,       overrides: { 'es-PR': overrideAlphabetPR,       'es-ES': overrideAlphabetES } },
  'a1-numbers':                 { base: baseNumbers,        overrides: { 'es-PR': overrideNumbersPR,        'es-ES': overrideNumbersES } },
  'a1-time-days':               { base: baseTimeDays,       overrides: { 'es-PR': overrideTimeDaysPR,       'es-ES': overrideTimeDaysES } },
  'a1-family':                  { base: baseFamily,         overrides: { 'es-PR': overrideFamilyPR,         'es-ES': overrideFamilyES } },
  'a1-descriptions':            { base: baseDescriptions,   overrides: { 'es-PR': overrideDescriptionsPR,   'es-ES': overrideDescriptionsES } },
  'a1-food-restaurant':         { base: baseRestaurant,     overrides: { 'es-PR': overrideRestaurantPR,     'es-ES': overrideRestaurantES } },
  'a1-shopping':                { base: baseShopping,       overrides: { 'es-PR': overrideShoppingPR,       'es-ES': overrideShoppingES } },
  'a1-travel-asking-for-directions': { base: baseDirections, overrides: { 'es-PR': overrideDirectionsPR } },
  'a1-daily-routine':           { base: baseDailyRoutine,   overrides: { 'es-PR': overrideDailyRoutinePR,   'es-ES': overrideDailyRoutineES } },
  'a1-weather':                 { base: baseWeather,        overrides: { 'es-PR': overrideWeatherPR,        'es-ES': overrideWeatherES } },
  'a1-likes-dislikes':          { base: baseLikesDislikes,  overrides: { 'es-PR': overrideLikesDislikesPR,  'es-ES': overrideLikesDislikesES } },
  'a1-basic-questions':         { base: baseBasicQuestions, overrides: { 'es-PR': overrideBasicQuestionsPR, 'es-ES': overrideBasicQuestionsES } },
  'a1-ser-estar':               { base: baseSerEstar,       overrides: { 'es-PR': overrideSerEstarPR,       'es-ES': overrideSerEstarES } },
  'a1-present-tense':           { base: basePresentTense,   overrides: { 'es-PR': overridePresentTensePR,   'es-ES': overridePresentTenseES } },
};

function getLessonData(lessonId: string, dialect: Dialect): Lesson {
  const entry = lessonMap[lessonId];
  if (!entry) return lessonMap['a1-greetings'].base as Lesson;
  return resolveLesson(entry.base, entry.overrides, dialect);
}

type Screen = 'lessons' | 'study' | 'vocabulary' | 'progress';

function App() {
  const [dialect, setDialect] = useState<Dialect>('es-MX');
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [screen, setScreen] = useState<Screen>('lessons');

  const lesson = useMemo(() => {
    if (!currentLessonId) return null;
    return getLessonData(currentLessonId, dialect);
  }, [currentLessonId, dialect]);

  useEffect(() => {
    setVocabulary([...(vocabA1 as VocabularyEntry[]), ...(vocabEsPR as VocabularyEntry[])]);

    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      const defaultProgress: UserProgress = {
        user_id: 'user_' + Math.random().toString(36).substr(2, 9),
        current_level: 'A1',
        overall_progress: 0,
        lessons_completed: 0,
        lessons_total: lessonRegistry.length,
        streak_days: 1,
        longest_streak: 1,
        study_time_minutes: 0,
        srs_stats: { total_cards: 150, due_now: 23, mature_cards: 89, young_cards: 38, retention_rate: 0.85 },
        skill_levels: { vocabulary: 0.72, grammar: 0.68, listening: 0.65, speaking: 0.58, reading: 0.7, writing: 0.6 },
      };
      setProgress(defaultProgress);
      localStorage.setItem('userProgress', JSON.stringify(defaultProgress));
    }

    const savedDialect = localStorage.getItem('preferredDialect') as Dialect | null;
    if (savedDialect) setDialect(savedDialect);
  }, []);

  const handleDialectChange = (d: Dialect) => {
    setDialect(d);
    localStorage.setItem('preferredDialect', d);
  };

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setScreen('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLessonComplete = (_score: number, timeSpent: number) => {
    if (progress) {
      const updated = {
        ...progress,
        lessons_completed: progress.lessons_completed + 1,
        overall_progress: Math.min(1, (progress.lessons_completed + 1) / progress.lessons_total),
        study_time_minutes: progress.study_time_minutes + Math.floor(timeSpent / 60),
      };
      setProgress(updated);
      localStorage.setItem('userProgress', JSON.stringify(updated));
    }
  };

  const navItems: { id: Screen; label: string; icon: React.ElementType }[] = [
    { id: 'lessons',    label: 'Lessons',    icon: Library },
    { id: 'study',      label: 'Study',      icon: BookOpen },
    { id: 'vocabulary', label: 'Vocabulary', icon: BookMarked },
    { id: 'progress',   label: 'Progress',   icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
      <Header dialect={dialect} onDialectChange={handleDialectChange} />

      {/* Main content — pb-20 leaves room for bottom nav on mobile */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 max-w-2xl">

        {/* ── Lessons screen ── */}
        {screen === 'lessons' && (
          <LessonBrowser
            lessons={lessonRegistry}
            currentLessonId={currentLessonId}
            onSelectLesson={handleLessonSelect}
            dialect={dialect}
            progress={progress}
          />
        )}

        {/* ── Study screen ── */}
        {screen === 'study' && (
          <div>
            {currentLessonId && lesson ? (
              <>
                {/* Back button */}
                <button
                  onClick={() => setScreen('lessons')}
                  className="flex items-center gap-1 text-sm text-amber-700 font-medium mb-4 hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  All Lessons
                </button>
                <LessonViewer
                  key={`${currentLessonId}-${dialect}`}
                  lesson={lesson}
                  dialect={dialect}
                  onLessonComplete={handleLessonComplete}
                />
              </>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">No lesson selected</h2>
                <p className="text-gray-500 mb-6">Go to Lessons and tap one to start studying.</p>
                <button
                  onClick={() => setScreen('lessons')}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                >
                  Browse Lessons
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Vocabulary screen ── */}
        {screen === 'vocabulary' && (
          <VocabularyBrowser vocabulary={vocabulary} dialect={dialect} />
        )}

        {/* ── Progress screen ── */}
        {screen === 'progress' && progress && (
          <ProgressDashboard progress={progress} />
        )}
      </main>

      {/* ── Bottom navigation (mobile-first) ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-lg z-50">
        <div className="flex">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = screen === id;
            return (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={`
                  flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors
                  ${active
                    ? 'text-amber-600 bg-amber-50 border-t-2 border-amber-500'
                    : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
