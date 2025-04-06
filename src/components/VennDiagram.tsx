import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Circle {
  id: string;
  label: string;
  letter: string;
  color: string;
  description?: string;
}

interface RelatedObject {
  object: Circle;
  relationshipType: 'inner' | 'outer' | 'left' | 'right';
  parentId?: string | null;
}

interface VennDiagramProps {
  primaryObject: Circle;
  relatedObjects: RelatedObject[];
  width?: number;
  height?: number;
}

const VennDiagram: React.FC<VennDiagramProps> = ({ 
  primaryObject, 
  relatedObjects,
  width = 550, 
  height = 500
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container with margin
    const margin = { top: 30, right: 30, bottom: 60, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Title
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('SQL Join Visualization');
    
    // If no related objects, just show primary circle
    if (relatedObjects.length === 0) {
      const radius = Math.min(innerWidth, innerHeight) / 3;
      
      // Draw primary circle
      svg.append('circle')
        .attr('cx', innerWidth / 2)
        .attr('cy', innerHeight / 2)
        .attr('r', radius)
        .attr('fill', `${primaryObject.color}30`)
        .attr('stroke', primaryObject.color)
        .attr('stroke-width', 2);
      
      // Add primary label
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .attr('fill', primaryObject.color)
        .attr('font-weight', 'bold')
        .attr('font-size', '24px')
        .text(primaryObject.letter);
      
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2 + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(primaryObject.label);
      
      return;
    }

    // Start by building a proper hierarchy
    const objectsById = new Map<string, Circle>();
    objectsById.set(primaryObject.id, primaryObject);
    
    relatedObjects.forEach(relObj => {
      objectsById.set(relObj.object.id, relObj.object);
    });
    
    // Build parent-child relationships
    const childrenMap = new Map<string | null, string[]>();
    childrenMap.set(null, [primaryObject.id]);
    
    const parentMap = new Map<string, string | null>();
    parentMap.set(primaryObject.id, null);
    
    relatedObjects.forEach(relObj => {
      const parentId = relObj.parentId || null;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(relObj.object.id);
      parentMap.set(relObj.object.id, parentId);
    });
    
    // Find relationship types
    const relationshipTypeMap = new Map<string, string>();
    relatedObjects.forEach(relObj => {
      const parentId = relObj.parentId || null;
      if (parentId !== null) {
        relationshipTypeMap.set(
          `${parentId}-${relObj.object.id}`, 
          relObj.relationshipType
        );
      } else {
        relationshipTypeMap.set(
          `${primaryObject.id}-${relObj.object.id}`, 
          relObj.relationshipType
        );
      }
    });

    // Calculate object positions based on hierarchy
    const calculateObjectPositions = () => {
      // Count total objects (primary + related)
      const totalObjects = 1 + relatedObjects.length;
      
      // Maximum depth of the hierarchy tree
      let maxDepth = 0;
      
      // Find max depth and count objects at each level
      const objectsByLevel: { [level: number]: string[] } = { 0: [primaryObject.id] };
      
      // Build a better hierarchical object structure first
      const directChildrenOfPrimary = relatedObjects
        .filter(obj => obj.parentId === null || !obj.parentId)
        .map(obj => obj.object.id);
      
      if (directChildrenOfPrimary.length > 0) {
        objectsByLevel[1] = directChildrenOfPrimary;
        maxDepth = 1;
      }
      
      // Find children at deeper levels
      const findChildren = (parentIds: string[], currentLevel: number) => {
        if (currentLevel > 5 || parentIds.length === 0) return; // Limit depth and prevent infinite loops
        
        const childrenAtThisLevel: string[] = [];
        
        parentIds.forEach(parentId => {
          const children = relatedObjects
            .filter(obj => obj.parentId === parentId)
            .map(obj => obj.object.id);
          
          childrenAtThisLevel.push(...children);
        });
        
        if (childrenAtThisLevel.length > 0) {
          objectsByLevel[currentLevel] = childrenAtThisLevel;
          maxDepth = Math.max(maxDepth, currentLevel);
          findChildren(childrenAtThisLevel, currentLevel + 1);
        }
      };
      
      findChildren(directChildrenOfPrimary, 2);
      
      // Calculate base size parameters
      const maxObjectsPerLevel = Math.max(...Object.values(objectsByLevel).map(arr => arr.length), 1);
      const maxDimension = Math.min(innerWidth, innerHeight);
      
      // Calculate primary circle radius
      const primaryRadius = maxDimension / (4 + maxObjectsPerLevel);
      
      // Calculate center positions
      const positions: { [id: string]: { x: number, y: number, radius: number } } = {};
      
      // Place primary object in the center
      positions[primaryObject.id] = {
        x: innerWidth / 2,
        y: innerHeight / 2,
        radius: primaryRadius
      };
      
      // Place direct children of primary first
      const directChildren = objectsByLevel[1] || [];
      directChildren.forEach((objectId, index) => {
        const totalDirectChildren = directChildren.length;
        const objectData = relatedObjects.find(obj => obj.object.id === objectId);
        
        if (!objectData) return;
        
        // Calculate radius (slightly smaller than primary)
        const objectRadius = primaryRadius * 0.85;
        
        // Calculate distance from parent center based on relationship type
        const relationshipType = objectData.relationshipType;
        
        // Distance factor based on relationship type
        let distanceFactor: number;
        switch (relationshipType) {
          case 'inner':
            distanceFactor = 0.7;  // 30% overlap
            break;
          case 'left':
            distanceFactor = 0.4;  // 60% containment 
            break;
          case 'right':
            distanceFactor = 1.5;  // Less overlap
            break;
          case 'outer':
            distanceFactor = 1.8;  // Minimal overlap
            break;
          default:
            distanceFactor = 1.2;
        }
        
        // Calculate angle for positioning
        let angle: number;
        if (totalDirectChildren === 1) {
          // Single child - place to the right
          angle = 0;
        } else {
          // Multiple children - distribute in semi-circle to the right
          const angleRange = Math.PI; // 180 degrees
          angle = -angleRange/2 + (angleRange / (totalDirectChildren - 1)) * index;
        }
        
        // Calculate position
        const distance = (primaryRadius + objectRadius) * distanceFactor;
        const primaryPosition = positions[primaryObject.id];
        
        positions[objectId] = {
          x: primaryPosition.x + Math.cos(angle) * distance,
          y: primaryPosition.y + Math.sin(angle) * distance,
          radius: objectRadius
        };
      });
      
      // Place objects at deeper levels
      for (let level = 2; level <= maxDepth; level++) {
        const objectsAtLevel = objectsByLevel[level] || [];
        const parentLevel = level - 1;
        
        objectsAtLevel.forEach((objectId, index) => {
          const objectData = relatedObjects.find(obj => obj.object.id === objectId);
          if (!objectData || !objectData.parentId) return;
          
          const parentId = objectData.parentId;
          const parentPosition = positions[parentId];
          
          if (!parentPosition) {
            // Skip silently - this can happen with invalid parentId references
            return;
          }
          
          // Calculate radius for this object (gradually smaller)
          const objectRadius = parentPosition.radius * 0.8;
          
          // Calculate position based on relationship type
          const relationshipType = objectData.relationshipType;
          
          // Distance factor based on relationship type
          let distanceFactor: number;
          switch (relationshipType) {
            case 'inner':
              distanceFactor = 0.7;  // 30% overlap
              break;
            case 'left':
              distanceFactor = 0.4;  // 60% containment 
              break;
            case 'right':
              distanceFactor = 1.5;  // Less overlap
              break;
            case 'outer':
              distanceFactor = 1.8;  // Minimal overlap
              break;
            default:
              distanceFactor = 1.2;
          }
          
          // Find other objects with the same parent
          const siblingsWithSameParent = relatedObjects
            .filter(obj => obj.parentId === parentId)
            .map(obj => obj.object.id);
          
          const totalSiblings = siblingsWithSameParent.length;
          const siblingIndex = siblingsWithSameParent.indexOf(objectId);
          
          // Calculate angle for positioning
          let angle: number;
          if (totalSiblings === 1) {
            // Single child - place to the right
            angle = 0;
          } else {
            // Multiple children - distribute in semi-circle to the right
            const angleRange = Math.PI; // 180 degrees
            angle = -angleRange/2 + (angleRange / (totalSiblings - 1)) * siblingIndex;
          }
          
          // Calculate position
          const distance = (parentPosition.radius + objectRadius) * distanceFactor;
          
          positions[objectId] = {
            x: parentPosition.x + Math.cos(angle) * distance,
            y: parentPosition.y + Math.sin(angle) * distance,
            radius: objectRadius
          };
        });
      }
      
      return positions;
    };
    
    const objectPositions = calculateObjectPositions();
    
    // Draw all objects
    Object.entries(objectPositions).forEach(([objectId, position]) => {
      const object = objectId === primaryObject.id ? primaryObject : objectsById.get(objectId);
      if (!object) return;
      
      // Draw circle
      svg.append('circle')
        .attr('cx', position.x)
        .attr('cy', position.y)
        .attr('r', position.radius)
        .attr('fill', `${object.color}30`)
        .attr('stroke', object.color)
        .attr('stroke-width', 2);
      
      // Draw label
      svg.append('text')
        .attr('x', position.x)
        .attr('y', position.y)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('fill', object.color)
        .attr('font-weight', 'bold')
        .attr('font-size', position.radius / 3)
        .text(object.letter);
      
      // Draw name
      svg.append('text')
        .attr('x', position.x)
        .attr('y', position.y + position.radius + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(object.label);
    });
    
    // Draw relationships separately after all objects are drawn
    Object.entries(objectPositions).forEach(([objectId, position]) => {
      // Only draw relationships for non-primary objects
      if (objectId !== primaryObject.id) {
        const object = objectsById.get(objectId);
        if (!object) return;
        
        // Find this object's data
        const objectData = relatedObjects.find(r => r.object.id === objectId);
        if (!objectData) return;
        
        // Get parent id (either explicitly set or use primary object as default)
        const parentId = objectData.parentId || primaryObject.id;
        
        // Safely get parent position 
        const parentPosition = objectPositions[parentId];
        if (!parentPosition) return; // Skip if parent position isn't available
        
        // Get relationship type
        const relationshipType = objectData.relationshipType;
        
        // Get the parent letter
        const parentLetter = parentId === primaryObject.id 
          ? primaryObject.letter 
          : relatedObjects.find(r => r.object.id === parentId)?.letter || 'X';
        
        // Draw the relationship visualization
        drawRelationship(
          svg,
          parentPosition.x, parentPosition.y, parentPosition.radius,
          position.x, position.y, position.radius,
          relationshipType,
          parentLetter,
          object.letter
        );
      }
    });
    
    // Add a legend at the bottom
    drawLegend(svg, innerWidth / 2 - 180, innerHeight + 20);

  }, [primaryObject, relatedObjects, width, height]);
  
  // Helper function to draw all relationship types
  const drawRelationship = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number,
    type: string,
    sourceLetter: string,
    targetLetter: string
  ) => {
    const color = getJoinColor(type);
    const relationshipId = `rel-${Math.random().toString(36).substring(2, 9)}`;
    
    // Calculate midpoint for labels
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Calculate distance between centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Angle between the two circles
    const angle = Math.atan2(dy, dx);
    
    // Add relationship label
    const labelOffset = 20;
    const labelX = midX + labelOffset * Math.sin(angle);
    const labelY = midY - labelOffset * Math.cos(angle);
    
    // Add connection line
    const line = svg.append('line')
      .attr('x1', x1 + r1 * Math.cos(angle))
      .attr('y1', y1 + r1 * Math.sin(angle))
      .attr('x2', x2 - r2 * Math.cos(angle))
      .attr('y2', y2 - r2 * Math.sin(angle))
      .attr('stroke', color)
      .attr('stroke-width', 1.5);
    
    // Draw the appropriate join visualization
    switch(type) {
      case 'inner':
        drawInnerJoin(svg, x1, y1, r1, x2, y2, r2, color, relationshipId);
        break;
      case 'left':
        drawLeftJoin(svg, x1, y1, r1, x2, y2, r2, color, relationshipId);
        break;
      case 'right':
        drawRightJoin(svg, x1, y1, r1, x2, y2, r2, color, relationshipId);
        break;
      case 'outer':
        drawOuterJoin(svg, x1, y1, r1, x2, y2, r2, color, relationshipId);
        break;
    }
    
    // Add join label
    svg.append('text')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', color)
      .text(getJoinLabel(type));
    
    // Add explaining text
    const descriptionY = midY + labelOffset * 2;
    svg.append('text')
      .attr('x', midX)
      .attr('y', descriptionY)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#555')
      .text(getJoinDescription(type, sourceLetter, targetLetter));
  };
  
  // Helper to draw inner join visualization (only matching records)
  const drawInnerJoin = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number,
    color: string,
    id: string
  ) => {
    const uniqueId = `${id}-inner`;
    // Calculate distance between circles
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Set up a reasonable overlap distance that shows clear intersection
    // For inner join, we want circles to genuinely overlap
    const overlapDistance = (r1 + r2) * 0.6; // 40% overlap
    
    // Adjust positions to ensure proper overlap visualization
    const angle = Math.atan2(dy, dx);
    const magnitude = distance / 2;
    
    // Position circles closer for better visualization
    const adjustedX1 = x1 + Math.cos(angle) * (magnitude - overlapDistance/2);
    const adjustedY1 = y1 + Math.sin(angle) * (magnitude - overlapDistance/2);
    const adjustedX2 = x2 - Math.cos(angle) * (magnitude - overlapDistance/2);
    const adjustedY2 = y2 - Math.sin(angle) * (magnitude - overlapDistance/2);
    
    // Draw both circles with lower opacity
    svg.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1)
      .attr('fill', color)
      .attr('fill-opacity', 0.1)
      .attr('stroke', color)
      .attr('stroke-width', 1);
      
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.1)
      .attr('stroke', color)
      .attr('stroke-width', 1);
    
    // Create clip path for the intersection
    const defs = svg.append('defs');
    const clip1 = defs.append('clipPath')
      .attr('id', `${uniqueId}-clip1`);
    
    clip1.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1);
    
    // Draw intersection with higher opacity to emphasize matched records
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.5)
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('clip-path', `url(#${uniqueId}-clip1)`);
    
    // Add arrow indicator for INNER JOIN to emphasize inclusion of ONLY matching records
    const midX = (adjustedX1 + adjustedX2) / 2;
    const midY = (adjustedY1 + adjustedY2) / 2;
    
    // Add a visual indicator showing this is an INNER JOIN
    svg.append('circle')
      .attr('cx', midX)
      .attr('cy', midY)
      .attr('r', Math.min(r1, r2) * 0.15)
      .attr('fill', color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
      
    // Add text label to indicate what's included
    svg.append('text')
      .attr('x', midX)
      .attr('y', midY + r1 * 0.7)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', color)
      .attr('font-weight', 'bold')
      .text('Only matching records');
  };
  
  // Helper to draw left join visualization (all records from left table plus matching from right)
  const drawLeftJoin = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number,
    color: string,
    id: string
  ) => {
    const uniqueId = `${id}-left`;
    
    // Calculate distance and angle
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Set overlap percentage for better visualization
    const overlapPercentage = 0.35; // 35% overlap
    
    // Adjust positions for better visualization
    const magnitude = distance / 2;
    const adjustedX1 = x1 + Math.cos(angle) * (magnitude - r1 * 0.7);
    const adjustedY1 = y1 + Math.sin(angle) * (magnitude - r1 * 0.7);
    const adjustedX2 = x2 - Math.cos(angle) * (magnitude - r2 * 0.3);
    const adjustedY2 = y2 - Math.sin(angle) * (magnitude - r2 * 0.3);
    
    // LEFT JOIN: Highlight the entire left circle (all left table records included)
    svg.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1)
      .attr('fill', color)
      .attr('fill-opacity', 0.25) // Higher opacity for left circle to emphasize inclusion
      .attr('stroke', color)
      .attr('stroke-width', 2);
    
    // Draw right circle with lower opacity (only matching records included)
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.05)
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,2'); // Dashed line for right circle
    
    // Create clip path to show intersection
    const defs = svg.append('defs');
    const clip1 = defs.append('clipPath')
      .attr('id', `${uniqueId}-clip1`);
    
    clip1.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1);
    
    // Draw intersection area with slightly higher opacity
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.3)
      .attr('clip-path', `url(#${uniqueId}-clip1)`);
    
    // Add a LEFT directional arrow to indicate inclusion direction
    const arrowX = adjustedX1 - r1 * 0.5;
    const arrowY = adjustedY1;
    
    // Draw direction indicator arrow
    svg.append('path')
      .attr('d', `M ${arrowX-10} ${arrowY} L ${arrowX} ${arrowY} L ${arrowX-5} ${arrowY-5} M ${arrowX} ${arrowY} L ${arrowX-5} ${arrowY+5}`)
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none');
      
    // Add text label indicating what's included
    svg.append('text')
      .attr('x', adjustedX1)
      .attr('y', adjustedY1 + r1 * 0.7)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', color)
      .attr('font-weight', 'bold')
      .text('All left records + matching right');
  };
  
  // Helper to draw right join visualization (all records from right table plus matching from left)
  const drawRightJoin = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number,
    color: string,
    id: string
  ) => {
    const uniqueId = `${id}-right`;
    
    // Calculate distance and angle
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Adjust positions for better visualization
    const magnitude = distance / 2;
    const adjustedX1 = x1 + Math.cos(angle) * (magnitude - r1 * 0.3);
    const adjustedY1 = y1 + Math.sin(angle) * (magnitude - r1 * 0.3);
    const adjustedX2 = x2 - Math.cos(angle) * (magnitude - r2 * 0.7);
    const adjustedY2 = y2 - Math.sin(angle) * (magnitude - r2 * 0.7);
    
    // RIGHT JOIN: Draw left circle with lower opacity (only matching records)
    svg.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1)
      .attr('fill', color)
      .attr('fill-opacity', 0.05)
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,2'); // Dashed line for left circle
    
    // Highlight the entire right circle (all right table records included)
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.25) // Higher opacity for right circle
      .attr('stroke', color)
      .attr('stroke-width', 2);
    
    // Create clip path to show intersection
    const defs = svg.append('defs');
    const clip1 = defs.append('clipPath')
      .attr('id', `${uniqueId}-clip1`);
    
    clip1.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2);
    
    // Draw intersection area with slightly higher opacity
    svg.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1)
      .attr('fill', color)
      .attr('fill-opacity', 0.3)
      .attr('clip-path', `url(#${uniqueId}-clip1)`);
    
    // Add a RIGHT directional arrow to indicate inclusion direction
    const arrowX = adjustedX2 + r2 * 0.5;
    const arrowY = adjustedY2;
    
    // Draw direction indicator arrow
    svg.append('path')
      .attr('d', `M ${arrowX+10} ${arrowY} L ${arrowX} ${arrowY} L ${arrowX+5} ${arrowY-5} M ${arrowX} ${arrowY} L ${arrowX+5} ${arrowY+5}`)
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none');
      
    // Add text label indicating what's included
    svg.append('text')
      .attr('x', adjustedX2)
      .attr('y', adjustedY2 + r2 * 0.7)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', color)
      .attr('font-weight', 'bold')
      .text('All right records + matching left');
  };
  
  // Helper to draw outer join visualization (all records from both tables)
  const drawOuterJoin = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number,
    color: string,
    id: string
  ) => {
    const uniqueId = `${id}-outer`;
    
    // Calculate distance and angle
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Adjust positions for better visualization
    const magnitude = distance / 2;
    const adjustedX1 = x1 + Math.cos(angle) * (magnitude - r1 * 0.5);
    const adjustedY1 = y1 + Math.sin(angle) * (magnitude - r1 * 0.5);
    const adjustedX2 = x2 - Math.cos(angle) * (magnitude - r2 * 0.5);
    const adjustedY2 = y2 - Math.sin(angle) * (magnitude - r2 * 0.5);
    
    // OUTER JOIN: Draw both circles with equal opacity (all records included)
    svg.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1)
      .attr('fill', color)
      .attr('fill-opacity', 0.2)
      .attr('stroke', color)
      .attr('stroke-width', 1.5);
    
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.2)
      .attr('stroke', color)
      .attr('stroke-width', 1.5);
    
    // Create clip path for intersection
    const defs = svg.append('defs');
    const clip1 = defs.append('clipPath')
      .attr('id', `${uniqueId}-clip1`);
    
    clip1.append('circle')
      .attr('cx', adjustedX1)
      .attr('cy', adjustedY1)
      .attr('r', r1);
    
    // Draw intersection with same opacity
    svg.append('circle')
      .attr('cx', adjustedX2)
      .attr('cy', adjustedY2)
      .attr('r', r2)
      .attr('fill', color)
      .attr('fill-opacity', 0.2)
      .attr('stroke', 'none')
      .attr('clip-path', `url(#${uniqueId}-clip1)`);
    
    // Draw outer envelope to indicate all records from both are included
    const padding = Math.max(r1, r2) * 0.15;
    const outerEnvelope = calculateOuterEnvelope(
      adjustedX1, adjustedY1, r1 + padding,
      adjustedX2, adjustedY2, r2 + padding
    );
    
    svg.append('path')
      .attr('d', outerEnvelope)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3');
    
    // Add bidirectional arrows to indicate inclusion from both sides
    const arrowX1 = adjustedX1 - r1 * 0.7;
    const arrowX2 = adjustedX2 + r2 * 0.7;
    const arrowY = (adjustedY1 + adjustedY2) / 2;
    
    // Draw bidirectional arrow indicator
    svg.append('path')
      .attr('d', `M ${arrowX1-7} ${arrowY} L ${arrowX1+7} ${arrowY} L ${arrowX1+2} ${arrowY-5} M ${arrowX1+7} ${arrowY} L ${arrowX1+2} ${arrowY+5}`)
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none');
      
    svg.append('path')
      .attr('d', `M ${arrowX2+7} ${arrowY} L ${arrowX2-7} ${arrowY} L ${arrowX2-2} ${arrowY-5} M ${arrowX2-7} ${arrowY} L ${arrowX2-2} ${arrowY+5}`)
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none');
      
    // Add text label indicating what's included
    svg.append('text')
      .attr('x', (adjustedX1 + adjustedX2) / 2)
      .attr('y', adjustedY1 + r1 * 0.9)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', color)
      .attr('font-weight', 'bold')
      .text('All records from both tables');
  };
  
  // Helper to calculate a smooth envelope path that encompasses both circles
  const calculateOuterEnvelope = (
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): string => {
    // Calculate bounding box with padding
    const padding = Math.min(r1, r2) * 0.2;
    const minX = Math.min(x1 - r1, x2 - r2) - padding;
    const maxX = Math.max(x1 + r1, x2 + r2) + padding;
    const minY = Math.min(y1 - r1, y2 - r2) - padding;
    const maxY = Math.max(y1 + r1, y2 + r2) + padding;
    
    // Calculate control points for a smoother envelope
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI/2;
    
    const width = maxX - minX;
    const height = maxY - minY;
    const cornerRadius = Math.min(width, height) * 0.2;
    
    // Create a smooth, rounded path that wraps both circles
    return `
      M ${minX + cornerRadius} ${minY}
      L ${maxX - cornerRadius} ${minY}
      Q ${maxX} ${minY} ${maxX} ${minY + cornerRadius}
      L ${maxX} ${maxY - cornerRadius}
      Q ${maxX} ${maxY} ${maxX - cornerRadius} ${maxY}
      L ${minX + cornerRadius} ${maxY}
      Q ${minX} ${maxY} ${minX} ${maxY - cornerRadius}
      L ${minX} ${minY + cornerRadius}
      Q ${minX} ${minY} ${minX + cornerRadius} ${minY}
    `;
  };
  
  // Helper to calculate intersection path for inner join
  const calculateIntersectionPath = (
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): string => {
    // Calculate distance between centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    // If circles are too far apart or one is contained in the other, return empty path
    if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
      return '';
    }
    
    // Calculate intersection points
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    
    // Calculate the intersection points
    const p2x = x1 + a * (x2 - x1) / d;
    const p2y = y1 + a * (y2 - y1) / d;
    
    const p3x = p2x + h * (y2 - y1) / d;
    const p3y = p2y - h * (x2 - x1) / d;
    
    const p4x = p2x - h * (y2 - y1) / d;
    const p4y = p2y + h * (x2 - x1) / d;
    
    // Angle calculations for arcs
    const angleCircle1 = Math.atan2(p4y - y1, p4x - x1);
    const angleCircle2 = Math.atan2(p3y - y2, p3x - x2);
    
    // Build the path
    let path = `M ${p3x} ${p3y} `;
    path += `A ${r2} ${r2} 0 1 1 ${p4x} ${p4y} `;
    path += `A ${r1} ${r1} 0 0 1 ${p3x} ${p3y} `;
    
    return path;
  };
  
  // Helper to calculate outer join path
  const calculateOuterJoinPath = (
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): string => {
    // Calculate the bounding box that contains both circles
    const minX = Math.min(x1 - r1, x2 - r2) - 5;
    const maxX = Math.max(x1 + r1, x2 + r2) + 5;
    const minY = Math.min(y1 - r1, y2 - r2) - 5;
    const maxY = Math.max(y1 + r1, y2 + r2) + 5;
    const cornerRadius = 15;
    
    // Create a rounded rectangle path
    return `
      M ${minX + cornerRadius} ${minY}
      L ${maxX - cornerRadius} ${minY}
      Q ${maxX} ${minY} ${maxX} ${minY + cornerRadius}
      L ${maxX} ${maxY - cornerRadius}
      Q ${maxX} ${maxY} ${maxX - cornerRadius} ${maxY}
      L ${minX + cornerRadius} ${maxY}
      Q ${minX} ${maxY} ${minX} ${maxY - cornerRadius}
      L ${minX} ${minY + cornerRadius}
      Q ${minX} ${minY} ${minX + cornerRadius} ${minY}
    `;
  };
  
  // Helper to draw a legend
  const drawLegend = (
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number
  ) => {
    const joinTypes = [
      { label: "INNER JOIN", color: "#5C6BC0", description: "Records matching in both tables" },
      { label: "LEFT JOIN", color: "#43A047", description: "All left table records + matching right" },
      { label: "RIGHT JOIN", color: "#E53935", description: "All right table records + matching left" },
      { label: "OUTER JOIN", color: "#7E57C2", description: "All records from both tables" },
    ];
    
    const legend = svg.append('g')
      .attr('transform', `translate(${x}, ${y})`);
    
    // Title
    legend.append('text')
      .attr('x', 0)
      .attr('y', -15)
      .attr('font-weight', 'bold')
      .attr('font-size', 10)
      .text('SQL JOIN TYPES:');
    
    // Items
    joinTypes.forEach((join, i) => {
      const itemX = i * 90;
      
      // Color box
      legend.append('rect')
        .attr('x', itemX)
        .attr('y', -8)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', join.color)
        .attr('rx', 2);
      
      // Label
      legend.append('text')
        .attr('x', itemX + 15)
        .attr('y', 0)
        .attr('font-size', 8)
        .attr('font-weight', 'bold')
        .text(join.label);
    });
  };
  
  // Helper to get color for join type
  const getJoinColor = (type: string): string => {
    switch(type) {
      case 'inner': return '#5C6BC0'; // Indigo
      case 'left': return '#43A047';  // Green
      case 'right': return '#E53935'; // Red
      case 'outer': return '#7E57C2'; // Purple
      default: return '#757575';      // Gray
    }
  };
  
  // Helper to get label for join type
  const getJoinLabel = (type: string): string => {
    switch(type) {
      case 'inner': return 'INNER JOIN';
      case 'left': return 'LEFT JOIN';
      case 'right': return 'RIGHT JOIN';
      case 'outer': return 'OUTER JOIN';
      default: return 'JOIN';
    }
  };
  
  // Helper to get description for join type
  const getJoinDescription = (type: string, source: string, target: string): string => {
    switch(type) {
      case 'inner': return `Records that exist in both ${source} and ${target}`;
      case 'left': return `All ${source} records with matching ${target}`;
      case 'right': return `All ${target} records with matching ${source}`;
      case 'outer': return `All records from both ${source} and ${target}`;
      default: return '';
    }
  };

  return (
    <div className="venn-diagram-container">
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};

export default VennDiagram;