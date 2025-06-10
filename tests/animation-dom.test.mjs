"use strict";

import { describe, expect, test, jest } from "@jest/globals";
import { JSDOM } from 'jsdom';

/**
 * @jest-environment jsdom
 */
import { DOMAnimationFramework } from '../src/animation-dom.js';
import { Element, Box, Link, Path } from '../src/animation.js';

// 手动设置全局 DOM 环境
beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html>');
    global.document = dom.window.document;
    global.window = dom.window;
    // 使用 setTimeout 异步执行回调，避免同步递归
    global.requestAnimationFrame = (callback) => {
        return setTimeout(callback, 0);
    };
    
    // 同时提供 cancelAnimationFrame 实现
    global.cancelAnimationFrame = (timeoutId) => {
        clearTimeout(timeoutId);
    };
});

// 增强 getComputedStyle 模拟
global.getComputedStyle = (element, pseudoElement) => {
    // 存储实际设置的样式
    const styles = {
        ...element.style,
        borderRightColor: element.style.borderColor || 'currentColor',
        borderLeftColor: element.style.borderColor || 'currentColor',
        content: pseudoElement ? '""' : '', // 模拟伪元素存在
    };

    return {
        getPropertyValue: (prop) => styles[prop] || '',
    };
};


describe('DOMAnimationFramework', () => {
    let framework;
    let root;

    beforeEach(() => {
        // 创建根元素
        document.body.innerHTML = '<div id="testRoot"></div>';
        root = document.getElementById('testRoot');
        framework = new DOMAnimationFramework('testRoot');
    });

    test('document should be defined', () => {
        expect(document).not.toBeUndefined();
        expect(typeof document).toBe('object');
    });

    // 测试初始化
    describe('Initialization', () => {
        it('should initialize with root element', () => {
            expect(framework.root).toBe(root);
            expect(framework.elementMap).toBeInstanceOf(Map);
        });

        it('should throw error if root element not found', () => {
            document.body.innerHTML = '';
            // 明确指定错误信息
            expect(() => new DOMAnimationFramework('nonExistentRoot')).toThrow(
                'Root element with id "nonExistentRoot" not found'
            );
        });
    });

    // 测试Box渲染
    describe('Box Rendering', () => {
        it('should create DOM element for box', () => {
            const box = new Box(10, 20, 100, 50);
            framework.drawBox(box);

            const domElement = root.querySelector('div');
            expect(domElement).toBeTruthy();
            expect(domElement.style.left).toBe('10px');
            expect(domElement.style.top).toBe('20px');
            expect(domElement.style.width).toBe('100px');
            expect(domElement.style.height).toBe('50px');
            expect(framework.elementMap.get(box.id)).toBe(domElement);
        });

        it('should apply box style', () => {
            const box = new Box(10, 20, 100, 50);
            box.style.borderColor = 'red';
            box.style.borderWidth = 2;
            box.style.borderStyle = 'dashed';
            box.style.backgroundColor = 'blue';

            framework.drawBox(box);

            const domElement = root.querySelector('div');
            expect(domElement.style.borderColor).toBe('red');
            expect(domElement.style.borderWidth).toBe('2px');
            expect(domElement.style.borderStyle).toBe('dashed');
            expect(domElement.style.backgroundColor).toBe('blue');
        });

        it('should update existing box', () => {
            const box = new Box(10, 20, 100, 50);
            framework.drawBox(box);

            box.x = 20;
            box.y = 30;
            framework.drawBox(box);

            const domElement = root.querySelector('div');
            expect(domElement.style.left).toBe('20px');
            expect(domElement.style.top).toBe('30px');
        });
    });

    // 测试Link渲染
    describe('Link Rendering', () => {
        it('should create DOM element for link', () => {
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
            const link = new Link(path);

            framework.drawLink(link);

            const domElement = root.querySelector('.link-element');
            expect(domElement).toBeTruthy();
            expect(domElement.style.width).toBe(`${Math.sqrt(20000)}px`);
            expect(domElement.style.transform).toContain('rotate(45deg)');
        });

        it('should render start arrow', () => {
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
            const link = new Link(path, 'solid', true, false);

            framework.drawLink(link);

            const domElement = root.querySelector('.link-element');
            expect(domElement.dataset.arrows).toBe('true,false');
            
            // 检查伪元素是否存在
            const beforeContent = getComputedStyle(domElement, '::before').content;
            expect(beforeContent).not.toBe('none');
        });

        it('should render end arrow', () => {
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
            const link = new Link(path, 'solid', false, true);

            framework.drawLink(link);

            const domElement = root.querySelector('.link-element');
            expect(domElement.dataset.arrows).toBe('false,true');
            
            // 检查伪元素是否存在
            const afterContent = getComputedStyle(domElement, '::after').content;
            expect(afterContent).not.toBe('none');
        });
    });

    // 测试动画
    describe('Animation', () => {
        it('should move element along path', () => {
            jest.useFakeTimers();

            const element = new Element(0, 0);
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 100 }]);

            framework.drawBox(element);
            framework.moveBy(element, path, 1000);

            // 推进时间
            jest.advanceTimersByTime(500);

            const domElement = framework.elementMap.get(element.id);
            expect(element.x).toBeCloseTo(50);
            expect(element.y).toBeCloseTo(50);
            expect(domElement.style.left).toBe('50px');
            expect(domElement.style.top).toBe('50px');

            jest.useRealTimers();
        });

        it('should apply flash effect', () => {
            const element = new Element(0, 0);
            framework.drawBox(element);

            framework.addFlash(element);
            const domElement = framework.elementMap.get(element.id);
            expect(domElement.classList.contains('flashing')).toBe(true);

            framework.removeFlash(element);
            expect(domElement.classList.contains('flashing')).toBe(false);
        });
    });

    // 测试更新和移除
    describe('Update and Removal', () => {
        it('should update all elements', () => {
            const box = new Box(10, 20, 100, 50);
            framework.addElement(box);

            // 模拟元素属性变化
            box.x = 30;

            framework.update();

            const domElement = framework.elementMap.get(box.id);
            expect(domElement.style.left).toBe('30px');
        });

        it('should remove element', () => {
            const box = new Box(10, 20, 100, 50);
            framework.addElement(box);
            framework.drawBox(box);

            framework.removeElement(box.id);

            expect(framework.elementMap.has(box.id)).toBe(false);
            expect(root.querySelector('div')).toBeNull();
        });
    });
});

