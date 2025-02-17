import { h } from "preact";
import { formatDate } from "../../utils/formatDate";
import { HistoryItemProps } from "./history_helper";

export default function HistoryItem({
  history,
}: {
  history: HistoryItemProps;
}) {
  return (
    <div
      key={history.id}
      className="p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="text-sm font-medium text-gray-900">{history.content}</div>
      <div className="text-xs text-gray-500">{formatDate(history.date)}</div>
    </div>
  );
}
