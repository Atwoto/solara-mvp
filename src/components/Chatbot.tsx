// src/components/Chatbot.tsx
'use client';

import { FormEvent } from 'react';
import type { Message } from "ai/react";
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useChatbotLogic } from '@/hooks/useChatbotLogic'; // Import our new hook

// Import icons directly from their specific paths as a robust measure
import { XMarkIcon } from '@heroicons/react/24/solid/index.js';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid/index.js';
import { CheckCircleIcon } from '@heroicons/react/24/solid/index.js';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid/index.js';
import { InformationCircleIcon } from '@heroicons/react/24/solid/index.js';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid/index.js';
import { SunIcon } from '@heroicons/react/24/solid/index.js';
import { SparklesIcon as SparklesOutline } from '@heroicons/react/24/outline/index.js';

export default function Chatbot() {
  const {
    isOpen, setIsOpen,
    showNotification,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    handleActionClick,
    messagesEndRef,
    inputRef,
    chatContainerRef
  } = useChatbotLogic();

  const chatWindowVariants: Variants = {
    closed: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2, ease: "easeOut" } },
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };
  const fabVariants: Variants = {
    rest: { scale: 1, boxShadow: "0px 5px 15px rgba(0,0,0,0.2)" },
    hover: { scale: 1.05, boxShadow: "0px 8px 25px rgba(0,0,0,0.3)" },
    tap: { scale: 0.95 }
  };

  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed top-5 right-5 z-[1000] p-3.5 rounded-lg shadow-xl text-white text-sm flex items-center gap-2.5
                        ${showNotification.type === 'success' ? 'bg-green-500' : showNotification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {showNotification.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
            {showNotification.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5" />}
            {showNotification.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}
            <span>{showNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        variants={fabVariants} whileHover="hover" whileTap="tap" onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[900] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-solar-flare-start to-solar-flare-end text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-solar-flare-start/50"
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -45, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 45, opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }}>
              <XMarkIcon className="h-8 w-8" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 45, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -45, opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }}>
              <SparklesOutline className="h-8 w-8" /> 
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef} variants={chatWindowVariants} initial="closed" animate="open" exit="closed"
            className="fixed bottom-24 right-6 z-[850] w-[calc(100vw-3rem)] max-w-sm rounded-xl bg-gray-50 shadow-2xl border border-gray-200/70 flex flex-col"
            style={{ height: 'clamp(350px, 70vh, 600px)' }} 
          >
            <div className="flex items-center space-x-3 bg-gradient-to-r from-deep-night to-gray-800 p-4 text-white rounded-t-xl shadow sticky top-0">
                <div className="p-1.5 bg-white/10 rounded-full"><ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-solar-flare-start"/></div>
                <div><h3 className="font-semibold text-base">Bills On Solar Assistant</h3><p className="text-xs opacity-80">Your solar energy expert</p></div>
            </div>
            
            <div className="flex-grow space-y-3.5 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
              {displayMessages.length === 0 && !isLoading && (
                 <div className="text-center py-8 px-4 text-gray-500">
                    <SunIcon className="h-16 w-16 mx-auto text-solar-flare-start opacity-50 mb-4"/>
                    <h4 className="font-semibold text-lg text-gray-700 mb-1">Welcome!</h4>
                    <p className="text-sm">Ask me about our products, or how to get started with solar energy.</p>
                 </div>
              )}
              {displayMessages.map((m: Message) => {
                  const isUser = m.role === "user";
                  const actionButtonRegex = /ACTION_BUTTON\[([^|]+)\|([^|]+)\|([^\]]+)\]/;
                  const executeActionRegex = /EXECUTE_ACTION\[([^|]+)\|([^\]]+)\]/;
                  const buttonMatch = m.content.match(actionButtonRegex);
                  const executeMatch = m.content.match(executeActionRegex);
                  let contentToDisplay = m.content;
                  let actionButtonDetails = null;
                  if (buttonMatch) contentToDisplay = contentToDisplay.replace(buttonMatch[0], "").trim();
                  if (executeMatch) contentToDisplay = contentToDisplay.replace(executeMatch[0], "").trim();
                  if (buttonMatch) {
                    const [, buttonText, actionType, idOrMarker] = buttonMatch;
                    actionButtonDetails = { buttonText, actionType, idOrMarker };
                  }

                  return (
                    <div key={m.id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 shadow-sm text-sm ${ isUser ? `bg-gradient-to-br from-solar-flare-start to-orange-500 text-white rounded-t-xl rounded-bl-xl` : `bg-white text-gray-800 rounded-t-xl border border-gray-200 rounded-br-xl`}`}>
                        {contentToDisplay && <p className="whitespace-pre-wrap">{contentToDisplay}</p>}
                        {actionButtonDetails && (
                          <button
                            onClick={() => handleActionClick(actionButtonDetails.actionType, actionButtonDetails.idOrMarker)}
                            className="mt-2.5 block w-full text-center px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out text-white bg-gradient-to-r from-solar-flare-start via-orange-500 to-solar-flare-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-70"
                          >{actionButtonDetails.buttonText}</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              {isLoading && ( <div className="flex justify-start"><div className="bg-white text-gray-600 p-3 rounded-xl shadow-sm text-sm border border-gray-200"><p className="animate-pulse">Assistant is typing...</p></div></div> )}
              {error && !isLoading && ( <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center shadow-sm border border-red-200"><p>Oops! {error.message || "An error occurred."}</p></div> )}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSubmit(e); }} className="border-t border-gray-200/80 p-3 sm:p-4 bg-white rounded-b-xl">
               <div className="flex items-center space-x-2 sm:space-x-3">
                <input ref={inputRef} value={input} onChange={handleInputChange} placeholder="Ask about solar panels..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-solar-flare-start focus:ring-1 focus:ring-solar-flare-start focus:outline-none transition-shadow shadow-sm focus:shadow-md"
                  disabled={isLoading} aria-label="Chat input"
                  onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && input.trim()) { e.preventDefault(); handleSubmit(e); } }}
                />
                <button type="submit"
                  className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-solar-flare-start focus:ring-opacity-50"
                  disabled={isLoading || !input.trim()} aria-label="Send message">
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #9CA3AF #F3F4F6; }
        .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb { background-color: #9CA3AF; border-radius: 6px; border: 2px solid #F3F4F6; }
        .hover\\:scrollbar-thumb-gray-500::-webkit-scrollbar-thumb:hover { background-color: #6B7280; }
        .scrollbar-track-gray-100::-webkit-scrollbar-track { background-color: #F3F4F6; border-radius: 6px; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb { border-radius: 9999px; }
      `}</style>
    </>
  );
}