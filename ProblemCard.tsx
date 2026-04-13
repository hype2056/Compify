import React from 'react';
import { SimilarProblem } from '../types';
import LatexRenderer from './LatexRenderer';

interface ProblemCardProps {
  problem: SimilarProblem;
  index: number;
  onClick: (problem: SimilarProblem) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, index, onClick }) => {
  return (
    <div 
      onClick={() => onClick(problem)}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-200 flex flex-col h-full cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          Practice Problem #{index + 1}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-300 normal-case font-normal">- Click to Solve</span>
        </h4>
      </div>
      
      <h3 className="text-white font-semibold mb-3 relative z-10">{problem.title}</h3>
      
      {/* Problem Text - Full Visibility */}
      <div className="text-sm text-slate-300 mb-4 bg-slate-900/80 p-4 rounded-md border border-slate-800/50 flex-grow relative z-10">
        <LatexRenderer content={problem.problemText} />
      </div>
      
      <div className="mt-auto relative z-10">
        <div className="text-xs flex items-start gap-2 bg-indigo-900/20 p-2 rounded border border-indigo-500/20">
            <span className="font-bold text-indigo-400 shrink-0">Concept:</span>
            <span className="text-indigo-200/80">
                {problem.similarityLogic}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;