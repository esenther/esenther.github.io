// building.js

// To use: 
// myBuilding = building().numShafts(6).numFloors(18)
//                        .carWidth(13).carHeight(20)
//                        .shaftGap(30).gapBelowFirstFloor(5);
// var floorData = new Array()
// for (var i=0; i<numFloors; i++) {
//      floorData.push(i*CAR_HEIGHT);
// };
//      Note: selection.call(myBuilding) is equivalent to myBuilding(selection)
//      Note: selection.datum() does not compute enter and exit selections (like .data() does)
// d3.select("#buildingDiv").datum(floorData).call(myBuilding);

function building() {
    var numShafts, numFloors;
    var carHeight, carWidth, floorHeight;
    var building_width, building_height; // internally computed
    var shaftGap, gapBelowFirstFloor;

    function buildingClosure(selection) {  //# selection (this) is #buildingDiv
        selection.each(function(floorData) {        
            building_width = (numShafts * carWidth) + (numShafts+1) * shaftGap;
            building_height = (numFloors * carHeight) + gapBelowFirstFloor;     
            
            //scale.domain([0, 68]); // This is bottom of lowest car to bottom of highest car, therefore, CAR_HEIGHT * (numFloors-1)
            //scale.range([CAR_HEIGHT, CAR_HEIGHT+ (numFloors-1) * CAR_HEIGHT ]); // range is the TOP of each extreme car
            
            // Create:
            // <svg width="<building_width>" height="<building_height>" >
            //      <g id="building_group" >
            //          <rect id="building_group_rect" x="0" y="0" width="<building_width>" height="<building_height>" fill="white" stroke-width="1" stroke="black" >
            //          <line x1="0" x2="<building_width>" y1="..." y2="..." stroke="gray" stroke-width="0.5" >
            //          <line>... <-- one per floor
            //      <g id="cars_group" >  <-- elevator cars will be drawn in here as a series of as <rect> (car body) and <line> (car door) elements.
            
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
                    return building_height-(i*CAR_HEIGHT)-GAP_BELOW_FIRST_FLOOR;
                })                    
                .attr("y2",  function(d, i) {
                    return building_height-(i*CAR_HEIGHT)-GAP_BELOW_FIRST_FLOOR;
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
    
    return buildingClosure;
}