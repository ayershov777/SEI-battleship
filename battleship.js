// class and enum declarations
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Horizontal"] = 0] = "Horizontal";
    Orientation[Orientation["Vertical"] = 1] = "Vertical";
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
var Hull = /** @class */ (function () {
    function Hull() {
        this.healthy = true;
        this.initModel();
    }
    Hull.prototype.initModel = function () {
        var $model = $("<div></div>");
        $model.addClass('hull hull-healthy');
        this.model = $model[0];
    };
    Hull.prototype.destroy = function () {
        this.healthy = false;
        var $model = $(this.model);
        $model.css('background-color', 'red');
    };
    return Hull;
}());
var Ship = /** @class */ (function () {
    function Ship(name, size) {
        this.name = name;
        this.size = size;
        this.initOrientation();
        this.initHull();
    }
    // randomly assign orientation
    Ship.prototype.initOrientation = function () {
        var n = Math.round(Math.random());
        this.orientation = n;
    };
    // generate hull based on class properties
    // assumes size and orientation are defined
    Ship.prototype.initHull = function () {
        this.hull = [];
        var displacement = this.orientation ? 10 : 1;
        for (var i = 0; i < this.size; i++) {
            this.hull.push({
                model: new Hull(),
                index: i * displacement
            });
        }
    };
    // toggle orientation and reshape the model
    Ship.prototype.flip = function () {
        this.orientation %= 1;
        this.initHull();
    };
    return Ship;
}());
var Grid = /** @class */ (function () {
    function Grid(model, player) {
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
        //unit test for checkInbounds()
        // let bool = this.checkInbounds('carrier', 93);
        // let ship = this.ships['carrier'];
        // console.log(ship.orientation);
        // console.log(bool);
    }
    Grid.prototype.initData = function () {
        this.data = [];
        for (var i = 0; i < 100; i++) {
            this.data.push({ ship: null, hit: false });
        }
        this.insertAllShips();
    };
    // inserts all ships randomly into the array,
    // does collision checking before inserting,
    // will remember failed indeces
    Grid.prototype.insertAllShips = function () {
        for (var key in this.ships) {
            var indeces = [];
            for (var i = 0; i < 100; i++) {
                indeces.push(i);
            }
            while (true) {
                var randInt = Math.floor(Math.random() * indeces.length);
                var randIndex = indeces[randInt];
                if (this.checkValidIndex(key, randIndex)) {
                    this.insertShip(key, randIndex);
                    break;
                }
                else {
                    indeces.splice(randInt, 1);
                }
            }
        }
    };
    // Assumes that position is valid,
    // and that there will be no collision
    Grid.prototype.insertShip = function (name, offset) {
        var ship = this.ships[name];
        for (var i = 0; i < ship.size; i++) {
            var absolute = offset + ship.hull[i].index;
            this.data[absolute].ship = ship;
            console.log("#" + this.player.name + "-cell-" + absolute);
            var $cell = $("#" + this.player.name + "-cell-" + absolute);
            $cell.css('background-color', 'black');
        }
    };
    Grid.prototype.moveShip = function (ship, position) {
    };
    Grid.prototype.shipAt = function (index) {
        return this.data[index].ship;
    };
    //double check that this method works
    Grid.prototype.checkInbounds = function (name, offset) {
        var ship = this.ships[name];
        var lastIndex = offset + ship.hull[ship.size - 1].index;
        if (ship.orientation === Orientation.Horizontal) {
            //console.log('horizontal');
            return Math.floor(offset / 10) === Math.floor(lastIndex / 10);
        }
        else {
            //console.log('verical');
            return (lastIndex <= 100 && lastIndex >= 0);
        }
    };
    Grid.prototype.checkCollision = function (name, offset) {
        var ship = this.ships[name];
        for (var i = 0; i < ship.size; i++) {
            var absolute = offset + ship.hull[i].index;
            //console.log(absolute);
            if (this.shipAt(absolute))
                return true;
        }
        return false;
    };
    Grid.prototype.checkValidIndex = function (name, offset) {
        if (!this.checkInbounds(name, offset))
            return false;
        if (this.checkCollision(name, offset))
            return false;
        return true;
    };
    Grid.getIndexFromCoords = function (position) {
        return position.y * 10 + position.x;
    };
    return Grid;
}());
var Player = /** @class */ (function () {
    function Player(name) {
        this.name = name;
    }
    return Player;
}());
// variable initialization
var player = new Player(PlayerName.Player);
var pGridHTML = $('#player-grid')[0];
var playerGrid = new Grid(pGridHTML, player);
var opponent = new Player(PlayerName.Opponent);
var oGridHTML = $('#opponent-grid')[0];
var opponentGrid = new Grid(oGridHTML, opponent);
//var mouseShip: Ship;
// execution
