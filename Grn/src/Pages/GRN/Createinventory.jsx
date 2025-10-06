import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, Select, InputNumber, Divider, Card, Row, Col, message, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { createNewInventory, Billno } from '../../features/inventory/inventorySlice';
import { getProducts, getCategories } from '../../features/sales/salesSlice';
import generateInvoiceForPrint from '../../components/PrintLayout';
import { getProfiles } from "../../features/auth/authSlice";

const { Option } = Select;

const InventoryForm = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [summaryData, setSummaryData] = useState({
    subtotal: 0,
    groupedTaxSummary: [],
    grandTotal: 0
  });

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(Billno());
    dispatch(getProfiles());
  }, [dispatch]);

  const grnno = useSelector((state) => state.inventory.grnno);
  const profile = useSelector((state) => state?.auth?.profiles || []);
  const products = useSelector((state) => state.sales.products);
  const categories = useSelector((state) => state.sales.pCategories);
  
  const filteredProducts = useMemo(() => {
    if (!selectedCategory || !selectedSubcategory) return [];
    return products.filter(
      (product) =>
        product.category === selectedCategory &&
        product.subcategory === selectedSubcategory
    );
  }, [selectedCategory, selectedSubcategory, products]);

 const generateBarcode = (productId) => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${productId.slice(-6)}${randomNumber}`;
};


const calculateSummary = (items) => {
  if (!items) return {
    subtotal: 0,
    groupedTaxSummary: [],
    grandTotal: 0
  };

  const subtotal = items.reduce((sum, item) => {
    const product = selectedProducts[item.name];
    const variant = product?.variants?.find(v => v.variant === item.variant);
    const mrp = variant?.mrp || product?.mrp || item.mrp || 0;
    return sum + (mrp * (item.quantity || 1));
  }, 0);

  const taxGroups = {};

  items.forEach((item) => {
    const product = selectedProducts[item.name];
    const variant = product?.variants?.find(v => v.variant === item.variant);
    
    const cgstRate = variant?.cgst || product?.cgst || 0;
    const sgstRate = variant?.sgst || product?.sgst || 0;
    const quantity = item.quantity || 1;
    const mrp = variant?.mrp || product?.mrp || item.price || 0;
    
    const taxableAmount = mrp * quantity;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalTaxAmount = cgstAmount + sgstAmount;

    const taxKey = `${cgstRate}-${sgstRate}`;
    
    if (!taxGroups[taxKey]) {
      taxGroups[taxKey] = {
        cgst: cgstRate,
        sgst: sgstRate,
        cgstAmount: 0,
        sgstAmount: 0,
        totalTaxAmount: 0,
        taxableAmount: 0
      };
    }
    
    taxGroups[taxKey].cgstAmount += cgstAmount;
    taxGroups[taxKey].sgstAmount += sgstAmount;
    taxGroups[taxKey].totalTaxAmount += totalTaxAmount;
    taxGroups[taxKey].taxableAmount += taxableAmount;
  });

  const groupedTaxSummary = Object.values(taxGroups).map(group => ({
    taxRate: `${group.cgst + group.sgst}%`,
    cgst: group.cgst,
    sgst: group.sgst,
    cgstAmount: parseFloat(group.cgstAmount.toFixed(2)),
    sgstAmount: parseFloat(group.sgstAmount.toFixed(2)),
    totalTaxAmount: parseFloat(group.totalTaxAmount.toFixed(2)),
    taxableAmount: parseFloat(group.taxableAmount.toFixed(2)),
    cgstprice: parseFloat(group.cgstAmount.toFixed(2)), // Added
    sgstprice: parseFloat(group.sgstAmount.toFixed(2))  // Added
  }));

  const totalTax = groupedTaxSummary.reduce((sum, tax) => sum + tax.totalTaxAmount, 0);
  const grandTotal = subtotal + totalTax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    groupedTaxSummary,
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
};

  useEffect(() => {
    const items = form.getFieldValue('items') || [];
    const summary = calculateSummary(items);
    setSummaryData(summary);
  }, [form, form.getFieldValue('items'), selectedProducts]);

  const onProductSelect = (productId, name) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProducts((prev) => ({ ...prev, [name]: product }));

    const items = form.getFieldValue('items');
    const updatedItems = [...items];
    const barcode = generateBarcode(productId);

    if (product?.variants?.length > 0) {
      const firstVariant = product.variants[0];
      updatedItems[name] = {
        ...updatedItems[name],
        variant: firstVariant.variant,
        price: firstVariant.price || 0,
        mrp: firstVariant.mrp || firstVariant.price || 0,
        tax: firstVariant.tax || 0,
        cgst: firstVariant.cgst || 0,
        sgst: firstVariant.sgst || 0,
        barcode: barcode,
      };
    } else {
      updatedItems[name] = {
        ...updatedItems[name],
        variant: '',
        price: product?.price || 0,
        mrp: product?.mrp || product?.price || 0,
        tax: product?.tax || 0,
        cgst: product?.cgst || 0,
        sgst: product?.sgst || 0,
        barcode: barcode,
      };
    }

    form.setFieldsValue({ items: updatedItems });
  };

  const TotalField = ({ form, name }) => {
    const quantity = Form.useWatch(['items', name, 'quantity'], form) || 0;
    const mrp = Form.useWatch(['items', name, 'mrp'], form) || 0;
    const total = quantity * mrp;

    return (
      <InputNumber
        value={total}
        readOnly
        formatter={(val) => `₹ ${val}`}
        style={{ width: '100%' }}
      />
    );
  };

  const onVariantSelect = (variantValue, name) => {
    const product = selectedProducts[name];
    const variant = product?.variants?.find((v) => v.variant === variantValue);
    if (!variant) return;

    const items = form.getFieldValue('items');
    const updatedItems = [...items];
    updatedItems[name] = {
      ...updatedItems[name],
      variant: variant.variant,
      price: variant.price || 0,
      mrp: variant.mrp || variant.price || 0,
      tax: variant.tax || 0,
      cgst: variant.cgst || 0,
      sgst: variant.sgst || 0,
    };

    form.setFieldsValue({ items: updatedItems });
  };
    useEffect(() => {
    if (grnno) {
      form.setFieldsValue({ grnno });
    }
  }, [grnno, form]);

  const onFinish = (values) => {
  // First calculate all item-level taxes and totals
  const inventoryItems = values.items.map((item, index) => {
    const product = selectedProducts[index];
    const variant = product?.variants?.length > 0 
      ? product.variants.find((v) => v.variant === item.variant)
      : null;

    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const mrp = item.mrp || 0;
    const cgstRate = variant?.cgst || product?.cgst || 0;
    const sgstRate = variant?.sgst || product?.sgst || 0;
    const taxableAmount = mrp * quantity;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalTaxAmount = cgstAmount + sgstAmount;

    const itemData = {
      productId: product?._id,
      title: product?.title,
      category: product?.category,
      subcategory: product?.subcategory,
      quantity: quantity,
      price: price,
      barcode: item.barcode,
      subtotal: taxableAmount,
      taxprice: totalTaxAmount,
      cgstprice: cgstAmount,
      sgstprice: sgstAmount,
      variants: []
    };

    if (variant) {
      itemData.variants = [{
        variantId: variant._id,
        variant: variant.variant,
        mrp: variant.mrp,
        price: variant.price,
        tax: variant.tax,
        taxprice: (variant.price * quantity * variant.tax) / 100,
        cgst: variant.cgst,
        cgstprice: (variant.price * quantity * variant.cgst) / 100,
        sgst: variant.sgst,
        sgstprice: (variant.price * quantity * variant.sgst) / 100,
      }];
    }

    return itemData;
  });

  // Now calculate the summary based on the processed items
  const subtotal = inventoryItems.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Group taxes by rate
  const taxGroups = {};
  inventoryItems.forEach((item) => {
    const taxKey = `${item.variants[0]?.cgst || 0}-${item.variants[0]?.sgst || 0}`;
    
    if (!taxGroups[taxKey]) {
      taxGroups[taxKey] = {
        cgst: item.variants[0]?.cgst || 0,
        sgst: item.variants[0]?.sgst || 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalTaxAmount: 0,
        taxableAmount: 0
      };
    }
    
    taxGroups[taxKey].cgstAmount += item.cgstprice;
    taxGroups[taxKey].sgstAmount += item.sgstprice;
    taxGroups[taxKey].totalTaxAmount += item.taxprice;
    taxGroups[taxKey].taxableAmount += item.subtotal;
  });

  const groupedTaxSummary = Object.values(taxGroups).map(group => ({
    taxRate: `${group.cgst + group.sgst}%`,
    cgst: group.cgst,
    sgst: group.sgst,
    cgstprice: parseFloat(group.cgstAmount.toFixed(2)),
    sgstprice: parseFloat(group.sgstAmount.toFixed(2)),
    totalTaxAmount: parseFloat(group.totalTaxAmount.toFixed(2)),
    taxableAmount: parseFloat(group.taxableAmount.toFixed(2))
  }));

  const totalTax = groupedTaxSummary.reduce((sum, tax) => sum + tax.totalTaxAmount, 0);
  const grandTotal = subtotal + totalTax;

  const payload = {
    ...values,
    items: inventoryItems,
    createdBy: profile[0]?._id,
    subtotal: parseFloat(subtotal.toFixed(2)),
    groupedTaxSummary,
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    taxprice: parseFloat(totalTax.toFixed(2))
  };

  dispatch(createNewInventory(payload))
    .unwrap()
    .then((response) => {
      message.success('Inventory created successfully');
      setSubmittedData(response);
      form.resetFields();
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSelectedProducts({});
      
      setTimeout(() => {
        generateInvoiceForPrint(response, profile);
      }, 500);
    })
    .catch((err) => {
      message.error('Error creating inventory: ' + err);
    });
};

  return (
    <Card 
      title="Create Inventory" 
      style={{ maxWidth: 1500, margin: 'auto' }}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{
          grnno: '',
          type: 'purchase',
          Supplier: '',
          Suppliernote: '',
          items: [{
            title: '',
            variant: '',
            quantity: 1,
            price: 0,
            mrp: 0,
            barcode: '',
            variants: [] 
          }],
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item name="grnno" label="Grn No" rules={[{ required: true }]}>
              <Input readOnly />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select>
                <Option value="purchase">Purchase</Option>
                <Option value="adjustment">Adjustment</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item name="Supplier" label="Supplier" rules={[{ required: true }]}>
              <Input placeholder="Supplier name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="Suppliernote" label="Note">
          <Input.TextArea rows={3} placeholder="Optional note" />
        </Form.Item>

        <Divider orientation="left">Inventory Items</Divider>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              <table style={{ width: '100%', marginBottom: 24, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Subcategory</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Product</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Variant</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Barcode</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>MRP</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Quantity</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px' }}>{name + 1}</td>
                      <td style={{ padding: '8px' }}>
                        <Form.Item name={[name, 'category']} style={{ margin: 0 }}>
                          <Select onChange={(value) => setSelectedCategory(value)}>
                            {categories.map((cat) => (
                              <Option key={cat._id} value={cat.title}>
                                {cat.title}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        {selectedCategory && (
                          <Form.Item name={[name, 'subcategory']} style={{ margin: 0 }}>
                            <Select onChange={(value) => setSelectedSubCategory(value)}>
                              {categories
                                .find((cat) => cat.title === selectedCategory)
                                ?.subcategories.map((sub) => (
                                  <Option key={sub._id} value={sub.title}>
                                    {sub.title}
                                  </Option>
                                ))}
                            </Select>
                          </Form.Item>
                        )}
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          style={{ margin: 0 }}
                          rules={[{ required: true }]}
                        >
                          <Select
                            placeholder="Select product"
                            onChange={(value) => onProductSelect(value, name)}
                            showSearch
                            filterOption={(input, option) =>
                              option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            disabled={!selectedCategory || !selectedSubcategory}
                          >
                            {filteredProducts.map((product) => (
                              <Option key={product._id} value={product._id}>
                                {product.title} ({product.unit})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        {selectedProducts[name]?.variants?.length > 0 ? (
                          <Form.Item
                            {...restField}
                            name={[name, 'variant']}
                            style={{ margin: 0 }}
                            rules={[{ required: true }]}
                          >
                            <Select
                              placeholder="Select variant"
                              onChange={(value) => onVariantSelect(value, name)}
                            >
                              {selectedProducts[name].variants.map((variant, idx) => (
                                <Option key={idx} value={variant.variant}>
                                  {variant.variant} ({variant.price})
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        ) : (
                          <Form.Item
                            {...restField}
                            name={[name, 'variant']}
                            style={{ margin: 0 }}
                          >
                            <Input disabled placeholder="No variants" />
                          </Form.Item>
                        )}
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'barcode']}
                          style={{ margin: 0 }}
                        >
                          <Input readOnly />
                        </Form.Item>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'mrp']}
                          style={{ margin: 0 }}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} readOnly/>
                        </Form.Item>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          style={{ margin: 0 }}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} readOnly />
                        </Form.Item>
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          style={{ margin: 0 }}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        <TotalField form={form} name={name} readOnly />
                      </td>
                      
                      <td style={{ padding: '8px' }}>
                        <Space>
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={() =>
                              add({
                                title: '',
                                variant: '',
                                quantity: 1,
                                price: 0,
                                barcode: '',
                              }, name + 1)
                            }
                          />
                          {fields.length > 1 && (
                            <Button
                              danger
                              type="text"
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            />
                          )}
                        </Space>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Form.List>
        
        <Divider orientation="left">Summary</Divider>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12} offset={12}>
            <Card size="small">
              <Row>
                <Col span={12}>Subtotal:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  ₹{summaryData.subtotal.toFixed(2)}
                </Col>
              </Row>
              {summaryData.groupedTaxSummary.map((tax, i) => (
                <Row key={i}>
                  <Col span={12}>Tax ({tax.taxRate}):</Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    ₹{tax.totalTaxAmount.toFixed(2)}
                  </Col>
                </Row>
              ))}
              <Row style={{ fontWeight: 'bold', marginTop: 8 }}>
                <Col span={12}>Grand Total:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  ₹{summaryData.grandTotal.toFixed(2)}
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit Inventory
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InventoryForm;