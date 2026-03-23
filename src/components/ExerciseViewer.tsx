import { useState } from 'react';
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
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    if (!userAnswer) return;
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
    const isCorrect = checkAnswer(exercise, userAnswer);
    if (isCorrect || attempts >= 2) {
      onComplete({ exerciseId: exercise.exercise_id, isCorrect, userAnswer, attempts: attempts + 1 });
    }
  };

  const handleReset = () => { setUserAnswer(''); setIsSubmitted(false); };
  const isCorrect = isSubmitted ? checkAnswer(exercise, userAnswer) : null;

  if (exercise.type === 'fill_in_blanks') {
    return (
      <Card className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">{index + 1}</span>
            <div>
              <p className="text-gray-800 font-bold text-sm">Fill in the blanks with the correct word</p>
              <p className="text-gray-500 text-xs font-normal italic">{exercise.instruction}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent><FillInBlanks exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} /></CardContent>
      </Card>
    );
  }

  if (exercise.type === 'matching') {
    return (
      <Card className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">{index + 1}</span>
            <div>
              <p className="text-gray-800 font-bold text-sm">Match each item on the left with the correct item on the right</p>
              <p className="text-gray-500 text-xs font-normal italic">{exercise.instruction}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent><Matching exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} /></CardContent>
      </Card>
    );
  }

  return (
    <Card className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">{index + 1}</span>
          <div>
            <p className="text-gray-800 font-bold text-sm">Choose the correct answer</p>
            <p className="text-gray-500 text-xs font-normal italic">{exercise.instruction}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercise.question && (
          <p className="font-semibold text-gray-800 text-base">{exercise.question}</p>
        )}
        {exercise.options && (
          <RadioGroup value={userAnswer} onValueChange={setUserAnswer} disabled={isSubmitted && isCorrect === true}>
            <div className="space-y-2">
              {exercise.options.map((option: any, optIndex: number) => (
                <div key={optIndex} className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  isSubmitted ? option.correct ? 'bg-green-100 border-green-300' : userAnswer === option.text ? 'bg-red-100 border-red-300' : 'bg-gray-50'
                  : 'hover:bg-amber-50 border-gray-200'}`}>
                  <RadioGroupItem value={option.text} id={`${exercise.exercise_id}-${optIndex}`} disabled={isSubmitted && isCorrect === true} />
                  <Label htmlFor={`${exercise.exercise_id}-${optIndex}`} className="flex-1 cursor-pointer">{option.text}</Label>
                  {isSubmitted && option.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {isSubmitted && userAnswer === option.text && !option.correct && <XCircle className="w-5 h-5 text-red-600" />}
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
        {isSubmitted && exercise.feedback && (
          <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">{isCorrect ? exercise.feedback.correct : exercise.feedback.incorrect}</p>
          </div>
        )}
        <div className="flex gap-2">
          {!isSubmitted ? (
            <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-amber-500 hover:bg-amber-600">
              <Check className="w-4 h-4 mr-1" /> Check Answer
            </Button>
          ) : (
            <>
              {!isCorrect && attempts < 3 && <Button onClick={handleReset} variant="outline"><RotateCcw className="w-4 h-4 mr-1" /> Try Again</Button>}
              {isCorrect && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span>Correct!</span></div>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Fill in Blanks ────────────────────────────────────────────────
// KEY DESIGN: tile.id is permanent identity (0,1,2...).
// filledBlanks stores tile.id values.
// All word lookups use: tiles.find(t => t.id === id)
// NEVER use array index to look up a tile after shuffle.
function FillInBlanks({ exercise, onComplete, isCompleted: _ic }: {
  exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean;
}) {
  const answers: string[] = exercise.answers ?? [];
  const variants: Record<string, string[]> = exercise.acceptable_variants ?? {};
  const dialogue: { speaker: string; text: string }[] = exercise.dialogue ?? [];

  // tiles[i].id === i always. After shuffle, array order changes but id never changes.
  const [tiles] = useState<{ id: number; word: string }[]>(() => {
    const t = answers.map((word, id) => ({ id, word }));
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  });

  // lineBlankMap[lineIdx] = [blankIdx0, blankIdx1, ...]
  const lineBlankMap: number[][] = (() => {
    const map: number[][] = [];
    let next = 0;
    for (const line of dialogue) {
      const count = line.text.split('___').length - 1;
      const idxs: number[] = [];
      for (let i = 0; i < count; i++) idxs.push(next++);
      map.push(idxs);
    }
    return map;
  })();

  // filledBlanks[blankIdx] = tile.id | null
  const [filledBlanks, setFilledBlanks] = useState<(number | null)[]>(Array(answers.length).fill(null));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // THE ONLY way to get a word from a tile id
  const getWord = (id: number): string => {
    const tile = tiles.find(t => t.id === id);
    return tile ? tile.word : '';
  };

  const placedIds = new Set(filledBlanks.filter((b): b is number => b !== null));

  const handleTileTap = (id: number) => {
    if (submitted || placedIds.has(id)) return;
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleBlankTap = (blankIdx: number) => {
    if (submitted) return;
    if (filledBlanks[blankIdx] !== null) {
      const updated = [...filledBlanks];
      updated[blankIdx] = null;
      setFilledBlanks(updated);
      return;
    }
    if (selectedId === null) return;
    const updated = [...filledBlanks];
    updated[blankIdx] = selectedId;
    setFilledBlanks(updated);
    setSelectedId(null);
  };

  const isBlankCorrect = (blankIdx: number): boolean => {
    const id = filledBlanks[blankIdx];
    if (id === null) return false;
    const word = getWord(id).toLowerCase().trim();
    const correct = (answers[blankIdx] ?? '').toLowerCase().trim();
    const accepted = (variants[answers[blankIdx]] ?? []).map((v: string) => v.toLowerCase().trim());
    return word === correct || accepted.includes(word);
  };

  const allFilled = filledBlanks.every(b => b !== null);
  const allCorrect = answers.every((_, i) => isBlankCorrect(i));

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete({
      exerciseId: exercise.exercise_id,
      isCorrect: allCorrect,
      userAnswer: filledBlanks.map(id => id !== null ? getWord(id) : '').join(','),
      attempts: 1,
    });
  };

  const handleReset = () => {
    setFilledBlanks(Array(answers.length).fill(null));
    setSelectedId(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {dialogue.map((line, lineIdx) => {
          const parts = line.text.split('___');
          const blankIdxs = lineBlankMap[lineIdx] ?? [];
          return (
            <div key={lineIdx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg shrink-0">{line.speaker}</span>
              <span className="text-sm text-gray-800 flex flex-wrap items-center gap-y-1">
                {parts.map((part, pIdx) => {
                  if (pIdx === parts.length - 1) return <span key={pIdx}>{part}</span>;
                  const bIdx = blankIdxs[pIdx];
                  const tileId = filledBlanks[bIdx] ?? null;
                  const word = tileId !== null ? getWord(tileId) : null;
                  const correct = submitted && isBlankCorrect(bIdx);
                  const wrong = submitted && tileId !== null && !isBlankCorrect(bIdx);
                  return (
                    <span key={pIdx} className="inline-flex items-center">
                      <span>{part}</span>
                      <button onClick={() => handleBlankTap(bIdx)}
                        className={`inline-flex items-center justify-center min-w-[72px] mx-1 px-3 py-1 rounded-lg border-2 text-sm font-bold transition-all
                          ${word
                            ? correct ? 'bg-green-100 border-green-400 text-green-800'
                            : wrong ? 'bg-red-100 border-red-400 text-red-800'
                            : 'bg-amber-100 border-amber-400 text-amber-800'
                            : selectedId !== null ? 'bg-blue-50 border-blue-400 border-dashed text-blue-400'
                            : 'bg-white border-gray-300 border-dashed text-gray-300'}`}>
                        {word ?? '___'}
                      </button>
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tap a word, then tap a blank</p>
        <div className="flex flex-wrap gap-2">
          {tiles.map(tile => {
            const placed = placedIds.has(tile.id);
            const selected = selectedId === tile.id;
            return (
              <button key={tile.id} onClick={() => handleTileTap(tile.id)} disabled={placed || submitted}
                className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all
                  ${placed ? 'opacity-30 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : selected ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-105'
                  : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'}`}>
                {tile.word}
              </button>
            );
          })}
        </div>
      </div>

      {submitted && (
        <div className={`p-3 rounded-xl text-sm font-medium ${allCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {allCorrect ? '¡Correcto! Well done.' : 'Some answers were incorrect. Tap a filled blank to remove it and try again.'}
        </div>
      )}

      <div className="flex gap-2">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!allFilled}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2
              ${allFilled ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            <Check className="w-4 h-4" /> Check Answers
          </button>
        ) : (
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Matching ──────────────────────────────────────────────────────
function Matching({ exercise, onComplete, isCompleted: _ic }: {
  exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean;
}) {
  const pairs: { spanish: string; english: string }[] = exercise.pairs ?? [];
  const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [englishOptions] = useState(() => [...pairs.map(p => p.english)].sort(() => Math.random() - 0.5));

  const matchedSpanish = Object.keys(matched);
  const matchedEnglish = Object.values(matched);

  const handleSpanishTap = (spanish: string) => {
    if (submitted) return;
    if (matchedSpanish.includes(spanish)) {
      const updated = { ...matched }; delete updated[spanish]; setMatched(updated); return;
    }
    setSelectedSpanish(prev => prev === spanish ? null : spanish);
  };

  const handleEnglishTap = (english: string) => {
    if (submitted || !selectedSpanish) return;
    if (matchedEnglish.includes(english)) {
      const updated = { ...matched };
      const key = Object.keys(updated).find(k => updated[k] === english);
      if (key) delete updated[key]; setMatched(updated); return;
    }
    const correctEnglish = pairs.find(p => p.spanish === selectedSpanish)?.english;
    if (correctEnglish === english) {
      setMatched(prev => ({ ...prev, [selectedSpanish]: english }));
      setSelectedSpanish(null);
    } else {
      setWrongFlash(selectedSpanish);
      setTimeout(() => setWrongFlash(null), 600);
      setSelectedSpanish(null);
    }
  };

  const allMatched = matchedSpanish.length === pairs.length;

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = pairs.every(p => matched[p.spanish] === p.english);
    onComplete({ exerciseId: exercise.exercise_id, isCorrect: correct, userAnswer: JSON.stringify(matched), attempts: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase">Column A</p>
          {pairs.map(pair => {
            const isSelected = selectedSpanish === pair.spanish;
            const isMatched = matchedSpanish.includes(pair.spanish);
            const isWrong = wrongFlash === pair.spanish;
            return (
              <button key={pair.spanish} onClick={() => handleSpanishTap(pair.spanish)}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${isMatched ? 'bg-green-100 border-green-400 text-green-800'
                  : isWrong ? 'bg-red-100 border-red-400'
                  : isSelected ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-md'
                  : 'bg-white border-amber-200 hover:border-amber-400 text-gray-800'}`}>
                {pair.spanish}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase">Column B</p>
          {englishOptions.map(english => {
            const isMatched = matchedEnglish.includes(english);
            return (
              <button key={english} onClick={() => handleEnglishTap(english)}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${isMatched ? 'bg-green-100 border-green-400 text-green-800'
                  : selectedSpanish ? 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800'
                  : 'bg-white border-gray-200 text-gray-500'}`}>
                {english}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-center text-sm text-gray-500">{matchedSpanish.length} of {pairs.length} matched</p>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={!allMatched}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2
            ${allMatched ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
          <Check className="w-4 h-4" /> Submit Matches
        </button>
      ) : (
        <div className="p-3 rounded-xl text-sm font-medium bg-green-100 text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Matching complete!
        </div>
      )}
    </div>
  );
}

function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  if (exercise.type === 'multiple_choice' && exercise.options) {
    const correct = exercise.options.find((o: any) => o.correct);
    return correct?.text === userAnswer;
  }
  return false;
}
