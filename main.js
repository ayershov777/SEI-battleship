const grid = document.querySelector('.grid');

for(let i=0; i<100; i++) {
    cell = document.createElement('div');
    cell.setAttribute('class', 'cell');
    cell.setAttribute('id', i + 'p');
    grid.appendChild(cell);
}

const shipyard = document.querySelector('.shipyard');
var mouseShip = undefined;

class Player {
    static moveShipStateOn() {
        document.body.addEventListener('wheel', Ship.toggleOrientation);
        document.body.addEventListener('mousemove', Ship.followMouse);
        document.body.addEventListener('mousedown', Ship.drop)
        shipyard.removeEventListener('mouseup', Ship.select);
    }

    static moveShipStateOff() {
        document.body.removeEventListener('wheel', Ship.toggleOrientation);
        document.body.removeEventListener('mousemove', Ship.followMouse);
        document.body.removeEventListener('mousedown', Ship.drop);
        shipyard.addEventListener('mouseup', Ship.select);
    }
}

class Ship {
    static followMouse(e) {
        mouseShip.style.left = e.clientX + 4 + 'px';
        mouseShip.style.top = e.clientY + 4 + 'px';
    }

    static toggleOrientation(e) {
        let temp = mouseShip.style.width;
        mouseShip.style.width = mouseShip.style.height;
        mouseShip.style.height = temp;
    }

    static select(e) {
        if(e.target.getAttribute('class') === 'ship'){
            mouseShip = e.target;
            mouseShip.style.position = 'absolute';
            mouseShip.style.left = e.clientX + 4 + 'px';
            mouseShip.style.top = e.clientY + 4 + 'px';
            Player.moveShipStateOn();
        }
    }

    static drop(e) {

        // drop back in shipyard
        if(e.target.getAttribute('class') !== 'cell') {
            if(parseInt(mouseShip.style.width) < parseInt(mouseShip.style.height)){
                Ship.toggleOrientation();
            }
            
            Player.moveShipStateOff();
            mouseShip.style.position = 'static';
            shipyard.appendChild(mouseShip);
            mouseShip = undefined;
        }
        
        // drop in player grid
        else {
            let index = parseInt(e.target.id);
            let width = parseInt(mouseShip.style.width)/48;
            let height = parseInt(mouseShip.style.height)/48;

            let d, size;
            if(width > height) {
                d = 1;
                size = width;
            } else {
                d = 10;
                size = height;
            }

            if((d===1 && index%10 > 10-size) || (d===10 && Math.floor(index/10) > 10-size)) {
                console.log('out of bounds');
            } else {
                let collision = Ship.checkCollision(size, index, d, 'p');
                if(!collision) {
                    Ship.placeInGrid(size, index, d, 'p');
                    Player.moveShipStateOff();
                    shipyard.removeChild(mouseShip);
                    mouseShip = undefined;
                }
            }
        }
    }

    //grid is either 'p' or 'o'
    static placeInGrid(size, index, d, grid) {
        let color = grid === 'p' ? 'blue' : 'white';

        for(let i=0; i<size; i++) {
            cell = document.getElementById(index+d*i + grid);
            cell.style.backgroundColor = color;
        }
    }

    static checkCollision(size, index, d, grid) {
        for(let i=0; i<size; i++) {
            cell = document.getElementById(index+d*i + grid);
            if(grid === 'o') console.log(index+d*i)
            if(cell.style.backgroundColor !== '')
                return true;
        }
        return false;

    }


    constructor(size) {
        this.model = document.createElement('div');
        this.model.setAttribute('class', 'ship');
        this.model.style.width = size*48 + 'px';
        this.model.style.height = '48px';
        shipyard.appendChild(this.model);
    }
}

shipyard.addEventListener('mouseup', Ship.select);

