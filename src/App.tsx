import { useState } from "react";
import InsightsReports from "./components/InsightsReports";
import Layout from "./components/Layout";
import LossTracker from "./components/LossTracker";
import MenuManager from "./components/MenuManager";
import OrganizationManager from "./components/OrganizationManager";
import SalesTracker from "./components/SalesTracker";
import StockManager from "./components/StockManager";

function App() {
  const [currentTab, setCurrentTab] = useState("organizations");

  const renderContent = () => {
    switch (currentTab) {
      case "organizations":
        return <OrganizationManager />;
      case "stock":
        return (
          <div className="space-y-8">
            <StockManager />
            <div className="border-t pt-8">
              {/* <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Management</h2> */}
              <MenuManager />
            </div>
          </div>
        );
      case "sales":
        return <SalesTracker />;
      case "losses":
        return <LossTracker />;
      case "insights":
        return <InsightsReports />;
      default:
        return <OrganizationManager />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
