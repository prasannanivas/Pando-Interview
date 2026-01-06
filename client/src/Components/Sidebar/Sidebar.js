import "./Sidebar.css";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Routes,
} from "react-router-dom";

import Transporter from "../Transporter/Transporter.js";
import VehicleType from "../VehicleType/VehicleType.js";
import Material from "../Material/Material.js";
import Shipment from "../Shipment/Shipment.js";

const Sidebar = () => {
  return (
    <Router>
      <div className="sidebar">
        <ul className="sidebar-navigation">
          <li className="sidebar-navigation-link">
            {" "}
            <Link to="/transporter">Transporter</Link>
          </li>
          <li className="sidebar-navigation-link">
            <Link to="/vehicle-type">Vehicle Type</Link>
          </li>
          <li className="sidebar-navigation-link">
            <Link to="/material">Material</Link>
          </li>
          <li className="sidebar-navigation-link">
            <Link to="/shipment">Shipment</Link>
          </li>
        </ul>
      </div>
      <div className="wrapper">

   
      <Routes>


        <Route path="/" element={<Shipment />} />
        <Route path="/transporter" element={<Transporter />} />
        <Route path="/vehicle-type" element={<VehicleType />} />
        <Route path="/material" element={<Material />} />
        <Route path="/shipment" element={<Shipment />} />

      </Routes>
         </div>
    </Router>
  );
};

export default Sidebar;