const carrier = new Ship(5);
const battleship = new Ship(4);
const cruiser = new Ship(3);
const submarine = new Ship(3);
const destroyer = new Ship(2);
const ships = [carrier, battleship, cruiser, submarine, destroyer];

document.querySelector('button#ready').addEventListener('click', ()=>{
    if(shipyard.childElementCount === 0) {
        let game = document.querySelector('.game');
        game.removeChild(shipyard);
        oppGrid = document.createElement('div');
        oppGrid.setAttribute('class', 'grid');
        oppGrid.setAttribute('id', "opponent-grid");
        for(let i=0; i<100; i++) {
            cell = document.createElement('div');
            cell.setAttribute('class', 'cell');
            cell.setAttribute('id', i + 'o');
            oppGrid.appendChild(cell);
        }
        game.appendChild(oppGrid);

        setupAI();
        play();
        //document.body.removeChild();
    } else {
        alert('You must place all ships in the grid!');
    }
});

function setupAI() {
    ships.forEach(ship => {
        let orientation = Math.round(Math.random());
        let d, size, xi, xf, yi, yf;
        if (orientation) {
            let temp = ship.model.style.width;
            ship.model.style.width = ship.model.style.height;
            ship.model.style.height = temp;
            d = 10;
            size = parseInt(ship.model.style.height)/48;
            xi = 0;
            xf = 10;
            yi = 0;
            yf = 10-size;
        } else {
            d = 1;
            size = parseInt(ship.model.style.width)/48;
            xi = 0;
            xf = 10-size;
            yi = 0;
            yf = 10;
        }

        //alert('orientation: ' + (d===1 ? 'horizontal' : 'vertical') + "\nsize: " + size + "\nxi: " + xi + '\nxf: ' + xf + '\nyi: ' + yi + '\nyf: ' + yf );

        let validPositions = [];
        for(let i=yi; i<yf; i++){
            for(let j=xi; j<xf; j++){
                let index = getIndexFromCoords(j, i);
                validPositions.push(index);
            }
        }

        let placed = false;
        while(!placed) {
            let n = Math.floor(Math.random()*validPositions.length);
            let randomIndex = validPositions[n];
            
            if(Ship.checkCollision(size, randomIndex, d, 'o')) {
                validPositions.splice(randomIndex, 1);
            } else {
                placed = true;
                Ship.placeInGrid(size, randomIndex, d, 'o');
            }
        }
    });
}

function getIndexFromCoords(x, y) {
    return y*10+x;
}


// main game-play starts here!
var playerHits = 0;
var aiHits = 0;
var opp;
function play() {
    opp = document.getElementById('opponent-grid');
    opp.addEventListener('click', playerFire);
}

const playerFire = function(e) {
    let cell = e.target;
    let skipAI;

    if(cell.style.backgroundColor === 'white') {
        cell.style.backgroundColor = 'red';
        playerHits++;
        skipAI = true;
    } else {
        cell.style.backgroundColor = 'teal';
        skipAI = false;
    }

    if (playerHits === 17){
        alert("you win!");
        opp.removeEventListener('click', playerFire);
    }

    if(!skipAI) {
        aiFire();
    }
}

var aiChoices = [];
var adjacentCells = [];

for(let i=0; i<100; i++) {
    aiChoices.push(i+'p');
}

function aiFire() {
    let aiTurn = true;
    while(aiTurn) {
       // if(adjacentCells.length === 0) {

        //} else {
            let randIndex = Math.floor(Math.random()*aiChoices.length);
            let cell = document.getElementById(aiChoices[randIndex]);
            if(cell.style.backgroundColor === 'blue') {
                cell.style.backgroundColor = 'red'
                aiHits++;
                aiTurn = true;
            } else {
                cell.style.backgroundColor = 'teal';
                aiTurn = false;
            }
            aiChoices.splice(randIndex, 1);

            if(aiHits === 17) {
                alert("you loose!");
                opp.removeEventListener('click', playerFire);
                break;
            }
        //}
    }
}