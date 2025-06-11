'use strict';

/**
 * 基础抽象元素，包含位置、可见性和样式等属性
 * @param {number} x 元素的x坐标
 * @param {number} y 元素的y坐标
 * @param {boolean} visible 元素的可见性
 * @param {string} id 元素的id
 */
class Element {
    constructor(x, y, visible = true, id = null) {
        // 检查坐标参数类型
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new TypeError('Element坐标必须为数字类型');
        }
        // 检查可见性参数类型
        if (typeof visible !== 'boolean') {
            throw new TypeError('Element可见性必须为布尔类型');
        }

        this.id = id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
     * @param {AnimationFramework} framework
     * @param {Path} path 路径对象
     * @param {number} duration 时间
     */
    moveBy(framework, path, duration) {
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

        // 检查宽高参数类型
        if (typeof width !== 'number' || typeof height !== 'number') {
            throw new TypeError('Box宽高必须为数字类型');
        }
        // 检查宽高参数有效性
        if (width <= 0 || height <= 0) {
            throw new RangeError('Box宽高必须大于0');
        }

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
        // 检查points是否为数组
        if (!Array.isArray(points)) {
            throw new TypeError('Path的points必须为数组类型');
        }
        // 检查每个点是否包含x和y坐标
        points.forEach((point, index) => {
            if (typeof point.x !== 'number' || typeof point.y !== 'number') {
                throw new TypeError(`Path的点${index}必须包含x和y数字坐标`);
            }
        });

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
        // 检查path参数类型
        if (!(path instanceof Path)) {
            throw new TypeError('Link的path必须为Path实例');
        }
        // 检查线样式类型
        if (typeof lineStyle !== 'string') {
            throw new TypeError('Link线样式必须为字符串类型');
        }
        // 检查箭头参数类型
        if (typeof startArrow !== 'boolean' || typeof endArrow !== 'boolean') {
            throw new TypeError('Link箭头参数必须为布尔类型');
        }

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
     * 内核函数：在两点之间移动
     * @param {Object} startPoint - 起点 {x, y}
     * @param {Object} endPoint - 终点 {x, y}
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {function} stepCallback - 每步回调 (x, y, stepIndex)
     * @param {function} completeCallback - 完成回调
     */
    moveBetweenPoints(startPoint, endPoint, duration, stepCallback, completeCallback) {
        const startTime = performance.now();
        let stepIndex = 0; // 步骤索引
        
        const animate = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 线性插值计算当前位置
            const x = this.calculateLinearInterpolation(startPoint.x, endPoint.x, progress);
            const y = this.calculateLinearInterpolation(startPoint.y, endPoint.y, progress);
            
            // 调用步骤回调，更新参数顺序
            if (stepCallback) {
                stepCallback(x, y, stepIndex++);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画完成，调用完成回调
                if (completeCallback) {
                    completeCallback();
                }
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 沿路径移动（多点之间的移动）
     * @param {Array} points - 路径点数组 [{x,y}, {x,y}, ...]
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {function} stepCallback - 每步回调 (x, y, stepIndex, segmentIndex)
     * @param {function} segmentCompleteCallback - 每段完成回调 (segmentIndex)
     * @param {function} completeCallback - 全部完成回调
     */
    moveAlongPath(points, duration, stepCallback, segmentCompleteCallback, completeCallback) {
        if (!points || points.length < 2) {
            if (completeCallback) completeCallback();
            return;
        }
        
        // 总段数
        const totalSegments = points.length - 1;
        
        // 每段的持续时间
        const segmentDuration = duration / totalSegments;
        
        // 当前段索引
        let currentSegment = 0;
        
        // 递归执行每一段的移动
        const moveNextSegment = () => {
            if (currentSegment >= totalSegments) {
                // 所有段都完成了
                if (completeCallback) completeCallback();
                return;
            }
            
            const startPoint = points[currentSegment];
            const endPoint = points[currentSegment + 1];
            
            // 使用内核函数移动当前段
            this.moveBetweenPoints(
                startPoint,
                endPoint,
                segmentDuration,
                (x, y, stepIndex) => {
                    // 传递位置和索引给步骤回调
                    if (stepCallback) {
                        stepCallback(x, y, stepIndex, currentSegment);
                    }
                },
                () => {
                    // 当前段完成，调用段完成回调
                    if (segmentCompleteCallback) {
                        segmentCompleteCallback(currentSegment);
                    }
                    
                    // 移动到下一段
                    currentSegment++;
                    moveNextSegment();
                }                
            );
        };
        
        // 开始第一段的移动
        moveNextSegment();
    }

    /**
     * 沿路径移动元素，支持方向控制、循环和自定义更新回调
     * @param {Path} path - 路径对象
     * @param {function} updateCallback - 每帧更新回调函数
     * @param {('forward'|'backward')} direction - 移动方向
     * @param {number} duration - 动画持续时间（毫秒）
     * @param {function} [completeCallback] - 动画完成回调
     * @param {boolean} [loop=false] - 是否循环动画
     * @param {boolean} [yoyo=false] - 是否在循环时反向（仅在loop=true时有效）
     */
    followPath(path, updateCallback, direction = 'forward', duration = 1000, completeCallback = null, loop = false, yoyo = false) {
        if (!(path instanceof Path)) {
            throw new TypeError('path参数类型错误');
        }
        const points = path.points;
        if (!points || points.length < 2) {
            throw new TypeError('Invalid path: must contain at least two points');
        }
        if (!updateCallback) {
            throw new TypeError('require updateCallback');
        }
        
        // 循环计数
        let loopCount = 0;
        
        // 准备路径点（根据方向处理）
        let pathPoints = direction === 'forward' ? [...points] : [...points].reverse();
        
        // 当前方向
        let currentDirection = direction;
        
        // 递归执行动画（支持循环）
        const executeAnimation = () => {
            this.moveAlongPath(
                pathPoints,
                duration,
                (x, y, stepIndex, segmentIndex) => {
                    // 调用原始的更新回调，更新参数顺序
                    updateCallback(x, y, stepIndex, segmentIndex, loopCount, currentDirection);
                },
                null, // 每段完成回调
                () => {
                    // 全部完成回调
                    loopCount++;
                    
                    if (loop) {
                        // 如果启用了yoyo效果，切换方向并重排点
                        if (yoyo) {
                            currentDirection = currentDirection === 'forward' ? 'backward' : 'forward';
                            pathPoints = pathPoints.reverse();
                        }
                        
                        // 继续下一次循环
                        executeAnimation();
                    } else {
                        // 动画结束，调用完成回调
                        if (completeCallback) {
                            completeCallback(loopCount);
                        }
                    }
                }
            );
        };
        
        // 开始第一次动画
        executeAnimation();
    }

    // 线性插值计算方法
    calculateLinearInterpolation(start, end, progress) {
        return start + (end - start) * progress;
    }

    /**
     * 抽象接口，让元素沿着路径进行移动
     * @param {Element} element 需要移动的元素
     * @param {Path} path 移动路径
     * @param {number} duration 移动时间
     * @param {function} [completeCallback] - 动画完成回调
     */
    moveBy(element, path, duration, completeCallback) {
        // 实现元素移动的逻辑
        throw new Error('子类必须实现moveBy方法');
    }

    /**
     * 抽象接口，绘制方框
     * @param {Box} box 方框对象
     */
    drawBox(box) {
        // 绘制方框的逻辑
        throw new Error('子类必须实现drawBox方法');
    }

    /**
     * 抽象接口，绘制链接
     * @param {Link} link 链接对象
     */
    drawLink(link) {
        // 绘制链接的逻辑
        throw new Error('子类必须实现drawLink方法');
    }

    /**
     * 抽象接口，设置当前元素的绘制样式
     * @param {Element} element 当前元素
     * @param {Object} style 样式对象
     */
    activeDrawStyle(element, style) {
        throw new Error('子类必须实现activeDrawStyle方法');
    }

    /**
     * 抽象接口，更新绘画内容
     */
    update() {
        throw new Error('子类必须实现update方法');
    }

}


// export
export { Element, Box, Link, Path, AnimationFramework };
