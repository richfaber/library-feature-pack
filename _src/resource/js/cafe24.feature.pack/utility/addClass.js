'use strict';

function addClass(className) {

    if(!this['_dom'].length) return this;

    for(let el of this['_dom']) {
        el.classList.add(className);
    }

    return this;

}

export default addClass;