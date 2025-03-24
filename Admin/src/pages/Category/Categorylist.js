import React, { useEffect, useState } from "react";
import { Table,Button } from "antd";
import { BiEdit } from "react-icons/bi";
import { PlusOutlined } from '@ant-design/icons';
import { AiFillDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteAProductCategory,
  getCategories,
  resetState,
} from "../../features/pcategory/pcategorySlice";
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
    title: "Subcategories",
    dataIndex: "subcategories",
    render: (subcategories) => (
      <ul style={{ paddingLeft: "20px", margin: 0 }}>
        {subcategories.length > 0 ? (
          subcategories.map((subcat, index) => (
            <li key={index}>{subcat.title || "Unnamed Subcategory"}</li>
          ))
        ) : (
          <span>No Subcategories</span>
        )}
      </ul>
    ),
  },
    {
    title: "Action",
    dataIndex: "action",
  },
];

const Categorylist = () => {
  const [open, setOpen] = useState(false);
  const [pCatId, setpCatId] = useState("");
  const showModal = (e) => {
    setOpen(true);
    setpCatId(e);
  };

  const hideModal = () => {
    setOpen(false);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetState());
    dispatch(getCategories());
  }, []);

  const pCatStat = useSelector((state) => state.pCategory.pCategories);

  const data1 = [];
  for (let i = 0; i < pCatStat.length; i++) {
    data1.push({
      key: i + 1,
      name: pCatStat[i].title,
      subcategories: pCatStat[i].subcategories || [],
      action: (
        <>
          <Link
            to={`/admin/category/${pCatStat[i]._id}`}
            className=" fs-3 text-danger"
          >
            <BiEdit />
          </Link>
          <button
            className="ms-3 fs-3 text-danger bg-transparent border-0"
            onClick={() => showModal(pCatStat[i]._id)}
          >
            <AiFillDelete />
          </button>
        </>
      ),
    });
  }

  const deleteCategory = (e) => {
    dispatch(deleteAProductCategory(e));
    setOpen(false);
    setTimeout(() => {
      dispatch(getCategories());
    }, 100);
  };

  return (
    <div>
      <h3 className="mb-4 title">Categories</h3>
      <Link to="/admin/category">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            shape="round"
            className="hover:scale-105 transition-transform duration-200"
          >
            Add Category
          </Button>
        </Link>
      <div>
        <Table columns={columns} dataSource={data1} />
      </div>
      <CustomModal
        hideModal={hideModal}
        open={open}
        performAction={() => {
          deleteCategory(pCatId);
        }}
        title="Are you sure you want to delete this Product Category?"
      />
    </div>
  );
};

export default Categorylist;
