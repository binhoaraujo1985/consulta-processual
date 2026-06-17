# Consulta Processual — Como Usar

## Rodar localmente

```powershell
# Abra o PowerShell e navegue até a pasta do projeto:
cd C:\Projetos\consulta-processual

# Instale as dependências (já feito na primeira vez):
npm install

# Inicie o servidor de desenvolvimento:
npm run dev

# Abra no navegador: http://localhost:3000
```

## Obter a chave de API do DataJud (gratuita)

1. Acesse: https://datajud-wiki.cnj.jus.br/api-publica/acesso
2. Cadastre-se com seu e-mail no portal do CNJ
3. Após aprovação, copie sua chave de API
4. Edite o arquivo `.env.local` e substitua a chave:
   ```
   DATAJUD_API_KEY=APIKey sua_chave_aqui
   ```

## Publicar online GRÁTIS (Vercel)

1. Crie conta gratuita em https://vercel.com
2. Instale o Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Na pasta do projeto, execute:
   ```
   vercel
   ```
4. Siga as instruções — em 2 minutos o app estará online

### Configurar a chave de API no Vercel:
- No dashboard do Vercel → Settings → Environment Variables
- Adicione: `DATAJUD_API_KEY` = sua chave

## O que o app faz

| Busca | Descrição |
|-------|-----------|
| Número do processo | Formato CNJ (ex: 0000000-00.0000.0.00.0000) |
| Nome da parte | Busca por nome completo ou razão social |
| OAB | Busca processos pelo número OAB do advogado (ex: 123456SP) |
| DJEN | Busca publicações e intimações no Diário da Justiça Eletrônico |

## Tribunais suportados

TJSP, TJRJ, TJMG, TJRS, TJPR, TJSC, TJBA, TJPE, TJCE, TJGO, TJMT, TJMS,
TJPA, TJAM, TJDFT, TRF1, TRF2, TRF3, TRF4, TRF5, TST, STJ, STF
