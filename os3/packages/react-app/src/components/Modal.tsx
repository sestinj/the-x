import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import { backgroundColor, Button, primaryHighlight, secondaryDark } from ".";

// TODO - instead of using props, you should use subcomponents. <Modal.Content>, <Modal.Title>, etc...
export default function Modal(props: {
  open: boolean;
  title: ReactNode;
  content: ReactNode[] | ReactNode;
}) {
  let [isOpen, setIsOpen] = useState(props.open);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          style={{
            position: "fixed",
            zIndex: "1000",
            inset: "0",
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClose={closeModal}
        >
          <div style={{ textAlign: "center" }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay style={{ position: "fixed", inset: "0" }} />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                style={{
                  borderRadius: "8px",
                  border: "2px solid white",
                  backgroundColor: backgroundColor,
                  boxShadow: `0px 0px 4px 4px ${primaryHighlight}`,
                  padding: "8px",
                  width: "50vmin",
                  margin: "12px",
                  color: "white",
                }}
                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              >
                <h3>{props.title}</h3>

                {props.content}

                <div style={{ marginTop: "12px" }}>
                  <Button onClick={closeModal}>Ok</Button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
