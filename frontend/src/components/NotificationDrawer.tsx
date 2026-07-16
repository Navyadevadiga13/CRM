import { X } from "lucide-react";
import { useNotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import { getStatusBadge } from "../utils/statusBadge";
import { useState } from "react";


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
  markAllAsRead,
} = useNotificationContext();

const navigate = useNavigate();
  
const [filter, setFilter] = useState<"all" | "unread">("all");
const displayedNotifications =
  filter === "all"
    ? notifications
    : notifications.filter((n) => !n.isRead);
if (!isOpen) return null;
    
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-screen w-[380px] flex-col bg-emerald-50 shadow-2xl">
<div className="flex items-center justify-between border-b border-emerald-200 bg-white p-5">  <div>
    <h2 className="text-lg font-semibold">
      Notifications
    </h2>

    <p className="text-xs text-slate-500">
      {notifications.filter((n) => !n.isRead).length} unread
    </p>
  </div>
    <div className="flex gap-2 border-b border-emerald-100 bg-white px-5 py-3">
  <button
    onClick={() => setFilter("all")}
    className={`rounded-full px-4 py-1 text-sm font-medium transition ${
      filter === "all"
        ? "bg-emerald-600 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`}
  >
    All
  </button>

  <button
    onClick={() => setFilter("unread")}
    className={`rounded-full px-4 py-1 text-sm font-medium transition ${
      filter === "unread"
        ? "bg-emerald-600 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`}
  >
    Unread
  </button>
</div>
  <div className="flex items-center gap-3">
    {notifications.some((n) => !n.isRead) && (
      <button
        onClick={markAllAsRead}
        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        Mark all as read
      </button>
    )}

    <button onClick={onClose}>
      <X size={20} />
    </button>
  </div>
</div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {loading ? (
            <p>Loading...</p>
          ) : notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            displayedNotifications.map((notification: any) => (
              <div
                key={notification._id}
                className={`mb-3 cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-none ${
  notification.isRead
    ? "border-slate-200 bg-slate-50"
    : "border-l-4 border-l-emerald-500 border-emerald-200 bg-white shadow-sm"
}`}
                onClick={() => {
                  // Fire and forget - UI updates immediately
                  void markAsRead(notification._id);

  onClose();

                    if (notification.relatedStudent?._id) {
                      navigate(`/students/${notification.relatedStudent._id}`);
                    }
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                      )}

                      <h3
                        className={`text-base ${
  notification.isRead
    ? "font-semibold text-slate-500"
    : "font-bold text-emerald-700"
}`}
                      >
                        {notification.title}
                      </h3>
                    </div>
                  </div>

                  {notification.type === "status" &&
                    notification.relatedStudent?.name && (
                      <p className="mb-3 text-lg font-bold text-slate-900">
                        {notification.relatedStudent.name}
                      </p>
                    )}
       

                {notification.type === "status" ? (
  (() => {
    const match = notification.message.match(
      /from (.+?) to (.+?)\./i
    );

    if (!match) {
      return (
        <p className="mt-1 text-sm text-slate-600">
          {notification.message}
        </p>
      );
    }

    const fromStatus = match[1];
    const toStatus = match[2];

    return (
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getStatusBadge(
            fromStatus
          )}`}
        >
          {fromStatus}
        </span>

        <span className="text-slate-400">→</span>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getStatusBadge(
            toStatus
          )}`}
        >
          {toStatus}
        </span>
      </div>
    );
  })()
) : (
  <p className="mt-1 text-sm text-slate-600">
    {notification.message}
  </p>
)}
                <p className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-400">
  {formatRelativeTime(notification.createdAt)}
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