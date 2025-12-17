import { useState, useRef, useEffect } from 'react';
import { Send, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PoolMessage } from '@/config/poolConfig';

interface PoolChatProps {
  poolId: string;
  poolName: string;
  messages: PoolMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  className?: string;
}

export function PoolChat({
  poolName,
  messages,
  currentUserId,
  onSendMessage,
  className
}: PoolChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)} glass>
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Chat - {poolName}
        </CardTitle>
        <p className="text-xs text-gray-400 mt-1">
          {messages.length} messages • Soyez respectueux et professionnel
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isOwnMessage={msg.userId === currentUserId}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-dark-900/50">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 rounded-lg bg-dark-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={500}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-all duration-200",
                "flex items-center gap-2",
                newMessage.trim()
                  ? "bg-primary-500 hover:bg-primary-600 text-white hover:scale-105"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-right">
            {newMessage.length}/500
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatMessage({ 
  message, 
  isOwnMessage 
}: { 
  message: PoolMessage; 
  isOwnMessage: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-3",
        isOwnMessage && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
        message.isAdmin 
          ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white ring-2 ring-yellow-500/30"
          : "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
      )}>
        {message.isAdmin ? (
          <Shield className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[75%]",
        isOwnMessage && "text-right"
      )}>
        {/* Username and timestamp */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isOwnMessage && "justify-end"
        )}>
          <span className={cn(
            "text-sm font-semibold",
            message.isAdmin ? "text-yellow-400" : "text-gray-300"
          )}>
            {message.username}
          </span>
          {message.isAdmin && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
              ADMIN
            </span>
          )}
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "inline-block px-4 py-2 rounded-2xl",
            isOwnMessage
              ? "bg-primary-500 text-white rounded-br-sm"
              : "bg-dark-800 text-gray-200 rounded-bl-sm",
            message.isAdmin && !isOwnMessage && "border border-yellow-500/30"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
