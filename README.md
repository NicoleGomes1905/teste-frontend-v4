# Desafio Frontend – Monitoramento de Equipamentos

Este projeto foi desenvolvido como parte do teste para a vaga de Frontend, tendo como objetivo exibir em uma aplicação web as informações de diversos equipamentos de operação florestal, bem como seu histórico de posições e estados (Operando, Parado, Manutenção).

## Resumo

A aplicação carrega localmente os arquivos de dados em JSON (disponíveis na pasta `assets/data/`) e:

1. Exibe um mapa (utilizando [Leaflet](https://leafletjs.com/) + OpenStreetMap) com os equipamentos em suas posições mais recentes.
2. Permite consultar o estado atual de cada equipamento.
3. Ao clicar em um equipamento (no mapa ou na lista), abre-se uma modal contendo o histórico de posições e status.
4. É possível pesquisar equipamentos por nome no grid principal.
5. Pode-se ordenar a lista pelo Status ou pelo Valor/Hora.

## Tecnologias utilizadas

### 1. [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- Por que foi utilizado: Utilizei o Leaflet pois se trata de uma biblioteca de mapas para exibir camadas, pins e popups, sem necessidade de keys de API proprietárias.

### 2. [Bootstrap](https://getbootstrap.com/)
- Por que foi utilizado: Fornece classes prontas de layout, componentes e estilos, agilizando o desenvolvimento e mantendo um visual consistente (especialmente para modal e tabela principal).

### 3. [Nominatim](https://nominatim.org/) (opcional para Address)
- Por que foi utilizado: Foi utilizado para reverter os dados fornecidos (latitude e longitude) para facilitar a experiência do usuário, fornecendo diretamente a cidade/estado em que o equipamento se encontra.

## Organização do código

- **`index.html`**: Estrutura principal, referências a Vue, Leaflet e Bootstrap, e inclusão do script `equipamento-monitor.js`.
- **`style.css`**: Regras de estilo personalizadas (cores, layout da barra de pesquisa, modal, etc.).
- **`equipamento-monitor.js`**:
  - Cria a instância Vue.
  - Lê via `fetch` os dados JSON.
  - Monta a lista principal (`combinedData`) para exibir na tabela.
  - Monta os marcadores no mapa usando Leaflet.
  - Fornece métodos de pesquisa, ordenação e exibição do histórico (abrindo modal).
  - No modal, exibe cada posição (data, botão "Ver Endereço" para reverse geocoding) e o estado correspondente para aquela data.

## Funcionalidades principais

1. **Mapa**  
   - Inicializado em [lat=-19.126536, lon=-45.947756].
   - Marcadores coloridos de acordo com o estado atual do equipamento.

2. **Lista de Equipamentos**  
   - Exibe ID, Nome, Modelo, Status (com cor) e Valor/Hora.
   - Ordenável por "Status" ou "Valor/Hora".
   - Campo de pesquisa filtra por nome ou ID do equipamento.

3. **Modal de Histórico**  
   - Ao clicar num equipamento na lista ou no popup do mapa, abre a modal.
   - Exibe Data, Status e a Localização (endereço – via Nominatim ou botão "Ver Endereço" para reverse geocoding).
   - Para cada data de posição, encontra o estado vigente naquela data (o estado cujo timestamp seja anterior ou igual, mas mais próximo do timestamp da posição).

## Como executar localmente

1. Baixe este repositório (ou faça clone/fork).
2. Abra o `index.html` em seu navegador (preferencialmente usando um servidor local, pois `fetch` de arquivo local é bloqueado em alguns browsers). Exemplos:
   - `npx http-server .` e acesse `http://127.0.0.1:8080`
   - Ou use extensões como “Live Server” no VSCode.
3. A aplicação deve carregar o mapa, a lista de equipamentos e permitir que você clique e abra o modal de histórico.

Link do Google Drive: https://drive.google.com/drive/folders/1pfCoh2hXEG9DuZi0SQ3AvqyhPHETp7k8?usp=sharing

Autor: Nicole Gabriele Gomes – Qualquer dúvida ou sugestão, fique à vontade para comentar!

Obrigado por avaliar o projeto!
