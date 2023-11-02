import React from "react";

import HomeView from "./home/page";
function Map() {
  const lib = ["places"];

  /*return (
    <LoadScript googleMapsApiKey={process.env.API_MAP} libraries={lib}>
      <div className={styles.container}>
        <Navbar />
        <Print />
        <Footer />
      </div>
    </LoadScript>
  );*/
  return <HomeView />;
}

export default Map;
