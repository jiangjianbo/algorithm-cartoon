'use strict';

import { Element, Path, Box, Link, AnimationFramework } from './animation.js';

/**
 * Canvas渲染的动画框架实现
 * @extends AnimationFramework
 */
class CanvasAnimationFramework extends AnimationFramework {
    /**
     * 创建Canvas动画框架实例
     * @param {string} canvasId - HTML Canvas元素的ID
     * @throws {Error} 如果找不到指定ID的Canvas元素
     */
    constructor(canvasId) {
        super();
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);

        if (!this.canvas) {
            throw new Error(`无法找到ID为 "${canvasId}" 的Canvas元素`);
        }

        this.context = this.canvas.getContext('2d');
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
    }

    /**
     * 绘制链接元素
     * @param {Link} link - 要绘制的链接元素
     */
    drawLink(link) {
        if (!link.visible) return;
        this.beginPath();
        this.activeDrawStyle(link, link.style);

        const path = link.path;
        this.moveTo(path.getStartPoint().x, path.getStartPoint().y);

        for (let i = 1; i < path.points.length; i++) {
            this.lineTo(path.points[i].x, path.points[i].y);
        }

        this.drawArrows(link, path);
        this.stroke();
    }

    /**
     * 绘制箭头（私有方法）
     * @param {Link} link - 链接元素
     * @param {Path} path - 路径对象
     */
    drawArrows(link, path) {
        if (link.startArrow) {
            this.moveTo(path.getStartPoint().x, path.getStartPoint().y);
            this.lineTo(path.getStartPoint().x + 10, path.getStartPoint().y + 5);
            this.lineTo(path.getStartPoint().x + 10, path.getStartPoint().y - 5);
            this.closePath();
        }

        if (link.endArrow) {
            this.moveTo(path.getEndPoint().x, path.getEndPoint().y);
            this.lineTo(path.getEndPoint().x - 10, path.getEndPoint().y + 5);
            this.lineTo(path.getEndPoint().x - 10, path.getEndPoint().y - 5);
            this.closePath();
        }
    }

    /**
     * 绘制矩形元素
     * @param {Box} box - 要绘制的矩形元素
     */
    drawBox(box) {
        if (!box.visible) return;
        this.beginPath();
        this.rect(box.x, box.y, box.width, box.height);
        this.activeDrawStyle(box, box.style);

        // 处理填充样式
        if (box.style.backgroundColor !== 'transparent') {
            this.context.fillStyle = box.style.backgroundColor;
            this.context.fill();
        }

        this.stroke();
    }

    /**
     * 让元素沿路径移动
     * @param {Element} element - 要移动的元素
     * @param {Path} path - 移动路径
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {function} [completeCallback] - 动画完成回调
     */
    moveBy(element, path, duration, completeCallback) {
        if (!(element instanceof Element) || !(path instanceof Path)) {
            throw new TypeError('moveBy参数类型错误');
        }
        if (typeof duration !== 'number' || duration <= 0) {
            throw new TypeError('duration参数类型错误');
        }

        // 使用followPath方法实现移动
        this.followPath(
            path,
            (x, y, stepIndex, segmentIndex, loopCount, direction) => {
                // 更新元素位置
                element.moveTo(x, y);

                // 更新Canvas渲染
                this.render();
            },
            'forward',
            duration,
            completeCallback
        );
    }

    /**
     * 应用元素样式
     * @param {Element} element - 当前元素
     * @param {Object} style - 样式对象
     */
    activeDrawStyle(element, style) {
        let borderColor = style.borderColor;
        let borderWidth = style.borderWidth;
        let borderStyle = style.borderStyle;

        // 处理闪烁效果
        if (this.flashingElements.includes(element)) {
            const flashInterval = 500; // 闪烁间隔
            const flashState = Math.floor((Date.now() % (2 * flashInterval)) / flashInterval);
            borderColor = flashState === 0 ? 'red' : style.borderColor;
        }

        this.context.strokeStyle = borderColor;
        this.context.lineWidth = borderWidth;

        // 应用线条样式
        if (borderStyle === 'dashed') {
            this.context.setLineDash([5, 10]);
        } else if (borderStyle === 'dotted') {
            this.context.setLineDash([2, 5]);
        } else {
            this.context.setLineDash([]);
        }
    }

    /**
     * 更新画布内容（带节流控制）
     * @param {number} [timestamp] - 动画时间戳
     */
    update(timestamp = performance.now()) {
        // 实现节流，控制帧率
        if (timestamp - this.lastFrameTime < this.frameInterval) {
            requestAnimationFrame(this.update.bind(this));
            return;
        }

        this.lastFrameTime = timestamp;

        // 清除画布
        this.doUpdate();

        requestAnimationFrame(this.update.bind(this));
    }

    doUpdate() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制所有元素
        this.elements.forEach(element => {
            this.activeDrawStyle(element, element.style);
            element.draw(this);
        });

        // 绘制临时对象
        this.temporaryObjects.forEach(element => {
            this.activeDrawStyle(element, element.style);
            element.draw(this);
        });
    }

    // Canvas上下文代理方法
    beginPath() {
        this.context.beginPath();
    }

    closePath() {
        this.context.closePath();
    }

    rect(x, y, width, height) {
        this.context.rect(x, y, width, height);
    }

    stroke() {
        this.context.stroke();
    }

    moveTo(x, y) {
        this.context.moveTo(x, y);
    }

    lineTo(x, y) {
        this.context.lineTo(x, y);
    }

    /**
     * 设置动画帧率
     * @param {number} fps - 帧率（帧/秒）
     */
    setFPS(fps) {
        this.fps = fps;
        this.frameInterval = 1000 / fps;
    }
}


// export
export { CanvasAnimationFramework };    
