// Movement class - sent to the server
var movement = function(source, destination, units) {
	// Source node id for movement
	this.source = source;
	// Destination node id for movement
	this.destination = destination;
	// Number of units sent for movement
	this.units = units;
}