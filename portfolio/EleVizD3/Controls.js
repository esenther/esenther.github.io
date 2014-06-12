// Init.js 
           
var CAR_HEIGHT = 20;//15;
var CAR_WIDTH = 13;//10;
var SHAFT_GAP = 30;
var GAP_BELOW_FIRST_FLOOR = 5;            
var csv_headers;
var dataset = new Array();
var liftPositionsArray;
var scale;
var simulatePid;    
var currentRow = 0;                    

//timestamp,s1_c1_y,s1_c2_y,s2_c1_y,s2_c2_y,s3_c1_y,s3_c2_y,s4_c1_y,s4_c2_y,s5_c1_y,s5_c2_y,s6_c1_y,s6_c2_y
//-1000,0,68,0,68,0,68,0,68,0,68,0,68
//-999,0,68,0,68,0,68,0,68,0,68,0,68
//-998,0,68,0,68,0,68,0,68,0,68,0,68
//-997,0,68,0,68,0,68,0,68,0,68,0,68    

var process_data_file = function() {
    d3.text("height.csv", function(error, data) {
        if (error) {
            console.log(error);
            alert("Error loading .csv data:" + error);
        }
        lines = data.split("\n");
        csv_headers = lines[0].split(",");
        console.log("Found " + csv_headers.length + " csv_headers: " + csv_headers);
        for (var i=1; i<lines.length; i++) {
            var lineArr = lines[i].split(",");
            dataset.push(lineArr);    //-1000,0,68,0,68,0,68,0,68,0,68,0,68
        }
        console.log("Found " + dataset.length + " lines of data.");        
                            
        liftPositionsArray=new Array(dataset.length);
        for (var i=0; i<dataset.length; i++) {
            if (dataset[i].length>0) {
                var rowdata = dataset[i];
                timestamp=parseInt(rowdata[0]);
                var liftHeights=new Array(rowdata.length-1);
                for (var j=1; j<rowdata.length; j++) {
                    liftHeights[j-1]=parseFloat(rowdata[j]);
                }                        
                liftPositionsArray[i] = { "timestamp": timestamp, "liftHeights": liftHeights };
            }
        }   
        console.log("Initial LiftPositions=" + liftPositionsArray[0]);
        
        // Now that the callback has finished processing .csv data, initialize the GUI controls
        initGUI();
        updateCars(liftPositionsArray[0].liftHeights);
    });
};

function simulateContinuously() {
    if ($("#img_play").attr("src").indexOf("play") > 0) {
        return;
    }
    if (currentRow >= liftPositionsArray.length -1) {
        currentRow = liftPositionsArray.length - 1;
        $("#img_play").attr("src", "images/btn_play.png");
        return false;
    }    
    if (simulateNext()) {
        var stepIntervalMilleseconds = parseInt($("#upd_timeslicesBetweenUpdates").val());
        simulatePid = setTimeout(simulateContinuously,stepIntervalMilleseconds);
    }
}

function simulateNext() {
    try { 
    currentRow += parseInt($("#upd_timeslicesBetweenUpdates").val());
    if (currentRow >= liftPositionsArray.length) {
        currentRow = liftPositionsArray.length - 1;
        $("#img_play").attr("src", "images/btn_play.png");
    }
    $("#slider_timestep").val(currentRow);
    $("#lbl_slider_timestep").text(pad(currentRow, slider_timestep.max.toString().length));
    updateCars(liftPositionsArray[currentRow].liftHeights);
    return true;
    } catch (e) {
        //alert("currentRow=" + currentRow+" e=" + e);
    }
}

function simulatePrevious() {
    //currentLiftPosIndex = currentLiftPosIndex - upd_timeslicesBetweenUpdates.value;
    //if (currentLiftPosIndex < slider_timestep.minimum) currentLiftPosIndex = slider_timestep.minimum;
    currentRow -= parseInt($("#upd_timeslicesBetweenUpdates").val());
    if (currentRow < 0) {
        currentRow = 0;
    }
    $("#slider_timestep").val(currentRow);
    $("#lbl_slider_timestep").text(pad(currentRow, slider_timestep.max.toString().length));    
    updateCars(liftPositionsArray[currentRow].liftHeights);
}	

