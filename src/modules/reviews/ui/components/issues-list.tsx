'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Bug, CheckCircle2, Zap, Info } from 'lucide-react';
import { IssueCard } from './issue-card';

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

interface IssuesListProps {
  issues: CodeIssue[];
}

export function IssuesList({ issues }: IssuesListProps) {
  const issuesByType = {
    SECURITY: issues.filter(i => i.type === 'SECURITY'),
    BUG: issues.filter(i => i.type === 'BUG'),
    CODE_QUALITY: issues.filter(i => i.type === 'CODE_QUALITY'),
    PERFORMANCE: issues.filter(i => i.type === 'PERFORMANCE'),
    BEST_PRACTICE: issues.filter(i => i.type === 'BEST_PRACTICE'),
  };

  const issuesBySeverity = {
    CRITICAL: issues.filter(i => i.severity === 'CRITICAL'),
    HIGH: issues.filter(i => i.severity === 'HIGH'),
    MEDIUM: issues.filter(i => i.severity === 'MEDIUM'),
    LOW: issues.filter(i => i.severity === 'LOW'),
    INFO: issues.filter(i => i.severity === 'INFO'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">
              All <Badge variant="secondary" className="ml-1">{issues.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-1" />
              Security <Badge variant="secondary" className="ml-1">{issuesByType.SECURITY.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="bugs">
              <Bug className="w-4 h-4 mr-1" />
              Bugs <Badge variant="secondary" className="ml-1">{issuesByType.BUG.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="quality">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Quality <Badge variant="secondary" className="ml-1">{issuesByType.CODE_QUALITY.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Zap className="w-4 h-4 mr-1" />
              Performance <Badge variant="secondary" className="ml-1">{issuesByType.PERFORMANCE.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="practices">
              <Info className="w-4 h-4 mr-1" />
              Best Practices <Badge variant="secondary" className="ml-1">{issuesByType.BEST_PRACTICE.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="severity">Severity</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {issues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No issues found</p>
            ) : (
              issues.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            {issuesByType.SECURITY.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No security issues found</p>
            ) : (
              issuesByType.SECURITY.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </TabsContent>

          <TabsContent value="bugs" className="space-y-4 mt-4">
            {issuesByType.BUG.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bugs found</p>
            ) : (
              issuesByType.BUG.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </TabsContent>

          <TabsContent value="quality" className="space-y-4 mt-4">
            {issuesByType.CODE_QUALITY.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No code quality issues found</p>
            ) : (
              issuesByType.CODE_QUALITY.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            {issuesByType.PERFORMANCE.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No performance issues found</p>
            ) : (
              issuesByType.PERFORMANCE.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </TabsContent>

          <TabsContent value="practices" className="space-y-4 mt-4">
            {issuesByType.BEST_PRACTICE.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No best practice violations found</p>
            ) : (
              issuesByType.BEST_PRACTICE.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </TabsContent>

          <TabsContent value="severity" className="space-y-6 mt-4">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(severity => {
              const severityIssues = issuesBySeverity[severity as keyof typeof issuesBySeverity];
              if (severityIssues.length === 0) return null;
              
              return (
                <div key={severity}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    {severity}
                    <Badge variant="outline">{severityIssues.length}</Badge>
                  </h3>
                  <div className="space-y-4">
                    {severityIssues.map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
