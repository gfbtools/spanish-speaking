import { useState } from 'react';
import type { SrsFlashcard, Dialect } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Volume2, RotateCw, ThumbsUp, ThumbsDown, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface FlashcardViewerProps {
  flashcards: SrsFlashcard[];
  dialect: Dialect;
}

export function FlashcardViewer({ flashcards, dialect }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [, setCardRatings] = useState<Record<string, number>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak } = useTTS(dialect);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleRate = (quality: number) => {
    setCardRatings(prev => ({ ...prev, [currentCard.card_id]: quality }));
    setReviewedCards(prev => new Set(prev).add(currentCard.card_id));
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    speak(currentCard.front);
    setTimeout(() => setIsSpeaking(false), Math.max(1200, currentCard.front.length * 80));
  };

  if (!currentCard) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800">All Cards Reviewed!</h3>
          <p className="text-green-700 mt-2">
            You've reviewed {reviewedCards.size} flashcards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Card {currentIndex + 1} of {flashcards.length}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <div className="relative">
        <Card
          className={`min-h-[300px] cursor-pointer transition-all duration-300 ${
            isFlipped ? 'bg-amber-50' : 'bg-white'
          }`}
          onClick={handleFlip}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            {!isFlipped ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Click to reveal</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {currentCard.front}
                </h3>
                <p className="text-lg text-amber-600 font-mono">
                  {currentCard.ipa}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playAudio}
                  className={`mt-4 ${isSpeaking ? 'text-amber-600 bg-amber-50' : ''}`}
                >
                  <Volume2 className={`w-5 h-5 mr-1 ${isSpeaking ? 'animate-pulse' : ''}`} />
                  Listen
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Translation</p>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentCard.back}
                </h3>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Next review:</strong> {currentCard.next_review_days} day(s)
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Ease factor:</strong> {currentCard.ease_factor.toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flip indicator */}
        <div className="absolute top-4 right-4">
          <RotateCw className={`w-5 h-5 text-gray-400 transition-transform ${isFlipped ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Rating buttons (only show when flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-5 gap-2">
          <Button variant="outline" onClick={() => handleRate(0)} className="flex flex-col items-center p-2 h-auto border-red-300 hover:bg-red-50">
            <ThumbsDown className="w-4 h-4 text-red-500 mb-1" />
            <span className="text-xs">Again</span>
          </Button>
          <Button variant="outline" onClick={() => handleRate(2)} className="flex flex-col items-center p-2 h-auto border-orange-300 hover:bg-orange-50">
            <span className="text-xs">Hard</span>
          </Button>
          <Button variant="outline" onClick={() => handleRate(3)} className="flex flex-col items-center p-2 h-auto border-amber-300 hover:bg-amber-50">
            <span className="text-xs">Good</span>
          </Button>
          <Button variant="outline" onClick={() => handleRate(4)} className="flex flex-col items-center p-2 h-auto border-green-300 hover:bg-green-50">
            <span className="text-xs">Easy</span>
          </Button>
          <Button variant="outline" onClick={() => handleRate(5)} className="flex flex-col items-center p-2 h-auto border-blue-300 hover:bg-blue-50">
            <ThumbsUp className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-xs">Perfect</span>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button variant="outline" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-4 text-sm text-gray-600">
        <span>Reviewed: {reviewedCards.size}</span>
        <span>Remaining: {flashcards.length - reviewedCards.size}</span>
      </div>
    </div>
  );
}
