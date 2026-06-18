import { ProcessoResult, DjenResult, SearchParams } from "@/types";

const BASE = "https://datajud-proxy.fabio-6f1.workers.dev";

// Chave pública demonstrativa do CNJ — troque pela sua em datajud-wiki.cnj.jus.br
const API_KEY =
  process.env.NEXT_PUBLIC_DATAJUD_API_KEY ||
  "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const TRIBUNAL_INDEX: Record<string, string> = {
  TJSP: "api_publica_tjsp",
  TJRJ: "api_publica_tjrj",
  TJMG: "api_publica_tjmg",
  TJRS: "api_publica_tjrs",
  TJPR: "api_publica_tjpr",
  TJSC: "api_publica_tjsc",
  TJBA: "api_publica_tjba",
  TJPE: "api_publica_tjpe",
  TJCE: "api_publica_tjce",
  TJGO: "api_publica_tjgo",
  TJMT: "api_publica_tjmt",
  TJMS: "api_publica_tjms",
  TJPA: "api_publica_tjpa",
  TJAM: "api_publica_tjam",
  TJDF: "api_publica_tjdft",
  TRF1: "api_publica_trf1",
  TRF2: "api_publica_trf2",
  TRF3: "api_publica_trf3",
  TRF4: "api_publica_trf4",
  TRF5: "api_publica_trf5",
  TST: "api_publica_tst",
  STJ: "api_publica_stj",
  STF: "api_publica_stf",
};

function buildQuery(params: SearchParams) {
  const { tipo, valor, dataInicio, dataFim } = params;
  const filters: unknown[] = [];

  if (dataInicio || dataFim) {
    const range: Record<string, string> = {};
    if (dataInicio) range.gte = dataInicio;
    if (dataFim) range.lte = dataFim;
    filters.push({ range: { dataAjuizamento: range } });
  }

  let main: unknown;

  if (tipo === "numero") {
    const limpo = valor.replace(/\D/g, "");
    main = {
      bool: {
        should: [
          { match: { numeroProcesso: valor } },
          { match: { numeroProcesso: limpo } },
          { wildcard: { numeroProcesso: `*${limpo}*` } },
        ],
        minimum_should_match: 1,
      },
    };
  } else if (tipo === "parte") {
    main = {
      nested: {
        path: "partes",
        query: { match: { "partes.nome": { query: valor, operator: "and" } } },
      },
    };
  } else {
    const num = valor.replace(/\D/g, "");
    main = {
      multi_match: {
        query: num,
        fields: ["partes.advogados.numeroOAB"],
      },
    };
  }

  return filters.length ? { bool: { must: [main, ...filters] } } : main;
}

async function searchIndex(index: string, body: unknown): Promise<ProcessoResult[]> {
  const res = await fetch(`${BASE}/${index}/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.hits?.hits ?? [];
}

export async function buscarProcessos(params: SearchParams): Promise<ProcessoResult[]> {
  const body = {
    query: buildQuery(params),
    sort: [{ dataAjuizamento: { order: "desc" } }],
    size: 20,
  };

  const indices =
    params.tribunal && TRIBUNAL_INDEX[params.tribunal]
      ? [TRIBUNAL_INDEX[params.tribunal]]
      : Object.values(TRIBUNAL_INDEX).slice(0, 8);

  const results = await Promise.allSettled(indices.map((idx) => searchIndex(idx, body)));

  const hits: ProcessoResult[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") hits.push(...r.value);
  }

  return hits.sort((a, b) => {
    const da = new Date(a._source?.dataAjuizamento ?? 0).getTime();
    const db = new Date(b._source?.dataAjuizamento ?? 0).getTime();
    return db - da;
  });
}

export async function buscarDjen(params: SearchParams): Promise<DjenResult[]> {
  const { valor, dataInicio, dataFim } = params;
  const filters: unknown[] = [];

  if (dataInicio || dataFim) {
    const range: Record<string, string> = {};
    if (dataInicio) range.gte = dataInicio;
    if (dataFim) range.lte = dataFim;
    filters.push({ range: { dataPublicacao: range } });
  }

  const main = {
    multi_match: {
      query: valor,
      fields: ["texto", "numeroProcesso", "nomeOrgao"],
      type: "best_fields",
    },
  };

  const body = {
    query: filters.length ? { bool: { must: [main, ...filters] } } : main,
    sort: [{ dataPublicacao: { order: "desc" } }],
    size: 20,
  };

  const res = await fetch(`${BASE}/api_publica_djen/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`DJEN retornou HTTP ${res.status}`);

  const data = await res.json();
  return (data?.hits?.hits ?? []).map((h: { _id: string; _source: Record<string, unknown> }) => ({
    id: h._id,
    numeroProcesso: h._source.numeroProcesso ?? "",
    dataPublicacao: h._source.dataPublicacao ?? "",
    tipoComunicacao: h._source.tipoComunicacao ?? "Publicação",
    nomeOrgao: h._source.nomeOrgao ?? "",
    texto: h._source.texto ?? "",
    siglaTribunal: h._source.siglaTribunal ?? "CNJ",
  }));
}
