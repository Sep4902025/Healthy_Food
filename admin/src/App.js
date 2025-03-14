import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {DarkModeProvider } from "./pages/context/DarkModeContext"

function App() {
  return (
    <DarkModeProvider>
        <BrowserRouter>
      <div className="App">
        <AppRoutes />
        <ToastContainer />
      </div>
    </BrowserRouter>
    </DarkModeProvider>
    
  );
}

export default App;
