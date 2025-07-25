import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Police/components/ui/card';
import { Badge } from '@/Police/components/ui/badge';
import { Button } from '@/Police/components/ui/button';
import { ArrowRight, Navigation, Clock, TrendingUp } from 'lucide-react';
import { RedirectionSuggestion } from '@/types/crowd';

interface RedirectionPanelProps {
  suggestions: RedirectionSuggestion[];
  onApplySuggestion?: (suggestionId: string) => void;
}

export const RedirectionPanel: React.FC<RedirectionPanelProps> = ({ 
  suggestions, 
  onApplySuggestion 
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Flow Redirection Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {suggestions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No redirection needed</p>
            <p className="text-xs">All gates operating within capacity</p>
          </div>
        ) : (
          suggestions.map(suggestion => (
            <div 
              key={suggestion.id}
              className="border rounded-lg p-4 space-y-3 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{suggestion.fromGate}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{suggestion.toGate}</Badge>
                </div>
                <Badge 
                  variant={suggestion.confidence >= 80 ? 'default' : 'secondary'}
                  className={getConfidenceColor(suggestion.confidence)}
                >
                  {suggestion.confidence}% Confidence
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{suggestion.reason}</p>
                <p className="text-sm text-muted-foreground">{suggestion.path}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ETA: {suggestion.estimatedTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Impact: High
                  </div>
                </div>
              </div>

              {onApplySuggestion && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onApplySuggestion(suggestion.id)}
                >
                  Apply Suggestion
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};