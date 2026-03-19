import { useState, useEffect, useMemo } from 'react';
import { Header } from './sections/Header';
import { LessonViewer } from './sections/LessonViewer';
import { LessonBrowser } from './sections/LessonBrowser';
import { VocabularyBrowser } from './sections/VocabularyBrowser';
import { ProgressDashboard } from './sections/ProgressDashboard';
import type { Lesson, VocabularyEntry, UserProgress, Dialect } from './types';
import { BookOpen, Library, BookMarked, BarChart3, ChevronLeft } from 'lucide-react';

// ── A1 Lesson JSON imports ────────────────────────────────────────
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

// ── A2 Lesson JSON imports ────────────────────────────────────────
import baseA2Preterite from '../public/data/a2-preterite.base.json';
import overrideA2PreteritePR from '../public/data/a2-preterite.overrides.es-PR.json';
import overrideA2PreteriteES from '../public/data/a2-preterite.overrides.es-ES.json';

import baseA2PreteriteIrregular from '../public/data/a2-preterite-irregular.base.json';

import baseA2Imperfect from '../public/data/a2-imperfect.base.json';

import baseA2Future from '../public/data/a2-future-tense.base.json';

import baseA2ReflexiveVerbs from '../public/data/a2-reflexive-verbs.base.json';
import overrideA2ReflexiveVerbsPR from '../public/data/a2-reflexive-verbs.overrides.es-PR.json';
import overrideA2ReflexiveVerbsES from '../public/data/a2-reflexive-verbs.overrides.es-ES.json';

import baseA2ObjectPronouns from '../public/data/a2-object-pronouns.base.json';

import baseA2Comparatives from '../public/data/a2-comparatives.base.json';
import overrideA2ComparativesES from '../public/data/a2-comparatives.overrides.es-ES.json';

import baseA2Health from '../public/data/a2-health-body.base.json';
import overrideA2HealthPR from '../public/data/a2-health-body.overrides.es-PR.json';

import baseA2Emotions from '../public/data/a2-emotions-feelings.base.json';
import overrideA2EmotionsES from '../public/data/a2-emotions-feelings.overrides.es-ES.json';

import baseA2Home from '../public/data/a2-home-household.base.json';

import baseA2Work from '../public/data/a2-work-school.base.json';

import baseA2Travel from '../public/data/a2-travel-transport.base.json';

import baseA2Clothes from '../public/data/a2-clothes-fashion.base.json';

import baseA2MakingPlans from '../public/data/a2-making-plans.base.json';
import overrideA2MakingPlansPR from '../public/data/a2-making-plans.overrides.es-PR.json';

import baseA2TellingStories from '../public/data/a2-telling-stories.base.json';

// ── A3 Lesson JSON imports ────────────────────────────────────────
import baseA3SubjunctivePresent from '../public/data/a3-subjunctive-present.base.json';
import overrideA3SubjectivePresentPR from '../public/data/a3-subjunctive-present.overrides.es-PR.json';
import overrideA3SubjectivePresentES from '../public/data/a3-subjunctive-present.overrides.es-ES.json';

import baseA3Conditional from '../public/data/a3-conditional.base.json';
import overrideA3ConditionalPR from '../public/data/a3-conditional.overrides.es-PR.json';
import overrideA3ConditionalES from '../public/data/a3-conditional.overrides.es-ES.json';

import baseA3PastPerfect from '../public/data/a3-past-perfect.base.json';

import baseA3PassiveImpersonal from '../public/data/a3-passive-impersonal.base.json';

import baseA3PorPara from '../public/data/a3-por-para.base.json';

import baseA3RelativeClauses from '../public/data/a3-relative-clauses.base.json';

import baseA3ExpressingOpinions from '../public/data/a3-expressing-opinions.base.json';
import overrideA3ExpressingOpinionsPR from '../public/data/a3-expressing-opinions.overrides.es-PR.json';

import baseA3ConcessionContrast from '../public/data/a3-concession-contrast.base.json';

import baseA3Hypotheticals from '../public/data/a3-hypotheticals.base.json';

import baseA3FormalRegister from '../public/data/a3-formal-register.base.json';
import overrideA3FormalRegisterPR from '../public/data/a3-formal-register.overrides.es-PR.json';

