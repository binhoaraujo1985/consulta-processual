export type TipoBusca = "numero" | "parte" | "oab" | "djen";

export interface SearchParams {
  tipo: TipoBusca;
  valor: string;
  tribunal?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface Movimento {
  dataHora: string;
  nome: string;
  complementosTabelados?: { nome: string; descricao?: string }[];
}

export interface ProcessoResult {
  _id: string;
  _source: {
    numeroProcesso: string;
    tribunal: string;
    dataAjuizamento?: string;
    classeProcessual?: { nome: string };
    assuntos?: { nome: string }[];
    orgaoJulgador?: { nome: string; codigoMunicipioIBGE?: string };
    grau?: string;
    movimentos?: Movimento[];
    partes?: {
      nome: string;
      tipo: string;
      advogados?: { nome: string; numeroOAB?: string }[];
    }[];
    nivelSigilo?: number;
    status?: string;
  };
}

export interface DjenResult {
  id: string;
  numeroProcesso: string;
  dataPublicacao: string;
  tipoComunicacao: string;
  nomeOrgao: string;
  texto: string;
  siglaTribunal: string;
}

export interface ComunicacaoResult {
  id: number;
  data_disponibilizacao: string;
  datadisponibilizacao: string;
  siglaTribunal: string;
  tipoComunicacao: string;
  nomeOrgao: string;
  texto: string;
  numero_processo: string;
  numeroprocessocommascara: string;
  link: string;
  tipoDocumento: string;
  nomeClasse: string;
  meiocompleto: string;
  destinatarios: { nome: string; polo: string }[];
  destinatarioadvogados: {
    advogado: { nome: string; numero_oab: string; uf_oab: string };
  }[];
}
