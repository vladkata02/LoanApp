import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Users from "./components/Users";
import Login from "./components/Login";
import Register from "./components/Register";
import LoanApplications from "./components/LoanApplications";
import PortfolioMetrics from "./components/PortfolioMetrics";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/:code" element={<Register />} />
            <Route path="/users" element={<Users />} />
            <Route path="/loan-applications" element={<LoanApplications />} />
            <Route path="/metrics" element={<PortfolioMetrics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;