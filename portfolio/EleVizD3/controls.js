// Init.js 
           
var CAR_HEIGHT = 20;
var CAR_WIDTH = 13;
var SHAFT_GAP = 30;
var GAP_BELOW_FIRST_FLOOR = 5;            
var liftPositions = [];
var simulatePid;    
var currentRow = 0;   
var myBuilding;                 

// Note: s6 means shaft 6, c2 means car 2
//timestamp,s1_c1_y,s1_c2_y,s2_c1_y,s2_c2_y,s3_c1_y,s3_c2_y,s4_c1_y,s4_c2_y,s5_c1_y,s5_c2_y,s6_c1_y,s6_c2_y
//-1000,0,68,0,68,0,68,0,68,0,68,0,68
//-999,0,68,0,68,0,68,0,68,0,68,0,68
//-998,0,68,0,68,0,68,0,68,0,68,0,68
//-997,0,68,0,68,0,68,0,68,0,68,0,68  

$(document).ready(process_data_file()); // Loads .csv -- callback will initialize GUI  

function process_data_file() {
    d3.text("height.csv", function(error, data) {
        if (error) {
            console.log(error);
            return;
        }
        lines = data.split("\n");
        var csv_headers = lines[0].split(",");
        console.log("Found " + csv_headers.length + " csv_headers: " + csv_headers);
        console.log("Found " + (lines.length-1) + " lines of data.");  
        for (var i=1; i<lines.length; i++) {
            var line = lines[i].split(","); // [-1000,0,68,0,68,0,68,0,68,0,68,0,68]
            var timestamp = parseInt(line[0]);
            var liftHeights = [];
            for (var j=1; j<line.length; j++) {
                liftHeights.push(parseFloat(line[j]));
            }                        
            liftPositions.push({ "timestamp": timestamp, "liftHeights": liftHeights });
        }   
        console.log("Initial LiftPositions=" + liftPositions[0].liftHeights);
        if (!initGUI()) return;
        myBuilding.updateCars(liftPositions[0].liftHeights);
    });
};

function initGUI() {
    // Check for errors in .csv file

    if (liftPositions[0]==null) {
        console.log("ERROR: initGUI: no LiftPositions were found\n");
        return false;
    }
    if (liftPositions[0].liftHeights.length<1) {
        console.log("ERROR: initGUI: liftPositions[0] has no elevator car heights\n");
        return false;
    }
    if (liftPositions[0].liftHeights.length<2) {
        console.log("ERROR: initGUI: liftPositions[0] has only 1 elevator car height\n");
        return false;
    }

    // Initialize the GUI controls
    
    // Initialize the "Data frequency (ms)" field. Rows in input file are e.g. 100ms apart. 
    if (liftPositions.length > 1) {
        // Timestamps in data are in units of 100ms. 
        $("#upd_timeslice").val(100 * ((liftPositions[1]).timestamp - (liftPositions[0]).timestamp));
        console.log("Detected " + $("#upd_timeslice").val()+"ms between data samples.");
    } else {
        $("#upd_timeslice").val(100);
    }

    // initialize the time slider
    $("#slider_timestep").attr('min',0);
    $("#slider_timestep").attr('max',liftPositions.length-1);   
    $("#slider_timestep").attr('step',parseInt(upd_timeslicesBetweenUpdates.value));
    $("#slider_timestep").val(0);
    $("#slider_timestep").change(function(){ 
        currentRow = parseInt(this.value);
        myBuilding.updateCars(liftPositions[currentRow].liftHeights);
    });   

    // Add button click handlers

    // For simplicity just use play/stop button image name (btn_stop.png or btn_play.png) to detect play state
    $("#img_play").click(function() {
        if ($("#img_play").attr('src').indexOf('play') > 0) {
            $("#img_play").attr('src', 'images/btn_stop.png');     
            var stepIntervalMilleseconds = parseInt($("#upd_timeslicesBetweenUpdates").val());
            simulatePid = setTimeout(simulateContinuously,stepIntervalMilleseconds);            
        } else {
            $("#img_play").attr('src', 'images/btn_play.png');            
        }
    });
    
    $("#img_stepforward").click(function() {
        // Stop the animation if it's currently playing
        if ($("#img_play").attr('src').indexOf('stop') > 0) {
            $("#img_play").attr('src', 'images/btn_play.png');     
        }   
        simulateNext();
    });   

    $("#img_stepback").click(function() {
        // Stop the animation if it's currently playing
        if ($("#img_play").attr('src').indexOf('stop') > 0) {
            $("#img_play").attr('src', 'images/btn_play.png');     
        }   
        simulatePrevious();
    });

    // Create the building object

    var numShafts = Math.floor(liftPositions[0].liftHeights.length / 2); // 2 cars per shaft
    var numFloors = parseInt($("#upd_floors").val());
    // Compute highest and lowest lift positions possible
    var min_liftHeight = d3.min(liftPositions, function(d) {
        // For each array of LiftPositions (at each timestamp), return min of those LiftPostions.
        return d3.min(d.liftHeights);
    });
    var max_liftHeight = d3.max(liftPositions, function(d) {
        // For each array of LiftPositions (at each timestamp), return max of those LiftPostions.
        return d3.max(d.liftHeights);
    });  

    myBuilding = building()
        .numShafts(numShafts)
        .numFloors(numFloors)
        .carWidth(CAR_WIDTH)
        .carHeight(CAR_HEIGHT)
        .shaftGap(SHAFT_GAP)
        .gapBelowFirstFloor(GAP_BELOW_FIRST_FLOOR)
        .min_liftHeight(min_liftHeight)
        .max_liftHeight(max_liftHeight);

    // Bind floor positions to building object
    var floorData = [];
    for (var i=0; i<numFloors; i++) {
        floorData.push(i*CAR_HEIGHT);
    };   
    // Note: selection.datum does not compute enter and exit selections. 
    // Note: selection.call(myBuilding) is equivalent to myBuilding(selection). Allows for easier chaining.
    d3.select("#buildingDiv").datum(floorData).call(myBuilding); // Bind floor data, invoke myBuilding(selection)

    console.log('building: width='+ myBuilding.buildingWidth() + ' height=' + myBuilding.buildingHeight());
    $("#slider_timestep").attr('style', 'width:'+myBuilding.buildingWidth()+'px');
    
    // Center the time slider controls and label 
    var centeredLoc = ($("#slider_timestep").width() - $("#div_slider_controls").width())/2;
    $("#div_slider_controls").attr("style","left:"+centeredLoc+"px");
    
    // Center the building under the controls panel
    centeredLoc = ($("#controls").width() - myBuilding.buildingWidth()) / 2;
    $("#building_with_slider").attr("style", "left:"+centeredLoc+"px");    

    $("#slider_timestep").on("input", function() {
        // Stop any current animation if user drags slider
        $("#img_play").attr("src", "images/btn_play.png");
        currentRow = Math.round(parseFloat(slider_timestep.value));
        myBuilding.updateCars(liftPositions[currentRow].liftHeights);
        ;
    });     
    return true;       
}

