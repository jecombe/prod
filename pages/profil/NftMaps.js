import React, { useState, useRef } from "react";
import Map from "./Map";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { icon } from "leaflet";
const DEFAULT_CENTER = [38.907132, -77.036546];
const ICON = icon({
  iconUrl: "/nfts.png",
  iconSize: [32, 32],
});

const Map2 = () => {
  return (
    <>
      <h1>Next.js Leaflet Starter</h1>

      <Map width="10" height="5" center={DEFAULT_CENTER} zoom={12}>
        {({ TileLayer, Marker, Popup }) => (
          <>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={DEFAULT_CENTER} icon={ICON}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </>
        )}
      </Map>
    </>
  );
};

export default Map2;
