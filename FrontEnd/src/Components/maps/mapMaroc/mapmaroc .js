import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "./mapmaroc.css"
import { useEffect, useState } from 'react';

const MapMaroc = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/data/maroc.geojson') 
      .then(response => response.json())
      .then(data => setGeoData(data));
  }, []);

  const onEachRegion = (feature, layer) => {
    const regionName = feature.properties.region;
    layer.bindPopup(regionName);
    layer.on({
      click: (e) => {
        alert(`Vous avez cliqué sur la région : ${regionName}`);
        e.target.setStyle({fillColor: '#f9e7ab',fillOpacity: 0.7,color: '#000',})
      },
     });
  };
  return (
    <div className="map-container">
      <MapContainer center={[31.7917, -7.0926]} zoom={6} style={{ height:"100%",width:'100%'}}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />
        {geoData && <GeoJSON data={geoData} onEachFeature={onEachRegion} />}
      </MapContainer>
    </div>
  );
};

export default MapMaroc;
