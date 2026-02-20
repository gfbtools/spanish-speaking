import { useState, useEffect, useMemo } from 'react';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { LessonViewer } from './sections/LessonViewer';
import { LessonBrowser } from './sections/LessonBrowser';
import { VocabularyBrowser } from './sections/VocabularyBrowser';
import { ProgressDashboard } from './sections/ProgressDashboard';
import { Footer } from './sections/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Lesson, VocabularyEntry, UserProgress, Dialect } from './types';
import { BookOpen, BookMarked, BarChart3, Library } from 'lucide-react';

// ── Lesson JSON imports ───────────────────────────────────────────
// Directions (migrated)
import baseDirections from '../public/data/a1-directions.base.json';
import overrideDirectionsPR from '../public/data/a1-directions.overrides.es-PR.json';

// Family (migrated)
import baseFamily from '../public/data/a1-family.base.json';
import overrideFamilyPR from '../public/data/a1-family.overrides.es-PR.json';
import overrideFamilyES from '../public/data/a1-family.overrides.es-ES.json';

// Restaurant (migrated)
import baseRestaurant from '../public/data/a1-restaurant.base.json';
import overrideRestaurantPR from '../public/data/a1-restaurant.overrides.es-PR.json';
import overrideRestaurantES from '../public/data/a1-restaurant.overrides.es-ES.json';

// New lessons
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

// Vocabulary
import vocabA1 from '../public/data/vocab_a1.json';
import vocabEsPR from '../public/data/vocab_es_pr.json';

import { mergeDialectLesson } from './utils/mergeDialectLesson';

// ── Lesson registry ───────────────────────────────────────────────
export const lessonRegistry = [
  { id: 'a1-greetings',               title: 'Greetings & Introductions',    module: 'Foundations', level: 'A1' },
  { id: 'a1-alphabet-pronunciation',  title: 'Alphabet & Sounds',            module: 'Foundations', level: 'A1' },
  { id: 'a1-numbers',                 title: 'Numbers & Age',                module: 'Foundations', level: 'A1' },
  { id: 'a1-ser-estar',               title: 'Ser vs Estar',                 module: 'Foundations', level: 'A1' },
  { id: 'a1-present-tense',           title: 'Present Tense Regular Verbs',  module: 'Foundations', level: 'A1' },
  { id: 'a1-basic-questions',         title: 'Question Formation',           module: 'Foundations', level: 'A1' },
  { id: 'a1-time-days',               title: 'Time, Days & Months',          module: 'Daily Life',  level: 'A1' },
  { id: 'a1-family',                  title: 'Family & Relationships',       module: 'Daily Life',  level: 'A1' },
  { id: 'a1-descriptions',            title: 'Basic Descriptions',           module: 'Daily Life',  level: 'A1' },
  { id: 'a1-daily-routine',           title: 'Daily Routine',                module: 'Daily Life',  level: 'A1' },
  { id: 'a1-weather',                 title: 'Weather & Seasons',            module: 'Daily Life',  level: 'A1' },
  { id: 'a1-likes-dislikes',          title: 'Likes & Preferences',          module: 'Daily Life',  level: 'A1' },
  { id: 'a1-food-restaurant',         title: 'At the Restaurant',            module: 'Travel',      level: 'A1' },
  { id: 'a1-shopping',                title: 'Shopping & Money',             module: 'Travel',      level: 'A1' },
  { id: 'a1-travel-asking-for-directions', title: 'Asking for Directions',   module: 'Travel',      level: 'A1' },
];

// ── Lesson data resolver ──────────────────────────────────────────
type OverrideMap = { 'es-PR'?: any; 'es-ES'?: any };

function resolveLesson(base: any, overrides: OverrideMap, dialect: Dialect): Lesson {
  if (dialect === 'es-PR' && overrides['es-PR']) {
    return mergeDialectLesson(base, overrides['es-PR']);
  }
  if (dialect === 'es-ES' && overrides['es-ES']) {
    return mergeDialectLesson(base, overrides['es-ES']);
  }
  // es-MX is the base; es-419 returns base with corrected dialect label
  if (dialect === 'es-419') {
    return { ...(base as Lesson), dialect };
  }
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
  if (!entry) return lessonMap['a1-greetings'].base as Lesson; // safe fallback
  return resolveLesson(entry.base, entry.overrides, dialect);
}

// ── App component ─────────────────────────────────────────────────
function App() {
  const [dialect, setDialect] = useState<Dialect>('es-MX');
  const [currentLessonId, setCurrentLessonId] = useState<string>('a1-greetings');
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');

  const lesson = useMemo(() => {
    return getLessonData(currentLessonId, dialect);
  }, [currentLessonId, dialect]);

  useEffect(() => {
    const allVocab = [...(vocabA1 as VocabularyEntry[]), ...(vocabEsPR as VocabularyEntry[])];
    setVocabulary(allVocab);

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

  const handleDialectChange = (newDialect: Dialect) => {
    setDialect(newDialect);
    localStorage.setItem('preferredDialect', newDialect);
  };

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setActiveTab('lesson');
  };

  const handleLessonComplete = (_score: number, timeSpent: number) => {
    if (progress) {
      const updatedProgress = {
        ...progress,
        lessons_completed: progress.lessons_completed + 1,
        overall_progress: Math.min(1, (progress.lessons_completed + 1) / progress.lessons_total),
        study_time_minutes: progress.study_time_minutes + Math.floor(timeSpent / 60),
      };
      setProgress(updatedProgress);
      localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Header dialect={dialect} onDialectChange={handleDialectChange} />

      <main className="container mx-auto px-4 py-8">
        <Hero />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="lessons" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Library className="w-4 h-4" /><span>Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="lesson" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" /><span>Current</span>
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <BookMarked className="w-4 h-4" /><span>Vocabulary</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" /><span>Progress</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-6">
            <LessonBrowser
              lessons={lessonRegistry}
              currentLessonId={currentLessonId}
              onSelectLesson={handleLessonSelect}
              dialect={dialect}
              progress={progress}
            />
          </TabsContent>

          <TabsContent value="lesson" className="mt-6">
            {lesson && (
              <LessonViewer
                key={`${currentLessonId}-${dialect}`}
                lesson={lesson}
                dialect={dialect}
                onLessonComplete={handleLessonComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="vocabulary" className="mt-6">
            <VocabularyBrowser vocabulary={vocabulary} dialect={dialect} />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            {progress && <ProgressDashboard progress={progress} />}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

export default App;
