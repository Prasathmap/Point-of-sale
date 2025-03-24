import React, { useEffect, useState } from "react";
import { Table,Button } from "antd";
import { BiEdit } from "react-icons/bi";
import { PlusOutlined } from '@ant-design/icons';
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAAttender,
  getAttenders,
  resetState,
} from "../../features/attender/attenderSlice";
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
    title: "Employee code ",
    dataIndex: "empcode",
  },
  {
    title: "Phone ",
    dataIndex: "phone",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const Attenderlist = () => {
  const [open, setOpen] = useState(false);
  const [attenderId, setattenderId] = useState("");
  const showModal = (e) => {
    setOpen(true);
    setattenderId(e);
  };

  const hideModal = () => {
    setOpen(false);
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetState());
    dispatch(getAttenders());
  }, []);
  const attenderState = useSelector((state) => state.attender.attenders);
  const data1 = [];
  for (let i = 0; i < attenderState.length; i++) {
    data1.push({
      key: i + 1,
      name: attenderState[i].title,
      empcode: attenderState[i].empcode,
      phone: attenderState[i].phone,
      action: (
        <>
          <Link
            to={`/admin/attender/${attenderState[i]._id}`}
            className=" fs-3 text-danger"
          >
            <BiEdit />
          </Link>
          <button
            className="ms-3 fs-3 text-danger bg-transparent border-0"
            onClick={() => showModal(attenderState[i]._id)}
          >
            <AiFillDelete />
          </button>
        </>
      ),
    });
  }
  const deleteAttender = (e) => {
    dispatch(deleteAAttender(e));

    setOpen(false);
    setTimeout(() => {
      dispatch(getAttenders());
    }, 100);
  };
  return (
    <div>
      <h3 className="mb-4 title">Attender</h3>
      <Link to="/admin/attender">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            shape="round"
            className="hover:scale-105 transition-transform duration-200"
          >
            Add Attender
          </Button>
        </Link>
      <div>
        <Table columns={columns} dataSource={data1} />
      </div>
      <CustomModal
        hideModal={hideModal}
        open={open}
        performAction={() => {
          deleteAttender(attenderId);
        }}
        title="Are you sure you want to delete this Attender?"
      />
    </div>
  );
};

export default Attenderlist;
