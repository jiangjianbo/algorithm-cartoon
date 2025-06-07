

// 动画控制器
class AnimationController {
    static value = 5;
    
    static get speed() {
        return (11 - this.value) * 100; // 速度值越大，动画时间越短
    }

    static async animate(duration, callback) {
        await new Promise(resolve => setTimeout(resolve, duration * this.speed / 1000));
        callback && callback();
    }

    static createBox(id, value) {
        const box = document.createElement('div');
        box.id = id;
        box.className = 'box';
        box.textContent = value;
        return box;
    }

    static createPivotView(id, value) {
        const box = this.createBox(id, value);
        const container = document.getElementById('pivot');
        if (container) {
            container.innerHTML = '';
            container.appendChild(box);
        }
        return box;
    }

    static createArrayView(containerId, items) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        items.forEach((item, index) => {
            const itemId = `${containerId}_${index}`;
            item.id = itemId;
            const box = this.createBox(itemId, item.getValue());
            container.appendChild(box);
        });
    }

    static createRangeMark(startId, endId) {
        const container = document.getElementById('data');
        const oldRange = container.querySelector('.range-mark');
        oldRange && oldRange.remove();

        const startElem = document.getElementById(startId);
        const endElem = document.getElementById(endId);
        
        if (!startElem || !endElem) return;

        const range = document.createElement('div');
        range.className = 'range-mark';
        
        const rangeRect = {
            left: startElem.offsetLeft,
            top: startElem.offsetTop,
            width: endElem.offsetLeft - startElem.offsetLeft + startElem.offsetWidth
        };
        
        Object.assign(range.style, {
            position: 'absolute',
            left: `${rangeRect.left}px`,
            top: `${rangeRect.top - 5}px`,
            width: `${rangeRect.width}px`,
            height: `${startElem.offsetHeight + 10}px`
        });
        
        container.appendChild(range);
    }

    static async swapElements(elem1Id, elem2Id) {
        const elem1 = document.getElementById(elem1Id);
        const elem2 = document.getElementById(elem2Id);
        
        if (!elem1 || !elem2) return;

        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        document.body.appendChild(arrow);
        
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(rect2.left - rect1.left, 2) +
            Math.pow(rect2.top - rect1.top, 2)
        );
        const angle = Math.atan2(
            rect2.top - rect1.top,
            rect2.left - rect1.left
        );
        
        Object.assign(arrow.style, {
            left: `${rect1.left + rect1.width / 2}px`,
            top: `${rect1.top + rect1.height / 2}px`,
            width: `${distance}px`,
            transform: `rotate(${angle}rad)`
        });
        
        await this.animate(5, () => {
            const tempText = elem1.textContent;
            elem1.textContent = elem2.textContent;
            elem2.textContent = tempText;
            arrow.remove();
        });
    }
}

// 添加导出语句
window.AnimationController = AnimationController;

