import React, { useEffect, useState } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

import 'react-mosaic-component/react-mosaic-component.css';
import 'bootstrap';

import MainWindow from './components/mainwindow';
import Panel from './components/windowletsPanel/panel';
import Stats from './components/stats';
import Map from './components/map';
import PlayerMessages from './components/windowletsPanel/PlayerMessages';
import PropertiesStorage from './properties';

const propertiesStorage = PropertiesStorage;

// 🔻 Обгортка Map з абсолютною кнопкою
const MapWithToggle = ({ onToggleChat }) => {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Map />
      <button
        onClick={onToggleChat}
        title="Показати/сховати чат"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '5px',
          zIndex: 1000,
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        💬 Чат
      </button>
    </div>
  );
};

// 🔻 Основна функція для побудови layout
const getResponsiveLayout = (bigScreen, hugeScreen) => {
  if (!bigScreen) return 'terminal';

  if (!hugeScreen) {
    return {
      direction: 'row',
      first: 'terminal',
      second: 'panel',
      splitPercentage: 70,
    };
  }

  return {
    direction: 'row',
    first: 'terminal',
    second: {
      direction: 'row',
      first: 'panel',
      second: 'map',
      splitPercentage:
        (propertiesStorage['panelLayoutWidth'] /
          (propertiesStorage['panelLayoutWidth'] +
            propertiesStorage['mapLayoutWidth'])) *
        100,
    },
    splitPercentage:
      (propertiesStorage['terminalLayoutWidth'] /
        (propertiesStorage['terminalLayoutWidth'] +
          propertiesStorage['panelLayoutWidth'] +
          propertiesStorage['mapLayoutWidth'])) *
      100,
  };
};

export default function App() {
  const bigScreen = useMediaQuery('(min-width:600px)');
  const hugeScreen = useMediaQuery('(min-width:1280px)');

  const [layout, setLayout] = useState(() =>
    getResponsiveLayout(bigScreen, hugeScreen)
  );

  useEffect(() => {
    setLayout(getResponsiveLayout(bigScreen, hugeScreen));
  }, [bigScreen, hugeScreen]);

  // 🔻 Додати чат у layout під мапу
  const addChatToLayout = prev => {
    if (
      typeof prev !== 'object' ||
      typeof prev.second !== 'object' ||
      typeof prev.second.second !== 'string'
    )
      return prev;

    return {
      ...prev,
      second: {
        ...prev.second,
        second: {
          direction: 'column',
          first: prev.second.second,
          second: 'playerChat',
          splitPercentage: 70,
        },
      },
    };
  };

  // 🔻 Видалити чат з layout
  const removeChatFromLayout = prev => {
    if (
      typeof prev !== 'object' ||
      typeof prev.second !== 'object' ||
      typeof prev.second.second !== 'object' ||
      prev.second.second.second !== 'playerChat'
    )
      return prev;

    return {
      ...prev,
      second: {
        ...prev.second,
        second: prev.second.second.first,
      },
    };
  };

  const togglePlayerChat = () => {
    const hasChat = JSON.stringify(layout).includes('playerChat');
    setLayout(prev =>
      hasChat ? removeChatFromLayout(prev) : addChatToLayout(prev)
    );
  };

  // 🔻 Карта компонентів
  const ELEMENT_MAP = {
    terminal: <MainWindow />,
    panel: <Panel />,
    map: <MapWithToggle onToggleChat={togglePlayerChat} />,
    playerChat: <PlayerMessages />,
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 0,
        }}
      >
        <Mosaic
          value={layout}
          onChange={setLayout}
          renderTile={(id, path) => (
            <MosaicWindow
              path={path}
              title=""
              toolbarControls={[]}
              additionalControls={[]}
              renderToolbar={() => null}
            >
              {ELEMENT_MAP[id]}
            </MosaicWindow>
          )}
          className="mosaic-theme-default"
        />
      </Box>
      <Stats />
    </Box>
  );
}
