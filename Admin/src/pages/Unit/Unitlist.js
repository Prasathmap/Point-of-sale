import React, { useEffect, useState } from "react";
import { Table,Button } from "antd";
import { BiEdit } from "react-icons/bi";
import { PlusOutlined } from '@ant-design/icons';
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAUnit,
  getUnits,
  resetState,
} from "../../features/unit/unitSlice";
import CustomModal from "../../components/CustomModal";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Name",
    dataIndex: "name",
    sorter: (a, b) => a.name.length - b.name.length,
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const Unitlist = () => {
  const [open, setOpen] = useState(false);
  const [unitId, setunitId] = useState("");
  const showModal = (e) => {
    setOpen(true);
    setunitId(e);
  };

  const hideModal = () => {
    setOpen(false);
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetState());
    dispatch(getUnits());
  }, []);
  const unitState = useSelector((state) => state.unit.units);
  const data1 = [];
  for (let i = 0; i < unitState.length; i++) {
    data1.push({
      key: i + 1,
      name: unitState[i].title,
      action: (
        <>
          <Link
            to={`/admin/unit/${unitState[i]._id}`}
            className=" fs-3 text-danger"
          >
            <BiEdit />
          </Link>
          <button
            className="ms-3 fs-3 text-danger bg-transparent border-0"
            onClick={() => showModal(unitState[i]._id)}
          >
            <AiFillDelete />
          </button>
        </>
      ),
    });
  }
  const deleteUnit = (e) => {
    dispatch(deleteAUnit(e));

    setOpen(false);
    setTimeout(() => {
      dispatch(getUnits());
    }, 100);
  };
  return (
    <div>
      <h3 className="mb-4 title">Units</h3>
      <Link to="/admin/unit">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            shape="round"
            className="hover:scale-105 transition-transform duration-200"
          >
            Add Unit
          </Button>
        </Link>
      <div>
        <Table columns={columns} dataSource={data1} />
      </div>
      <CustomModal
        hideModal={hideModal}
        open={open}
        performAction={() => {
          deleteUnit(unitId);
        }}
        title="Are you sure you want to delete this Unit?"
      />
    </div>
  );
};

export default Unitlist;
