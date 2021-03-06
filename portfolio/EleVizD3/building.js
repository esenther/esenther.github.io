// building.js

function building() {
    var numShafts, numFloors;
    var carHeight, carWidth, floorHeight;
    var building_width, building_height; // internally computed from numShafts, numFloors, carWidth, etc
    var shaftGap, gapBelowFirstFloor;
    var min_liftHeight, max_liftHeight;
    var carsArray = [];
    var scale = d3.scale.linear();

    function buildingClosure(selection) { 
        building_width = (numShafts * carWidth) + (numShafts+1) * shaftGap;
        building_height = (numFloors * carHeight) + gapBelowFirstFloor;   

        // scale maps liftPosition in data to pixel position on screen
        scale.domain([min_liftHeight, max_liftHeight]); 
        scale.range([carHeight, (numFloors) * carHeight ]); 

// Create:
// <svg width="<building_width>" height="<building_height>" >
//      <g id="building_group" >
//          <!-- building outline with white fill -->
//              <rect id="building_group_rect" x="0" y="0" width="<building_width>" height="<building_height>" fill="white" stroke-width="1" stroke="black" >
//          <!-- Draw one line for each floor -->
//              <line x1="0" x2="<building_width>" y1="..." y2="..." stroke="gray" stroke-width="0.5" >
//              <line>... <-- additional floors
//      <g id="cars_group" >  <-- cars will be drawn in here as a series of as <rect> (car body) and <line> (car door) elements.

        selection.each(function(floorData) { // bound data is accessible as "floorData"

            // Draw the building outline as a rect with white fill color
            var svg = d3.select(this).append("svg")
                .attr("width", building_width)
                .attr("height", building_height)              
                .append("g")                
                .attr("id", "building_group")
                .append("rect")
                .attr("id", "building_group_rect")
                .attr("x", 0) //place building in upper left of building div
                .attr("y", 0) //building_group goes at 0-offset from top of building
                .attr("width", building_width)
                .attr("height", building_height)
                .attr("fill", "white")
                .attr("stroke-width", 1)
                .attr("stroke", "black");  
                
            // Draw floor lines in the building_group
            d3.select("#building_group")
                .selectAll("line") // Don't forget this! It's what enter() gets called for
                .data(floorData) //18 floors
                .enter()
                .append("line")
                .attr("x1", 0)
                .attr("x2", building_width)
                .attr("y1",  function(d, i) {
                    // Within callback, "this" is a SVGLineElement element (no longer #buildingDiv)
                    return building_height-(i*carHeight)-gapBelowFirstFloor;
                })                    
                .attr("y2",  function(d, i) {
                    return building_height-(i*carHeight)-gapBelowFirstFloor;
                })
                .attr("stroke", "gray")    
                .attr("stroke-width", 0.5)
                ;
                
            // Add container for the cars
            d3.select(this).select("svg")
                .append("g")
                .attr("id", "cars_group");
        });
    }

    buildingClosure.toString = function() {
        var str="building_width:"+building_width + " building_height: "+building_height+ " numShafts: " + numShafts+ " floorHeight: " + floorHeight
                + " carHeight: " + carHeight
                + " carWidth: " + carWidth
                + " shaftGap: " + shaftGap
                + " gapBelowFirstFloor: " + gapBelowFirstFloor;
        return str;
    };
    
    buildingClosure.numShafts = function(_) {
        if (!arguments.length) return numShafts;
        numShafts = _;
        return buildingClosure; 
    };
    
    buildingClosure.numFloors = function(_) {
        if (!arguments.length) return numFloors;
        numFloors = _;
        return buildingClosure; 
    };

    buildingClosure.carWidth = function(_) {
        if (!arguments.length) return carWidth;
        carWidth = _;
        return buildingClosure; 
    };
    
    buildingClosure.carHeight = function(_) {
        if (!arguments.length) return carHeight;
        carHeight = _;
        floorHeight = _; // maybe in the future they'll be different
        return buildingClosure; 
    };

    buildingClosure.shaftGap = function(_) {
        if (!arguments.length) return shaftGap;
        shaftGap = _;
        return buildingClosure; 
    };

    buildingClosure.gapBelowFirstFloor = function(_) {
        if (!arguments.length) return gapBelowFirstFloor;
        gapBelowFirstFloor = _;
        return buildingClosure; 
    };

    buildingClosure.buildingWidth = function() {
        // No setter! This is internally computed based on number of shafts, car size, etc.
        return building_width;
    };

    buildingClosure.buildingHeight = function() {
        // No setter! This is internally computed based on number of shafts, car size, etc.
        return building_height;
    };

    buildingClosure.min_liftHeight = function(_) {
        if (!arguments.length) return min_liftHeight;
        min_liftHeight = _;
        return buildingClosure; 
    };

    buildingClosure.max_liftHeight = function(_) {
        if (!arguments.length) return max_liftHeight;
        max_liftHeight = _;
        return buildingClosure; 
    };


    buildingClosure.updateCars = function(liftHeights) {
        // liftHeights[] initially contains e.g. [0,68,0,68,0,68,0,68,0,68,0,68]

        if (carsArray.length == 0) {
            carsArray = [];
            for (var i=0; i<liftHeights.length; i++) {
                var liftHeight = liftHeights[i];
                var carNum = i;
                var shaftNum = (i%2 == 0 ? (i/2) : (i-1)/2); // e.g. cars 10 and 11 are both in shaft 5
                var isUpper = (i%2 == 1 ? true : false);
                var newCar = car().carNum(carNum).shaftNum(shaftNum).isUpper(isUpper).currentHeight(liftHeight);
                carsArray.push(newCar); 
            }
        } else { // just update carHeight from liftPosition
            for (var i=0; i<liftHeights.length; i++) {
                carsArray[i].currentHeight(liftHeights[i]);
            }
        }

        // Creating this:
        //   <g id="cars_group">
        //     <g class="car_g">
        //       <rect ...>        // draw car
        //       <line ...>        // draw door line on car
        //     <g class="car_g">
        //       <rect ...>        // draw car
        //       <line ...>        // draw door line on car
        //     ... 12 car_g in all ...
        //   </g>

        var car_g_enter = d3.select("#cars_group")
            .selectAll("g.car_g")
            .data(carsArray) //12 cars   
            .enter()
            .append("g")
            .attr("class", "car_g");

        // enter...

        // draw car rects
        car_g_enter
            .append("rect")
            .attr("x", function(d, i) {                        
                return shaftGap + (d.shaftNum())*(carWidth + shaftGap); // 2 cars per shaft                                        
            })
            .attr("y", function(d, i) {
                return carHeight+ (myBuilding.numFloors()-1) * carHeight - scale(d.currentHeight());
            })
            .attr("width", carWidth)
            .attr("height", carHeight)
            .attr("fill", function(d, i) {
                return d.isUpper() ? "blue" : "red";
            })
            //.on("mouseover", function() { d3.select(this).attr("fill", "pink"); })
            //.on("mouseout", function() { d3.select(this).attr("fill", "green"); })
            ;
     
        // draw door lines on top of cars
        car_g_enter
            .append("line")                   
            .attr("x1", function(d, i) {                        
                return carWidth/2 + shaftGap + (d.shaftNum())*(carWidth + shaftGap);                                    
            })
            .attr("x2", function(d, i) {                        
                return carWidth/2 + shaftGap + (d.shaftNum())*(carWidth + shaftGap);                                  
            })                    
            .attr("y1", function(d, i) {
                return carHeight+ (myBuilding.numFloors()-1) * carHeight - scale(d.currentHeight());
            })
            .attr("y2", function(d, i) {
                return carHeight + carHeight+ (myBuilding.numFloors()-1) * carHeight - scale(d.currentHeight());
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1); 
            

        // update...

        var car_g_update = d3.select("#cars_group")
            .selectAll("g.car_g");

        // move car rects
        car_g_update
            .selectAll("rect")
            .attr("y", function(d, i) {
                return carHeight+ (myBuilding.numFloors()-1) * carHeight - scale(d.currentHeight());
            });   

        // move lines on doors
        car_g_update
            .selectAll("line")
            .attr("y1", function(d, i) {
                return carHeight+ (myBuilding.numFloors()-1) * carHeight - scale(d.currentHeight());
            })
            .attr("y2", function(d, i) {
                return carHeight + carHeight+ (myBuilding.numFloors()-1) * carHeight - scale(d.currentHeight());
            }); 
    }

    return buildingClosure;
}