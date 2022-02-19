
const mapStyles =[
    {
      "featureType": "administrative",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
];

let targetClicked = false;

const cityMarker = new google.maps.Marker({
    map:null,
    position:null,
    icon:{
      url: 'assets/images/home-red.png',
      scaledSize: new google.maps.Size(36,36), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(18,36), // anchor
      labelOrigin:new google.maps.Point(18,0)
    },
    clickable:false,
    draggable:false
});

const targetMarker = new google.maps.Marker({
    map:null,
    position:null,
    icon:{
      url: 'assets/images/home-green.png',
      scaledSize: new google.maps.Size(36,36), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(18,36), // anchor
      labelOrigin:new google.maps.Point(18,0)
    },
    draggable:true
});

const distancePath = new google.maps.Polyline({
    map:null,
    path: [],
    geodesic: true,
    strokeOpacity: 0,
    icons: [
      {
        icon: {
          path: "M 0,-1 0,1",
          strokeOpacity: 1,
          strokeWeight:2,
          strokeColor:'orange',
          scale: 4,
        },
        offset: "4px",
        repeat: "16px",
      }
    ],
  clickable:false
});

const labelMarker = new google.maps.Marker({
    map: null,
    position: null,
    icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0
    },
    label:{
        text: '',
        fontFamily:'Roboto',
        color:'black',
        fontSize:'20px',
        className: 'distance-label'
    },
    clickable:false,
    draggable:false,
    //zIndex:1,
    opacity:1
});

function initMap() {
    
    var mapOptions = {
        zoom: 11,
        center: { lat: 40.6976637, lng: -74.1197637 },
        zoomControl:true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM,
        },
        mapTypeControl:false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        streetViewControl: false,
        clickableIcons: false,
        styles: mapStyles
    }
   
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var input = document.getElementById("input-address");
    const options = {
      types: ['(cities)'],
      //componentRestrictions: {country: "us"}
    }
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    google.maps.event.addListener(autocomplete, "place_changed", function () {
        var place = autocomplete.getPlace();
        if(place && place.geometry && place.formatted_address){
            cityMarker.setOptions({
              map:map,
              position:place.geometry.location,
            });
            targetMarker.setMap(null);
            distancePath.setMap(null);
            labelMarker.setMap(null);
            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
            } else {
              map.setZoom(16);
            }
            map.setCenter(place.geometry.location);
        }
    });

    google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
      
      document.querySelector(".search-box").style.display='flex';
      document.getElementById("select-point-button").style.display='block';

      map.addListener("mousemove", (e) => {
         if(cityMarker.position && targetClicked){
           var p1 = cityMarker.getPosition();
           var p2 = e.latLng;
           updateChanges(p1,p2);
         }
      });

      map.addListener("click", (e) => {
          if(cityMarker.position && targetClicked){
              targetClicked = false;
              map.setOptions({
                draggableCursor:'grab',
                draggingCursor:'grabbing'
              });
              targetMarker.setOptions({
                map:map,
                position:e.latLng
              });
              var p1 = cityMarker.getPosition();
              var p2 = e.latLng;
              updateChanges(p1,p2);
          }
      });

      document.getElementById("select-point-button").addEventListener('click', function(){
         targetClicked = true;
         map.setOptions({
           draggableCursor:`url('assets/images/home-green.png') 18 36, auto`,
           draggingCursor:'none'
         });
         targetMarker.setMap(null);
         distancePath.setMap(null);
         labelMarker.setMap(null);
      });

      targetMarker.addListener('drag', function(e){
        if(cityMarker.position){
           var p1 = cityMarker.getPosition();
           var p2 = e.latLng;
           updateChanges(p1,p2);
        }
      });     

      function updateChanges(p1,p2){
          distancePath.setMap(map)
          labelMarker.setMap(map);
          var center = new google.maps.LatLng((p1.lat() + p2.lat())/2,(p1.lng() + p2.lng())/2);
          var dist = google.maps.geometry.spherical.computeDistanceBetween (p1,p2) * 0.000621371192; // miles
          var heading = google.maps.geometry.spherical.computeHeading(p1,p2);
          heading = heading<0?180+heading-90:heading-90;
          distancePath.setPath([p1,p2]);
          labelMarker.setPosition(center);
          var label = labelMarker.getLabel();
          label.text = `${dist.toFixed(2)} miles`;
          labelMarker.setLabel(label);
          setTimeout(function(){
            var labelElement = document.querySelector(".distance-label");
            if(labelElement){
              labelElement.style.transform = `rotate(${heading}deg) translateY(-10px)`;
            }
          }, 300);
      }
      
  });
  
}

google.maps.event.addDomListener(window, 'load', initMap); 

