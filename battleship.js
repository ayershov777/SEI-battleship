var Orientation;
(function (Orientation) {
    Orientation["Horizontal"] = "horizontal";
    Orientation["Vertical"] = "vertical";
})(Orientation || (Orientation = {}));
var ShipName;
(function (ShipName) {
    ShipName["Carrier"] = "carrier";
    ShipName["Battleship"] = "battleship";
    ShipName["Cruiser"] = "cruiser";
    ShipName["Submarine"] = "submarine";
    ShipName["Destroyer"] = "destroyer";
})(ShipName || (ShipName = {}));
var PlayerName;
(function (PlayerName) {
    PlayerName["Player"] = "player";
    PlayerName["Opponent"] = "opponent";
})(PlayerName || (PlayerName = {}));
class Ship {
    constructor(name, size) {
        this.name = name;
        this.size = size;
        this.initOrientation();
        this.initHull();
    }
    // randomly assign orientation
    initOrientation() {
        let n = Math.round(Math.random());
        this.orientation = n ? Orientation.Vertical : Orientation.Horizontal;
    }
    // generate hull based on class properties
    // assumes size and orientation are defined
    initHull() {
        this.hull = [];
        var displacement = this.orientation === 'horizontal' ? 1 : 10;
        for (let i = 0; i < this.size; i++) {
            this.hull.push({
                hit: false,
                index: i * displacement,
                element: (() => {
                    var $div = $(`<div></div>`);
                    $div.addClass('cell');
                    $div.addClass('ship');
                    if (i === 0)
                        $div.addClass('ship-front');
                    else if (i === this.size - 1)
                        $div.addClass('ship-back');
                    $div.addClass(this.name);
                    $div.addClass(this.orientation);
                    return $div[0];
                })()
            });
        }
    }
    // private get$() : JQuery<HTMLElement> {
    // }
    // toggle orientation and modify indices
    flip() {
        if (this.orientation === Orientation.Horizontal)
            this.orientation = Orientation.Vertical;
        else
            this.orientation = Orientation.Horizontal;
        this.initHull();
    }
    select() {
    }
}
class Grid {
    constructor(model, player) {
        this.player = player;
        this.ships = {
            'carrier': new Ship(ShipName.Carrier, 5),
            'battleship': new Ship(ShipName.Battleship, 4),
            'cruiser': new Ship(ShipName.Cruiser, 3),
            'submarine': new Ship(ShipName.Submarine, 3),
            'destroyer': new Ship(ShipName.Destroyer, 2)
        };
        this.model = model;
        this.initData();
    }
    initData() {
        this.data = [];
        for (let i = 0; i < 100; i++) {
            this.data.push({ ship: null, hit: false });
        }
        this.insertAllShips();
    }
    // inserts all ships randomly into the array,
    // does collision checking before inserting,
    // will remember failed indices
    insertAllShips() {
        for (let key in this.ships) {
            var indices = [];
            for (let i = 0; i < 100; i++) {
                indices.push(i);
            }
            while (true) {
                var randInt = Math.floor(Math.random() * indices.length);
                var randIndex = indices[randInt];
                if (this.checkValidIndex(key, randIndex)) {
                    this.insertShip(key, randIndex);
                    break;
                }
                else {
                    indices.splice(randInt, 1);
                }
            }
        }
    }
    // Assumes that position is valid,
    // and that there will be no collision
    insertShip(name, offset) {
        var ship = this.ships[name];
        ship.hull.forEach((hull) => {
            var absolute = offset + hull.index;
            this.data[absolute].ship = ship;
            var id = `${this.player.name}-cell-${absolute}`;
            hull.element.id = id;
            $('#' + id).replaceWith(hull.element);
        });
    }
    // only works ask expected for state 1
    removeShip(name) {
        var ship = this.ships[name];
        var offset = this.indexOf(name);
        for (let i = 0; i < ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            this.data[absolute].ship = null;
            var id = `${this.player.name}-cell-${absolute}`;
            var $cell = $('#' + id);
            var element = $(`<div class='cell' id=${id}></div>`)[0];
            $cell.replaceWith(element);
        }
    }
    flipShip(name) {
        var ship = this.ships[name];
        var offset = this.indexOf(name);
        this.removeShip(name);
        ship.flip();
        if (this.checkValidIndex(name, offset)) {
            this.insertShip(name, offset);
        }
        else {
            ship.flip();
            this.insertShip(name, offset);
        }
    }
    //highlights the model of the ship
    //assumes that a ship exists at the index
    // selectShip(index: number) {
    //     var ship = this.shipAt(index);
    //     var offset = this.indexOf(ship.name);
    //     var $firstCell = $(`#${this.player.name}-cell-${offset}`);
    //     var $lastCell = $(`#${this.player.name}-cell-${offset + ship.hull[ship.size-1].index}`);
    //     if(ship.orientation === Orientation.Horizontal) {
    //         $firstCell.css('border-left', '2px solid blue');
    //         $lastCell.css('border-right', '2px solid blue');
    //         ship.hull.forEach(hull => {
    //             var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
    //             $cell.css('border-top', '2px solid blue');
    //             $cell.css('border-bottom', '2px solid blue');
    //             $cell.addClass('selected');
    //         });
    //     } else {
    //         $firstCell.css('border-top', '2px solid blue');
    //         $lastCell.css('border-bottom', '2px solid blue');
    //         ship.hull.forEach(hull => {
    //             var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
    //             $cell.css('border-left', '2px solid blue');
    //             $cell.css('border-right', '2px solid blue');
    //             $cell.addClass('selected');
    //         });
    //     }
    // }
    //removes highlighting from the ship model
    //assumes that a ship exists at the index
    // deselectShip(index: number) {
    //     var ship = this.shipAt(index);
    //     var offset = this.indexOf(ship.name);
    //     var $firstCell = $(`#${this.player.name}-cell-${offset}`);
    //     var $lastCell = $(`#${this.player.name}-cell-${offset + ship.hull[ship.size-1].index}`);
    //     if(ship.orientation === Orientation.Horizontal) {
    //         $firstCell.css('border-left', '1px dotted brown');
    //         $lastCell.css('border-right', '1px dotted brown');
    //         ship.hull.forEach(hull => {
    //             var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
    //             $cell.css('border-top', '1px dotted brown');
    //             $cell.css('border-bottom', '1px dotted brown');
    //             $cell.removeClass('selected');
    //         });
    //     } else {
    //         $firstCell.css('border-top', '1px dotted brown');
    //         $lastCell.css('border-bottom', '1px dotted brown');
    //         ship.hull.forEach(hull => {
    //             var $cell = $(`#${this.player.name}-cell-${offset + hull.index}`);
    //             $cell.css('border-left', '1px dotted brown');
    //             $cell.css('border-right', '1px dotted brown');
    //             $cell.removeClass('selected');
    //         });
    //     }
    // }
    shipAt(index) {
        return this.data[index].ship;
    }
    indexOf(name) {
        var ship = this.ships[name];
        return this.data.findIndex(function (cell) {
            return cell.ship === ship;
        });
    }
    checkInbounds(name, offset) {
        var ship = this.ships[name];
        var lastIndex = offset + ship.hull[ship.size - 1].index;
        if (ship.orientation === Orientation.Horizontal) {
            return Math.floor(offset / 10) === Math.floor(lastIndex / 10);
        }
        else {
            return (lastIndex < 100 && lastIndex >= 0);
        }
    }
    checkCollision(name, offset) {
        var ship = this.ships[name];
        for (let i = 0; i < ship.size; i++) {
            let absolute = offset + ship.hull[i].index;
            if (this.shipAt(absolute))
                return true;
        }
        return false;
    }
    checkValidIndex(name, offset) {
        if (!this.checkInbounds(name, offset)) {
            return false;
        }
        if (this.checkCollision(name, offset)) {
            return false;
        }
        return true;
    }
}
class Player {
    constructor(name) {
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
    state1: function () {
        var selectedShip = null;
        var $pBattleGrid = $(playerGrid.model);
        $pBattleGrid.on('click', '.cell', function (e) {
            var $cell = $(e.target);
            var index = parseInt(e.target.id.split('-')[2]);
            if ($cell.hasClass('ship')) {
                var ship = playerGrid.data[index].ship;
                if ($cell.hasClass('selected')) {
                    $('.selected').removeClass('selected');
                }
                else {
                    $('.selected').removeClass('selected');
                    $('#player-grid > .' + ship.name).addClass('selected');
                }
            }
            else {
                console.log('clicked water');
            }
        });
        // $pBattleGrid.on('dblclick', '.ship', function(e){
        //     var index = parseInt(e.target.id.split('-')[2]);
        //     var ship = playerGrid.data[index].ship;
        //     var offset = playerGrid.indexOf(ship.name);
        //     playerGrid.deselectShip(index);
        //     selectedShip = null;
        //     playerGrid.removeShip(ship.name);
        //     ship.flip();
        //     if(playerGrid.checkValidIndex(ship.name, offset)) {
        //         playerGrid.insertShip(ship.name, offset);
        //     } else {
        //         ship.flip();
        //         playerGrid.insertShip(ship.name, offset);
        //     }
        // });
        // $pBattleGrid.on('click', '.cell', async function(e) {
        //     var offset = parseInt(e.target.id.split('-')[2]);
        //     var ship = playerGrid.shipAt(offset);
        //     if(selectedShip && selectedShip != ship) {
        //         var index = playerGrid.indexOf(selectedShip.name);
        //         playerGrid.deselectShip(index);
        //         playerGrid.removeShip(selectedShip.name);
        //         if(playerGrid.checkValidIndex(selectedShip.name, offset))
        //             playerGrid.insertShip(selectedShip.name, offset);
        //         else {
        //             playerGrid.insertShip(selectedShip.name, index);
        //             (<any>playerGrid.getShipModel(selectedShip.name)).effect('shake', {distance: 15}, 250);
        //         }
        //         selectedShip = null;
        //     }
        // });
        // $pBattleGrid.on('click', '.ship', function(e) {
        //     var index = parseInt(e.target.id.split('-')[2]);
        //     var ship = playerGrid.data[index].ship;
        //     if(!selectedShip) {
        //         selectedShip = ship;
        //         playerGrid.selectShip(index);
        //     } else {
        //         selectedShip = null;
        //         playerGrid.deselectShip(index);
        //     }
        // });
    }
};
// execution
game.state1();
