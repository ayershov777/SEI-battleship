// class and enum declarations
type Pos = {
    x: number,
    y: number
};

enum Orientation {
    Horizontal = 0,
    Vertical = 1
}

enum ShipName {
    Carrier = 'carrier',
    Battleship = 'battleship',
    Cruiser = 'cruiser',
    Submarine = 'submarine',
    Destroyer = 'destroyer'
}

enum PlayerName {
    Player = 'player',
    Opponent = 'opponent'
}

class Ship {
    readonly name: string;
    readonly size: number;
    orientation: Orientation;
    hull: {
        hit: boolean,
        index: number // relative index
    }[];

    constructor(name: ShipName, size: number) {
        this.name = name;
        this.size = size;
        this.initOrientation();
        this.initHull();
    }

    // randomly assign orientation
    private initOrientation() {
        let n = Math.round(Math.random());
        this.orientation = n;
    }

    // generate hull based on class properties
    // assumes size and orientation are defined
    private initHull() {
        this.hull = [];
        var displacement = this.orientation ? 10 : 1;
        for(let i=0; i<this.size; i++) {
            this.hull.push({
                hit: false,
                index: i*displacement
            });
        }
    }

    // toggle orientation and modify indices
    flip() {
        if(this.orientation === Orientation.Horizontal)
            this.orientation = Orientation.Vertical;
        else
            this.orientation = Orientation.Horizontal;
        this.initHull();
    }
}

class Grid {
    readonly player: Player;
    private readonly ships : {};
    readonly model: HTMLElement;
    data: {
        ship: Ship,
        hit: boolean
    }[];

    constructor(model: HTMLElement, player: Player) {
        this.player = player;
        this.ships = {
            'carrier' : new Ship(ShipName.Carrier, 5),
            'battleship' : new Ship(ShipName.Battleship, 4),
            'cruiser' : new Ship(ShipName.Cruiser, 3),
            'submarine' : new Ship(ShipName.Submarine, 3),
            'destroyer' : new Ship(ShipName.Destroyer, 2)
        }
        this.model = model;
        this.initData();
    }

    private initData() {
        this.data = [];
        for(let i=0; i<100; i++) {
            this.data.push({ship: null, hit: false});
        }
        this.insertAllShips();
    }

    // inserts all ships randomly into the array,
    // does collision checking before inserting,
    // will remember failed indices
    private insertAllShips() {
        for(let key in this.ships) {
            var indices = [];
            for(let i=0; i<100; i++) {
                indices.push(i);
            }
            while(true) {
                var randInt = Math.floor(Math.random()*indices.length);
                var randIndex = indices[randInt];
                if(this.checkValidIndex(key, randIndex)) {
                    this.insertShip(key, randIndex);
                    break;
                } else {
                    indices.splice(randInt, 1);
                }
            }
        }
    }

    // Assumes that position is valid,
    // and that there will be no collision
    insertShip(name: string, offset: number) {
        var ship = this.ships[name];
        for(let i=0; i<ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            this.data[absolute].ship = ship;
            let $cell = $(`#${this.player.name}-cell-${absolute}`);
            $cell.addClass('ship');
            $cell.css('background-color', 'black');
        }
    }

    // only works ask expected for state 1
    removeShip(name: string) {
        var ship = this.ships[name];
        var offset = this.indexOf(name);
        for(let i=0; i<ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            this.data[absolute].ship = null;
            let $cell = $(`#${this.player.name}-cell-${absolute}`);
            $cell.removeClass('ship');
            $cell.css('background-color', '');
        }
    }

    //highlights the model of the ship
    //assumes that a ship exists at the index
    selectShip(index: number) {
        var ship = this.shipAt(index);
        var offset = this.indexOf(ship.name);
        
        var $firstCell = $(`#${this.player.name}-cell-${offset}`);
        var $lastCell = $(`#${this.player.name}-cell-${offset + ship.hull[ship.size-1].index}`);
        if(ship.orientation === Orientation.Horizontal) {
            $firstCell.css('border-left', '2px solid blue');
            $lastCell.css('border-right', '2px solid blue');
            ship.hull.forEach(hull => {
                var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
                $cell.css('border-top', '2px solid blue');
                $cell.css('border-bottom', '2px solid blue');
                $cell.addClass('selected');
            });
        } else {
            $firstCell.css('border-top', '2px solid blue');
            $lastCell.css('border-bottom', '2px solid blue');
            ship.hull.forEach(hull => {
                var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
                $cell.css('border-left', '2px solid blue');
                $cell.css('border-right', '2px solid blue');
                $cell.addClass('selected');
            });
        }
    }

