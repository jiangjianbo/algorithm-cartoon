"use strict";

import { describe, expect, test, jest } from "@jest/globals";
import { JSDOM } from 'jsdom';
/**
 * @jest-environment jsdom
 */
import { CanvasAnimationFramework } from '../src/animation-canvas.js';
import { Element, Box, Link, Path } from '../src/animation.js';

// 手动设置全局 DOM 环境
beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html>');
    global.document = dom.window.document;
    global.window = dom.window;
    global.requestAnimationFrame = (callback) => callback();
});


describe('CanvasAnimationFramework', () => {
    let framework;
    let canvas;
    let context;

    beforeEach(() => {
        document.body.innerHTML = '<canvas id="testCanvas"></canvas>';
        canvas = document.getElementById('testCanvas');

        // 模拟 canvas 上下文
        context = {
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            stroke: jest.fn(),
            setLineDash: jest.fn(),
            strokeStyle: '',
            lineWidth: 1,
            clearRect: jest.fn(),
            rect: jest.fn(),
            fill: jest.fn(),
            fillStyle: ''
        };

        canvas.getContext = jest.fn(() => context);
        framework = new CanvasAnimationFramework('testCanvas');
    });

    describe('Initialization', () => {
        it('should initialize canvas and context', () => {
            // 修改：比较 ID 或 outerHTML
            expect(framework.canvas.id).toBe('testCanvas');
            expect(framework.context).toBe(context);
        });

        it('should throw error if canvas not found', () => {
            document.body.innerHTML = '';
            expect(() => new CanvasAnimationFramework('nonExistentCanvas')).toThrow();
        });
    });

    // 测试Box绘制
    describe('Box Drawing', () => {
        it('should draw visible box', () => {
            const box = new Box(10, 20, 100, 50);
            framework.drawBox(box);

            expect(context.beginPath).toHaveBeenCalled();
            expect(context.rect).toHaveBeenCalledWith(10, 20, 100, 50);
            expect(context.stroke).toHaveBeenCalled();
        });

        it('should not draw invisible box', () => {
            const box = new Box(10, 20, 100, 50);
            box.visible = false;
            framework.drawBox(box);

            expect(context.beginPath).not.toHaveBeenCalled();
        });

        it('should apply background color', () => {
            const box = new Box(10, 20, 100, 50);
            box.style.backgroundColor = 'blue';
            framework.drawBox(box);

            expect(context.fillStyle).toBe('blue');
            expect(context.fill).toHaveBeenCalled();
        });
    });

    // 测试Link绘制
    describe('Link Drawing', () => {
        it('should draw link path', () => {
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
            const link = new Link(path);

            framework.drawLink(link);

            expect(context.beginPath).toHaveBeenCalled();
            expect(context.moveTo).toHaveBeenCalledWith(0, 0);
            expect(context.lineTo).toHaveBeenCalledWith(100, 100);
            expect(context.stroke).toHaveBeenCalled();
        });

        it('should draw start arrow', () => {
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
            const link = new Link(path, 'solid', true, false);

            framework.drawLink(link);

            expect(context.moveTo).toHaveBeenCalledWith(0, 0);
            expect(context.lineTo).toHaveBeenCalledWith(10, 5);
            expect(context.lineTo).toHaveBeenCalledWith(10, -5);
            expect(context.closePath).toHaveBeenCalled();
        });

        it('should draw end arrow', () => {
            const path = new Path([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
            const link = new Link(path, 'solid', false, true);

            framework.drawLink(link);

            expect(context.moveTo).toHaveBeenCalledWith(100, 100);
            expect(context.lineTo).toHaveBeenCalledWith(90, 105);
            expect(context.lineTo).toHaveBeenCalledWith(90, 95);
            expect(context.closePath).toHaveBeenCalled();
        });
    });

    // 测试样式应用
    describe('Style Application', () => {
        it('should apply solid line style', () => {
            const element = new Element(10, 20);
            element.style.borderWidth = 2;
            element.style.borderColor = 'red';

            framework.activeDrawStyle(element, element.style);

            expect(context.strokeStyle).toBe('red');
            expect(context.lineWidth).toBe(2);
            expect(context.setLineDash).toHaveBeenCalledWith([]);
        });

        it('should apply dashed line style', () => {
            const element = new Element(10, 20);
            element.style.borderStyle = 'dashed';

            framework.activeDrawStyle(element, element.style);

            expect(context.setLineDash).toHaveBeenCalledWith([5, 10]);
        });

        it('should apply flash effect', () => {
            const element = new Element(10, 20);
            framework.flashingElements.push(element);

            // 模拟时间，使flashState为0（红色）
            Date.now = jest.fn(() => 1000);
            framework.activeDrawStyle(element, element.style);
            expect(context.strokeStyle).toBe('red');

            // 模拟时间，使flashState为1（黑色）
            Date.now = jest.fn(() => 1500);
            framework.activeDrawStyle(element, element.style);
            expect(context.strokeStyle).toBe('black');
        });
    });

    /*
    // 测试动画更新
    describe('Animation Update', () => {
        it('should clear canvas and redraw elements', () => {
            const box = new Box(10, 20, 100, 50);
            framework.addElement(box);

            // 修改：禁用帧率控制
            framework.frameInterval = 0;

            framework.update();

            expect(context.clearRect).toHaveBeenCalled();
            expect(context.rect).toHaveBeenCalledWith(10, 20, 100, 50);
        });
    });
    */
});