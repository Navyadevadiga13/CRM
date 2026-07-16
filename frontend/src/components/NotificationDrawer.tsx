import { X } from "lucide-react";
import { useNotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

type NotificationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NotificationDrawer = ({
  isOpen,
  onClose,
}: NotificationDrawerProps) => {

const {
  notifications,
  loading,
  markAsRead,
} = useNotificationContext();

const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-screen w-[380px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">
            Notifications
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {loading ? (
            <p>Loading...</p>
          ) : notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((notification: any) => (
              <div
                key={notification._id}
                className="mb-3 cursor-pointer rounded-xl border p-3 transition hover:bg-emerald-50"
                onClick={() => {
  // Fire and forget - UI updates immediately
  void markAsRead(notification._id);

  onClose();

                    if (notification.relatedStudent?._id) {
                      navigate(`/students/${notification.relatedStudent._id}`);
                    }
                  }}
                >
                <h3 className="font-semibold">
                  {notification.title}
                </h3>

                {/* <p className="text-sm text-slate-600">
                  {notification.relatedStudent?.name}
                </p> */}

                <p className="mt-1 text-sm text-slate-600">
                  {notification.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;