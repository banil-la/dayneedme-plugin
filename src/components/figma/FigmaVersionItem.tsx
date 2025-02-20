import { h } from "preact";
import { formatDate } from "../../types";
import { FigmaVersion } from "./figma_helper";

export default function FigmaVersionItem({
  version,
}: {
  version: FigmaVersion;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 mb-4 ${
        version.is_auto_saved ? "border-gray-200" : "border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
          {version.user.img_url && (
            <img
              src={version.user.img_url}
              alt={version.user.handle}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{version.label}</h4>
              {version.is_auto_saved && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  자동 저장
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(version.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{version.user.handle}</p>
          {version.description && (
            <p className="mt-2 text-sm text-gray-700">{version.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
