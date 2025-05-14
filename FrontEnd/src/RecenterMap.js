import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const RecenterMap = ({ lat, lng, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

  return null;
};
export default RecenterMap;