function simulateContinuously() {
    // Stop the animation (by NOT calling setTimeout() again) if user clicked Stop button.
    if ($("#img_play").attr("src").indexOf("play") > 0) {
        return;
    }
    // Stop the animation if it has reached the end of the timesteps
    if (currentRow >= liftPositions.length -1) {
        currentRow = liftPositions.length - 1;
        $("#img_play").attr("src", "images/btn_play.png");
        return;
    }    
    simulateNext();
    var stepIntervalMilleseconds = parseInt($("#upd_timeslicesBetweenUpdates").val());
    simulatePid = setTimeout(simulateContinuously,stepIntervalMilleseconds);
}

function simulateNext() {
    // currentLiftPosIndex = currentLiftPosIndex + upd_timeslicesBetweenUpdates.value;
    // if (currentLiftPosIndex > slider_timestep.maximum) currentLiftPosIndex = slider_timestep.maximum;
    currentRow += parseInt($("#upd_timeslicesBetweenUpdates").val());
    if (currentRow >= liftPositions.length) {
        currentRow = liftPositions.length - 1;
        $("#img_play").attr("src", "images/btn_play.png");
    }
    $("#slider_timestep").val(currentRow);
    $("#lbl_slider_timestep").text(pad(currentRow, slider_timestep.max.toString().length));
    myBuilding.updateCars(liftPositions[currentRow].liftHeights);
}

function simulatePrevious() {
    // currentLiftPosIndex = currentLiftPosIndex - upd_timeslicesBetweenUpdates.value;
    // if (currentLiftPosIndex < slider_timestep.minimum) currentLiftPosIndex = slider_timestep.minimum;
    currentRow -= parseInt($("#upd_timeslicesBetweenUpdates").val());
    if (currentRow < 0) {
        currentRow = 0;
    }
    $("#slider_timestep").val(currentRow);
    $("#lbl_slider_timestep").text(pad(currentRow, slider_timestep.max.toString().length));    
    myBuilding.updateCars(liftPositions[currentRow].liftHeights);
}   

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}     
