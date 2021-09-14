'use strict';

/**
 * 상태변화 관리
 */
function statManage(opts) {

    this['opts'] = opts;

    this['_overlapDropArea'] = false; // 지정된 드래그 영역에 있는지
    this['_overlapItem'] = [];
    this['_overlapItemPush'] = false; // 아이템이 겹칠 경우 밀어냄,, 상세구현 해야함.

}

statManage.prototype = {
    constructor: statManage,

    /**
     * 요소에 적용된 상태 데이타 제거
     * @param {*} el
     */
    eraseStatus(el) {

        for (let prop in this['opts'].item.class) {
            // if(el.dataset['isOverlapItem'] == "true" && prop == 'overlapItem') continue;
            el.classList.remove(this['opts'].item.class[prop]);
        }

        if (el.dataset['onDropArea'] == 'true') {

        } else {

            el.dataset['inDropArea'] = false;
            el.style.position = el.dataset['orgPosition'];

        }

    },

    /**
     * 드래그 이후 아이템 복원
     * @param {*} el
     */
    fillupItem(el) {

        let cloneDom = el.cloneNode(true);
        cloneDom.style.removeProperty('top');
        cloneDom.style.removeProperty('left');
        cloneDom.style.removeProperty('width');
        cloneDom.style.removeProperty('height');

        this.eraseStatus(cloneDom);
        el.parentNode.insertBefore(cloneDom, el);

        return cloneDom;

    },

    itemZoomIn(holdItem) {

        let originalSize = {
            width: holdItem.clientWidth,
            height: holdItem.clientHeight
        };

        if(holdItem.dataset['dropColumn']) {
            // holdItem.style.width =
        }

        if(holdItem.dataset['dropRow']) {

        }

    },

    /**
     * 드래그 취소, 방금전으로 이동 & dropzone 안에서 이동
     * @param {*} el
     */
    cancelItemPositionBack(holdItem) {

        console.log('cancelItemPositionBack');

        holdItem.style.top = holdItem.t + 'px';
        holdItem.style.left = holdItem.l + 'px';

        // 마지막 좌표를 갱신
        // holdItem.endTop = holdItem.dataset['startTop'];
        // holdItem.endLeft = holdItem.dataset['startLeft'];

        this.eraseStatus(holdItem);

    },

    /**
     * 드래그 취소, 아이템을 최초의 상태로 변경
     * @param {*} el
     */
    rollbackItem(el) {

        // el.style.position = el.dataset.orgPosition;
        // el.style.top = el.dataset.orgPosition;
        // el.style.left = el.dataset.orgPosition;
        // el.style.width = el.dataset.orgPosition;
        // el.style.height = el.dataset.orgPosition;

        // this._eraseStatus( el );

    },

    /**
     * 드래그 이벤트가 끝나고 정리
     * @param el
     * @param blankDom
     * @param overlapDropArea
     * @param actionItem
     * @param gridCoord
     * @returns {Promise<any>}
     */
    arrangeAfterFinish(holdItem, actionItem, overlapDropArea, overlapItemInDropArea, gridCount, dropAllowDuplicateElement) {

        let current = {
            top: holdItem.dataset['endTop'],
            left: holdItem.dataset['endLeft']
        }, org = {
            top: holdItem.dataset['orgTop'],
            left: holdItem.dataset['orgLeft']
        }, cloneDom,
            replaceholdItem,
            statusNewItem = false,
            buttonItemDeleteElement = this['opts']['dropArea'].buttonItemDeleteElement, // @TODO: Refact target code
            deleteButton = null;

        return new Promise((resolve, reject) => {

            if (current.top == org.top && current.left == org.left) holdItem.dataset['isInList'] = true;
            else holdItem.dataset['isInList'] = false;

            holdItem.classList.add(this['opts'].item.class.end);
            holdItem.classList.remove(this['opts'].item.class.move);
            holdItem.dropAreaEl = overlapDropArea.el;

            // grid 옵션이 있을 경우에 드래그 후에 holdItem 요소 치환. 조건문이 이상한데...
            if(overlapDropArea.shadowElement) {

                // 요소가 드래그영역 안에 있는 경우
                if(holdItem.dataset['onDropArea'] == 'true') {

                    replaceholdItem = holdItem;

                    if(overlapItemInDropArea && !dropAllowDuplicateElement) {

                    } else {

                        // console.log(gridCount);
                        holdItem.style.top = overlapDropArea.el.grid[gridCount.startColumn][gridCount.startRow].startRow + 'px';
                        holdItem.style.left = overlapDropArea.el.grid[gridCount.startColumn][gridCount.startRow].startColumn + 'px';

                    }

                } else {

                    cloneDom = holdItem.cloneNode(true);
                    cloneDom.style.top = overlapDropArea.el.grid[gridCount.startColumn][gridCount.startRow].startRow + 'px';
                    cloneDom.style.left = overlapDropArea.el.grid[gridCount.startColumn][gridCount.startRow].startColumn + 'px';
                    cloneDom.style.width = holdItem.dataset['dropColumn'] * overlapDropArea.el.grid.perWidth + 'px';
                    cloneDom.style.height = holdItem.dataset['dropRow'] * overlapDropArea.el.grid.perHeight + 'px';
                    cloneDom.dataset['onDropArea'] = true;
                    cloneDom.dropAreaEl = overlapDropArea.el;

                    if(buttonItemDeleteElement) {
                        deleteButton = document.createElement(buttonItemDeleteElement.el);
                        deleteButton.type = buttonItemDeleteElement.type;
                        deleteButton.className = buttonItemDeleteElement.class;
                        deleteButton.innerHTML = buttonItemDeleteElement.innerHTML;

                        cloneDom.appendChild(deleteButton);
                    }

                    replaceholdItem = cloneDom;

                    actionItem = actionItem.filter( item => item !== holdItem );
                    actionItem.push(cloneDom);

                    overlapDropArea.el.appendChild(cloneDom);

                    holdItem.parentNode.removeChild( holdItem );
                    statusNewItem = true;

                }


                replaceholdItem.dataset['gridRangeColumnStart'] = gridCount.startColumn;
                replaceholdItem.dataset['gridRangeColumnEnd'] = gridCount.startColumn + parseInt(holdItem.dataset['dropColumn'],10);
                replaceholdItem.dataset['gridRangeRowStart'] = gridCount.startRow;
                replaceholdItem.dataset['gridRangeRowEnd'] = gridCount.startRow + parseInt(holdItem.dataset['dropRow'],10);

                overlapDropArea.el.removeChild(overlapDropArea.shadowElement);
                delete overlapDropArea.shadowElement;

            }

            resolve( {
                holdItem: replaceholdItem,
                statusNewItem: statusNewItem,
                actionItem: actionItem,
                deleteButton: deleteButton,
                overlapDropArea: overlapDropArea,
                gridFillRange: {
                    columnStart: gridCount.startColumn,
                    columnEnd: gridCount.startColumn + parseInt(holdItem.dataset['dropColumn'],10),
                    rowStart: gridCount.startRow,
                    rowEnd: gridCount.startRow + parseInt(holdItem.dataset['dropRow'],10)
                }
            } );
        });

    },

    /**
     * Context Boundry 들어갈 때
     * @param {*} e
     * @param {*} el
     * @param {*} coords
     */
    hitContextBoundryDo(e, holdItem, context, contextBoundry, dropBoundry) {

        let closedDropArea = {
            el: {
                scrollTop: 0
            }
        }, getoffDropCondition;

        for (let boundry of dropBoundry) {

            // console.log("hitContextBoundryDo", boundry.el.scrollHeight, holdItem.offsetTop);
            getoffDropCondition = Object.hitTest({
                offsetLeft: holdItem.offsetLeft,
                offsetTop: holdItem.offsetTop,
                offsetWidth: holdItem.offsetWidth,
                offsetHeight: holdItem.offsetHeight,
                offsetParent: holdItem.parentNode
            }, {
                offsetLeft: boundry.el.offsetLeft,
                offsetTop: boundry.el.offsetTop,
                offsetWidth: boundry.el.offsetWidth,
                offsetHeight: boundry.el.scrollHeight,
                offsetParent: boundry.el.parentNode
            });

            if (getoffDropCondition) {
                closedDropArea = boundry;
                // console.log(this['_overlapDropArea']);
                break;
            }

        }

        return new Promise((resolve, reject) => {

            // console.log("hitContextBoundryDo", getoffDropCondition, contextBoundry.el.offsetHeight, closedDropArea.el.scrollHeight);
            // let getoffContextCondition = Object.hitTest(holdItem, contextBoundry.el);
            let getoffContextCondition = Object.hitTest({
                offsetLeft: contextBoundry.el.offsetLeft + holdItem.offsetLeft,
                offsetTop: contextBoundry.el.offsetTop + holdItem.offsetTop + closedDropArea.el.scrollTop,
                offsetWidth: holdItem.offsetWidth,
                offsetHeight: holdItem.offsetHeight,
                offsetParent: holdItem.parentNode
            }, {
                offsetLeft: contextBoundry.el.offsetLeft,
                offsetTop: contextBoundry.el.offsetTop,
                offsetWidth: contextBoundry.el.offsetWidth,
                offsetHeight: contextBoundry.el.offsetHeight + closedDropArea.el.scrollHeight,
                offsetParent: context
            });

            if (getoffContextCondition) {
                resolve({status: {'breakContextBoundry': false}, event: e});
            } else {
                reject({status: {'breakContextBoundry': true}, event: e});
            }

        });

    },

    /**
     * Drop Boundry 들어갈 때
     * @param {*} e
     * @param {*} el
     * @param {*} coords
     */
    hitDropBoundryDo(e, holdItem, context, dropBoundry) {

        return new Promise((resolve, reject) => {

            this['_overlapDropArea'] = false;

            for (let boundry of dropBoundry) {

                // console.log("hitDropBoundryDo", boundry.el.offsetTop, boundry.el.scrollHeight);
                // console.log("================================================");

                let getoffDropCondition = Object.hitTest({
                    offsetLeft: holdItem.offsetLeft,
                    offsetTop: holdItem.offsetTop,
                    offsetWidth: holdItem.offsetWidth,
                    offsetHeight: holdItem.offsetHeight,
                    offsetParent: holdItem.parentNode
                }, {
                    offsetLeft: boundry.el.offsetLeft,
                    offsetTop: boundry.el.offsetTop,
                    offsetWidth: boundry.el.offsetWidth,
                    offsetHeight: boundry.el.scrollHeight,
                    offsetParent: context
                });

                if (getoffDropCondition) {
                    this['_overlapDropArea'] = boundry;
                    // console.log(this['_overlapDropArea']);
                    break;
                }

            }

            if (this['_overlapDropArea']) {

                holdItem.classList.add(this['opts'].item.class.overlapDropArea);
                holdItem.dataset['inDropArea'] = 'true';
                resolve({status: {'breakDropAreaBoundry': false}, event: e, el: holdItem, overlapDropArea: this['_overlapDropArea']});

            } else {

                holdItem.classList.remove(this['opts'].item.class.overlapDropArea);
                holdItem.dataset['inDropArea'] = 'false';
                reject({status: {'breakDropAreaBoundry': true}, event: e, el: holdItem, overlapDropArea: this['_overlapDropArea']});

            }


        });

    },

    /**
     * 아이템 영역에서 현재 요소와 겹치는 요소 처리
     * @param e - event
     * @param el - element
     * @param compareCoords - ActionItem 에서 현재 요소를 제외한 좌표
     * @returns {Promise<any>}
     */
    hitElementDo(e, holdItem, context, overlapDropArea, compareCoords, gridCount) {

        let overlapItemInDropArea = false,
            hitStatus = false,
            gridOpt = this['opts']['dropArea']['grid'];

        this['_overlapItem'] = [];

        function checkGridHasUse() {

            return false;
        }

        return new Promise((resolve, reject) => {

            if(gridCount && gridOpt && holdItem.dataset['inDropArea'] == 'true') {

                loopColumn:
                for(let columnCount = gridCount.startColumn, columnEndCount = gridCount.startColumn + parseInt(holdItem.dataset['dropColumn'],10); columnCount < columnEndCount; columnCount++) {

                    loopRow:
                    for(let rowCount = gridCount.startRow, rowEndCount = gridCount.startRow + parseInt(holdItem.dataset['dropRow'],10); rowCount < rowEndCount; rowCount++) {

                        if(overlapDropArea.el.grid[columnCount][rowCount].fill) {

                            hitStatus = true;
                            overlapItemInDropArea = true;
                            break loopColumn;

                        }
                    }

                }

            } else {

                for (let target of compareCoords) {

                    // hitStatus = Object.hitTest(holdItem, target.el);
                    hitStatus = Object.hitTest({
                        offsetLeft: context.offsetLeft + holdItem.offsetLeft,
                        offsetTop: context.offsetTop + holdItem.offsetTop + overlapDropArea.el.scrollTop,
                        offsetWidth: holdItem.offsetWidth,
                        offsetHeight: holdItem.offsetHeight,
                        offsetParent: holdItem.parentNode
                    }, {
                        offsetLeft: target.el.offsetLeft,
                        offsetTop: target.el.offsetTop + overlapDropArea.el.scrollTop,
                        offsetWidth: target.el.offsetWidth,
                        offsetHeight: target.el.offsetHeight,
                        offsetParent: context
                    });

                    if(target.el.dataset['onDropArea']) {

                        if (hitStatus) {

                            overlapItemInDropArea = true;

                        } else {

                            overlapItemInDropArea = false;

                        }
                    }

                    if (hitStatus) {

                        this['_overlapItem'].push(target.el);
                        target.el.classList.add(this['opts'].item.class.overlapItem);

                    } else {

                        target.el.classList.remove(this['opts'].item.class.overlapItem);

                    }

                }
            }

            if (this['_overlapItem'].length) {

                holdItem.classList.add(this['opts'].item.class.overlapItem);
                
            } else {

                holdItem.classList.remove(this['opts'].item.class.overlapItem);

            }

            resolve( {event: e, overlapItem: this['_overlapItem'], overlapItemInDropArea: overlapItemInDropArea} );

        });


    },

    /**
     * grid 옵션이 있을 경우
     * @param e - event
     * @param holdItem - target element
     * @param overlapDropArea - 현재 overlap 된 drop 좌표와 element
     * @param contextBoundryCoords - 비교 좌표
     * @returns {Promise<any>}
     */
    dropAreaInGridDo(e, holdItem, overlapDropArea) {

        let shadowElement,
            gridOpt = this['opts']['dropArea']['grid'],
            distance = {},
            gridCount,
            dropColumn = holdItem.dataset['dropColumn'],
            dropRow = holdItem.dataset['dropRow'];

        // Shadow Dom 생성
        function createShadowElement(dropAreaEl, opts) {

            if ( dropAreaEl.querySelector('.' + opts.class) ) return dropAreaEl.querySelector('.' + opts.class);

            let cloneDom = document.createElement(opts.el);
            cloneDom.className = opts.class;
            cloneDom.id = opts.id;
            cloneDom.style.position = 'absolute';

            dropAreaEl.appendChild(cloneDom, dropAreaEl);
            return cloneDom;

        }

        // Shadow Dom 위치 조정
        function calculateGridCoords(shadowElement, distance, dropColumn, dropRow) {

            let countColumn = Math.floor( distance.left / overlapDropArea.el.grid.perWidth ),
                countRow = Math.floor( distance.top / overlapDropArea.el.grid.perHeight ),
                width,
                height;

            width = dropColumn * overlapDropArea.el.grid.perWidth;
            height = dropRow * overlapDropArea.el.grid.perHeight;

            shadowElement.style.left = overlapDropArea.el.grid[countColumn][countRow].startColumn + 'px';
            shadowElement.style.top = overlapDropArea.el.grid[countColumn][countRow].startRow + 'px';
            shadowElement.style.width = width + 'px';
            shadowElement.style.height = height + 'px';

            return { startColumn: countColumn, startRow: countRow }

        }

        return new Promise((resolve, reject) => {

            if (this['opts'].dropArea.hasOwnProperty('grid')) {

                distance = {
                    top: holdItem.getBoundingClientRect().top - overlapDropArea.el.getBoundingClientRect().top + overlapDropArea.el.scrollTop,
                    left: holdItem.getBoundingClientRect().left - overlapDropArea.el.getBoundingClientRect().left
                };

                if(distance.top < 0 ) distance.top = 0;
                if(distance.left < 0 ) distance.left = 0;

                shadowElement = createShadowElement(overlapDropArea.el, gridOpt['gridHoverElement']);
                gridCount = calculateGridCoords(shadowElement, distance, dropColumn, dropRow);

                overlapDropArea.shadowElement = shadowElement;

            }

            resolve( { event: e, overlapDropArea: overlapDropArea, gridCount: gridCount } );

        });

    },

    /**
     * 아이템 position 으로 교체
     * @param el - element
     * @returns {object} itemStartCoords - position 배치하기 전 좌표
     */
    arrangeItemAbsolute: (el) => {

        const itemStartCoords = {
            top: el.t || el.dataset['orgTop'],
            left: el.l || el.dataset['orgLeft']
        };

        el.style.position = 'absolute';
        el.style.top = itemStartCoords.top + 'px';
        el.style.left = itemStartCoords.left + 'px';
        el.style.width = el.dataset['orgWidth'] + 'px';
        el.style.height = el.dataset['orgHeight'] + 'px';

        return itemStartCoords;

    },

    getOverlapItem: () => this['_overlapItem'],

};

export default statManage
