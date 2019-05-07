// fills both grids with 100 cells and applies a unique ordinal id to each cell

function fillGrid($grid) {
    const who = $grid.attr('id').split('-')[0];
    
    for(let i=0; i<100; i++) {
        const $cell = $(`<div id='${who}-cell-${i}' class='cell'></div>`);
        $grid.append($cell);
    }
}

//fill horizontal ruler
const $horizontalRuler = $('#horizontal-ruler');
const $
for(let i=0; i<10; i++) {
    const $cell = $(`<div class='ruler-div'>${i+1}</div>`);
    $('#ho')
}

fillGrid($('#player-grid'));
fillGrid($('#opponent-grid'));
$('#opponent-ruler-grid').hide();