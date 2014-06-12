// car.js

// I need a "car" class to encapsulate shaftNum, etc. But maybe it doesn't 
// have to be a D3-style class, since the actual .enter() is on the databound_car_rects.
// Does it make sense to put any "rendering" code here in car.js?
// Maybe not -- but it is nice to be able to say myCar.shaftNum(1).isUpper(true)
// Could the "function carClosure(selection)" be used for mouseovers or animating door?

// To use: 
// for (var i=0; i<liftHeights.length; i++) {
//      ... really want to do this in a .enter():
//      ...which means there should be a .selectAll(".car").data(liftHeights[]).enter()...
//      var newCar = car().carNum(carNum).shaftNum(shaftNum).isUpper(isUpper).currentHeight(liftHeight);
//      carsArray.push(newCar); 
// }
// var databound_car_rects = d3.select("#cars_group")
//     .selectAll("rect") // Don't forget this! It's what enter() gets called for
//     .data(carsArray, carkey); //12 cars    
//     .enter()
//     .append("rect")
        
//      Note: selection.call(myCar) is equivalent to myCar(selection)
// d3.select("#cars_group").datum(carsArray).call(myCar);

function car(carNum, shaftNum, isUpper, currentHeight) {
    var carNum;
    var shaftNum;
    var isUpper;
    var currentHeight;
    
    function carClosure() {
        function carClosure(selection) {
        
        }
        
    }
    
    carClosure.toString = function() {
        return "carNum=" + carNum+ " shaftNum=" + shaftNum + " isUpper=" + isUpper + " currentHeight=" + currentHeight;
    }
    
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