"use client";

import { useState } from "react";
import { ProcessoResult } from "@/types";

function formatData(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

function grauLabel(grau?: string) {
  const map: Record<string, string> = {
    G1: "1º Grau",
    G2: "2º Grau",
    JE: "Juizado Especial",
    TR: "Turma Recursal",
    SUP: "Superior",
  };
  return grau ? (map[grau] ?? grau) : "—";
}

export default function ProcessoCard({ processo }: { processo: ProcessoResult }) {
  const [expanded, setExpanded] = useState(false);
  const s = processo._source;

  if (s.nivelSigilo && s.nivelSigilo > 0) {
    return (
      <div className="bg-white border border-yellow-200 rounded-lg p-4 mb-3 shadow-sm">
        <div className="flex items-center gap-2 text-yellow-700">
          <span className="text-lg">🔒</span>
          <span className="font-medium">{s.numeroProcesso}</span>
          <span className="text-sm">— Processo em segredo de justiça</span>
        </div>
      </div>
    );
  }

  const ultimoMovimento = s.movimentos?.[0];
  const parteAtiva = s.partes?.find((p) => p.tipo === "ATIVO" || p.tipo === "AUTOR");
  const partePassiva = s.partes?.find((p) => p.tipo === "PASSIVO" || p.tipo === "REU");

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-3 shadow-sm overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold text-blue-900">
                {s.numeroProcesso}
              </span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {s.tribunal}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {grauLabel(s.grau)}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-600">
              {s.classeProcessual && <span>{s.classeProcessual.nome}</span>}
              {s.orgaoJulgador && <span className="text-gray-400">{s.orgaoJulgador.nome}</span>}
            </div>

            {s.assuntos && s.assuntos.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {s.assuntos.slice(0, 3).map((a, i) => (
                  <span key={i} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">
                    {a.nome}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-gray-400">Ajuizamento</div>
            <div className="text-sm font-medium text-gray-700">{formatData(s.dataAjuizamento)}</div>
            {ultimoMovimento && (
              <>
                <div className="text-xs text-gray-400 mt-1">Último movimento</div>
                <div className="text-xs text-gray-500">{formatData(ultimoMovimento.dataHora)}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
          {(parteAtiva || partePassiva) && (
            <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {parteAtiva && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Polo Ativo</div>
                  <div className="text-sm text-gray-700">{parteAtiva.nome}</div>
                  {parteAtiva.advogados?.map((a, i) => (
                    <div key={i} className="text-xs text-gray-500">Adv: {a.nome}{a.numeroOAB ? ` — OAB ${a.numeroOAB}` : ""}</div>
                  ))}
                </div>
              )}
              {partePassiva && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Polo Passivo</div>
                  <div className="text-sm text-gray-700">{partePassiva.nome}</div>
                  {partePassiva.advogados?.map((a, i) => (
                    <div key={i} className="text-xs text-gray-500">Adv: {a.nome}{a.numeroOAB ? ` — OAB ${a.numeroOAB}` : ""}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {s.movimentos && s.movimentos.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Movimentações</div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {s.movimentos.slice(0, 20).map((m, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-gray-400 shrink-0 w-24">{formatData(m.dataHora)}</span>
                    <span className="text-gray-700">{m.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
