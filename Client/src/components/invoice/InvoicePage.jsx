import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, message } from "antd";

const PrintInvoicePage = () => {
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/invoices/latest`
        );
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        } else {
          message.error("Failed to fetch invoice details.");
          navigate("/cart");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        message.error("Something went wrong while fetching the invoice.");
        navigate("/cart");
      }
    };

    fetchInvoice();
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
    return <p>Loading invoice details...</p>;
  }

  const subTotal = invoice.subTotal || 0;
  const discount = invoice.discount || 0;
  const GrandtotalAmount = invoice.GrandtotalAmount || 0;

  return (
    <div className="print-invoice-page">
      <Card className="p-4 m-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Tax Invoice</h1>

        <div className="mb-4">
        <div className="logo my-6">
                  <img 
                  src="https://res.cloudinary.com/dl6ixqdqh/image/upload/v1732693398/20230811_170610_wsmqmw.png"
                  alt="Logo" 
                  width={150}
                  className ='mx-auto bg-black'
                />
            </div>
          <p>
            <strong>Invoice No:</strong> {invoice.invoiceno}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {invoice?.createdAt ? new Date(invoice?.createdAt).toLocaleString() : ""}
          </p>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.cartItems || []).map((item, index) => (
              <tr key={index}>
                <td className="p-2 text-left">{item.title}</td>
                <td className="p-2 text-left">{item.quantity}</td>
                <td className="p-2 text-left">₹{item.price.toFixed(2)}</td>
                <td className="p-2 text-left">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
<hr className="font-bold"/>
        <table className="w-full mt-4">
  <tbody>
    <tr>
      <td className="p-2">Subtotal</td>
      <td className="p-2 text-right">₹{subTotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td className=" p-2">Discount</td>
      <td className=" p-2 text-right">₹{discount.toFixed(2)}</td>
    </tr>
    
    <tr>
      <td className=" p-2 font-bold text-xl">Total</td>
      <td className=" p-2 text-right font-bold text-2xl">₹{GrandtotalAmount.toFixed(2)}</td>
    </tr>
  </tbody>
</table>
<hr/>
<div className="company-info text-center mt-6">
         <p><strong>Thanks for Visting...</strong> </p>
          <p><strong>Phone:</strong> +91-9876543210</p>
          <p><strong>Instagram:</strong> @companyinsta</p>
          <p><strong>Website:</strong> <a href="https://www.companywebsite.com" target="_blank" rel="noopener noreferrer">www.companywebsite.com</a></p>
        </div>

        <div className="flex justify-between mt-4">
          <Button type="primary" onClick={handlePrint}>
            Print
          </Button>
          <Button type="default" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </Card>

    </div>
  );
};

export default PrintInvoicePage;
