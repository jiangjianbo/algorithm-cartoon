'use strict';

import {Element, Path, Box, Link, AnimationFramework} from './animation.js';


class CanvasAnimationFramework extends AnimationFramework  {
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
    }

    drawLink(link) {
        if (!link.visible) return;
        framework.beginPath();
        framework.activeDrawStyle(link, link.style);

        let path = link.path;
        framework.moveTo(path.getStartPoint().x, path.getStartPoint().y);
        for (let i = 1; i < path.points.length; i++) {
            framework.lineTo(path.points[i].x, path.points[i].y);
        }

        if (link.startArrow) {
            framework.moveTo(path.getStartPoint().x, path.getStartPoint().y);
            framework.lineTo(path.getStartPoint().x + 10, path.getStartPoint().y + 5);
            framework.lineTo(path.getStartPoint().x + 10, path.getStartPoint().y - 5);
        }
        
        if (link.endArrow) {
            framework.moveTo(path.getEndPoint().x, path.getEndPoint().y);
            framework.lineTo(path.getEndPoint().x - 10, path.getEndPoint().y + 5);
            framework.lineTo(path.getEndPoint().x - 10, path.getEndPoint().y - 5);
        }

        framework.stroke();
    }

    drawBox(box) {
        if (!box.visible) return;
        this.context.beginPath();
        this.context.rect(box.x, box.y, box.width, box.height);
        this.activeDrawStyle(box, box.style);
        this.context.stroke();
    }

    moveBy(element, path, duration) {
        const startX = element.x;
        const startY = element.y;
        const endX = path.getEndPoint().x;
        const endY = path.getEndPoint().y;

        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            element.moveTo(
                startX + (endX - startX) * progress,
                startY + (endY - startY) * progress
            );

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    activeDrawStyle(element, style) {
        let borderColor = style.borderColor;
        let borderWidth = style.borderWidth;
        let borderStyle = style.borderStyle;

        if (this.flashingElements.includes(element.id)) {
            const flashInterval = 500; // 闪烁间隔
            const now = Date.now();
            const flashState = Math.floor((now % (2 * flashInterval)) / flashInterval);

            if (flashState === 0) {
                borderColor = 'red'; // 闪烁时的边框颜色
            } else {
                borderColor = 'black'; // 默认边框颜色
            }
        }

        this.context.strokeStyle = borderColor;
        this.context.lineWidth = borderWidth;
        if (borderStyle === 'dashed') {
            this.context.setLineDash([5, 10]);
        } else {
            this.context.setLineDash([]);
        }
    }

    update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制所有元素
        this.elements.forEach(element => {
            this.drawStyle(element.id, element.constructor.name, element.style);
            element.draw(this.context);
        });

        // 绘制临时对象
        this.temporaryObjects.forEach(element => {
            this.drawStyle(element.id, element.constructor.name, element.style);
            element.draw(this.context);
        });

        requestAnimationFrame(() => this.update());
    }

    beginPath(){
        this.context.beginPath();
    }

    rect(x, y, width, height){
        this.context.rect(x, y, width, height);
    }
    
    stroke(){
        this.context.stroke();
    }

    moveTo(x, y){
        this.context.moveTo(x, y);
    }

    lineTo(x, y) {
        this.context.lineTo(x, y);
    }
}



// export
export { CanvasAnimationFramework };

/*
// 使用示例
const framework = new AnimationFramework();
const box1 = new Box(50, 50, 100, 100);
const box2 = new Box(200, 200, 100, 100);

const link = framework.createLink(box1, box2, 'dashed', false, true);

framework.addElement(box1);
framework.addElement(box2);
framework.addElement(link);

box1.flash(); // 方框闪烁
box1.moveBy(link.path, 2000); // 方框沿着路径移动

framework.update();
*/
