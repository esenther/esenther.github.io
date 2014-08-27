	var tip, tip2;
	var itemWidth = 350;
	var itemHeight = 200;
	var imageHeight = 150;
	var svg, force;

	setup_d3_tooltips();
	setup_force_layout();

	//if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	//	alert("WARNING: This page uses a CPU-heavy force-directed layout -- not recommended for mobile devices!");
	//}

	function setup_d3_tooltips() {
		tip = d3.tip()
			.attr('class', 'd3-tip')
			.html(function(d) { return '<div style="color:red; font-weight:bold; background-color:lightyellow; border:2px solid red; border-radius:15px; padding:10px">'+d.title+'</div>'; })
			//.direction('nw')
			.offset([0, 3]);

	    tip2 = d3.tip()
			.attr('class', 'd3-tip')
			.html(function(d) { 
				str = '<div align="center"  style="background-color:lightyellow; border:2px solid red; border-radius:15px; padding:10px"><p style="color:red; font-weight:bold">'+d.title+'</p>' +
						'<a href="index.html#proj'+d.id+'"><img width="200" src="'+d.thumbnail_url+'"/></a></div>';
				return str;
			})
			//.direction('n')
			.offset([-3, 0]);	
	}

	$(window ).resize(doResize);

	function doResize() {
		var w = window.innerWidth-30;
		var h = window.innerHeight-100;  
		svg
			.attr("width", w)
			.attr("height", h);
		force.size([w,h]);
		$("rect#boundingRect").attr("width", w).attr("height", h)
	}


	function setup_force_layout() {
	  	force = d3.layout.force()
						//.size([w, h])
						.linkDistance(function (d) { //([100])
							if (!(d.source.hasOwnProperty("lang") && d.target.hasOwnProperty("lang"))) return 100;
							else return 500;
						})
						.linkStrength(function (d) {
							if (!(d.source.hasOwnProperty("lang") && d.target.hasOwnProperty("lang"))) return 0.8;
							else return 0.1;
						})
						.charge([-500])
						.gravity(0.3)           
						;

		svg = d3.select("body")
			.append("svg")
			.attr("id", "svgroot")
			//.attr("width", w)
			//.attr("height", h)
			;

		svg
			.append("rect")
			.attr("id", "boundingRect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("fill", "none")
			//.attr("width", w)
			//.attr("height", h)
			.attr("style", "stroke:blue;stroke-width:2;fill:white")
			;

		doResize(); // set width and height of svg, force, and bounding rect.
	  	
		var all_languages = "C#,VB.NET,Java,MATLAB,C/C++,Python,Flash/ActionScript,JavaScript,SQL,Visual Basic 6".split(",");
		var list_by_languages = [];
		all_languages.forEach(function(lang) {
			list_by_languages.push( { "lang": lang } );
		});

		// Create ref for root node, for edges to connect to:
		var root_node =  { "lang" : "ALL_LANGUAGES" };

		var edges = [];
		var nodes = [];
		nodes.push(root_node);

		d3.tsv("portfolio.tsv", function(error, nodedata) {
			nodedata.forEach(function(d,i) {
				d.thumbnail_url = d.image_url.substring(0,d.image_url.length-4) + "_thumbnail.png";
				d.thumbnail_url = "project_images/thumbnails/" + d.thumbnail_url.substring(d.thumbnail_url.indexOf("\/")+1);
			});
			
			var g = svg 
				.selectAll("g.project")
				.data(nodedata)
				.enter()					
				.append('g')
				.attr("class", "project")
				// Don't transform it here -- it would override what force computes:
				//.attr("transform", function (d,i) { return "translate("+(i*(itemWidth+15))+",0)  scale(1.0)"; })
				.attr("project", function (d) { 
					// TODO: Push an edge for each project it's in...
					//edges.push( { source: root_node, target: d });

					project_languages = d.languages.split(",");
					project_languages.forEach(function(proj_lang) {
						// Find the language node for proj_lang
						list_by_languages.forEach(function(l) {
							if (proj_lang == l.lang) 
								// create an edge from the language node to this project
								edges.push( { source: l, target: d });
						});
					});

					nodes.push( d );

					
					//d.scale = d.weight / 100.0 / 3.0;
					d.scale = .1 + d.weight/1000.0;
					//d.scale = 0.1;
					//console.log(d.title + ": d.weight=" + d.weight + " d.scale=" + d.scale);

					return d.title; 
				})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide)
				.on('click', function(d) {				
					//tip2.hide(d).show(d);
					console.log(tip2);
					tip.hide(d);
					tip2.show(d);
					d3.event.stopPropagation();
				})
				.call(tip)
				.call(tip2)
				.call(force.drag)
				;			

			d3.select("svg").on("click", function() {
				tip2.hide();
			});
			d3.select("body").on("click", function() {
				tip2.hide();
			});

	/*
		<svg width="500" height="500">
			<g transform="translate(100,100)">
				<rect  x="2" y="2" width="210" height="310" rx="5" ry="5"
		  			style="stroke:blue;stroke-width:2;fill:white" >
		  		</rect>
		  		<text x="7" y="30" width="200" height="300" font-family="Verdana" font-size="16" >Boston Car Data Explorer</text>
		  		<image width="200" height="150" x="7" y="35" xlink:href="project_images/thumbnails/ArcGISplugin_thumbnail.png" />
		  		<text x="7" y="300" width="200" height="300" font-family="Verdana" font-size="12" >Won Collaborative Data Award in 2014 doing work for the Mass. D.O.T. and MAPC in the ...</text>
			</g>
		</svg>
	*/
			g
				.append("rect")
				.attr("width", itemWidth+10)
				.attr("height", itemHeight)
				.attr("x", 2)
				.attr("y", 2)
				.attr("rx", 30) // rounded rect radius
				.attr("ry", 30)
				.attr("style", "stroke:blue;stroke-width:2;fill:lightyellow")
				//.attr("style", function (d) { 				
				//	var stroke_width = Math.round(30*d.weight/100);
				//	console.log("stroke-width:"+stroke_width);
				//	return "stroke:blue;fill:lightyellow;stroke-width:"+stroke_width; 
				//})
				;
			
			g
				.append("text")
				.attr("x", 7 +20) // add a bit so that we can increase rounded rect radius
				.attr("y", 25)
				.attr("font-family", "Verdana")
				.attr("font-size", 14)
				.attr("style", "stroke:blue")
				.text(function (d) { return d.title; });

			g
				.append("image")
				.attr("x", 7)
				.attr("y", 35)
				.attr("width", itemWidth)
				.attr("height", imageHeight)
				.attr("xlink:href", function(d) { return d.thumbnail_url; })
				;

			var edges_lines = svg.selectAll("line")
				.data(edges)
				.enter()
				.append("line")
				.attr("class", "edge")
				.style("stroke", "#ccc")
				.style("stroke-width", 1);


			// Draw root node last, so that it's on top
			if (false)
			d3.select("svg").selectAll("g.root")
					.data( [ root_node ])
					.enter()
					.append("g")
					.attr("class", "root")
					.attr("lang", function (d) { 
						//nodes.push( d );
						return d.lang; 
					})
					.call(force.drag)
					.append("circle")
					.attr("r", 5)
					.attr("fill", "skyblue")
					.attr("style", "stroke:blue")			
					;


			// draw language labels last, so that they're on top
			d3.select("svg").selectAll("g.language")
					.data(list_by_languages)
					.enter()
					.append("g")
					.attr("class", "language")
					.attr("lang", function (d) { 
						//edges.push( { source: root_node, target: d });
						nodes.push( d );
						return d.lang; 
					})
					.call(force.drag)
					.append("text")		
					.attr("font-family", "Verdana")
					.attr("font-size", 14)
					.attr("style", "stroke:blue")
					.text(function (d) { return d.lang; })
					// Don't specify "x" or "y" or (for <g>) "transform" -- let the force simulator do that
					//.attr("x", function (d,i) { console.log(i*100, d); return i*100; })
					//.attr("y", function (d,i) { return 100; })
					//.attr("transform", function (d,i) { return "translate("+(i*75)+",100)"; })
					;

			force.links(edges);
			force.nodes(nodes);
			force.start();		
		});

		force.on("tick", function() {
			d3.selectAll("g.root")
				.attr("transform", function(d) { return "translate("+d.x+","+d.y+")" } );

			d3.selectAll("g.language")
				.attr("transform", function(d) { return "translate("+d.x+","+d.y+")" } ); // d.x and d.y have been updated by the force simulation

			d3.selectAll("g.project")
				//.attr("transform", function(d) { return "translate("+d.x+","+d.y+") scale(0.1)" } );
				.attr("transform", function(d) { 
					return "translate("+d.x+","+d.y+") scale("+d.scale+")" ;
				});

			d3.selectAll("line.edge")
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		});

	  	d3.selection.prototype.appendToNode = function(par) { 
		    return this.each(function() { 
		        par.append(this); 
		    }); 
	    };	

	}
	