# Marcenaria Elite Planejados — Sistema Administrativo

Sistema web simples para uso administrativo da marcenaria.

## Módulos
- Dashboard
- Vendas
- Clientes
- Fornecedores
- Contas a Receber
- Contas a Pagar
- Cheques
- Fluxo de Caixa

O módulo de cheques foi estruturado para registrar a rastreabilidade:
**cliente → venda → cheque → fornecedor → conta a pagar**.

## Esta primeira publicação
Os dados são salvos no navegador do aparelho (localStorage). É uma versão inicial para validar o funcionamento e a interface.

## Próxima etapa
Conectar autenticação e banco de dados online (ex.: Supabase) para permitir login e uso dos mesmos dados em celular e computador.
