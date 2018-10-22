//Declare global variables
var placesIndex, currPlaceIndex, currPlaceName, currPlaceCoor, currPlaceDescr;
var currPlaceLat, currPlaceLng;
var northBound, southBound, eastBound, westBound;
var endOfGame, score, userHint;
//Declare global object
var favPlaces = [
	{"content":"Vaughan","coordinates":{"lat":43.8372,"lng":-79.5083}},
	{"content":"Plainfield","coordinates":{"lat":41.6322,"lng":-88.2120}},
	{"content":"Austria", "coordinates":{"lat":47.5162, "lng":14.5501}},
	{"content":"China", "coordinates":{"lat":40.4319, "lng": 116.5704}},
	{"content":"Finland", "coordinates":{"lat":61.9241, "lng":25.7482}}
];
var secretPlace = {content:"Cheat Code to win", coordinates:{lat:-79.46575486609832,lng:-47.213916509006594}};
var favPlacesDescr = [
	{content:"This is where my girlfriend lives"},
	{content:"Home"},
	{content:"This is around where I would like to go <br />cross country biking"},
	{content:"This is where my brother went to one <br />year for an orchestra performance"},
	{content:"Did research on Finnish Christmas and <br />always wanted to visit"}
];
//Create an object to contain individual hints
var hints = {
	NORTH: "You are south of the location, move north.  ",
	SOUTH: "You are north of the location, move south.  ",
	EAST: "You are west of the location, move east.  ",
	WEST: "You are east of the location, move west.  "
}
function initGame() {
	placesIndex = favPlaces.length - 1;
	currPlaceIndex = placesIndex;
	currPlaceName = favPlaces[currPlaceIndex].content;
	currPlaceCoor = favPlaces[currPlaceIndex].coordinates;
	currPlaceLat = currPlaceCoor.lat;
	currPlaceLng = currPlaceCoor.lng;
	currPlaceDescr = favPlacesDescr[currPlaceIndex].content;
	userHint = document.getElementById("userHint");
	score = 0;
	document.getElementById("score").value = score;
	initMap();
}
//Logging location and it's coordinates once the person has found the destination
var consoleLog = function() {
	console.log(currPlaceName + " is located at: {" + currPlaceCoor.lat + ", " + currPlaceCoor.lng + "}\n");
}
//returns true if the current bounds of map contain the current location
var inBounds = function(map,currPlaceCoor) {return (map.getBounds().contains(currPlaceCoor)?true:false);}	
function initMap() {
	var mapCenter = new google.maps.LatLng(43.8372,-29.5083);
	var infoWindow, marker; 
	var mapCnvs = document.getElementById("mapCont");
	var mapProp = {
		center:mapCenter,
		zoom:3,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(mapCnvs,mapProp);
	
	var boundsChanged = google.maps.event.addListener(map,"bounds_changed",function() {
		//Store current bounds to give respective hints
		northBound = map.getBounds().getNorthEast().lat();
		eastBound = map.getBounds().getNorthEast().lng();
		southBound = map.getBounds().getSouthWest().lat();
		westBound = map.getBounds().getSouthWest().lng();
		
		//Check location of bounds in regards to current favorite place
		if (inBounds(map,currPlaceCoor))
			userHint.value = "You are within bounds";
		
		/********************************************/
		/*    If the user is not within bounds		*/
		/* then they are either within the latitude */ 
		/*   bound, the longitude bound or neither 	*/
		/********************************************/
		//Within the longitude bound
		else if((northBound > currPlaceLat) && (southBound < currPlaceLat)) {
			userHint.value = (eastBound < currPlaceLng)?(hints.EAST):(hints.WEST);
		}
		//Within the latitude bound
		else if ((eastBound > currPlaceLng) && (westBound < currPlaceLng)){
			userHint.value = (northBound < currPlaceLat)?(hints.NORTH):(hints.SOUTH);
		}
		// Neither requirements are met -> both hints
		else { 
			userHint.value = (northBound < currPlaceLat)?(hints.NORTH):(hints.SOUTH);
			userHint.value += (eastBound < currPlaceLng)?(hints.WEST):(hints.EAST);
		}
	});
	google.maps.event.addListener(map,"zoom_changed",function(event){
		console.log("Zoom: " + map.getZoom());
	});
	google.maps.event.addListener(map,"idle",function(){
		//Adding the !endOfGame prevents map from adding marker when map is zoomed out at the end of the game
		if((inBounds(map,currPlaceCoor)) && (map.getZoom() >= 8) && (!endOfGame)){
			console.log("Found!")
			setMarker();
		}
		//Check for secret location
		if((map.getZoom() >= 6) && (map.getBounds().contains(secretPlace.coordinates))){
			marker = new google.maps.Marker({
				position:secretPlace.coordinates,
				map:map
			});
			infoWindow = new google.maps.InfoWindow({
				content: "Right click the marker"
			});
			infoWindow.open(map,marker);
			google.maps.event.addListener(marker,"rightclick",function(){
				document.querySelector("button").style.display = "block";
				document.querySelector("button").addEventListener("click",function(){
					displayAll();
				});
			});
		}
	});
	function setMarker() {
		//map.panTo(currPlaceCoor);
		marker = new google.maps.Marker({
			position:currPlaceCoor,
			map:map,
			animation:google.maps.Animation.BOUNCE
		});
		infoWindow = new google.maps.InfoWindow({
			content:currPlaceDescr
		});
		infoWindow.open(map,marker);
		console.log("FOUND");
		//Increment score
		score += 10;
		document.getElementById("score").value = score;
		consoleLog();
		setTimeout(function() {nextPlace(map,mapCenter);}, 5000);
	}
	google.maps.event.addListener(map,"click",function(event){
		var currArea = new google.maps.Circle({
			center:event.latLng,
			radius:100000,
			strokeColor:"#00FFFF",
			strokeOpacity:1,
			strokeWeight:3,
			fillColor:"#00FFFF",
			fillOpacity:0.5,
		});
		currArea.setMap(map);
	});
	var displayAll = function() {
		for(var r=currPlaceIndex ; r>=0; r--){
			marker = new google.maps.Marker({
				position:favPlaces[r].coordinates,
				map:map,
				animation:google.maps.Animation.BOUNCE
			});
			infoWindow = new google.maps.InfoWindow({
				content:favPlacesDescr[r].content
			})
			infoWindow.open(map,marker);
			score += 50;
		}	
		document.getElementById("score").value = score;
		map.setCenter({lat:map.getBounds().lat,lng:0});
		map.setZoom(3);
	}
}
function nextPlace(map,center) {
	currPlaceIndex--;
	endOfGame = (currPlaceIndex>=0)?false:true;
	console.log("Next Place");
	if(!endOfGame) {
		currPlaceName = favPlaces[currPlaceIndex].content;
		currPlaceCoor = favPlaces[currPlaceIndex].coordinates;
		currPlaceLat = currPlaceCoor.lat;
		currPlaceLng = currPlaceCoor.lng;
		currPlaceDescr = favPlacesDescr[currPlaceIndex].content;
		userHint.value = "";
	}
	else 
		endOfGameSurprise();
	
	//Reset map each time 
	map.setCenter(center);
	map.setZoom(3);
}
var endOfGameSurprise = function() {
	console.log("End of Game!");
}
