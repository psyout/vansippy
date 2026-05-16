import "./App.scss";
import Home from "./assets/pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddLocation from "./assets/pages/AddLocation";
import Admin from "./assets/pages/Admin";
import EditBusiness from "./assets/pages/EditBusiness";
import BusinessDashboard from "./assets/pages/BusinessDashboard";
import BusinessEdit from "./assets/pages/BusinessEdit";
import BusinessLogin from "./components/BusinessLogin/BusinessLogin";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
   return (
      <BrowserRouter
         future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
         <div className="App">
            <Routes>
               <Route path="/" element={<Home />} />
               <Route
                  path="/admin"
                  element={
                     <ProtectedRoute>
                        <Admin />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/add-location"
                  element={
                     <ProtectedRoute>
                        <AddLocation />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/edit-business/:id"
                  element={
                     <ProtectedRoute>
                        <EditBusiness />
                     </ProtectedRoute>
                  }
               />
               <Route
                  path="/business/:businessId"
                  element={<BusinessDashboard />}
               />
               <Route
                  path="/business/:businessId/edit"
                  element={<BusinessEdit />}
               />
               <Route path="/business-login" element={<BusinessLogin />} />
            </Routes>
         </div>
      </BrowserRouter>
   );
}

export default App;
