'use strict';


document.addEventListener('DOMContentLoaded', () => {

    /*let $printCode = $('.printcode'),
        $preview = $(`<div class="sourcePreview"></div>`);

    $printCode.each( (idx, dom) => {
        let $target = $(dom).find('script'),
            prop = $target.data('style');

        if(prop) $preview.prop('style', prop);

        $preview.html($printCode.find('script').html());
        $printCode.after( $preview );
    });*/

    let $printCode = $('.printcode');

    $printCode.each((idex, dom) => {
        let $target = $(dom).find('script'),
            $preview = $(`<div class="sourcePreview"></div>`),
            prop = $target.data('style');

        if(prop) $preview.prop('style', prop);

        $preview.html($(dom).find('script').html());
        $(dom).after( $preview );
    });

});
