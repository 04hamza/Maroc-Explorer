import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './RegionMap.css';
import RecenterMap from '../../RecenterMap';

const RegionMap = ({ latitude, longitude, zoom, regionSlug }) => {
  const [geoData, setGeoData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setGeoData(null);
    fetch(`/data/${regionSlug}.geojson`)
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, [regionSlug]);

  const onEachRegion = (feature, layer) => {
    const regionName = feature.properties.region;
    console.log(regionName)
    const formattedRegionName = regionName.replace(/\s+/g, '-').toLowerCase();
    const provinceName = feature.properties.name || feature.properties.province;
    const provinceSlug = feature.properties.slug || provinceName.replace(/\s+/g, '-').toLowerCase();

    // Bind popup with province name
    layer.bindPopup(provinceName);

    // Set style based on active region
    if (formattedRegionName === regionSlug) {
      layer.setStyle({
        fillColor: '#2980b9',
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
      });
    } else {
      layer.setStyle({
        fillColor: '#bdc3c7',
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.3,
      });
    }

    // Navigate to province page on click
    layer.on('click', () => {
      navigate(`/provinces/${provinceSlug}`);
    });
  };

  return (
    <div className="region-map-container">
      {latitude && longitude ? (
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <RecenterMap lat={latitude} lng={longitude} zoom={zoom} />
          {geoData && (
            <GeoJSON
              data={geoData}
              onEachFeature={onEachRegion}
            />
          )}
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default RegionMap;