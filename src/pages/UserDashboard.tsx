import ProductList from "../components/ProductList";
import Cart from "../components/Cart";
import CheckoutForm from "../components/CheckoutForm";

import { logout as logoutApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";

interface UserDashboardProps {
    setPage: (page: string) => void;
}

function UserDashboard({
    setPage
}: UserDashboardProps) {

    const user = useAuthStore(
        (state) => state.user
    );

    const logout = useAuthStore(
        (state) => state.logout
    );

    // Check whether user is logged in
    if (!user) {
        return (
            <div>
                <h2>
                    Please Sign In
                </h2>

                <button
                    onClick={() => setPage("signin")}
                >
                    Go to Sign In
                </button>
            </div>
        );
    }

    const handleLogout = async () => {

        try {

            // Destroy server-side session
            await logoutApi();

            // Clear Zustand user
            logout();

            // Go back to Sign In
            setPage("signin");

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }
    };

    return (
        <div>

            <h2>
                User Dashboard
            </h2>

            <p>
                Welcome, {user.email}
            </p>

            <button
                onClick={handleLogout}
            >
                Logout
            </button>

            <ProductList />

            <Cart />

            <CheckoutForm />

        </div>
    );
}

export default UserDashboard;