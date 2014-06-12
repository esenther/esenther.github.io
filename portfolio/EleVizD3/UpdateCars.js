// updateCars.js

var carkey = function(d) { // Can use carKey in the future to e.g. animate the door open/close of a particular car
    return d.carNum();
}

var carsArray;
function updateCars(liftHeights) {
    // The carsArray dataset is created from liftHeights[]
    
    if (carsArray == null) {
        carsArray = new Array();
        for (var i=0; i<liftHeights.length; i++) {
            var liftHeight = liftHeights[i];
            var carNum = i;
            var shaftNum = (i%2 == 0 ? (i/2) : (i-1)/2);
            var isUpper = (i%2 == 1 ? true : false);
            //var newCar = new Car(carNum, shaftNum, isUpper, liftHeight);
            var newCar = car().carNum(carNum).shaftNum(shaftNum).isUpper(isUpper).currentHeight(liftHeight);
            carsArray.push(newCar); 
        }
    } else { // just update carHeight from liftPosition
        for (var i=0; i<liftHeights.length; i++) {
            carsArray[i].currentHeight(liftHeights[i]);
        }
    }
    
    var databound_car_rects = d3.select("#cars_group")
        .selectAll("g") // Don't forget this! It's what enter() gets called for
        .data(carsArray, carkey); //12 cars    

    // enter...
    databound_car_rects
        .enter()
        .append("g")
        .append("rect")
        .attr("x", function(d, i) {                        
            return SHAFT_GAP + (d.shaftNum())*(CAR_WIDTH + SHAFT_GAP); // 2 cars per shaft                                        
        })
        .attr("y", function(d, i) {
            return CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT - scale(d.currentHeight());
        })
        .attr("width", CAR_WIDTH)
        .attr("height", CAR_HEIGHT)
        .attr("fill", function(d, i) {
            return d.isUpper() ? "blue" : "red";
        })
        //.on("mouseover", function() {
        //    d3.select(this).attr("fill", "pink");
        //})
        //.on("mouseout", function() {
        //    d3.select(this).attr("fill", "green");
        //})
        ;     
        
    // update...
    databound_car_rects.select("rect")
        .attr("y", function(d, i) {
            return CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT - scale(d.currentHeight());
        });                
        
    // draw lines on doors
    
    var databound_car_lines = d3.select("#cars_group")
        .selectAll("g")
        .selectAll("line") // Don't forget this! It's what enter() gets called for
        .data(carsArray, carkey); //12 cars  
        
    // enter...
    databound_car_lines
        .enter()
        .append("line")                   
        .attr("x1", function(d, i) {                        
            return CAR_WIDTH/2 + SHAFT_GAP + (d.shaftNum())*(CAR_WIDTH + SHAFT_GAP);                                    
        })
        .attr("x2", function(d, i) {                        
            return CAR_WIDTH/2 + SHAFT_GAP + (d.shaftNum())*(CAR_WIDTH + SHAFT_GAP);                                  
        })                    
        .attr("y1", function(d, i) {
            return CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT - scale(d.currentHeight());
        })
        .attr("y2", function(d, i) {
            return CAR_HEIGHT + CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT - scale(d.currentHeight());
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1);
        
    // update...
    databound_car_lines
        .attr("y1", function(d, i) {
            return CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT - scale(d.currentHeight());
        })
        .attr("y2", function(d, i) {
            return CAR_HEIGHT + CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT - scale(d.currentHeight());
        });
}        