import React, { useState } from 'react';
import { SimilarProblem, VerificationResult } from '../types';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BeakerIcon className="w-5 h-5 text-indigo-400" />
            Practice Mode
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          
          {/* Left: Problem Statement */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-2">Problem Statement</h3>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 text-lg leading-relaxed shadow-inner">
                <LatexRenderer content={problem.problemText} />
              </div>
            </div>
            
            {!result && (
              <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-lg">
                <p className="text-sm text-indigo-300">
                  <span className="font-bold">Hint:</span> Focus on {problem.similarityLogic}
                </p>
              </div>
            )}

            {/* Verification Result */}
            {result && (
              <div className={`rounded-xl border p-5 ${result.isCorrect ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-red-950/30 border-red-500/50'}`}>
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
                     <div className="bg-slate-950/50 p-4 rounded text-slate-300 text-sm">
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
             <textarea 
               value={userSolution}
               onChange={(e) => setUserSolution(e.target.value)}
               placeholder="Type your proof or answer here... (LaTeX supported)"
               className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none font-mono text-sm"
             />
             <div className="mt-4 flex justify-end">
               <button
                 onClick={handleVerify}
                 disabled={isVerifying || !userSolution.trim()}
                 className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
               >
                 {isVerifying ? 'Checking...' : 'Verify Solution'}
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeModal;
