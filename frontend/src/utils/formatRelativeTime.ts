export const formatRelativeTime = (date: string) => {
  const now = new Date();
  const created = new Date(date);

  const seconds = Math.floor(
    (now.getTime() - created.getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  if (days < 7) {
    return `${days} days ago`;
  }

  return created.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};