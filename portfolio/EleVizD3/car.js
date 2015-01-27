// car.js

// This could be a JavaScript object instead of a D3-style class. 
// The actual .enter() to draw cars is in building.updateCars().
// But in the future we may want to do more complex car-specific things like 
// create Passenger objects that ride in the cars.

function car() {
    var carNum;
    var shaftNum;
    var isUpper;
    var currentHeight;
    
    function carClosure() {
    };
    
    carClosure.toString = function() {
        return "carNum=" + carNum+ " shaftNum=" + shaftNum + " isUpper=" + isUpper + " currentHeight=" + currentHeight;
    };
    
    carClosure.carNum = function(_) {
        if (!arguments.length) return carNum;
        carNum = _;
        return carClosure;
    };
    carClosure.shaftNum = function(_) {
        if (!arguments.length) return shaftNum;
        shaftNum = _;
        return carClosure;
    };
    carClosure.isUpper = function(_) {
        if (!arguments.length) return isUpper;
        isUpper = _;
        return carClosure;
    };
    carClosure.currentHeight = function(_) {
        if (!arguments.length) return currentHeight;
        currentHeight = _;
        return carClosure;
    };
    
    return carClosure;
}