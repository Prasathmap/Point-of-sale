import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { useDispatch, useSelector } from "react-redux";
import {
  getMonthlyData,
  getYearlyData,
  getTodayData,
} from "../features/auth/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();

  // Redux state
  const monthlyDataState = useSelector((state) => state?.auth?.monthlyData);
  const yearlyDataState = useSelector((state) => state?.auth?.yearlyData);
  const todayDataState = useSelector((state) => state?.auth?.todayData);

  const [dataMonthly, setDataMonthly] = useState([]);
  const [dataMonthlySales, setDataMonthlySales] = useState([]);
  const [thisMonthIncome, setThisMonthIncome] = useState([]);
  const [thisMonthSales, setThisMonthSales] = useState([]);
  const [dataYearly, setDataYearly] = useState([]);
  const [dataToday, setDataToday] = useState([]);
  const [dataSales, setDataSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch token
  const getAuthToken = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).token : "";
  };

  // Generate reusable chart config
  const generateChartConfig = (data, yFieldAlias) => ({
    data,
    xField: "type",
    yField: "value", // Use 'value' instead of 'income'
    color: () => "blue",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 1,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: { alias: "Data"  },
      sales: { alias: yFieldAlias },
    },
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = getAuthToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const config = { headers };

      await Promise.all([
        dispatch(getMonthlyData(config)),
        dispatch(getYearlyData(config)),
        dispatch(getTodayData(config)),
      ]);
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

// Process yearly data
useEffect(() => {
  if (yearlyDataState) {
    const yearlyData = yearlyDataState.map((element) => ({
      type: element._id?.year || "Unknown Year",
      value: element.GrandtotalAmount || 0,
    }));
    setDataYearly(yearlyData);
  }
}, [yearlyDataState]);

// Process today's data
useEffect(() => {
  if (todayDataState) {
    const stateWiseIncomeData = [];
    const stateWiseSalesData = [];
    const todayDate = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });

    todayDataState.forEach((data) => {
      const [year, month, day] = data.date.split("-").map(Number);
      const formattedDate = `${month < 10 ? "0" + month : month}/${day < 10 ? "0" + day : day}`;

      // Add income data
      stateWiseIncomeData.push({
        type: formattedDate,
        value: data.earnings,
        label: "Income",
      });

      // Add sales data
      stateWiseSalesData.push({
        type: formattedDate,
        value: data.invoiceCount,
        label: "Sales",
      });
    });

    // Get today's sales data
    const todaySales = todayDataState.find(
      (data) => data.date === new Date().toISOString().split("T")[0]
    );

    if (todaySales) {
      stateWiseSalesData.push({
        type: todayDate,
        value: todaySales.invoiceCount,
        label: "Sales",
      });
      stateWiseIncomeData.push({
        type: todayDate,
        value: todaySales.earnings,
        label: "Income",
      });
    }

    // Now, update the state for both sales and income
    setDataSales(stateWiseSalesData);
    setDataToday(stateWiseIncomeData);
  }
}, [todayDataState]);

