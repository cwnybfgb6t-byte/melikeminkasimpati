const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let flowers = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

const colorPalettes = [
    { inner: '#ffe066', middle: '#ff9ebb', outer: '#ff5c8d', stem: '#2b580c' },
    { inner: '#fff3bf', middle: '#ffd8a8', outer: '#ff922b', stem: '#37b24d' },
    { inner: '#fcc2d7', middle: '#eebefa', outer: '#cc5de8', stem: '#2b580c' },
    { inner: '#ffffff', middle: '#f8f9fa', outer: '#e9ecef', stem: '#2f9e44' },
    { inner: '#ffec99', middle: '#ffae63', outer: '#e64980', stem: '#2b580c' }
];

class Chrysanthemum {
    constructor(startX) {
        this.startX = startX || Math.random() * (width - 100) + 50;
        this.palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
        
        this.maxHeight = height * (0.45 + Math.random() * 0.35);
        this.currentHeight = 0;
        this.growthSpeed = 2.5 + Math.random() * 1.8;
        
        this.curveOffset = (Math.random() - 0.5) * 80;
        this.bloomProgress = 0;
        this.maxFlowerRadius = 35 + Math.random() * 20;
        
        this.leaves = [
            { pos: 0.3, side: -1, size: 0, maxSize: 18 + Math.random() * 8 },
            { pos: 0.55, side: 1, size: 0, maxSize: 22 + Math.random() * 8 },
            { pos: 0.75, side: -1, size: 0, maxSize: 16 + Math.random() * 6 }
        ];

        this.petals = [];
        this.generatePetals();
    }

    generatePetals() {
        const layers = 5;
        const petalsPerLayer = 16;
        
        for (let l = 0; l < layers; l++) {
            const layerRadiusRatio = (l + 1) / layers;
            const count = petalsPerLayer + l * 6;
            
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + (l * 0.2);
                this.petals.push({
                    angle: angle,
                    layer: l,
                    layerRatio: layerRadiusRatio,
                    lengthRatio: 0.6 + Math.random() * 0.4,
                    widthRatio: 0.8 + Math.random() * 0.4
                });
            }
        }
    }

    update() {
        if (this.currentHeight < this.maxHeight) {
            this.currentHeight += this.growthSpeed;
        } else if (this.bloomProgress < 1) {
            this.bloomProgress += 0.015;
        }

        const currentProgress = this.currentHeight / this.maxHeight;
        this.leaves.forEach(leaf => {
            if (currentProgress > leaf.pos) {
                if (leaf.size < leaf.maxSize) {
                    leaf.size += 0.5;
                }
            }
        });
    }

    draw() {
        const startY = height;
        const endY = height - this.currentHeight;
        const midY = startY - this.currentHeight * 0.5;
        const midX = this.startX + (this.curveOffset * (this.currentHeight / this.maxHeight));

        ctx.beginPath();
        ctx.moveTo(this.startX, startY);
        ctx.quadraticCurveTo(midX, midY, midX, endY);
        ctx.strokeStyle = this.palette.stem;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        this.leaves.forEach(leaf => {
            if (leaf.size > 0) {
                const leafProg = leaf.pos;
                const ly = startY - this.currentHeight * leafProg;
                const lx = this.startX + (this.curveOffset * leafProg);
                
                ctx.save();
                ctx.translate(lx, ly);
                ctx.scale(leaf.side, 1);
                ctx.rotate(Math.PI / 4);
                
                ctx.beginPath();
                ctx.ellipse(leaf.size, 0, leaf.size, leaf.size * 0.4, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.palette.stem;
                ctx.fill();
                ctx.restore();
            }
        });

        if (this.bloomProgress > 0) {
            ctx.save();
            ctx.translate(midX, endY);

            const sortedPetals = [...this.petals].sort((a, b) => b.layer - a.layer);

            sortedPetals.forEach(petal => {
                const currentBloom = Math.min(1, this.bloomProgress * 1.2);
                const petalLen = this.maxFlowerRadius * petal.layerRatio * petal.lengthRatio * currentBloom;
                const petalWidth = (this.maxFlowerRadius * 0.18) * petal.widthRatio * currentBloom;

                ctx.save();
                ctx.rotate(petal.angle);

                let color;
                if (petal.layer === 0) color = this.palette.inner;
                else if (petal.layer < 3) color = this.palette.middle;
                else color = this.palette.outer;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(petalWidth, petalLen * 0.5, 0, petalLen);
                ctx.quadraticCurveTo(-petalWidth, petalLen * 0.5, 0, 0);

                ctx.fillStyle = color;
                ctx.shadowColor = 'rgba(0,0,0,0.15)';
                ctx.shadowBlur = 4;
                ctx.fill();
                ctx.restore();
            });

            ctx.beginPath();
            ctx.arc(0, 0, 6 * this.bloomProgress, 0, Math.PI * 2);
            ctx.fillStyle = this.palette.inner;
            ctx.fill();

            ctx.restore();
        }
    }
}

function seedGarden() {
    flowers = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            flowers.push(new Chrysanthemum());
        }, i * 350);
    }
}

document.getElementById('sproutBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    seedGarden();
});

window.addEventListener('click', (e) => {
    flowers.push(new Chrysanthemum(e.clientX));
});

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    flowers.forEach(flower => {
        flower.update();
        flower.draw();
    });

    requestAnimationFrame(animate);
}

seedGarden();
animate();
