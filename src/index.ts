/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.json`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */



export default {
    async fetch(request, env, ctx) {
      // 定义 CORS 响应头
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };
  
      // 处理 OPTIONS 预检请求
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }
  
      try {
        // 解析请求 URL 和查询参数
        const url = new URL(request.url);
        // 支持两种参数名称：word 或 q
        const word = url.searchParams.get("word") || url.searchParams.get("q");
        if (!word) {
          return new Response("Missing 'word' parameter", { status: 400, headers: corsHeaders });
        }
  
        // 构造 Bing 字典查询 URL（示例使用中文 Bing 字典）
        const targetUrl = `https://cn.bing.com/dict/search?q=${encodeURIComponent(word)}`;
  
        // 转发请求时可以设置合适的 User-Agent 模拟浏览器
        const bingResponse = await fetch(targetUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
  
        // 获取 Bing 的响应内容（一般为 HTML）
        const responseBody = await bingResponse.text();
  
        // 复制原响应头并添加 CORS 相关的头
        const responseHeaders = new Headers(bingResponse.headers);
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");
  
        // 返回 Bing 的响应（状态码与正文均原样转发）
        return new Response(responseBody, {
          status: bingResponse.status,
          statusText: bingResponse.statusText,
          headers: responseHeaders,
        });
      } catch (err) {
        // 如果出错，返回 500 错误并附上错误信息
        return new Response("Error: " + err.toString(), { status: 500, headers: corsHeaders });
      }
    },
  };
  