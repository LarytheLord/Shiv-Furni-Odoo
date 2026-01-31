import api from './axios';

/**
 * Portal-specific API calls
 * These functions assume the backend endpoints filter by the logged-in user's contact ID.
 */
const portalApi = {
    // --- Dashboard ---
    getStats: () => api.get('/portal/stats'),

    // --- Customer ---
    getCustomerOrders: (params) => api.get('/portal/customer/orders', { params }),
    getCustomerOrder: (id) => api.get(`/portal/customer/orders/${id}`),

    getCustomerInvoices: (params) => api.get('/portal/customer/invoices', { params }),
    getCustomerInvoice: (id) => api.get(`/portal/customer/invoices/${id}`),

    // --- Vendor ---
    getVendorOrders: (params) => api.get('/portal/vendor/orders', { params }),
    getVendorOrder: (id) => api.get(`/portal/vendor/orders/${id}`),

    getVendorBills: (params) => api.get('/portal/vendor/bills', { params }),
    getVendorBill: (id) => api.get(`/portal/vendor/bills/${id}`),
};

export default portalApi;
