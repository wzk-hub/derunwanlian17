import { useEffect, useState } from "react";
import { getResolvedInfo } from "@/config/serverConfig";
import { pingServer } from "@/lib/apiClient";

export default function ServiceStatus() {
  const [status, setStatus] = useState<{ ok: boolean; ms: number } | null>(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    const res = await pingServer();
    setStatus(res);
    setChecking(false);
  }

  useEffect(() => {
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  const info = getResolvedInfo();
  const color = status?.ok ? "bg-green-500" : "bg-red-500";
  const label = status?.ok ? "在线" : "离线";

  return (
    <button
      onClick={check}
      title={`${info.mode}${info.baseUrl ? ` @ ${info.baseUrl}` : ""}${status ? ` · ${status.ms}ms` : ""}`}
      className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
    >
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${checking ? "bg-yellow-400" : color}`}></span>
      <span className="text-xs text-gray-700">{label}{status ? ` · ${status.ms}ms` : ""}</span>
    </button>
  );
}