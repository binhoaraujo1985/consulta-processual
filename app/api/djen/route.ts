import { NextRequest, NextResponse } from "next/server";

const DJEN_BASE = "https://api-publica.datajud.cnj.jus.br/api_publica_djen";

export async function POST(req: NextRequest) {
  const { valor, dataInicio, dataFim } = await req.json();

  if (!valor?.trim()) {
    return NextResponse.json({ error: "Valor de busca obrigatório" }, { status: 400 });
  }

  const apiKey = process.env.DATAJUD_API_KEY || "APIKey cDZHYzlZa0JadVREZDJCendFbzVlQTU2S3pnMWYyYXU=";

  const filters: unknown[] = [];

  if (dataInicio || dataFim) {
    const range: Record<string, string> = {};
    if (dataInicio) range.gte = dataInicio;
    if (dataFim) range.lte = dataFim;
    filters.push({ range: { dataPublicacao: range } });
  }

  const mainQuery = {
    multi_match: {
      query: valor,
      fields: ["texto", "numeroProcesso", "nomeOrgao"],
      type: "best_fields",
    },
  };

  const query =
    filters.length > 0
      ? { bool: { must: [mainQuery, ...filters] } }
      : mainQuery;

  const body = {
    query,
    sort: [{ dataPublicacao: { order: "desc" } }],
    size: 20,
  };

  try {
    const res = await fetch(`${DJEN_BASE}/_search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `DataJud DJEN retornou HTTP ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const hits: unknown[] = data?.hits?.hits ?? [];

    const resultados = hits.map((h: unknown) => {
      const hit = h as { _id: string; _source: Record<string, unknown> };
      return {
        id: hit._id,
        numeroProcesso: hit._source.numeroProcesso ?? "",
        dataPublicacao: hit._source.dataPublicacao ?? "",
        tipoComunicacao: hit._source.tipoComunicacao ?? "Publicação",
        nomeOrgao: hit._source.nomeOrgao ?? "",
        texto: hit._source.texto ?? "",
        siglaTribunal: hit._source.siglaTribunal ?? "CNJ",
      };
    });

    return NextResponse.json({ resultados, total: resultados.length });
  } catch (e) {
    return NextResponse.json(
      { error: `Erro ao consultar DJEN: ${e instanceof Error ? e.message : "timeout"}` },
      { status: 502 }
    );
  }
}
