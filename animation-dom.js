'use strict';
import {Element, Path, Box, Link, AnimationFramework} from './animation.js';

/**
 * 使用DOM作为渲染框架，所有的元素都映射成一个DOM元素，包括动画元素和非动画元素
 * @param {string} rootId 根元素的id
 */
class DOMAnimationFramework extends AnimationFramework  {

    constructor(rootId) {
        super();
        this.root = document.getElementById(rootId);
    }


}

