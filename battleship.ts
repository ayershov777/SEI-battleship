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
    Player = 0,
    Opponent = 1
}

class Hull {
    healthy: boolean;
    model: HTMLElement;

    constructor() {
        this.healthy = true;
        this.initModel();
    }

    private initModel() {
        const $model = $(`<div></div>`);
        $model.addClass('hull hull-healthy');
        this.model = $model[0];
    }

    destroy() {
        this.healthy = false;
        const $model = $(this.model);
        $model.css('background-color', 'red');
    }
}

class Ship {
    name: String;
    size: number;
    orientation: Orientation;
    hull: {
        model: Hull,
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
        var model: Hull[] = [];
        for(let i=0; i<this.size; i++) {
            model.push(new Hull);
        }
        model.forEach((hull, i) => {
            var displacement = this.orientation ? 10 : 1;
            this.hull[i] = {
                model: hull,
                index: i*displacement
            };
        });
    }

    // toggle orientation and reshape the model
    flip() {
        this.orientation %= 1;
        this.initHull();
    }
}

class Grid {
    readonly player: Player;
    readonly ships: Ship[];
    model: HTMLElement;
    data: {
        ship: Ship,
        hit: boolean
    }[];

    constructor(model: HTMLElement, player: Player) {
        this.model = model;
        this.player = player;
        this.ships = [
            new Ship(ShipName.Carrier, 5),
            new Ship(ShipName.Battleship, 4),
            new Ship(ShipName.Cruiser, 3),
            new Ship(ShipName.Submarine, 3),
            new Ship(ShipName.Destroyer, 2)
        ];
    }

    private initData() {
        for(let i=0; i<100; i++) {
            this.data.push({ship: null, hit: false});
        }
    }

    // inserts all ships randomly into the array
    private insertAllShips() {

    }

    // Assumes that position is valid,
    // and that there will be no collision
    private insertShip(ship: Ship, position: Pos) {

    }

    moveShip(name: ShipName, position: Pos) {
        
    }

    shipAt(position: Pos): Ship {

    }

    checkCollision(ship: Ship, position: Pos): boolean {

    }

    private getIndexFromCoords(position: {x: number, y: number}) {
        return position.y*10 + position.x;
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

var mouseShip: Ship;

// I think these ships should be defined in the Grid class,
// and Ship() should accept a random position argument.
// All ships will always exist, and only within a Grid object.

/*
const pShips = [
    new Ship(ShipName.Carrier, 5),
    new Ship(ShipName.Battleship, 4),
    new Ship(ShipName.Cruiser, 3),
    new Ship(ShipName.Submarine, 3),
    new Ship(ShipName.Destroyer, 2)
];

const oShips = [
    new Ship(ShipName.Carrier, 5),
    new Ship(ShipName.Battleship, 4),
    new Ship(ShipName.Cruiser, 3),
    new Ship(ShipName.Submarine, 3),
    new Ship(ShipName.Destroyer, 2)
];*/


// execution
