'use strict';

/**
 * 基础抽象元素，包含位置、可见性和样式等属性
 * @param {number} x 元素的x坐标
 * @param {number} y 元素的y坐标
 * @param {boolean} visible 元素的可见性
 */
class Element {
    constructor(x, y, visible = true) {
        this.x = x;
        this.y = y;
        this.visible = visible;
        this.style = {
            borderColor: 'black',
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            textColor: 'black',
            textSize: 16,
            fontName: 'Arial',
            textDecoration: 'none'
        };
    }

    /**
     * 抽象接口，用于在框架中绘制元素
     * @param {AnimationFramework} framework 
     * @returns 
     */
    draw(framework) {
        if (!this.visible) return;
        // 默认绘制逻辑
    }

    /**
     * 移动元素到指定的位置，没有动画效果
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 沿着路径移动对象，带动画效果
     * @param {Path} path 路径对象
     * @param {number} duration 时间
     */
    moveBy(path, duration) {
        framework.moveBy(this, path, duration);
    }

    /**
     * 闪烁元素
     * @param {AnimationFramework} framework
     */
    flash(framework) {
        // 将元素添加到动画框架的闪烁列表中
        framework.addFlash(this);
    }
}

/**
 * 矩形元素，继承自Element，带边框和背景颜色
 * @param {number} x 左上角横坐标
 * @param {number} y 左上角纵坐标
 * @param {number} width 宽度
 * @param {number} height 高度
 */
class Box extends Element {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
    }

    draw(framework) {
        if (!this.visible) return;
        framework.drawBox(this);
    }
}

/**
 * 路径对象，包含一系列点
 * @param {Array} points 点的数组，每个点包含x和y坐标
 */
class Path {
    constructor(points) {
        this.points = points;
    }

    /**
     * 获取起点坐标
     * @returns 起点坐标
     */
    getStartPoint() {
        return this.points[0];
    }

    /**
     * 返回终点坐标
     * @returns 终点坐标
     */
    getEndPoint() {
        return this.points[this.points.length - 1];
    }
}

/**
 * 链接元素，继承自Element，带箭头和样式
 * @param {Path} path 路径对象
 * @param {string} lineStyle 线的样式
 * @param {boolean} startArrow 是否在起点添加箭头
 * @param {boolean} endArrow 是否在终点添加箭头
 */
class Link extends Element {
    constructor(path, lineStyle = 'solid', startArrow = false, endArrow = false) {
        super(path.getStartPoint().x, path.getStartPoint().y, true);
        this.path = path;
        this.style = {
            borderColor: 'black',
            borderWidth: 1,
            borderStyle: lineStyle
        };
        this.startArrow = startArrow;
        this.endArrow = endArrow;
    }

    draw(framework) {
        if (!this.visible) return;
        framework.drawLink(this);
    }
}

/**
 * 动画框架基类，定义了动画元素的基本操作
 * 子类需要实现具体的绘制逻辑
 */
class AnimationFramework {
    constructor() {
        this.elements = [];
        this.temporaryObjects = [];
        this.flashingElements = [];
    }

    /**
     * 添加需要绘制的元素
     * @param {Element} element 
     */
    addElement(element) {
        this.elements.push(element);
    }

    /**
     * 移除指定的元素
     * @param {Element} id 
     */
    removeElement(id) {
        this.elements = this.elements.filter(e => e.id !== id);
    }

    /**
     * 创建一个临时元素，用于绘制一些临时性的图形
     * @param {Element} element 
     */
    createTemporaryElement(element) {
        this.temporaryObjects.push(element);
    }

    /**
     * 移除指定的临时元素
     * @param {Element} element 
     */
    removeTemporaryElement(element) {
        this.temporaryObjects = this.temporaryObjects.filter(e => e !== element);
    }

    /**
     * 创建一个链接，连接两个元素
     * @param {Element} element1 起点元素
     * @param {Element} element2 终点元素
     * @param {string} lineStyle 线的样式
     * @param {boolean} startArrow 是否在起点添加箭头
     * @param {boolean} endArrow 是否在终点添加箭头
     * @returns 
     */
    createLink(element1, element2, lineStyle, startArrow, endArrow) {
        const path = new Path([
            { x: element1.x + element1.width / 2, y: element1.y + element1.height / 2 },
            { x: element2.x + element2.width / 2, y: element2.y + element2.height / 2 }
        ]);
        const link = new Link(path, lineStyle, startArrow, endArrow);
        return link;
    }

    /**
     * 添加需要闪烁效果的元素
     * @param {Element} element 需要闪烁的元素
     */
    addFlash(element) {
        this.flashingElements.push(element);
    }

    /**
     * 移除指定的闪烁元素
     * @param {Element} element 
     */
    removeFlash(element) {
        this.flashingElements = this.flashingElements.filter(e => e !== element);
    }

    /**
     * 抽象接口，让元素沿着路径进行移动
     * @param {Element} element 需要移动的元素
     * @param {Path} path 移动路径
     * @param {number} duration 移动时间
     */
    moveBy(element, path, duration) {
        // 实现元素移动的逻辑
    }

    /**
     * 抽象接口，绘制方框
     * @param {Box} box 方框对象
     */
    drawBox(box) {
        // 绘制方框的逻辑
    }
    
    /**
     * 抽象接口，绘制链接
     * @param {Link} link 链接对象
     */
    drawLink(link) {
        // 绘制链接的逻辑
    }

    /**
     * 抽象接口，设置当前元素的绘制样式
     * @param {Element} element 当前元素
     * @param {Object} style 样式对象
     */
    activeDrawStyle(element, style) {
        
    }

    /**
     * 抽象接口，更新绘画内容
     */
    update() {
        
    }

}


// export
export { Element, Box, Link, Path, AnimationFramework };
