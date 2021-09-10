/*
Create and Render map on div with zoom and center
*/

let wmsLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    params: {'LAYERS': 'ne:ne', 'TILED': true},
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
  })
});
class OLMap {
  //Constructor accepts html div id, zoom level and center coordinaes
  constructor(map_div, zoom, center) {
    this.map = new ol.Map({
      target: map_div,
      layers: [       
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        wmsLayer
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(center),
        zoom: zoom
      })
    });
  }
}
/*
Create overlay
*/
class Overlay {
  //Contrctor accepts map object, overlay html element, overlay offset, overlay positioning and overlay class
  constructor(map, element = document.getElementById("popup"), offset = [0, 0], positioning = 'bottom-center',   className = 'ol-tooltip-measure ol-tooltip .ol-tooltip-static') {
    this.map = map;
    this.overlay = new ol.Overlay({
      element: element,
      offset: offset,
      positioning: positioning,
      className: className
    });
    this.overlay.setPosition([0,0]);
    this.overlay.element.style.display = 'block';      
    this.map.addOverlay(this.overlay);    
    
  }
}

//Create map and vector layer
let map = new OLMap('map', 1, [-96.6345990807462, 32.81890764151014]).map;

map.on('singleclick', function (e) {  
  let url = wmsLayer.getSource().getFeatureInfoUrl(
    e.coordinate,
    map.getView().getResolution(),
    'EPSG:3857', 
    {
      'INFO_FORMAT': 'application/json',
      'propertyName': 'sovereignt,scalerank,labelrank,type'
    }
  );
  fetch(url)
    .then((response) => response.text())
      .then((json) => {
        map.getOverlays().clear();
        let popup = new Overlay(map).overlay;
        popup.setPosition(e.coordinate);
        let feature = JSON.parse(json).features;
        if (feature.length) {
          let properties = feature[0].properties;
          let table = document.createElement('table');          
          Object.entries(properties).forEach((value) => {            
            let tr = document.createElement('tr');
            let td1 = document.createElement('th')
            td1.style.textAlign = "left";
            let td2 = document.createElement('td')
            td2.style.textAlign = "left";
            td1.innerHTML = value[0];
            td2.innerHTML = value[1];
            tr.append(td1);
            tr.append(td2);
            table.append(tr);
          });
          popup.element.append(table);
        } else {
          map.getOverlays().clear();
        }
      });
      
});