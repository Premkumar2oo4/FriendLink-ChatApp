import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chatpage from "./pages/Chatpage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Home />} />
        <Route path="/chats" element={<Chatpage />} />
      </Routes>
    </div>
  );
}

export default App;