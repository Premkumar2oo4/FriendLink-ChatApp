import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chatpage from "./pages/Chatpage";

function App() {
  return (
    <div className="App">
<Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chats" element={<Chatpage />} />
    </Routes></div>
  );
}

export default App;
