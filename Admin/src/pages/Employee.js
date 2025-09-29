import React, { useEffect, useState } from "react";
import { Table, Button, Card, Form, Input, Modal, message, Space, Switch } from "antd";
import { BiEdit, BiPlusCircle } from "react-icons/bi";
import { AiFillDelete, AiOutlineSearch } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createEmployee,
  getAEmployee,
  getEmployees,
  resetState,
  updateEmployee,
  deleteEmployee,
  getstatus,
} from "../features/employee/employeeSlice";

const employeeSchema = yup.object().shape({
  title: yup.string()
    .required("Employee name is required")
    .min(3, "Employee name must be at least 3 characters"),
  empcode: yup.string()
    .required("Employee code is required")
    .matches(/^[A-Za-z0-9]+$/, "Only alphanumeric characters allowed"),
  phone: yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),
});

const EmployeeManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentAttenderId, setCurrentAttenderId] = useState(null);
  const [attenderToDelete, setAttenderToDelete] = useState("");
  const [searchText, setSearchText] = useState("");

  const employeeState = useSelector((state) => state.employee);
  const {
    employees = [],
    isSuccess,
    isError,
    isLoading,
    message: errorMessage,
    createdEmployee,
    updatedEmployee,
    employeeName,
    empcode,
    phone
  } = employeeState;

  // Filter employees based on search
  const filteredAttenders = employees.filter(attender =>
    attender.title.toLowerCase().includes(searchText.toLowerCase()) ||
    attender.empcode.toLowerCase().includes(searchText.toLowerCase()) ||
    attender.phone.includes(searchText)
  );

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdEmployee) {
      message.success("Employee added successfully!");
      handleCloseModal();
      dispatch(getEmployees());
    }
    if (isSuccess && updatedEmployee) {
      message.success("Employee updated successfully!");
      handleCloseModal();
      dispatch(getEmployees());
    }
   if (isError && errorMessage) {
    message.error(errorMessage); // ✅ Display real error message
  }
  }, [isSuccess, isError, createdEmployee, updatedEmployee,errorMessage, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: employeeName || "",
      empcode: empcode || "",
      phone: phone || ""
    },
    validationSchema: employeeSchema,
    onSubmit: (values) => {
      if (currentAttenderId) {
        const data = { id: currentAttenderId, employeeData: values };
        dispatch(updateEmployee(data));
      } else {
        dispatch(createEmployee(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentAttenderId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentAttenderId(id);
    dispatch(getAEmployee(id));
    setIsModalVisible(true);
  };
const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getEmployees());
      })
      .catch(() => {
        message.error("Failed to update status");
      });
  };
  const handleCloseModal = () => {
    formik.resetForm();
    setIsModalVisible(false);
    setCurrentAttenderId(null);
    dispatch(resetState());
  };

  const showDeleteModal = (id) => {
    setAttenderToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    dispatch(deleteEmployee(attenderToDelete));
    setDeleteModalVisible(false);
    message.success("Attender deleted successfully!");
    dispatch(getEmployees());
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setAttenderToDelete("");
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
      fixed: 'left',
      sorter: (a, b) => a.key - b.key
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: "Employee Code",
      dataIndex: "empcode",
      sorter: (a, b) => a.empcode.localeCompare(b.empcode),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
          title: "Status",
          dataIndex: "toggle",
          render: (_, record) => (
            <Switch
              checked={!record.status}
              onChange={() => handleToggleStatus(record.id)}
            />
          ),
        },
    {
      title: "Actions",
      dataIndex: "action",
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<BiEdit  className=" fs-3 text-primary"/>} 
            onClick={() => showEditModal(record.id)}
            className="text-blue-500"
          />
          <Button 
            type="text" 
            danger 
            icon={<AiFillDelete className=" fs-3 text-danger"/>} 
            onClick={() => showDeleteModal(record.id)}
          />
        </Space>
      ),
    },
  ];

  const dataSource = filteredAttenders.map((employee, index) => ({
    key: index + 1,
    id: employee._id,
    name: employee.title,
    empcode: employee.empcode,
    phone: employee.phone,
    status: !employee.status,
  }));

  return (
    <div>
    <div className="mb-6">
     <h3 className="mb-4 title">Employee</h3>
   </div>

      <Card 
        bordered={false}
        className="shadow-sm"
        extra={
          <Space>
            <Input
              placeholder="Search Employee..."
              prefix={<AiOutlineSearch />}
              style={{ width: 200 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<BiPlusCircle />}
              onClick={showAddModal}
            >
              Add Employee
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={currentAttenderId ? "Edit" : "Add"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Employee Name"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Employee name"
            />
          </Form.Item>
          
          <Form.Item
            label="Employee Code"
            validateStatus={formik.touched.empcode && formik.errors.empcode ? "error" : ""}
            help={formik.touched.empcode && formik.errors.empcode}
          >
            <Input
              name="empcode"
              value={formik.values.empcode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter employee code"
            />
          </Form.Item>
          
          <Form.Item
            label="Phone Number"
            validateStatus={formik.touched.phone && formik.errors.phone ? "error" : ""}
            help={formik.touched.phone && formik.errors.phone}
          >
            <Input
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter phone number"
            />
          </Form.Item>

          <Form.Item className="text-right">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
            >
              {currentAttenderId ? 'Update' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this Employee?</p>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;