import baseA3Environment from '../public/data/a3-environment.base.json';
import overrideA3EnvironmentES from '../public/data/a3-environment.overrides.es-ES.json';

import baseA3MediaTechnology from '../public/data/a3-media-technology.base.json';

import baseA3PoliticsSociety from '../public/data/a3-politics-society.base.json';

import baseA3CultureArts from '../public/data/a3-culture-arts.base.json';
import overrideA3CultureArtsES from '../public/data/a3-culture-arts.overrides.es-ES.json';

import baseA3CareerAmbitions from '../public/data/a3-career-ambitions.base.json';

// ── Vocab ─────────────────────────────────────────────────────────
import vocabA1 from '../public/data/vocab_a1.json';
import vocabEsPR from '../public/data/vocab_es_pr.json';

import { mergeDialectLesson } from './utils/mergeDialectLesson';

// ── Lesson registry ───────────────────────────────────────────────
export const lessonRegistry = [
  // A1 — Foundations
  { id: 'a1-greetings',                    title: 'Greetings & Introductions',  module: 'A1 Foundations', level: 'A1', emoji: '👋' },
  { id: 'a1-alphabet-pronunciation',       title: 'Alphabet & Sounds',          module: 'A1 Foundations', level: 'A1', emoji: '🔤' },
  { id: 'a1-numbers',                      title: 'Numbers & Age',              module: 'A1 Foundations', level: 'A1', emoji: '🔢' },
  { id: 'a1-ser-estar',                    title: 'Ser vs Estar',               module: 'A1 Foundations', level: 'A1', emoji: '⚖️' },
  { id: 'a1-present-tense',               title: 'Present Tense Verbs',        module: 'A1 Foundations', level: 'A1', emoji: '📝' },
  { id: 'a1-basic-questions',             title: 'Question Formation',         module: 'A1 Foundations', level: 'A1', emoji: '❓' },
  // A1 — Daily Life
  { id: 'a1-time-days',                   title: 'Time, Days & Months',        module: 'A1 Daily Life',  level: 'A1', emoji: '📅' },
  { id: 'a1-family',                      title: 'Family & Relationships',     module: 'A1 Daily Life',  level: 'A1', emoji: '👨‍👩‍👧' },
  { id: 'a1-descriptions',               title: 'Basic Descriptions',         module: 'A1 Daily Life',  level: 'A1', emoji: '🎨' },
  { id: 'a1-daily-routine',              title: 'Daily Routine',              module: 'A1 Daily Life',  level: 'A1', emoji: '☀️' },
  { id: 'a1-weather',                    title: 'Weather & Seasons',          module: 'A1 Daily Life',  level: 'A1', emoji: '🌤️' },
  { id: 'a1-likes-dislikes',             title: 'Likes & Preferences',        module: 'A1 Daily Life',  level: 'A1', emoji: '❤️' },
  // A1 — Travel
  { id: 'a1-food-restaurant',            title: 'At the Restaurant',          module: 'A1 Travel',      level: 'A1', emoji: '🍽️' },
  { id: 'a1-shopping',                   title: 'Shopping & Money',           module: 'A1 Travel',      level: 'A1', emoji: '🛍️' },
  { id: 'a1-travel-asking-for-directions', title: 'Asking for Directions',    module: 'A1 Travel',      level: 'A1', emoji: '🗺️' },

  // A2 — Past & Future
  { id: 'a2-preterite',                  title: 'Preterite Tense',            module: 'A2 Past & Future', level: 'A2', emoji: '⏮️' },
  { id: 'a2-preterite-irregular',        title: 'Irregular Preterite',        module: 'A2 Past & Future', level: 'A2', emoji: '⚡' },
  { id: 'a2-imperfect',                  title: 'Imperfect Tense',            module: 'A2 Past & Future', level: 'A2', emoji: '🔄' },
  { id: 'a2-future-tense',               title: 'Future Tense',               module: 'A2 Past & Future', level: 'A2', emoji: '⏭️' },
  { id: 'a2-telling-stories',            title: 'Telling Stories',            module: 'A2 Past & Future', level: 'A2', emoji: '📖' },
  // A2 — Grammar
  { id: 'a2-reflexive-verbs',            title: 'Reflexive Verbs',            module: 'A2 Grammar',       level: 'A2', emoji: '🔁' },
  { id: 'a2-object-pronouns',            title: 'Object Pronouns',            module: 'A2 Grammar',       level: 'A2', emoji: '🔡' },
  { id: 'a2-comparatives',               title: 'Comparatives & Superlatives',module: 'A2 Grammar',       level: 'A2', emoji: '📊' },
  { id: 'a2-making-plans',               title: 'Making Plans',               module: 'A2 Grammar',       level: 'A2', emoji: '📆' },
  // A2 — Life & World
  { id: 'a2-health-body',                title: 'Health & the Body',          module: 'A2 Life & World',  level: 'A2', emoji: '🏥' },
  { id: 'a2-emotions-feelings',          title: 'Emotions & Feelings',        module: 'A2 Life & World',  level: 'A2', emoji: '😊' },
  { id: 'a2-home-household',             title: 'Home & Household',           module: 'A2 Life & World',  level: 'A2', emoji: '🏠' },
  { id: 'a2-work-school',                title: 'Work & School',              module: 'A2 Life & World',  level: 'A2', emoji: '💼' },
  { id: 'a2-travel-transport',           title: 'Travel & Transport',         module: 'A2 Life & World',  level: 'A2', emoji: '✈️' },
  { id: 'a2-clothes-fashion',            title: 'Clothes & Fashion',          module: 'A2 Life & World',  level: 'A2', emoji: '👗' },

  // A3 — Advanced Grammar
  { id: 'a3-subjunctive-present',        title: 'Present Subjunctive',        module: 'A3 Advanced Grammar', level: 'A3', emoji: '🧠' },
  { id: 'a3-conditional',                title: 'Conditional Tense',          module: 'A3 Advanced Grammar', level: 'A3', emoji: '🤔' },
  { id: 'a3-past-perfect',               title: 'Past Perfect',               module: 'A3 Advanced Grammar', level: 'A3', emoji: '⏪' },
  { id: 'a3-passive-impersonal',         title: 'Passive & Impersonal',       module: 'A3 Advanced Grammar', level: 'A3', emoji: '🔀' },
  { id: 'a3-por-para',                   title: 'Por vs Para',                module: 'A3 Advanced Grammar', level: 'A3', emoji: '↔️' },
  { id: 'a3-relative-clauses',           title: 'Relative Clauses',           module: 'A3 Advanced Grammar', level: 'A3', emoji: '🔗' },
  // A3 — Communication
  { id: 'a3-expressing-opinions',        title: 'Expressing Opinions',        module: 'A3 Communication', level: 'A3', emoji: '💬' },
  { id: 'a3-concession-contrast',        title: 'Concession & Contrast',      module: 'A3 Communication', level: 'A3', emoji: '⚖️' },
  { id: 'a3-hypotheticals',              title: 'Hypotheticals',              module: 'A3 Communication', level: 'A3', emoji: '💭' },
  { id: 'a3-formal-register',            title: 'Formal Register',            module: 'A3 Communication', level: 'A3', emoji: '🎩' },
  // A3 — Topics
  { id: 'a3-environment',                title: 'Environment',                module: 'A3 Topics',        level: 'A3', emoji: '🌿' },
  { id: 'a3-media-technology',           title: 'Media & Technology',         module: 'A3 Topics',        level: 'A3', emoji: '📱' },
  { id: 'a3-politics-society',           title: 'Politics & Society',         module: 'A3 Topics',        level: 'A3', emoji: '🏛️' },
  { id: 'a3-culture-arts',               title: 'Culture & Arts',             module: 'A3 Topics',        level: 'A3', emoji: '🎭' },
  { id: 'a3-career-ambitions',           title: 'Career & Ambitions',         module: 'A3 Topics',        level: 'A3', emoji: '🚀' },
];

