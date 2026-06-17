import { DjenResult } from "@/types";

function formatData(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export default function DjenCard({ item }: { item: DjenResult }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-3 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className="font-mono text-sm font-semibold text-green-800">
            {item.numeroProcesso || "Sem número"}
          </span>
          <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
            {item.siglaTribunal}
          </span>
          <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {item.tipoComunicacao}
          </span>
        </div>
        <div className="text-right shrink-0 text-xs text-gray-400">
          Publicado em {formatData(item.dataPublicacao)}
        </div>
      </div>

      {item.nomeOrgao && (
        <div className="text-xs text-gray-500 mb-2">{item.nomeOrgao}</div>
      )}

      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{item.texto}</p>
    </div>
  );
}
