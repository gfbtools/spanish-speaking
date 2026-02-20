// Types for Spanish Learning App

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Dialect = 'es-ES' | 'es-MX' | 'es-PR' | 'es-419';

export interface Lesson {
  lesson_id: string;
  level: CEFRLevel | string;
  dialect: Dialect | string;
  title: {
    native: string;
    localized: string;
  };
  objectives: string[];
  estimated_minutes: number;
  prerequisite_ids: string[];
  activities: Activity[];
  dialogue_blocks: DialogueBlock[];
  srs_flashcards: SrsFlashcard[];
  exercises: Exercise[];
  cultural_notes?: CulturalNotes;
  speaking_rubric?: SpeakingRubric;
  acceptance_criteria?: string[];
  confidence_score?: number;
  human_review?: boolean;
}

export interface Activity {
  activity_id: string;
  type: 'dialogue' | 'vocabulary' | 'grammar' | 'exercise' | 'speaking' | 'listening' | 'writing' | 'review';
  title: string;
  content: any;
  estimated_minutes: number;
}

export interface DialogueBlock {
  speaker: string;
  text: string;
  translation: string | null;
  ipa: string;
  dialect: string;
  audio_asset_id: string;
  alternate_phrasing: AlternatePhrasing[];
  context: string;
}

export interface AlternatePhrasing {
  dialect: string;
  text: string;
  ipa: string;
  confidence_score: number;
}

export interface SrsFlashcard {
  card_id: string;
  front: string;
  back: string;
  ipa: string;
  next_review_days: number;
  ease_factor: number;
  interval: number;
  repetitions: number;
  dialect: string;
  confidence_score: number;
  human_review: boolean;
}

export interface Exercise {
  exercise_id: string;
  type: 'multiple_choice' | 'matching' | 'fill_in_blanks' | 'ordering' | 'speaking';
  instruction: string;
  question?: string;
  options?: ExerciseOption[];
  pairs?: MatchingPair[];
  dialogue?: DialogueLine[];
  answers?: string[];
  acceptable_variants?: Record<string, string[]>;
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export interface ExerciseOption {
  text: string;
  correct: boolean;
}

export interface MatchingPair {
  spanish: string;
  english: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface CulturalNotes {
  formality: string;
  gestures?: string;
  regional_variations?: string;
  distincion?: string;
  vocabulary_differences?: string;
  ll_ye?: string;
  confidence_score?: number;
  human_review?: boolean;
}

export interface SpeakingRubric {
  activity_id: string;
  type: string;
  title: string;
  scenario: string;
  prompt: string;
  expected_elements: string[];
  phoneme_confidence_threshold: number;
  intelligibility_threshold: number;
  scoring_criteria: ScoringCriterion[];
  sample_response: {
    text: string;
    ipa: string;
  };
  phoneme_focus?: string[];
  phoneme_tolerance?: {
    s_aspiration?: boolean;
    d_deletion?: boolean;
    relaxed_rhythm?: boolean;
  };
}

export interface ScoringCriterion {
  criterion: string;
  weight: number;
  description: string;
}

export interface VocabularyEntry {
  word: string;
  translation: string;
  ipa: string;
  frequency_rank: number;
  cefr: string;
  register: string;
  dialect: string;
  pos: string;
  confidence: number;
  human_review: boolean;
}

export interface UserProgress {
  user_id: string;
  current_level: string;
  overall_progress: number;
  lessons_completed: number;
  lessons_total: number;
  streak_days: number;
  longest_streak: number;
  study_time_minutes: number;
  srs_stats: {
    total_cards: number;
    due_now: number;
    mature_cards: number;
    young_cards: number;
    retention_rate: number;
  };
  skill_levels: {
    vocabulary: number;
    grammar: number;
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
}

export interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  attempts: number;
}
