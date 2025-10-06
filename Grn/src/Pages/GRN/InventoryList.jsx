import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Empty, Modal, Button, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import Barcode from 'react-barcode';
import { useDispatch, useSelector } from 'react-redux';
import { getInventories } from '../../features/inventory/inventorySlice';
import generateInvoiceForPrint from '../../components/PrintLayout';
import { getProfiles } from "../../features/auth/authSlice";


const { Title } = Typography;

const InventoryTable = () => {
  const dispatch = useDispatch();
  const inventories = useSelector((state) => state.inventory.inventories);
  const profile = useSelector((state) => state?.auth?.profiles || []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedGrn, setSelectedGrn] = useState(null);

  useEffect(() => {
    dispatch(getInventories());
    dispatch(getProfiles());
  }, [dispatch]);

  const showProductModal = (record) => {
    setSelectedGrn(record);
    setSelectedProducts(record.items || []);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProducts([]);
    setSelectedGrn(null);
  };

  const columns = [
    {
      title: 'GRN No',
      dataIndex: 'grnno',
      key: 'grnno',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'purchase' ? 'blue' : 'green'} className="capitalize">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'Supplier',
      key: 'supplier',
      render: (supplier) => supplier || '-',
      width: 150,
    },
    {
      title: 'Supplier Note',
      dataIndex: 'Suppliernote',
      key: 'note',
      render: (note) => note || '-',
    },
    {
      title: 'Reciver Note',
      dataIndex: 'Receivernote',
      key: 'note',
      render: (note) => note || '-',
    },
     {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status || '-',
    },
   
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => showProductModal(record)}></Button>
          <Button type="link" icon={<EditOutlined />}  />
          <Button type="link" danger icon={<DeleteOutlined />}  />
        
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => generateInvoiceForPrint(record,profile)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <Title level={4} className="mb-4 text-center">Inventory List</Title>

      {(!inventories || inventories.length === 0) ? (
        <Empty description="No inventory data available" style={{ padding: '40px 0' }} />
      ) : (
        <Table
          columns={columns}
          dataSource={inventories}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1300 }}
          bordered
          size="middle"
        />
      )}

      <Modal
        title={`Products for GRN: ${selectedGrn?.grnno}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
        bodyStyle={{ padding: '16px' }}
      >
        <Table
          dataSource={selectedProducts}
          rowKey={(record, idx) => idx}
          pagination={false}
          size="small"
          bordered
          columns={[
            {
              title: 'Product',
              dataIndex: 'title',
              key: 'title',
              render: (text, item) => text || item.productId,
            },
            {
              title: 'Category',
              dataIndex: 'category',
              key: 'category',
            },
            {
              title: 'Subcategory',
              dataIndex: 'subcategory',
              key: 'subcategory',
              render: (text) => text || '-',
            },
            {
              title: 'Qty',
              dataIndex: 'quantity',
              key: 'quantity',
            },
            {
              title: 'Price',
              dataIndex: 'price',
              key: 'price',
              render: (price) => `₹${price?.toFixed(2) || '0.00'}`,
            },
            {
              title: 'Barcode',
              key: 'barcode',
              render: (item) => (
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                  <Barcode
                    value={item.productId}
                    height={40}
                    width={1.2}
                    displayValue={false}
                    background="#fff"
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default InventoryTable;
