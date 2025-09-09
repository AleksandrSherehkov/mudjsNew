import React, { useState, useEffect, useRef, useCallback } from 'react';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Add, Remove } from '@mui/icons-material';

import lastLocation from '../location';

const useLocation = () => {
  const [location, setLocation] = useState(lastLocation() || {});

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const locationChannel = new BroadcastChannel('location');
    locationChannel.onmessage = e => {
      if (e?.data?.what === 'location') setLocation(e.data.location);
    };
    return () => locationChannel.close();
  }, []);

  return location;
};

const useMapSource = location => {
  const [mapSource, setMapSource] = useState();

  useEffect(() => {
    if (!location.area) return;
    const mapName = location.area.replace(/are$/, 'html');
    const mapUrl = `/maps/sources/${mapName}`;

    fetch(mapUrl)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(map => {
        const processed = map.replace(
          /<a href=".*?\.html">(.*?)<\/a>/g,
          '<span class="fgdc">$1</span>'
        );
        setMapSource(processed);
      })
      .catch(e => {
        console.log('Map error', e);
        setMapSource('');
      });
  }, [location.area]);

  return mapSource;
};

const useAreaData = () => {
  const [areaData, setAreaData] = useState({});
  const areasUrl = `/maps/index.json`;

  const refreshAreaData = useCallback(() => {
    fetch(areasUrl)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Data is not an array');
        const byFile = data.reduce((acc, obj) => {
          acc[obj.file] = obj.name;
          return acc;
        }, {});
        setAreaData(byFile);
      })
      .catch(e => {
        console.error('Error fetching', areasUrl, e);
        setAreaData({});
      });
  }, [areasUrl]);

  useEffect(() => {
    refreshAreaData();
    const id = setInterval(refreshAreaData, 1000 * 60 * 15);
    return () => clearInterval(id);
  }, [refreshAreaData]);

  return areaData;
};

const MapControls = ({ changeFontSize }) => {
  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 500 }}>
      <ButtonGroup
        variant="contained"
        size="small"
        orientation="vertical"
        color="primary"
        aria-label="map resize buttons"
      >
        <Button onClick={() => changeFontSize(1)}>
          <Add />
        </Button>
        <Button onClick={() => changeFontSize(-1)}>
          <Remove />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default function Map() {
  const location = useLocation();
  const mapSource = useMapSource(location);
  const areaData = useAreaData();
  const areaName = areaData[location.area || ''] || '';
  const mapElement = useRef(null);

  const recenterPosition = () => {
    const root = mapElement.current;
    if (!root) return;
    const active = root.querySelector('.room.active');
    if (!active) return;
    active.scrollIntoView({ block: 'center', inline: 'center' });
  };

  const highlightPosition = useCallback(() => {
    const root = mapElement.current;
    if (!root) return;

    root.querySelectorAll('.room.active').forEach(el => {
      el.classList.remove('active');
    });

    const room = location.vnum;
    if (room) {
      const target = root.querySelector(`.room-${room}`);
      if (target) {
        target.classList.add('active');
        recenterPosition();
      }
    }
  }, [location.vnum]);

  const mapFontSizeKey = 'map-font-size';

  useEffect(() => {
    const root = mapElement.current;
    if (!root) return;
    const cacheFontSize = localStorage.getItem(mapFontSizeKey);
    if (cacheFontSize != null) {
      root.style.fontSize = `${cacheFontSize}px`;
    }
  }, []);

  const changeFontSize = delta => {
    const root = mapElement.current;
    if (!root) return;
    const style = window.getComputedStyle(root).fontSize;
    const fontSize = parseFloat(style) || 14;
    const next = fontSize + delta;
    root.style.fontSize = `${next}px`;
    localStorage.setItem(mapFontSizeKey, String(next));
    recenterPosition();
  };

  useEffect(() => {
    const root = mapElement.current;
    if (!root) return;
    // Вставляем HTML карты
    root.innerHTML = mapSource || '';
    highlightPosition();
  }, [mapSource, highlightPosition]);

  useEffect(() => {
    highlightPosition();
  }, [location.vnum, highlightPosition]);

  return (
    <>
      <AppBar
        position="absolute"
        sx={{ top: 0, left: 0, zIndex: 500, backgroundColor: '#2e2e2e' }}
        color="default"
      >
        <Toolbar variant="dense">
          <Typography id="areaName" sx={{ flexGrow: 1, color: '#BB86FC' }}>
            {areaName}
          </Typography>
        </Toolbar>
      </AppBar>
      <MapControls changeFontSize={changeFontSize} />
      <div id="map-wrap">
        <div id="map">
          <pre ref={mapElement} />
        </div>
      </div>
    </>
  );
}
