import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Button, Input, Card, Row, Col, Typography } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const profileSchema = yup.object({
  userName: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]+$/, "Invalid phone number"),
  storename: yup.string().required("Store name is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  village: yup.string().required("Village is required"),
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^[0-9]{6}$/, "Invalid pincode"),
});

const ProfileDashboard = () => {
  const [editMode, setEditMode] = useState(false);

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      phone: "",
      storename: "",
      address: "",
      city: "",
      state: "",
      village: "",
      pincode: "",
    },
    validationSchema: profileSchema,
    onSubmit: (values) => {
      console.log("Profile updated:", values);
      setEditMode(false);
    },
  });

  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <Card bordered={false} style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <UserOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
          <Title level={3}>Profile Dashboard</Title>
          <Text type="secondary">Manage your profile information and keep it up to date.</Text>
        </div>
       <Title level={3}>Store Name: </Title>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Title level={4}>Personal Information</Title>
          <EditOutlined style={{ fontSize: "20px", cursor: "pointer" }} onClick={() => setEditMode(!editMode)} />
        </div>

        <form onSubmit={formik.handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <label htmlFor="userName">Name</label>
              <Input
                id="userName"
                name="userName"
                placeholder="Enter your name"
                disabled={!editMode}
                val={formik.values.userName}
                onChng={formik.handleChange("userName")}
                onBlr={formik.handleBlur("userName")}
                status={formik.touched.userName && formik.errors.userName ? "error" : ""}
              />
              {formik.touched.userName && formik.errors.userName && (
                <Text type="danger">{formik.errors.userName}</Text>
              )}
            </Col>

            <Col span={8}>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                placeholder="Enter your email"
                disabled={!editMode}
                val={formik.values.email}
                onChng={formik.handleChange("email")}
                onBlr={formik.handleBlur("email")}
                status={formik.touched.email && formik.errors.email ? "error" : ""}
              />
              {formik.touched.email && formik.errors.email && (
                <Text type="danger">{formik.errors.email}</Text>
              )}
            </Col>

            <Col span={8}>
              <label htmlFor="phone">Phone</label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                disabled={!editMode}
                val={formik.values.phone}
                onChng={formik.handleChange("phone")}
                onBlr={formik.handleBlur("phone")}
                status={formik.touched.phone && formik.errors.phone ? "error" : ""}
              />
              {formik.touched.phone && formik.errors.phone && (
                <Text type="danger">{formik.errors.phone}</Text>
              )}
            </Col>
          </Row>

          {editMode && (
            <Button type="primary" htmlType="submit" style={{ marginTop: "20px" }} block>
              Save Changes
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ProfileDashboard;
