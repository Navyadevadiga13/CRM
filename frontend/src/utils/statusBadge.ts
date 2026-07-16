export const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "cold":
      return "bg-yellow-100 text-yellow-700";

    case "warm":
      return "bg-violet-100 text-violet-700";

    case "hot":
      return "bg-red-100 text-red-700";

    case "converted":
      return "bg-emerald-100 text-emerald-700";

    case "withdrawn":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
};