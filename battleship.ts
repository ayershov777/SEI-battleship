// class and enum declarations
type Hull = {
    hit: boolean,
    index: number, // relative index
    element: HTMLElement
};

enum Orientation {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
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
    hull: Hull[];

    constructor(name: ShipName, size: number) {
        this.name = name;
        this.size = size;
        this.initOrientation();
        this.initHull();
    }

    // randomly assign orientation
    private initOrientation() {
        let n = Math.round(Math.random());
        this.orientation = n ? Orientation.Vertical : Orientation.Horizontal;
    }

    // generate hull based on class properties
    // assumes size and orientation are defined
    private initHull() {
        this.hull = [];
        var displacement = this.orientation === 'horizontal' ? 1 : 10;
        for(let i=0; i<this.size; i++) {
            this.hull.push({
                hit: false,
                index: i*displacement,
                element: (()=>{
                    var $div = $(`<div></div>`);
                    $div.addClass('cell');
                    $div.addClass('ship');
                    if(i === 0)
                        $div.addClass('ship-front');
                    else if(i === this.size-1) 
                        $div.addClass('ship-back');
                    $div.attr('data-value', this.name);
                    $div.addClass(this.orientation);
                    return $div[0];
                })()
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
    readonly ships : {};
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
    insertShip(name: string, offset: number) { // make private so it can accept a ship instead of a name
        var ship = this.ships[name];
        ship.hull.forEach((hull: Hull) => {
            var absolute = offset + hull.index;
            this.data[absolute].ship = ship;
            var id = `${this.player.name}-cell-${absolute}`;
            hull.element.id = id;
            $('#'+id).replaceWith(hull.element);
        });
    }

    // only works ask expected for state 1
    removeShip(name: string) { // make private so it can accept a ship instead of a name
        var ship = this.ships[name];
        var offset = this.indexOf(name);
        for(let i=0; i<ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            this.data[absolute].ship = null;
            var id = `${this.player.name}-cell-${absolute}`
            var $cell = $('#'+id);
            var element = $(`<div class='cell' id=${id}></div>`)[0];
            $cell.replaceWith(element);
        }
    }

    flipShip(name: string) {
        var ship = this.ships[name];
        var offset = this.indexOf(name);
        this.removeShip(name);
        ship.flip();
        if(this.checkValidIndex(name, offset)) {
            this.insertShip(name, offset);
        } else {
            ship.flip();
            this.insertShip(name, offset);
            (<any>($(`#player-grid > [data-value=${name}]`))).effect('shake', {distance: 15}, 250);
        }
    }

    toggleShipSelection(name: string) {
        var ship = this.ships[ship];
        var $ship = $(`#player-grid > [data-value=${name}]`);
        if($ship.hasClass('selected')){
            $('.selected').removeClass('selected');
        } else {
            $('.selected').removeClass('selected');
            $ship.addClass('selected');
        }
    }

    moveShip(name: string, offset: number) {
        var oldIndex = playerGrid.indexOf(name);
        this.removeShip(name);

        if(this.checkValidIndex(name, offset)){
            this.insertShip(name, offset);
        } else {
            this.insertShip(name, oldIndex);
            (<any>($(`#player-grid > [data-value=${name}]`))).effect('shake', {distance: 15}, 250);
        }
        $('.selected').removeClass('selected');
    }

    hitCell(index: number): boolean {
        var ship = this.shipAt(index);
        var $cell = $(`#${this.player.name}-cell-${index}`);
        if(ship) {
            $cell.removeClass('ship');
            $cell.addClass('damaged-ship');
            return true;
        } else {
            $cell.addClass('missed-cell');
            return false;
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
        if(!this.checkInbounds(name, offset)) {
            return false;
        }
        if(this.checkCollision(name, offset)) {
            return false;
        }
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

const user = {
    points: 0,
    cells: (function() {
        var arr = [];
        for(let i=0; i<100; i++)
            arr.push(i);
        return arr;
    })(),

    fire: function(index: number): boolean {
        var num = this.cells.indexOf(index);
        if(num !== -1) {
            this.cells.splice(num, 1);
            if(opponentGrid.hitCell(index)) {
                this.points++;
                return true;
            } else return false;
        } else {
            return true;
        }
    }
}

const ai = {
    points: 0,
    cells: (function() {
        var arr = [];
        for(let i=0; i<100; i++)
            arr.push(i);
        return arr;
    })(),

    fireRandomly: function(){
        var canMove = true;
        while(canMove) {
            var randInt = Math.floor(Math.random() * this.cells.length);
            var randIndex = this.cells[randInt];
            this.cells.splice(randInt, 1);
            if(playerGrid.hitCell(randIndex))
                this.points++;
            else
                canMove = false;
        };
    }
}

const game = {
    $pBattleGrid: $(playerGrid.model),
    $oBattleGrid: $(opponentGrid.model),
    $ready: $('#ready-button'),

    state1: function() {
        this.$pBattleGrid.on('click', '.cell', function(e) {
            var $cell = $(e.target);
            var index = parseInt(e.target.id.split('-')[2]);
            if($cell.hasClass('ship') && $cell.attr('data-value') !== $('.selected').attr('data-value')) {
                var ship = playerGrid.data[index].ship;
                playerGrid.toggleShipSelection(ship.name);
            } else {
                if($('.selected').length > 0) {
                    var name = $('.selected').attr('data-value');
                    var ship = playerGrid.ships[name];
                    playerGrid.moveShip(name, index);
                }
            }
        });

        this.$pBattleGrid.on('dblclick', '.ship', function(e) {
            var index = parseInt(e.target.id.split('-')[2]);
            var ship = playerGrid.data[index].ship;
            playerGrid.flipShip(ship.name);
        });

        this.$ready.on('click', ()=>this.state2());
    },

    state2: function() {
        $('.selected').removeClass('selected');
        this.$pBattleGrid.off('click');
        this.$pBattleGrid.off('dblclick');

        this.$oBattleGrid.on('click', (e)=>{
            var index = parseInt(e.target.id.split('-')[2]);
            if(!user.fire(index))
                ai.fireRandomly();
            if(user.points === 17)
                this.state3(PlayerName.Player);
            else if(ai.points === 17)
                this.state3(PlayerName.Opponent);
        });
    },

    state3: function(winner: PlayerName) {
        this.$ready.remove();
        this.$oBattleGrid.off('click');
        alert(winner + " wins the game!");
    }
}

// execution
game.state1();