import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/auth/Login";
import GrnLayout from "./components/GrnLayout";
import Dashboard from "./Pages/GRN/Dashboard";
import Createinventory  from "./Pages/GRN/Createinventory";
import InventoryList   from "./Pages/GRN/InventoryList";
import Notfound from "./Pages/NotFound";
import { OpenRoutes } from "./routing/OpenRoutes";
import { PrivateRoutes } from "./routing/PrivateRoutes";


function App() {
  
  return (
    <Router>
      <Routes>
          <Route path="/" element={ <OpenRoutes> <Login />  </OpenRoutes> }/>
            <Route path="/grn" element={ <PrivateRoutes> <GrnLayout /> </PrivateRoutes> }  >
              <Route index element={<Dashboard />} />
              <Route path="add-grn" element={<Createinventory />} />
              <Route path="list-grn" element={<InventoryList />} />
          </Route>
          <Route path="*" element={ <Notfound /> }/>
      </Routes>
    </Router>   
  );
}

export default App;

