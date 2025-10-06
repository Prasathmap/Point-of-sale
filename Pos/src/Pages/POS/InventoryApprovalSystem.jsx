import { useEffect, useState } from 'react';
import { Table, message, Select, Modal, Button, Typography, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getInventories, approveInventory } from '../../features/inventory/inventorySlice';

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

const GrnApproval = () => {
  const dispatch = useDispatch();
  const inventory = useSelector((state) => state.inventory.inventories);

  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [receiverNote, setReceiverNote] = useState("");

  useEffect(() => {
    dispatch(getInventories());
  }, [dispatch]);

  // Confirm update with note
  const confirmStatusUpdate = async () => {
    try {
      await dispatch(
        approveInventory({
          id: selectedGRN._id,
          status: newStatus,
          Receivernote: receiverNote,
        })
      ).unwrap();
      message.success("Status updated successfully");
      setStatusModalVisible(false);
      setReceiverNote("");
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  // Open modal when status is changed
  const handleStatusChange = (record, value) => {
    setSelectedGRN(record);
    setNewStatus(value);
    setStatusModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedGRN(record);
    setModalVisible(true);
  };

  const columns = [
    { title: 'GRN No', dataIndex: 'grnno', key: 'grnno' },
    { title: 'Supplier', dataIndex: 'Supplier', key: 'Supplier' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Select
            value={record.status}
            style={{ width: 140, marginRight: 8 }}
            onChange={(value) => handleStatusChange(record, value)}
          >
            <Option value="pending" disabled>Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
          <Button type="link" onClick={() => handleView(record)}>View</Button>
        </>
      ),
    },
  ];

  const productColumns = [
    { title: 'Product', dataIndex: 'title', key: 'title' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Subcategory', dataIndex: 'subcategory', key: 'subcategory' },
    {
      title: 'Variant',
      dataIndex: ['variants', 0, 'variant'],
      key: 'variant',
    },
    {
      title: 'MRP',
      dataIndex: ['variants', 0, 'mrp'],
      key: 'mrp',
      render: (value) => `₹${value?.toFixed(2)}`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value) => `₹${value?.toFixed(2)}`,
    },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={inventory}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />

      {/* GRN Detail Modal */}
      <Modal
        title={`GRN Detail - ${selectedGRN?.grnno}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedGRN && (
          <>
            <Title level={5}>Supplier: {selectedGRN.Supplier}</Title>
            <Title level={5}>Status: {selectedGRN.status}</Title>
            {selectedGRN.Receivernote && (
              <Title level={5}>Receiver Note: {selectedGRN.Receivernote}</Title>
            )}
            <Table
              columns={productColumns}
              dataSource={selectedGRN.items}
              rowKey="_id"
              pagination={false}
              size="small"
            />
            <div style={{ marginTop: 16 }}>
              <Text strong>Subtotal: ₹{selectedGRN.subtotal.toFixed(2)}</Text><br />
              <Text strong>Tax: ₹{selectedGRN.taxprice.toFixed(2)}</Text><br />
              <Text strong>Grand Total: ₹{selectedGRN.grandTotal.toFixed(2)}</Text>
            </div>
          </>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        title={`Update Status for GRN ${selectedGRN?.grnno}`}
        visible={statusModalVisible}
        onOk={confirmStatusUpdate}
        onCancel={() => setStatusModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Status: <Text strong>{newStatus}</Text></p>
        <TextArea
          rows={3}
          placeholder="Enter Receiver note"
          value={receiverNote}
          onChange={(e) => setReceiverNote(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default GrnApproval;
