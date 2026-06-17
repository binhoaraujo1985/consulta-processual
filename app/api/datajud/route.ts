import { NextRequest, NextResponse } from "next/server";

const DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br";

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

function buildQuery(tipo: string, valor: string, dataInicio?: string, dataFim?: string) {
  const filters: unknown[] = [];

  if (dataInicio || dataFim) {
    const range: Record<string, string> = {};
    if (dataInicio) range.gte = dataInicio;
    if (dataFim) range.lte = dataFim;
    filters.push({ range: { dataAjuizamento: range } });
  }

  let mainQuery: unknown;

  if (tipo === "numero") {
    // Remove formatação e busca pelo número limpo
    const numeroLimpo = valor.replace(/\D/g, "");
    mainQuery = {
      bool: {
        should: [
          { match: { numeroProcesso: valor } },
          { match: { numeroProcesso: numeroLimpo } },
          { wildcard: { numeroProcesso: `*${numeroLimpo}*` } },
        ],
        minimum_should_match: 1,
      },
    };
  } else if (tipo === "parte") {
    mainQuery = {
      nested: {
        path: "partes",
        query: {
          match: { "partes.nome": { query: valor, operator: "and" } },
        },
      },
    };
  } else if (tipo === "oab") {
    // Extrai número e UF do OAB (ex: 123456SP)
    const match = valor.match(/^(\d+)\s*([A-Z]{2})?$/i);
    const numero = match?.[1] ?? valor;
    const uf = match?.[2]?.toUpperCase();

    const oabQuery: unknown[] = [{ match: { "partes.advogados.numeroOAB": numero } }];
    if (uf) oabQuery.push({ match: { "partes.advogados.estadoOAB": uf } });

    mainQuery = {
      nested: {
        path: "partes",
        query: {
          nested: {
            path: "partes.advogados",
            query: { bool: { must: oabQuery } },
          },
        },
      },
    };
  } else {
    mainQuery = { match_all: {} };
  }

  const query =
    filters.length > 0
      ? { bool: { must: [mainQuery, ...filters] } }
      : mainQuery;

  return query;
}

export async function POST(req: NextRequest) {
  const { tipo, valor, tribunal, dataInicio, dataFim } = await req.json();

  if (!valor?.trim()) {
    return NextResponse.json({ error: "Valor de busca obrigatório" }, { status: 400 });
  }

  const apiKey = process.env.DATAJUD_API_KEY || "APIKey cDZHYzlZa0JadVREZDJCendFbzVlQTU2S3pnMWYyYXU=";

  const query = buildQuery(tipo, valor, dataInicio, dataFim);

  const body = {
    query,
    sort: [{ dataAjuizamento: { order: "desc" } }],
    size: 20,
  };

  // Se tribunal específico, consulta apenas aquele índice; caso contrário consulta os principais
  const indices = tribunal && TRIBUNAL_INDEX[tribunal]
    ? [TRIBUNAL_INDEX[tribunal]]
    : Object.values(TRIBUNAL_INDEX).slice(0, 8); // limita para não sobrecarregar

  const results: unknown[] = [];
  const errors: string[] = [];

  await Promise.allSettled(
    indices.map(async (index) => {
      try {
        const res = await fetch(`${DATAJUD_BASE}/${index}/_search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          errors.push(`${index}: HTTP ${res.status}`);
          return;
        }

        const data = await res.json();
        const hits = data?.hits?.hits ?? [];
        results.push(...hits);
      } catch (e) {
        errors.push(`${index}: ${e instanceof Error ? e.message : "timeout"}`);
      }
    })
  );

  // Ordena por data de ajuizamento decrescente
  const sorted = (results as { _source: { dataAjuizamento?: string } }[]).sort((a, b) => {
    const da = new Date(a._source?.dataAjuizamento ?? 0).getTime();
    const db = new Date(b._source?.dataAjuizamento ?? 0).getTime();
    return db - da;
  });

  return NextResponse.json({
    hits: sorted,
    total: sorted.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
