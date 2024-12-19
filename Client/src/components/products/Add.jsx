import { Button, Form, Input, Modal, Select, message } from "antd";

const Add = ({
  isAddModalOpen,
  setIsAddModalOpen,
  products,
  setProducts,
  categories,
}) => {
  const [form] = Form.useForm();
  const onFinish = (value) => {
    try {
      fetch(process.env.REACT_APP_SERVER_URL + "/api/products/add-product", {
        method: "POST",
        body: JSON.stringify(value),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      });
      message.success("Product added successfully.");
      setIsAddModalOpen(false);
      form.resetFields();
      setProducts([
        ...products,
        {
          _id: Math.random(),
          title: value.title,
          price: Number(value.price),
          category: value.category,
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      title="Add New Product"
      open={isAddModalOpen}
      onCancel={() => setIsAddModalOpen(false)}
      footer={false}
    >
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label={"Product Name"}
          name="title"
          rules={[
            {
              required: true,
              message: "This Field Cannot Be Left Empty!",
            },
          ]}
        >
          <Input placeholder="enter product name" />
        </Form.Item>
       
        <Form.Item
          label={"Product Price"}
          name="price"
          rules={[
            {
              required: true,
              message: "This Field Cannot Be Left Empty!",
            },
          ]}
        >
          <Input placeholder="enter product price" type="number" />
        </Form.Item>
        <Form.Item
          label={"Select Category"}
          name="category"
          rules={[
            {
              required: true,
              message: "This Field Cannot Be Left Empty!",
            },
          ]}
        >
          <Select
            showSearch
            placeholder="type to select category "
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.title ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.title ?? "")
                .toLowerCase()
                .localeCompare((optionB?.title ?? "").toLowerCase())
            }
            options={categories.map((item, i) => {
              return { value: item.title, label: item.title };
            })}
          />
        </Form.Item>
        <Form.Item className="flex justify-end mb-0">
          <Button type="primary" htmlType="submit">
          Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Add;
