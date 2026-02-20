import { useState } from 'react';
import type { Lesson, Dialect, ExerciseResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DialogueViewer } from '@/components/DialogueViewer';
import { ExerciseViewer } from '@/components/ExerciseViewer';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { SpeakingPractice } from '@/components/SpeakingPractice';
import { CheckCircle, Clock, Target, BookOpen, MessageSquare, Brain, Mic } from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  dialect: Dialect;
  onLessonComplete: (score: number, timeSpent: number) => void;
}

export function LessonViewer({ lesson, dialect, onLessonComplete }: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [lessonStarted] = useState(Date.now());

  const handleExerciseComplete = (result: ExerciseResult) => {
    setCompletedExercises(prev => new Set(prev).add(result.exerciseId));
    setExerciseResults(prev => [...prev, result]);
  };

  const handleLessonFinish = () => {
    const correctCount = exerciseResults.filter(r => r.isCorrect).length;
    const totalCount = lesson.exercises.length;
    const score = totalCount > 0 ? correctCount / totalCount : 0;
    const timeSpent = Math.floor((Date.now() - lessonStarted) / 1000);
    onLessonComplete(score, timeSpent);
    setActiveTab('completed');
  };

  const progressPercentage = (completedExercises.size / lesson.exercises.length) * 100;

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {lesson.level}
                </Badge>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  {lesson.dialect}
                </Badge>
              </div>
              <CardTitle className="text-2xl text-gray-800">
                {lesson.title.native}
              </CardTitle>
              <CardDescription className="text-lg">
                {lesson.title.localized}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-5 h-5" />
              <span>{lesson.estimated_minutes} min</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Lesson Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Lesson Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white/80">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="dialogue" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Dialogue</span>
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Exercises</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="speaking" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Speaking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {lesson.cultural_notes && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">Cultural Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">{lesson.cultural_notes.formality}</p>
                {lesson.cultural_notes.gestures && (
                  <p className="text-gray-700"><strong>Gestures:</strong> {lesson.cultural_notes.gestures}</p>
                )}
                {lesson.cultural_notes.regional_variations && (
                  <p className="text-gray-700"><strong>Regional:</strong> {lesson.cultural_notes.regional_variations}</p>
                )}
                {lesson.cultural_notes.distincion && (
                  <p className="text-gray-700"><strong>Pronunciation:</strong> {lesson.cultural_notes.distincion}</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dialogue" className="mt-4">
          <DialogueViewer dialogueBlocks={lesson.dialogue_blocks} dialect={dialect} />
        </TabsContent>

        <TabsContent value="exercises" className="mt-4">
          <ExerciseViewer 
            exercises={lesson.exercises} 
            onExerciseComplete={handleExerciseComplete}
            completedExercises={completedExercises}
          />
        </TabsContent>

        <TabsContent value="flashcards" className="mt-4">
          <FlashcardViewer flashcards={lesson.srs_flashcards} dialect={dialect} />
        </TabsContent>

        <TabsContent value="speaking" className="mt-4">
          {lesson.speaking_rubric ? (
            <SpeakingPractice rubric={lesson.speaking_rubric} dialect={dialect} />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Speaking practice not available for this lesson.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                ¡Felicitaciones! Lesson Complete!
              </h3>
              <p className="text-green-700 mb-4">
                You completed {lesson.title.localized} with {Math.round((exerciseResults.filter(r => r.isCorrect).length / Math.max(1, exerciseResults.length)) * 100)}% accuracy.
              </p>
              <Button onClick={() => setActiveTab('overview')} variant="outline">
                Review Lesson
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Lesson Button */}
      {completedExercises.size >= lesson.exercises.length && activeTab !== 'completed' && (
        <div className="flex justify-center">
          <Button 
            onClick={handleLessonFinish}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg"
          >
            Complete Lesson
          </Button>
        </div>
      )}
    </div>
  );
}
