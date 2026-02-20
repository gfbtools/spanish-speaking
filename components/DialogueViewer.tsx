import { useState } from 'react';
import type { DialogueBlock, Dialect } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, User, MapPin, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface DialogueViewerProps {
  dialogueBlocks: DialogueBlock[];
  dialect: Dialect;
}

export function DialogueViewer({ dialogueBlocks, dialect }: DialogueViewerProps) {
  const [showTranslations, setShowTranslations] = useState<Set<number>>(new Set());
  const [showIPA, setShowIPA] = useState<Set<number>>(new Set());
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const { speak } = useTTS(dialect);

  const toggleTranslation = (index: number) => {
    setShowTranslations(prev => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const toggleIPA = (index: number) => {
    setShowIPA(prev => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const playAudio = (text: string, index: number) => {
    setPlayingIndex(index);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);
    speak(text);
    // Clear highlight after estimated duration
    setTimeout(() => setPlayingIndex(null), Math.max(1500, text.length * 80));
  };

  const getSpeakerIcon = (speaker: string) => {
    if (speaker.toLowerCase().includes('turista') || speaker.toLowerCase().includes('tourist')) {
      return <MapPin className="w-4 h-4" />;
    }
    return <User className="w-4 h-4" />;
  };

  const getSpeakerColor = (speaker: string) => {
    if (speaker.toLowerCase().includes('turista') || speaker.toLowerCase().includes('tourist')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Dialogue: En la Calle</h3>
              <p className="text-sm text-gray-600">A tourist asks a local for directions to the bank</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (showTranslations.size === dialogueBlocks.length) {
                    setShowTranslations(new Set());
                  } else {
                    setShowTranslations(new Set(dialogueBlocks.map((_, i) => i)));
                  }
                }}
              >
                {showTranslations.size === dialogueBlocks.length ? (
                  <><EyeOff className="w-4 h-4 mr-1" /> Hide All</>
                ) : (
                  <><Eye className="w-4 h-4 mr-1" /> Show All</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {dialogueBlocks.map((block, index) => (
          <Card
            key={index}
            className={`border-l-4 ${
              block.speaker.toLowerCase().includes('turista')
                ? 'border-l-blue-400'
                : 'border-l-green-400'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Speaker Badge */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSpeakerColor(block.speaker)}`}>
                  <div className="flex items-center gap-1">
                    {getSpeakerIcon(block.speaker)}
                    <span>{block.speaker}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-lg text-gray-800 font-medium mb-2">
                    {block.text}
                  </p>

                  {showIPA.has(index) && (
                    <p className="text-sm text-amber-600 font-mono mb-2">
                      {block.ipa}
                    </p>
                  )}

                  {showTranslations.has(index) && (
                    <p className="text-sm text-gray-500 italic">
                      {block.translation ?? 'Translation not available'}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {block.context}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Listen"
                    onClick={() => playAudio(block.text, index)}
                    className={playingIndex === index ? 'text-amber-600 bg-amber-50' : ''}
                  >
                    <Volume2 className={`w-4 h-4 ${playingIndex === index ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Show IPA"
                    onClick={() => toggleIPA(index)}
                    className={showIPA.has(index) ? 'text-amber-600' : ''}
                  >
                    /ipa/
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Show translation"
                    onClick={() => toggleTranslation(index)}
                    className={showTranslations.has(index) ? 'text-amber-600' : ''}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Alternate Phrasing */}
              {block.alternate_phrasing && block.alternate_phrasing.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Also said as:</p>
                  <div className="flex flex-wrap gap-2">
                    {block.alternate_phrasing.map((alt, altIndex) => (
                      <Badge
                        key={altIndex}
                        variant="outline"
                        className="text-xs border-gray-300 cursor-pointer hover:bg-amber-50"
                        onClick={() => speak(alt.text)}
                        title={`Listen: ${alt.dialect}`}
                      >
                        <Volume2 className="w-3 h-3 mr-1 inline" />
                        {alt.dialect}: {alt.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
