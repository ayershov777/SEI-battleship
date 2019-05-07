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
        this.hull = [];
        var displacement = this.orientation ? 10 : 1;
        for(let i=0; i<this.size; i++) {
            this.hull.push({
                model: new Hull(),
                index: i*displacement
            });
        }
    }

    // toggle orientation and reshape the model
    flip() {
        this.orientation %= 1;
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
    // will remember failed indeces
    private insertAllShips() {
        for(let key in this.ships) {
            var indeces = [];
            for(let i=0; i<100; i++) {
                indeces.push(i);
            }
            while(true) {
                var randInt = Math.floor(Math.random()*indeces.length);
                var randIndex = indeces[randInt];
                if(this.checkValidIndex(key, randIndex)) {
                    this.insertShip(key, randIndex);
                    break;
                } else {
                    indeces.splice(randInt, 1);
                }
            }
        }
    }

    // Assumes that position is valid,
    // and that there will be no collision
    private insertShip(name: string, offset: number) {
        var ship = this.ships[name];
        for(let i=0; i<ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            this.data[absolute].ship = ship;
            console.log(`#${this.player.name}-cell-${absolute}`);
            let $cell = $(`#${this.player.name}-cell-${absolute}`);
            $cell.css('background-color', 'black');
        }
    }

    moveShip(ship: Ship, position: Pos) {
        
    }

    shipAt(index: number): Ship {
        return this.data[index].ship;
    }


    //double check that this method works
    private checkInbounds(name: string, offset: number): boolean {
        var ship = this.ships[name];
        var lastIndex = offset+ship.hull[ship.size-1].index;
        if(ship.orientation === Orientation.Horizontal) {
            return Math.floor(offset/10) === Math.floor(lastIndex/10);
        } else {
            return (lastIndex <= 100 && lastIndex >= 0);
        }
    }

    private checkCollision(name: string, offset: number): boolean {
        var ship = this.ships[name];
        for(let i=0; i<ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            //console.log(absolute);
            if(this.shipAt(absolute))
                return true;
        }
        return false;
    }

    private checkValidIndex(name: string, offset: number) {
        if(!this.checkInbounds(name, offset))
            return false;
        if(this.checkCollision(name, offset))
            return false;
        return true;
    }

    private static getIndexFromCoords(position: {x: number, y: number}) {
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

//var mouseShip: Ship;

// execution
