import React, { useEffect, useState } from "react";
import { Table,Button,Card,Form,Input,Modal,message,Tag,Space,Popconfirm,Tooltip,List,Row,Col,Switch } from "antd";
import { BiEdit,BiPlusCircle, BiTrash } from "react-icons/bi";
import { AiOutlineSearch, AiOutlinePlus } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createCategory,
  getAProductCategory,
  getCategories,
  resetState,
  updateAProductCategory,
  deleteAProductCategory,getstatus,SubcategoryStatus
} from "../../features/pcategory/pcategorySlice";

const categorySchema = yup.object().shape({
  title: yup.string().required("Category name is required"),
  subcategories: yup
    .array()
    .of(yup.string().required("Subcategory name is required"))
    .min(1, "At least one subcategory is required"),
});

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");

  const categoryState = useSelector((state) => state.pCategory);
  const {
    pCategories,
    categoryName,
    subcategory = [],
    isSuccess,
    isError,
    message: errorMessage ,
    isLoading,
    createdCategory,
    updatedCategory,
  } = categoryState;

  // Filter categories based on search
  const filteredCategories = pCategories.filter(category => 
    category.title.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdCategory) {
      message.success("Category added successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getCategories());
    }
    if (isSuccess && updatedCategory) {
      message.success("Category updated successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getCategories());
    }
    if (isError && errorMessage) {
        message.error(errorMessage); // ✅ Display real error message
      }
  }, [isSuccess, isError, isLoading, createdCategory, updatedCategory,errorMessage, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: categoryName || "",
      subcategories: subcategory.map(sub => sub.title) || [],
    },
    validationSchema: categorySchema,
    onSubmit: (values) => {
      if (currentCategoryId) {
        const data = { id: currentCategoryId, pCatData: values };
        dispatch(updateAProductCategory(data));
      } else {
        dispatch(createCategory(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentCategoryId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentCategoryId(id);
    dispatch(getAProductCategory(id));
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    formik.resetForm();
    setNewSubcategory("");
  };

  const handleDelete = (id) => {
    dispatch(deleteAProductCategory(id));
    message.success("Category deleted successfully!");
    dispatch(getCategories());
  };

  const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getCategories());
      })
      .catch(() => {
        message.error("Failed to update status");
      });
  }; 
  const addSubcategory = () => {
    const trimmedSub = newSubcategory.trim();
    if (!trimmedSub) {
      message.error("Subcategory cannot be empty!");
      return;
    }
    if (formik.values.subcategories.includes(trimmedSub)) {
      message.error("Subcategory already exists!");
      return;
    }
    formik.setFieldValue("subcategories", [...formik.values.subcategories, trimmedSub]);
    setNewSubcategory("");
    message.success("Subcategory added!");
  };

  const removeSubcategory = (index) => {
    const updated = [...formik.values.subcategories];
    updated.splice(index, 1);
    formik.setFieldValue("subcategories", updated);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <div className="font-medium">{text}</div>,
    },
    {
      title: "Category Status",
      dataIndex: "status",
      render: (status, record) => (
        <Switch
          checked={!record.status}
          onChange={() => handleToggleStatus(record._id)}
        />
      ),
    },
    {
      title: "Subcategories",
      dataIndex: "subcategories",
      render: (subcategories, category) => (
        <div style={{ maxWidth: 300 }}>
          {subcategories.length > 0 ? (
            <List
              size="small"
              dataSource={subcategories}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Switch
                    size="small"
                    checked={item.status}
                    onChange={() =>
                      dispatch(
                        SubcategoryStatus({
                          categoryId: category._id,
                          subcategoryIndex: index,
                        })
                      )
                    }
                   
                  />
                  ,
                  ]}
                >
                  <Tag color="blue">{item.title || item}</Tag>
                </List.Item>
              )}
            />
          ) : (
            <Tag color="orange">No subcategories</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "action",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<BiEdit className="fs-3 text-primary" />}
              onClick={() => showEditModal(record._id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<BiTrash className="fs-3 text-danger" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
    
  const dataSource = filteredCategories.map((category, index) => ({
    ...category,
    key: index + 1,
    name: category.title,
    subcategories: category.subcategories || [],
    status: !category.status,
    _id: category._id
  }));

  return (
    <div>
       <div className="mb-6">
        <h3 className="mb-4 title">Categories</h3>
      </div>

      <Card 
        title="Categories" 
        bordered={false} 
        className="shadow-lg"
        extra={
          <Space>
            <Input
              placeholder="Search categories..."
              prefix={<AiOutlineSearch />}
              style={{ width: 250 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<BiPlusCircle />}
              onClick={showAddModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Category
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`
          }}
        />
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        title={currentCategoryId ? "Edit Category" : "Add New Category"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Category Name"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter category name"
            />
          </Form.Item>

          <Form.Item
            label="Subcategories"
            validateStatus={formik.touched.subcategories && formik.errors.subcategories ? "error" : ""}
            help={formik.touched.subcategories && formik.errors.subcategories}
          >
            <div className="mb-4">
              <Row gutter={16}>
                <Col flex="auto">
                  <Input
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="Enter subcategory name"
                  />
                </Col>
                <Col>
                  <Button 
                    icon={<AiOutlinePlus />} 
                    onClick={addSubcategory}
                  >
                    Add
                  </Button>
                </Col>
              </Row>
            </div>

            {formik.values.subcategories.length > 0 ? (
              <List
                size="small"
                bordered
                dataSource={formik.values.subcategories}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        danger 
                        type="text" 
                        icon={<BiTrash />} 
                        onClick={() => removeSubcategory(index)}
                      />
                    ]}
                  >
                    {item}
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center text-gray-500 py-2">
                No subcategories added yet
              </div>
            )}
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentCategoryId ? 'Update Category' : 'Add Category'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;