import { useCallback, useRef } from 'react';
import type { Dialect } from '@/types';

// Map app dialects to BCP-47 language tags that browsers recognise
const DIALECT_LANG: Record<Dialect, string> = {
  'es-MX': 'es-MX',
  'es-ES': 'es-ES',
  'es-PR': 'es-PR',
  'es-419': 'es-419',
};

// Preferred voice name substrings per dialect (best-effort — falls back gracefully)
const DIALECT_VOICE_HINTS: Record<Dialect, string[]> = {
  'es-MX': ['Paulina', 'es-MX', 'Mexico'],
  'es-ES': ['Monica', 'Jorge', 'es-ES', 'Spain', 'Castilian'],
  'es-PR': ['es-PR', 'Puerto'],
  'es-419': ['es-419', 'es-US', 'es-MX'],
};

function pickVoice(dialect: Dialect): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const lang = DIALECT_LANG[dialect];
  const hints = DIALECT_VOICE_HINTS[dialect];

  // 1. Try exact hint match
  for (const hint of hints) {
    const v = voices.find(v => v.name.includes(hint));
    if (v) return v;
  }
  // 2. Try exact lang match
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;
  // 3. Try prefix match (e.g. "es-")
  const prefix = voices.find(v => v.lang.startsWith('es'));
  return prefix ?? null;
}

export function useTTS(dialect: Dialect) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = DIALECT_LANG[dialect];
      utterance.rate = rate;
      utterance.pitch = 1;
      utteranceRef.current = utterance;

      // Voices may not be loaded yet — wait if needed
      const trySpeak = () => {
        const voice = pickVoice(dialect);
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          trySpeak();
        };
      } else {
        trySpeak();
      }
    },
    [dialect],
  );

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, cancel };
}
