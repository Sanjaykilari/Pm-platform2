import { renderToString } from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { PpmProvider } from './src/context/PpmContext';
import App from './src/App';

try {
  const html = renderToString(
    React.createElement(
      StaticRouter,
      { location: '/' },
      React.createElement(
        PpmProvider,
        null,
        React.createElement(App, null)
      )
    )
  );
  console.log('RENDER SUCCESS. length:', html.length);
} catch (e) {
  console.error('RENDER ERROR:', e);
}
