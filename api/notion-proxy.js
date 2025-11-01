// api/notion-proxy.js
// Vercel Serverless Function for Notion API proxy

export default async function handler(req, res) {
  // CORS 헤더 설정 (모든 도메인에서 접근 가능)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, method, body, userToken } = req.body;

    // 필수 파라미터 검증
    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint is required' });
    }

    if (!userToken) {
      return res.status(401).json({ error: 'User token is required' });
    }

    // Notion API 호출
    const notionUrl = `https://api.notion.com/v1${endpoint}`;
    
    const response = await fetch(notionUrl, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'Notion-Version': '2022-06-28'
      },
      body: body ? JSON.stringify(body) : null
    });

    const data = await response.json();

    // Notion API 응답을 그대로 전달
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Notion Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

