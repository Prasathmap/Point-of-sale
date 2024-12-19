import Header from "../components/header/Header";
import {  Table, Card, Button, message, Popconfirm, Input, Space, Form } from "antd";
import {  PlusCircleOutlined, MinusCircleOutlined,SearchOutlined,UserOutlined,PhoneOutlined} from "@ant-design/icons";
import {  useRef, useState } from "react";
import {  useDispatch, useSelector } from "react-redux";
import {  increase, decrease, deleteProduct, reset, updatePrice, setDiscount,selectTotalCount } from "../redux/cartSlice";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const cart = useSelector((state) => state.cart);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [editPriceState, setEditPriceState] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  const totalCount = useSelector(selectTotalCount);
    
  const handleEditPrice = (id, value) => {
    setEditPriceState((prev) => ({ ...prev, [id]: value }));
  };

  const savePrice = (id) => {
    if (editPriceState[id] !== undefined) {
      dispatch(updatePrice({ id, newPrice: editPriceState[id] }));
    }
    setEditPriceState((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
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
      title: "Name",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (_, record) => {
        const isEditing = editPriceState.hasOwnProperty(record._id);
        const tempPrice = isEditing ? editPriceState[record._id] : record.price;

        return isEditing ? (
          <Input
            type="number"
            value={tempPrice}
            min={0}
            onChange={(e) => handleEditPrice(record._id, Number(e.target.value))}
            onBlur={() => savePrice(record._id)}
            onPressEnter={() => savePrice(record._id)}
            autoFocus
          />
        ) : (
          <span onClick={() => handleEditPrice(record._id, record.price)}>
            ₹ {record.price.toFixed(2)}
          </span>
        );
      },
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <div className="flex items-center">
          <Button
            type="primary"
            size="small"
            icon={<PlusCircleOutlined />}
            className="w-full flex items-center justify-center !rounded-full"
            onClick={() => dispatch(increase(record))}
          />
          <span className="font-bold w-6 inline-block text-center">
            {record.quantity}
          </span>
          <Button
            type="primary"
            size="small"
            className="w-full flex items-center justify-center !rounded-full"
            icon={<MinusCircleOutlined />}
            onClick={() => {
              if (record.quantity === 1) {
                if (window.confirm("Should the product be deleted")) {
                  dispatch(decrease(record));
                  message.info("Product Deleted from Cart.");
                }
              } else {
                dispatch(decrease(record));
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Price",
      key: "totalPrice",
      render: (_, record) => (
        <span>₹ {(record.quantity * record.price).toFixed(2)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete this product?"
          onConfirm={() => dispatch(deleteProduct(record))}
        >
          <Button type="primary" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const [paymentErrors, setPaymentErrors] = useState({});
  const [paymentDiscrepancy, setPaymentDiscrepancy] = useState(0);
  const [form] = Form.useForm();

  const [paymentDetails, setPaymentDetails] = useState({
    originalExpectedTotal: 0,
    expectedTotal: 0,
    cashPayment: 0,
    balance: 0,
  });

  const calculateTotalPayment = (values) => {
    const paymentMethods = Object.keys(values).filter((key) => key.startsWith("amount_"));
    let totalEnteredPayment = 0;
    let cashPayment = 0;
    let otherPayment = 0;
    let errors = {};

    paymentMethods.forEach((key) => {
        const method = key.replace("amount_", "");
        const amount = parseFloat(values[key] || "0");
        totalEnteredPayment += isNaN(amount) ? 0 : amount;

        if (method === "Cash") {
            cashPayment = amount;
        } else if (["Credit Card", "Debit Card", "Digital"].includes(method)) {
            otherPayment += amount; // Accumulate other payments
        } else {
            errors[method] = `Unknown payment method: ${method}`;
        }

        // Validation
        if (amount < 0) {
            errors[method] = `Amount for ${method} cannot be negative.`;
        }
    });

    setPaymentErrors(errors);

    const originalExpectedTotal =
        (cart.total || 0)  - (cart.discount || 0);
    const expectedTotal = Math.ceil(originalExpectedTotal);

    const balance = totalEnteredPayment - expectedTotal;

    setPaymentDetails({
        originalExpectedTotal,
        expectedTotal,
        cashPayment,
        otherPayment,
        balance,
    });

    setPaymentDiscrepancy(totalEnteredPayment - expectedTotal);
};

  const onFinish = async (values) => {
    const { balance, expectedTotal } = paymentDetails;

    if (expectedTotal === 0) {
      message.error("Please enter the amount.");
      return;
    }

    if (balance > 0) {
      message.error("Please pay the remaining balance before submitting.");
      return;
    }

    try {
      const paymentMethods = Object.keys(values)
        .filter((key) => key.startsWith("amount_"))
        .map((key) => ({
          method: key.replace("amount_", ""),
          amount: parseFloat(values[key]) || 0,
        }));

      const invoiceData = {
        ...values,
        paymentMethods,
        subTotal: cart.total,
        discount: cart.discount,
        cartItems: cart.cartItems,
      };

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/invoices/add-invoice`,
        {
          method: "POST",
          body: JSON.stringify(invoiceData),
          headers: { "Content-Type": "application/json; charset=UTF-8" },
        }
      );

      if (res.ok) {
        message.success("Invoice created successfully.");
        dispatch(reset());
        window.open(`/print-invoice`, "_blank");   
        navigate(`/`)
       } else {
        const errorData = await res.json();
        message.error(
          `Failed to create invoice: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      message.error("Operation failed. Please try again.");
      console.error(error);
    }
  };
  
  
  return (
    <>
      <Header />
      <div className="flex flex-wrap p-2 gap-2">
  {/* Left Section (Table) */}
  <div className="flex-1 w-full md:max-w-[50%] relative">
    {/* Main Card Wrapper */}
    <Card className="shadow-lg rounded-lg p-4 pb-20">
      {/* Table Section */}
      <Table
        dataSource={cart.cartItems}
        columns={columns}
        bordered
        pagination={false}
        scroll={{ x: 370, y: 380 }}
      />
    </Card>

    {/* Subtotal Fixed Footer */}
    <div className="fixed bottom-0 left-0 w-full md:w-[50%] bg-gray-50 shadow-lg">
      <Card className="rounded-none p-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-gray-700">Quantity</span>
          <span className="text-xl font-bold text-green-600 text-2xl">{totalCount}</span>

          <span className="text-xl font-semibold text-gray-700">Subtotal</span>
          <span className="text-xl font-bold text-green-600 text-2xl">
            ₹ {cart.total.toFixed(2) > 0 ? cart.total.toFixed(2) : 0}
          </span>
        </div>
      </Card>
    </div>
  </div>

  {/* Right Section (Form and Summary) */}
  <div className="flex-1 w-full md:max-w-[50%]">
    <Card className="p-2 shadow-lg">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td>
                <Form.Item
                  name="customerName"
                  label="Name"
                  // rules={[{ required: true, message: "Please Write a Name!" }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter customer name..."
                    className="w-full"
                  />
                </Form.Item>
              </td>
              <td className="p-2">
                <Form.Item
                  name="customerPhoneNumber"
                  label="Number"
                  // rules={[{ required: true, message: "Please Write a Phone Number!" }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter phone number..."
                    maxLength={11}
                    type="number"
                    className="w-full"
                  />
                </Form.Item>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <Form.Item
                  label="Payment Method"
                  rules={[{ required: true, message: "Please enter at least one payment amount!" }]}
                >
                  <div className="flex flex-col gap-2">
                    {["Cash", "Credit Card", "Online Pay", "Rupay"].map((method) => (
                      <div key={method} className="flex items-center justify-between">
                        <label className="flex-1 font-bold">{method}</label>
                        <Form.Item
                          name={`amount_${method}`}
                          rules={[{ required: false }]}
                          noStyle
                          validateStatus={paymentErrors[method] ? "error" : ""}
                          help={paymentErrors[method]}
                        >
                          <Input
                            placeholder={`Enter amount for ${method}`}
                            type="number"
                            className="flex-2 ml-2"
                            onChange={(e) => {
                              form.setFieldsValue({ [`amount_${method}`]: e.target.value });
                              calculateTotalPayment(form.getFieldsValue());
                            }}
                          />
                        </Form.Item>
                      </div>
                    ))}
                  </div>
                </Form.Item>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Card */}
        <Card className="w-full shadow-lg">
          <table className="w-full">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td>₹ {cart.total.toFixed(2) > 0 ? cart.total.toFixed(2) : 0}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td>
                  <Input
                    type="number"
                    className="w-16 text-right"
                    min={0}
                    max={cart.total}
                    value={cart.discount}
                    onChange={(e) => dispatch(setDiscount(Number(e.target.value)))}
                  />
                </td>
              </tr>
              <tr>
                <td><b>Original Expected Total:</b></td>
                <td>
                  ₹{(
                    cart.total  -
                    cart.discount
                  ).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td><b>Rounded Expected Total:</b></td>
                <td>
                  ₹{Math.ceil(
                    cart.total  -
                    cart.discount
                  ).toFixed(2)}</td>
              </tr>
              <tr>
                <td><b>Cash Payment:</b></td>
                <td>₹{paymentDetails.cashPayment !== undefined ? paymentDetails.cashPayment.toFixed(2) : "0.00"}</td>
              </tr>
              <tr
                className={
                  paymentDetails.balance >= 0
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                <td>
                  {paymentDetails.balance >= 0
                    ? `Change to Return:`
                    : `Remaining Balance:`}
                </td>
                <td>
                  ₹{paymentDetails.balance !== undefined ? Math.abs(paymentDetails.balance).toFixed(2) : "0.00"}
                </td>
              </tr>
              <tr>
                <td className="text-2xl font-bold">Total</td>
                <td
                  className={`text-2xl font-bold ${
                    paymentDiscrepancy === 0
                      ? "text-green-600"
                      : paymentDiscrepancy > 0
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  ₹{Math.ceil(
                    cart.total -
                    cart.discount
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Buttons */}
          <div className="mt-4 flex justify-between">
            <Popconfirm
              title="Are you sure you want to clear all products from the cart?"
              onConfirm={() => dispatch(reset())}
            >
              <Button type="primary" danger size="large">
                Clear Cart
              </Button>
            </Popconfirm>

            <Button
              size="large"
              type="primary"
              disabled={cart.cartItems.length === 0 || paymentDiscrepancy !== 0}
              htmlType="submit"
            >
              Create Order
            </Button>
          </div>
        </Card>
      </Form>
    </Card>
  </div>
</div>

    </>
  );
};

export default CartPage;
