import React, { useState, useEffect, useRef } from 'react';
import { apiUrl } from '../../config';
import { 
  Bot, 
  Send, 
  X, 
  Minus, 
  Maximize2, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  BrainCircuit, 
  Scale, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export type GeminiModelMode = 'general' | 'fast' | 'complex';

interface GeminiChatbotProps {
  currentStageContext?: {
    id: number;
    title: string;
  } | null;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  externalQuery?: string | null;
}

const DEFAULT_SUGGESTIONS = [
  'उपभोक्ता समितिबाट काम गराउन कति रकमसम्मको सीमा छ?',
  '३४ चरण खरिद प्रक्रियाको चरण ९ (लागत अनुमान) को मुख्य चेकलिस्ट के के हो?',
  'सिलबन्दी दरभाउ (Sealed Quotation) को अधिकतम सीमा कति हो?',
  'सार्वजनिक खरिद नियमावली अनुसार म्याद थप (Time Extension) को आधार के के हुन्?',
  'धरौटी (Bid Security र Performance Security) को रकम कति प्रतिशत हुनुपर्छ?',
  'भेरिएसन अर्डर (Variation Order) को सीमा र स्वीकृति प्रक्रिया के हो?'
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  currentStageContext,
  isOpenExternal,
  onCloseExternal,
  externalQuery,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<GeminiModelMode>('general');
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('nvc_gemini_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load chat history from session storage', e);
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `नमस्ते! म राष्ट्रिय सतर्कता केन्द्र (NVC) को **सार्वजनिक खरिद अनुगमन तथा प्राविधिक निरीक्षण Gemini AI सहायक** हुँ।\n\nतपाईंले सार्वजनिक खरिद ऐन २०६३, नियमावली २०६४, ३४-चरण खरिद प्रक्रिया, वा १८०-बुँदे चेकलिस्ट सम्बन्धी कुनै पनि कानुनी तथा प्राविधिक जिज्ञासा यहाँ सोध्न सक्नुहुन्छ। म तपाईंलाई सहयोग गर्न तयार छु!`,
        timestamp: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-2.5-flash',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync external open triggers
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) {
        setIsMinimized(false);
      }
    }
  }, [isOpenExternal]);

  // Handle external query if provided
  useEffect(() => {
    if (externalQuery && externalQuery.trim() !== '') {
      setIsOpen(true);
      setIsMinimized(false);
      sendMessage(externalQuery);
    }
  }, [externalQuery]);

  // Save conversation history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('nvc_gemini_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) {
      onCloseExternal();
    }
  };

  const handleClearHistory = () => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `कुराकानी इतिहास सफा गरियो। तपाईं सार्वजनिक खरिद ऐन, नियमावली वा ३४-चरण चेकलिस्ट सम्बन्धी नयाँ प्रश्न सोध्न सक्नुहुन्छ।`,
      timestamp: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-2.5-flash',
    };
    setMessages([welcomeMsg]);
    sessionStorage.removeItem('nvc_gemini_chat_history');
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context string from current stage if available
      let contextStr = '';
      if (currentStageContext) {
        contextStr = `प्रयोगकर्ता हाल चरण ${currentStageContext.id} (${currentStageContext.title}) को सार्वजनिक खरिद चेकलिस्ट पृष्ठ हेर्दैछन्।`;
      }

      // Format messages for multi-turn history
      const payloadMessages = newMessages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('welcome-'))
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        }));

      const res = await fetch(apiUrl('/api/gemini/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages.length > 0 ? payloadMessages : [{ role: 'user', content: query }],
          mode: modelMode,
          context: contextStr,
        }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'माफ गर्नुहोस्, कुनै जवाफ प्राप्त हुन सकेन।',
        timestamp: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || (modelMode === 'fast' ? 'gemini-2.5-flash-lite' : modelMode === 'complex' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `माफ गर्नुहोस्, सर्भरसँग सम्पर्क हुन सकेन। कृपया इन्टरनेट जडान जाँच गरी पुनः प्रयास गर्नुहोस्।`,
        timestamp: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown-like text with bold, bullets and linebreaks
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-[13.5px]">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bold title or heading lines
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^[०-९0-9]+[.)]/.test(line.trim());
          
          // Simple bold formatting parser
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <p key={idx} className={isBullet ? 'pl-2 text-slate-800' : 'text-slate-800'}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-semibold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button (when chat is closed) */}
      {!isOpen && (
        <aside aria-label="NVC AI Assistant" className="fixed bottom-6 right-3 z-50 flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="bg-white text-[#0f2c4d] font-semibold text-xs px-3 py-1 rounded-full shadow-md border border-slate-200 animate-pulse">
              खरिद कानून वा चेकलिस्टमा द्विविधा छ?
            </span>
          </div>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center gap-2.5 bg-gradient-to-r from-[#0f2c4d] to-[#1e4a7a] hover:from-[#13375f] hover:to-[#255b94] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-amber-400 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
            title="NVC Gemini खरिद सहायक खोल्नुहोस्"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold tracking-wide flex items-center gap-1">
                <span>NVC खरिद AI सहायक</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <div className="text-[10px] text-blue-200 font-medium">Gemini 3.5 Powered</div>
            </div>
          </button>
        </aside>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized
              ? 'w-80 sm:w-96 h-14'
              : 'w-[calc(100vw-2rem)] sm:w-[440px] md:w-[470px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#0f2c4d] text-white px-3 py-2 flex items-center justify-between select-none shadow">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">खरिद AI सहायक</h3>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">
                  सार्वजनिक खरिद परामर्श
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              {/* Model Switcher Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModelDropdown((prev) => !prev)}
                  className="flex items-center gap-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition border border-white/15"
                  title="मोडेल छान्नुहोस्"
                >
                  {modelMode === 'fast' && <Zap className="w-3 h-3 text-amber-300" />}
                  {modelMode === 'general' && <Sparkles className="w-3 h-3 text-cyan-300" />}
                  {modelMode === 'complex' && <BrainCircuit className="w-3 h-3 text-purple-300" />}
                  <span>
                    {modelMode === 'fast' ? 'द्रुत (Lite)' : modelMode === 'complex' ? 'गहन (Pro)' : 'सामान्य (Flash)'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-blue-200" />
                </button>

                {showModelDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                    <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Gemini Model छनोट
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModelMode('general');
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition ${
                        modelMode === 'general' ? 'bg-blue-50 font-bold text-blue-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <div>
                          <div>सामान्य (General)</div>
                          <div className="text-[10px] text-slate-500 font-normal">gemini-2.5-flash</div>
                        </div>
                      </div>
                      {modelMode === 'general' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModelMode('fast');
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition ${
                        modelMode === 'fast' ? 'bg-blue-50 font-bold text-blue-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <div>
                          <div>द्रुत (Fast)</div>
                          <div className="text-[10px] text-slate-500 font-normal">gemini-2.5-flash-lite</div>
                        </div>
                      </div>
                      {modelMode === 'fast' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModelMode('complex');
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition ${
                        modelMode === 'complex' ? 'bg-blue-50 font-bold text-blue-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                        <div>
                          <div>जटिल / विश्लेषण (Complex)</div>
                          <div className="text-[10px] text-slate-500 font-normal">gemini-2.5-pro</div>
                        </div>
                      </div>
                      {modelMode === 'complex' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Clear history */}
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 hover:bg-white/10 rounded text-blue-200 hover:text-white transition"
                title="कुराकानी सफा गर्नुहोस्"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 hover:bg-white/10 rounded text-blue-200 hover:text-white transition"
                title={isMinimized ? 'विस्तार गर्नुहोस्' : 'सानो बनाउनुहोस्'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 hover:bg-white/10 rounded text-blue-200 hover:text-white transition"
                title="बन्द गर्नुहोस्"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (if not minimized) */}
          {!isMinimized && (
            <>
              {/* Context Indicator (if active stage) */}
              {currentStageContext && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Scale className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span className="font-semibold truncate">
                      सन्दर्भ: चरण {currentStageContext.id} - {currentStageContext.title}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      sendMessage(`चरण ${currentStageContext.id} (${currentStageContext.title}) सम्बन्धी मुख्य कानुनी आधार र चेकलिस्टका बुँदाहरू के के हुन्?`);
                    }}
                    className="text-[11px] text-blue-700 hover:underline font-semibold flex-shrink-0 ml-2"
                  >
                    सोध्नुहोस् →
                  </button>
                </div>
              )}

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[90%]">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-[#0f2c4d] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                            <Bot className="w-4 h-4 text-amber-400" />
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm border ${
                            isUser
                              ? 'bg-[#0f2c4d] text-white border-transparent rounded-tr-none'
                              : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {isUser ? (
                            <p className="text-[13.5px] whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            renderFormattedText(message.content)
                          )}

                          {/* Message Footer: Timestamp, Model, Copy button */}
                          <div
                            className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
                              isUser
                                ? 'border-white/10 text-blue-200'
                                : 'border-slate-100 text-slate-400'
                            }`}
                          >
                            <span className="font-mono">{message.timestamp}</span>

                            {!isUser && (
                              <div className="flex items-center gap-2">
                                {message.modelUsed && (
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                    {message.modelUsed.replace('gemini-', '')}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(message.id, message.content)}
                                  className="hover:text-slate-700 transition flex items-center gap-0.5"
                                  title="जवाफ कपी गर्नुहोस्"
                                >
                                  {copiedId === message.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-600">कपी भयो</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>कपी</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0f2c4d] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-slate-500 text-xs">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span>NVC कानुनी तथा चेकलिस्ट विश्लेषण गर्दैछ...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Starter Suggestions (Quick Prompts) */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-3 py-2 bg-slate-100 border-t border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-700" />
                    <span>प्रायः सोधिने खरिद सम्बन्धी प्रश्नहरू:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {DEFAULT_SUGGESTIONS.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        className="text-left text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-full px-2.5 py-1 transition cursor-pointer shadow-xs"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="सार्वजनिक खरिद, नियमावली वा ३४-चरण चेकलिस्टबारे सोध्नुहोस्... (Enter थिच्नुहोस्)"
                      rows={2}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-slate-50/50"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-10 px-4 rounded-xl bg-[#0f2c4d] hover:bg-[#1a406d] disabled:bg-slate-300 text-white font-medium flex items-center justify-center transition shadow-sm cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                    title="पठाउनुहोस्"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1 text-center text-[10px] text-slate-400">
                  राष्ट्रिय सतर्कता केन्द्रको खरिद ऐन, नियमावली र ३४-चरण चेकलिस्टमा आधारित AI परामर्श।
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
