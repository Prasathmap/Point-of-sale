import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import MainLayout from "./components/MainLayout";
import SalesReport from "./Pages/SalesReport";
import Sales from "./Pages/Sales";
function App() {
  
  return (
    <Router>
      <Routes>
      <Route
          path="/"
          element={
           
              <Login />
            
          }
        />
      <Route
          path="/Pos"
          element={
          
              <MainLayout />
          
          }
        >
       <Route index element={<Dashboard />} />
       <Route path="Sales" element={<Sales />} />
       <Route path="Sales-Report" element={<SalesReport />} />
      

       </Route> 
      </Routes>
      </Router>   
  );
}

export default App;

