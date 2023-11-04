// components/MiniMap.js
import { GoogleMap, Marker } from "@react-google-maps/api";

export function MiniMap({ markers, onMiniMapClick, position }) {
  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "100%",
      }}
      center={position}
      zoom={2}
      options={{
        disableDefaultUI: true,
      }}
      onClick={onMiniMapClick}
    >
      {markers.map((marker, index) => (
        <Marker key={index} position={marker} />
      ))}
    </GoogleMap>
  );
}
