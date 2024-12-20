import Header from "../components/header/Header";
import { Table, Button, Spin, Switch, Card, Row, Col, Pagination } from "antd";
import { useEffect, useState } from "react";
import PrintInvoice from "../components/invoice/PrintInvoice";
import { DownloadOutlined ,PrinterOutlined} from "@ant-design/icons";
import * as XLSX from "xlsx";

const InvoicePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [printData, setPrintData] = useState([]);
  const [invoiceCounts, setInvoiceCounts] = useState({ today: 0, all: 0 });
  const [showAll, setShowAll] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [pageSize, setPageSize] = useState(10); // Number of items per page

  useEffect(() => {
    const getInvoices = async () => {
      try {
        const res = await fetch(
          process.env.REACT_APP_SERVER_URL + "/api/invoices/get-all"
        );
        const data = await res.json();

        const today = new Date().toISOString().split("T")[0];
        const todayInvoices = data.filter((item) => {
          const invoiceDate = new Date(item.createdAt).toISOString().split("T")[0];
          return invoiceDate === today;
        });

        setInvoiceCounts({
          today: todayInvoices.length,
          all: data.length,
        });

        const filteredData = showAll ? data : todayInvoices;
        const newData = filteredData.map((item) => ({ ...item, key: item._id }));
        setInvoices(newData);
      } catch (error) {
        console.log(error);
      }
    };

    getInvoices();
  }, [showAll]);

  const exportToExcel = () => {
    const formattedData = invoices.map((item) => ({
      "Invoice No": item.invoiceno,
      "Customer Name": item.customerName,
      "Phone Number": item.customerPhoneNumber,
      "Created At": new Date(item.createdAt).toLocaleString(),
      "Items Count": item.cartItemsCount,
      "Total Amount": item.GrandtotalAmount,
      "Payment Methods": item.paymentMethods
        .map((pm) => `${pm.method}: ₹${pm.amount}`)
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "Invoices.xlsx");
  };

  const columns = [
    { title: "Invoice No", dataIndex: "invoiceno", key: "invoiceno" },
    { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
    { title: "Phone Number", dataIndex: "customerPhoneNumber", key: "customerPhoneNumber" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMethods",
      key: "paymentMethods",
      render: (methods) =>
        methods.map((m, i) => <div key={i}>{`${m.method}: ₹${m.amount}`}</div>),
    },
    { title: "Items Count", dataIndex: "cartItemsCount", key: "cartItemsCount" },
    {
      title: "Total Amount",
      dataIndex: "GrandtotalAmount",
      key: "GrandtotalAmount",
      render: (text) => `₹${text}`,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setIsModalOpen(true);
            setPrintData(record);
          }}
        >
         <PrinterOutlined />
        </Button>
      ),
    },
  ];

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Paginate data based on currentPage and pageSize
  const paginatedData = invoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <Header />
      <div className="px-2 sm:px-6 md:px-8 min-h-[550px]">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-4xl text-center font-bold mb-4">Invoices</h1>

        {/* Card Section */}
        <Card className="shadow-md mb-6">
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            {/* Today's Sale Count */}
            <Col xs={24} sm={12} md={8} className="text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-semibold text-blue-600">
                Today's Sale Count: {invoiceCounts.today}
              </h2>
            </Col>

            {/* Data Toggle Switch */}
            <Col xs={24} sm={12} md={8} className="text-center">
              <Switch
                checked={showAll}
                onChange={() => setShowAll(!showAll)}
                checkedChildren="All Data"
                unCheckedChildren="Today's Data"
                className="mt-2 sm:mt-0"
              />
            </Col>

            {/* Export to Excel Button */}
            <Col xs={24} sm={24} md={8} className="text-center md:text-right">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                className="w-full sm:w-auto px-4"
              >
                Export to Excel
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table Section */}
        <div className="overscroll-behavior-block-contain">
          {invoices.length ? (
            <>
              <Table
                dataSource={paginatedData} // Use the paginated data
                columns={columns}
                bordered
                rowKey="_id"
                scroll={{ x: "100%", y: 400 }} // Horizontal scroll enabled
                pagination={false} // Disable Table's built-in pagination
              />
              {/* Pagination Component */}
              <Pagination
                total={invoices.length}
                pageSize={pageSize}
                current={currentPage}
                onChange={handlePageChange} // Handle page change
                showSizeChanger={false} // Optional: Hide the page size changer
                className="mt-4 text-center"
              />
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[420px]">
              <Spin size="large" />
            </div>
          )}
        </div>

        {/* Print Invoice Modal */}
        <PrintInvoice
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          printData={printData}
        />
      </div>
    </>
  );
};

export default InvoicePage;
