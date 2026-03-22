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

const exerciseTypeLabel: Record<string, string> = {
  multiple_choice: 'Choose the correct answer',
  matching: 'Match each item with its correct pair',
  fill_in_blanks: 'Fill in the blanks with the correct word',
};

function ExerciseCard({ exercise, index, onComplete, isCompleted }: ExerciseCardProps) {
  const englishLabel = exerciseTypeLabel[exercise.type] ?? '';
  return (
    <Card className={`${isCompleted ? 'border-green-300 bg-green-50/30' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-bold text-gray-800">{englishLabel}</p>
            <p className="text-xs text-gray-500 italic">{exercise.instruction}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercise.type === 'multiple_choice' && (
          <MultipleChoice exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} />
        )}
        {exercise.type === 'matching' && (
          <Matching exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} />
        )}
        {exercise.type === 'fill_in_blanks' && (
          <FillInBlanks exercise={exercise} onComplete={onComplete} isCompleted={isCompleted} />
        )}
      </CardContent>
    </Card>
  );
}

function MultipleChoice({ exercise, onComplete }: { exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean }) {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const correctOption = exercise.options?.find((o: any) => o.correct);
  const isCorrect = userAnswer === correctOption?.text;

  const handleSubmit = () => {
    if (!userAnswer) return;
    setIsSubmitted(true);
    onComplete({ exerciseId: exercise.exercise_id, isCorrect: userAnswer === correctOption?.text, userAnswer, attempts: 1 });
  };

  return (
    <div className="space-y-3">
      {exercise.question && <p className="font-semibold text-gray-800">{exercise.question}</p>}
      <RadioGroup value={userAnswer} onValueChange={setUserAnswer} disabled={isSubmitted && isCorrect}>
        <div className="space-y-2">
          {exercise.options?.map((option: any, optIndex: number) => (
            <div key={optIndex} className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
              isSubmitted ? option.correct ? 'bg-green-100 border-green-300' : userAnswer === option.text ? 'bg-red-100 border-red-300' : 'bg-gray-50'
              : 'hover:bg-amber-50 border-gray-200'}`}>
              <RadioGroupItem value={option.text} id={`${exercise.exercise_id}-${optIndex}`} disabled={isSubmitted && isCorrect} />
              <Label htmlFor={`${exercise.exercise_id}-${optIndex}`} className="flex-1 cursor-pointer">{option.text}</Label>
              {isSubmitted && option.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
              {isSubmitted && userAnswer === option.text && !option.correct && <XCircle className="w-5 h-5 text-red-600" />}
            </div>
          ))}
        </div>
      </RadioGroup>
      {isSubmitted && exercise.feedback && (
        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{isCorrect ? exercise.feedback.correct : exercise.feedback.incorrect}</p>
        </div>
      )}
      {!isSubmitted && (
        <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-amber-500 hover:bg-amber-600">
          <Check className="w-4 h-4 mr-1" /> Check Answer
        </Button>
      )}
    </div>
  );
}

