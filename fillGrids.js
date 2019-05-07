// this file renders the remaining HTML before battleship.js is invoked

// fills both grids with 100 cells and applies a unique ordinal id to each cell
function fillGrid($grid) {
    const who = $grid.attr('id').split('-')[0];
    for(let i=0; i<100; i++) {
        const $cell = $(`<div id='${who}-cell-${i}' class='cell'></div>`);
        $grid.append($cell);
    }
}

fillGrid($('#player-grid'));
fillGrid($('#opponent-grid'));

//fill horizontal ruler
const $horizontalRuler = $('.horizontal-ruler');
for(let i=0; i<10; i++) {
    const $cell = $(`<div class='ruler-div horizontal-ruler-div'>${i+1}</div>`);
    $horizontalRuler.append($cell);
}

//fill vertical ruler
const $verticalRuler = $('.vertical-ruler');
for(let i=65; i<75; i++) {
    const c = String.fromCharCode(i);
    const $cell = $(`<div class='ruler-div vertical-ruler-div'>${c}</div>`);
    $verticalRuler.append($cell);
}

$('#opponent-ruler-grid').hide();