'use strict';

import dataManage from './boardDrag.data.manage';
import statManage from './boardDrag.stat.manage';

function core(opts) {

    for (let el of this._dom) {
        window[`__cfp${el.id}`] = new boardDrag(opts, el);
    }

    return this;
}

const Defaults = {
    item: {
        class: {
            over: 'over',
            down: 'down',
            move: 'move',
            end: 'end',
            overlapItem: 'overlap',
            overlapDropArea: 'overlapdropArea'
        },
        blankElement: {el: 'span', class: 'blank'}
    },
    dropArea: [],
    callback: {
        itemDragEnd: (holdItem, coords, data) => {
        },
        itemDblClickOnDrop: (item, isOverlapDropArea) => {
        },
        itemDragMove: () => {

        }
    }
};


/**
 * 보드 드래그
 * @TODO - Transform 옵션 추가
 * @TODO - Callback 추가 [bootstrap, dragdown, dragmove, dragup]
 * @param opts
 * @param context
 */
function boardDrag(opts, context) {

    this['_context'] = context;
    this['_actionItem'] = [];
    this['_startCoordsForCompare'] = {};

    this['opts'] = Object.extendsObject(Defaults, opts);

    this.dataManage = new dataManage(this['opts']);
    this.statManage = new statManage(this['opts']);

    this._onready = false;
    this._holdItem = null;
    this._isMove = false;
    this._killItemAfterDragEnd = true; // 드래그 후 원본 삭제

    this.bootstrap();
    // this['_context'].boardDrag = publicMethod;
}

