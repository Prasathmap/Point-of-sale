import React, { useEffect, useState } from "react";
import { Table,Button } from "antd";
import { BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { PlusOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteATax,
  getTaxs,
  resetState,
} from "../../features/tax/taxSlice";
import CustomModal from "../../components/CustomModal";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Tax(%)",
    dataIndex: "name",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const Taxlist = () => {
  const [open, setOpen] = useState(false);
  const [taxId, settaxId] = useState("");
  const showModal = (e) => {
    setOpen(true);
    settaxId(e);
  };

  const hideModal = () => {
    setOpen(false);
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetState());
    dispatch(getTaxs());
  }, []);
  const taxState = useSelector((state) => state.tax.taxs);
  const data1 = [];
  for (let i = 0; i < taxState.length; i++) {
    data1.push({
      key: i + 1,
      name: taxState[i].title,
      action: (
        <>
          <Link
            to={`/admin/tax/${taxState[i]._id}`}
            className=" fs-3 text-danger"
          >
            <BiEdit />
          </Link>
          <button
            className="ms-3 fs-3 text-danger bg-transparent border-0"
            onClick={() => showModal(taxState[i]._id)}
          >
            <AiFillDelete />
          </button>
        </>
      ),
    });
  }
  const deleteTax = (e) => {
    dispatch(deleteATax(e));

    setOpen(false);
    setTimeout(() => {
      dispatch(getTaxs());
    }, 100);
  };
  return (
    <div>
      <h3 className="mb-4 title">Taxs</h3>
       <Link to="/admin/tax">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  shape="round"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Add Tax
                </Button>
              </Link>
      <div>
        <Table columns={columns} dataSource={data1} />
      </div>
      <CustomModal
        hideModal={hideModal}
        open={open}
        performAction={() => {
          deleteTax(taxId);
        }}
        title="Are you sure you want to delete this tax?"
      />
    </div>
  );
};

export default Taxlist;
