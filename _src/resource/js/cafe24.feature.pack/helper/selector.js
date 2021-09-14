
function selector( str ) {

    if(typeof str != 'string') return str;
    return (str.trim().charAt(0) == '>') ? ':scope ' + str : str;

}

export default selector;