import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, MotherboardComponent } from '../../types/motherboard';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { sound } from '../../utils/audio';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: MotherboardComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  components,
  selectedComponentId,
  onSelectComponent,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<{ question: QuizQuestion; isCorrect: boolean }[]>([]);

  if (!isOpen) return null;

  const currentQuestions = QUIZ_QUESTIONS.filter((q) => q.difficulty === selectedDifficulty);
  const currentQuestion = currentQuestions[currentIndex] || currentQuestions[0];

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    sound.playClick();
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (isAnswerSubmitted || !currentQuestion) return;

    let isCorrect = false;

    if (currentQuestion.type === 'multiple_choice') {
      if (selectedOption === null) return;
      isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    } else if (currentQuestion.type === 'identify_3d') {
      if (!selectedComponentId) return;
      isCorrect = selectedComponentId === currentQuestion.targetComponentId;
    }

    setIsAnswerSubmitted(true);

    if (isCorrect) {
      sound.playSuccess();
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      sound.playError();
      setStreak(0);
    }

    setAnswersHistory((prev) => [...prev, { question: currentQuestion, isCorrect }]);
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished!
      setQuizFinished(true);
      if (score >= currentQuestions.length * 0.7) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRestart = (diff?: 'easy' | 'medium' | 'hard') => {
    sound.playClick();
    if (diff) setSelectedDifficulty(diff);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
    setAnswersHistory([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Hardware Mastery Quiz</h2>
              <p className="text-xs text-slate-400">Test your motherboard component knowledge</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Difficulty Tabs */}
        {!quizFinished && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleRestart(diff)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1 text-amber-400">
                <Trophy className="h-4 w-4" />
                <span>Score: {score}</span>
              </div>
              {streak > 1 && (
                <div className="flex items-center gap-1 text-orange-400 animate-bounce">
                  <Flame className="h-4 w-4" />
                  <span>Streak: {streak}x</span>
                </div>
              )}
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                {currentIndex + 1} / {currentQuestions.length}
              </span>
            </div>
          </div>
        )}

        {/* QUIZ IN PROGRESS */}
        {!quizFinished && currentQuestion && (
          <div className="mt-6 space-y-4">
            {/* Scenario Banner */}
            {currentQuestion.scenario && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-cyan-300">
                <span className="font-bold text-cyan-400">Scenario:</span> {currentQuestion.scenario}
              </div>
            )}

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Question Type 1: 3D Identification */}
            {currentQuestion.type === 'identify_3d' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-950/20 p-4 text-center">
                  <span className="text-xs text-cyan-300 block mb-1">
                    Click the correct component in the 3D motherboard in the background:
                  </span>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900/90 px-4 py-2 text-sm font-bold text-white ring-1 ring-cyan-400">
                    <span>Currently selected:</span>
                    <span className="text-cyan-400">
                      {selectedComponentId
                        ? components.find((c) => c.id === selectedComponentId)?.name || 'Unknown'
                        : '(None - click any part)'}
                    </span>
                  </div>
                </div>

                {/* Quick select fallback list */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {components.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        sound.playClick();
                        onSelectComponent(c.id);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                        selectedComponentId === c.id
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {c.shortName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question Type 2: Multiple Choice Options */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  const isChosen = selectedOption === idx;
                  let optionStyle = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200';

                  if (isAnswerSubmitted) {
                    if (idx === currentQuestion.correctOptionIndex) {
                      optionStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold ring-1 ring-emerald-400';
                    } else if (isChosen) {
                      optionStyle = 'border-rose-500 bg-rose-950/40 text-rose-300 line-through';
                    }
                  } else if (isChosen) {
                    optionStyle = 'border-amber-500 bg-amber-950/30 text-amber-300 ring-1 ring-amber-400';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Explanation & Feedback */}
            {isAnswerSubmitted && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  {(currentQuestion.type === 'multiple_choice' && selectedOption === currentQuestion.correctOptionIndex) ||
                  (currentQuestion.type === 'identify_3d' && selectedComponentId === currentQuestion.targetComponentId) ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5" /> Correct! Outstanding hardware knowledge.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <XCircle className="h-5 w-5" /> Not quite right.
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    (currentQuestion.type === 'multiple_choice' && selectedOption === null) ||
                    (currentQuestion.type === 'identify_3d' && !selectedComponentId)
                  }
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 cursor-pointer transition-all"
                >
                  <span>{currentIndex + 1 < currentQuestions.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizFinished && (
          <div className="mt-6 space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-400 shadow-xl shadow-amber-500/20">
              <Award className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Quiz Completed!</h3>
              <p className="mt-1 text-sm text-slate-300">
                You scored <span className="font-bold text-amber-400">{score}</span> out of{' '}
                <span className="font-bold text-white">{currentQuestions.length}</span> ({Math.round((score / currentQuestions.length) * 100)}%)
              </p>
            </div>

            {/* Badges / Rating */}
            <div className="inline-block rounded-2xl bg-slate-950/80 px-6 py-3 border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Hardware Rank
              </span>
              <span className="text-base font-bold text-cyan-400">
                {score === currentQuestions.length
                  ? '🏆 Master Hardware Architect'
                  : score >= currentQuestions.length * 0.75
                    ? '⚡ Senior PC Technician'
                    : '🔧 Enthusiast PC Builder'}
              </span>
            </div>

            {/* Restart Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleRestart()}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer shadow-lg"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                Return to 3D Explorer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