var initGUI = function() {
    if (liftPositionsArray[0]==null) {
        console.log("ERROR: initGUI: no LiftPositions were found\n");
        return;
    }
    if (liftPositionsArray[0].liftHeights.length<1) {
        console.log("ERROR: initGUI: liftPositionsArray[0] has no elevator car heights\n");
        return;
    }
    if (liftPositionsArray[0].liftHeights.length<2) {
        console.log("ERROR: initGUI: liftPositionsArray[0] has only 1 elevator car height\n");
        return;
    }

    // Initialize the GUI controls
    
    // timeslices in input file are e.g. 100ms apart.
    if (liftPositionsArray.length > 1) {
        $("#upd_timeslice").val(100 * ((liftPositionsArray[1]).timestamp - (liftPositionsArray[0]).timestamp));
        console.log("Detected " + $("#upd_timeslice").val()+"ms between data samples.");
    } else {
        $("#upd_timeslice").val(100);
    }

    $("#slider_timestep").attr('min',0);
    $("#slider_timestep").attr('max',liftPositionsArray.length-1);   
    $("#slider_timestep").attr('step',parseInt(upd_timeslicesBetweenUpdates.value));
    $("#slider_timestep").val(0);
    $("#slider_timestep").change(function(){ 
        currentRow = parseInt(this.value);
        updateCars(liftPositionsArray[currentRow].liftHeights);
    });   

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

    numShafts = Math.floor(liftPositionsArray[0].liftHeights.length / 2);
    numFloors = parseInt($("#upd_floors").val());

    var myBuilding = building()
                        .numShafts(numShafts)
                        .numFloors(numFloors)
                        .carWidth(CAR_WIDTH).carHeight(CAR_HEIGHT)
                        .shaftGap(SHAFT_GAP).gapBelowFirstFloor(GAP_BELOW_FIRST_FLOOR);
    var floorData = new Array()
    for (var i=0; i<numFloors; i++) {
        floorData.push(i*CAR_HEIGHT);
    };    
    // Note: selection.call(myBuilding) is equivalent to myBuilding(selection)
    // Note: selection.datum does not compute enter and exit selections.

    d3.select("#buildingDiv").datum(floorData).call(myBuilding); 

    scale = d3.scale.linear();
    // Domain is the bottom of the lowest car to the bottom of highest car
    // scale.domain([0, 68]); // Lowest and highest lift positions in the data
    var min_liftHeight = d3.min(liftPositionsArray, function(d) {
        // For each array of LiftPositions (at each timestamp), return min of those LiftPostions.
        return d3.min(d.liftHeights);
    });
    var max_liftHeight = d3.max(liftPositionsArray, function(d) {
        // For each array of LiftPositions (at each timestamp), return max of those LiftPostions.
        return d3.max(d.liftHeights);
    });  
    scale.domain([min_liftHeight, max_liftHeight]);
    scale.range([CAR_HEIGHT, (numFloors) * CAR_HEIGHT ]); // range is the TOP of each extreme car              
        
    var buildingRect = d3.select("#building_group_rect");
    console.log('building: x=' + buildingRect.attr("x")+' y=' + buildingRect.attr("y")+' width='+ buildingRect.attr("width") + ' height=' + buildingRect.attr("height"));
    $("#slider_timestep").attr('style', 'width:'+buildingRect.attr('width')+'px');
    
    // Resize time slider label to fit its content -- or just hard-code to max
    //$('#lbl_slider_timestep').attr('size', $('#lbl_slider_timestep').val().length);
    var centeredLeft = ($("#slider_timestep").width() - $("#div_slider_controls").width())/2;
    
    // Center the time slider controls and label 
    $("#div_slider_controls").attr("style","left:"+centeredLeft+"px");
    
    // Center the building under the controls panel
    centeredLeft = ($("#controls").width() - buildingRect.attr("width")) / 2;
    $("#building_with_slider").attr("style", "left:"+centeredLeft+"px");                
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}     