// Process monthly data
  useEffect(() => {
    if (monthlyDataState) {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const currentYearMonth = `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`;
  
      const incomeData = [];
      const salesData = [];
      let incomeThisMonth = 0;
      let salesThisMonth = 0;
  
      monthlyDataState.forEach((element) => {
        const [year, month] = element._id.split("-").map(Number);
        const monthIndex = month - 1; // Convert month (1-12) to array index (0-11)
        const income = element.GrandtotalAmount || 0;
        const sales = element.count || 0;
  
        incomeData.push({
          type: monthNames[monthIndex],
          value: income,
        });
  
        salesData.push({
          type: monthNames[monthIndex],
          value: sales,
        });
  
        if (element._id === currentYearMonth) {
          incomeThisMonth = income;
          salesThisMonth = sales;
        }
      });
  
      setDataMonthly(incomeData);
      setDataMonthlySales(salesData);
      setThisMonthIncome(incomeThisMonth);
      setThisMonthSales(salesThisMonth);
    }
  }, [monthlyDataState]);
  
  // Show loading spinner
  if (loading) {
    return 
  }

  return (
    <div>
      <h3 className="mb-4 title">Dashboard</h3>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div className="d-flex p-3 justify-content-between align-items-end flex-grow-1 bg-white rounded-3">
          <div>
            <p className="desc">Total Income({yearlyDataState && yearlyDataState[0]?._id?.year})</p>
            <h4 className="mb-0 sub-title">
              Rs.{yearlyDataState && yearlyDataState[0]?.GrandtotalAmount} 
            </h4>

          </div>
        </div>
        <div className="d-flex p-3 justify-content-between align-items-end flex-grow-1 bg-white rounded-3">
          <div>
            <p className="desc">Total Sales</p>
            <h4 className="mb-0 sub-title">
              {yearlyDataState && yearlyDataState[0]?.count}
            </h4>
          </div>
        </div>
        
        <div className="d-flex p-3 justify-content-between align-items-end flex-grow-1 bg-white rounded-3">
          <div>
            <p className="desc">This Month's Income</p>
            <h4 className="mb-0 sub-title">Rs.{thisMonthIncome}</h4>
          </div>
        </div>
        <div className="d-flex p-3 justify-content-between align-items-end flex-grow-1 bg-white rounded-3">
          <div>
            <p className="desc">This Month's Sales</p>
            <h4 className="mb-0 sub-title">{thisMonthSales}</h4>
          </div>
        </div>
        <div className="d-flex p-3 justify-content-between align-items-end flex-grow-1 bg-white rounded-3">
          <div>
            <p className="desc">Today's Income</p>
            <h4 className="mb-0 sub-title">
              {dataToday.find(
                (data) =>
                  data.type === new Date().toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                  }) && data.label === "Income"
              )?.value || 0}
            </h4>

          </div>
        </div>
        <div className="d-flex p-3 justify-content-between align-items-end flex-grow-1 bg-white rounded-3">
          <div>
            <p className="desc">Today's Sales</p>
            <h4 className="mb-0 sub-title">
            {
                dataSales.find(
                  (data) =>
                    data.type === new Date().toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                    }) && data.label === "Sales"
                )?.value || "0"
              }
            </h4>
          </div>
        </div>
      </div>
    
   <div className="d-flex justify-content-between gap-4" style={{padding: "20px",}}>
  {/* Card for Total Income in the Last Year */}
  <div className="card" style={{ width: "23%", height:"350px", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
    <h3 className="mb-4 title" style={{ fontSize: "1.2rem", color: "#4e73df" }}>Income in Last Year from Today</h3>
    <Column
        {...generateChartConfig(dataYearly, "Income")}
      color="#4e73df"  // Customize chart color
    />
  </div>

  {/* Card for Sales in the Last Year */}
  <div className="card" style={{ width: "23%",height:"350px", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
    <h3 className="mb-4 title" style={{ fontSize: "1.2rem", color: "#1cc88a" }}>Monthly Sales</h3>
    <Column
     {...generateChartConfig(dataMonthly, "Income")}

      color="#1cc88a"  // Customize chart color
    />
  </div>

  {/* Card for Additional Sales Data */}
  <div className="card" style={{ width: "23%",height:"350px", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
    <h3 className="mb-4 title" style={{ fontSize: "1.2rem", color: "#36b9cc" }}>Monthly Sales Data</h3>
    <Column
    {...generateChartConfig(dataMonthlySales, "Sales")}
      color="#36b9cc"  // Customize chart color
    />
  </div>

  {/* Card for Another Sales Analysis */}
  <div className="card" style={{ width: "23%",height:"350px", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
    <h3 className="mb-4 title" style={{ fontSize: "1.2rem", color: "#f6c23e" }}>Daily income </h3>
    <Column
        {...generateChartConfig(dataToday)}
      color="#f6c23e"  // Customize chart color
    />
  </div>
  <div className="card" style={{ width: "23%",height:"350px", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
    <h3 className="mb-4 title" style={{ fontSize: "1.2rem", color: "#f6c23e" }}>Daily Sales </h3>
    <Column
        {...generateChartConfig(dataSales)}
      color="#f6c23e"  // Customize chart color
    />
  </div>
</div>


    </div>
  );
};

export default Dashboard;
