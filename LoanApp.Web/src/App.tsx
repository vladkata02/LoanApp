import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Users from "./components/Users";
import LoanApplications from "./components/LoanApplications";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/loan-applications" element={<LoanApplications />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;