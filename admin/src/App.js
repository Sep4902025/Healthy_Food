import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AppRoutes />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
