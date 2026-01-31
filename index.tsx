
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Iron Unicorn App initialized successfully.");
} catch (error) {
  console.error("Critical Render Error:", error);
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #ec4899;">Unicorn Crash! 🦄💥</h1>
      <p style="color: #666;">Ein technischer Fehler ist aufgetreten.</p>
      <pre style="background: #1a1a1a; padding: 20px; border-radius: 10px; color: #ff4444; overflow: auto; text-align: left; font-size: 12px;">
        ${error instanceof Error ? error.message : String(error)}
      </pre>
      <button onclick="window.location.reload()" style="background: #fff; color: #000; padding: 10px 20px; border-radius: 5px; cursor: pointer; border: none; font-weight: bold;">Erneut versuchen</button>
    </div>
  `;
}
