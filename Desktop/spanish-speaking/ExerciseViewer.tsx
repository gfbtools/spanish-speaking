import { useState, useCallback } from 'react';
import type { Exercise, ExerciseResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, RotateCcw, Check } from 'lucide-react';

interface ExerciseViewerProps {
  exercises: Exercise[];
  onExerciseComplete: (result: ExerciseResult) => void;
  completedExercises: Set<string>;
}

export function ExerciseViewer({ exercises, onExerciseComplete, completedExercises }: ExerciseViewerProps) {
  return (
    <div className="space-y-6">
      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={exercise.exercise_id}
          exercise={exercise}
          index={index}
          onComplete={onExerciseComplete}
          isCompleted={completedExercises.has(exercise.exercise_id)}
        />
      ))}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onComplete: (result: ExerciseResult) => void;
  isCompleted: boolean;
}

function ExerciseCard({ exercise, index, onComplete, isCompleted }: ExerciseCardProps) {
  if (exercise.type === 'multiple_choice') {
    return <MultipleChoiceExercise exercise={exercise} index={index} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (exercise.type === 'matching') {
    return <MatchingExercise exercise={exercise} index={index} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (exercise.type === 'fill_in_blanks') {
    return <FillInBlanksExercise exercise={exercise} index={index} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  return null;
}

// ─── Multiple Choice ──────────────────────────────────────────────────────────

function MultipleChoiceExercise({ exercise, index, onComplete, isCompleted }: ExerciseCardProps) {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const correct = exercise.options?.find(o => o.correct)?.text ?? '';
  const isCorrect = selected === correct;

  const handleSubmit = () => {
    if (!selected) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSubmitted(true);
    if (isCorrect || newAttempts >= 3) {
      onComplete({ exerciseId: exercise.exercise_id, isCorrect, userAnswer: selected, attempts: newAttempts });
    }
  };

  const handleReset = () => {
    setSelected('');
    setSubmitted(false);
  };

  return (
    <Card className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <p className="text-xs text-gray-500 font-normal mb-1">{exercise.instruction}</p>
            <p className="text-gray-800 font-semibold">{exercise.question}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selected} onValueChange={setSelected} disabled={submitted && isCorrect}>
          <div className="space-y-2">
            {exercise.options?.map((option, i) => {
              const isThisCorrect = option.correct;
              const isThisSelected = selected === option.text;
              let bg = 'hover:bg-amber-50 border-gray-200';
              if (submitted) {
                if (isThisCorrect) bg = 'bg-green-100 border-green-400';
                else if (isThisSelected) bg = 'bg-red-100 border-red-400';
                else bg = 'bg-gray-50 border-gray-200 opacity-60';
              }
              return (
                <div key={i} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${bg}`}>
                  <RadioGroupItem value={option.text} id={`${exercise.exercise_id}-${i}`} disabled={submitted && isCorrect} />
                  <Label htmlFor={`${exercise.exercise_id}-${i}`} className="flex-1 cursor-pointer text-gray-800">
                    {option.text}
                  </Label>
                  {submitted && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                  {submitted && isThisSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {submitted && exercise.feedback && (
          <div className={`p-3 rounded-lg text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCorrect ? exercise.feedback.correct : exercise.feedback.incorrect}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!selected} className="bg-amber-500 hover:bg-amber-600">
              <Check className="w-4 h-4 mr-1" /> Check Answer
            </Button>
          ) : (
            <>
              {!isCorrect && attempts < 3 && (
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-1" /> Try Again
                </Button>
              )}
              {isCorrect && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" /> Correct!
                </div>
              )}
              {!isCorrect && attempts >= 3 && (
                <div className="flex items-center gap-2 text-amber-700 font-medium">
                  Correct answer: <strong>{correct}</strong>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Matching ─────────────────────────────────────────────────────────────────

function MatchingExercise({ exercise, index, onComplete, isCompleted }: ExerciseCardProps) {
  const pairs = exercise.pairs ?? [];

  const [shuffledEnglish] = useState<string[]>(() => {
    const eng = pairs.map(p => p.english);
    for (let i = eng.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eng[i], eng[j]] = [eng[j], eng[i]];
    }
    return eng;
  });

  const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const matchedSpanish = new Set(Object.keys(matched));
  const matchedEnglish = new Set(Object.values(matched));

  const handleSpanishClick = (spanish: string) => {
    if (submitted || matchedSpanish.has(spanish)) return;
    setSelectedSpanish(prev => prev === spanish ? null : spanish);
    setWrong(null);
  };

  const handleEnglishClick = (english: string) => {
    if (submitted || matchedEnglish.has(english) || !selectedSpanish) return;
    const correctEnglish = pairs.find(p => p.spanish === selectedSpanish)?.english;
    if (english === correctEnglish) {
      setMatched(prev => ({ ...prev, [selectedSpanish]: english }));
      setSelectedSpanish(null);
      setWrong(null);
    } else {
      setWrong(selectedSpanish);
      setTimeout(() => {
        setWrong(null);
        setSelectedSpanish(null);
      }, 800);
    }
  };

  const handleSubmit = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSubmitted(true);
    const isCorrect = Object.keys(matched).length === pairs.length;
    onComplete({ exerciseId: exercise.exercise_id, isCorrect, userAnswer: JSON.stringify(matched), attempts: newAttempts });
  }, [attempts, matched, pairs.length, exercise.exercise_id, onComplete]);

  const handleReset = () => {
    setMatched({});
    setSelectedSpanish(null);
    setWrong(null);
    setSubmitted(false);
  };

  const allMatched = matchedSpanish.size === pairs.length;

  return (
    <Card className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <p className="text-xs text-gray-500 font-normal mb-1">{exercise.instruction}</p>
            <p className="text-gray-800 font-semibold text-base">Click a Spanish phrase, then click its English match</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Spanish column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🇲🇽 Spanish</p>
            {pairs.map((pair) => {
              const isM = matchedSpanish.has(pair.spanish);
              const isSel = selectedSpanish === pair.spanish;
              const isW = wrong === pair.spanish;
              let cls = 'p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium select-none ';
              if (isM) cls += 'bg-green-100 border-green-400 text-green-800 cursor-default';
              else if (isW) cls += 'bg-red-100 border-red-400 text-red-800 animate-pulse';
              else if (isSel) cls += 'bg-amber-200 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-400';
              else cls += 'bg-amber-50 border-amber-200 text-gray-800 hover:border-amber-400 hover:bg-amber-100';
              return (
                <div key={pair.spanish} className={cls} onClick={() => handleSpanishClick(pair.spanish)}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{pair.spanish}</span>
                    {isM && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* English column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🇬🇧 English</p>
            {shuffledEnglish.map((english) => {
              const isM = matchedEnglish.has(english);
              const canClick = !isM && selectedSpanish !== null;
              let cls = 'p-3 rounded-lg border-2 transition-all text-sm font-medium select-none ';
              if (isM) cls += 'bg-green-100 border-green-400 text-green-800 cursor-default';
              else if (canClick) cls += 'bg-blue-50 border-blue-300 text-gray-800 cursor-pointer hover:bg-blue-100 hover:border-blue-500';
              else cls += 'bg-gray-50 border-gray-200 text-gray-400 cursor-default';
              return (
                <div key={english} className={cls} onClick={() => handleEnglishClick(english)}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{english}</span>
                    {isM && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!submitted && (
          <p className="text-sm text-center text-gray-500">
            {matchedSpanish.size} of {pairs.length} matched
            {selectedSpanish && (
              <span className="text-amber-600 font-medium"> — now pick the English for <em>"{selectedSpanish}"</em></span>
            )}
          </p>
        )}

        {submitted && (
          <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> All pairs matched — great work!
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {!submitted ? (
            <>
              <Button onClick={handleSubmit} disabled={!allMatched} className="bg-amber-500 hover:bg-amber-600">
                <Check className="w-4 h-4 mr-1" /> Submit Matches
              </Button>
              {matchedSpanish.size > 0 && (
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-5 h-5" /> Complete!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Fill in the Blanks (word bank click-to-place) ───────────────────────────
// Uses index-based tracking throughout so duplicate words (e.g. two 'Soy' tiles)
// work correctly — each tile is a unique slot regardless of its text value.

function FillInBlanksExercise({ exercise, index, onComplete, isCompleted }: ExerciseCardProps) {
  const answers = exercise.answers ?? [];
  const variants = exercise.acceptable_variants ?? {};

  // wordBank is [{word, bankIdx}] — bankIdx is the stable identity key
  const [wordBank] = useState<{ word: string; bankIdx: number }[]>(() => {
    const items = answers.map((word, i) => ({ word, bankIdx: i }));
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });

  // filled[blankIndex] = bankIdx of the tile placed there, or null
  const [filled, setFilled] = useState<(number | null)[]>(answers.map(() => null));
  // Set of bankIdx values currently placed in a blank
  const [usedBankIdxs, setUsedBankIdxs] = useState<Set<number>>(new Set());
  // bankIdx of the currently picked tile, or null
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const allFilled = filled.every(f => f !== null);

  const handleBankClick = (bankIdx: number) => {
    if (submitted || usedBankIdxs.has(bankIdx)) return;
    setPickedIdx(prev => prev === bankIdx ? null : bankIdx);
  };

  const handleBlankClick = (blankIndex: number) => {
    if (submitted) return;
    if (pickedIdx !== null) {
      const prevBankIdx = filled[blankIndex];
      const newFilled = [...filled];
      newFilled[blankIndex] = pickedIdx;
      setFilled(newFilled);
      const newUsed = new Set(usedBankIdxs);
      newUsed.add(pickedIdx);
      if (prevBankIdx !== null) newUsed.delete(prevBankIdx); // return previous tile
      setUsedBankIdxs(newUsed);
      setPickedIdx(null);
    } else if (filled[blankIndex] !== null) {
      // Tap a filled blank to return it to the bank
      const prevBankIdx = filled[blankIndex]!;
      const newFilled = [...filled];
      newFilled[blankIndex] = null;
      setFilled(newFilled);
      const newUsed = new Set(usedBankIdxs);
      newUsed.delete(prevBankIdx);
      setUsedBankIdxs(newUsed);
    }
  };

  const checkFill = (userWord: string, correctWord: string): boolean => {
    const norm = (s: string) => s.trim().toLowerCase();
    if (norm(userWord) === norm(correctWord)) return true;
    return (variants[correctWord] ?? []).some(v => norm(userWord) === norm(v));
  };

  // Get the display word for a blank from its bankIdx
  const wordForBlank = (blankIndex: number): string | null => {
    const bi = filled[blankIndex];
    if (bi === null) return null;
    return wordBank.find(w => w.bankIdx === bi)?.word ?? null;
  };

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSubmitted(true);
    const isCorrect = filled.every((bi, i) => {
      if (bi === null) return false;
      const word = wordBank.find(w => w.bankIdx === bi)?.word ?? '';
      return checkFill(word, answers[i]);
    });
    const userAnswer = filled.map(bi => bi !== null ? (wordBank.find(w => w.bankIdx === bi)?.word ?? '') : '').join(',');
    onComplete({ exerciseId: exercise.exercise_id, isCorrect, userAnswer, attempts: newAttempts });
  };

  const handleReset = () => {
    setFilled(answers.map(() => null));
    setUsedBankIdxs(new Set());
    setPickedIdx(null);
    setSubmitted(false);
  };

  let blankCounter = 0;

  // Determine if speaker labels are just single letters (like 'A', 'B') — show them differently
  const speakerLabels = [...new Set(exercise.dialogue?.map(l => l.speaker) ?? [])];
  const singleLetterSpeakers = speakerLabels.every(s => s.length === 1);

  return (
    <Card className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <p className="text-xs text-gray-500 font-normal mb-1">{exercise.instruction}</p>
            <p className="text-gray-800 font-semibold text-base">
              {pickedIdx !== null
                ? <span className="text-amber-700">"{wordBank.find(w => w.bankIdx === pickedIdx)?.word}" selected — tap a blank to place it</span>
                : 'Tap a word below, then tap a blank to place it'
              }
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Conversation with blanks */}
        <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
          {exercise.dialogue?.map((line, lineIndex) => {
            const parts = line.text.split('_____');
            return (
              <div key={lineIndex} className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-bold text-gray-500 shrink-0 ${singleLetterSpeakers ? 'text-xs bg-gray-200 rounded px-1.5 py-0.5' : 'text-xs uppercase min-w-[64px]'}`}>
                  {singleLetterSpeakers ? line.speaker : `${line.speaker}:`}
                </span>
                <span className="text-gray-800 text-base leading-relaxed flex items-baseline flex-wrap gap-1">
                  {parts.map((part, partIndex) => {
                    if (partIndex === parts.length - 1) return <span key={partIndex}>{part}</span>;
                    const bi = blankCounter++;
                    const word = wordForBlank(bi);
                    const isOk  = submitted && word !== null && checkFill(word, answers[bi]);
                    const isBad = submitted && word !== null && !checkFill(word, answers[bi]);
                    return (
                      <span key={partIndex} className="inline-flex items-baseline">
                        <span>{part}</span>
                        <span
                          onClick={() => handleBlankClick(bi)}
                          className={`
                            inline-flex items-center justify-center min-w-[72px] px-2 py-0.5 mx-1
                            rounded border-b-2 cursor-pointer transition-all text-sm font-bold
                            ${word
                              ? isOk   ? 'bg-green-100 border-green-500 text-green-800'
                                : isBad  ? 'bg-red-100 border-red-500 text-red-700'
                                : pickedIdx !== null ? 'bg-amber-200 border-amber-500 text-amber-900 hover:bg-amber-300'
                                         : 'bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200'
                              : pickedIdx !== null ? 'bg-blue-50 border-blue-400 border-dashed text-blue-400 hover:bg-blue-100'
                                       : 'bg-white border-gray-400 border-dashed text-gray-300'
                            }
                          `}
                        >
                          {word ?? '_____'}
                          {isBad && <span className="ml-1 text-xs text-red-500">({answers[bi]})</span>}
                        </span>
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Word bank */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Word Bank</p>
          <div className="flex flex-wrap gap-2">
            {wordBank.map(({ word, bankIdx }) => {
              const used = usedBankIdxs.has(bankIdx);
              const isPicked = pickedIdx === bankIdx;
              return (
                <button
                  key={bankIdx}
                  onClick={() => handleBankClick(bankIdx)}
                  disabled={submitted || used}
                  className={`
                    px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all min-w-[48px]
                    ${used
                      ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-default'
                      : isPicked
                      ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-300'
                      : 'bg-white border-amber-300 text-gray-800 hover:bg-amber-50 hover:border-amber-500 cursor-pointer'
                    }
                  `}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {submitted && (() => {
          const correctCount = filled.filter((bi, i) => {
            if (bi === null) return false;
            const word = wordBank.find(w => w.bankIdx === bi)?.word ?? '';
            return checkFill(word, answers[i]);
          }).length;
          const allRight = correctCount === answers.length;
          return (
            <div className={`p-3 rounded-lg text-sm font-medium ${allRight ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {allRight
                ? '¡Perfecto! All blanks correct.'
                : `${correctCount} of ${answers.length} correct — incorrect answers shown in red above.`}
            </div>
          );
        })()}

        <div className="flex gap-2 pt-1">
          {!submitted ? (
            <>
              <Button onClick={handleSubmit} disabled={!allFilled} className="bg-amber-500 hover:bg-amber-600">
                <Check className="w-4 h-4 mr-1" /> Check Answers
              </Button>
              {filled.some(f => f !== null) && (
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-1" /> Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
