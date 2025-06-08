'use strict';
import { describe, expect, test } from '@jest/globals';
import {Element, Path, Box, Link, AnimationFramework} from '../animation.js';

// 对动画相关的基础元素的测试，主要测试AnimationFramework和各种元素的交互关系
describe('Animation Framework', () => {
    let framework;
    beforeEach(() => {
        framework = new AnimationFramework();
    });

    test('should add elements to the framework', () => {
        const element = new Element();
        framework.addElement(element);
        expect(framework.elements).toContain(element);
    });

    test('should remove elements from the framework', () => {
        const element = new Element();
        framework.addElement(element);
        framework.removeElement(element);
        expect(framework.elements).not.toContain(element);
    });

    test('should update all elements in the framework', () => {
        const element = new Element();
        framework.addElement(element);
        jest.spyOn(element, 'update');
        framework.update();
        expect(element.update).toHaveBeenCalled();
    });

    test('should flash elements in the framework', () => {
        const element = new Element();
        framework.addElement(element);
        jest.spyOn(element, 'flash');
        framework.flash(element);
        expect(element.flash).toHaveBeenCalled();
    });

    test('should draw all elements in the framework', () => {
        const element = new Element();
        framework.addElement(element);
        jest.spyOn(element, 'draw');
        framework.draw();
        expect(element.draw).toHaveBeenCalled();
    });

    test('should move elements along a path', () => {
        const path = new Path([{x: 0, y: 0}, {x: 10, y: 10}]);
        const element = new Element();
        framework.addElement(element);
        framework.moveBy(element, path, 1000);
        expect(element.path).toEqual(path);
    });

    test('should draw boxes', () => {
        const box = new Box(0, 0, 10, 10);
        framework.drawBox(box);
        expect(framework.boxes).toContain(box);
    });

    test('should draw links', () => {
        const link = new Link(new Path([{x: 0, y: 0}, {x: 10, y: 10}]));
        framework.drawLink(link);
        expect(framework.links).toContain(link);
    });

    test('should set active draw style', () => {
        const element = new Element();
        framework.addElement(element);
        const style = {strokeStyle: 'red'};
        framework.activeDrawStyle(element, style);
        expect(element.activeDrawStyle).toEqual(style);
    });

    test('should update drawing content', () => {
        framework.update();
        expect(framework.update).toHaveBeenCalled();
    });
})