"use client";

import { useState } from "react";
import { ComunicacaoResult } from "@/types";

export default function ComunicacaoCard({ item }: { item: ComunicacaoResult }) {
  const [expanded, setExpanded] = useState(false);

  const partes = item.destinatarios ?? [];
  const polo = (p: string) => (p === "A" ? "Ativo" : p === "P" ? "Passivo" : p);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-3 overflow-hidden">
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-start justify-between gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {item.siglaTribunal}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {item.tipoComunicacao}
            </span>
            <span className="text-xs text-gray-400">{item.datadisponibilizacao}</span>
          </div>
          <p className="text-sm font-medium text-gray-800 truncate">
            {item.numeroprocessocommascara || item.numero_processo}
          </p>
          <p className="text-xs text-gray-500 truncate">{item.nomeOrgao}</p>
        </div>
        <span className="text-gray-400 text-lg shrink-0">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 text-sm">
          {item.nomeClasse && (
            <div>
              <span className="font-medium text-gray-600">Classe: </span>
              <span className="text-gray-800">{item.nomeClasse}</span>
            </div>
          )}

          {partes.length > 0 && (
            <div>
              <p className="font-medium text-gray-600 mb-1">Partes:</p>
              <ul className="space-y-0.5">
                {partes.map((p, i) => (
                  <li key={i} className="text-gray-700 flex gap-2">
                    <span className="text-xs bg-gray-100 px-1 rounded shrink-0">{polo(p.polo)}</span>
                    {p.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.texto && (
            <div>
              <p className="font-medium text-gray-600 mb-1">Texto:</p>
              <div
                className="text-gray-700 text-xs leading-relaxed bg-gray-50 p-2 rounded max-h-40 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: item.texto }}
              />
            </div>
          )}

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              Abrir no tribunal →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
