'use strict';

// Information
import { information } from '../../../information';
// import { jQuery, jQueryLite } from './cafe24.feature.pack/load.vendor'; // Import jQuery 3.3.1

// Polyfill
import * as polyfill from './cafe24.feature.pack/helper/polyfill/_core';

// Utility
import * as utility from './cafe24.feature.pack/utility/_core';

// Helper
import helperSelector from './cafe24.feature.pack/helper/selector';
import extendsObject from './cafe24.feature.pack/helper/extendsObject';
import hitTest from './cafe24.feature.pack/helper/hittest';

// Method
import { boardDrag } from './cafe24.feature.pack/dragdrop/_core';

// @constructor
function featurePackage( selector ) {

    this._selector = null;

    if( selector ) {

        this._dom = [];

        if( selector instanceof HTMLElement ) { // Selector 가 DOM 일 경우

            this._dom.push(selector);
            this._selectName = this._dom.id || this._dom.className;

        } else if ( selector instanceof Array ) { // Selector 가 배열일 경우

            for(let el of selector) if( el instanceof HTMLElement ) this._dom.push( el );
            this._selectName = null;

        } else { // 그 외에 문자일 경우

            this._dom =  document.querySelectorAll( selector );
            this._selectName = selector;

        }

    }

}

// Expand feature
featurePackage.prototype = {
    constructor: featurePackage,
    boardDrag: boardDrag
};

for(let prop in utility ) if(!(prop in featurePackage.prototype)) featurePackage.prototype[prop] = utility[prop]
for(let prop in polyfill ) polyfill[prop]();

function init( selector ) {

    selector = helperSelector( selector );
    return new featurePackage( selector );
}


// Export global
Object.extendsObject = extendsObject;
Object.hitTest = hitTest;

init.version = information.version.current;
window[information.exportWord] = init;
window[information.exportShort] = init;

export default init;