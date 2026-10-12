
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface OrderItem {
    productId: number;
    quantity: number;
}

export interface PaymentResponse {
    keyId: string;
    orderId: number;
    razorpayOrderId: string;
    amount: number;
    currency: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("User is not logged in. Token not found.");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// =====================================
// CREATE ORDER
// =====================================

export const createOrder = async (
    items: OrderItem[]
) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/orders`,
            {
                items: items
            },
            {
                headers: getAuthHeaders()
            }
        );

        return response.data;

    } catch (error: any) {
        console.error(
            "Create Order Error:",
            error.response?.data || error.message
        );

        if (error.response?.status === 401) {
            throw new Error(
                "Unauthorized. Please login again."
            );
        }

        if (error.response?.status === 403) {
            throw new Error(
                "Access denied. Your account does not have permission to create an order."
            );
        }

        throw new Error(
            error.response?.data?.message ||
            "Failed to create order."
        );
    }
};

// =====================================
// CREATE PAYMENT
// =====================================

export const createPayment = async (
    orderId: number
): Promise<PaymentResponse> => {
    try {
        const response = await axios.post(
            `${API_URL}/api/payment/create/${orderId}`,
            {},
            {
                headers: getAuthHeaders()
            }
        );

        return response.data;

    } catch (error: any) {
        console.error(
            "Create Payment Error:",
            error.response?.data || error.message
        );

        if (error.response?.status === 401) {
            throw new Error(
                "Unauthorized. Please login again."
            );
        }

        if (error.response?.status === 403) {
            throw new Error(
                "Access denied. You do not have permission to create payment."
            );
        }

        throw new Error(
            error.response?.data?.message ||
            "Failed to create payment."
        );
    }
};

// =====================================
// VERIFY PAYMENT
// =====================================

export const verifyPayment = async (
    data: {
        orderId: number;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }
) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/payment/verify`,
            data,
            {
                headers: getAuthHeaders()
            }
        );

        return response.data;

    } catch (error: any) {
        console.error(
            "Verify Payment Error:",
            error.response?.data || error.message
        );

        if (error.response?.status === 401) {
            throw new Error(
                "Unauthorized. Please login again."
            );
        }

        if (error.response?.status === 403) {
            throw new Error(
                "Access denied. Payment verification is not allowed."
            );
        }

        throw new Error(
            error.response?.data?.message ||
            "Payment verification failed."
        );
    }
};
