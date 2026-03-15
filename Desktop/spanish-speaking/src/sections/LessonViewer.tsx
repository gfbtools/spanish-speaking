import { useState, useEffect, useRef } from 'react';
import type { Lesson, Dialect, ExerciseResult } from '@/types';
import { DialogueViewer } from '@/components/DialogueViewer';
import { ExerciseViewer } from '@/components/ExerciseViewer';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { SpeakingPractice } from '@/components/SpeakingPractice';
import { CheckCircle, ChevronRight, Target, Star, Trophy, RotateCcw } from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  dialect: Dialect;
  onLessonComplete: (score: number, timeSpent: number) => void;
  onNextLesson?: () => void;
  lessonTitle?: string;
}

type Step =
  | { type: 'intro' }
  | { type: 'dialogue'; index: number }
  | { type: 'flashcards' }
  | { type: 'exercise'; index: number }
  | { type: 'speaking' }
  | { type: 'complete' };

function buildSteps(lesson: Lesson): Step[] {
  const steps: Step[] = [{ type: 'intro' }];

  // Dialogue — one block at a time
  if (lesson.dialogue_blocks?.length) {
    lesson.dialogue_blocks.forEach((_, i) => {
      steps.push({ type: 'dialogue', index: i });
    });
  }

  // Flashcards — all at once as a deck
  if (lesson.srs_flashcards?.length) {
    steps.push({ type: 'flashcards' });
  }

  // Exercises — one at a time
  if (lesson.exercises?.length) {
    lesson.exercises.forEach((_, i) => {
      steps.push({ type: 'exercise', index: i });
    });
  }

  // Speaking (optional)
  if (lesson.speaking_rubric) {
    steps.push({ type: 'speaking' });
  }

  steps.push({ type: 'complete' });
  return steps;
}

function stepLabel(step: Step, lesson: Lesson): string {
  switch (step.type) {
    case 'intro': return 'Overview';
    case 'dialogue': return `Dialogue ${step.index + 1}/${lesson.dialogue_blocks?.length ?? 0}`;
    case 'flashcards': return 'Flashcards';
    case 'exercise': return `Exercise ${step.index + 1}/${lesson.exercises?.length ?? 0}`;
    case 'speaking': return 'Speaking';
    case 'complete': return 'Complete';
  }
}

