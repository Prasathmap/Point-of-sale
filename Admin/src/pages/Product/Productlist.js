import React, { useEffect, useState } from "react";
import { Table, Button, Switch } from "antd";
import { BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { deleteAProduct, getProducts, blockAProduct, unblockAProduct } from "../../features/product/productSlice";
import { Link } from "react-router-dom";
import { delImg } from "../../features/upload/uploadSlice";
import CustomModal from "../../components/CustomModal";

const Productlist = () => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProducts());
  }, []);

  const productState = useSelector((state) => state?.product?.products);

  const showModal = (id) => {
    setOpen(true);
    setProductId(id);
  };

  const hideModal = () => {
    setOpen(false);
  };

  const deleteProduct = (id) => {
    dispatch(deleteAProduct(id));
    dispatch(delImg(id));
    setOpen(false);
    setTimeout(() => {
      dispatch(getProducts());
    }, 100);
  };

  const toggleProductStatus = (id, isBlocked) => {
    if (isBlocked) {
      dispatch(unblockAProduct(id));
    } else {
      dispatch(blockAProduct(id));
    }
    setTimeout(() => {
      dispatch(getProducts());
    }, 100);
  };

  const columns = [
    {
      title: "SNo",
      dataIndex: "key",
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.length - b.title.length,
    },
    {
      title: "Brand",
      dataIndex: "brand",
      sorter: (a, b) => a.brand.length - b.brand.length,
    },
    {
      title: "Category",
      dataIndex: "category",
      sorter: (a, b) => a.category.length - b.category.length,
    },
    {
      title: "SubCategory",
      dataIndex: "subcategory",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Tax",
      dataIndex: "tax",
    },
    {
      title: "Unit",
      dataIndex: "unit",
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Final Price",
      dataIndex: "finalprice",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => (
        <Switch
          checked={!record.isBlocked}
          onChange={() => toggleProductStatus(record.id, record.isBlocked)}
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
    },
  ];

  const data1 = productState.map((product, index) => ({
    key: index + 1,
    id: product._id,
    title: product.title,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    quantity: product.quantity,
    tax: product.tax,
    unit: product.unit,
    price: `${product.price}`,
    finalprice: `${product.finalPrice}`,
    isBlocked: product.isBlocked, // Assuming backend provides this field
    action: (
      <>
        <Link to={`/admin/product/${product._id}`} className="fs-3 text-success">
          <BiEdit />
        </Link>
        <button
          className="ms-3 fs-3 text-danger bg-transparent border-0"
          onClick={() => showModal(product._id)}
        >
          <AiFillDelete />
        </button>
      </>
    ),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4 w-full">
        <h3 className="title text-xl font-semibold text-gray-800">Products</h3>
        <Link to="/admin/product">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            shape="round"
            className="hover:scale-105 transition-transform duration-200"
          >
            Add Product
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={data1} />
      <CustomModal
        hideModal={hideModal}
        open={open}
        performAction={() => deleteProduct(productId)}
        title="Are you sure you want to delete this Product?"
      />
    </div>
  );
};

export default Productlist;
