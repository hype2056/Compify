import React, { useState } from 'react';
import { SimilarProblem, VerificationResult } from './types';
import LatexRenderer from './LatexRenderer';
import { verifySolution } from './geminiService';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface PracticeModalProps {
  problem: SimilarProblem;
  onClose: () => void;
}

const PracticeModal: React.FC<PracticeModalProps> = ({ problem, onClose }) => {
  const [userSolution, setUserSolution] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!userSolution.trim()) return;
    setIsVerifying(true);
    try {
      const data = await verifySolution(problem.problemText, userSolution);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-strong w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden gradient-border animate-slide-up">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center glass">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg">
              <BeakerIcon className="w-5 h-5 text-white" />
            </div>
            <span className="shimmer-text">Practice Mode</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 scroller">

          {/* Left: Problem Statement */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-2">Problem Statement</h3>
              <div className="glass p-5 rounded-xl text-lg leading-relaxed shadow-inner">
                <LatexRenderer content={problem.problemText} />
              </div>
            </div>

            {!result && (
              <div className="glass rounded-lg p-4 border-indigo-500/20">
                <p className="text-sm text-indigo-300">
                  <span className="font-bold">Hint:</span> Focus on {problem.similarityLogic}
                </p>
              </div>
            )}

            {/* Verification Result */}
            {result && (
              <div className={`rounded-xl border p-5 animate-slide-up ${result.isCorrect ? 'bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'bg-red-950/20 border-red-500/30 shadow-lg shadow-red-500/5'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.isCorrect ? (
                    <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircleIcon className="w-8 h-8 text-red-400" />
                  )}
                  <h3 className={`text-lg font-bold ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.isCorrect ? 'Correct Solution!' : 'Not Quite Right'}
                  </h3>
                </div>

                <div className="prose prose-invert prose-sm mb-4">
                  <LatexRenderer content={result.feedback} />
                </div>

                {!result.isCorrect && (
                   <div className="mt-4 pt-4 border-t border-red-500/20">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Full Solution</p>
                     <div className="glass p-4 rounded-lg text-slate-300 text-sm">
                       <LatexRenderer content={result.correctSolution} />
                     </div>
                   </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Input Area */}
          <div className="flex-1 flex flex-col h-full min-h-[300px]">
             <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-2">Your Solution</h3>
             <div className="flex-1 relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
               <textarea
                 value={userSolution}
                 onChange={(e) => setUserSolution(e.target.value)}
                 placeholder="Type your proof or answer here... (LaTeX supported)"
                 className="relative w-full h-full glass rounded-xl p-4 text-slate-200 focus:ring-1 focus:ring-indigo-500/50 outline-none resize-none font-mono text-sm"
               />
             </div>
             <div className="mt-4 flex justify-end">
               <button
                 onClick={handleVerify}
                 disabled={isVerifying || !userSolution.trim()}
                 className="glass-btn text-white font-medium py-2.5 px-6 flex items-center gap-2"
               >
                 {isVerifying ? (
                   <>
                     Checking
                     <span className="thinking-dot inline-block w-1 h-1 bg-white rounded-full"></span>
                     <span className="thinking-dot inline-block w-1 h-1 bg-white rounded-full"></span>
                     <span className="thinking-dot inline-block w-1 h-1 bg-white rounded-full"></span>
                   </>
                 ) : 'Verify Solution'}
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeModal;
