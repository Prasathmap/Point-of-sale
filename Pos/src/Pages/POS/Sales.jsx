import { useEffect, useState } from "react";
import { Card, Button, List, Input, Row, Col, Typography, Form, message, Modal, Table, Tooltip,Tag } from "antd";
import { DeleteOutlined, PlusOutlined, MinusOutlined, SearchOutlined, SaveOutlined, HistoryOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { getProducts, getCategories, getEmployees, getSalestypes } from "../../features/sales/salesSlice";
import { addProduct, decrease, increase, deleteProduct, updateQuantity, setCart, resetState } from "../../features/cart/cartSlice";
import { getProfiles } from "../../features/auth/authSlice";
import { CreateSale, Billno, updateSales, getASales } from "../../features/invoices/invoiceSlice";
import { updateInventory,getAllGoods} from '../../features/inventory/inventorySlice';
import generateInvoiceForPrint from "../../components/Printlayout";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    originalExpectedTotal: 0,
    expectedTotal: 0,
    cashPayment: 0,
    otherPayment: 0,
    balance: 0,
    overpaymentAllowed: false,
  });
  const paymentMethods = ["Cash", "CreditCard", "OnlinePay"];

  const [heldBills, setHeldBills] = useState([]);
  const [isHeldBillsModalVisible, setIsHeldBillsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Access state from Redux store
  const products = useSelector((state) => state.sales.products);
  const categories = useSelector((state) => state.sales.pCategories);
  const invoiceno = useSelector((state) => state.invoice.invoiceno);
  const goods = useSelector((state) => state?.inventory?.goods);
  const cart = useSelector((state) => state.cart.items) || [];
  const employees = useSelector((state) => state?.sales?.employees || []);
  const salestype = useSelector((state) => state?.sales?.salestypes || []);
  const profile = useSelector((state) => state?.auth?.profiles || []);

  // Calculate totals
  const subtotalRaw = cart?.reduce((sum, item) => sum + (item.mrp || 0) * (item.quantity || 1), 0) || 0;
  const totalTaxRaw = cart?.reduce((sum, item) => sum + (item.taxprice || 0) * (item.quantity || 1), 0) || 0;
  const subtotal = subtotalRaw.toFixed(2);
  const totalTax = totalTaxRaw.toFixed(2);
  const roundOff = (subtotalRaw + totalTaxRaw).toFixed(2);
  const finalTotal = Math.ceil(subtotalRaw + totalTaxRaw).toFixed(2);
  const roundOffamount = (parseFloat(finalTotal) - parseFloat(roundOff)).toFixed(2);
  const totalItemsQuantity = cart?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  const cartItemsCount = cart?.length || 0;

// Create inventory map for quick lookup
const inventoryMap = (goods || []).reduce((map, item) => {
  const productId = item?.productId;
  const variant = String(item?.variant || '');
  
  if (productId && variant) {
    const key = `${productId}_${variant}`;
    if (!map[key]) {
      map[key] = {
        handInCount: 0,
        title: item.title || 'Unknown Product',
        variant,
      };
    }
    map[key].handInCount += item.handInCount || 0;
  }
  
  return map;
}, {});




  // Load single invoice when editing
 useEffect(() => {
  if (!id) { // Early return if no ID
    dispatch(resetState());
    dispatch(Billno());
    return;
  }

  setIsLoading(true);
  dispatch(getASales(id))
    .unwrap()
    .then((invoice) => {
      formik.setValues({
        customerName: invoice.customerName,
        customerPhoneNumber: invoice.customerPhoneNumber,
        employee: invoice.employee,
        amount_Cash: invoice.paymentMethods.find(pm => pm.method === "Cash")?.amount || "",
        amount_CreditCard: invoice.paymentMethods.find(pm => pm.method === "CreditCard")?.amount || "",
        amount_OnlinePay: invoice.paymentMethods.find(pm => pm.method === "OnlinePay")?.amount || "",
        invoiceno: invoice.invoiceno,
      });

      const paymentAmounts = {};
      invoice.paymentMethods.forEach(pm => {
        paymentAmounts[pm.method] = pm.amount;
      });
      setPaymentAmounts(paymentAmounts);

      dispatch(setCart(invoice.cartItems.map(item => ({
        ...item,
        _id: item.product
      }))));
    })
    .catch((error) => {
      message.error(error.message || "Failed to load invoice");
    })
    .finally(() => setIsLoading(false));
}, [id, dispatch]); // Ensure id is in dependencies
  // Load initial data
  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(getEmployees());
    dispatch(getSalestypes());
    dispatch(getProfiles());
    dispatch(getAllGoods());

    // Load held bills from localStorage
    const savedHeldBills = localStorage.getItem('heldBills');
    if (savedHeldBills) {
      setHeldBills(JSON.parse(savedHeldBills));
    }
  }, [dispatch]);

  