type OverrideMap = { 'es-PR'?: any; 'es-ES'?: any };

function resolveLesson(base: any, overrides: OverrideMap, dialect: Dialect): Lesson {
  if (dialect === 'es-PR' && overrides['es-PR']) return mergeDialectLesson(base, overrides['es-PR']);
  if (dialect === 'es-ES' && overrides['es-ES']) return mergeDialectLesson(base, overrides['es-ES']);
  if (dialect === 'es-419') return { ...(base as Lesson), dialect };
  return base as Lesson;
}

const lessonMap: Record<string, { base: any; overrides: OverrideMap }> = {
  // ── A1 ──────────────────────────────────────────────────────────
  'a1-greetings':                    { base: baseGreetings,           overrides: { 'es-PR': overrideGreetingsPR,           'es-ES': overrideGreetingsES } },
  'a1-alphabet-pronunciation':       { base: baseAlphabet,            overrides: { 'es-PR': overrideAlphabetPR,            'es-ES': overrideAlphabetES } },
  'a1-numbers':                      { base: baseNumbers,             overrides: { 'es-PR': overrideNumbersPR,             'es-ES': overrideNumbersES } },
  'a1-time-days':                    { base: baseTimeDays,            overrides: { 'es-PR': overrideTimeDaysPR,            'es-ES': overrideTimeDaysES } },
  'a1-family':                       { base: baseFamily,              overrides: { 'es-PR': overrideFamilyPR,              'es-ES': overrideFamilyES } },
  'a1-descriptions':                 { base: baseDescriptions,        overrides: { 'es-PR': overrideDescriptionsPR,        'es-ES': overrideDescriptionsES } },
  'a1-food-restaurant':              { base: baseRestaurant,          overrides: { 'es-PR': overrideRestaurantPR,          'es-ES': overrideRestaurantES } },
  'a1-shopping':                     { base: baseShopping,            overrides: { 'es-PR': overrideShoppingPR,            'es-ES': overrideShoppingES } },
  'a1-travel-asking-for-directions': { base: baseDirections,          overrides: { 'es-PR': overrideDirectionsPR } },
  'a1-daily-routine':                { base: baseDailyRoutine,        overrides: { 'es-PR': overrideDailyRoutinePR,        'es-ES': overrideDailyRoutineES } },
  'a1-weather':                      { base: baseWeather,             overrides: { 'es-PR': overrideWeatherPR,             'es-ES': overrideWeatherES } },
  'a1-likes-dislikes':               { base: baseLikesDislikes,       overrides: { 'es-PR': overrideLikesDislikesPR,       'es-ES': overrideLikesDislikesES } },
  'a1-basic-questions':              { base: baseBasicQuestions,      overrides: { 'es-PR': overrideBasicQuestionsPR,      'es-ES': overrideBasicQuestionsES } },
  'a1-ser-estar':                    { base: baseSerEstar,            overrides: { 'es-PR': overrideSerEstarPR,            'es-ES': overrideSerEstarES } },
  'a1-present-tense':                { base: basePresentTense,        overrides: { 'es-PR': overridePresentTensePR,        'es-ES': overridePresentTenseES } },

  // ── A2 ──────────────────────────────────────────────────────────
  'a2-preterite':                    { base: baseA2Preterite,         overrides: { 'es-PR': overrideA2PreteritePR,         'es-ES': overrideA2PreteriteES } },
  'a2-preterite-irregular':          { base: baseA2PreteriteIrregular,overrides: {} },
  'a2-imperfect':                    { base: baseA2Imperfect,         overrides: {} },
  'a2-future-tense':                 { base: baseA2Future,            overrides: {} },
  'a2-reflexive-verbs':              { base: baseA2ReflexiveVerbs,    overrides: { 'es-PR': overrideA2ReflexiveVerbsPR,    'es-ES': overrideA2ReflexiveVerbsES } },
  'a2-object-pronouns':              { base: baseA2ObjectPronouns,    overrides: {} },
  'a2-comparatives':                 { base: baseA2Comparatives,      overrides: { 'es-ES': overrideA2ComparativesES } },
  'a2-health-body':                  { base: baseA2Health,            overrides: { 'es-PR': overrideA2HealthPR } },
  'a2-emotions-feelings':            { base: baseA2Emotions,          overrides: { 'es-ES': overrideA2EmotionsES } },
  'a2-home-household':               { base: baseA2Home,              overrides: {} },
  'a2-work-school':                  { base: baseA2Work,              overrides: {} },
  'a2-travel-transport':             { base: baseA2Travel,            overrides: {} },
  'a2-clothes-fashion':              { base: baseA2Clothes,           overrides: {} },
  'a2-making-plans':                 { base: baseA2MakingPlans,       overrides: { 'es-PR': overrideA2MakingPlansPR } },
  'a2-telling-stories':              { base: baseA2TellingStories,    overrides: {} },

  // ── A3 ──────────────────────────────────────────────────────────
  'a3-subjunctive-present':          { base: baseA3SubjunctivePresent,overrides: { 'es-PR': overrideA3SubjectivePresentPR, 'es-ES': overrideA3SubjectivePresentES } },
  'a3-conditional':                  { base: baseA3Conditional,       overrides: { 'es-PR': overrideA3ConditionalPR,       'es-ES': overrideA3ConditionalES } },
  'a3-past-perfect':                 { base: baseA3PastPerfect,       overrides: {} },
  'a3-passive-impersonal':           { base: baseA3PassiveImpersonal, overrides: {} },
  'a3-por-para':                     { base: baseA3PorPara,           overrides: {} },
  'a3-relative-clauses':             { base: baseA3RelativeClauses,   overrides: {} },
  'a3-expressing-opinions':          { base: baseA3ExpressingOpinions,overrides: { 'es-PR': overrideA3ExpressingOpinionsPR } },
  'a3-concession-contrast':          { base: baseA3ConcessionContrast,overrides: {} },
  'a3-hypotheticals':                { base: baseA3Hypotheticals,     overrides: {} },
  'a3-formal-register':              { base: baseA3FormalRegister,    overrides: { 'es-PR': overrideA3FormalRegisterPR } },
  'a3-environment':                  { base: baseA3Environment,       overrides: { 'es-ES': overrideA3EnvironmentES } },
  'a3-media-technology':             { base: baseA3MediaTechnology,   overrides: {} },
  'a3-politics-society':             { base: baseA3PoliticsSociety,   overrides: {} },
  'a3-culture-arts':                 { base: baseA3CultureArts,       overrides: { 'es-ES': overrideA3CultureArtsES } },
  'a3-career-ambitions':             { base: baseA3CareerAmbitions,   overrides: {} },
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
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const lesson = useMemo(() => {
    if (!currentLessonId) return null;
    return getLessonData(currentLessonId, dialect);
  }, [currentLessonId, dialect]);

  useEffect(() => {
    setVocabulary([...(vocabA1 as VocabularyEntry[]), ...(vocabEsPR as VocabularyEntry[])]);

    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress({ ...parsed, lessons_total: lessonRegistry.length });
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

    // Load completed lessons from localStorage
    const savedCompleted = localStorage.getItem('completedLessons');
    if (savedCompleted) {
      setCompletedLessons(new Set(JSON.parse(savedCompleted)));
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

  const handleLessonComplete = (score: number, timeSpent: number) => {
    const passed = score >= 0.7;

    if (passed && currentLessonId && !completedLessons.has(currentLessonId)) {
      const updated = new Set(completedLessons).add(currentLessonId);
      setCompletedLessons(updated);
      localStorage.setItem('completedLessons', JSON.stringify([...updated]));

      if (progress) {
        const updatedProgress = {
          ...progress,
          lessons_completed: updated.size,
          overall_progress: Math.min(1, updated.size / progress.lessons_total),
          study_time_minutes: progress.study_time_minutes + Math.floor(timeSpent / 60),
        };
        setProgress(updatedProgress);
        localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
      }
    }
  };

  const handleNextLesson = () => {
    if (!currentLessonId) return;
    const idx = lessonRegistry.findIndex(l => l.id === currentLessonId);
    if (idx >= 0 && idx < lessonRegistry.length - 1) {
      const next = lessonRegistry[idx + 1];
      setCurrentLessonId(next.id);
      setScreen('study');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setScreen('lessons');
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
            completedLessons={completedLessons}
          />
        )}

        {/* ── Study screen ── */}
        {screen === 'study' && (
          <div>
            {currentLessonId && lesson ? (
              <>
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
                  onNextLesson={handleNextLesson}
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
