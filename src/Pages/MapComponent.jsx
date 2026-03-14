import React, { useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap, LayersControl } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import * as turf from "@turf/turf";
import api from "../services/api";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

const { BaseLayer } = LayersControl;

function SearchControl() {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true
    })
      .on("markgeocode", function (e) {
        const bbox = e.geocode.bbox;
        const bounds = L.latLngBounds(bbox);
        map.fitBounds(bounds);
      })
      .addTo(map);

    return () => map.removeControl(geocoder);
  }, [map]);

  return null;
}

/* Convert coordinates → WKT polygon */
function toWKT(coords) {
  const first = coords[0];
  const last = coords[coords.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push(first);
  }

  const points = coords.map(c => `${c[0]} ${c[1]}`).join(",");

  return `POLYGON((${points}))`;
}
function wktToLatLngs(wkt) {

  const coordsText = wkt
    .replace("POLYGON((", "")
    .replace("))", "");

  return coordsText.split(",").map(c => {

    const [lng, lat] = c.trim().split(" ");

    return [parseFloat(lat), parseFloat(lng)];

  });
}

const MapComponent = () => {

  const handleCreate = (e) => {

    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];

    const coordinates = latlngs.map(point => [point.lng, point.lat]);

    const polygon = turf.polygon([[...coordinates, coordinates[0]]]);

    const areaSqMeters = turf.area(polygon);
    const areaAcres = areaSqMeters * 0.000247105;

    const popupContent = `
      <div style="width:200px">
        <h4>Create Polygon</h4>
        <p>Area: ${areaAcres.toFixed(2)} acres</p>

        <input 
          id="polygonName"
          type="text"
          placeholder="Polygon Name"
          style="width:100%;padding:5px;margin-bottom:8px"
        />

        <button id="savePolygon" style="width:100%;padding:6px">
          Save
        </button>
      </div>
    `;

    layer.bindPopup(popupContent).openPopup();

    setTimeout(() => {

      const btn = document.getElementById("savePolygon");

      if (btn) {

        btn.onclick = async () => {

          const name = document.getElementById("polygonName").value;

          if (!name) {
            alert("Please enter polygon name");
            return;
          }

          const polygonWkt = toWKT(coordinates);

          const payload = {
            name: name,
            polygonWkt: polygonWkt,
            areaAcres: areaAcres
          };

          try {

            /* Check collision */
            const collisionRes = await api.post("/check-collision", payload);

            if (collisionRes.data.collision) {

              const collisions = collisionRes.data.data;
            
              collisions.forEach(c => {

                const existingCoords = wktToLatLngs(c.polygon);
                const intersectionCoords = wktToLatLngs(c.intersection);
              
                /* Existing polygon */
                L.polygon(existingCoords, {
                  color: "yellow",
                  weight: 2
                })
                .bindPopup(`
                  <b>${c.name}</b><br/>
                  Area: ${c.area.toFixed(2)} acres
                `)
                .addTo(layer._map);
              
                /* Intersection area */
                L.polygon(intersectionCoords, {
                  color: "red",
                  fillColor: "red",
                  fillOpacity: 0.6
                })
                .bindPopup(`
                  <b>Intersection</b><br/>
                  With: ${c.name}<br/>
                  Area: ${c.area.toFixed(2)} acres
                `)
                .addTo(layer._map);
              
              });
            
              alert("Polygon intersects existing land!");
            
            } else {

              /* Save polygon */
              const saveRes = await api.post("/save", payload);

              console.log("Saved polygon:", saveRes.data);

              alert("Polygon saved successfully!");

              layer.closePopup();

            }

          } catch (error) {

            console.error("Backend error:", error);

            alert("Error communicating with backend");

          }

        };

      }

    }, 100);
  };

  return (
    <MapContainer
      center={[17.3850, 78.4867]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >

      <LayersControl position="topright">

        <BaseLayer name="Street Map">
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </BaseLayer>

        <BaseLayer checked name="Satellite">
          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </BaseLayer>

      </LayersControl>

      <SearchControl />

      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreate}
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false
          }}
        />
      </FeatureGroup>

    </MapContainer>
  );
};

export default MapComponent;