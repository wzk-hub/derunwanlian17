import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  const name = process.env.SITE_NAME || "德润万联教育";
  const tagline = process.env.SITE_TAGLINE || "连接优质教育资源，助力孩子成长";

  const stats = {
    teachers: 1280,
    subjects: 36,
    studentsHelped: 53210
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify({ name, tagline, stats })
  };
};