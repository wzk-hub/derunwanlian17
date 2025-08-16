import { useEffect, useState } from "react";
import { getResolvedInfo, setApiConfig, resetApiConfig } from "@/config/serverConfig";

export default function ServerSwitch() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"netlify" | "custom" | "aliyun">("netlify");
  const [base, setBase] = useState("");

  useEffect(() => {
    const info = getResolvedInfo();
    setMode(info.mode as any);
    setBase(info.baseUrl || "");
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-700"
        title="服务器设置"
      >
        环境
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-3 z-20">
          <div className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">模式</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="netlify">Netlify Functions</option>
              <option value="aliyun">阿里云（自定义地址）</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">基础地址（如 https://api.xxx.cn）</label>
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="https://your-aliyun-api"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setApiConfig({ mode, baseUrl: base });
                setOpen(false);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
            >
              保存
            </button>
            <button
              onClick={() => {
                resetApiConfig();
                const info = getResolvedInfo();
                setMode(info.mode as any);
                setBase(info.baseUrl || "");
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              重置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}