export function LessonViewer({ lesson, dialect, onLessonComplete, onNextLesson, lessonTitle }: LessonViewerProps) {
  const steps = buildSteps(lesson);
  const [stepIdx, setStepIdx] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [currentExerciseDone, setCurrentExerciseDone] = useState(false);
  const [lessonStarted] = useState(Date.now());
  const topRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const pct = Math.round((stepIdx / (steps.length - 1)) * 100);

  // Scroll to top on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentExerciseDone(false);
  }, [stepIdx]);

  const goNext = () => {
    if (stepIdx < steps.length - 1) {
      if (steps[stepIdx + 1].type === 'complete') {
        // Calculate score before moving to complete
        const correctCount = exerciseResults.filter(r => r.isCorrect).length;
        const totalCount = lesson.exercises?.length ?? 0;
        const score = totalCount > 0 ? correctCount / totalCount : 1;
        const timeSpent = Math.floor((Date.now() - lessonStarted) / 1000);
        onLessonComplete(score, timeSpent);
      }
      setStepIdx(prev => prev + 1);
    }
  };

  const handleExerciseComplete = (result: ExerciseResult) => {
    setExerciseResults(prev => {
      const existing = prev.findIndex(r => r.exerciseId === result.exerciseId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = result;
        return updated;
      }
      return [...prev, result];
    });
    setCurrentExerciseDone(true);
  };

  const score = exerciseResults.length > 0
    ? Math.round((exerciseResults.filter(r => r.isCorrect).length / (lesson.exercises?.length ?? 1)) * 100)
    : 0;
  const passed = score >= 70;

  // Can the user proceed?
  const canProceed = () => {
    if (step.type === 'exercise') return currentExerciseDone;
    return true; // all other steps: always can proceed
  };

  return (
    <div ref={topRef} className="space-y-4">

      {/* Progress bar + step label */}
      {step.type !== 'complete' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-amber-700">{stepLabel(step, lesson)}</span>
            <span className="text-gray-500">Step {stepIdx + 1} of {steps.length}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── INTRO ── */}
      {step.type === 'intro' && (
        <div className="rounded-2xl bg-white border-2 border-amber-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{lesson.level}</span>
              <span className="text-xs opacity-80">{lesson.estimated_minutes} min</span>
            </div>
            <h2 className="text-2xl font-bold">{lesson.title.native}</h2>
            <p className="opacity-90 mt-1">{lesson.title.localized}</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Objectives */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-800">What you'll learn</h3>
              </div>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cultural note preview */}
            {lesson.cultural_notes?.formality && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Cultural Note</p>
                <p className="text-sm text-gray-700">{lesson.cultural_notes.formality}</p>
              </div>
            )}

            {/* Lesson map preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Lesson Path</p>
              <div className="flex flex-wrap gap-2">
                {steps.filter(s => s.type !== 'complete' && s.type !== 'intro').map((s, i) => (
                  <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">
                    {stepLabel(s, lesson)}
                  </span>
                ))}
                <span className="text-xs bg-amber-100 border border-amber-300 text-amber-700 px-3 py-1 rounded-full font-semibold">
                  Complete ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DIALOGUE ── */}
      {step.type === 'dialogue' && (
        <div className="rounded-2xl bg-white border-2 border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <p className="text-sm font-semibold text-amber-700">
              Listen & Read — Exchange {step.index + 1}
            </p>
          </div>
          <div className="p-4">
            <DialogueViewer
              dialogueBlocks={[lesson.dialogue_blocks[step.index]]}
              dialect={dialect}
            />
          </div>
        </div>
      )}

      {/* ── FLASHCARDS ── */}
      {step.type === 'flashcards' && (
        <div className="rounded-2xl bg-white border-2 border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <p className="text-sm font-semibold text-amber-700">
              Flashcards — Review {lesson.srs_flashcards?.length ?? 0} words
            </p>
          </div>
          <div className="p-4">
            <FlashcardViewer flashcards={lesson.srs_flashcards} dialect={dialect} />
          </div>
        </div>
      )}

      {/* ── EXERCISE ── */}
      {step.type === 'exercise' && (
        <div className="rounded-2xl bg-white border-2 border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <p className="text-sm font-semibold text-amber-700">
              Exercise {step.index + 1} of {lesson.exercises?.length ?? 0}
            </p>
          </div>
          <div className="p-4">
            <ExerciseViewer
              exercises={[lesson.exercises[step.index]]}
              onExerciseComplete={handleExerciseComplete}
              completedExercises={new Set(exerciseResults.map(r => r.exerciseId))}
            />
          </div>
        </div>
      )}

      {/* ── SPEAKING ── */}
      {step.type === 'speaking' && lesson.speaking_rubric && (
        <div className="rounded-2xl bg-white border-2 border-amber-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <p className="text-sm font-semibold text-amber-700">Speaking Practice</p>
          </div>
          <div className="p-4">
            <SpeakingPractice rubric={lesson.speaking_rubric} dialect={dialect} />
          </div>
        </div>
      )}

      {/* ── COMPLETE ── */}
      {step.type === 'complete' && (
        <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-green-200">
          {/* Header */}
          <div className={`px-6 py-8 text-center ${passed ? 'bg-gradient-to-b from-green-500 to-emerald-600' : 'bg-gradient-to-b from-orange-400 to-red-500'} text-white`}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              {passed
                ? <Trophy className="w-10 h-10 text-white" />
                : <RotateCcw className="w-10 h-10 text-white" />
              }
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {passed ? '¡Excelente!' : 'Keep Practicing'}
            </h2>
            <p className="opacity-90 text-sm">
              {passed
                ? 'You passed! Next lesson is now unlocked.'
                : `You need 70% to unlock the next lesson. You scored ${score}%.`
              }
            </p>
          </div>

          {/* Score */}
          <div className="bg-white p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-semibold text-gray-700">Your Score</span>
              <span className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
                {score}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-semibold text-gray-700">Correct Answers</span>
              <span className="text-lg font-bold text-gray-800">
                {exerciseResults.filter(r => r.isCorrect).length} / {lesson.exercises?.length ?? 0}
              </span>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3].map(star => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${score >= star * 33 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {passed && onNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-[0.98] shadow-md"
                >
                  Next Lesson
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  setStepIdx(0);
                  setExerciseResults([]);
                  setCurrentExerciseDone(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEXT BUTTON ── */}
      {step.type !== 'complete' && (
        <button
          onClick={goNext}
          disabled={!canProceed()}
          className={`
            w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all
            ${canProceed()
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLast ? 'Finish' : step.type === 'intro' ? 'Start Lesson' : 'Next'}
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
