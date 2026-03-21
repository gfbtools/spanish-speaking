import { useState } from 'react';
import type { Exercise, ExerciseResult } from '@/types';
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

// ── Multiple Choice ───────────────────────────────────────────────
function MultipleChoice({ exercise, onComplete, isCompleted: _isCompleted }: { exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctOption = exercise.options?.find((o: any) => o.correct);
  const isCorrect = selected === correctOption?.text;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    onComplete({ exerciseId: exercise.exercise_id, isCorrect: selected === correctOption?.text, userAnswer: selected, attempts: 1 });
  };

  return (
    <div className="space-y-3">
      {exercise.question && (
        <p className="font-semibold text-gray-800">{exercise.question}</p>
      )}
      <div className="space-y-2">
        {exercise.options?.map((option: any, i: number) => {
          const isSelected = selected === option.text;
          const showCorrect = submitted && option.correct;
          const showWrong = submitted && isSelected && !option.correct;
          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(option.text)}
              disabled={submitted}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all font-medium
                ${showCorrect ? 'bg-green-100 border-green-400 text-green-800' :
                  showWrong ? 'bg-red-100 border-red-400 text-red-800' :
                  isSelected ? 'bg-amber-100 border-amber-400 text-amber-800' :
                  submitted ? 'bg-gray-50 border-gray-200 text-gray-500' :
                  'bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-800'}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option.text}</span>
                {showCorrect && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {submitted && exercise.feedback && (
        <div className={`p-3 rounded-xl text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? exercise.feedback.correct : exercise.feedback.incorrect}
        </div>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            ${selected ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <Check className="w-4 h-4" />
          Check Answer
        </button>
      )}
    </div>
  );
}

// ── Matching ──────────────────────────────────────────────────────
function Matching({ exercise, onComplete, isCompleted: _isCompleted }: { exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean }) {
  const pairs = exercise.pairs ?? [];
  const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({}); // spanish -> english
  const [submitted, setSubmitted] = useState(false);
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  // Shuffle English options once
  const [englishOptions] = useState(() => [...pairs.map((p: any) => p.english)].sort(() => Math.random() - 0.5));

  const matchedSpanish = Object.keys(matched);
  const matchedEnglish = Object.values(matched);

  const handleSpanishTap = (spanish: string) => {
    if (submitted) return;
    if (matchedSpanish.includes(spanish)) {
      // Unselect — remove match
      const updated = { ...matched };
      delete updated[spanish];
      setMatched(updated);
      return;
    }
    setSelectedSpanish(prev => prev === spanish ? null : spanish);
  };

  const handleEnglishTap = (english: string) => {
    if (submitted) return;
    if (!selectedSpanish) return;

    if (matchedEnglish.includes(english)) {
      // Already matched to another — unlink it
      const updated = { ...matched };
      const existingSpanish = Object.keys(updated).find(k => updated[k] === english);
      if (existingSpanish) delete updated[existingSpanish];
      setMatched(updated);
      return;
    }

    // Check if correct
    const correctPair = pairs.find((p: any) => p.spanish === selectedSpanish);
    if (correctPair?.english === english) {
      setMatched(prev => ({ ...prev, [selectedSpanish]: english }));
      setSelectedSpanish(null);
    } else {
      setWrongPair(selectedSpanish);
      setTimeout(() => setWrongPair(null), 600);
      setSelectedSpanish(null);
    }
  };

  const allMatched = matchedSpanish.length === pairs.length;

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = pairs.every((p: any) => matched[p.spanish] === p.english);
    onComplete({ exerciseId: exercise.exercise_id, isCorrect: correct, userAnswer: JSON.stringify(matched), attempts: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Spanish column */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            🇲🇽 Spanish
          </div>
          {pairs.map((pair: any) => {
            const isSelected = selectedSpanish === pair.spanish;
            const isMatched = matchedSpanish.includes(pair.spanish);
            const isWrong = wrongPair === pair.spanish;
            return (
              <button
                key={pair.spanish}
                onClick={() => handleSpanishTap(pair.spanish)}
                className={`
                  w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${isMatched ? 'bg-green-100 border-green-400 text-green-800' :
                    isWrong ? 'bg-red-100 border-red-400 animate-pulse' :
                    isSelected ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-md' :
                    'bg-white border-amber-200 hover:border-amber-400 text-gray-800'}
                `}
              >
                {pair.spanish}
              </button>
            );
          })}
        </div>

        {/* English column */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            🇬🇧 English
          </div>
          {englishOptions.map((english) => {
            const isMatched = matchedEnglish.includes(english);
            const matchedTo = Object.keys(matched).find(k => matched[k] === english);
            return (
              <button
                key={english}
                onClick={() => handleEnglishTap(english)}
                className={`
                  w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${isMatched ? 'bg-green-100 border-green-400 text-green-800' :
                    selectedSpanish ? 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800' :
                    'bg-white border-gray-200 text-gray-500'}
                `}
              >
                {english}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        {matchedSpanish.length} of {pairs.length} matched
      </p>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allMatched}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            ${allMatched ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <Check className="w-4 h-4" />
          Submit Matches
        </button>
      )}

      {submitted && (
        <div className="p-3 rounded-xl text-sm font-medium bg-green-100 text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Matching complete!
        </div>
      )}
    </div>
  );
}

// ── Fill in Blanks ────────────────────────────────────────────────
function FillInBlanks({ exercise, onComplete, isCompleted: _isCompleted }: { exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean }) {
  const answers = exercise.answers ?? [];
  const variants = exercise.acceptable_variants ?? {};
  const dialogue = exercise.dialogue ?? [];

  // Pre-compute: for each line, store which blank indices it contains
  // This is stable and doesn't change between renders
  const lineBlankMap: number[][] = [];
  let counter = 0;
  for (const line of dialogue) {
    const count = (line.text.match(/_____/g) || []).length;
    const indices: number[] = [];
    for (let i = 0; i < count; i++) indices.push(counter++);
    lineBlankMap.push(indices);
  }

  const [wordBank] = useState(() => [...answers].sort(() => Math.random() - 0.5));
  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>(answers.map(() => null));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const handleWordTap = (word: string) => {
    if (submitted) return;
    if (usedWords.has(word)) return;
    setSelectedWord(prev => prev === word ? null : word);
  };

  const handleBlankTap = (idx: number) => {
    if (submitted) return;
    if (filledBlanks[idx]) {
      const returned = filledBlanks[idx]!;
      const updated = [...filledBlanks];
      updated[idx] = null;
      setFilledBlanks(updated);
      setUsedWords(prev => { const s = new Set(prev); s.delete(returned); return s; });
      return;
    }
    if (!selectedWord) return;
    const updated = [...filledBlanks];
    updated[idx] = selectedWord;
    setFilledBlanks(updated);
    setUsedWords(prev => new Set(prev).add(selectedWord));
    setSelectedWord(null);
  };

  const allFilled = filledBlanks.every(b => b !== null);

  const checkAnswers = (): boolean => {
    return answers.every((answer: string, i: number) => {
      const userAnswer = filledBlanks[i]?.toLowerCase().trim() ?? '';
      const correct = answer.toLowerCase().trim();
      const acceptedVariants = (variants[answer] ?? []).map((v: string) => v.toLowerCase().trim());
      return userAnswer === correct || acceptedVariants.includes(userAnswer);
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = checkAnswers();
    onComplete({ exerciseId: exercise.exercise_id, isCorrect: correct, userAnswer: filledBlanks.join(','), attempts: 1 });
  };

  const handleReset = () => {
    setFilledBlanks(answers.map(() => null));
    setUsedWords(new Set());
    setSelectedWord(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      {/* Dialogue with blanks */}
      <div className="space-y-3">
        {dialogue.map((line: any, lineIdx: number) => {
          const parts = line.text.split('_____');
          const blankIndicesForLine = lineBlankMap[lineIdx];

          return (
            <div key={lineIdx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg shrink-0 mt-0.5">
                {line.speaker}
              </span>
              <span className="text-gray-800 text-sm leading-relaxed">
                {parts.map((part: string, partIdx: number) => {
                  if (partIdx === parts.length - 1) return <span key={partIdx}>{part}</span>;
                  const bIdx = blankIndicesForLine[partIdx];
                  const filled = filledBlanks[bIdx];
                  const isCorrectBlank = submitted && filled?.toLowerCase().trim() === answers[bIdx]?.toLowerCase().trim();
                  const isWrongBlank = submitted && !isCorrectBlank;

                  return (
                    <span key={partIdx}>
                      {part}
                      <button
                        onClick={() => handleBlankTap(bIdx)}
                        className={`
                          inline-flex items-center justify-center min-w-[60px] mx-1 px-3 py-1 rounded-lg border-2 text-sm font-bold transition-all
                          ${filled
                            ? isCorrectBlank ? 'bg-green-100 border-green-400 text-green-800'
                            : isWrongBlank ? 'bg-red-100 border-red-400 text-red-800'
                            : 'bg-amber-100 border-amber-400 text-amber-800'
                            : selectedWord
                            ? 'bg-blue-50 border-blue-300 border-dashed text-blue-400'
                            : 'bg-white border-gray-300 border-dashed text-gray-400'
                          }
                        `}
                      >
                        {filled ?? '___'}
                      </button>
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Word bank */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Word Bank</p>
        <div className="flex flex-wrap gap-2">
          {wordBank.map((word: string, i: number) => {
            const isUsed = usedWords.has(word);
            const isSelected = selectedWord === word;
            return (
              <button
                key={i}
                onClick={() => handleWordTap(word)}
                disabled={isUsed || submitted}
                className={`
                  px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all
                  ${isUsed ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' :
                    isSelected ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-105' :
                    'bg-white border-amber-300 text-amber-800 hover:bg-amber-50 hover:border-amber-400'}
                `}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {submitted && (
        <div className={`p-3 rounded-xl text-sm font-medium ${checkAnswers() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {checkAnswers() ? '¡Correcto! Well done.' : 'Some answers were incorrect. Check the highlighted blanks.'}
        </div>
      )}

      <div className="flex gap-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${allFilled ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Check className="w-4 h-4" />
            Check Answers
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

const exerciseTypeLabel: Record<string, string> = {
  multiple_choice: 'Choose the correct answer',
  matching: 'Match each item on the left with the correct item on the right',
  fill_in_blanks: 'Fill in the blanks with the correct word',
};

// ── Exercise Card wrapper ─────────────────────────────────────────
function ExerciseCard({ exercise, index, onComplete, isCompleted }: ExerciseCardProps) {
  const englishLabel = exerciseTypeLabel[exercise.type] ?? '';
  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${isCompleted ? 'border-green-300' : 'border-amber-200'}`}>
      <div className={`px-4 py-3 flex items-center gap-3 ${isCompleted ? 'bg-green-50' : 'bg-amber-50'}`}>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
          ${isCompleted ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
          {isCompleted ? '✓' : index + 1}
        </span>
        <div>
          <p className="text-sm font-bold text-gray-800">{englishLabel}</p>
          <p className="text-xs text-gray-500 italic">{exercise.instruction}</p>
        </div>
      </div>
      <div className="p-4 bg-white">
        {exercise.type === 'multiple_choice' && (
          <MultipleChoice exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} />
        )}
        {exercise.type === 'matching' && (
          <Matching exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} />
        )}
        {exercise.type === 'fill_in_blanks' && (
          <FillInBlanks exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} />
        )}
      </div>
    </div>
  );
}
