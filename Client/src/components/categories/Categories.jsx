import { useEffect, useState } from "react";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import Add from "./Add";
import Edit from "./Edit";
import "./style.css";

const Categories = ({ categories, setCategories, products, setFiltered }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("Tümü");

  useEffect(() => {
    if (categoryTitle === "Tümü") {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter((product) => product.category === categoryTitle)
      );
    }
  }, [products, setFiltered, categoryTitle]);

  return (
<ul className="flex gap-4 flex-row md:flex-col text-lg overflow-x-auto md:overflow-y-auto custom-scrollbar max-h-[50vh] md:max-h-[80vh]">
  {categories.map((item) => (
    <li
      className={`category-item p-2 rounded-md cursor-pointer transition-all duration-300 ${
        item.title === categoryTitle ? "bg-black text-white" : "bg-gray-200"
      }`}
      key={item._id}
      onClick={() => setCategoryTitle(item.title)}
    >
      <span>{item.title}</span>
    </li>
  ))}

  {/* Add Button */}
  <li
    className="category-item bg-black text-white p-2 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
    onClick={() => setIsAddModalOpen(true)}
  >
    <PlusOutlined className="md:text-3xl text-2xl" />
  </li>

  {/* Edit Button */}
  <li
    className="category-item bg-gray-600 text-white p-2 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
    onClick={() => setIsEditModalOpen(true)}
  >
    <EditOutlined className="md:text-3xl text-2xl" />
  </li>

  {/* Add Modal */}
  <Add
    isAddModalOpen={isAddModalOpen}
    setIsAddModalOpen={setIsAddModalOpen}
    categories={categories}
    setCategories={setCategories}
  />

  {/* Edit Modal */}
  <Edit
    isEditModalOpen={isEditModalOpen}
    setIsEditModalOpen={setIsEditModalOpen}
    categories={categories}
    setCategories={setCategories}
  />
</ul>


  );
};

export default Categories;
