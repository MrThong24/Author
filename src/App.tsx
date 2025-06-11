import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { notification } from "antd";
import { ThemeProvider } from "./provider/ThemeContext";

function App() {
  notification.config({
    placement: "bottomRight",
    duration: 3,
  });

  return (
    <div>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
