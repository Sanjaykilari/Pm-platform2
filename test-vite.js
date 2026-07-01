import { createServer } from 'vite';

async function run() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  
  try {
    const { renderToString } = await vite.ssrLoadModule('react-dom/server');
    const React = (await vite.ssrLoadModule('react')).default;
    const { StaticRouter } = await vite.ssrLoadModule('react-router-dom/server');
    const { PpmProvider } = await vite.ssrLoadModule('/src/context/PpmContext.tsx');
    const App = (await vite.ssrLoadModule('/src/App.tsx')).default;
    
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
    console.log('RENDER SUCCESS. HTML LENGTH:', html.length);
  } catch (e) {
    console.error('RENDER ERROR:', e);
  } finally {
    vite.close();
  }
}

run();
