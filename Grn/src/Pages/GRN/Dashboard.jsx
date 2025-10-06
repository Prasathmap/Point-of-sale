import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Tag, Space, Statistic, Row, Col, Alert, Progress, Typography, Spin, Divider } from 'antd';
import { WarningOutlined, ShoppingOutlined } from '@ant-design/icons';
import { getInventories } from '../../features/inventory/inventorySlice';

const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { inventories, loading } = useSelector((state) => state.inventory);
  const [productMap, setProductMap] = useState(new Map());

  useEffect(() => {
    dispatch(getInventories());
  }, [dispatch]);

  // Process inventory data to aggregate product quantities across all GRNs
  useEffect(() => {
    if (inventories && inventories.length > 0) {
      const newProductMap = new Map();
      
      // Process each GRN
      inventories.forEach(grn => {
        if (grn.items && Array.isArray(grn.items)) {
          grn.items.forEach(item => {
            const key = `${item.productId}-${item.variants && item.variants[0] ? item.variants[0].variant : 'default'}`;
            
            if (newProductMap.has(key)) {
              const existing = newProductMap.get(key);
              existing.totalQuantity += item.quantity;
              existing.grnCount += 1;
              existing.grnReferences.push({
                grnno: grn.grnno,
                date: grn.createdAt,
                quantity: item.quantity
              });
            } else {
              newProductMap.set(key, {
                id: item.productId,
                key: key,
                title: item.title,
                category: item.category,
                variant: item.variants && item.variants[0] ? item.variants[0].variant : 'N/A',
                price: item.price,
                totalQuantity: item.quantity,
                minRequired: 15, // Set a minimum required threshold
                grnCount: 1,
                grnReferences: [{
                  grnno: grn.grnno,
                  date: grn.createdAt,
                  quantity: item.quantity
                }]
              });
            }
          });
        }
      });
      
      setProductMap(newProductMap);
    }
  }, [inventories]);

  // Convert product map to array for easier processing
  const productData = useMemo(() => {
    return Array.from(productMap.values());
  }, [productMap]);

  // 🔎 Filter low stock products
  const lowQuantityProducts = useMemo(() => {
    return productData.filter((item) => item.totalQuantity < item.minRequired);
  }, [productData]);

  // 📊 Stats Calculation
  const stats = useMemo(() => {
    const dangerItems = productData.filter(
      (item) => item.totalQuantity < item.minRequired * 0.3
    );
    
    const nearDangerItems = productData.filter(
      (item) =>
        item.totalQuantity >= item.minRequired * 0.3 &&
        item.totalQuantity < item.minRequired
    );

    // Calculate value at risk (products with less than 5 in stock)
    const productsInDanger = productData.filter(item => item.totalQuantity < 5);
    const valueAtRisk = productsInDanger.reduce((acc, item) => 
      acc + (item.price * item.totalQuantity), 0
    );

    // Count products with stock > 5
    const healthyProductsCount = productData.filter(item => item.totalQuantity >= 5).length;

    // Calculate total inventory value
    const totalInventoryValue = productData.reduce((acc, item) => 
      acc + (item.price * item.totalQuantity), 0
    );

    return {
      totalProducts: productData.length,
      totalDangerItems: dangerItems.length,
      valueAtRisk: valueAtRisk,
      nearDangerItems: nearDangerItems.length,
      healthyProductsCount: healthyProductsCount,
      productsInDangerCount: productsInDanger.length,
      totalInventoryValue: totalInventoryValue,
      totalGRNs: inventories.length,
    };
  }, [productData, inventories]);

  const dangerColumns = [
    {
      title: 'Product Name',
      dataIndex: 'title',
      key: 'name',
      render: (text, record) => (
        <Space>
          <WarningOutlined style={{ color: '#ff4d4f' }} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{record.variant}{record.unit}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Total Stock',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (text, record) => (
        <span style={{ color: text < record.minRequired * 0.3 ? '#ff4d4f' : text < record.minRequired ? '#faad14' : '#389e0d' }}>
          {text} units
        </span>
      ),
    },
    {
      title: 'Min Required',
      dataIndex: 'minRequired',
      key: 'minRequired',
    },
    {
      title: 'GRN Count',
      dataIndex: 'grnCount',
      key: 'grnCount',
      render: (count) => (
        <Tag color={count > 2 ? 'blue' : 'cyan'}>{count} GRNs</Tag>
      ),
    },
    {
      title: 'Stock Status',
      key: 'status',
      render: (_, record) => {
        const percent = Math.min(100, (record.totalQuantity / record.minRequired) * 100);
        let status = 'success';
        if (percent < 30) status = 'exception';
        else if (percent < 70) status = 'normal';
        
        return (
          <Progress
            percent={percent}
            status={status}
            showInfo={true}
            strokeColor={
              percent < 30 ? '#ff4d4f' : 
              percent < 70 ? '#faad14' : '#52c41a'
            }
          />
        );
      },
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => (
        <Text>₹{(record.price * record.totalQuantity).toFixed(2)}</Text>
      ),
    },
  ];


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Inventory Dashboard</Title>
      <Text type="secondary">Tracking products across multiple GRNs</Text>
      
      <Alert
        message={
          stats.totalDangerItems > 0
            ? `⚠️ Critical Alert: ${stats.totalDangerItems} products in danger zone (₹${stats.valueAtRisk.toLocaleString()} at risk)`
            : "✅ Inventory levels are safe"
        }
        type={stats.totalDangerItems > 0 ? "error" : "success"}
        showIcon
        style={{ marginBottom: 24, marginTop: 16 }}
      />

      <Row gutter={[16, 16]}>
        {/* Left Column: Inventory Value Breakdown */}
        <Col xs={24} md={12}>
          <Card title="Inventory Value Breakdown" bordered={false}>
            <Row gutter={[16, 16]}>
              {/* Progress & Details */}
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Stock Distribution</Title>
                  <Progress
                    percent={Math.round(
                      (stats.healthyProductsCount / stats.totalProducts) * 100
                    )}
                    status="active"
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    {stats.healthyProductsCount} of {stats.totalProducts} products well-stocked
                  </div>
                </div>

                <Divider />

                <div>
                  <Title level={5}>Risk Distribution</Title>
                  <Progress
                    percent={Math.round(
                      (stats.valueAtRisk / (stats.totalInventoryValue || 1)) * 100
                    )}
                    status="active"
                    strokeColor={{
                      "0%": "#ff4d4f",
                      "100%": "#ffa940",
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    ₹{stats.valueAtRisk.toFixed(2)} at risk of ₹{stats.totalInventoryValue.toFixed(2)} total value
                  </div>
                </div>
              </Col>

              {/* Total Inventory Value */}
              <Col xs={24} sm={12}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Title level={3}>Total Inventory Value</Title>
                  <Title level={1} style={{ color: "#1890ff", margin: 0 }}>
                    ₹{stats.totalInventoryValue.toFixed(2)}
                  </Title>
                  <Text type="secondary">across {stats.totalProducts} products</Text>
                </div>
              </Col>
             <Col></Col><br/>
            </Row>
          </Card>
        </Col>

        {/* Right Column: Stats Grid */}
        <Col xs={24} md={12}>
        <Card title="Inventory Value Breakdown" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Total Products"
                  value={stats.totalProducts}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Products in Danger"
                  value={stats.productsInDangerCount}
                  valueStyle={{ color: "#ff4d4f" }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Value at Risk"
                  prefix="₹"
                  value={stats.valueAtRisk}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Total GRNs"
                  value={stats.totalGRNs}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
        </Col>
      </Row>

      <Card 
        title="Product Inventory Overview" 
        bordered={false} 
        style={{ marginTop: 24 }}
        extra={<a href="#">View Detailed Report</a>}
      >
        <Table
          columns={dangerColumns}
          dataSource={productData}
          rowKey="key"
          loading={loading}
          pagination={{ pageSize: 5 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard;