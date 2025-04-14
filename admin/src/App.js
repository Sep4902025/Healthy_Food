import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {DarkModeProvider } from "./pages/context/DarkModeContext"
import { SearchProvider } from "./pages/context/SearchContext";

function App() {
  return (

    <DarkModeProvider>
      <SearchProvider>
      <BrowserRouter>
      <div className="App">
        <AppRoutes />
        <ToastContainer />
      </div>
    </BrowserRouter>
      </SearchProvider>
    </DarkModeProvider>
    
  );
}

export default App;
