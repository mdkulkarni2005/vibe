'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Review {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  summary?: string | null;
  score?: number | null;
  totalFiles: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  createdAt: Date;
  completedAt?: Date | null;
}

interface ReviewOverviewProps {
  review: Review;
}

export function ReviewOverview({ review }: ReviewOverviewProps) {
  const getScoreColor = (score?: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score?: number | null) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getStatusBadge = (status: Review['status']) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, text: 'Pending', icon: Shield },
      IN_PROGRESS: { variant: 'default' as const, text: 'In Progress', icon: Shield },
      COMPLETED: { variant: 'default' as const, text: 'Completed', icon: CheckCircle2 },
      FAILED: { variant: 'destructive' as const, text: 'Failed', icon: XCircle },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>Code quality assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div
              className={`w-32 h-32 rounded-full ${getScoreBgColor(review.score)} flex items-center justify-center`}
            >
              <span className={`text-4xl font-bold ${getScoreColor(review.score)}`}>
                {review.score ?? '--'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={review.score ?? 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Status & Info */}
      <Card>
        <CardHeader>
          <CardTitle>Review Status</CardTitle>
          <CardDescription>Current review state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            {getStatusBadge(review.status)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Files Analyzed</span>
            <Badge variant="outline">{review.totalFiles}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Started</span>
            <span className="text-sm text-muted-foreground">
              {new Date(review.createdAt).toLocaleString()}
            </span>
          </div>
          {review.completedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed</span>
              <span className="text-sm text-muted-foreground">
                {new Date(review.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Found</CardTitle>
          <CardDescription>Issues by severity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <Badge variant="destructive">{review.criticalIssues}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">High</span>
            </div>
            <Badge className="bg-orange-500">{review.highIssues}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Medium</span>
            </div>
            <Badge className="bg-yellow-500">{review.mediumIssues}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Low</span>
            </div>
            <Badge className="bg-blue-500">{review.lowIssues}</Badge>
          </div>
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Total Issues</span>
              <Badge variant="outline" className="font-bold">
                {review.totalIssues}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
