import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListView from "../../../components/ui/ListView";
import api from "../../../api/axios";

export default function VendorBillList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/vendor-bills");
      console.log(response);
      const { bills, pagination } = response.data;
      const { total, page: currentPage, limit } = pagination;
      console.log(response);
      setData(
        bills.map((bill) => ({
          id: bill.id,
          name: bill.billNumber,
          vendor: bill.vendor?.name || "Unknown",
          reference: bill.purchaseOrder?.poNumber || bill.billNumber, // Fallback to bill number if no PO ref
          date: new Date(bill.billDate).toLocaleDateString(),
          total: Number(bill.total),
          status: bill.status,
          paymentStatus:
            bill.amountDue === 0
              ? "Paid"
              : bill.amountDue < bill.total
                ? "Partial"
                : "Not Paid",
          amountDue: bill.amountDue,
        })),
      );

      setPagination({ page: currentPage, limit, total });
    } catch (error) {
      console.error("Failed to fetch vendor bills:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      header: "Bill No.",
      accessor: "name",
      render: (row) => (
        <span
          className="font-medium text-slate-700 cursor-pointer hover:text-accent-600"
          onClick={() => navigate(`/admin/bills/${row.id}`)}
        >
          {row.name}
        </span>
      ),
    },
    { header: "Vendor", accessor: "vendor" },
    { header: "Bill Reference", accessor: "reference" },
    { header: "Bill Date", accessor: "date" },
    {
      header: "Total",
      accessor: "total",
      render: (row) => row.total.toLocaleString(),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.status === "CONFIRMED"
              ? "bg-blue-100 text-blue-700"
              : row.status === "DRAFT"
                ? "bg-gray-100 text-gray-700":row.status=="PARTIALLY_PAID"
                  ? "bg-yellow-100 text-yellow-700": "bg-green-100 text-green-700"
          }`}
        >
          {row.status.replace("_", " ")}
        </span>
      ),
    },
    // {
    //   header: "Payment",
    //   accessor: "paymentStatus",
    //   render: (row) => (
    //     <span
    //       className={`px-2 py-1 rounded text-xs font-semibold ${
    //         row.paymentStatus === "Paid"
    //           ? "bg-green-100 text-green-700"
    //           : row.paymentStatus === "Partial"
    //             ? "bg-yellow-100 text-yellow-700"
    //             : "bg-red-100 text-red-700"
    //       }`}
    //     >
    //       {row.paymentStatus}
    //     </span>
    //   ),
    // },
  ];

  return (
    <ListView
      title="Vendor Bills"
      columns={columns}
      data={data}
      loading={loading}
      pagination={pagination}
      onPageChange={(page) => fetchData(page)}
      onCreate={() => navigate("/admin/bills/new")}
    />
  );
}
