/**
 * Network Visualization - D3.js Force-directed graph of strategic connections
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Tooltip, Chip, IconButton } from '@mui/material';
import { ZoomIn, ZoomOut, CenterFocusStrong } from '@mui/icons-material';
import { NetworkGraphData, NetworkNode, NetworkLink } from '../../services/api';

interface NetworkVisualizationProps {
  data: NetworkGraphData;
  height: number;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  data,
  height,
  onNodeClick,
  onLinkClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<NetworkLink | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !svgRef.current) {
      console.warn('⚠️ Network visualization: No data or SVG ref');
      return;
    }

    console.log('🔗 Rendering network visualization:', {
      nodes: data.nodes.length,
      links: data.links.length,
      stats: data.network_stats
    });

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Dimensions
    const width = svgRef.current.clientWidth || 800;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'main-group');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Prepare data
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Color scale for connection types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['methodological_bridge', 'thematic_overlap', 'complementary_research', 'cross_disciplinary'])
      .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']);

    // Force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.1))
      .force('charge', d3.forceManyBody()
        .strength(-300)
        .distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius((d: any) => d.size + 5));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', (d: any) => {
        // Color by strategic value intensity
        const intensity = Math.min(d.strategic_value, 1);
        return d3.interpolateBlues(intensity * 0.7 + 0.3);
      })
      .attr('stroke-width', (d: any) => Math.sqrt(d.strategic_value * 8) + 1)
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        event.stopPropagation();
        setSelectedLink(d);
        onLinkClick && onLinkClick(d);
      })
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', Math.sqrt(d.strategic_value * 8) + 3);
        
        // Show tooltip
        showLinkTooltip(event, d);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', Math.sqrt(d.strategic_value * 8) + 1);
        
        hideTooltip();
      });

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d: any) => d.size || 8)
      .attr('fill', (d: any) => {
        // Color by number of connections
        const connectionRatio = d.connections / Math.max(data.network_stats.max_connections_per_node, 1);
        return d3.interpolateViridis(connectionRatio);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', (event, d: any) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick && onNodeClick(d);
        
        // Highlight connected nodes and links
        highlightConnections(d);
      })
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('r', (d.size || 8) + 3)
          .attr('stroke-width', 4);
        
        // Show tooltip
        showNodeTooltip(event, d);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('r', d.size || 8)
          .attr('stroke-width', 2);
        
        hideTooltip();
      });

    // Add labels for important nodes
    const label = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes.filter((d: any) => d.connections > 2)) // Only show labels for well-connected nodes
      .enter().append('text')
      .text((d: any) => d.short_title)
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)');

    // Simulation tick function
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y - (d.size || 8) - 5);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Highlight connections function
    function highlightConnections(selectedNode: any) {
      // Reset all styles
      node.attr('opacity', 0.3);
      link.attr('opacity', 0.1);
      
      // Highlight selected node
      node.filter((d: any) => d.id === selectedNode.id)
        .attr('opacity', 1);
      
      // Highlight connected nodes and links
      link.filter((d: any) => d.source.id === selectedNode.id || d.target.id === selectedNode.id)
        .attr('opacity', 0.8);
      
      node.filter((d: any) => 
        links.some((l: any) => 
          (l.source.id === selectedNode.id && l.target.id === d.id) ||
          (l.target.id === selectedNode.id && l.source.id === d.id)
        )
      ).attr('opacity', 0.8);
      
      // Fade out after 3 seconds
      setTimeout(() => {
        node.attr('opacity', 1);
        link.attr('opacity', 0.6);
      }, 3000);
    }

    // Tooltip functions (simplified - in real implementation, use proper React tooltips)
    function showNodeTooltip(event: any, d: any) {
      // In a real implementation, you'd set tooltip state here
      console.log('Node tooltip:', d);
    }

    function showLinkTooltip(event: any, d: any) {
      // In a real implementation, you'd set tooltip state here
      console.log('Link tooltip:', d);
    }

    function hideTooltip() {
      // Hide tooltip
    }

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [data, height, onNodeClick, onLinkClick]);

  // Zoom controls
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1 / 1.5
    );
  };

  const handleResetZoom = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px dashed #333',
          borderRadius: 2
        }}
      >
        <Typography color="text.secondary">
          No network data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: 0.5 }}>
        <IconButton size="small" onClick={handleZoomIn} sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <ZoomIn fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleZoomOut} sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <ZoomOut fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleResetZoom} sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <CenterFocusStrong fontSize="small" />
        </IconButton>
      </Box>

      {/* Network stats */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <Chip
          label={`Zoom: ${(zoomLevel * 100).toFixed(0)}%`}
          size="small"
          sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', mr: 1 }}
        />
      </Box>

      {/* Legend */}
      <Box sx={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Node Size = Connections"
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.7rem' }}
          />
          <Chip
            label="Link Width = Strategic Value"
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
          borderRadius: '8px'
        }}
      />

      {/* Selected Node Info */}
      {selectedNode && (
        <Box
          sx={{
            position: 'absolute',
            top: 50,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.9)',
            p: 2,
            borderRadius: 2,
            maxWidth: 300,
            border: '1px solid #333'
          }}
        >
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Selected Paper
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {selectedNode.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`${selectedNode.connections} connections`} size="small" />
            <Chip label={selectedNode.type} size="small" color="primary" />
          </Box>
        </Box>
      )}
    </Box>
  );
};