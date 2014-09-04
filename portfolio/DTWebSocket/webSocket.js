	//var wsUri = "ws://localhost:8089";

	window.addEventListener("beforeunload", beforeunload, false);

	function beforeunload() {
		websocket.close();
	}

	function startWebSocket() {
		document.getElementById("btnConnect").disabled = true;		
		document.getElementById("btnCloseConnection").disabled = false;
		document.getElementById("btnSendMessage").disabled = false;
		websocket = new WebSocket(document.getElementById("txtWsURL").value);
		websocket.onopen = function(evt) { onOpen(evt) };
		websocket.onclose = function(evt) { onClose(evt) };
		websocket.onmessage = function(evt) { onMessage(evt) };
		websocket.onerror = function(evt) { onError(evt) };
	}

	function stopWebSocket() {
		websocket.close();
		document.getElementById("btnConnect").disabled = false;		
		document.getElementById("btnCloseConnection").disabled = true;		
		document.getElementById("btnSendMessage").disabled = true;
	}
	
	function onOpen(evt) {
		writeToScreen("CONNECTED");
		//doSend("Client says WebSockets rock!");
	}
	
	function onClose(evt) {
		writeToScreen("DISCONNECTED");
	}
	
	function onMessage(evt) {
		if (evt.data.indexOf("TOUCHDATA:") == 0) {
	        var dtev = parseDtev(evt.data);

	        if (document.getElementById("chkShowTouchData").checked) {
	       		writeToScreen("TOUCHDATA: receiverId=" + dtev.receiverId + " eventType=" + dtev.eventType + " x=" + dtev.x + " y=" + dtev.y +
                            " left=" + dtev.left + " right=" + dtev.right + " top=" + dtev.top + " bottom=" + dtev.bottom +
                            " timestamp=" + dtev.unixtimestamp + " xSegmentCount=" + dtev.xSegmentCount + " ySegmentCount=" + dtev.ySegmentCount);
	       	}
	       processDtev(dtev);
		} else if (evt.data.indexOf("CONNECTED:") == 0) {
			var responseParts = evt.data.split(";");
			var wsUriParts = responseParts[responseParts.length-1].split("=");
			document.getElementById("h2title").innerHTML = "DT WebSocket Test ["+wsUriParts[1]+"]";
			writeToScreen("Connected on websocket " + wsUriParts[1]);
		} else {
			writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');	
		}	
	}
	
	function onError(evt) {
		writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
	}
	function doSend(message) {
		writeToScreen("SENT: " + message);
		websocket.send(message);
	}
	function writeToScreen(message) {
		var consoleDiv = document.getElementById("console");
		consoleDiv.innerHTML  += message + "<br>";
		consoleDiv.scrollTop = consoleDiv.scrollHeight;
	}

	function parseDtev(e) {		
		var dtev = {};
        var newdata = e.substring(10).trim().split(',');
        dtev.receiverId = parseInt(newdata[0]);
        dtev.eventType = parseInt(newdata[1]);
        dtev.x = parseInt(newdata[2]);
        dtev.y = parseInt(newdata[3]);
        dtev.left = parseInt(newdata[4]);        
        dtev.right = parseInt(newdata[5]);
        dtev.top = parseInt(newdata[6]);
        dtev.bottom = parseInt(newdata[7]);
        dtev.unixtimestamp = parseInt(newdata[8]);
        //DateTime timestamp =  getDateTimeFromUnixTimestamp(unixtimestamp);
        //DateTime timestamp = new DateTime(1970, 1, 1, 0, 0, 0).AddTicks(unixtimestamp * 1000);
        //DateTime timestamp = new DateTime(unixtimestamp);
        dtev.xSegmentCount = parseInt(newdata[9]);
        dtev.ySegmentCount = parseInt(newdata[10]);
        dtev.xSignalString = newdata[11];
        dtev.ySignalString = newdata[12];
        dtev.xSegmentString = newdata[13];
        dtev.ySegmentString = newdata[14];	

        // convert from screen coordinates
        var svgrect = document.getElementById("svgroot").getBoundingClientRect();

        // MAJOR PROBLEM: Except with IE, there is no way (in JavaScript) to convert DT screen coordinates to browser client coordinates.
        // POTENTIAL SOLUTION 1: If the DTWebSocketServer (C# program) is running on the same machine, have it use Win32 GetWindowRect
        //                       and GetClientRect calls to compute the offset and send it through the websocket to the appropriate browser.
        // POTENTIAL SOLUTION 2: Write code to generate Touch events from DT touches (like DTMouse does to create mouse events).
		// SOLUTION 3:           Both Chrome and FF have a full-screen presentation mode that removes all chrome. (Safari doesn't).
        //
        // window.screenY: On FF, IE, Chrome it's the distance from top of screen to top of browser window (inc chrome).
        // window.screenTop: IE: it's top of screen to top of browser client area (page content); on chrome it's same as screenY; FF doesn't have it.
        // window.screenTop: Chrome: it's the same as screenY
        // window.screenTop: FF doesn't have it.

		var screenLeft =  window.screenLeft;
		var screenTop = window.screenTop;
		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		    screenLeft =  window.screenX;
			screenTop = window.screenY;
		}
		// Scribbles will be wrong for FF and Chrome -- no way to compute distance from top left of window to top-left of client area.
		//console.log("window.screenY=" + window.screenY+ " window.screenTop=" + window.screenTop);
		//console.log("window.screenX=" + window.screenX+ " window.screenLeft=" + window.screenLeft);
		//console.log("window.outerWidth=" + window.outerWidth+ " window.innerWidth=" + window.innerWidth);
		//console.log("window.outerHeight=" + window.outerHeight+ " window.innerHeight=" + window.innerHeight);
		dtev.left = dtev.left - screenLeft - svgrect.left;
		dtev.right = dtev.right - screenLeft - svgrect.left;
		dtev.top = dtev.top - screenTop - svgrect.top;		
		dtev.bottom = dtev.bottom - screenTop - svgrect.top;

		dtev.x = dtev.left + (dtev.right - dtev.left)/2.0;
		dtev.y = dtev.top + (dtev.bottom - dtev.top)/2.0;

        return dtev;
	}