    //removes highlighting from the ship model
    //assumes that a ship exists at the index
    deselectShip(index: number) {
        var ship = this.shipAt(index);
        var offset = this.indexOf(ship.name);
        
        var $firstCell = $(`#${this.player.name}-cell-${offset}`);
        var $lastCell = $(`#${this.player.name}-cell-${offset + ship.hull[ship.size-1].index}`);
        if(ship.orientation === Orientation.Horizontal) {
            $firstCell.css('border-left', '1px dotted brown');
            $lastCell.css('border-right', '1px dotted brown');
            ship.hull.forEach(hull => {
                var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
                $cell.css('border-top', '1px dotted brown');
                $cell.css('border-bottom', '1px dotted brown');
                $cell.removeClass('selected');
            });
        } else {
            $firstCell.css('border-top', '1px dotted brown');
            $lastCell.css('border-bottom', '1px dotted brown');
            ship.hull.forEach(hull => {
                var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
                $cell.css('border-left', '1px dotted brown');
                $cell.css('border-right', '1px dotted brown');
                $cell.removeClass('selected');
            });
        }
    }

    shipAt(index: number): Ship {
        return this.data[index].ship;
    }

    indexOf(name: string): number {
        var ship = this.ships[name];
        return this.data.findIndex(function(cell) {
            return cell.ship === ship;
        });
    }

    getShipModel(name: string): JQuery<HTMLElement> {
        var ship = this.ships[name];
        var offset = this.indexOf(ship.name);
        ship.hull.forEach(hull => {
            var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
            $cell.addClass('grab');
        });
        var $grab = $('.grab');
        $grab.removeClass('grab');
        return $grab;
    }

    //double check that this method works
    private checkInbounds(name: string, offset: number): boolean {
        var ship = this.ships[name];
        var lastIndex = offset+ship.hull[ship.size-1].index;
        if(ship.orientation === Orientation.Horizontal) {
            return Math.floor(offset/10) === Math.floor(lastIndex/10);
        } else {
            return (lastIndex < 100 && lastIndex >= 0);
        }
    }

    private checkCollision(name: string, offset: number): boolean {
        var ship = this.ships[name];
        for(let i=0; i<ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            if(this.shipAt(absolute))
                return true;
        }
        return false;
    }

    checkValidIndex(name: string, offset: number) {
        if(!this.checkInbounds(name, offset))
            return false;
        if(this.checkCollision(name, offset))
            return false;
        return true;
    }
}

class Player {
    name: PlayerName;
    constructor(name: PlayerName) {
        this.name = name;
    }
}

// variable initialization

const player = new Player(PlayerName.Player);
const pGridHTML = $('#player-grid')[0];
const playerGrid = new Grid(pGridHTML, player);

const opponent = new Player(PlayerName.Opponent);
const oGridHTML = $('#opponent-grid')[0];
const opponentGrid = new Grid(oGridHTML, opponent);

const game = {
    state1: function(){
        var selectedShip: Ship = null;
        var $pBattleGrid = $(playerGrid.model);
        $pBattleGrid.on('dblclick', '.ship', function(e){
            var index = parseInt(e.target.id.split('-')[2]);
            var ship = playerGrid.data[index].ship;
            var offset = playerGrid.indexOf(ship.name);
            playerGrid.deselectShip(index);
            selectedShip = null;
            playerGrid.removeShip(ship.name);
            ship.flip();
            if(playerGrid.checkValidIndex(ship.name, offset)) {
                playerGrid.insertShip(ship.name, offset);
            } else {
                ship.flip();
                playerGrid.insertShip(ship.name, offset);
            }
        });
        $pBattleGrid.on('click', '.cell', async function(e) {
            var offset = parseInt(e.target.id.split('-')[2]);
            var ship = playerGrid.shipAt(offset);
            if(selectedShip && selectedShip != ship) {
                var index = playerGrid.indexOf(selectedShip.name);
                playerGrid.deselectShip(index);

                playerGrid.removeShip(selectedShip.name);
                if(playerGrid.checkValidIndex(selectedShip.name, offset))
                    playerGrid.insertShip(selectedShip.name, offset);
                else {
                    playerGrid.insertShip(selectedShip.name, index);
                    (<any>playerGrid.getShipModel(selectedShip.name)).effect('shake', {distance: 15}, 250);
                }
                selectedShip = null;
            }
        });
        $pBattleGrid.on('click', '.ship', function(e) {
            var index = parseInt(e.target.id.split('-')[2]);
            var ship = playerGrid.data[index].ship;
            if(!selectedShip) {
                selectedShip = ship;
                playerGrid.selectShip(index);
            } else {
                selectedShip = null;
                playerGrid.deselectShip(index);
            }
        });
    }
}

// execution
game.state1();


console.log(playerGrid.getShipModel('battleship'));