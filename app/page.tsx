"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ProcessoCard from "@/components/ProcessoCard";
import DjenCard from "@/components/DjenCard";
import ComunicacaoCard from "@/components/ComunicacaoCard";
import { buscarProcessos, buscarDjen, buscarComunicacoes } from "@/lib/datajud";
import { ProcessoResult, DjenResult, ComunicacaoResult, SearchParams } from "@/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [processos, setProcessos] = useState<ProcessoResult[]>([]);
  const [djenResults, setDjenResults] = useState<DjenResult[]>([]);
  const [comunicacoes, setComunicacoes] = useState<ComunicacaoResult[]>([]);
  const [totalComunicacoes, setTotalComunicacoes] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null);
  const [tribunalFiltro, setTribunalFiltro] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"datajud" | "djen" | "comunicacoes">("datajud");

  async function handleSearch(params: SearchParams) {
    setLoading(true);
    setError(null);
    setProcessos([]);
    setDjenResults([]);
    setComunicacoes([]);
    setTotalComunicacoes(0);
    setPaginaAtual(1);
    setTribunalFiltro("");
    setCurrentParams(params);
    setSearched(true);

    try {
      if (params.tipo === "djen") {
        const results = await buscarDjen(params);
        setDjenResults(results);
        setActiveTab("djen");
      } else if (params.tipo === "oab") {
        const { items, total } = await buscarComunicacoes(params, 1);
        setComunicacoes(items);
        setTotalComunicacoes(total);
        setActiveTab("comunicacoes");
      } else {
        const results = await buscarProcessos(params);
        setProcessos(results);
        setActiveTab("datajud");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleCarregarMais() {
    if (!currentParams) return;
    const proxPagina = paginaAtual + 1;
    setLoadingMore(true);
    try {
      const { items } = await buscarComunicacoes(currentParams, proxPagina);
      setComunicacoes((prev) => [...prev, ...items]);
      setPaginaAtual(proxPagina);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar mais");
    } finally {
      setLoadingMore(false);
    }
  }

  // Tribunais disponíveis nos resultados carregados
  const tribunaisDisponiveis = Array.from(
    new Set(comunicacoes.map((c) => c.siglaTribunal).filter(Boolean))
  ).sort();

  const comunicacoesFiltradas = tribunalFiltro
    ? comunicacoes.filter((c) => c.siglaTribunal === tribunalFiltro)
    : comunicacoes;

  const total =
    activeTab === "datajud" ? processos.length :
    activeTab === "djen" ? djenResults.length :
    comunicacoesFiltradas.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center font-bold text-blue-900 text-lg shrink-0">
              CP
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Consulta Processual</h1>
              <p className="text-blue-200 text-sm">DataJud CNJ · DJEN · Tribunais</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {searched && !loading && !error && (
          <div className="mt-6">
            {/* Cabeçalho de resultados */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-sm text-gray-500">
                {total === 0
                  ? "Nenhum resultado encontrado."
                  : activeTab === "comunicacoes"
                  ? `${comunicacoesFiltradas.length} exibido(s) de ${totalComunicacoes} comunicações`
                  : `${total} resultado(s) encontrado(s)`}
              </p>
            </div>

            {/* Filtro por tribunal (só para OAB) */}
            {activeTab === "comunicacoes" && tribunaisDisponiveis.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setTribunalFiltro("")}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    tribunalFiltro === ""
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  Todos
                </button>
                {tribunaisDisponiveis.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTribunalFiltro(t === tribunalFiltro ? "" : t)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      tribunalFiltro === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* Resultados */}
            {activeTab === "datajud" && processos.map((p, i) => <ProcessoCard key={i} processo={p} />)}
            {activeTab === "djen" && djenResults.map((d, i) => <DjenCard key={i} item={d} />)}
            {activeTab === "comunicacoes" && comunicacoesFiltradas.map((c, i) => (
              <ComunicacaoCard key={`${c.id}-${i}`} item={c} />
            ))}

            {/* Botão Carregar Mais */}
            {activeTab === "comunicacoes" && comunicacoes.length < totalComunicacoes && !tribunalFiltro && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleCarregarMais}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingMore ? "Carregando..." : `Carregar mais (${totalComunicacoes - comunicacoes.length} restantes)`}
                </button>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { titulo: "DataJud", desc: "API oficial do CNJ com dados de todos os tribunais brasileiros", cor: "blue" },
              { titulo: "DJEN", desc: "Diário da Justiça Eletrônico Nacional — publicações e intimações", cor: "green" },
              { titulo: "Tribunais", desc: "TJSP, TJRJ, TJMG, TRFs, STJ, STF e mais 17 tribunais", cor: "purple" },
            ].map((item) => (
              <div key={item.titulo} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className={`font-semibold text-${item.cor}-700 mb-1`}>{item.titulo}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          Dados obtidos via APIs públicas do CNJ · DataJud · DJEN
        </div>
      </footer>
    </div>
  );
}
