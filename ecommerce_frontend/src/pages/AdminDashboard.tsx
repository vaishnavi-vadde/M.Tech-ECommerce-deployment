import ProductList from "../components/ProductList";
import BackgroundJobMonitor from "../components/BackgroundJobMonitor";

function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <BackgroundJobMonitor />

            <h2>Admin Dashboard</h2>

            <h3>Manage Products</h3>

            <ProductList isAdmin={true} />
        </div>
    );
}

export default AdminDashboard;