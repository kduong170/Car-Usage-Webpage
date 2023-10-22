function initialize() {
	var mapOptions = {
		mapTypeControl: false,
		zoom: 18,
		center: { lat: 37.870277985341026, lng: -122.2594820538404 }
	};
	var map = new google.maps.Map(document.getElementById("map"),mapOptions);

	new AutocompleteDirectionsHandler(map);
};

class AutocompleteDirectionsHandler {
  	map;
  	originPlaceId;
  	destinationPlaceId;
  	travelMode;
  	directionsService;
  	directionsRenderer;
  	constructor(map) {
    	this.map = map;
    	this.originPlaceId = "";
    	this.destinationPlaceId = "";
    	this.travelMode = google.maps.TravelMode.DRIVING;
    	this.directionsService = new google.maps.DirectionsService();
    	this.directionsRenderer = new google.maps.DirectionsRenderer();
    	this.directionsRenderer.setMap(map);

	const originInput = document.getElementById("start");
    const destinationInput = document.getElementById("end");
    // Specify just the place data fields that you need.
    const originAutocomplete = new google.maps.places.Autocomplete(
      originInput,
      { fields: ["place_id"] },
    );
    // Specify just the place data fields that you need.
    const destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput,
      { fields: ["place_id"] },
    );

    
    this.setupPlaceChangedListener(originAutocomplete, "ORIG");
    this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
  }
  
  setupPlaceChangedListener(autocomplete, mode) {
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.place_id) {
        window.alert("Please select an option from the dropdown list.");
        return;
      }

      if (mode === "ORIG") {
        this.originPlaceId = place.place_id;
      } else {
        this.destinationPlaceId = place.place_id;
      }

      this.route();
    });
  }
  route() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }

    const me = this;

    this.directionsService.route(
      {
        origin: { placeId: this.originPlaceId },
        destination: { placeId: this.destinationPlaceId },
        travelMode: this.travelMode,
      },
      (response, status) => {
        if (status === "OK") {
          me.directionsRenderer.setDirections(response);
	  me.CalcDistance(response);
        } 
	else {
          window.alert("Directions request failed due to " + status);
        }
      },
    );
  }

  CalcDistance(directionsResult) {
	var TotalEng = 0;
	const Route = directionsResult.routes[0].legs[0];
	for (let i = 0; i < Route.steps.length; i++) {
		var v = Route.steps[i].distance.value / Route.steps[i].duration.value;
		TotalEng += 0.5 * 1.296 * v * v * 2.633 * 0.28 * Route.steps[i].distance.value;
	}
	TotalEng += 1640 * 9.8 * 0.01 * directionsResult.routes[0].legs[0].distance.value;
	TotalEng *= 1.2

	document.getElementById("energy").innerHTML = TotalEng.toFixed(4) + " Joules";
	}
}

