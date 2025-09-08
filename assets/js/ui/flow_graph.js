/**
 * 🌊 FLOW GRAPH VISUALIZATION
 * Интерактивная визуализация потока выполнения программы
 */

export const FlowGraph = {
    canvas: null,
    ctx: null,
    nodes: [],
    edges: [],
    selectedNode: null,
    scale: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    
    init(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.canvas.style.background = 'var(--bg)';
        this.canvas.style.border = '1px solid rgba(73, 247, 194, 0.3)';
        this.canvas.style.borderRadius = '8px';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
    },
    
    setupEventListeners() {
        // Mouse wheel for zooming
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale = Math.max(0.1, Math.min(3, this.scale * delta));
            this.render();
        });
        
        // Mouse drag for panning
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.panX = e.clientX - this.dragStart.x;
                this.panY = e.clientY - this.dragStart.y;
                this.render();
            } else {
                // Hover effects
                const node = this.getNodeAtPoint(e.clientX, e.clientY);
                if (node !== this.selectedNode) {
                    this.selectedNode = node;
                    this.render();
                }
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('click', (e) => {
            const node = this.getNodeAtPoint(e.clientX, e.clientY);
            if (node) {
                this.onNodeClick(node);
            }
        });
    },
    
    generateFlowGraph(disasm) {
        this.nodes = [];
        this.edges = [];
        
        // Analyze basic blocks
        const basicBlocks = this.findBasicBlocks(disasm);
        
        // Create nodes for each basic block
        basicBlocks.forEach((block, index) => {
            const node = {
                id: index,
                startAddr: block.start,
                endAddr: block.end,
                instructions: block.instructions,
                x: (index % 4) * 200 + 100,
                y: Math.floor(index / 4) * 150 + 100,
                width: 180,
                height: block.instructions.length * 20 + 40,
                type: this.getBlockType(block)
            };
            this.nodes.push(node);
        });
        
        // Create edges for control flow
        this.nodes.forEach(node => {
            const lastInstr = node.instructions[node.instructions.length - 1];
            const targets = this.findJumpTargets(lastInstr);
            
            targets.forEach(target => {
                const targetNode = this.nodes.find(n => 
                    target >= n.startAddr && target <= n.endAddr
                );
                
                if (targetNode) {
                    this.edges.push({
                        from: node.id,
                        to: targetNode.id,
                        type: this.getEdgeType(lastInstr),
                        condition: this.getJumpCondition(lastInstr)
                    });
                }
            });
        });
        
        this.render();
    },
    
    findBasicBlocks(disasm) {
        const blocks = [];
        let currentBlock = { start: 0, end: 0, instructions: [] };
        
        for (let i = 0; i < disasm.length; i++) {
            const instr = disasm[i];
            currentBlock.instructions.push(instr);
            
            // Check if this instruction ends a basic block
            if (this.isBlockTerminator(instr) || i === disasm.length - 1) {
                currentBlock.end = instr.a;
                blocks.push({ ...currentBlock });
                
                // Start new block
                if (i < disasm.length - 1) {
                    currentBlock = {
                        start: disasm[i + 1].a,
                        end: 0,
                        instructions: []
                    };
                }
            }
            
            // Check if next instruction is a jump target
            if (i < disasm.length - 1 && this.isJumpTarget(disasm[i + 1], disasm)) {
                if (currentBlock.instructions.length > 0) {
                    currentBlock.end = instr.a;
                    blocks.push({ ...currentBlock });
                    
                    currentBlock = {
                        start: disasm[i + 1].a,
                        end: 0,
                        instructions: []
                    };
                }
            }
        }
        
        return blocks;
    },
    
    isBlockTerminator(instr) {
        const asm = instr.s.toLowerCase();
        return asm.startsWith('ret') || 
               asm.startsWith('jmp') || 
               asm.match(/^j[a-z]+/) ||
               asm.startsWith('call');
    },
    
    isJumpTarget(instr, disasm) {
        // Simplified - check if any previous instruction jumps to this address
        return disasm.some(prevInstr => {
            const targets = this.findJumpTargets(prevInstr);
            return targets.includes(instr.a);
        });
    },
    
    findJumpTargets(instr) {
        const asm = instr.s.toLowerCase();
        const targets = [];
        
        // Extract hex addresses from instruction
        const hexMatch = asm.match(/0x([0-9a-f]+)/g);
        if (hexMatch) {
            hexMatch.forEach(hex => {
                targets.push(parseInt(hex, 16));
            });
        }
        
        return targets;
    },
    
    getBlockType(block) {
        const lastInstr = block.instructions[block.instructions.length - 1].s.toLowerCase();
        
        if (lastInstr.startsWith('ret')) return 'exit';
        if (lastInstr.startsWith('call')) return 'call';
        if (lastInstr.startsWith('jmp')) return 'jump';
        if (lastInstr.match(/^j[a-z]+/)) return 'conditional';
        return 'normal';
    },
    
    getEdgeType(instr) {
        const asm = instr.s.toLowerCase();
        
        if (asm.startsWith('call')) return 'call';
        if (asm.startsWith('jmp')) return 'jump';
        if (asm.match(/^j[a-z]+/)) return 'conditional';
        return 'fallthrough';
    },
    
    getJumpCondition(instr) {
        const asm = instr.s.toLowerCase();
        const condMatch = asm.match(/^j([a-z]+)/);
        return condMatch ? condMatch[1] : null;
    },
    
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Save state
        ctx.save();
        
        // Apply transformations
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.scale, this.scale);
        
        // Render grid
        this.renderGrid(ctx);
        
        // Render edges first
        this.edges.forEach(edge => this.renderEdge(ctx, edge));
        
        // Render nodes
        this.nodes.forEach(node => this.renderNode(ctx, node));
        
        // Restore state
        ctx.restore();
        
        // Render UI overlay
        this.renderUI(ctx);
    },
    
    renderGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        const startX = -this.panX / this.scale;
        const startY = -this.panY / this.scale;
        const endX = startX + this.canvas.width / this.scale;
        const endY = startY + this.canvas.height / this.scale;
        
        // Vertical lines
        for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    },
    
    renderNode(ctx, node) {
        const isSelected = node === this.selectedNode;
        const isHighlighted = isSelected;
        
        // Node background
        ctx.fillStyle = this.getNodeColor(node.type, isHighlighted);
        ctx.strokeStyle = isSelected ? '#49f7c2' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isSelected ? 2 : 1;
        
        // Rounded rectangle
        this.roundRect(ctx, node.x, node.y, node.width, node.height, 8);
        ctx.fill();
        ctx.stroke();
        
        // Node title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Block ${node.id}`, node.x + 8, node.y + 20);
        
        // Address range
        ctx.fillStyle = '#49f7c2';
        ctx.font = '10px monospace';
        const addrText = `${node.startAddr.toString(16).padStart(4, '0')} - ${node.endAddr.toString(16).padStart(4, '0')}`;
        ctx.fillText(addrText, node.x + 8, node.y + 35);
        
        // Instructions
        ctx.fillStyle = '#e6f1ff';
        ctx.font = '9px monospace';
        node.instructions.slice(0, 5).forEach((instr, i) => {
            const text = instr.s.length > 20 ? instr.s.substring(0, 20) + '...' : instr.s;
            ctx.fillText(text, node.x + 8, node.y + 55 + i * 12);
        });
        
        if (node.instructions.length > 5) {
            ctx.fillStyle = '#8aa2b2';
            ctx.fillText(`... +${node.instructions.length - 5} more`, node.x + 8, node.y + 55 + 5 * 12);
        }
    },
    
    renderEdge(ctx, edge) {
        const fromNode = this.nodes.find(n => n.id === edge.from);
        const toNode = this.nodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        const startX = fromNode.x + fromNode.width / 2;
        const startY = fromNode.y + fromNode.height;
        const endX = toNode.x + toNode.width / 2;
        const endY = toNode.y;
        
        // Edge styling
        ctx.strokeStyle = this.getEdgeColor(edge.type);
        ctx.lineWidth = 2;
        
        // Draw curved line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        const controlY = (startY + endY) / 2;
        ctx.bezierCurveTo(startX, controlY, endX, controlY, endX, endY);
        ctx.stroke();
        
        // Arrow head
        this.drawArrowHead(ctx, endX, endY, Math.atan2(endY - controlY, endX - endX));
        
        // Condition label
        if (edge.condition) {
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(edge.condition, midX, midY);
        }
    },
    
    getNodeColor(type, highlighted) {
        const alpha = highlighted ? 0.3 : 0.15;
        
        switch (type) {
            case 'entry': return `rgba(80, 250, 123, ${alpha})`;
            case 'exit': return `rgba(255, 92, 122, ${alpha})`;
            case 'call': return `rgba(255, 121, 198, ${alpha})`;
            case 'conditional': return `rgba(255, 184, 108, ${alpha})`;
            default: return `rgba(126, 168, 255, ${alpha})`;
        }
    },
    
    getEdgeColor(type) {
        switch (type) {
            case 'call': return '#ff79c6';
            case 'jump': return '#ffb86c';
            case 'conditional': return '#f1fa8c';
            default: return '#6272a4';
        }
    },
    
    drawArrowHead(ctx, x, y, angle) {
        const size = 8;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    },
    
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },
    
    renderUI(ctx) {
        // Zoom level indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 80, 30);
        
        ctx.fillStyle = '#49f7c2';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${(this.scale * 100).toFixed(0)}%`, 15, 30);
        
        // Instructions
        const instructions = [
            'Mouse wheel: Zoom',
            'Drag: Pan',
            'Click: Select node'
        ];
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, this.canvas.height - 70, 150, 60);
        
        ctx.fillStyle = '#e6f1ff';
        ctx.font = '10px monospace';
        instructions.forEach((instr, i) => {
            ctx.fillText(instr, 15, this.canvas.height - 55 + i * 15);
        });
    },
    
    getNodeAtPoint(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = (x - rect.left - this.panX) / this.scale;
        const canvasY = (y - rect.top - this.panY) / this.scale;
        
        return this.nodes.find(node => 
            canvasX >= node.x && 
            canvasX <= node.x + node.width &&
            canvasY >= node.y && 
            canvasY <= node.y + node.height
        );
    },
    
    onNodeClick(node) {
        console.log('Clicked node:', node);
        
        // Highlight node and show details
        this.selectedNode = node;
        this.render();
        
        // Could emit event or call callback here
        if (this.onNodeSelect) {
            this.onNodeSelect(node);
        }
    },
    
    // Center viewport on a node by id
    centerOnNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node || !this.canvas) return;
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        this.panX = this.canvas.width / 2 - centerX * this.scale;
        this.panY = this.canvas.height / 2 - centerY * this.scale;
        this.render();
    },
    
    // Find node that contains a given instruction address
    findNodeByAddress(address) {
        return this.nodes.find(n => address >= n.startAddr && address <= n.endAddr) || null;
    },
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.render();
    },
    
    reset() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.selectedNode = null;
        this.render();
    }
};
