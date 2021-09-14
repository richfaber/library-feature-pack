'use strict';

function siblings() {

    if(this['_dom'].length !== 1) return this;

    let siblings = [],
        sibling = this['_dom'][0].parentNode.firstChild;

    // Loop through each sibling and push to the array
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== this['_dom'][0]) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling
    }

    return cfp(siblings);

}

export default siblings;