'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramViewerProps {
  diagram: string;
  title: string;
}

export function DiagramViewer({ diagram, title }: DiagramViewerProps) {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diagramRef.current && diagram) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });

      const renderDiagram = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, diagram);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Error rendering diagram:', error);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = '<p class="text-red-500">Failed to render diagram</p>';
          }
        }
      };

      renderDiagram();
    }
  }, [diagram]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={diagramRef}
          className="flex items-center justify-center p-4 bg-muted rounded-lg overflow-auto custom-scrollbar max-h-[500px]"
        />
      </CardContent>
    </Card>
  );
}
