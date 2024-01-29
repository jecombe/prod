import React, { useState, useRef } from "react";
import Map from "../../components/Map";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { icon } from "leaflet";
const DEFAULT_CENTER = [0, 0];
const ICON = icon({
  iconUrl: "/nfts.png",
  iconSize: [32, 32],
});

const Map2 = (props) => {
  console.log(props);
  return (
    <>
      <Map width="10" height="5" center={DEFAULT_CENTER} zoom={1}>
        {({ TileLayer, Marker, Popup }) => (
          <>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {props.markers.map((coord, index) => (
              <Marker key={index} position={coord.position} icon={ICON}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </Map>
    </>
  );
};

export default Map2;
