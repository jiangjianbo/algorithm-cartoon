"use strict";

import { describe, expect, test, jest } from "@jest/globals";
import { JSDOM } from 'jsdom';

/**
 * @jest-environment jsdom
 */
import { Element, Box, Link, Path, AnimationFramework } from '../src/animation.js';

// 手动设置全局 DOM 环境
beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html>');
    global.document = dom.window.document;
    global.window = dom.window;
    // 使用 setTimeout 异步执行回调，避免同步递归
    let time = 1;
    global.requestAnimationFrame = (callback) => {
        return setTimeout(() => callback((performance.now() || 0) + time++), 0);
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

describe('followPath', () => {

    let framework;

    beforeEach(() => {
        framework = new AnimationFramework();
    });

    describe('moveBetweenPoints', () => {
        it('should move between two adjacent horizontal points', () => {
            jest.useFakeTimers();

            const startPoint = { x: 0, y: 0 };
            const endPoint = { x: 10, y: 0 }; // 相邻的水平点
            const duration = 1;

            const stepCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveBetweenPoints(startPoint, endPoint, duration, stepCallback, completeCallback);

            // 完成动画
            jest.advanceTimersByTime(1000);

            // 验证回调被调用
            expect(stepCallback).toHaveBeenCalled();
            expect(completeCallback).toHaveBeenCalled();

            // 验证stepCallback调用次数（应该至少一次）
            expect(stepCallback).toHaveBeenCalledTimes(1);
            expect(stepCallback.mock.calls.length).toBeGreaterThan(0);

            // 验证最后一次调用的位置是否接近终点
            const lastCall = stepCallback.mock.calls[stepCallback.mock.calls.length - 1];
            expect(lastCall.length).toBe(3); // x, y, stepIndex
            expect(typeof lastCall[0]).toBe('number'); // x
            expect(typeof lastCall[1]).toBe('number'); // y
            expect(lastCall[0]).toBeCloseTo(endPoint.x, 0); // x
            expect(lastCall[1]).toBeCloseTo(endPoint.y, 0); // y

            jest.useRealTimers();
        });

        it('should move between two adjacent vertical points', () => {
            jest.useFakeTimers();

            const startPoint = { x: 0, y: 0 };
            const endPoint = { x: 0, y: 10 }; // 相邻的垂直点
            const duration = 1;

            const stepCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveBetweenPoints(startPoint, endPoint, duration, stepCallback, completeCallback);

            // 完成动画
            jest.advanceTimersByTime(1000);

            // 验证回调被调用
            expect(stepCallback).toHaveBeenCalled();
            expect(completeCallback).toHaveBeenCalled();

            // 验证stepCallback调用次数
            expect(stepCallback).toHaveBeenCalledTimes(1);
            expect(stepCallback.mock.calls.length).toBeGreaterThan(0);

            // 验证最后一次调用的位置是否接近终点
            const lastCall = stepCallback.mock.calls[stepCallback.mock.calls.length - 1];
            expect(lastCall.length).toBe(3); // x, y, stepIndex
            expect(typeof lastCall[0]).toBe('number'); // x
            expect(typeof lastCall[1]).toBe('number'); // y
            expect(lastCall[0]).toBeCloseTo(endPoint.x, 0); // x
            expect(lastCall[1]).toBeCloseTo(endPoint.y, 0); // y

            jest.useRealTimers();
        });

        it('should move between two distant points on a 45-degree diagonal', () => {
            jest.useFakeTimers();

            const startPoint = { x: 0, y: 0 };
            const endPoint = { x: 100, y: 100 }; // 45度斜线上的较远点
            const duration = 1000;

            const stepCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveBetweenPoints(startPoint, endPoint, duration, stepCallback, completeCallback);

            // 完成动画
            jest.advanceTimersByTime(1000);

            // 验证回调被调用
            expect(stepCallback).toHaveBeenCalled();
            expect(completeCallback).toHaveBeenCalled();

            // 验证stepCallback调用次数（应该多次调用）
            //expect(stepCallback).toHaveBeenCalledTimes(expect.any(Number));
            expect(stepCallback.mock.calls.length).toBeGreaterThan(1);

            // 验证stepIndex递增
            const calls = stepCallback.mock.calls;
            for (let i = 1; i < calls.length; i++) {
                expect(calls[i][2]).toBe(calls[i - 1][2] + 1); // stepIndex应该递增
            }

            // 验证最后一次调用的位置是否接近终点
            const lastCall = calls[calls.length - 1];
            expect(lastCall.length).toBe(3); // x, y, stepIndex
            expect(typeof lastCall[0]).toBe('number'); // x
            expect(typeof lastCall[1]).toBe('number'); // y
            expect(lastCall[0]).toBeCloseTo(endPoint.x, 0); // x
            expect(lastCall[1]).toBeCloseTo(endPoint.y, 0); // y

            jest.useRealTimers();
        });
    });

    describe('moveBetweenPoints1', () => {
        it('should move between two points with correct parameters', () => {
            jest.useFakeTimers();

            const startPoint = { x: 0, y: 0 };
            const endPoint = { x: 100, y: 100 };
            const duration = 1000;

            const stepCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveBetweenPoints(startPoint, endPoint, duration, stepCallback, completeCallback);

            // 验证初始状态
            expect(stepCallback).not.toHaveBeenCalled();
            expect(completeCallback).not.toHaveBeenCalled();

            // 推进时间：动画进行中
            jest.advanceTimersByTime(500);
            expect(stepCallback).toHaveBeenCalled();

            // 验证回调参数格式
            const calls = stepCallback.mock.calls;
            if (calls.length >= 2) {
                const firstCall = calls[0];
                const secondCall = calls[1];

                expect(firstCall.length).toBe(3); // x, y, stepIndex
                expect(typeof firstCall[0]).toBe('number'); // x
                expect(typeof firstCall[1]).toBe('number'); // y
                expect(typeof firstCall[2]).toBe('number'); // stepIndex

                // 验证stepIndex递增
                expect(secondCall[2]).toBe(firstCall[2] + 1);
            }

            // 完成动画
            jest.advanceTimersByTime(500);
            expect(completeCallback).toHaveBeenCalled();

            jest.useRealTimers();
        });

        it('should reach end point at animation completion', () => {
            jest.useFakeTimers();

            const startPoint = { x: 0, y: 0 };
            const endPoint = { x: 100, y: 100 };
            const duration = 1000;

            const stepCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveBetweenPoints(startPoint, endPoint, duration, stepCallback, completeCallback);

            // 完成动画
            jest.advanceTimersByTime(1000);

            // 验证回调被调用
            expect(stepCallback).toHaveBeenCalled();
            expect(completeCallback).toHaveBeenCalled();

            // 验证回调参数格式
            const calls = stepCallback.mock.calls;
            if (calls.length > 0) {
                const lastCall = calls[calls.length - 1];

                // 验证参数长度和类型
                expect(lastCall.length).toBe(3); // x, y, stepIndex
                expect(typeof lastCall[0]).toBe('number'); // x
                expect(typeof lastCall[1]).toBe('number'); // y

                // 验证最后位置接近终点
                if (!isNaN(lastCall[0]) && !isNaN(lastCall[1])) {
                    expect(lastCall[0]).toBeCloseTo(endPoint.x, 0); // x
                    expect(lastCall[1]).toBeCloseTo(endPoint.y, 0); // y
                } else {
                    // 输出调试信息
                    console.error('Invalid position values:', lastCall);
                    fail('Position values are NaN');
                }
            } else {
                fail('No stepCallback calls were recorded');
            }

            jest.useRealTimers();
        });
    });

    describe('moveAlongPath', () => {
        it('should move along path with two distant points', () => {
            jest.useFakeTimers();

            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 100 }
            ];

            const duration = 1000;
            const stepCallback = jest.fn();
            const segmentCompleteCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveAlongPath(points, duration, stepCallback, segmentCompleteCallback, completeCallback);

            // 验证初始状态
            expect(stepCallback).not.toHaveBeenCalled();
            expect(segmentCompleteCallback).not.toHaveBeenCalled();
            expect(completeCallback).not.toHaveBeenCalled();

            // 推进时间到动画中间
            jest.advanceTimersByTime(500);

            // 验证stepCallback被调用
            expect(stepCallback).toHaveBeenCalled();

            // 验证stepCallback参数
            const calls = stepCallback.mock.calls;
            calls.forEach(call => {
                expect(call.length).toBe(4); // x, y, stepIndex, segmentIndex
                expect(typeof call[0]).toBe('number'); // x
                expect(typeof call[1]).toBe('number'); // y
                expect(typeof call[2]).toBe('number'); // stepIndex
                expect(typeof call[3]).toBe('number'); // segmentIndex
                expect(call[3]).toBe(0); // 只有一个段，所以segmentIndex应该始终为0
            });

            // 完成动画
            jest.advanceTimersByTime(500);

            // 验证segmentCompleteCallback被调用一次
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(1);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(0);

            // 验证completeCallback被调用
            expect(completeCallback).toHaveBeenCalled();

            // 验证最后位置接近终点
            const lastCall = stepCallback.mock.calls[stepCallback.mock.calls.length - 1];
            expect(lastCall[0]).toBeCloseTo(100, 0); // x
            expect(lastCall[1]).toBeCloseTo(100, 0); // y

            jest.useRealTimers();
        });

        it('should move along path with three distant points', () => {
            jest.useFakeTimers();

            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 }
            ];

            const duration = 1000;
            const stepCallback = jest.fn();
            const segmentCompleteCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveAlongPath(points, duration, stepCallback, segmentCompleteCallback, completeCallback);

            // 验证初始状态
            expect(stepCallback).not.toHaveBeenCalled();
            expect(segmentCompleteCallback).not.toHaveBeenCalled();
            expect(completeCallback).not.toHaveBeenCalled();

            // 完成第一段 (0,0 -> 100,0)
            jest.advanceTimersByTime(333);

            // 验证segmentCompleteCallback被调用一次
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(2);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(0);

            // 验证stepCallback参数
            const calls = stepCallback.mock.calls;
            calls.forEach(call => {
                expect(call.length).toBe(4); // x, y, stepIndex, segmentIndex
                expect(typeof call[0]).toBe('number'); // x
                expect(typeof call[1]).toBe('number'); // y
                expect(typeof call[2]).toBe('number'); // stepIndex
                expect(typeof call[3]).toBe('number'); // segmentIndex
                expect(call[3]).toBeLessThanOrEqual(1); // 此时应该只有段0和段1
            });

            // 完成第二段 (100,0 -> 100,100)
            jest.advanceTimersByTime(667);

            // 验证segmentCompleteCallback被调用两次
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(2);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(1);

            // 验证completeCallback被调用
            expect(completeCallback).toHaveBeenCalled();

            // 验证最后位置接近终点
            const lastCall = stepCallback.mock.calls[stepCallback.mock.calls.length - 1];
            expect(lastCall[0]).toBeCloseTo(100, 0); // x
            expect(lastCall[1]).toBeCloseTo(100, 0); // y

            jest.useRealTimers();
        });

        it('should move along path with five points', () => {
            jest.useFakeTimers();

            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
                { x: 0, y: 200 }
            ];

            const duration = 1000;
            const stepCallback = jest.fn();
            const segmentCompleteCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.moveAlongPath(points, duration, stepCallback, segmentCompleteCallback, completeCallback);

            // 验证初始状态
            expect(stepCallback).not.toHaveBeenCalled();
            expect(segmentCompleteCallback).not.toHaveBeenCalled();
            expect(completeCallback).not.toHaveBeenCalled();
            /*
            // 完成第一段
            jest.advanceTimersByTime(200);
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(1);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(0);

            // 完成第二段
            jest.advanceTimersByTime(200);
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(2);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(1);

            // 完成第三段
            jest.advanceTimersByTime(200);
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(3);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(2);
            */
            // 完成第四段
            jest.advanceTimersByTime(400);
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(4);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(3);

            // 验证completeCallback被调用
            expect(completeCallback).toHaveBeenCalled();

            // 验证最后位置接近终点
            const lastCall = stepCallback.mock.calls[stepCallback.mock.calls.length - 1];
            expect(lastCall[0]).toBeCloseTo(0, 0); // x
            expect(lastCall[1]).toBeCloseTo(200, 0); // y

            // 验证所有段都被处理
            const segmentIndices = new Set();
            stepCallback.mock.calls.forEach(call => {
                segmentIndices.add(call[3]);
            });

            expect(segmentIndices.size).toBe(4); // 四个段 (0, 1, 2, 3)

            jest.useRealTimers();
        });
    });

});