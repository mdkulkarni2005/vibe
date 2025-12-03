'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, Shield, Zap, CheckCircle2, Info } from 'lucide-react';

interface CodeIssue {
  id: string;
  type: 'SECURITY' | 'BUG' | 'CODE_QUALITY' | 'PERFORMANCE' | 'BEST_PRACTICE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  filePath?: string | null;
  lineStart?: number | null;
  lineEnd?: number | null;
  code?: string | null;
  recommendation?: string | null;
  fixCode?: string | null;
  cweId?: string | null;
  cvssScore?: number | null;
}

interface IssueCardProps {
  issue: CodeIssue;
  onViewDetails?: (issue: CodeIssue) => void;
}

const severityColors = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
  INFO: 'bg-gray-500',
};

const typeIcons = {
  SECURITY: Shield,
  BUG: Bug,
  CODE_QUALITY: CheckCircle2,
  PERFORMANCE: Zap,
  BEST_PRACTICE: Info,
};

export function IssueCard({ issue, onViewDetails }: IssueCardProps) {
  const Icon = typeIcons[issue.type];
  const severityColor = severityColors[issue.severity];

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails?.(issue)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${severityColor} bg-opacity-10`}>
              <Icon className={`w-5 h-5 text-${severityColor.replace('bg-', '')}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{issue.title}</CardTitle>
              <CardDescription className="mt-1">{issue.description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={severityColor}>{issue.severity}</Badge>
            <Badge variant="outline">{issue.type.replace('_', ' ')}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issue.filePath && (
            <div className="text-sm">
              <span className="font-medium">File: </span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{issue.filePath}</code>
              {issue.lineStart && (
                <span className="ml-2 text-muted-foreground">
                  Lines {issue.lineStart}
                  {issue.lineEnd && issue.lineEnd !== issue.lineStart && `-${issue.lineEnd}`}
                </span>
              )}
            </div>
          )}

          {issue.cweId && (
            <div className="text-sm">
              <span className="font-medium">CWE: </span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{issue.cweId}</code>
              {issue.cvssScore && (
                <span className="ml-2">
                  <span className="font-medium">CVSS: </span>
                  <Badge variant="outline">{issue.cvssScore.toFixed(1)}</Badge>
                </span>
              )}
            </div>
          )}

          {issue.code && (
            <div>
              <p className="text-sm font-medium mb-2">Affected Code:</p>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                <code>{issue.code}</code>
              </pre>
            </div>
          )}

          {issue.recommendation && (
            <div>
              <p className="text-sm font-medium mb-2">Recommendation:</p>
              <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
            </div>
          )}

          {issue.fixCode && (
            <div>
              <p className="text-sm font-medium mb-2">Suggested Fix:</p>
              <pre className="text-xs bg-green-50 dark:bg-green-950 p-3 rounded-lg overflow-x-auto">
                <code>{issue.fixCode}</code>
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
