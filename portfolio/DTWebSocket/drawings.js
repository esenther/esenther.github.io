    var width = screen.availWidth-100,
        height = screen.availHeight-200,
		drawing = false;
	var penColorByUser = [ 'red', 'blue', 'green', 'yellow' ];
	var linesDataByUser = [];
	for (var i=0; i<4; i++) linesDataByUser.push(new Array());
		
	var line = d3.svg.line()
        .interpolate("cardinal")
        .x(function(d){return d.x;})
        .y(function(d){return d.y;});		

	function ripples(dtev) {
		var rippleRadius = 150;
		var rippleColor = penColorByUser[dtev.receiverId];
		for (var i = 1; i < 5; ++i) {
	        var circle = svg.append("circle")
	            .attr("cx", dtev.x)
	            .attr("cy", dtev.y)
	            .attr("r", 0)
	            .style("stroke-width", 5 / (i))	// Circles 1,2,3,4 have consecutively smaller strokes
	            .style('stroke', rippleColor)
	            .attr("fill", "none")
	            .transition()
	                .delay(Math.pow(i, 2.5) * 50)	// Circles 1,2,3,4 have take consecutively longer before starting
	                .duration(2000)					// Once started, each lives for 2 seconds
	                .ease('quad-in')
	            .attr("r", rippleRadius) 		// radius transitions from 0 to rippleRadius
	            .style("stroke-opacity", 0)		// opacity transitions from 1 to 0
	            .each("end", function () {
	                d3.select(this).remove();
	            });
	    }
	}

	function processDtev(dtev) {
		if (document.getElementById("rdoPaint").checked) {
			if (dtev.eventType == 1) {
				dt_TouchDown(dtev);
			} else if (dtev.eventType == 2) {
				dt_TouchMove(dtev);
			} else if (dtev.eventType == 3) {
				dt_TouchUp(dtev);
			}
		}

		if (document.getElementById("rdoRipples").checked) {
			if (dtev.eventType == 1) { // only launch a new ripple on touchDOWN
				ripples(dtev);
			} 
		}
	}

	function dt_TouchDown(dtev) {
		drawing = true;
		linesDataByUser[dtev.receiverId].push(new Array());
		linesDataByUser[dtev.receiverId][linesDataByUser[dtev.receiverId].length-1].push({x: dtev.x, y:dtev.y, receiver:dtev.receiverId });	
		render(dtev.receiverId); // No line to render with only one point!
	}

	function dt_TouchMove(dtev) {
		if (drawing) {
			linesDataByUser[dtev.receiverId][linesDataByUser[dtev.receiverId].length-1].push({x: dtev.x, y:dtev.y});
			render(dtev.receiverId);
		}
	}

	function dt_TouchUp(dtev) {
		if (drawing) {
			linesDataByUser[dtev.receiverId][linesDataByUser[dtev.receiverId].length-1].push({x: dtev.x, y:dtev.y, receiver:dtev.receiverId });	
			render(dtev.receiverId);
			drawing = false;
		}		
	}

    function render(receiver) {
		// enter...
		svg.selectAll("path.line.toucher"+receiver)
            .data(linesDataByUser[receiver])
            .enter()
                .append("path")
                .attr("class", "line toucher"+receiver)
                .attr("fill", "none")
				.style('stroke-width', 3)
				.style('stroke', function(d) {
					return penColorByUser[receiver];
				});

		// update...
        svg.selectAll("path.line.toucher"+receiver)
            .data(linesDataByUser[receiver])
            .attr("d", function(d){
				return line(d);
			});
    }	
	
    var svg = d3.select("body").append("svg")
    	.attr("id", "svgroot")
    	.attr("width", width)
    	.attr("height", height);

    svg.append("rect")
    	.attr("id", "svgrect")
    	.attr("width", width)
    	.attr("height", height)
    	.attr("fill", "none")
    	.attr("stroke", "blue")
    	.attr("stroke-width", 3);
		
	// Interpret mouse events as touches by toucher 0
	svg.on("mousedown", function() {
		if (document.getElementById("rdoRipples").checked) {
			drawing = false;
			var position = d3.mouse(svg.node());
			ripples({x: position[0], y:position[1], receiverId:0 });
			return;
		}

		drawing = true;
		var position = d3.mouse(svg.node());
		linesDataByUser[0].push(new Array());
		linesDataByUser[0][linesDataByUser[0].length-1].push({x: position[0], y:position[1], receiver:0 });
		render(0); 
	});
			
	svg.on("mousemove", function() {
		if (document.getElementById("rdoRipples").checked) return;
		if (drawing) {
			var position = d3.mouse(svg.node());
			linesDataByUser[0][linesDataByUser[0].length-1].push({x: position[0], y:position[1], receiver:0 });
			render(0); 
		}
	});
	
	svg.on("mouseup", function() {
		if (document.getElementById("rdoRipples").checked) return;
		if (drawing) {
			var position = d3.mouse(svg.node());
			linesDataByUser[0][linesDataByUser[0].length-1].push({x: position[0], y:position[1], receiver:0 });
			drawing = false;
		}
	});	
    