import React, { useEffect } from "react";
import { Table, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAllGoods } from "../../features/inventory/inventorySlice";

const GoodsTable = () => {
  const dispatch = useDispatch();

  // Select goods from Redux store
  const { goods, isLoading } = useSelector((state) => state.inventory);
  useEffect(() => {
    dispatch(getAllGoods());
  }, [dispatch]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <div className="font-medium">{text}</div>,
    },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Received",
      dataIndex: "receivedCount",
      key: "receivedCount",
      sorter: (a, b) =>
        (Number(a.receivedCount) || 0) - (Number(b.receivedCount) || 0),
    },
    {
      title: "Handed In",
      dataIndex: "handInCount",
      key: "handInCount",
      sorter: (a, b) =>
        (Number(a.handInCount) || 0) - (Number(b.handInCount) || 0),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Goods</h2>
      </div>

      <Table
        dataSource={goods?.map((item) => ({ ...item, key: item._id }))}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 8 }}
        bordered
      />
    </div>
  );
};

export default GoodsTable;
