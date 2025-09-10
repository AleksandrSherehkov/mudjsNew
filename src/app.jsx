import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import 'react-mosaic-component/react-mosaic-component.css';
import 'bootstrap';

import MainWindow from './components/mainwindow';
import Stats from './components/stats';
import PropertiesStorage from './properties';

// Lazy load heavy components to reduce initial bundle size
const Panel = lazy(() => import('./components/windowletsPanel/panel'));
const Map = lazy(() => import('./components/map'));
const PlayerMessages = lazy(() => import('./components/windowletsPanel/PlayerMessages'));

const propertiesStorage = PropertiesStorage;

const MapWithToggle = React.memo(({ onToggleChat }) => {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Suspense fallback={<CircularProgress />}>
        <Map />
      </Suspense>
      <button
        onClick={onToggleChat}
        title="Показати/сховати чат"
        className="btn-chat"
        aria-label="Переключити чат"
      >
        💬
      </button>
    </div>
  );
});

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

  const ELEMENT_MAP = {
    terminal: <MainWindow />,
    panel: (
      <Suspense fallback={<CircularProgress />}>
        <Panel />
      </Suspense>
    ),
    map: <MapWithToggle onToggleChat={togglePlayerChat} />,
    playerChat: (
      <Suspense fallback={<CircularProgress />}>
        <PlayerMessages />
      </Suspense>
    ),
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
          role="main"
          aria-label="Ігровий інтерфейс"
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
