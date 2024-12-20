import React, { useEffect, useState, useRef } from "react";
import Header from "../components/header/Header";
import { Table, Button, Input, Space, Spin, Pagination } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // To keep track of the current page
  const [pageSize, setPageSize] = useState(10); // To keep track of page size
  const searchInput = useRef(null);

  useEffect(() => {
    const getInvoices = async () => {
      try {
        const res = await fetch(
          process.env.REACT_APP_SERVER_URL + "/api/invoices/get-all"
        );
        const data = await res.json();

        // Create a map to count occurrences of unique entries
        const dataMap = new Map();
        data.forEach((item) => {
          const key = `${item.customerName}-${item.customerPhoneNumber}`;
          if (dataMap.has(key)) {
            dataMap.get(key).count += 1;
          } else {
            dataMap.set(key, { ...item, key: item._id, count: 1 });
          }
        });

        // Convert the map back to an array
        const uniqueData = Array.from(dataMap.values());
        setInvoices(uniqueData);
      } catch (error) {
        console.log(error);
      }
    };

    getInvoices();
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: "Phone Number",
      dataIndex: "customerPhoneNumber",
      key: "customerPhoneNumber",
      ...getColumnSearchProps("customerPhoneNumber"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => {
        return <span>{text?.substring(0, 10)}</span>;
      },
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      render: (text, record) => <span>{record.count}</span>,
    },
  ];

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedData = invoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <Header />
      {invoices ? (
        <div className="px-6 min-h-[550px]">
          <h1 className="text-4xl text-center font-bold mb-4">Customers</h1>
          <Table
            dataSource={paginatedData}
            columns={columns}
            bordered
            pagination={false} // Disable built-in pagination
            scroll={{ x: "100%", y: 500 }} 
            rowKey="_id"
          />
          <Pagination
            total={invoices.length}
            pageSize={pageSize}
            current={currentPage}
            onChange={handlePageChange} // Handle page change
            showSizeChanger={false} // Optional: Hide the page size changer
            className="mt-4 text-center"
          />
        </div>
      ) : (
        <Spin size="large" className="absolute left-1/2 top-1/2" />
      )}
    </>
  );
};

export default InvoicePage;
