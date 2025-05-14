import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './ProvinceMap.css';
import RecenterMap from '../../RecenterMap';

const ProvinceMap = ({ latitude, longitude, zoom, provinceSlug }) => {
  const [geoData, setGeoData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const normalizeSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
  };

  useEffect(() => {
    setGeoData(null);
    setError(null);
    const geoJsonUrl = '/data/les_communes_cs.geojson';
    console.log('Fetching GeoJSON from:', geoJsonUrl);

    fetch(geoJsonUrl).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('Content-Type:', response.headers.get('content-type'));
        return response.text().then((text) => {
          if (!response.headers.get('content-type').includes('json')) {
            console.error('Raw response (first 100 chars):', text.slice(0, 100));
            throw new Error('Response is not JSON');
          }
          return JSON.parse(text);
        });
      })
      .then((data) => {
        console.log('GeoJSON loaded:', data);
        setGeoData(data);
      })
      .catch((error) => {
        console.error('Error loading GeoJSON:', error);
        setError(`Failed to load map data: ${error.message}`);
      });
  }, [provinceSlug]); // No dependency since fetching a fixed file

  const onEachRegion = (feature, layer) => {
    const provinceName = feature.properties.province_fr || '';
    const communeName = feature.properties.commune_fr || '';
    const normalizedProvinceName = normalizeSlug(provinceName);
    const normalizedProvinceSlug = normalizeSlug(provinceSlug);

    // Bind popup with commune name
    layer.bindPopup(communeName);

    // Set style based on active province
    if (normalizedProvinceName === normalizedProvinceSlug) {
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

    // Navigate to commune page on click
    layer.on('click', () => {
      const normalizedCommuneName = normalizeSlug(communeName);
      navigate(`/communes/${normalizedCommuneName}`);
    });
  };

  return (
    <div className="province-map-container">
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
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ProvinceMap;