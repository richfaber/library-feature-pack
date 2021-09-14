'use strict';

function closest( selector ) {

    if(this['_dom'].length !== 1) return this;

    return cfp( this['_dom'][0].closest( selector ) );

}

export default closest;