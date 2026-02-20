import { useState } from 'react';
import type { Exercise, ExerciseResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
      onComplete({
        exerciseId: exercise.exercise_id,
        isCorrect,
        userAnswer,
        attempts: attempts + 1,
      });
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setIsSubmitted(false);
  };

  const isCorrect = isSubmitted ? checkAnswer(exercise, userAnswer) : null;

  return (
    <Card className={`${isCompleted ? 'border-green-300 bg-green-50/30' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
            {index + 1}
          </span>
          <span className="text-gray-700">{exercise.instruction}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Multiple Choice */}
        {exercise.type === 'multiple_choice' && exercise.options && (
          <RadioGroup
            value={userAnswer}
            onValueChange={setUserAnswer}
            disabled={isSubmitted && isCorrect === true}
          >
            <div className="space-y-2">
              {exercise.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                    isSubmitted
                      ? option.correct
                        ? 'bg-green-100 border-green-300'
                        : userAnswer === option.text
                        ? 'bg-red-100 border-red-300'
                        : 'bg-gray-50'
                      : 'hover:bg-amber-50 border-gray-200'
                  }`}
                >
                  <RadioGroupItem
                    value={option.text}
                    id={`${exercise.exercise_id}-${optIndex}`}
                    disabled={isSubmitted && isCorrect === true}
                  />
                  <Label
                    htmlFor={`${exercise.exercise_id}-${optIndex}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option.text}
                  </Label>
                  {isSubmitted && option.correct && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {isSubmitted && userAnswer === option.text && !option.correct && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* Fill in the Blanks */}
        {exercise.type === 'fill_in_blanks' && exercise.dialogue && (
          <div className="space-y-4">
            {exercise.dialogue.map((line, lineIndex) => (
              <div key={lineIndex} className="flex items-center gap-2">
                <span className="font-medium text-gray-600 min-w-[80px]">{line.speaker}:</span>
                <span className="text-gray-800">
                  {line.text.split('_____').map((part, partIndex, arr) => (
                    <span key={partIndex}>
                      {part}
                      {partIndex < arr.length - 1 && (
                        <Input
                          className="inline-block w-32 mx-1"
                          value={userAnswer.split(',')[lineIndex] || ''}
                          onChange={(e) => {
                            const answers = userAnswer.split(',');
                            answers[lineIndex] = e.target.value;
                            setUserAnswer(answers.join(','));
                          }}
                          disabled={isSubmitted && isCorrect === true}
                          placeholder="..."
                        />
                      )}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Matching */}
        {exercise.type === 'matching' && exercise.pairs && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Spanish</h4>
              {exercise.pairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="p-2 bg-amber-50 rounded border border-amber-200">
                  {pair.spanish}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">English</h4>
              {exercise.pairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="p-2 bg-blue-50 rounded border border-blue-200">
                  {pair.english}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {isSubmitted && exercise.feedback && (
          <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">
              {isCorrect ? exercise.feedback.correct : exercise.feedback.incorrect}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Check className="w-4 h-4 mr-1" />
              Check Answer
            </Button>
          ) : (
            <>
              {!isCorrect && attempts < 3 && (
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Try Again
                </Button>
              )}
              {isCorrect && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Correct!</span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  if (exercise.type === 'multiple_choice' && exercise.options) {
    const correctOption = exercise.options.find(o => o.correct);
    return correctOption?.text === userAnswer;
  }

  if (exercise.type === 'fill_in_blanks' && exercise.answers) {
    const userAnswers = userAnswer.split(',').map(a => a.trim().toLowerCase());
    return exercise.answers.every((answer, index) => 
      userAnswers[index]?.toLowerCase() === answer.toLowerCase()
    );
  }

  return false;
}
