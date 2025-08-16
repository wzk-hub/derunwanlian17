import type { Handler } from "@netlify/functions";
import crypto from "node:crypto";

interface LoginBody {
  phone?: string;
  password?: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = event.body ? (JSON.parse(event.body) as LoginBody) : {};
    const phone = body.phone?.trim();
    const password = body.password?.trim();

    if (!phone || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "手机号和密码不能为空" })
      };
    }

    // Demo-only: authenticate admin account
    const adminPhone = process.env.ADMIN_PHONE || "15931319952";
    const adminPass = process.env.ADMIN_PASSWORD || "ljqwzk0103888";

    if (phone === adminPhone && password === adminPass) {
      const user = {
        id: "admin-1",
        phone: adminPhone,
        role: "admin",
        name: "系统管理员"
      };

      const tokenPayload = `${user.id}:${Date.now()}`;
      const secret = process.env.TOKEN_SECRET || "dev-secret";
      const token = crypto
        .createHmac("sha256", secret)
        .update(tokenPayload)
        .digest("base64url");

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, token })
      };
    }

    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "手机号或密码不正确" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "服务器错误" })
    };
  }
};