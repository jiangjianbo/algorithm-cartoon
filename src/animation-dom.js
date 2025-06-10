'use strict';
import { Element, Path, Box, Link, AnimationFramework } from './animation.js';

/**
 * 使用DOM作为渲染框架，所有的元素都映射成一个DOM元素，包括动画元素和非动画元素
 * @param {string} rootId 根元素的id
 */
class DOMAnimationFramework extends AnimationFramework {

    constructor(rootId) {
        super();
        this.root = document.getElementById(rootId);
        if (!this.root) {
            throw new Error(`Root element with id "${rootId}" not found`);
          }
          this.elementMap = new Map(); // 确保 elementMap 被初始化
    }

    // 创建DOM元素并应用样式
    createDOMElement(type, element) {
        const domElement = document.createElement(type);
        this.applyStyle(domElement, element);
        this.root.appendChild(domElement);
        this.elementMap.set(element.id, domElement);
        return domElement;
    }

    // 应用元素样式到DOM节点
    applyStyle(domElement, element) {
        const style = element.style;
        domElement.style.position = 'absolute';
        domElement.style.left = `${element.x}px`;
        domElement.style.top = `${element.y}px`;
        domElement.style.borderColor = style.borderColor;
        domElement.style.borderWidth = `${style.borderWidth}px`;
        domElement.style.borderStyle = style.borderStyle;
        domElement.style.backgroundColor = style.backgroundColor;
        domElement.style.display = element.visible ? 'block' : 'none';

        // 应用闪烁效果
        if (this.flashingElements.includes(element)) {
            domElement.classList.add('flashing');
        } else {
            domElement.classList.remove('flashing');
        }
    }

    // 绘制Box元素
    drawBox(box) {
        let domElement = this.elementMap.get(box.id);
        if (!domElement) {
            domElement = this.createDOMElement('div', box);
            domElement.style.width = `${box.width}px`;
            domElement.style.height = `${box.height}px`;
        }
        this.applyStyle(domElement, box);
    }

    // 绘制Link元素
    drawLink(link) {
        let domElement = this.elementMap.get(link.id);
        const path = link.path;
        const start = path.getStartPoint();
        const end = path.getEndPoint();

        // 计算连接线的长度和角度
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        if (!domElement) {
            domElement = this.createDOMElement('div', link);
            domElement.className = 'link-element';
            // 使用transform实现连接线
            domElement.style.height = '2px'; // 线宽
            domElement.style.transformOrigin = '0 50%';
        }

        this.applyStyle(domElement, link);
        domElement.style.width = `${length}px`;
        domElement.style.transform = `rotate(${angle}deg)`;

        // 绘制箭头（使用伪元素）
        if (link.startArrow || link.endArrow) {
            domElement.dataset.arrows = `${link.startArrow},${link.endArrow}`;
        }
    }

    // 元素沿路径移动
    moveBy(element, path, duration) {
        const startPoint = path.getStartPoint();
        const endPoint = path.getEndPoint();
        const startX = element.x;
        const startY = element.y;
        const startTime = performance.now();

        const animate = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 线性插值计算当前位置
            const currentX = startX + (endPoint.x - startPoint.x) * progress;
            const currentY = startY + (endPoint.y - startPoint.y) * progress;

            element.moveTo(currentX, currentY);

            // 更新DOM位置
            const domElement = this.elementMap.get(element.id);
            if (domElement) {
                domElement.style.left = `${currentX}px`;
                domElement.style.top = `${currentY}px`;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // 添加闪烁效果
    addFlash(element) {
        super.addFlash(element);
        const domElement = this.elementMap.get(element.id);
        if (domElement) {
            domElement.classList.add('flashing');
        }
    }

    // 移除闪烁效果
    removeFlash(element) {
        super.removeFlash(element);
        const domElement = this.elementMap.get(element.id);
        if (domElement) {
            domElement.classList.remove('flashing');
        }
    }

    // 更新所有元素
    update() {
        // 绘制所有元素
        this.elements.forEach(element => {
            element.draw(this);
        });

        // 绘制临时对象
        this.temporaryObjects.forEach(element => {
            element.draw(this);
        });

        requestAnimationFrame(() => this.update());
    }

    // 移除元素
    removeElement(elementId) {
        const domElement = this.elementMap.get(elementId);
        if (domElement && domElement.parentNode) {
            domElement.parentNode.removeChild(domElement);
        }
        this.elementMap.delete(elementId);
        super.removeElement(elementId);
    }
}

// 添加全局样式（如果需要）
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (!document.querySelector('#animation-framework-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-framework-styles';
        style.textContent = `
        .flashing {
            animation: flash 0.5s infinite alternate;
        }
        
        @keyframes flash {
            from { border-color: red; }
            to { border-color: inherit; }
        }
        
        .link-element {
            position: absolute;
            pointer-events: none;
        }
        
        .link-element[data-arrows="true,true"]::before,
        .link-element[data-arrows="true,true"]::after,
        .link-element[data-arrows="true,false"]::before,
        .link-element[data-arrows="false,true"]::after {
            content: '';
            position: absolute;
            top: -4px;
            width: 0;
            height: 0;
            border-style: solid;
        }
        
        .link-element[data-arrows="true,true"]::before,
        .link-element[data-arrows="true,false"]::before {
            left: 0;
            border-width: 4px 8px 4px 0;
            border-color: transparent currentColor transparent transparent;
        }
        
        .link-element[data-arrows="true,true"]::after,
        .link-element[data-arrows="false,true"]::after {
            right: 0;
            border-width: 4px 0 4px 8px;
            border-color: transparent transparent transparent currentColor;
        }
    `;
        document.head.appendChild(style);
    }
}

export { DOMAnimationFramework };
