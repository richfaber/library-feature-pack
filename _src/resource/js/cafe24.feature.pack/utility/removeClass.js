'use strict';

function removeClass(className) {
    if(!this['_dom']) return this;

    for(let el of this['_dom']) {
        el.classList.remove(className);
    }

    return this;
}

export default removeClass;