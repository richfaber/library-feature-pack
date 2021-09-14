'use strict';

function next() {

    if(this['_dom'].length !== 1) return this;

    return cfp(this['_dom'][0].nextSibling);
}

export default next;