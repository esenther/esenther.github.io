DTWebSocketServer is a Visual Studio 2013 C# WPF project that collects DiamondTouch touch events and pipes them to an HTML5 WebSocket. All source code for the WebSocket server and HTML client is included. This project was developed mostly because I wanted to develop DiamondTouch visualizations using D3.js. The example web page takes DT touch event data from the WebSocket and draws lines or "ripples" using D3.js.

This allows arbitrary web pages to receive DT touch events without embedding the DiamondTouch ActiveX control. The older technique of including the DT ActiveX control on the webpage only worked in Internet Explorer. Even in Internet Explorer support for ActiveX controls is no longer recommended, and is increasingly flakey due to much-needed browser security restrictions. 

To setup: 

SERVER: 
In a cmd.exe window, cd to DTWebSocketServer\DTWebSocketServer\bin\Debug\ and execute dtwebsocketserver.exe. Or open the DTWebSocketServer\DTWebSocketServer.sln project in Visual Studio 2013 and click Start (F5) to run the server. If you get an exception, make sure that the DiamondTouch USB cable is plugged in first. Click the "Start WS" button to start the WebServer. To confirm it's working, check the "Show Touch Data" checkbox and touch the DiamondTouch table (while touching one of the receiver pads, too, of course), and confirm that the console shows the touch event data.

WEB BROWSER:
The client web page source files are all in the DTWebSocketServer directory. They include index.html, webSocket.js, drawings.js, and d3.js. The d3.js file is a copy of the publicly available d3.js library. You'll probably want to grab the latest version, and to use the .min.js version (much smaller!).
Start a web server on say, port 8888 and host these files from that web server. (E.g. browse to the DTWebSocketServer directory, open a cmd.exe window and execute "python -m SimpleHTTPServer 8888" in a cmd.exe). 

To run:
In any reasonably recent web browser (Chrome, Internet Explorer, Firefox) browse to the index.html page. Click the "Connect" button. It connects to the websocket at ws://localhost:8089 by default, but you can specify a custom IP address and/or port here as you like. Note that the client doesn't have to be on the same computer as the server, so this is a way to see DT touch events on a Mac, tablet, or smart phone.
Multiple touchers can now simultaneously scribble. Touchers 0, 1, 2 and 3 will show up as red, blue, green and yellow, respectively. Click the "Ripples" checkbox to switch from scribbles to a ripple effect on touch-DOWN events. This is provides a nice example of using D3.js with DiamondTouch.

Enjoy!

ISSUES: The DTWebSocketServer sends raw screen coordinates of touches to the web page. Internet Explorer is the only web browser that lets you compute the offset from the browser window to the content of the web page. Unless the browser is in Full Screen (Presentation Mode on Chrome) with no toolbars/chrome showing, the touches will not be calibrated quite right. The source code in websocket.js has comments that discuss this issue and presents workarounds.
