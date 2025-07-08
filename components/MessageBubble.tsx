import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Reply, Smile, MoreHorizontal } from 'lucide-react';
import { Message } from '@/api/messages';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, isOwn, onReply, onReact }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (emoji: string) => {
    onReact(message._id, emoji);
    setShowReactions(false);
  };

  if (message.type === 'expense') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs sm:max-w-md`}>
          {!isOwn && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.senderAvatar} />
              <AvatarFallback className="text-xs">
                {getInitials(message.senderName)}
              </AvatarFallback>
            </Avatar>
          )}
          
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium">💰 Expense Added</span>
              </div>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs sm:max-w-md`}>
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar} />
            <AvatarFallback className="text-xs">
              {getInitials(message.senderName)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col space-y-1">
          {message.replyTo && (
            <div className="text-xs text-muted-foreground bg-gray-100 rounded p-2 border-l-2 border-blue-500">
              <p className="font-medium">{message.replyTo.senderName}</p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}
          
          <div className={`relative rounded-2xl px-3 py-2 ${
            isOwn 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-white border shadow-sm'
          }`}>
            {!isOwn && (
              <p className="text-xs font-medium text-blue-600 mb-1">{message.senderName}</p>
            )}
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-muted-foreground'}`}>
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </p>

            {/* Reactions */}
            {message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-0 h-6 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleReaction(reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.users.length}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 p-1`}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-gray-200"
                onClick={() => setShowReactions(!showReactions)}
              >
                <Smile className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-gray-200"
                onClick={() => onReply(message)}
              >
                <Reply className="h-3 w-3" />
              </Button>
            </div>

            {/* Reaction picker */}
            {showReactions && (
              <div className="absolute top-full mt-1 bg-white border rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}