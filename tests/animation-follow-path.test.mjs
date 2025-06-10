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

describe('followPath', () => {

    let framework;

    beforeEach(() => {
        framework = new AnimationFramework();
    });

    describe('moveBetweenPoints', () => {
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
        it('should move along path with correct parameters', () => {
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
            expect(segmentCompleteCallback).not.toHaveBeenCalled();

            // 完成第一段
            jest.advanceTimersByTime(500);
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(1);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(0);

            // 完成第二段
            jest.advanceTimersByTime(500);
            expect(segmentCompleteCallback).toHaveBeenCalledTimes(2);
            expect(segmentCompleteCallback).toHaveBeenCalledWith(1);

            // 验证完成回调
            expect(completeCallback).toHaveBeenCalled();

            // 验证stepCallback参数
            const calls = stepCallback.mock.calls;
            calls.forEach(call => {
                expect(call.length).toBe(4); // x, y, stepIndex, segmentIndex
                expect(typeof call[0]).toBe('number'); // x
                expect(typeof call[1]).toBe('number'); // y
                expect(typeof call[2]).toBe('number'); // stepIndex
                expect(typeof call[3]).toBe('number'); // segmentIndex
            });

            jest.useRealTimers();
        });

        it('should handle path with two points', () => {
            jest.useFakeTimers();

            const points = [
                { x: 0, y: 0 },
                { x: 100, y: 100 }
            ];

            const duration = 1000;
            const completeCallback = jest.fn();

            framework.moveAlongPath(points, duration, null, null, completeCallback);

            // 完成动画
            jest.advanceTimersByTime(1000);
            expect(completeCallback).toHaveBeenCalled();

            jest.useRealTimers();
        });

        it('should handle empty path', () => {
            jest.useFakeTimers();

            const points = [];
            const duration = 1000;
            const completeCallback = jest.fn();

            framework.moveAlongPath(points, duration, null, null, completeCallback);

            // 应该立即完成
            expect(completeCallback).toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe('followPath', () => {
        it('should throw error for invalid path', () => {
            const updateCallback = jest.fn();
            expect(() => framework.followPath(null, updateCallback)).toThrow();
            expect(() => framework.followPath(new Path([]), updateCallback)).toThrow();
        });

        it('should follow path with correct parameters', () => {
            jest.useFakeTimers();

            const path = new Path([
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 }
            ]);

            const updateCallback = jest.fn();

            framework.followPath(path, updateCallback, 'forward', 1000);

            // 完成动画
            jest.advanceTimersByTime(1000);

            // 验证updateCallback被调用
            expect(updateCallback).toHaveBeenCalled();

            // 验证updateCallback参数
            const calls = updateCallback.mock.calls;
            calls.forEach(call => {
                expect(call.length).toBe(6); // x, y, stepIndex, segmentIndex, loopCount, direction
                expect(typeof call[0]).toBe('number'); // x
                expect(typeof call[1]).toBe('number'); // y
                expect(typeof call[2]).toBe('number'); // stepIndex
                expect(typeof call[3]).toBe('number'); // segmentIndex
                expect(typeof call[4]).toBe('number'); // loopCount
                expect(typeof call[5]).toBe('string'); // direction
            });

            jest.useRealTimers();
        });

        it('should loop animation correctly', () => {
            jest.useFakeTimers();

            const path = new Path([
                { x: 0, y: 0 },
                { x: 100, y: 0 }
            ]);

            const updateCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.followPath(path, updateCallback, 'forward', 1000, completeCallback, true);

            // 完成第一次循环
            jest.advanceTimersByTime(1000);
            expect(completeCallback).not.toHaveBeenCalled();

            // 验证loopCount为0（第一次循环）
            const calls = updateCallback.mock.calls;
            if (calls.length > 0) {
                const lastCall = calls[calls.length - 1];
                expect(lastCall[4]).toBe(0); // loopCount
            }

            // 完成第二次循环
            jest.advanceTimersByTime(1000);

            // 验证loopCount为1（第二次循环）
            const newCalls = updateCallback.mock.calls;
            if (newCalls.length > 0) {
                const newLastCall = newCalls[newCalls.length - 1];
                expect(newLastCall[4]).toBe(1); // loopCount
            }

            jest.useRealTimers();
        });

        it('should reverse direction with yoyo effect', () => {
            jest.useFakeTimers();

            const path = new Path([
                { x: 0, y: 0 },
                { x: 100, y: 0 }
            ]);

            const updateCallback = jest.fn();

            framework.followPath(path, updateCallback, 'forward', 1000, null, true, true);

            // 完成第一次循环（正向）
            jest.advanceTimersByTime(1000);

            // 验证方向
            const calls = updateCallback.mock.calls;
            if (calls.length > 0) {
                const lastCall = calls[calls.length - 1];
                expect(lastCall[5]).toBe('forward');
            }

            // 完成第二次循环（反向）
            jest.advanceTimersByTime(1000);

            // 验证方向
            const newCalls = updateCallback.mock.calls;
            if (newCalls.length > 0) {
                const newLastCall = newCalls[newCalls.length - 1];
                expect(newLastCall[5]).toBe('backward');
            }

            jest.useRealTimers();
        });

        it('should call completeCallback with correct loop count', () => {
            jest.useFakeTimers();

            const path = new Path([
                { x: 0, y: 0 },
                { x: 100, y: 0 }
            ]);

            const updateCallback = jest.fn();
            const completeCallback = jest.fn();

            framework.followPath(path, updateCallback, 'forward', 1000, completeCallback, false);

            // 完成动画
            jest.advanceTimersByTime(1000);
            expect(completeCallback).toHaveBeenCalledWith(1);

            jest.useRealTimers();
        });
    });
});