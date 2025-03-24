import React from "react";
import { Typography, Card, Row, Col } from "antd";

const { Text, Title } = Typography;

const PrintableInvoice = ({ invoiceData }) => {
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <Title level={4}>Invoice Details</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text strong>Invoice No:</Text> {invoiceData.invoiceno}
        </Col>
        <Col span={12}>
          <Text strong>Date:</Text> {new Date().toLocaleDateString()}
        </Col>
        <Col span={12}>
          <Text strong>Customer Name:</Text> {invoiceData.customerName}
        </Col>
        <Col span={12}>
          <Text strong>Customer Phone:</Text> {invoiceData.customerPhoneNumber}
        </Col>
        <Col span={12}>
          <Text strong>Attender:</Text> {invoiceData.attender}
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: 20 }}>Items</Title>
      {invoiceData.cartItems.map((item, index) => (
        <Row key={index} gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>{item.title}</Text>
          </Col>
          <Col span={6}>
            <Text strong>Quantity:</Text> {item.quantity}
          </Col>
          <Col span={6}>
            <Text strong>Price:</Text> ₹{item.price.toFixed(2)}
          </Col>
        </Row>
      ))}

      <Title level={4} style={{ marginTop: 20 }}>Payment Details</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text strong>Subtotal:</Text> ₹{invoiceData.subTotal}
        </Col>
        <Col span={12}>
          <Text strong>Tax:</Text> ₹{invoiceData.tax}
        </Col>
        <Col span={12}>
          <Text strong>Total:</Text> ₹{invoiceData.finalTotal}
        </Col>
        <Col span={12}>
          <Text strong>Balance:</Text> ₹{invoiceData.remainingBalance.toFixed(2)}
        </Col>
      </Row>
    </div>
  );
};

export default PrintableInvoice;