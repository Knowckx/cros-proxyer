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

            // 发起请求，记录时间
            const startTime = performance.now();
            const gotResp = await QueryCibaJson(word)
            const fnCostTime = performance.now() - startTime
            console.log(`Func ${QueryCibaJson.name} Cost Time: ${fnCostTime}ms`);

            // 拼装数据 根据返回的 Content-Type 判断处理方式
            const contentType = gotResp.headers.get("content-type") || "";
            let respData;
            if (contentType.includes("application/json")) {
                respData = await gotResp.json();
            } else {
                respData = await gotResp.text();
            }

            const responseBody = JSON.stringify({query: word, costTime:fnCostTime, data: respData});

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


/** 300ms */
async function QueryCibaJson(word: string) {
    const buildId = "OPeO-bTu_2jVUKMSaH9b0"  // 更新时间 2025-02-07 18:57:44
    const targetUrl = `https://www.iciba.com/_next/data/${buildId}/word.json?w=${encodeURIComponent(word)}`;
    return SendReqGet(targetUrl)
}



async function QueryBing(word: string) {
    const targetUrl = `https://cn.bing.com/dict/search?q=${encodeURIComponent(word)}`;
    return SendReqGet(targetUrl)
}