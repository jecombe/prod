import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
function LocationMarker({ handleMapClick }) {
  console.log("marker", handleMapClick);
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      console.log(e.latlng);
      setPosition(e.latlng);
      // map.flyTo(e.latlng, map.getZoom());
      //map.locate();
      if (handleMapClick) {
        handleMapClick(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={ICON}>
      <Popup>You are here</Popup>
    </Marker>
  );
}
