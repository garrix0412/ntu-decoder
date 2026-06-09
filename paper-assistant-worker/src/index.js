const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_MESSAGE_CHARS = 900;
const MAX_HISTORY_ITEMS = 6;

const paperChunks = [
  {
    id: "Abstract",
    keywords: [
      "abstract",
      "summary",
      "overview",
      "main contribution",
      "主要贡献",
      "摘要",
      "总结",
      "ntu",
      "foundation decoder",
    ],
    text:
      "Foundation decoders are high-capacity neural decoders for fault-tolerant quantum computing. " +
      "Their construction faces a steep scaling barrier because larger code distances rapidly increase " +
      "the cost of syndrome generation and neural optimization. Neural Transfer Unification (NTU) aligns " +
      "decoding tasks across code distances through algebraic structures shared by scalable code families. " +
      "This lets knowledge learned on smaller codes accelerate large-scale decoder training. The paper " +
      "instantiates NTU as NTU-Transformer for planar surface codes and bivariate bicycle (BB) codes.",
  },
  {
    id: "Motivation",
    keywords: [
      "motivation",
      "why",
      "problem",
      "scaling barrier",
      "cold start",
      "为什么",
      "问题",
      "瓶颈",
      "冷启动",
      "训练成本",
    ],
    text:
      "Fault-tolerant quantum computation requires accurate and efficient decoders. Conventional decoders " +
      "such as matching-based methods and belief propagation are important but can be limited by scalability " +
      "or degeneracy at large code distances. Neural foundation decoders can be competitive, but training " +
      "large-distance models from scratch is expensive and can suffer from a cold-start optimization plateau. " +
      "NTU addresses this by replacing distance-specific training with reusable cross-distance transfer.",
  },
  {
    id: "Structural isomorphism",
    keywords: [
      "structural isomorphism",
      "scale invariance",
      "algebraic",
      "polynomial",
      "motif",
      "local neighborhood",
      "结构同构",
      "尺度不变",
      "代数",
      "局部",
      "motif",
      "邻域",
    ],
    text:
      "The central physical principle is structural isomorphism across code distances. Syndrome detectors " +
      "are represented by spatiotemporal polynomial coordinates v = x^i y^j t^k. The localized topological " +
      "neighborhood of a detector is written as N(v) = v · M(x,y,t), where M encodes an invariant local " +
      "correlation motif. When a structured code family scales, its global boundary changes but the local " +
      "generator polynomials remain conserved, allowing local error features learned on small codes to " +
      "remain meaningful on larger codes.",
  },
  {
    id: "Surface codes",
    keywords: [
      "surface",
      "surface code",
      "rotated surface code",
      "planar",
      "d=19",
      "d=25",
      "PyMatching",
      "correlated matching",
      "表面码",
      "码距",
      "匹配",
    ],
    text:
      "For planar rotated surface codes under circuit-level depolarizing noise, the paper evaluates a " +
      "standard Z-basis memory experiment with d syndrome extraction rounds. NTU-Transformer is trained " +
      "from scratch on d = 7 and then sequentially transferred to larger distances. At p = 0.3%, the " +
      "transferred model significantly outperforms standard PyMatching and closely approaches correlated " +
      "PyMatching. It also reaches [[625,1,25]] with only 27% additional training overhead relative to the " +
      "transferred baseline.",
  },
  {
    id: "Cold-start dynamics",
    keywords: [
      "cold start",
      "plateau",
      "training dynamics",
      "collapse",
      "scratch",
      "transfer",
      "lift off",
      "冷启动",
      "平台期",
      "塌缩",
      "从零训练",
      "迁移",
    ],
    text:
      "A key empirical advantage of NTU is the removal of the cold-start plateau. Scratch-initialized " +
      "large-distance NTU-Transformer models can remain close to random guessing for thousands of steps, " +
      "and the paper diagnoses this as a constant-output collapse mode. Transfer initialization supplies " +
      "a pre-aligned local perception backbone, so target-side training can immediately enter a useful " +
      "fine-tuning trajectory instead of first escaping a trivial predictor.",
  },
  {
    id: "BB codes",
    keywords: [
      "BB",
      "bivariate bicycle",
      "qLDPC",
      "RelayBP",
      "BP+OSD",
      "[[72,12,6]]",
      "[[144,12,12]]",
      "bicycle",
      "非局部",
      "量子LDPC",
    ],
    text:
      "The paper also evaluates bivariate bicycle (BB) codes, a quasi-cyclic qLDPC family with non-local " +
      "hypergraph structure. NTU-Transformer is evaluated on [[72,12,6]] and transferred to [[144,12,12]]. " +
      "On [[72,12,6]], NTU-Transformer outperforms BP+OSD and advanced Relay-BP variants across tested " +
      "physical error rates, especially in the low-physical-error regime. Transfer to [[144,12,12]] avoids " +
      "the scratch-training plateau for both Transformer and NTU-NeuralBP variants.",
  },
  {
    id: "NTU-Transformer architecture",
    keywords: [
      "architecture",
      "NTU-Transformer",
      "STEM",
      "RoPE",
      "embedding",
      "attention",
      "transformer",
      "架构",
      "位置编码",
      "嵌入",
      "注意力",
    ],
    text:
      "NTU-Transformer uses two targeted designs. The scalable transformer embedding model (STEM) builds " +
      "local inductive bias by aggregating explicit topological neighbors and grouping them into same-type, " +
      "cross-type, and temporal predecessor detectors. Geometry-aware RoPE encodes unnormalized relative " +
      "algebraic shifts instead of normalizing by global code size, preserving local attention phase patterns " +
      "when the code distance grows.",
  },
  {
    id: "Ablations",
    keywords: [
      "ablation",
      "RoPE ablation",
      "stem ablation",
      "embedding ablation",
      "full model",
      "消融",
      "对比实验",
      "RoPE",
      "stem",
    ],
    text:
      "The ablation studies test whether transfer depends on structural alignment. On surface-code transfer " +
      "from d = 7 to d = 11, the full model with physical-coordinate RoPE and a local one-ring stem lifts " +
      "off fastest; removing either component delays transfer, while removing both leaves the model close " +
      "to random guessing. On BB-code transfer from [[72,12,6]] to [[144,12,12]], breaking either the RoPE " +
      "alignment or polynomial-induced embedding alignment removes the measurable early transfer advantage.",
  },
  {
    id: "Discussion",
    keywords: [
      "discussion",
      "impact",
      "real time",
      "deployment",
      "future",
      "latency",
      "讨论",
      "意义",
      "实时",
      "部署",
      "未来",
    ],
    text:
      "The paper argues that generating high-quality full-precision foundation decoders is a major prerequisite " +
      "for real-time neural decoding. Hardware deployment may require compression, distillation, quantization, " +
      "and pruning. By reducing the training barrier for large-distance base models, NTU provides a practical " +
      "starting point for future hardware-integrated, low-latency neural decoders.",
  },
];

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9+\-.%[\]]{2,}/g) || []).filter(
    (token) => !["the", "and", "for", "with", "from", "that", "this", "are"].includes(token),
  );
}

