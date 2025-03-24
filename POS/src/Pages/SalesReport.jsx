import React, { useEffect, useState } from "react";
import { Table, Button, message,Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../features/invoices/invoiceSlice";
import * as XLSX from "xlsx";
import moment from "moment";

const Orders = () => {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState([]); 
  const orderState = useSelector((state) => state?.invoice?.orders || []);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    if (orderState.length > 0) {
      filterData("today"); 
    }
  }, [orderState]);

  const filterData = (filterType, customDates = null) => {
    const today = moment();

    const filterByDateRange = (startDate, endDate) => {
      const filtered = orderState.filter((order) =>
        moment(order.createdAt).isBetween(
          moment(startDate).startOf("day"),
          moment(endDate).endOf("day"),
          null,
          "[]"
        )
      );
      setFilteredData(filtered);
    };

    if (filterType === "today") {
      filterByDateRange(today, today);
    } else if (filterType === "custom" && customDates?.length === 2) {
      const [start, end] = customDates;
      filterByDateRange(start, end);
    } else {
      message.warning("Please select a valid date range!");
    }
  };

  const exportToExcel = () => {
    if (!filteredData.length) {
      message.warning("No data to export!");
      return;
    }

    const dataToExport = filteredData.map((order, index) => ({
      SNo: index + 1,
      "Invoice No": order?.invoiceno || "N/A",
      "Customer Name": order?.customerName || "N/A",
      "Phone Number": order?.customerPhoneNumber || "N/A",
      "Created At": order?.createdAt
        ? moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      "Total Amount": order?.GrandtotalAmount || 0,
      "Items Count": order?.cartItemsCount || 0,
      "Payment Methods": order?.paymentMethods
        ?.map((method) => `${method?.method || "Unknown"}: ${method?.amount || 0}`)
        .join(", ") || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "Orders_Report.xlsx");
    message.success("Excel file has been downloaded successfully!");
  };

  const columns = [
    { title: "SNo", dataIndex: "key" },
    { title: "Invoice no", dataIndex: "invoiceno" },
    { title: "Customer Name", dataIndex: "customerName" },
    { title: "Phone Number", dataIndex: "customerPhoneNumber" },
    { title: "Created At", dataIndex: "createdAt" },
    { title: "Total Amount", dataIndex: "GrandtotalAmount" },
    { title: "Items Count", dataIndex: "cartItemsCount" },
    { title: "Payment Methods", dataIndex: "paymentMethods" },
    { title: "cartItems", dataIndex: "cartItems" },
  ];

  const dataSource = [...filteredData]
  .sort((a, b) => moment(b.createdAt) - moment(a.createdAt)) // 🆕 Sort newest first
  .map((order, index) => ({
    key: index + 1,
    invoiceno: order?.invoiceno || "N/A",
    customerName: order?.customerName || "N/A",
    customerPhoneNumber: order?.customerPhoneNumber || "N/A",
    createdAt: order?.createdAt
      ? moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss")
      : "N/A",
    GrandtotalAmount: order?.GrandtotalAmount || 0,
    cartItemsCount: order?.cartItemsCount || 0,
    paymentMethods: order?.paymentMethods
      ?.map((method) => `${method?.method || "Unknown"}: ${method?.amount || 0}`)
      .join(", ") || "N/A",
      cartItems: order?.cartItems
    ?.map((item) => `${item?.title} (Qty: ${item?.quantity})`)
    .join(", ") || "N/A", 
  }));

  return (
    <div>
      <h3 className="mb-4 title">Sales Report</h3>
      <div className="mb-3">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={6}>
            <Button
              type="primary"
              block
              onClick={exportToExcel}
              disabled={!filteredData.length}
            >
              Export to Excel
            </Button>
          </Col>
        </Row>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Orders;
