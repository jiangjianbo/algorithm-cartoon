// 简单的测试框架
class TestRunner {
    constructor() {
        this.tests = [];
        this.beforeEachFns = [];
    }

    beforeEach(fn) {
        this.beforeEachFns.push(fn);
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async runTests() {
        console.log('开始运行测试...');
        let passed = 0;
        let failed = 0;

        for (const test of this.tests) {
            try {
                // 运行beforeEach函数
                for (const beforeFn of this.beforeEachFns) {
                    await beforeFn();
                }

                // 运行测试
                await test.fn();
                console.log(`测试用例成功： ${test.name}`);
                passed++;
            } catch (error) {
                console.error(`测试用例失败： ${test.name}`);
                console.error(`  错误消息: ${error.message}`);
                failed++;
            }
        }

        console.log(`\n测试完成: ${passed} 通过, ${failed} 失败`);
    }
}

// 断言函数
class Assertion {
    static assertEquals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} 期望值: ${expected}, 实际值: ${actual}`);
        }
    }

    static assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(`${message} 值不应为空`);
        }
    }

    static assertTrue(value, message = '') {
        if (!value) {
            throw new Error(`${message} 期望为true`);
        }
    }

    static assertFalse(value, message = '') {
        if (value) {
            throw new Error(`${message} 期望为false`);
        }
    }

    static assertInRange(value, min, max, message = '') {
        if (value < min || value > max) {
            throw new Error(`${message} 值${value}不在范围[${min}, ${max}]内`);
        }
    }
}

// AnimationController测试
async function runAnimationControllerTests() {
    const runner = new TestRunner();

    // 设置测试环境
    runner.beforeEach(() => {
        document.body.innerHTML = `
            <div id="pivot"></div>
            <div id="data"></div>
        `;
        AnimationController.value = 5;
    });

    // 速度控制测试
    runner.test('速度计算测试', () => {
        AnimationController.value = 1;
        Assertion.assertEquals(AnimationController.speed, 1000);
        
        AnimationController.value = 10;
        Assertion.assertEquals(AnimationController.speed, 100);
    });

    // 创建box测试
    runner.test('创建box元素测试', () => {
        const box = AnimationController.createBox('test-box', 42);
        Assertion.assertEquals(box.id, 'test-box');
        Assertion.assertEquals(box.className, 'box');
        Assertion.assertEquals(box.textContent, '42');
    });

    // Pivot视图测试
    runner.test('创建pivot视图测试', () => {
        AnimationController.createPivotView('pivot-box', 42);
        const pivotContainer = document.getElementById('pivot');
        const box = pivotContainer.firstChild;
        
        Assertion.assertNotNull(box);
        Assertion.assertEquals(box.id, 'pivot-box');
        Assertion.assertEquals(box.textContent, '42');
    });

    // 数组视图测试
    runner.test('创建数组视图测试', () => {
        const items = [
            { id: null, getValue: () => 1 },
            { id: null, getValue: () => 2 },
            { id: null, getValue: () => 3 }
        ];
        
        AnimationController.createArrayView('data', items);
        const container = document.getElementById('data');
        const boxes = container.children;
        
        Assertion.assertEquals(boxes.length, 3);
        Assertion.assertEquals(boxes[0].textContent, '1');
        Assertion.assertEquals(boxes[1].textContent, '2');
        Assertion.assertEquals(boxes[2].textContent, '3');
    });

    // 范围标记测试
    runner.test('创建范围标记测试', () => {
        const container = document.getElementById('data');
        container.innerHTML = `
            <div id="start" class="box" style="position: absolute; left: 0; top: 0; width: 50px; height: 50px;"></div>
            <div id="end" class="box" style="position: absolute; left: 100px; top: 0; width: 50px; height: 50px;"></div>
        `;

        AnimationController.createRangeMark('start', 'end');
        const rangeMark = container.querySelector('.range-mark');
        
        Assertion.assertNotNull(rangeMark);
        Assertion.assertEquals(rangeMark.style.width, '150px');
    });

    // 元素交换动画测试
    runner.test('元素交换动画测试', async () => {
        document.body.innerHTML += `
            <div id="elem1" style="position: absolute; left: 0; top: 0;">1</div>
            <div id="elem2" style="position: absolute; left: 100px; top: 0;">2</div>
        `;

        const startTime = Date.now();
        await AnimationController.swapElements('elem1', 'elem2');
        const duration = Date.now() - startTime;

        const elem1 = document.getElementById('elem1');
        const elem2 = document.getElementById('elem2');
        
        Assertion.assertEquals(elem1.textContent, '2');
        Assertion.assertEquals(elem2.textContent, '1');
        Assertion.assertInRange(duration, 500, 700);
    });

    // 运行所有测试
    await runner.runTests();
}

// 运行测试
window.onload = () => {
    runAnimationControllerTests().catch(console.error);
};