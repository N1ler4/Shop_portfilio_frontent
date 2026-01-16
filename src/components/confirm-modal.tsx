import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ConfirmModalProps {
  isConfirmOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isConfirmOpen,
  title = "Вы уверены?",
  message = "Это действие нельзя отменить.",
  onConfirm,
  onCancel,
}) => {
  return (
    <Transition show={isConfirmOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <div className="mt-2 text-sm text-gray-600">{message}</div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm rounded-md bg-blue-400 hover:bg-blue-500"
                >
                  Отмена
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
