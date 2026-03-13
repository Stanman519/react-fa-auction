import React from "react";
import { createRoot } from "react-dom/client";
import "./app/styles/index.css";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { myTheme } from "./theme";
import { ThemeProvider } from "@mui/material/styles";

// Clear corrupted IndexedDB if it exists (common issue during development)
const clearCorruptedDB = async () => {
  try {
    const dbs = await (window.indexedDB.databases?.() || Promise.resolve([]));
    for (const db of dbs) {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }
  } catch (e) {
    console.warn("Could not clear IndexedDB:", e);
  }
};

clearCorruptedDB();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={myTheme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
