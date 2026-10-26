export function getStatusBadge(status: string): string {
  switch (status) {
    case "Open":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Closed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getPriorityBadge(priority: string): string {
  switch (priority) {
    case "Critical":
      return "bg-red-50 text-red-700 border-red-200 font-bold";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200 font-semibold";
    case "Medium":
      return "bg-blue-50 text-blue-700 border-blue-200 font-medium";
    case "Low":
      return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
