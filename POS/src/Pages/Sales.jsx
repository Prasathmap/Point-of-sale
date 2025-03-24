import React, { useEffect, useState } from "react";
import { Card, Button, List, Input, Row, Col, Typography, Form, message, Select } from "antd";
import { DeleteOutlined, PlusOutlined, MinusOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import CustomInput from "../components/CustomInput";
import PrintableInvoice from "../components/Printlayout";
import { useFormik } from "formik";
import * as yup from "yup";
import { getProducts } from "../features/product/productSlice";
import { getCategories } from "../features/pcategory/pcategorySlice";
import { addProduct, decrease, increase, deleteProduct, updateQuantity, resetState } from "../features/cart/cartSlice";
import { CreateSale, Billno } from "../features/invoices/invoiceSlice";
import "antd/dist/reset.css";

const { Text } = Typography;

// Validation schema
let schema = yup.object().shape({
  customerName: yup.string().required("Customer Name is Required"),
  customerPhoneNumber: yup.string().required("Customer Phone is Required"),
  attender: yup.string().required("Attender Name is Required"),
});
const paymentMethods = ["Cash", "CreditCard", "OnlinePay", "Rupay"];

const App = () => {
  const dispatch = useDispatch();
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    originalExpectedTotal: 0,
    expectedTotal: 0,
    cashPayment: 0,
    otherPayment: 0,
    balance: 0,
    overpaymentAllowed: false,
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  // Function to calculate total payment and balance
  const calculateTotalPayment = (values) => {
    const paymentMethods = Object.keys(values).filter((key) => key.startsWith("amount_"));
    let totalEnteredPayment = 0;
    let cashPayment = 0;
    let otherPayment = 0;
    let errors = {};

    paymentMethods.forEach((key) => {
      const method = key.replace("amount_", "");
      const amount = parseFloat(values[key] || "0");

      if (isNaN(amount)) return; // Skip invalid amounts

      if (method === "Cash") {
        cashPayment = amount;
      } else if (["CreditCard", "OnlinePay", "Rupay"].includes(method)) {
        if (amount > 0) {
          errors[method] = "Overpayment is only allowed with Cash. Other payment methods must be 0.";
        }
        otherPayment += amount; // Accumulate non-cash payments
      } else {
        errors[method] = `Unknown payment method: ${method}`;
      }

      // Accumulate only valid payments
      totalEnteredPayment += amount > 0 ? amount : 0;

      // Validation
      if (amount < 0) {
        errors[method] = `Amount for ${method} cannot be negative.`;
      }
    });

    setPaymentErrors(errors);

    const originalExpectedTotal = parseFloat(finalTotal);
    const expectedTotal = Math.ceil(originalExpectedTotal);
    const balance = expectedTotal - totalEnteredPayment; // Calculate remaining balance

    // Check if overpayment is allowed for cash only
    let overpaymentAllowed = false;
    if (balance < 0 && cashPayment + balance >= -500 && otherPayment === 0) {
      overpaymentAllowed = true;
    }

    setPaymentDetails({
      originalExpectedTotal,
      expectedTotal,
      cashPayment,
      otherPayment,
      balance,
      overpaymentAllowed,
    });
  };

  // Handle payment amount changes
  const handlePaymentChange = (method, value) => {
    setPaymentAmounts((prev) => ({
      ...prev,
      [method]: value,
    }));

    // Update formik values
    formik.setFieldValue(`amount_${method}`, value);

    // Recalculate total payment and balance
    calculateTotalPayment({ ...formik.values, [`amount_${method}`]: value });
  };

  // Fetch products and categories on component mount
  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(Billno());
  }, [dispatch]);

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerName: "",
      customerPhoneNumber: "",
      attender: "",
      amount_Cash: "",
      amount_CreditCard: "",
      amount_OnlinePay: "",
      amount_Rupay: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      handleSubmit(values);
      dispatch(resetState());
    },
  });

  // Access state from Redux store
  const products = useSelector((state) => state.product.products);
  const categories = useSelector((state) => state.pCategory.pCategories);
  const invoiceno = useSelector((state) => state.invoice.invoiceno);
  const cart = useSelector((state) => state.cart.items) || [];

  // Local state for selected category and search term
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Set the default selected category to the first category's _id
  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  const handleAddProduct = (product) => {
    dispatch(addProduct(product));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10); // Convert input value to integer
    if (!isNaN(quantity)) {
      dispatch(updateQuantity({ id: itemId, quantity }));
    }
  };

  // Create a mapping of category titles to their _id values
  const categoryMap = {};
  categories.forEach((category) => {
    categoryMap[category.title] = category._id;
  });

  // Filter products based on the selected category and search term
  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          categoryMap[product.category] === selectedCategory &&
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

    const generateInvoiceForPrint = (invoice) => {
      try {
        console.log("Invoice Data:", invoice); // Debugging: Log the invoice data
    
        // Validate subTotal
        const subTotal = parseFloat(invoice.subTotal);
        if (isNaN(subTotal)) {
          console.error("Invalid subTotal value:", invoice.subTotal);
          alert("Invalid subTotal value. Please check the invoice data.");
          return;
        }
    
        const printWindow = window.open("", "_blank");
    
        if (!printWindow) {
          alert("Unable to open print window. Please allow pop-ups for this site and try again.");
          return;
        }
    
        const invoiceContent = `
          <html>
            <head>
              <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
              <style>
                /* Your existing CSS styles */
              </style>
            </head>
            <body>
              <div class="invoice">
                <!-- Header -->
                <div class="header">
                  <h2>Mapit</h2>
                  <p>Order Bill</p>
                  <p><b>Invoice No:</b> ${invoice.invoiceno}</p>
                  <p><b>Date:</b> ${new Date().toLocaleString()}</p>
                </div>
                <!-- Items Table -->
                <div class="items">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${invoice.cartItems
                        .map(
                          (item) => `
                            <tr>
                              <td>${item.title}</td>
                              <td>${item.quantity}</td>
                              <td>₹${item.price.toFixed(2)}</td>
                              <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>`
                        )
                        .join("")}
                      <!-- Total Rows -->
                      <tr class="total-row">
                        <td colspan="3" align="right"><b>Subtotal:</b></td>
                        <td>₹${subTotal.toFixed(2)}</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3" align="right"><b>Discount:</b></td>
                        <td>₹${(invoice.discount || 0).toFixed(2)}</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3" align="right"><b>Quantity:</b></td>
                        <td>${invoice.cartItemsCount}</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3" align="right"><b>Balance:</b></td>
                        <td>₹${(invoice.remainingBalance || 0).toFixed(2)}</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3" align="right"><b>Total:</b></td>
                        <td>₹${(subTotal - (invoice.discount || 0)).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- Barcode Section -->
                <div class="barcode">
                  <svg id="barcode"></svg>
                </div>
                <!-- Footer Section -->
                <div class="footer">
                  <p><b>Thank you for your order!</b></p>
                  <p class="thank-you">Please visit again!</p>
                </div>
              </div>
              <script>
                // Generate barcode using JsBarcode
                try {
                  JsBarcode("#barcode", "${invoice.invoiceno}", {
                    format: "CODE128",
                    width: 2,
                    height: 40,
                    displayValue: true
                  });
                } catch (error) {
                  console.error("Error generating barcode:", error);
                }
                // Print the window after content is loaded
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `;
    
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
      } catch (error) {
        console.error("Error in generating invoice for print:", error);
        alert("Failed to generate the invoice for print.");
      }
    };
    
  // Calculate subtotal, tax, and final total
  const subtotal = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2) || "0.00";
  const totalTax = cart?.reduce((sum, item) => sum + (item.tax * item.quantity), 0).toFixed(2) || "0.00";
  const finalTotal = (parseFloat(subtotal) + parseFloat(totalTax)).toFixed(2);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Prepare payment methods
      const paymentMethods = [
        { method: "Cash", amount: parseFloat(values.amount_Cash) || 0 },
        { method: "CreditCard", amount: parseFloat(values.amount_CreditCard) || 0 },
        { method: "OnlinePay", amount: parseFloat(values.amount_OnlinePay) || 0 },
        { method: "Rupay", amount: parseFloat(values.amount_Rupay) || 0 },
      ];
  
      // Handle overflow for cash payments
      let cashAmount = paymentMethods.find((pm) => pm.method === "Cash").amount;
      if (cashAmount > finalTotal) {
        cashAmount = finalTotal;
        paymentMethods.find((pm) => pm.method === "Cash").amount = cashAmount;
      }
  
      // Prepare invoice data
      const invoiceData = {
        invoiceno,
        customerName: values.customerName,
        customerPhoneNumber: values.customerPhoneNumber,
        attender: values.attender,
        paymentMethods,
        cartItems: cart.map((item) => ({
          product: item._id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax,
        })),
        cartItemsCount: cart.length,
        subTotal: subtotal,
        tax: totalTax,
        finalTotal: finalTotal,
        discount: 0,
        remainingBalance: paymentDetails.balance,
        roundOffamount: 0,
        GrandtotalAmount: finalTotal,
      };
  
      // Dispatch the createInvoice action
      await dispatch(CreateSale(invoiceData)).unwrap();
  
      // Show success message
      alert("Invoice created successfully!");
  
      generateInvoiceForPrint(invoiceData);
      // Reset form and cart
      formik.resetForm();
      dispatch(resetState());
    } catch (error) {
      // Show error message
      message.error(`Error: ${error.message}`);
    }
  };
  
  
  return (
    <Row gutter={[12, 12]}>
      {/* Categories Section */}
      <Col xs={24} sm={6} md={3}>
        <Card style={{ height: "100%", padding: "10px", background: "transparent", border: "none" }}>
          {/* Mobile View - Horizontal Scroll */}
          <div className="flex space-x-4 overflow-x-auto md:hidden p-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="w-52 h-39 object-cover rounded-lg flex-shrink-0 cursor-pointer text-center p-4"
                style={{
                  backgroundColor: selectedCategory === cat._id ? "#1890ff" : "#f5f5f5",
                  color: selectedCategory === cat._id ? "#fff" : "#000",
                  transition: "0.3s",
                }}
                onClick={() => handleCategoryClick(cat._id)}
              >
                {cat.title}
              </div>
            ))}
          </div>

          {/* Desktop View - Stacked Layout */}
          <div className="hidden md:block">
            <Row gutter={[16, 16]}>
              {categories.map((cat) => (
                <Col span={24} key={cat._id}>
                  <Card
                    hoverable
                    className="text-center cursor-pointer"
                    style={{
                      backgroundColor: selectedCategory === cat._id ? "#1890ff" : "#f5f5f5",
                      color: selectedCategory === cat._id ? "#fff" : "#000",
                      transition: "0.3s",
                    }}
                    onClick={() => handleCategoryClick(cat._id)}
                  >
                    {cat.title}
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Card>
      </Col>

      {/* Menu Items Section */}
      <Col xs={24} sm={12} md={12}>
        <Input
          placeholder="Search products..."
          prefix={<SearchOutlined />}
          style={{ width: "50%", marginBottom: 20 }}
          value={searchTerm}
          onChange={handleSearch}
        />
        <Row gutter={[10, 10]}>
          {filteredProducts.map((item) => (
            <Col key={item._id} xs={24} sm={10} md={12} lg={12}>
              <Card hoverable onClick={() => handleAddProduct(item)}>
                <Card.Meta title={item.title} />
                <Text strong style={{ fontSize: 16, marginTop: 10 }}>
                  ₹{item.price.toFixed(2)}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      {/* Shopping Cart Section */}
      <Col xs={24} sm={24} md={9}>
        <Card style={{ height: "100%", overflowY: "auto" }}>
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <h3>Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <CustomInput
                  type="text"
                  name="invoiceno"
                  className="w-full"
                  val={invoiceno || ""}
                  onChng={formik.handleChange("invoiceno")}
                  onBlr={formik.handleBlur("invoiceno")}
                  label="Invoice No"
                  id="invoiceno"
                  disabled
                />
              </div>
              <div>
                <CustomInput
                  type="text"
                  name="invoiceDate"
                  className="w-full"
                  val={new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()}
                  label="Date"
                  id="invoiceDate"
                  disabled
                />
              </div>
              <div>
                <CustomInput
                  type="text"
                  className="w-full"
                  name="attender"
                  onChng={formik.handleChange("attender")}
                  onBlr={formik.handleBlur("attender")}
                  val={formik.values.attender}
                  label="Attender"
                  id="attender"
                />
                {formik.touched.attender && formik.errors.attender && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.attender}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <CustomInput
                  type="text"
                  name="customerName"
                  className="w-full"
                  onChng={formik.handleChange("customerName")}
                  onBlr={formik.handleBlur("customerName")}
                  val={formik.values.customerName}
                  label="Name"
                  id="customerName"
                />
                {formik.touched.customerName && formik.errors.customerName && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.customerName}</div>
                )}
              </div>
              <div>
                <CustomInput
                  type="text"
                  name="customerPhoneNumber"
                  className="w-full"
                  onChng={formik.handleChange("customerPhoneNumber")}
                  onBlr={formik.handleBlur("customerPhoneNumber")}
                  val={formik.values.customerPhoneNumber}
                  label="Phone"
                  id="customerPhoneNumber"
                />
                {formik.touched.customerPhoneNumber && formik.errors.customerPhoneNumber && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.customerPhoneNumber}</div>
                )}
              </div>
            </div>

            <br />
            <div className="flex flex-wrap items-center gap-4">
              {/* Payment Method Dropdown */}
              <Select
                placeholder="Select Payment Method"
                className="w-52"
                onChange={setSelectedMethod}
                value={selectedMethod}
              >
                {paymentMethods.map((method) => (
                  <Select.Option key={method} value={method}>
                    {method}
                  </Select.Option>
                ))}
              </Select>

              {/* Payment Input Field (Shows only when a method is selected) */}
              {selectedMethod && (
                <div className="flex items-center gap-2">
                  <label className="font-bold">{selectedMethod}:</label>
                  <Form.Item name={`amount_${selectedMethod}`} noStyle>
                    <Input
                      type="number"
                      placeholder={`Enter amount for ${selectedMethod}`}
                      value={paymentAmounts[selectedMethod] || ""}
                      onChange={(e) => handlePaymentChange(selectedMethod, e.target.value)}
                      className="w-40"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
            <br />
            <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
              <List
                dataSource={cart}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button icon={<MinusOutlined />} onClick={() => dispatch(decrease(item._id))} key="decrease" />,
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                        min={1}
                        style={{ width: 60, textAlign: "center" }}
                        key="quantity"
                      />,
                      <Button icon={<PlusOutlined />} onClick={() => dispatch(increase(item._id))} key="increase" />,
                      <Button icon={<DeleteOutlined />} onClick={() => dispatch(deleteProduct(item._id))} danger key="delete" />,
                    ]}
                  >
                    <List.Item.Meta title={item.title} description={`₹${item.price.toFixed(2)} (Tax: ₹${item.tax.toFixed(2)})`} />
                  </List.Item>
                )}
              />
            </div>
            <div style={{ width: "100%", maxWidth: "600px", marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 18 }}>Subtotal:</Text>
                <Text strong style={{ fontSize: 18 }}>₹{subtotal}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 18 }}>Tax:</Text>
                <Text strong style={{ fontSize: 18 }}>₹{totalTax}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 18 }}>Balance:</Text>
                <Text strong style={{ fontSize: 18 }}>₹{paymentDetails.balance.toFixed(2)}</Text>
              </div>
              <hr />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong style={{ fontSize: 18 }}>Total:</Text>
                <Text strong style={{ fontSize: 18 }}>₹{finalTotal}</Text>
              </div>
            </div>
            <div className="mt-4 flex justify-between gap-4">
              <Button type="primary" danger size="large" className="flex-1" onClick={() => dispatch(resetState())}>
                Clear Cart
              </Button>
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                className="flex-1"
                disabled={
                  cart.length === 0 || // Disable if cart is empty
                  (paymentDetails.balance > 0 || // Disable if balance is positive (underpayment)
                  (paymentDetails.balance < 0 && !paymentDetails.overpaymentAllowed)) // Disable if balance is negative and overpayment is not allowed
                }
              >
                Create Order
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default App;