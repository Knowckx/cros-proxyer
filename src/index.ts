export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        try {
            const url = new URL(request.url);
            const word = url.searchParams.get("word") || url.searchParams.get("q");
            if (!word) {
                return new Response("Missing 'word' parameter", { status: 400, headers: corsHeaders });
            }

            // 发起请求，禁用缓存
            const gotResp = await QueryCibaJson(word)
            // 根据返回的 Content-Type 判断处理方式
            const contentType = gotResp.headers.get("content-type") || "";
            let responseBody;
            if (contentType.includes("application/json")) {
                // 如果返回 JSON，则调用 json() 并 stringify 后返回
                responseBody = JSON.stringify(await gotResp.json());
            } else {
                responseBody = await gotResp.text();
            }

            // 设置响应头（附加 CORS）
            const responseHeaders = new Headers(gotResp.headers);
            responseHeaders.set("Access-Control-Allow-Origin", "*");
            responseHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
            responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");

            return new Response(responseBody, {
                status: gotResp.status,
                statusText: gotResp.statusText,
                headers: responseHeaders,
            });
        } catch (err) {
            console.error("请求出错:", err);
            return new Response("Error: " + err.toString(), { status: 500, headers: corsHeaders });
        }
    },
};


function GetHeads() {
    const headers = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "sec-fetch-dest": "document",
    };
    return headers
}


async function SendReqGet(targetUrl: string) {
    console.log("即将请求的 URL:", targetUrl);
    const headers = GetHeads()
    const resp = await fetch(targetUrl, {
        method: "GET",
        headers,
    });
    return resp
}


async function QueryCibaJson(word: string) {
    const targetUrl = `https://www.iciba.com/_next/data/NW4LYCQTPmcJk1wISQx_s/word.json?w=${encodeURIComponent(word)}`;
    return SendReqGet(targetUrl)
}


async function QueryCiba(word: string) {
    const targetUrl = `https://www.iciba.com/word?w=${encodeURIComponent(word)}`;
    return SendReqGet(targetUrl)
}

async function QueryBing(word: string) {
    const targetUrl = `https://cn.bing.com/dict/search?q=${encodeURIComponent(word)}`;
    return SendReqGet(targetUrl)
}