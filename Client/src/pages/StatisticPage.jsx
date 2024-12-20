import Header from "../components/header/Header";
import StatisticCard from "../components/statistic/StatisticCard";
import React, { useState, useEffect } from "react";
import { Column } from "@ant-design/plots"; 
import { Spin } from "antd";

const StatisticPage = () => {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [totalInvoiceCount, setTotalInvoiceCount] = useState(0);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [dailyData, setDailyData] = useState([]);  // Store daily data for the column chart

  // Fetching both products and invoices together
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, invoiceRes] = await Promise.all([
          fetch(process.env.REACT_APP_SERVER_URL + "/api/products/get-all"),
          fetch(process.env.REACT_APP_SERVER_URL + "/api/invoices/get-all"),
        ]);
  
        const [productData, invoiceData] = await Promise.all([
          productRes.json(),
          invoiceRes.json(),
        ]);
  
        setProducts(productData);
  
        // Process invoices to find unique entries and calculate earnings
        const dataMap = new Map();
        let totalInvoiceCount = 0; // Initialize total count variable
  
        invoiceData.forEach((item) => {
          const key = `${item.customerName}-${item.customerPhoneNumber}`;
          if (dataMap.has(key)) {
            dataMap.get(key).count += 1;
          } else {
            dataMap.set(key, { ...item, key: item._id, count: 1 });
          }
  
          // Increment total invoice count
          totalInvoiceCount += 1;
        });
  
        const uniqueData = Array.from(dataMap.values());
        setInvoices(uniqueData);
  
        // Update the state with the total invoice count
        setTotalInvoiceCount(totalInvoiceCount);
  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
   
  // Fetching earnings data for daily, weekly, and monthly periods
  useEffect(() => {
    const asyncFetch = async () => {
      try {
        // Fetch daily earnings data
        const dailyRes = await fetch(process.env.REACT_APP_SERVER_URL + "/api/invoices/daily");
        const dailyData = await dailyRes.json();
        
        console.log("API response:", dailyData);
        
        // Sort the daily data by date
        dailyData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get today's date
        const todayDate = new Date().toISOString().split('T')[0];
        console.log("Expected today's date:", todayDate);
        
        // Log each entry's date from the API response
        dailyData.forEach(entry => {
          console.log("Entry date from backend:", entry.date); // Check the date format here
        });
        
        // Try to find today's data
        const todayData = dailyData.find(entry => entry.date.split('T')[0] === todayDate.trim());

        // const todayData = dailyData.find(entry => entry.date === todayDate.trim());
        
        console.log("Today's data:", todayData);
        
        // If today's data exists, set the earnings, otherwise default to 0
        setDailyEarnings(todayData ? todayData.earnings : 0);
        
        // Update the daily data for rendering the chart
        setDailyData(dailyData.map(entry => ({
          date: entry.date === todayDate ? "Today" : entry.date,
          earnings: entry.earnings,
          invoiceCount: entry.invoiceCount || 0,
        })));
        

        // Fetch weekly earnings data
        const weeklyRes = await fetch(process.env.REACT_APP_SERVER_URL + "/api/invoices/weekly");
        const weeklyData = await weeklyRes.json();
        setWeeklyEarnings(weeklyData.weekly || 0);
        
        // Fetch monthly earnings data
        const monthlyRes = await fetch(process.env.REACT_APP_SERVER_URL + "/api/invoices/monthly");
        const monthlyData = await monthlyRes.json();
        setMonthlyEarnings(monthlyData.totalEarnings || 0);

      } catch (error) {
        console.error("Error fetching earnings data:", error);
      }
    };
    asyncFetch();
  }, []);
  
  // Column chart configuration for daily earnings
  const earningsColumnConfig = {
    data: dailyData,
    xField: 'date',  // X-axis: Date (for today)
    yField: 'earnings',  // Y-axis: Earnings
    label: {
      position: 'middle',     // Display the value in the middle of the bar
      style: {
        fill: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
      },
    },
    xAxis: {
      title: {
        text: 'Date',
        style: {
          fontSize: 14,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Earnings (₹)',
        style: {
          fontSize: 14,
        },
      },
    },
  };

  // Column chart configuration for invoice count
  const invoiceColumnConfig = {
    data: dailyData,
    xField: 'date',  // X-axis: Date
    yField: 'invoiceCount',  // Y-axis: Invoice Count
    label: {
      position: 'middle',  // Display the value in the middle of the bar
      style: {
        fill: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
      },
    },
    xAxis: {
      title: {
        text: 'Date',
        style: {
          fontSize: 14,
        },
      },
    },
    yAxis: {
      title: {
        text: 'Sales Count',
        style: {
          fontSize: 14,
        },
      },
    },
  };

  return (
    <>
      <Header />
      {invoices.length > 0 ? (
        <div className="px-6 md:pb-0 pb-20">
          {/* Header */}
          <h1 className="text-4xl text-center font-bold mb-4">Statistics</h1>

          {/* Statistics Cards */}
          <div>
            <div className="statistic-cards grid xl:grid-cols-6 md:grid-cols-2 sm:grid-cols-1 my-10 gap-4 md:gap-10">
              <StatisticCard
                title="Total Customers"
                amount={invoices.length}
                image="images/user.png"
              />
              <StatisticCard
                title="Today Income"
                amount={`₹ ${dailyEarnings.toFixed(2)}`}
                image="images/money.png"
              />
              <StatisticCard
                title="Total Earnings (Weekly)"
                amount={`₹ ${weeklyEarnings.toFixed(2)}`}
                image="images/money.png"
              />
              <StatisticCard
                title="Total Earnings (Monthly)"
                amount={`₹ ${monthlyEarnings.toFixed(2)}`}
                image="images/money.png"
              />
            <StatisticCard
                title="Total Sales"
                amount={totalInvoiceCount}  // Displaying the total invoice count
                image="images/sale.png"  // You can use an appropriate image here
              />
              <StatisticCard
                title="Total Product"
                amount={products.length}
                image="images/product.png"
              />
            </div>

            {/* Charts Section */}
            <div className="flex flex-col lg:flex-row justify-between gap-10 md:p-10 p-4">
              {/* Daily Earnings Chart */}
              <div className="lg:w-1/2 w-full h-72">
                <Column {...earningsColumnConfig} />
              </div>

              {/* Invoice Count Chart */}
              <div className="lg:w-1/2 w-full h-72">
                <Column {...invoiceColumnConfig} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      )}
    </>
  );
};

export default StatisticPage;