boardDrag.prototype = {
    constructor: boardDrag,

    bootstrap() {

        if (this['opts'].hasOwnProperty('killItemAfterDragEnd')) this['_killItemAfterDragEnd'] = this['opts'].killItemAfterDragEnd;
        if (this['opts'].hasOwnProperty('dropAllowDuplicateElement')) this['_dropAllowDuplicateElement'] = this['opts'].dropAllowDuplicateElement;
        if (this['opts']['dropArea'].hasOwnProperty('buttonItemDeleteElement')) this['_buttonDropAreaItemDeleteOpt'] = this['opts']['dropArea'].buttonItemDeleteElement;

        // if (this['opts'].hasOwnProperty('dragAfterFitGrid')) this['_dragAfterFitGrid'] = this['opts'].dragAfterFitGrid;

        for (let itemSelector of this['opts'].item.selector) {
            this['_context'].querySelectorAll(itemSelector).forEach(el => this['_actionItem'].push(el));
        }

        this._dragMoveListener = this.move.bind(this);
        this._dragEndListener = this.end.bind(this);
        this._dragDownListener = this.down.bind(this);

        this._dblClickListener = this.itemDblClickOnDrop.bind(this);
        this._deleteClickListener = this.itemDeleteOnDrop.bind(this);

        this._mouseoverListener = this.over.bind(this);
        this._mouseoutListener = this.out.bind(this);

        this.dataManage.recordNecessaryContext(this['_context']);
        this.dataManage.recordNecessaryDropArea(this['_context'], this['opts'].dropArea);

        this.initializeStyle();

        this.dataManage.recordNecessaryItem(this['_actionItem']);

        for (let el of this['_actionItem']) {
            el.addEventListener('mouseover', this._mouseoverListener, false);
            el.addEventListener('mouseout', this._mouseoutListener, false);
        }

        this['_context'].addEventListener('mousedown', this._deleteClickListener, true);
        this['_context'].addEventListener('dblclick', this._dblClickListener, false);
        this['_context'].addEventListener('mousedown', this._dragDownListener, false);

    },

    out(e) {

        const target = this.matchEl(e.target, this['_context']);
        if (!target) return;

        target.classList.remove(this['opts'].item.class.over);

    },

    over(e) {

        const target = this.matchEl(e.target, this['_context']);
        if (!target) return;

        target.classList.add(this['opts'].item.class.over);

    },

    down(e) {
        
        if (e.button != 0) return;

        if (this['_onready']) return;
        
        const target = this.matchEl(e.target, this['_context']);

        if (!target) return;

        if (e) e.preventDefault();

        this['_onready'] = true;

        this['_holdItem'] = target;
        this['_holdItem'].classList.remove(this['opts'].item.class.end);
        this['_holdItem'].classList.add(this['opts'].item.class.down);
        this['_holdItem'].style.zIndex = 1000;

        if (getComputedStyle(this['_holdItem']).position == 'static') {

            this.statManage.arrangeItemAbsolute(this['_holdItem']);

        }

        if (this['_holdItem'].dataset['onDropArea'] == 'true') {

            this.dataManage['_gridCount'] = this.dataManage.removeGridFill(
                this['_holdItem'].dropAreaEl,
                this['_holdItem'],
                parseInt(this['_holdItem'].dataset['gridRangeColumnStart'], 10),
                parseInt(this['_holdItem'].dataset['gridRangeColumnEnd'], 10),
                parseInt(this['_holdItem'].dataset['gridRangeRowStart'], 10),
                parseInt(this['_holdItem'].dataset['gridRangeRowEnd'], 10)
            );

        } else {

            this['_itemBlankDom'] = this.createBlankEl();
            this['_holdItem'].parentNode.insertBefore(this['_itemBlankDom'], this['_holdItem']);

        }

        this['_startCoords'] = {
            left: e.pageX,
            top: e.pageY
        };

        this.dataManage.recordStartCoords(e, this['_context'], this['_holdItem'], this['_actionItem']);

        document.addEventListener('mouseup', this._dragEndListener);
        document.addEventListener('mousemove', this._dragMoveListener);

    },

    move(e) {

        if (this['_startCoords'].x == e.pageX && this['_startCoords'].y == e.pageY) return;
        if (!this['_onready']) return;
        if (e) e.preventDefault();

        let distance = {
            left: e.pageX - this['_startCoords'].left,
            top: e.pageY - this['_startCoords'].top
        };

        if (!this['_isMove']) {

            this['_holdItem'].classList.remove(this['opts'].item.class.down);
            this['_holdItem'].classList.add(this['opts'].item.class.move);
            this.statManage.itemZoomIn(this['_holdItem']);

            this['_isMove'] = true;

        }

        this['_holdItem'].style.top = distance.top + this['_holdItem'].t + 'px';
        this['_holdItem'].style.left = distance.left + this['_holdItem'].l + 'px';

        this.statManage
            .hitContextBoundryDo(e, this['_holdItem'], this['_context'], this.dataManage['_contextBoundry'], this.dataManage['_dropBoundry']) // Context에 들어가거나 나갈때
            .then(res => {

                // overlapDropArea 좌표기록
                if (!res.status.breakContextBoundry && res.status.breakContextBoundry != this.dataManage['_breakContextBoundry']) { // 컨텍스트 영역이 아닐 때

                    this.dataManage['_breakContextBoundry'] = res.status.breakContextBoundry;

                    // 콜백 호출
                    this['opts'].callback['itemContextAreaIn'](
                        res.event,
                        this['_holdItem'],
                        this.dataManage['_contextBoundry']);

                }

                return {event: res.event};

            })
            .then(res => this.statManage.hitDropBoundryDo(res.event, this['_holdItem'], this['_context'], this.dataManage['_dropBoundry'])) // DropArea 에 들어가거나 나갈때
            .then(res => {

                this.dataManage['_overlapDropArea'] = res.overlapDropArea;
                this.itemMoveOnDrop(res.event, this['_holdItem'], this.dataManage['_overlapDropArea']);


                if (!res.status.breakDropAreaBoundry && res.status.breakDropAreaBoundry != this.dataManage['_breakDropAreaBoundry']) { // 컨텍스트 영역 들어올때

                    this.dataManage['_breakDropAreaBoundry'] = res.status.breakDropAreaBoundry;

                    // 콜백 호출
                    this['opts'].callback['itemAreaInOnDrop'](res.event, this['_holdItem'], this.dataManage['_overlapDropArea']);

                }

                return {event: res.event};

            })
            .then(res => this.statManage.dropAreaInGridDo(res.event, this['_holdItem'], this.dataManage['_overlapDropArea'])) // dropArea 에 grid 설정이 되었을 경우 그리드 요소 생성
            .then(res => {

                // 갱신된 overlapDropArea 기록
                this.dataManage['_overlapDropArea'] = res.overlapDropArea;
                this.dataManage['_gridCount'] = res.gridCount;

                return {event: res.event};

            })
            .then(res => this.statManage.hitElementDo(res.event, this['_holdItem'], this['_context'], this.dataManage['_overlapDropArea'], this.dataManage['_currentCoords'], this.dataManage['_gridCount'])) // 요소가 겹칠때
            .then(res => {

                // overlapItem 좌표기록
                this.dataManage['_overlapItem'] = res.overlapItem;
                this.dataManage['_overlapItemInDropArea'] = res.overlapItemInDropArea;

                return {event: res.event};

            })
            .catch(res => {

                if (res instanceof Error) {

                    console.log(res);

                } else {

                    if (res.status.breakContextBoundry && this.dataManage['_breakContextBoundry'] != res.status.breakContextBoundry) { // 컨텍스트 영역이 아닐 때

                        this.dataManage['_breakContextBoundry'] = res.status.breakContextBoundry;

                        // 콜백 호출
                        this['opts'].callback['itemContextAreaOut'](
                            res.event,
                            this['_holdItem'],
                            this.dataManage['_contextBoundry']);
                    }

                    if (res.status.breakDropAreaBoundry && this.dataManage['_breakDropAreaBoundry'] !== res.status.breakDropAreaBoundry) {

                        // 드래그 영역이 아닐 때
                        this.dataManage['_breakDropAreaBoundry'] = res.status.breakDropAreaBoundry;

                        // 콜백 호출
                        this['opts'].callback['itemAreaOutOnDrop'](
                            res.event,
                            this['_holdItem'],
                            this.dataManage['_overlapItem']);

                    }

                    if (res.status == 'dropAllowDuplicateElement') { // 만약에 요소들이 밀려 나간다면 여기에 구현

                    }

                }

            });

    },

    end(e, status) {

        // if(e) return;

        this['_onready'] = false;
        this['_isMove'] = false;

        if (this.dataManage['_breakContextBoundry'] || !this.dataManage['_overlapDropArea'] || this.dataManage['_breakDropAreaBoundry'] || (this.dataManage['_overlapItemInDropArea'] && !this['_dropAllowDuplicateElement'])) {

            this.statManage.cancelItemPositionBack(this['_holdItem']);

        } else {

            // 아이템이 dropArea 에 overlap 되어 있는 상태
            if (this.dataManage['_overlapDropArea']) {

                // 드래그 후 삭제옵션이 false 면
                if (!this['_killItemAfterDragEnd']) {

                    // 현재 요소가 dropArea 안의 요소일 때
                    if (this['_holdItem'].dataset['onDropArea'] == 'true') {

                    } else {

                        this['_actionItem'].push(this.statManage.fillupItem(this['_holdItem']));

                    }

                }
            }


            // 모든 작업이 끝난 후 뒷정리
            this.statManage
                .arrangeAfterFinish(
                    this['_holdItem'],
                    this['_actionItem'],
                    this.dataManage['_overlapDropArea'],
                    this.dataManage['_overlapItemInDropArea'],
                    this.dataManage['_gridCount'],
                    this['_dropAllowDuplicateElement']
                ).then(res => {

                // 새로운 actionItem 일 경우
                if (res.statusNewItem) {

                    this['_holdItem'] = res.holdItem;
                    this['_actionItem'] = res.actionItem;

                    this['_holdItem'].addEventListener('mouseover', this._mouseoverListener, false);
                    this['_holdItem'].addEventListener('mouseout', this._mouseoutListener, false);

                }

                this.dataManage.registerGridFill(
                    this.dataManage['_overlapDropArea'].el,
                    this['_holdItem'],
                    parseInt(this['_holdItem'].dataset['gridRangeColumnStart'], 10),
                    parseInt(this['_holdItem'].dataset['gridRangeColumnEnd']),
                    parseInt(this['_holdItem'].dataset['gridRangeRowStart']),
                    parseInt(this['_holdItem'].dataset['gridRangeRowEnd'])
                );

                this.statManage.eraseStatus(this['_holdItem']);
                this.dataManage.recordEndCoords(e, this['_context'], this['_holdItem'], this['_actionItem'], this.dataManage['_overlapDropArea']);

                this.adjustmentSpace(this['_holdItem'], this.dataManage['_overlapDropArea']);

                this.itemDragEndOnDrop(e, this['_holdItem'], this['_overlapDropArea']);

                this.dataManage['_overlapDropArea'] = false;
                this['_itemBlankDom'] = null;

            }).then(res => {


            });
        }

        if (this['_itemBlankDom']) this['_itemBlankDom'].parentNode.removeChild(this['_itemBlankDom']);
        if (this.dataManage['_overlapDropArea'].el) {

            if (this.dataManage['_overlapDropArea'].shadowElement) {

                this.dataManage['_overlapDropArea'].el.removeChild(this.dataManage['_overlapDropArea'].shadowElement);
                delete this.dataManage['_overlapDropArea'].shadowElement;

            }

        }

        this['_holdItem'].style.zIndex = 10;

        document.removeEventListener('mouseup', this._dragEndListener);
        document.removeEventListener('mousemove', this._dragMoveListener);

        return false;

    },

    createBlankEl() {

        let element = document.createElement(this['opts'].item.blankElement.el);

        element.classList.add(this['opts'].item.blankElement.class || 'blank');
        element.classList.add('blankInsert');

        element.id = this['opts'].item.blankElement.id || '';

        if (this['_holdItem'].dataset['isInList'] == 'false') {
            element.style.position = 'absolute';
            element.style.left = this['_holdItem'].style.left;
            element.style.top = this['_holdItem'].style.top;
        }

        element.style.width = this['_holdItem'].style.width;
        element.style.height = this['_holdItem'].style.height;

        return element;

    },

    // sourceEl 이 actionItem 요소가 아니면 추적해서 actionItem 을 return
    matchEl(sourceEl, context) {

        let originalEl = sourceEl,
            compareEl;

        if(!originalEl.parentNode) return false;

        for (let el of this['_actionItem']) {
            compareEl = sourceEl;
            if (el === originalEl) return el;
            while (compareEl !== context) {
                compareEl = compareEl.parentNode;
                if (compareEl == null) return false;
                if (el === compareEl) return compareEl;
            }

        }

        return false;
    },

    // 기능 동작을 위한 스타일 지정이 되지 않았을 경우, 최소한의 스타일 정의, 한번만 실행
    initializeStyle() {

        if (getComputedStyle(this['_context']).position == 'static') {
            this['_context'].style.position = 'relative';
        }

        for (let dropBoundryArea of this.dataManage['_dropBoundry']) {

            if (getComputedStyle(dropBoundryArea.el).position == 'static') {
                dropBoundryArea.el.style.position = 'relative';
            }

            dropBoundryArea.el.style.overflow = 'hidden auto';

        }

    },

    adjustmentSpace(holdItem, overlapDropArea) {

        let perHeight = overlapDropArea.el.clientHeight;

        // console.log(holdItem.b, holdItem.b);

        if (holdItem.b > overlapDropArea.b) {

            if (overlapDropArea.spaceEl) {

                overlapDropArea.spaceEl.style.height = overlapDropArea.spaceEl.clientHeight + perHeight + 'px';

            } else {

                let spaceDiv = document.createElement('div');
                spaceDiv.className = 'adjustSpace';
                spaceDiv.style.position = 'relative';
                spaceDiv.style.opacity = '0';
                spaceDiv.style.height = (perHeight * 2) + 'px';
                spaceDiv.style.width = 0 + 'px';

                overlapDropArea.el.appendChild(spaceDiv);
                overlapDropArea.spaceEl = spaceDiv;

            }

        }

        return overlapDropArea;

    },

    itemDblClickOnDrop(e, holdItem, overlapDropArea) {

        this['opts'].callback['itemDblClickOnDrop'](e, holdItem, overlapDropArea);

    },

    itemMoveOnDrop(e, holdItem, overlapDropArea) {

        // 콜백 호출
        this['opts'].callback['itemMoveOnDrop'](e, holdItem, overlapDropArea);

    },

    itemDragEndOnDrop(e, holdItem, overlapDropArea) {

        this['opts'].callback['itemDragEndOnDrop'](e, holdItem, overlapDropArea);

    },

    itemDeleteOnDrop(e) {

        let target = e.target;

        while(true) {

            if(target.className == this['_buttonDropAreaItemDeleteOpt'].class) break;
            target = target.parentNode;

            if(target == this['_context']) return;
        }

        if (!target) return;
        target = this.matchEl(target, this['_context']);

        let onDropArea = true;

        if (onDropArea) {

            this['_actionItem'] = this['_actionItem'].filter(item => item !== target);
            this.dataManage.removeGridFill(
                target.dropAreaEl,
                target,
                parseInt(target.dataset['gridRangeColumnStart'], 10),
                parseInt(target.dataset['gridRangeColumnEnd'], 10),
                parseInt(target.dataset['gridRangeRowStart'], 10),
                parseInt(target.dataset['gridRangeRowEnd'], 10)
            );
            this['opts'].callback['itemDeleteOnDrop'](e, this['_holdItem'], this.dataManage['_overlapDropArea']);

            target.parentNode.removeChild(target);

        } else {

        }


    }

};

export default core;
