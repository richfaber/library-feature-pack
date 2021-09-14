'use strict';

/**
 * 데이터 기록관리
 */
function dataManage(opts) {

    this['opts'] = opts;
    this['_coords'] = null;
    this['_currentCoords'] = null;
    this['_dropBoundry'] = [];
    this['_contextBoundry'] = [];
    this['_overlapItem'] = [];
    this['_overlapDropArea'] = false;
    this['_breakContextBoundry'] = false;
    this['_breakDropAreaBoundry'] = false;
    this['_gridCoord'] = null;

}

dataManage.prototype = {
    constructor: dataManage,

    recordNecessaryContext( context ) {

        // Context 좌표 기록
        this['_contextBoundry'] = {
            el: context,
            t: context.getBoundingClientRect().top + document.documentElement.scrollTop,
            l: context.getBoundingClientRect().left + document.documentElement.scrollLeft,
            b: context.getBoundingClientRect().top + document.documentElement.scrollTop + context.clientHeight,
            r: context.getBoundingClientRect().left + document.documentElement.scrollLeft + context.clientWidth
        };

    },

    recordNecessaryDropArea( context, dropAreaOpt ) {

        // Drop 영역 좌표 기록
        for(let selector of dropAreaOpt.selector) {

            let dropEl = context.querySelectorAll( selector );
            dropEl.forEach( (dropAreaEl, idx) => {

                let boundryData = {
                    el: dropAreaEl,
                    t: dropAreaEl.getBoundingClientRect().top + context.scrollTop,
                    l: dropAreaEl.getBoundingClientRect().left + context.scrollLeft,
                    b: dropAreaEl.getBoundingClientRect().top + context.scrollTop + dropAreaEl.scrollHeight,
                    r: dropAreaEl.getBoundingClientRect().left + context.scrollLeft + dropAreaEl.clientWidth
                };

                if(dropAreaOpt.grid) {
                    dropAreaEl.grid = this.createGridTable(dropAreaEl, dropAreaOpt);
                }

                this['_dropBoundry'].push( boundryData );

            });
        }

    },

    /**
     * 아이템에 필요한 데이터 기록
     * @param {*} els - target element
     * @param {*} status - 
     */
    recordNecessaryItem(els) {

        let recordStyleRef = ['Top', 'Left', 'Width', 'Height', 'Position'];

        function record(el) {

            let elCssStyle = getComputedStyle(el);
            recordStyleRef.forEach(item => {

                switch(item) {

                    case 'Top':
                        el.dataset['org'+item] = el.offsetTop;
                        break;

                    case 'Left':
                        el.dataset['org'+item] = el.offsetLeft;
                        break;

                    case 'Width':
                        el.dataset['org'+item] = el.offsetWidth;
                        break;

                    case 'Height':
                        el.dataset['org'+item] = el.offsetHeight;
                        break;

                    default:
                        el.dataset['org'+item] = elCssStyle[item] || 'static';

                }

            });

            el.t = 0;
            el.l = 0;
            el.r = 0;
            el.b = 0;
            el.dataset['isInList'] = true;
        }

        function getBack() {

            recordStyleRef.forEach(item => {

                el.style[item] = el.dataset['org'+item];

            });

        }

        return new Promise((resolve, reject) => {

            if(els instanceof Array) els.forEach(el => record(el));
            else record(els);

            resolve();
        });

    },

    // 현재의 시작점 기록
    recordStartCoords(e, context, currentEl, actionEl) {

        currentEl.l = parseInt(currentEl.style.left, 10);
        currentEl.t = parseInt(currentEl.style.top, 10);

        this['_currentCoords'] = [];
        for (let el of actionEl) {

            // if (el === currentEl) continue;

            this['_currentCoords'].push({
                el: el,
                t: el.offsetTop,
                l: el.offsetLeft,
                b: el.offsetTop + el.clientHeight,
                r: el.offsetLeft + el.clientWidth,
            });

        }

    },

    // 이벤트 끝난 후 현재 위치 기록
    recordEndCoords(e, context, currentEl, actionEl, overlapDropArea) {

        for (let el of actionEl) {

            // if (el === currentEl) continue;
            el.t = el.offsetTop;
            el.l = el.offsetLeft;
            el.b = el.t + el.clientHeight;
            el.r = el.l + el.clientWidth;

        }

    },

    createGridTable(currentEl, dropAreaOpt) {

        let perWidth = currentEl.clientWidth / dropAreaOpt.grid.unit.widthLength,
            perHeight = dropAreaOpt.grid.unit.height;

        let grid = [];
        grid['perWidth'] = perWidth;
        grid['perHeight'] = perHeight;

        for(let c = 0, d = dropAreaOpt.grid.unit.widthLength; c < d; c++) {
            grid[c] = [];

            for(let a = 0, b = 300; a<b; a++) {

                let gridSet = {
                    startColumn: perWidth * c,
                    startRow: perHeight * a,
                    endColumn: (perWidth * c) + perWidth,
                    endRow: (perHeight * a) + perHeight,
                    fill: false,
                    fillItem: null
                };

                grid[c][a] = gridSet
            }
        }

        return grid;

    },

    registerGridFill(dropBoundryEl, holdItem, startColumn, endColumn, startRow, endRow) {

        for(let columnCount = startColumn, columnEndCount = endColumn; columnCount < columnEndCount; columnCount++) {

            for(let rowCount = startRow, rowEndCount = endRow; rowCount < rowEndCount; rowCount++) {
                dropBoundryEl.grid[columnCount][rowCount].fill = true;
                dropBoundryEl.grid[columnCount][rowCount].fillItem = holdItem;

            }

        }

        return dropBoundryEl;
    },

    removeGridFill(dropBoundryEl, holdItem, startColumn, endColumn, startRow, endRow) {

        for(let columnCount = startColumn, columnEndCount = endColumn; columnCount < columnEndCount; columnCount++) {

            for(let rowCount = startRow, rowEndCount = endRow; rowCount < rowEndCount; rowCount++) {
                dropBoundryEl.grid[columnCount][rowCount].fill = false;
                dropBoundryEl.grid[columnCount][rowCount].fillItem = null;
            }

        }

        return {
            dropBoundryEl: dropBoundryEl,
            startColumn: startColumn,
            endColumn: endColumn,
            startRow: startRow,
            endRow: endRow
        };
    }
    
};

export default dataManage