// Grouped Tax Summary
const taxGroupsByRate = new Map();
cart?.forEach((item) => {
  const quantity = item.quantity || 1;
  const totalTaxRate = item.cgst + item.sgst;
  const key = `${item.cgst}-${item.sgst}`;

  if (!taxGroupsByRate.has(totalTaxRate)) {
    taxGroupsByRate.set(totalTaxRate, new Map());
  }

  const groupMap = taxGroupsByRate.get(totalTaxRate);
  const existing = groupMap.get(key);

  if (existing) {
    existing.cgstprice += (item.cgstprice || 0) * quantity;
    existing.sgstprice += (item.sgstprice || 0) * quantity;
  } else {
    groupMap.set(key, {
      cgst: item.cgst,
      sgst: item.sgst,
      cgstprice: (item.cgstprice || 0) * quantity,
      sgstprice: (item.sgstprice || 0) * quantity,
    });
  }
});

const groupedTaxSummary = [];
taxGroupsByRate.forEach((groupMap, taxRate) => {
  groupMap.forEach((entry) => {
    groupedTaxSummary.push({
      taxRate: `${taxRate}%`,
      cgst: entry.cgst,
      sgst: entry.sgst,
      cgstprice: parseFloat(entry.cgstprice.toFixed(2)),
      sgstprice: parseFloat(entry.sgstprice.toFixed(2)),
      totalTaxAmount: parseFloat((entry.cgstprice + entry.sgstprice).toFixed(2)),
    });
  });
});

  const cartCount = [{
    cartItemsCount: cartItemsCount,
    totalItemsQuantity: totalItemsQuantity
  }];

  // Set default category
  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories]);

  // Calculate payment details
  const calculateTotalPayment = (values = {}) => {
    const paymentMethods = Object.keys(values).filter((key) => 
      key.startsWith("amount_") && values[key] !== undefined
    );
    
    let totalEnteredPayment = 0;
    let cashPayment = 0;
    let otherPayment = 0;
    let errors = {};

    paymentMethods.forEach((key) => {
      const method = key.replace("amount_", "");
      const amount = parseFloat(values[key]) || 0;

      if (method === "Cash") {
        cashPayment = amount;
      } else if (["CreditCard", "OnlinePay"].includes(method)) {
        otherPayment += amount;
      } else {
        errors[method] = `Unknown payment method: ${method}`;
      }

      if (amount < 0) {
        errors[method] = `Amount for ${method} cannot be negative.`;
      } else {
        totalEnteredPayment += amount;
      }
    });

    const originalExpectedTotal = parseFloat(finalTotal) || 0;
    const expectedTotal = Math.ceil(originalExpectedTotal);
    const balance = expectedTotal - totalEnteredPayment;

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

    formik.setFieldValue(`amount_${method}`, value);
    calculateTotalPayment({ ...formik.values, [`amount_${method}`]: value });
  };

  // Hold current bill
  const holdCurrentBill = () => {
    if (cart.length === 0) {
      message.warning("Cannot hold an empty bill");
      return;
    }

    const newHeldBill = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      cartItems: [...cart],
      formValues: { ...formik.values },
      subtotal,
      totalTax,
      finalTotal,
      totalItemsQuantity,
      cartItemsCount
    };

    const updatedHeldBills = [...heldBills, newHeldBill];
    setHeldBills(updatedHeldBills);
    localStorage.setItem('heldBills', JSON.stringify(updatedHeldBills));
    message.success("Bill held successfully");
    dispatch(resetState());
    formik.resetForm();
  };

  // Retrieve held bill
  const retrieveHeldBill = (billId) => {
    const billToRetrieve = heldBills.find(bill => bill.id === billId);
    if (!billToRetrieve) return;
    dispatch(setCart(billToRetrieve.cartItems));
    formik.setValues(billToRetrieve.formValues);
    calculateTotalPayment(billToRetrieve.formValues);
    setIsHeldBillsModalVisible(false);
    message.success("Bill retrieved successfully");
  };

  // Delete held bill
  const deleteHeldBill = (billId) => {
    const updatedHeldBills = heldBills.filter(bill => bill.id !== billId);
    setHeldBills(updatedHeldBills);
    localStorage.setItem('heldBills', JSON.stringify(updatedHeldBills));
    message.success("Held bill deleted");
  };

  // Clear all held bills
  const clearAllHeldBills = () => {
    setHeldBills([]);
    localStorage.removeItem('heldBills');
    message.success("All held bills cleared");
  };

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerName: "",
      customerPhoneNumber: "",
      employee: "",
      amount_Cash: "",
      amount_CreditCard: "",
      amount_OnlinePay: "",
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const paymentMethods = [
          { method: "Cash", amount: parseFloat(values.amount_Cash) || 0 },
          { method: "CreditCard", amount: parseFloat(values.amount_CreditCard) || 0 },
          { method: "OnlinePay", amount: parseFloat(values.amount_OnlinePay) || 0 },
        ].filter(pm => pm.amount > 0);

        // Handle overflow for cash payments
        const cashPayment = paymentMethods.find((pm) => pm.method === "Cash");
        if (cashPayment && cashPayment.amount > finalTotal) {
          cashPayment.amount = finalTotal;
        }

        // Prepare invoice data
        const invoiceData = {
          ...(id ? {} : { invoiceno }), // Only include invoice number for new invoices
          customerName: values.customerName,
          customerPhoneNumber: values.customerPhoneNumber,
          employee: values.employee,
          salestype: salestype.find(stype => stype.status)?.title || "",
          paymentMethods,
          cartItems: cart.map((item) => ({
            product: item._id,
            title: item.title,
            variant: item.variant,
            unit: item.unit,
            quantity: item.quantity,
            mrp: item.mrp,
            price: item.price,
            tax: item.tax,
            taxprice: item.taxprice,
            cgst: item.cgst,
            cgstprice: item.cgstprice,
            sgst: item.sgst,
            sgstprice: item.sgstprice,
          })),
          cartCount,
          groupedTaxSummary,
          subTotal: subtotal,
          taxprice: totalTax,
          discount: 0,
          remainingBalance: paymentDetails.balance,
          roundOffamount: roundOffamount,
          GrandtotalAmount: finalTotal,
        };

        if (id) {
        // 🔄 Update existing invoice
        try {
          await dispatch(updateSales({ id, invoiceData })).unwrap();
          message.success("Invoice updated successfully");
           generateInvoiceForPrint(invoiceData, profile);
          navigate("/pos/sales-Report");
        } catch (error) {
          if (error?.response?.data?.message?.includes("already been updated") ) {
            alert("This invoice has already been updated and cannot be modified again.");
            navigate("/pos/sales-Report");
          } else {
            message.error(error.message || "Failed to update invoice");
          }
        }
      } else {
        // 🆕 Create new invoice
        await dispatch(CreateSale(invoiceData)).unwrap();
        
        message.success("Invoice created successfully");
       const inventoryUpdates = cart.map(item => ({
        productId: item.productId || item._id,   // product-level ID
        variantId: item.variantId || item._id,   // variant-level ID
        variant: String(item.variant).trim(),    // human-readable variant label
        quantity: item.quantity,
        action: "decrement",
      }));
  
    try {
      const response = await dispatch(updateInventory(inventoryUpdates)).unwrap();
      console.log(response);
      message.success("Invoice created successfully and inventory updated");
    } catch (inventoryError) {
      // If inventory update fails but sale was successful
      message.warning("Sale recorded but inventory update failed. Please update inventory manually.");
      console.error("Inventory update error:", inventoryError);
    }
    
        generateInvoiceForPrint(invoiceData, profile);
        formik.resetForm();
        dispatch(resetState());
        dispatch(Billno());
      }
    } catch (error) {
      message.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  },
});

  // Set default employee
  useEffect(() => {
    const firstActiveEmployee = employees.find(emp => emp.status);
    if (!formik.values.employee && firstActiveEmployee) {
      formik.setFieldValue("employee", firstActiveEmployee.title);
    }
  }, [employees, formik.values.employee]);

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle product addition
  const handleAddProduct = (product) => {
    if (product.status) {
      dispatch(addProduct(product));
    } else {
      console.log("Product status is false. Not adding to view.");
    }
  };


  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity)) {
      dispatch(updateQuantity({ id: itemId, quantity }));
    }
  };

  // Create category map
  const categoryMap = {};
  categories.forEach((category) => {
    categoryMap[category.title] = category._id;
  });

  // Filter products
  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          categoryMap[product.category] === selectedCategory &&
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Columns for held bills table
  const heldBillsColumns = [
    {
      title: 'Date/Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Customer',
      dataIndex: 'formValues',
      key: 'customer',
      render: (formValues) => formValues.customerName || 'No customer',
    },
    {
      title: 'Items',
      dataIndex: 'cartItemsCount',
      key: 'items',
    },
    {
      title: 'Total',
      dataIndex: 'finalTotal',
      key: 'total',
      render: (total) => `₹${parseFloat(total).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => retrieveHeldBill(record.id)}
          >
            Retrieve
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => deleteHeldBill(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Row gutter={[5, 5]} style={{ background: "azure" }}>
      {/* Categories Section */}
      <Col xs={24} sm={24} md={6} lg={4} xl={3}>
        <Card 
          style={{ height: "100%", padding: "12px 10px", background: "transparent", border: "none", overflow: "hidden", boxShadow: "none" }}
          bodyStyle={{ padding: 0 }}
        >
          <div className="category-list-container">
            <ul className="category-list">
              {categories.map((cat) => (
                cat.status ? (
                  <li
                    key={cat._id}
                    className={`category-item ${selectedCategory === cat._id ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat._id)}
                    aria-current={selectedCategory === cat._id ? "true" : undefined}
                  >
                    <span className="category-item-content">
                      {cat.title}
                    </span>
                  </li>
                ) : null
              ))}
            </ul>
          </div>
        </Card>
      </Col>

      {/* Product Items Section */}
      <Col xs={24} sm={24} md={12} lg={12} xl={11}>
        <div style={{ marginBottom: 24, padding: '0 8px' }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            style={{ width: '100%', maxWidth: '500px', borderRadius: '8px', height: 42 }}
            size="large"
            value={searchTerm}
            onChange={handleSearch}
            allowClear
          />
        </div>

       <Row gutter={[{ xs: 8, sm: 12, md: 16, lg: 16 }, { xs: 12, sm: 16, md: 16, lg: 16 }]}>
          {filteredProducts.flatMap((item) =>
            item.variants
              .map((variant, index) => {
                const key = `${item._id}_${variant.variant}`;
                const productInventory = inventoryMap[key];
                const stock = productInventory?.handInCount || 0;
                const isOutOfStock = stock <= 0;
                
                return (
                  <Col key={`${item._id}-${index}`} xs={12} sm={8} md={8} lg={6} xl={6} xxl={4}>
                    <Card
                      hoverable
                      onClick={() => !isOutOfStock && handleAddProduct({ 
                        ...item, 
                        ...variant,
                        price: variant.price, 
                        mrp: variant.mrp, 
                        selectedVariant: variant 
                      })}
                      className={`Sales-product ${isOutOfStock ? 'out-of-stock' : ''}`}
                      bodyStyle={{
                        padding: '12px',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ flexGrow: 1 }}>
                        <Card.Meta
                          title={
                            <span className="Sales-product-title">
                              {item.title} 
                              <small>{variant.variant}{item.unit}</small>
                            </span>
                          }
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong className="Sales-product-price">
                          ₹{variant.price.toFixed(2)}
                        </Text><br/>
                      </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong className="Sales-product-price">
                          {stock}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                );
              })
          )}
        </Row>
      </Col>

      {/* Shopping Cart Section */}
      <Col xs={24} sm={20} md={6} lg={8} xl={10}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <div>
            <div className="row mb-3">
              <div className="col-sm-6"> <strong>Bill No:</strong> {formik.values.invoiceno || invoiceno}  </div>
              <div className="col-sm-6 text-sm-end"> <strong>Date:</strong> {new Date().toLocaleString()}</div>
            </div>
            <hr />
            {/* Sales Type */}
            <div className="mb-3">
              <strong>Sales Type:</strong>
              <div className="form-check form-check-inline ms-2">
                {salestype.map(
                  (stype) =>
                    stype.status && (
                      <label key={stype._id} className="form-check-label me-5">
                        <input
                          type="radio"
                          name="salestype"
                          value={stype.title}
                          checked={
                            formik.values.salestype === stype.title ||
                            (!formik.values.salestype &&
                              salestype.findIndex((s) => s.status) ===
                                salestype.indexOf(stype))
                          }
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="form-check-input me-1"
                        />
                        {stype.title}
                      </label>
                    )
                )}
              </div>
            </div>
            <hr />
            <div className="container-fluid p-0">
              <div className="row g-4 mb-3 d-none d-md-flex p-2 ">
                <div className="col-md-3 fw-bold">Customer Name</div>
                <div className="col-md-2 fw-bold">Phone</div>
                <div className="col-md-2 fw-bold">Employee</div>
                <div className="col-md-2 fw-bold">Pay Method</div>
                <div className="col-md-2 fw-bold">Amount</div>
              </div>
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-3">
                  <div className="d-md-none mb-1 small text-muted">Customer Name</div>
                  <input
                    type="text"
                    name="customerName"
                    value={formik.values.customerName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-12 col-md-2">
                  <div className="d-md-none mb-1 small text-muted">Phone</div>
                  <input
                    type="text"
                    name="customerPhoneNumber"
                    value={formik.values.customerPhoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-12 col-md-2">
                  <div className="d-md-none mb-1 small text-muted">Employee</div>
                  <select
                    name="employee"
                    value={formik.values.employee}
                    onChange={formik.handleChange}
                    className="form-select form-select-sm"
                  >
                    <option value="">Select</option>
                    {employees.map(
                      (emp) =>
                        emp.status && (
                          <option key={emp._id} value={emp.title}>
                            {emp.title}
                          </option>
                        )
                    )}
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <div className="d-md-none mb-1 small text-muted">Pay Method</div>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="form-select form-select-sm"
                    required
                  >
                    <option value="">Select</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <div className="d-md-none mb-1 small text-muted">Amount</div>
                  <input
                    type="number"
                    value={paymentAmounts[selectedMethod] || ""}
                    onChange={(e) => handlePaymentChange(selectedMethod, e.target.value)}
                    className="form-control form-control-sm"
                    placeholder="Amount"
                    disabled={!selectedMethod}
                    required
                  />
                </div>
              </div>
            </div>
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
          <br />
          <div style={{ width: "100%", maxWidth: "650px", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong style={{ fontSize: 18 }}>Subtotal:</Text>
              <Text strong style={{ fontSize: 18 }}>₹{subtotal}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong style={{ fontSize: 18 }}>Quantity:</Text>
              <Text strong style={{ fontSize: 18 }}>{totalItemsQuantity}/{cartItemsCount}</Text>
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            <Button 
              type="primary" 
              danger 
              size="large" 
              className="w-full" 
              onClick={() => dispatch(resetState())}
              disabled={isLoading}
            >
              Clear Cart
            </Button>
            
            <Button 
              type="default" 
              size="large" 
              icon={<SaveOutlined />} 
              className="w-full" 
              onClick={holdCurrentBill} 
              disabled={cart.length === 0 || isLoading}
            >
              Hold Bill
            </Button>
            
            <Button 
              type="default"  
              size="large" 
              icon={<HistoryOutlined />} 
              className="w-full" 
              onClick={() => setIsHeldBillsModalVisible(true)}
              disabled={isLoading}
            >
              Held Bills ({heldBills.length})
            </Button>
            
            <Tooltip 
              title={(!selectedMethod || !paymentAmounts[selectedMethod]) ? 
                "Please select a payment method and enter an amount" : ""}
            >
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={isLoading}
                disabled={
                  isLoading ||
                  cart.length === 0 || 
                  (paymentDetails.balance > 0 || 
                  (paymentDetails.balance < 0 && !paymentDetails.overpaymentAllowed)) ||
                  !selectedMethod || 
                  !paymentAmounts[selectedMethod]
                }
              >
                {id ? "Update Order" : "Create Order"}
              </Button>
            </Tooltip>
          </div>
        </Form>
      </Col>

      {/* Held Bills Modal */}
      <Modal
        title="Held Bills"
        visible={isHeldBillsModalVisible}
        onCancel={() => setIsHeldBillsModalVisible(false)}
        footer={[
          <Button key="clearAll" danger onClick={clearAllHeldBills}>
            Clear All
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsHeldBillsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={heldBillsColumns}
          dataSource={heldBills}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      </Modal>
    </Row>
  );
};

export default App;