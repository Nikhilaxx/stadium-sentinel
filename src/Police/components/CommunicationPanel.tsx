import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Police/components/ui/card';
import { Button } from '@/Police/components/ui/button';
import { Input } from '@/Police/components/ui/input';
import { Badge } from '@/Police/components/ui/badge';
import { Textarea } from '@/Police/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Police/components/ui/select';
import { MessageSquare, Send, Radio, Clock, Check } from 'lucide-react';
import { CommunicationMessage } from '@/types/crowd';

interface CommunicationPanelProps {
  messages: CommunicationMessage[];
  onSendMessage: (message: Omit<CommunicationMessage, 'id' | 'timestamp'>) => void;
  onAcknowledgeMessage: (messageId: string) => void;
}

export const CommunicationPanel: React.FC<CommunicationPanelProps> = ({
  messages,
  onSendMessage,
  onAcknowledgeMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSendMessage = () => {
    if (newMessage.trim() && recipient) {
      onSendMessage({
        from: 'Command Center',
        to: recipient,
        message: newMessage,
        priority,
        acknowledged: false
      });
      setNewMessage('');
      setRecipient('');
      setPriority('medium');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const teams = [
    'Security Team Alpha',
    'Security Team Beta',
    'Gate Control',
    'Emergency Response',
    'Medical Team',
    'Traffic Control',
    'All Units'
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          Team Communications
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Send Message */}
        <div className="space-y-3 border-b pb-4">
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger>
              <SelectValue placeholder="Select recipient..." />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-16"
          />

          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !recipient}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Message History */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Communications</h4>
          
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages</p>
            </div>
          ) : (
            messages
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .slice(0, 10)
              .map(message => (
                <div 
                  key={message.id}
                  className={`border rounded-lg p-3 space-y-2 ${
                    message.acknowledged ? 'bg-muted/50' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(message.priority)}>
                        {message.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{message.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      {message.acknowledged ? (
                        <Badge variant="outline" className="text-success">
                          <Check className="h-3 w-3 mr-1" />
                          ACK
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAcknowledgeMessage(message.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs text-muted-foreground">From: {message.from}</p>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};