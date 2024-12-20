import { Modal, Button } from "antd";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const PrintInvoice = ({ isModalOpen, setIsModalOpen, printData }) => {
  const compnentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => compnentRef.current,
  });

  return (
    <Modal
      title="Print Invoice"
      open={isModalOpen}
      footer={false}
      onCancel={() => setIsModalOpen(false)}
      width={400}
    >
      <section className="py-18" ref={compnentRef}>
        <div className="bg-white px-6 max-w-5xl mx-auto">
          <article className="overflow-hidden">
            <div className="logo my-6">
                  <img 
                  src="https://res.cloudinary.com/dl6ixqdqh/image/upload/v1732693398/20230811_170610_wsmqmw.png"
                  alt="Logo" 
                  width={150}
                  className ='mx-auto bg-black'
                />
            </div>
            <div class="invoice-details">
  <table class="table-auto border-collapse w-full">
    <tbody>
      <tr>
        <td class="px-4 py-2 font-bold">Invoice Number</td>
        <td class="px-4 py-2">{printData?.invoiceno}</td>
      </tr>
      <tr>
        <td class="px-4 py-2">Name</td>
        <td class="px-4 py-2 text-green-600">{printData?.customerName}</td>
      </tr>
      <tr>
        <td class="px-4 py-2">Tel</td>
        <td class="px-4 py-2">{printData?.customerPhoneNumber}</td>
      </tr>
      <tr>
        <td class="px-4 py-2 font-bold">Date</td>
        <td className="px-4 py-2"> {printData?.createdAt ? new Date(printData?.createdAt).toLocaleString() : ''} </td>
      </tr>
    </tbody>
  </table>
</div>

            <div className="bill-table-area mt-9">
              <table className="min-w-full divide-y divide-slate-500 overflow-hidden">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sm:w-auto w-full py-3.5 text-left text-sm font-normal font-bold text-slate-700 md:pl-0"
                    >
                    Title
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 text-center text-sm font-normal text-slate-700 md:pl-0 sm:table-cell hidden"
                    >
                   Price
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 text-center text-sm font-normal text-slate-700 md:pl-0 sm:table-cell hidden"
                    >
                      Piece
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 text-end  text-sm font-normal text-slate-700 md:pl-0"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {printData?.cartItems?.map((item) => (
                    <tr
                      className="border-t border-b border-slate-200"
                      key={item._id}
                    >
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="sm:hidden inline-block text-xs">
                          Unit Price ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 sm:text-center text-right sm:table-cell hidden">
                        <span>₹{item.price.toFixed(2)}</span>
                      </td>
                      <td className="py-4 sm:text-center text-right sm:table-cell hidden">
                        <span>{item.quantity}</span>
                      </td>
                      <td className="py-4 text-end">
                        <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      className="text-right sm:table-cell hidden pt-4"
                      colSpan={4}
                      scope="row"
                    >
                      <span className="font-normal text-slate-700">
                      Subtotal
                      </span>
                    </th>
                    <th className="text-left sm:hidden py-2" scope="row">
                      <p className="font-normal text-slate-700">Subtotal</p>
                    </th>
                    <th className="text-right">
                      <span className="font-normal text-slate-700">
                      ₹{printData?.subTotal?.toFixed(2)}
                      </span>
                    </th>
                  </tr>
                  
                  <tr>
                    <th
                      className="text-right sm:table-cell hidden"
                      colSpan={4}
                      scope="row"
                    >
                      <span className="font-bold text-slate-700">
                      Grand Total
                      </span>
                    </th>
                    {/* <th className="text-left sm:hidden" scope="row">
                      <p className="font-bold text-slate-700">Grand Total</p>
                    </th> */}
                    <th className="text-right">
                      <span className="font-normal text-slate-700">
                      ₹  {printData.GrandtotalAmount}
                      </span>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
        </article>
        </div>
      </section>
      <div className="flex justify-center mt-4 mx-auto">
        <Button type="primary" size="large" onClick={handlePrint}>
        Print
        </Button>
      </div>
    </Modal>
  );
};

export default PrintInvoice;
