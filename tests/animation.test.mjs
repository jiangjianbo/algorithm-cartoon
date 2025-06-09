"use strict";
import { describe, expect, test } from "@jest/globals";
import {
    Element,
    Path,
    Box,
    Link,
    AnimationFramework,
} from "../src/animation.js";

// 对动画相关的基础元素的测试，主要测试AnimationFramework和各种元素的交互关系

describe("AnimationFramework", () => {
    let framework;

    beforeEach(() => {
        framework = new AnimationFramework();
    });

    // 测试框架与元素的基本交互
    describe("Element Management", () => {
        it("should add and remove elements", () => {
            const element = new Element(10, 20);
            framework.addElement(element);
            expect(framework.elements).toContain(element);

            framework.removeElement(element.id);
            expect(framework.elements).not.toContain(element);
        });

        it("should create and remove temporary elements", () => {
            const tempElement = new Element(30, 40);
            framework.createTemporaryElement(tempElement);
            expect(framework.temporaryObjects).toContain(tempElement);

            framework.removeTemporaryElement(tempElement);
            expect(framework.temporaryObjects).not.toContain(tempElement);
        });
    });

    // 测试路径移动功能
    describe("Path Movement", () => {
        it("should move element along path", () => {
            const element = new Element(0, 0);
            const path = new Path([
                { x: 0, y: 0 },
                { x: 100, y: 100 },
            ]);

            // 模拟框架实现
            framework.moveBy = jest.fn();

            element.moveBy(path, 2000, framework);
            expect(framework.moveBy).toHaveBeenCalledWith(element, path, 2000);
        });
    });

    // 测试闪烁效果
    describe("Flashing Effect", () => {
        it("should add and remove flashing elements", () => {
            const element = new Element(50, 50);

            framework.addFlash(element);
            expect(framework.flashingElements).toContain(element);

            framework.removeFlash(element);
            expect(framework.flashingElements).not.toContain(element);
        });

        it("should trigger flash via element method", () => {
            const element = new Element(60, 60);
            framework.addFlash = jest.fn();

            element.flash(framework);
            expect(framework.addFlash).toHaveBeenCalledWith(element);
        });
    });

    // 测试链接创建功能
    describe("Link Creation", () => {
        it("should create link between two elements", () => {
            const box1 = new Box(0, 0, 50, 50);
            const box2 = new Box(100, 100, 50, 50);

            const link = framework.createLink(
                box1,
                box2,
                "dashed",
                true,
                false
            );

            expect(link).toBeInstanceOf(Link);
            expect(link.path.points[0]).toEqual({ x: 25, y: 25 });
            expect(link.path.points[1]).toEqual({ x: 125, y: 125 });
            expect(link.style.borderStyle).toBe("dashed");
            expect(link.startArrow).toBe(true);
            expect(link.endArrow).toBe(false);
        });
    });

    // 测试元素绘制功能
    describe("Element Drawing", () => {
        it("should call drawBox for Box elements", () => {
            const box = new Box(10, 10, 100, 50);
            framework.drawBox = jest.fn();

            box.draw(framework);
            expect(framework.drawBox).toHaveBeenCalledWith(box);
        });

        it("should call drawLink for Link elements", () => {
            const path = new Path([
                { x: 0, y: 0 },
                { x: 100, y: 100 },
            ]);
            const link = new Link(path);
            framework.drawLink = jest.fn();

            link.draw(framework);
            expect(framework.drawLink).toHaveBeenCalledWith(link);
        });

        it("should not draw invisible elements", () => {
            const box = new Box(10, 10, 20, 20);
            box.visible = false;

            framework.drawBox = jest.fn();
            box.draw(framework);

            expect(framework.drawBox).not.toHaveBeenCalled();
        });
    });
});

// 测试Element基类
describe("Element Base Class", () => {
    it("should initialize with default values", () => {
        const element = new Element(10, 20);
        expect(element.x).toBe(10);
        expect(element.y).toBe(20);
        expect(element.visible).toBe(true);
        expect(element.style.borderColor).toBe("black");
        expect(element.style.backgroundColor).toBe("transparent");
    });

    it("should move to new position", () => {
        const element = new Element(0, 0);
        element.moveTo(50, 100);
        expect(element.x).toBe(50);
        expect(element.y).toBe(100);
    });
});

// 测试Box类
describe("Box Class", () => {
    it("should initialize with width and height", () => {
        const box = new Box(10, 20, 100, 50);
        expect(box.width).toBe(100);
        expect(box.height).toBe(50);
    });
});

// 测试Link类
describe("Link Class", () => {
    it("should initialize with path and styles", () => {
        const path = new Path([
            { x: 0, y: 0 },
            { x: 100, y: 100 },
        ]);
        const link = new Link(path, "dashed", true, true);

        expect(link.path).toBe(path);
        expect(link.style.borderStyle).toBe("dashed");
        expect(link.startArrow).toBe(true);
        expect(link.endArrow).toBe(true);
    });
});

// 测试Path类
describe("Path Class", () => {
    it("should return start and end points", () => {
        const path = new Path([
            { x: 10, y: 10 },
            { x: 50, y: 50 },
            { x: 100, y: 100 },
        ]);

        expect(path.getStartPoint()).toEqual({ x: 10, y: 10 });
        expect(path.getEndPoint()).toEqual({ x: 100, y: 100 });
    });
});