function Matching({ exercise, onComplete }: { exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean }) {
  const pairs = exercise.pairs ?? [];
  const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [englishOptions] = useState(() => [...pairs.map((p: any) => p.english)].sort(() => Math.random() - 0.5));
  const matchedSpanish = Object.keys(matched);
  const matchedEnglish = Object.values(matched);
  const allMatched = matchedSpanish.length === pairs.length;

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
      const existing = Object.keys(updated).find(k => updated[k] === english);
      if (existing) delete updated[existing]; setMatched(updated); return;
    }
    const correctPair = pairs.find((p: any) => p.spanish === selectedSpanish);
    if (correctPair?.english === english) {
      setMatched(prev => ({ ...prev, [selectedSpanish]: english })); setSelectedSpanish(null);
    } else {
      setWrongPair(selectedSpanish); setTimeout(() => setWrongPair(null), 600); setSelectedSpanish(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase">🇲🇽 Spanish</p>
          {pairs.map((pair: any) => (
            <button key={pair.spanish} onClick={() => handleSpanishTap(pair.spanish)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all
                ${matchedSpanish.includes(pair.spanish) ? 'bg-green-100 border-green-400 text-green-800'
                : wrongPair === pair.spanish ? 'bg-red-100 border-red-400'
                : selectedSpanish === pair.spanish ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-md'
                : 'bg-white border-amber-200 hover:border-amber-400 text-gray-800'}`}>
              {pair.spanish}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase">🇬🇧 English</p>
          {englishOptions.map((english: string) => (
            <button key={english} onClick={() => handleEnglishTap(english)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all
                ${matchedEnglish.includes(english) ? 'bg-green-100 border-green-400 text-green-800'
                : selectedSpanish ? 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800'
                : 'bg-white border-gray-200 text-gray-500'}`}>
              {english}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-gray-500">{matchedSpanish.length} of {pairs.length} matched</p>
      {!submitted && (
        <Button onClick={() => { setSubmitted(true); const correct = pairs.every((p: any) => matched[p.spanish] === p.english); onComplete({ exerciseId: exercise.exercise_id, isCorrect: correct, userAnswer: JSON.stringify(matched), attempts: 1 }); }}
          disabled={!allMatched} className="w-full bg-amber-500 hover:bg-amber-600">
          <Check className="w-4 h-4 mr-1" /> Submit Matches
        </Button>
      )}
      {submitted && (
        <div className="p-3 rounded-xl text-sm font-medium bg-green-100 text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Matching complete!
        </div>
      )}
    </div>
  );
}

function FillInBlanks({ exercise, onComplete }: { exercise: Exercise; onComplete: (r: ExerciseResult) => void; isCompleted: boolean }) {
  const answers = exercise.answers ?? [];
  const variants = exercise.acceptable_variants ?? {};
  const dialogue = exercise.dialogue ?? [];
  const [userInputs, setUserInputs] = useState<string[]>(answers.map(() => ''));
  const [submitted, setSubmitted] = useState(false);

  // Pre-compute for each line which global blank indices it owns
  const lineBlanks: number[][] = [];
  let globalIdx = 0;
  for (const line of dialogue) {
    const count = (line.text.match(/___/g) || []).length;
    const indices: number[] = [];
    for (let b = 0; b < count; b++) indices.push(globalIdx++);
    lineBlanks.push(indices);
  }

  const checkCorrect = (idx: number): boolean => {
    const userWord = (userInputs[idx] ?? '').toLowerCase().trim();
    const correctAnswer = (answers[idx] ?? '').toLowerCase().trim();
    const acceptedVariants = (variants[answers[idx]] ?? []).map((v: string) => v.toLowerCase().trim());
    return userWord === correctAnswer || acceptedVariants.includes(userWord);
  };

  const allCorrect = answers.every((_: string, i: number) => checkCorrect(i));
  const allFilled = userInputs.every(v => v.trim() !== '');

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete({ exerciseId: exercise.exercise_id, isCorrect: allCorrect, userAnswer: userInputs.join(','), attempts: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {dialogue.map((line: any, lineIdx: number) => {
          const parts = line.text.split('___');
          const blanksForLine = lineBlanks[lineIdx];
          return (
            <div key={lineIdx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg shrink-0 mt-0.5">
                {line.speaker}
              </span>
              <span className="text-gray-800 text-sm leading-loose flex flex-wrap items-center">
                {parts.map((part: string, partIdx: number) => {
                  if (partIdx === parts.length - 1) return <span key={partIdx}>{part}</span>;
                  const blankIdx = blanksForLine[partIdx];
                  const isCorrectBlank = submitted && checkCorrect(blankIdx);
                  const isWrongBlank = submitted && !checkCorrect(blankIdx);
                  return (
                    <span key={partIdx} className="inline-flex items-center">
                      <span>{part}</span>
                      <input
                        type="text"
                        value={userInputs[blankIdx] ?? ''}
                        onChange={e => {
                          if (submitted) return;
                          const updated = [...userInputs];
                          updated[blankIdx] = e.target.value;
                          setUserInputs(updated);
                        }}
                        disabled={submitted}
                        placeholder="..."
                        className={`mx-1 px-2 py-0.5 rounded-lg border-2 text-sm font-bold w-24 text-center transition-all outline-none
                          ${isCorrectBlank ? 'bg-green-100 border-green-400 text-green-800'
                          : isWrongBlank ? 'bg-red-100 border-red-400 text-red-800'
                          : 'bg-white border-amber-300 text-gray-800 focus:border-amber-500'}`}
                      />
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
      {submitted && (
        <div className={`p-3 rounded-xl text-sm font-medium ${allCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {allCorrect ? '¡Correcto! Well done.' : 'Some answers were incorrect. Check the highlighted blanks.'}
        </div>
      )}
      <div className="flex gap-2">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!allFilled} className={`flex-1 ${allFilled ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-200 text-gray-400'}`}>
            <Check className="w-4 h-4 mr-1" /> Check Answers
          </Button>
        ) : (
          <Button onClick={() => { setUserInputs(answers.map(() => '')); setSubmitted(false); }} variant="outline">
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
