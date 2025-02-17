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
      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-gray-900">
          {history.content}
        </div>
        <div className="text-xs text-gray-500">{formatDate(history.date)}</div>
      </div>
      <div className="flex gap-2 text-xs text-gray-500">
        <span>{history.editor}</span>
        <span>•</span>
        <span className="uppercase">{history.os}</span>
        <span>•</span>
        <span className="uppercase">{history.product}</span>
      </div>
    </div>
  );
}
