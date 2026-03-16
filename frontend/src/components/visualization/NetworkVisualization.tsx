/**
 * Simple Network Visualization - No complex d3 TypeScript types
 */

import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

interface NetworkVisualizationProps {
  data?: any;
  height?: number;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ 
  data, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Simple visualization placeholder for demo
    const svg = svgRef.current;
    svg.innerHTML = ''; // Clear previous content

    const width = svg.clientWidth || 800;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create simple circles to represent nodes
    const nodes = data.nodes || [];

    // Add circles for nodes
    nodes.slice(0, 10).forEach((node: any, i: number) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) / 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', '#1f77b4');
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '2');
      
      // Add title for tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = node.title || `Node ${i + 1}`;
      circle.appendChild(title);
      
      svg.appendChild(circle);
    });

    // Add text in center
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', centerX.toString());
    text.setAttribute('y', centerY.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '14');
    text.textContent = `${nodes.length} Research Connections`;
    svg.appendChild(text);

  }, [data, height]);

  return (
    <Box sx={{ width: '100%', height }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        🧠 Interactive Research Network (Simplified Demo)
      </Typography>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ 
          border: '1px solid #333',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a'
        }}
      />
    </Box>
  );
};