"use client";

import { useState } from "react";
import { SearchParams, TipoBusca } from "@/types";

const TRIBUNAIS = [
  { value: "", label: "Todos os tribunais" },
  { value: "TJSP", label: "TJSP — São Paulo" },
  { value: "TJRJ", label: "TJRJ — Rio de Janeiro" },
  { value: "TJMG", label: "TJMG — Minas Gerais" },
  { value: "TJRS", label: "TJRS — Rio Grande do Sul" },
  { value: "TJPR", label: "TJPR — Paraná" },
  { value: "TJSC", label: "TJSC — Santa Catarina" },
  { value: "TJBA", label: "TJBA — Bahia" },
  { value: "TJPE", label: "TJPE — Pernambuco" },
  { value: "TJCE", label: "TJCE — Ceará" },
  { value: "TJGO", label: "TJGO — Goiás" },
  { value: "TJMT", label: "TJMT — Mato Grosso" },
  { value: "TJMS", label: "TJMS — Mato Grosso do Sul" },
  { value: "TJPA", label: "TJPA — Pará" },
  { value: "TJAM", label: "TJAM — Amazonas" },
  { value: "TJDF", label: "TJDFT — Distrito Federal" },
  { value: "TRF1", label: "TRF1 — 1ª Região" },
  { value: "TRF2", label: "TRF2 — 2ª Região" },
  { value: "TRF3", label: "TRF3 — 3ª Região" },
  { value: "TRF4", label: "TRF4 — 4ª Região" },
  { value: "TRF5", label: "TRF5 — 5ª Região" },
  { value: "TST", label: "TST — Superior Trabalho" },
  { value: "STJ", label: "STJ — Superior Tribunal de Justiça" },
  { value: "STF", label: "STF — Supremo Tribunal Federal" },
];

const TIPOS: { value: TipoBusca; label: string; placeholder: string }[] = [
  { value: "numero", label: "Número do processo", placeholder: "0000000-00.0000.0.00.0000" },
  { value: "parte", label: "Nome da parte", placeholder: "Nome completo ou razão social" },
  { value: "oab", label: "Número OAB", placeholder: "Ex: 123456SP" },
  { value: "djen", label: "DJEN (publicações)", placeholder: "Nome da parte ou advogado" },
];

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [tipo, setTipo] = useState<TipoBusca>("numero");
  const [valor, setValor] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor.trim()) return;
    onSearch({ tipo, valor: valor.trim(), tribunal, dataInicio, dataFim });
  }

  const tipoAtual = TIPOS.find((t) => t.value === tipo)!;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setTipo(t.value); setValor(""); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tipo === t.value
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={tipoAtual.placeholder}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !valor.trim()}
          className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {tipo !== "djen" && (
          <select
            value={tribunal}
            onChange={(e) => setTribunal(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TRIBUNAIS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <label>De:</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label>Até:</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </form>
  );
}
