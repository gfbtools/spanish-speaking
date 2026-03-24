import { useState } from 'react';
import type { DialogueBlock, Dialect } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, User, Eye, EyeOff, MessageCircle } from 'lucide-react';
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
    speak(text);
    setTimeout(() => setPlayingIndex(null), Math.max(1500, text.length * 80));
  };

  const getSpeakerColor = (speaker: string, index: number) => {
    // Alternate colors by speaker — first speaker gets green, second gets blue, etc.
    const colors = [
      'bg-green-100 text-green-700 border-green-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-orange-100 text-orange-700 border-orange-200',
    ];
    // Find unique speaker position
    const speakers = [...new Set(dialogueBlocks.map(b => b.speaker))];
    const speakerIdx = speakers.indexOf(speaker);
    return colors[speakerIdx % colors.length];
  };

  const getBorderColor = (speaker: string) => {
    const speakers = [...new Set(dialogueBlocks.map(b => b.speaker))];
    const speakerIdx = speakers.indexOf(speaker);
    const borders = ['border-l-green-400', 'border-l-blue-400', 'border-l-purple-400', 'border-l-orange-400'];
    return borders[speakerIdx % borders.length];
  };

  const allShown = showTranslations.size === dialogueBlocks.length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            allShown
              ? setShowTranslations(new Set())
              : setShowTranslations(new Set(dialogueBlocks.map((_, i) => i)));
          }}
        >
          {allShown ? <><EyeOff className="w-4 h-4 mr-1" /> Hide All</> : <><Eye className="w-4 h-4 mr-1" /> Show All</>}
        </Button>
      </div>

      {/* Dialogue blocks */}
      <div className="space-y-3">
        {dialogueBlocks.map((block, index) => (
          <Card key={index} className={`border-l-4 ${getBorderColor(block.speaker)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Speaker Badge */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium border shrink-0 ${getSpeakerColor(block.speaker, index)}`}>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{block.speaker}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg text-gray-800 font-medium mb-1">{block.text}</p>

                  {showTranslations.has(index) && (
                    <p className="text-sm text-gray-500 italic mb-1">
                      {block.translation ?? 'Translation not available'}
                    </p>
                  )}

                  {showIPA.has(index) && block.ipa && (
                    <p className="text-sm text-amber-600 font-mono mb-1">{block.ipa}</p>
                  )}

                  {block.context && (
                    <p className="text-xs text-gray-400 mt-1">{block.context}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => playAudio(block.text, index)}
                    className={playingIndex === index ? 'text-amber-600 bg-amber-50' : ''}
                    title="Listen"
                  >
                    <Volume2 className={`w-4 h-4 ${playingIndex === index ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => toggleIPA(index)}
                    className={showIPA.has(index) ? 'text-amber-600' : ''}
                    title="Show IPA"
                  >
                    /ipa/
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => toggleTranslation(index)}
                    className={showTranslations.has(index) ? 'text-amber-600' : ''}
                    title="Show translation"
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
                    {block.alternate_phrasing.map((alt: any, altIndex: number) => (
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
