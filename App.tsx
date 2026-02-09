import React, { useState, useRef, useEffect } from 'react';
import { Sender, Message, MathSolution, SimilarProblem } from './types';
import { solveMathProblem } from './geminiService';
import LatexRenderer from './LatexRenderer';
import ProblemCard from './ProblemCard';
import PracticeModal from './PracticeModal';
import FloatingSymbols from './FloatingSymbols';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  CpuChipIcon,
  ArrowPathIcon,
  BeakerIcon,
  DocumentMagnifyingGlassIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<SimilarProblem | null>(null);
  const [sendAnim, setSendAnim] = useState<'idle' | 'flying' | 'returned'>('idle');
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem('COMPIFY_GEMINI_API_KEY') ?? '' : ''
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('COMPIFY_GEMINI_API_KEY', apiKey);
      (window as typeof window & { GEMINI_API_KEY?: string }).GEMINI_API_KEY = apiKey || undefined;
    }
  }, [apiKey]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isLoading) return;

    // Trigger fly animation
    setSendAnim('flying');
    setTimeout(() => {
      setSendAnim('returned');
      setTimeout(() => setSendAnim('idle'), 400);
    }, 600);

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: input,
      image: image || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const solution: MathSolution = await solveMathProblem(userMessage.text || '', userMessage.image);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        solution: solution,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
       const messageText =
        error instanceof Error && error.message
          ? error.message
          : "I encountered an error solving this problem. Please try again with a clearer image or description.";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        text: "Please enter the API key in the box above: AIzaSyCcPra-vkQGOgUBDo9PMPP_8VfJOu8Ly_U",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendBtnClass = sendAnim === 'flying' ? 'send-flying' : sendAnim === 'returned' ? 'send-returned' : '';

  return (
    <div className="flex flex-col h-screen text-slate-100 font-sans overflow-hidden relative">
      {/* Floating Math Symbols Background */}
      <FloatingSymbols />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass-header z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold shimmer-text animate-glow">
              Compify!
            </h1>
            <p className="text-xs text-slate-400">Powered by Gemini 3 Flash Preview & Agentic RAG</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <span className="text-xs text-slate-400">Gemini API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste key"
              className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-48"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 glass px-3 py-1.5 rounded-full">
             <CpuChipIcon className="w-4 h-4" />
             <span>Thinking Mode: Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col md:flex-row z-[1]">

        {/* Chat / Solution Area */}
        <div className="flex-1 flex flex-col h-full relative">

          {/* Scrollable Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroller">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-5">
                <div className="w-28 h-28 rounded-2xl glass-strong flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <AcademicCapIcon className="w-14 h-14 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold shimmer-text">Ready to Compete?</h2>
                <p className="text-center text-slate-400 max-w-md leading-relaxed">
                  Upload a photo of a math competition problem or type it out.
                  Compify! will visualize the proof and challenge you with similar problems.
                </p>
              </div>
            )}

            {messages.map((msg, msgIdx) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'} animate-slide-up`} style={{ animationDelay: `${msgIdx * 0.05}s` }}>

                {/* User Message Bubble */}
                {msg.sender === Sender.USER && (
                  <div className="glass-strong rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-lg hover-glow transition-all duration-300">
                    {msg.image && (
                      <img src={msg.image} alt="User upload" className="max-h-48 rounded-lg mb-3 border border-white/10" />
                    )}
                    {msg.text && <p className="text-slate-200 whitespace-pre-wrap">{msg.text}</p>}
                  </div>
                )}

                {/* AI Response Area */}
                {msg.sender === Sender.AI && msg.solution && (
                  <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">

                    {/* Solution Container */}
                    <div className="glass-strong rounded-xl overflow-hidden shadow-2xl hover-glow transition-all duration-500">

                      <div className="glass px-6 py-3 flex items-center gap-2" style={{ borderRadius: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <h2 className="font-semibold text-slate-200">Analysis & Solution</h2>
                      </div>

                      <div className="p-6 md:p-8 flex flex-col gap-6">

                        {/* 1. OCR Section */}
                        {msg.solution.originalProblemOCR && (
                           <div className="p-4 glass relative group">
                             <div className="flex items-center gap-2 mb-2 text-slate-500">
                               <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                               <p className="text-xs uppercase tracking-wide font-bold">Transcription</p>
                             </div>
                             <div className="text-slate-300 font-serif">
                                <LatexRenderer content={msg.solution.originalProblemOCR} />
                             </div>
                           </div>
                        )}

                        {/* 2. Main Solution */}
                        <div className="prose prose-invert prose-lg max-w-none">
                           <div className="flex items-center gap-2 mb-4 text-indigo-400">
                               <AcademicCapIcon className="w-5 h-5" />
                               <span className="text-sm font-bold uppercase tracking-wide">Step-by-Step Proof</span>
                           </div>
                           <LatexRenderer content={msg.solution.stepByStepSolution} />
                        </div>

                        {/* 3. Final Answer */}
                        <div className="mt-4 pt-6 border-t border-white/5 flex items-center justify-between">
                          <p className="text-sm text-slate-400 font-medium">Final Answer</p>
                          <div className="px-8 py-4 glass rounded-xl text-2xl font-bold text-indigo-200 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                             <LatexRenderer content={msg.solution.finalAnswer} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Similar Problems Grid */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-lg shadow-amber-500/5">
                           <ArrowPathIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        Challenge: Related AOPS Problems
                        <span className="text-sm font-normal text-slate-500 ml-2">(Click to practice)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {msg.solution.similarProblems.map((prob, idx) => (
                          <ProblemCard
                            key={idx}
                            problem={prob}
                            index={idx}
                            onClick={setSelectedProblem}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {msg.sender === Sender.AI && msg.text && (
                  <div className="glass px-4 py-3 text-red-200">
                    {msg.text}
                  </div>
                )}

              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start max-w-md animate-slide-up">
                <div className="glass-strong rounded-xl px-6 py-5 flex items-center gap-4 shadow-lg">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-indigo-300 flex items-center gap-1">
                      Compify! is thinking
                      <span className="thinking-dot inline-block w-1 h-1 bg-indigo-400 rounded-full"></span>
                      <span className="thinking-dot inline-block w-1 h-1 bg-indigo-400 rounded-full"></span>
                      <span className="thinking-dot inline-block w-1 h-1 bg-indigo-400 rounded-full"></span>
                    </p>
                    <p className="text-xs text-slate-500">Scanning AOPS dataset & verifying logic</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 glass-input z-20">
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {image && (
                <div className="relative inline-block w-fit group animate-slide-up">
                  <img src={image} alt="Preview" className="h-20 rounded-lg border border-white/10 opacity-80" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                 <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-indigo-400 glass-btn"
                  title="Upload Image"
                >
                  <PhotoIcon className="w-6 h-6 relative z-10" />
                </button>
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a math problem or upload an image..."
                    className="relative w-full text-slate-200 placeholder-slate-500 py-3 pl-4 pr-14 focus:ring-1 focus:ring-indigo-500/50 resize-none h-[52px] leading-[28px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    }}
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || (!input && !image)}
                    className={`absolute right-2 top-1.5 p-2.5 glass-btn text-white ${sendBtnClass}`}
                  >
                    <PaperAirplaneIcon className="w-5 h-5 relative z-10 plane-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Practice Modal Overlay */}
      {selectedProblem && (
        <PracticeModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
        />
      )}

    </div>
  );
};

export default App;