function scoreChunk(query, chunk) {
  const q = query.toLowerCase();
  const text = chunk.text.toLowerCase();
  let score = 0;

  for (const token of tokenize(q)) {
    if (text.includes(token)) score += token.length > 4 ? 2 : 1;
  }

  for (const keyword of chunk.keywords) {
    const key = keyword.toLowerCase();
    if (q.includes(key)) score += 5;
  }

  return score;
}

function retrieveContext(query) {
  return paperChunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(query, chunk) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function formatContext(chunks) {
  return chunks.map((chunk) => `[${chunk.id}]\n${chunk.text}`).join("\n\n");
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY_ITEMS)
    .filter((item) => item && ["user", "assistant"].includes(item.role) && item.content)
    .map((item) => ({
      role: item.role,
      content: String(item.content).slice(0, 800),
    }));
}

function extractAnswer(result) {
  if (!result) return "";
  if (typeof result.response === "string") return result.response;
  if (typeof result.answer === "string") return result.answer;
  if (result.result && typeof result.result.response === "string") return result.result.response;
  if (Array.isArray(result.choices)) {
    return result.choices[0]?.message?.content || result.choices[0]?.text || "";
  }
  return "";
}

async function handleChat(request, env) {
  const headers = corsHeaders(request, env);
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400, headers);
  }

  const message = String(body.message || "").trim();
  if (!message) return json({ error: "Message is required." }, 400, headers);
  if (message.length > MAX_MESSAGE_CHARS) {
    return json({ error: `Message is too long. Keep it under ${MAX_MESSAGE_CHARS} characters.` }, 400, headers);
  }

  const chunks = retrieveContext(message);
  const context = formatContext(chunks);
  const history = cleanHistory(body.history);
  const model = env.MODEL || DEFAULT_MODEL;

  const systemPrompt =
    "You are the NTU Decoder paper assistant. Answer questions about the paper " +
    "\"Efficient foundation decoders for fault-tolerant quantum computing\". " +
    "Use only the provided paper context. If the context does not specify the answer, say that it is not specified in the paper context. " +
    "Answer in the same language as the user's question when possible. Be concise but technically precise. " +
    "Do not invent repository links, model links, numerical results, or implementation details that are not in the context.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Paper context:\n${context}` },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await env.AI.run(model, { messages });
    const answer = extractAnswer(result).trim();
    if (!answer) throw new Error("Empty model response.");

    return json(
      {
        answer,
        sources: chunks.map((chunk) => chunk.id),
        model,
      },
      200,
      headers,
    );
  } catch (error) {
    return json(
      {
        error: "The model request failed.",
        detail: error.message,
      },
      502,
      headers,
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "ntu-paper-assistant" }, 200, headers);
    }

    if (request.method === "POST" && url.pathname === "/chat") {
      return handleChat(request, env);
    }

    return json({ error: "Not found. Use POST /chat." }, 404, headers);
  },
};
