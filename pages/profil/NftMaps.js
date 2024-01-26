import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import { icon } from "leaflet";

const ICON = icon({
  iconUrl: "/nfts.png",
  iconSize: [32, 32],
});

const NftMaps = () => {
  const [center, setCenter] = useState({ lat: -4.043477, lng: 39.668205 });
  const ZOOM_LEVEL = 3;
  const mapRef = useRef();
  return (
    <>
      <h1>MAPS CONTAINER</h1>
      <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef}>
        {/* <Marker position={[51.505, -0.09]} icon={ICON}></Marker> */}
      </MapContainer>
    </>
  );
};

export default NftMaps;
