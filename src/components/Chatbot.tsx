"use client";

import { FormEvent, useEffect } from "react";
import type { UIMessage } from "ai";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useChatbotLogic } from "@/hooks/useChatbotLogic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";

// Importing all necessary icons
import {
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  SunIcon,
  SparklesIcon as SparklesOutline,
} from "@heroicons/react/24/solid/index.js";

const WelcomeScreen = ({
  handleActionClick,
}: {
  handleActionClick: (actionType: string, idOrMarker: string) => void;
}) => {
  const suggestions = [
    {
      text: "Recommend a solar kit for my home",
      action: "prefill",
      value: "I need a solar kit for my home, what do you recommend?",
    },
    {
      text: "Find articles about solar investment",
      action: "prefill",
      value: "Show me articles about solar investment",
    },
    {
      text: "What services do you offer?",
      action: "prefill",
      value: "What installation services do you offer?",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4 text-gray-700">
      <div className="relative h-20 w-20 mb-4">
        <div className="absolute inset-0 bg-solar-flare-start rounded-full opacity-30 animate-ping-slow"></div>
        <div className="relative flex items-center justify-center h-full w-full bg-gradient-to-br from-solar-flare-start to-solar-flare-end rounded-full shadow-lg">
          <SunIcon className="h-10 w-10 text-white" />
        </div>
      </div>
      <h4 className="font-semibold text-lg text-gray-800 mb-1">Welcome!</h4>
      <p className="text-sm text-gray-500 mb-6">
        Ask me anything about our solar solutions.
      </p>
      <div className="w-full space-y-2">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => handleActionClick(s.action, s.value)}
            className="w-full text-left text-sm p-3 bg-white/60 hover:bg-white rounded-lg shadow-sm transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
          >
            {s.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default function Chatbot() {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    isOpen,
    setIsOpen,
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
    chatContainerRef,
  } = useChatbotLogic();

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && !isLoading) {
      // Handle AUTO_NAVIGATE command
      const autoNavigateRegex = /AUTO_NAVIGATE\[([^\]]+)\]/;
      const navigateMatch = lastMessage.content.match(autoNavigateRegex);
      if (navigateMatch && navigateMatch[1]) {
        const url = navigateMatch[1];
        router.push(url);
      }

      // Handle OPEN_CART command
      const openCartRegex = /OPEN_CART/;
      if (openCartRegex.test(lastMessage.content)) {
        handleActionClick("openCart", "");
      }
    }
  }, [messages, isLoading, router, handleActionClick]);

  const chatWindowVariants: Variants = {
    closed: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  };

  const fabVariants: Variants = {
    rest: { scale: 1, boxShadow: "0px 10px 25px rgba(0,0,0,0.2)" },
    hover: { scale: 1.05, boxShadow: "0px 10px 30px rgba(253, 184, 19, 0.4)" },
    tap: { scale: 0.95 },
  };

  // --- THIS IS THE FIX ---
  // Animation variants for the new callout bubble
  const calloutVariants: Variants = {
    hidden: { opacity: 0, x: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.5, // Delay its appearance slightly
      },
    },
  };

  const displayMessages = messages.filter((m) => m.role !== "system");

  const handleButtonClick = (actionType: string, value: string) => {
    if (actionType === "navigate") {
      router.push(value);
    } else {
      handleActionClick(actionType, value);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(e, {
      options: {
        body: {
          isLoggedIn: !!session,
          userName: session?.user?.name || null,
        },
      },
    });
  };

  return (
    <>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.9,
              transition: { duration: 0.2 },
            }}
            className={`fixed top-5 right-5 z-[1000] p-3.5 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2.5
                            ${showNotification.type === "success" ? "bg-green-500" : showNotification.type === "error" ? "bg-red-500" : "bg-blue-500"}`}
          >
            {showNotification.type === "success" && (
              <CheckCircleIcon className="h-5 w-5" />
            )}
            {showNotification.type === "error" && (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            {showNotification.type === "info" && (
              <InformationCircleIcon className="h-5 w-5" />
            )}
            <span>{showNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- THIS IS THE FIX --- */}
      {/* The main container for the button and the new callout */}
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-4">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              variants={calloutVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-deep-night text-white p-3 rounded-xl shadow-2xl relative"
            >
              <p className="text-sm font-semibold">Have a question?</p>
              <p className="text-xs text-gray-300">
                Chat with our AI assistant
              </p>
              {/* Triangle pointer */}
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-deep-night transform -translate-y-1/2 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          variants={fabVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-solar-flare-start to-solar-flare-end text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-solar-flare-start/50 relative"
          aria-label={isOpen ? "Close chat" : "Open AI chat assistant"}
        >
          <span className="absolute h-full w-full rounded-full bg-inherit animate-ping-slow opacity-30"></span>
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="h-8 w-8" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 45, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -45, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <SparklesOutline className="h-8 w-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            variants={chatWindowVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed bottom-28 right-6 z-[9998] w-[calc(100vw-3rem)] max-w-sm rounded-2xl bg-white/50 backdrop-blur-2xl shadow-2xl border border-white/20 flex flex-col"
            style={{ height: "clamp(400px, 70vh, 650px)" }}
          >
            <div className="flex items-center space-x-3 bg-gradient-to-r from-deep-night to-gray-800 p-4 text-white rounded-t-2xl shadow-lg sticky top-0">
              <div className="p-1.5 bg-white/10 rounded-full">
                <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-solar-flare-start" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  Bills On Solar Assistant
                </h3>
                <p className="text-xs opacity-80">Your solar energy expert</p>
              </div>
            </div>

            <div className="flex-grow space-y-4 p-4 overflow-y-auto scrollbar-thin">
              {displayMessages.length === 0 && !isLoading && (
                <WelcomeScreen handleActionClick={handleActionClick} />
              )}

              {displayMessages.map((m: UIMessage) => {
                const isUser = m.role === "user";
                const actionButtonRegex =
                  /ACTION_BUTTON\[([^|]+)\|([^|]+)\|([^\]]+)\]/g;
                const executeActionRegex =
                  /EXECUTE_ACTION\[([^|]+)\|([^\]]+)?\]/;
                const autoNavigateRegex = /AUTO_NAVIGATE\[([^\]]+)\]/;
                const openCartRegex = /OPEN_CART/g;

                const actionButtons = Array.from(
                  m.content.matchAll(actionButtonRegex)
                );

                let contentToDisplay = m.content
                  .replace(actionButtonRegex, "")
                  .replace(executeActionRegex, "")
                  .replace(autoNavigateRegex, "")
                  .replace(openCartRegex, "")
                  .trim();

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`prose prose-sm max-w-[85%] sm:max-w-[80%] px-4 py-2.5 shadow-md ${isUser ? `bg-gradient-to-br from-solar-flare-start to-orange-500 text-white rounded-t-xl rounded-bl-xl prose-invert` : `bg-white text-gray-800 rounded-t-xl border border-gray-200 rounded-br-xl`}`}
                    >
                      {contentToDisplay && (
                        <ReactMarkdown>{contentToDisplay}</ReactMarkdown>
                      )}
                      {actionButtons.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-black/10 pt-3">
                          {actionButtons.map((match, index) => {
                            const [, buttonText, actionType, value] = match;
                            return (
                              <button
                                key={index}
                                onClick={() =>
                                  handleButtonClick(actionType, value)
                                }
                                className="block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ease-in-out text-solar-flare-end bg-solar-flare-start/10 hover:bg-solar-flare-start/20"
                              >
                                {buttonText} &rarr;
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-3 rounded-xl shadow-md text-sm border border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0s" }}
                      ></span>
                      <span
                        className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center shadow-sm border border-red-200"
                >
                  <p>Oops! {error.message || "An error occurred."}</p>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="border-t border-white/20 p-3 sm:p-4 bg-black/10"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about solar..."
                  className="flex-1 rounded-full border border-gray-300/50 bg-white/80 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-500 focus:border-solar-flare-start focus:ring-2 focus:ring-solar-flare-start focus:outline-none transition-shadow shadow-sm focus:shadow-md"
                  disabled={isLoading}
                  aria-label="Chat input"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                      handleFormSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-solar-flare-start focus:ring-opacity-50"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
          border: 3px solid transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.5);
        }
        .prose strong {
          color: inherit;
        }
      `}</style>
    </>
  );
}
