import { StrictMode, useState, useEffect, useContext, createContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation, Outlet, useParams } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import App from './App';


// 工具函数
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

/**
 * 计算显示价格（加价20%）
 * @param originalPrice 原始价格
 * @returns 加价后的价格
 */

// 主渲染函数
function Main() {
  return (
    <StrictMode>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </StrictMode>
  );
}

// 渲染应用
createRoot(document.getElementById("root")!).render(<Main />);