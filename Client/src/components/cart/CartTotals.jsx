import { InputNumber, Button, Popconfirm, message } from "antd";
import {
  ClearOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  increase,
  decrease,
  reset,
  setDiscount,
  updatePrice,
} from "../../redux/cartSlice";
import { useNavigate } from "react-router-dom";

const CartTotals = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();

  return (
    <div className="cart h-full max-h-[calc(100vh_-_90px)] flex flex-col">
      <h2 className="bg-black text-white p-4 font-bold tracking-wide">
        Products in Basket
      </h2>
      <ul className="cart-items px-2 flex flex-col gap-y-3 pt-2 py-2 overflow-y-auto">
        {cart.cartItems.length > 0 ? (
          cart.cartItems.map((item) => (
            <li className="cart-item flex justify-between" key={item._id}>
              <div className="flex items-center">
                <div className="flex flex-col pl-2">
                  <b>{item.title}</b>
                  <span>
                    <InputNumber
                      min={1}
                      value={item.price}
                      onChange={(value) => dispatch(updatePrice({ id: item._id, newPrice: value }))}
                      formatter={(value) => `₹ ${value}`}
                      parser={(value) => value.replace("₹", "")}
                    />{" "}
                    x {item.quantity}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={() => dispatch(increase(item))}
                  className="w-full flex items-center justify-center !rounded-full"
                />
                <span className="font-bold inline-block w-6 text-center">
                  {item.quantity}
                </span>
                <Button
                  type="primary"
                  size="small"
                  icon={<MinusCircleOutlined />}
                  className="w-full flex items-center justify-center !rounded-full"
                  onClick={() => {
                    if (item.quantity === 1) {
                      if (window.confirm("Should the product be deleted?")) {
                        dispatch(decrease(item));
                        message.info("Product Deleted from Cart.");
                      }
                    } else {
                      dispatch(decrease(item));
                    }
                  }}
                />
              </div>
            </li>
          ))
        ) : (
          <div className="text-center mt-2 font-bold">There are no items in the cart...</div>
        )}
      </ul>
      <div className="cart-totals mt-auto">
        <div className="border-b border-t">
          <div className="flex justify-between p-2">
            <b>Subtotal</b>
            <span>₹ {cart.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-2">
            <b>Discount</b>
            <InputNumber
              min={0}
              value={cart.discount}
              onChange={(value) => dispatch(setDiscount(value))}
              formatter={(value) => `₹ ${value}`}
              parser={(value) => value.replace("₹", "")}
            />
          </div>
        </div>
        <div className="border-b mt-4">
          <div className="flex justify-between p-2">
            <b className="text-xl text-green-500">Grand Total</b>
            <span className="text-xl">
              ₹ {(
                cart.total  -
                cart.discount
              ).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="py-4 px-2">
          <Button
            type="primary"
            size="large"
            className="w-full"
            disabled={cart.cartItems.length === 0}
            onClick={() => navigate("/cart")}
          >
            Create Order
          </Button>
          <Popconfirm
            title="Product Deletion"
            description="Are you sure you want to delete the product?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => dispatch(reset())}
            className="w-full mt-2 flex items-center justify-center"
          >
            {cart.cartItems.length > 0 ? (
              <Button
                type="primary"
                size="large"
                className="w-full mt-2 flex items-center justify-center"
                icon={<ClearOutlined />}
                danger
                disabled={cart.cartItems.length > 0 ? false : true}
              >
              Delete
              </Button>
            ) : (
              ""
            )}
          </Popconfirm>

        </div>
      </div>
    </div>
  );
};

export default CartTotals;
