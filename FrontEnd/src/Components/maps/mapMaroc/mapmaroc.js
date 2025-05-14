import { MapContainer, TileLayer, GeoJSON, Marker,Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "./mapmaroc.css"
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MapMaroc = () => {
  const [geoData, setGeoData] = useState(null);
  const navigate=useNavigate()
  useEffect(() => {
    fetch('/data/maroc.geojson') 
      .then(response => response.json())
      .then(data => setGeoData(data));
  }, []);

  const onEachRegion = (feature, layer) => {
    const regionName = feature.properties.region;
    layer.bindPopup(regionName);
    layer.on({
      click:()=>{
          const formattedeName=regionName.replace(/\s+/g, '-').toLowerCase();
          navigate(`/region/${formattedeName}`);
      }
    })
  };
  return (
    <div className="map-container">
      <MapContainer center={[29.4000, -11.0926]} zoom={6} style={{ height:"100%",width:'100%'}}>
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
