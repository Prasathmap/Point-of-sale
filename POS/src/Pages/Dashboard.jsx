import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getTodayData } from "../features/invoices/invoiceSlice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();

  const summaryDataState = useSelector((state) => state?.invoice?.summaryData);
  const todayDataState = useSelector((state) => state?.invoice?.todayData);

  const [dataToday, setDataToday] = useState([]);
  const [dataSales, setDataSales] = useState([]);

  useEffect(() => {
    dispatch(getTodayData({ date: new Date().toISOString().split("T")[0] }));
  }, [dispatch]);

  useEffect(() => {
    if (todayDataState) {
      const stateWiseIncomeData = [];
      const stateWiseSalesData = [];
      todayDataState.forEach((data) => {
        const [year, month, day] = data.date.split("-").map(Number);
        const formattedDate = `${month}/${day}`;

        stateWiseIncomeData.push({ type: formattedDate, value: data.earnings, label: "Income" });
        stateWiseSalesData.push({ type: formattedDate, value: data.invoiceCount, label: "Sales" });
      });

      setDataSales(stateWiseSalesData);
      setDataToday(stateWiseIncomeData);
    }
  }, [todayDataState]);

  const chartData = useMemo(
    () =>
      (todayDataState || []).map((data) => ({
        date: data.date,
        invoiceCount: data.invoiceCount,
        earnings: data.earnings,
      })),
    [todayDataState]
  );

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // Extract the latest paymentSummary from the summaryDataState array
  const latestPaymentSummary = summaryDataState && summaryDataState.length > 0 ? summaryDataState[0].paymentSummary : {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Welcome to Your Dashboard</h1>
        <h2>{today}</h2>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic title="Today's Income" value={dataToday.find((data) => data.label === "Income")?.value || 0} prefix="₹" />
            <Progress percent={summaryDataState && summaryDataState[0]?.invoiceCount ? (summaryDataState[0].invoiceCount / 100) * 100 : 0} strokeColor="#52c41a" showInfo={false} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
          <Statistic title="Today's Sales" value={dataSales.find((data) => data.label === "Sales")?.value || 0} />
          <Progress percent={summaryDataState && summaryDataState[0]?.invoiceCount ? (summaryDataState[0].invoiceCount / 100) * 100 : 0} strokeColor="#52c41a" showInfo={false} /> 
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic title="Total Profit" value={summaryDataState && summaryDataState[0]?.profit || 0} prefix="₹" valueStyle={{ color: "#1890ff" }} />
            <Progress percent={summaryDataState && summaryDataState[0]?.invoiceCount ? (summaryDataState[0].invoiceCount / 100) * 100 : 0} strokeColor="#52c41a" showInfo={false} /> 
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic title="Total Tax Collected" value={summaryDataState && summaryDataState[0]?.tax || 0} prefix="₹" valueStyle={{ color: "#faad14" }} />
            <Progress percent={summaryDataState && summaryDataState[0]?.invoiceCount ? (summaryDataState[0].invoiceCount / 100) * 100 : 0} strokeColor="#52c41a" showInfo={false} /> 
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Sales Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="invoiceCount" fill="#1890ff" name="Invoice Count" />
                <Bar dataKey="earnings" fill="#52c41a" name="Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Payment Summary Section */}
        <Col xs={24} md={12}>
          <Card className="custom-card" title="Payment Summary">
            <Row gutter={[20, 20]}>
              {Object.entries(latestPaymentSummary).map(([method, amount], index) => (
                <Col xs={24} sm={12} md={12} key={index}>
                  <Card className="custom-card" hoverable>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0 }}>{method}</h3>
                      <Statistic value={`₹${amount}`} valueStyle={{ color: "#333", fontSize: "16px" }} />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;