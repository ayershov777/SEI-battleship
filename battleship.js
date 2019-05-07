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
    PlayerName[PlayerName["Player"] = 0] = "Player";
    PlayerName[PlayerName["Opponent"] = 1] = "Opponent";
})(PlayerName || (PlayerName = {}));
var Ship = /** @class */ (function () {
    function Ship(name, size) {
        this.name = name;
        this.size = size;
        this.initOrientation();
        this.initModel();
    }
    // randomly assign orientation
    Ship.prototype.initOrientation = function () {
        var n = Math.round(Math.random());
        this.orientation = n;
    };
    // generate div based on class properties
    // assumes size and orientation are defined
    Ship.prototype.initModel = function () {
        var $ship = $("<div class=\"ship ship-" + this.name + "\"></div>");
        if (this.orientation) {
            $ship.css('width', String(this.size * 48));
            $ship.css('height', '48px');
        }
        else {
            $ship.css('width', '48px');
            $ship.css('height', String(this.size * 48));
        }
        this.model = $ship[0];
    };
    // toggle orientation and reshape the model
    Ship.prototype.flip = function () {
        this.orientation %= 1;
        this.initModel();
    };
    return Ship;
}());
var Grid = /** @class */ (function () {
    function Grid(model, player) {
        this.model = model;
        this.player = player;
    }
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
var pShips = [
    new Ship(ShipName.Carrier, 5),
    new Ship(ShipName.Battleship, 4),
    new Ship(ShipName.Cruiser, 3),
    new Ship(ShipName.Submarine, 3),
    new Ship(ShipName.Destroyer, 2)
];
var oShips = [
    new Ship(ShipName.Carrier, 5),
    new Ship(ShipName.Battleship, 4),
    new Ship(ShipName.Cruiser, 3),
    new Ship(ShipName.Submarine, 3),
    new Ship(ShipName.Destroyer, 2)
];
// execution
pShips.forEach(function (ship) {
    $('body').append(ship.model);
});
