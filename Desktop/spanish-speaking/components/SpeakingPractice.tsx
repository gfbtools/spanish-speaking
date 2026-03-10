import { useState, useRef, useEffect } from 'react';
import type { SpeakingRubric, Dialect } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, RotateCcw, CheckCircle, Volume2, AlertCircle } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface SpeakingPracticeProps {
  rubric: SpeakingRubric;
  dialect: Dialect;
}

// Browser SpeechRecognition type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

const DIALECT_LANG: Record<Dialect, string> = {
  'es-MX': 'es-MX',
  'es-ES': 'es-ES',
  'es-PR': 'es-PR',
  'es-419': 'es-419',
};

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function getSimilarity(a: string, b: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[¿?¡!.,;:]/g, '').trim();
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return 1;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

function buildFeedback(
  transcript: string,
  _expected: string,
  elements: string[],
  similarity: number,
): { feedback: string[]; suggestions: string[] } {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  const t = transcript.toLowerCase();

  if (similarity >= 0.85) {
    feedback.push('Excellent! Your pronunciation was very clear.');
  } else if (similarity >= 0.65) {
    feedback.push('Good attempt — the overall phrase was understandable.');
  } else {
    feedback.push('Keep practicing — the phrase needs more work.');
  }

  elements.forEach(el => {
    const elLower = el.toLowerCase();
    if (t.includes(elLower)) {
      feedback.push(`✓ "${el}" was recognized correctly.`);
    } else {
      suggestions.push(`Try emphasising "${el}" — it wasn't clearly detected.`);
    }
  });

  if (similarity < 0.85) {
    suggestions.push('Try speaking more slowly and clearly.');
    suggestions.push('Listen to the model answer below, then try again.');
  }

  return { feedback, suggestions };
}

export function SpeakingPractice({ rubric, dialect }: SpeakingPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assessment, setAssessment] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [srSupported, setSrSupported] = useState(true);
  const [permissionError, setPermissionError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { speak } = useTTS(dialect);

  // Check SpeechRecognition support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSrSupported(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = async () => {
    setPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SR) {
        const recognition = new SR();
        recognitionRef.current = recognition;
        recognition.lang = DIALECT_LANG[dialect];
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
        };
        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
          if (e.error !== 'no-speech') {
            console.warn('SR error:', e.error);
          }
        };
        recognition.start();
      }

      // Also keep MediaRecorder for audio blob (future backend use)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = () => {};
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setHasRecorded(true);
      };
      mediaRecorder.start();

      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setPermissionError('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else {
        setPermissionError('Could not access microphone. Please check permissions.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const assessRecording = () => {
    setIsAssessing(true);
    setTimeout(() => {
      const useTranscript = transcript || '';
      const expected = rubric.sample_response?.text || rubric.prompt;
      const similarity = getSimilarity(useTranscript, expected);
      const asrScore = Math.round(Math.min(1, similarity + 0.05) * 100) / 100;
      const intelligibility = Math.round(Math.max(0, similarity - 0.05) * 100) / 100;
      const { feedback, suggestions } = buildFeedback(
        useTranscript,
        expected,
        rubric.expected_elements,
        similarity,
      );

      setAssessment({
        asr_transcription: useTranscript || '(no speech detected)',
        asr_score: asrScore,
        intelligibility_score: intelligibility,
        feedback,
        suggestions,
        expected: expected,
      });
      setIsAssessing(false);
    }, 800);
  };

  const reset = () => {
    setHasRecorded(false);
    setAssessment(null);
    setRecordingTime(0);
    setTranscript('');
    setPermissionError('');
  };

  return (
    <div className="space-y-6">
      {/* Scenario Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-600" />
            {rubric.title}
          </CardTitle>
          <CardDescription>{rubric.scenario}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-gray-600 mb-2">Prompt:</p>
            <p className="text-lg text-gray-800 font-medium">{rubric.prompt}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Expected elements:</p>
            <ul className="flex flex-wrap gap-2">
              {rubric.expected_elements.map((element, index) => (
                <li key={index} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  {element}
                </li>
              ))}
            </ul>
          </div>

          {/* Model answer */}
          {rubric.sample_response && (
            <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500 font-medium">Model Answer:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-amber-600 hover:text-amber-700"
                  onClick={() => speak(rubric.sample_response!.text)}
                >
                  <Volume2 className="w-3.5 h-3.5 mr-1" /> Listen
                </Button>
              </div>
              <p className="text-sm text-gray-700 font-medium">{rubric.sample_response.text}</p>
              {rubric.sample_response.ipa && (
                <p className="text-xs text-amber-600 font-mono mt-1">{rubric.sample_response.ipa}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission error */}
      {permissionError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{permissionError}</p>
          </CardContent>
        </Card>
      )}

      {/* SR not supported */}
      {!srSupported && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-800">
              Live transcription is not supported in this browser. Recording will still work — you'll receive basic feedback after stopping.
              For best results, use Chrome or Edge.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recording Interface */}
      {!hasRecorded ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                isRecording ? 'bg-red-100 animate-pulse' : 'bg-amber-100'
              }`}>
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-red-600" />
                ) : (
                  <Mic className="w-10 h-10 text-amber-600" />
                )}
              </div>

              {isRecording ? (
                <div className="space-y-4">
                  <p className="text-xl font-bold text-red-600">Recording…</p>
                  <p className="text-2xl font-mono">{recordingTime}s / 15s</p>
                  <Progress value={(recordingTime / 15) * 100} className="w-48 mx-auto" />
                  <Button onClick={stopRecording} variant="destructive" size="lg">
                    Stop Recording
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Click to start recording your response</p>
                  <Button
                    onClick={startRecording}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {!assessment ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <p className="text-lg text-gray-700">Recording complete!</p>
                {transcript && (
                  <div className="bg-gray-50 p-3 rounded-lg text-left">
                    <p className="text-xs text-gray-500 mb-1">We heard:</p>
                    <p className="text-sm text-gray-800 font-medium">"{transcript}"</p>
                  </div>
                )}
                <div className="flex justify-center gap-3">
                  <Button onClick={reset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Record Again
                  </Button>
                  <Button
                    onClick={assessRecording}
                    disabled={isAssessing}
                    className="bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    {isAssessing ? 'Assessing…' : 'Get Feedback'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Match Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round(assessment.asr_score * 100)}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Intelligibility</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(assessment.intelligibility_score * 100)}%
                    </p>
                  </div>
                </div>

                {/* Transcription */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">We heard:</p>
                  <p className="text-lg text-gray-800 font-medium">
                    "{assessment.asr_transcription}"
                  </p>
                </div>

                {/* Expected */}
                <div className="bg-amber-50 p-4 rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expected:</p>
                    <p className="text-sm text-gray-800 font-medium">"{assessment.expected}"</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(assessment.expected)}
                    className="shrink-0 text-amber-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Feedback */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Feedback:</h4>
                  <ul className="space-y-1">
                    {assessment.feedback.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                {assessment.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Suggestions:</h4>
                    <ul className="space-y-1">
                      {assessment.suggestions.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <Volume2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={reset} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Practice Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scoring Criteria */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Scoring Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rubric.scoring_criteria.map((criterion, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{criterion.criterion}</span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(criterion.weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
