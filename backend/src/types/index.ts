// TypeScript interfaces for the application

import {
    UserRole,
    ContactType,
    BudgetStatus,
    RevisionStatus,
    RevisionReason,
    AlertType,
    AlertSeverity,
    POStatus,
    BillStatus,
    SOStatus,
    InvoiceStatus,
    PaymentMethod,
    ApplyOn
} from '@prisma/client';

// Re-export Prisma enums
export {
    UserRole,
    ContactType,
    BudgetStatus,
    RevisionStatus,
    RevisionReason,
    AlertType,
    AlertSeverity,
    POStatus,
    BillStatus,
    SOStatus,
    InvoiceStatus,
    PaymentMethod,
    ApplyOn
};

// API Response types
export interface ApiResponse<T = any> {
    status: 'success' | 'error' | 'fail';
    message?: string;
    data?: T;
    errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// User types
export interface UserPayload {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    contactId?: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    contactId?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    contactId?: string;
}

// Contact types
export interface CreateContactDto {
    name: string;
    email?: string;
    phone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    type: ContactType;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {
    isActive?: boolean;
}

// Product types
export interface CreateProductDto {
    code?: string;
    name: string;
    description?: string;
    categoryId: string;
    costPrice: number;
    salePrice: number;
    taxRate: number;
    unit?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
    isActive?: boolean;
}

// Product Category types
export interface CreateCategoryDto {
    name: string;
    code?: string;
    parentId?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
    isActive?: boolean;
}

// Analytical Account types
export interface CreateAnalyticalAccountDto {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateAnalyticalAccountDto extends Partial<CreateAnalyticalAccountDto> {
    isActive?: boolean;
}

// Auto Analytical Rule types
export interface CreateAutoRuleDto {
    name: string;
    sequence?: number;
    productId?: string;
    productCategoryId?: string;
    contactId?: string;
    useAmountFilter?: boolean;
    amountMin?: number;
    amountMax?: number;
    useDateFilter?: boolean;
    dateFrom?: string;
    dateTo?: string;
    applyOn?: ApplyOn;
    analyticalAccountId: string;
}

export interface UpdateAutoRuleDto extends Partial<CreateAutoRuleDto> {
    isActive?: boolean;
}

// Budget types
export interface CreateBudgetDto {
    name: string;
    dateFrom: string;
    dateTo: string;
    description?: string;
    lines: Array<{
        analyticalAccountId: string;
        plannedAmount: number;
    }>;
}

export interface UpdateBudgetDto {
    name?: string;
    dateFrom?: string;
    dateTo?: string;
    description?: string;
    status?: BudgetStatus;
}

export interface AddBudgetLineDto {
    analyticalAccountId: string;
    plannedAmount: number;
}

export interface UpdateBudgetLineDto {
    plannedAmount: number;
}

// Budget Revision types
export interface CreateRevisionDto {
    budgetLineId: string;
    newAmount: number;
    reason: RevisionReason;
    notes?: string;
}

export interface ApproveRevisionDto {
    approved: boolean;
    rejectionReason?: string;
}

// Order Line types
export interface OrderLineDto {
    productId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    analyticalAccountId?: string;
}

// Purchase Order types
export interface CreatePurchaseOrderDto {
    vendorId: string;
    orderDate?: string;
    notes?: string;
    lines: OrderLineDto[];
}

export interface UpdatePurchaseOrderDto {
    vendorId?: string;
    orderDate?: string;
    notes?: string;
    status?: POStatus;
}

// Vendor Bill types
export interface CreateVendorBillDto {
    purchaseOrderId?: string;
    vendorId: string;
    billDate?: string;
    dueDate: string;
    notes?: string;
    lines: OrderLineDto[];
}

export interface UpdateVendorBillDto {
    vendorId?: string;
    billDate?: string;
    dueDate?: string;
    notes?: string;
    status?: BillStatus;
}

// Payment types
export interface CreatePaymentDto {
    paymentDate?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    notes?: string;
}

// Sales Order types
export interface CreateSalesOrderDto {
    customerId: string;
    orderDate?: string;
    notes?: string;
    lines: OrderLineDto[];
}

export interface UpdateSalesOrderDto {
    customerId?: string;
    orderDate?: string;
    notes?: string;
    status?: SOStatus;
}

// Customer Invoice types
export interface CreateCustomerInvoiceDto {
    salesOrderId?: string;
    customerId: string;
    invoiceDate?: string;
    dueDate: string;
    notes?: string;
    lines: OrderLineDto[];
}

export interface UpdateCustomerInvoiceDto {
    customerId?: string;
    invoiceDate?: string;
    dueDate?: string;
    notes?: string;
    status?: InvoiceStatus;
}

// Query types
export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQuery {
    dateFrom?: string;
    dateTo?: string;
}

export interface StatusQuery<T> {
    status?: T;
}

// Dashboard types
export interface DashboardSummary {
    totalPlanned: number;
    totalPractical: number;
    totalRemaining: number;
    overallAchievement: number;
    costCenterSummary: Array<{
        id: string;
        code: string;
        name: string;
        planned: number;
        actual: number;
        percent: number;
        status: 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
    }>;
    recentAlerts: Array<{
        id: string;
        alertType: AlertType;
        severity: AlertSeverity;
        costCenter: string;
        budgetName: string;
        utilizationPercent: number;
        createdAt: Date;
    }>;
    activeBudgetsCount: number;
}

// Budget Metrics types
export interface BudgetMetrics {
    plannedAmount: number;
    practicalAmount: number;
    theoreticalAmount: number;
    achievementPercent: number;
    remainingAmount: number;
    periodElapsedPercent: number;
    varianceAmount: number;
    variancePercent: number;
}
