// import React, { useState, useRef } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMapEvents,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// const ICON = L.icon({
//   iconUrl: "/nfts.png",
//   iconSize: [32, 32],
// });
function LocationMarker({ handleMapClick }) {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
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
// const TouchMap = ({ handleMapClick }) => {
//   console.log(handleMapClick);
//   const [center, setCenter] = useState({ lat: -4.043477, lng: 39.668205 });
//   const ZOOM_LEVEL = 3;
//   const mapRef = useRef();

//   const handleClick = (e) => {
//     // Obtenir les coordonnées du clic
//     const { lat, lng } = e.latlng;
//     console.log(`Latitude: ${lat}, Longitude: ${lng}`);
//     if (onMapClick) {
//       onMapClick({ lat, lng });
//     }
//   };

//   return (
//     <div className="container">
//       <div className="row">
//         <div className="col">
//           <div className="container">
//             <MapContainer
//               center={center}
//               zoom={ZOOM_LEVEL}
//               ref={mapRef}
//               style={{ height: "300px", width: "100%" }}
//               //              onclick={handleClick} // Utilisez onclick au lieu de onClick
//               onClick={handleClick} // Utilisez onClick au lieu de onclick
//             >
//               <TileLayer
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
//               {/* <Marker position={[51.505, -0.09]} icon={ICON}>
//                 <Popup>
//                   A pretty CSS3 popup. <br /> Easily customizable.
//                 </Popup>
//               </Marker> */}
//               <LocationMarker handleMapClick={handleMapClick} />
//             </MapContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TouchMap;

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";

const ICON = L.icon({
  iconUrl: "/nfts.png",
  iconSize: [32, 32],
});

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  {
    ssr: false,
  }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// const LocationMarker = dynamic(
//   () => import("./LocationMarker").then((mod) => mod.LocationMarker),
//   {
//     ssr: false,
//   }
// );

const TouchMap = ({ handleMapClick }) => {
  const [center, setCenter] = useState({ lat: -4.043477, lng: 39.668205 });
  const ZOOM_LEVEL = 3;
  const mapRef = useRef();

  const handleClick = (e) => {
    // Obtenir les coordonnées du clic
    const { lat, lng } = e.latlng;
    if (handleMapClick) {
      handleMapClick({ lat, lng });
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="container">
            <MapContainer
              center={center}
              zoom={ZOOM_LEVEL}
              ref={mapRef}
              style={{ height: "300px", width: "100%" }}
              onClick={handleClick}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* <LocationMarker handleMapClick={handleMapClick} /> */}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouchMap;
