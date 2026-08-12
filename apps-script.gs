/**
 * Code.gs — cole isto em Extensões > Apps Script, dentro da planilha.
 * Gerencia: lista de salas + qual está ativa (aba "Salas") e as respostas (aba "Respostas").
 *
 * IMPORTANTE: troque a senha abaixo antes de publicar.
 */
var ADMIN_PIN = 'GAV2026';

// ---------- Rotas GET (usadas via JSONP pelo admin e pelo avaliador) ----------
function doGet(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback;
  var result;

  switch (action) {
    case 'validarPin':
      result = { valido: e.parameter.pin === ADMIN_PIN };
      break;
    case 'salas':
      result = getSalas();
      break;
    case 'salaAtiva':
      result = { sala: getSalaAtiva() };
      break;
    case 'ativarSala':
      if (e.parameter.pin !== ADMIN_PIN) { result = { error: 'pin_invalido' }; break; }
      ativarSala(e.parameter.sala);
      result = { status: 'ok', sala: e.parameter.sala };
      break;
    case 'desativarTudo':
      if (e.parameter.pin !== ADMIN_PIN) { result = { error: 'pin_invalido' }; break; }
      desativarTudo();
      result = { status: 'ok' };
      break;
    case 'enviarResposta':
      result = enviarResposta(e.parameter);
      break;
    case 'respostas':
      if (e.parameter.pin !== ADMIN_PIN) { result = { error: 'pin_invalido' }; break; }
      result = { respostas: getRespostasParaDashboard() };
      break;
    case 'planilhaUrl':
      if (e.parameter.pin !== ADMIN_PIN) { result = { error: 'pin_invalido' }; break; }
      result = { url: SpreadsheetApp.getActiveSpreadsheet().getUrl() };
      break;
    default:
      result = { error: 'acao_invalida' };
  }
  return jsonpOrJson(result, callback);
}

// ---------- Aba Salas ----------
function getSalasSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Salas');
  if (!sheet) {
    sheet = ss.insertSheet('Salas');
    sheet.appendRow(['Sala', 'Ativa']);
  }
  return sheet;
}

function getSalas() {
  var sheet = getSalasSheet();
  var values = sheet.getDataRange().getValues();
  var salas = [];
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === '') continue;
    salas.push({ nome: values[i][0], ativa: values[i][1] === true || values[i][1] === 'TRUE' });
  }
  return { salas: salas };
}

function getSalaAtiva() {
  var sheet = getSalasSheet();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][1] === true || values[i][1] === 'TRUE') return values[i][0];
  }
  return null;
}

// Ativa a sala pelo nome e desativa todas as outras (uma ativa por vez)
function ativarSala(nome) {
  var sheet = getSalasSheet();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    sheet.getRange(i + 1, 2).setValue(values[i][0] === nome);
  }
}

function desativarTudo() {
  var sheet = getSalasSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 2, lastRow - 1, 1).setValue(false);
}

// Lista real das salas do evento.
var NOMES_SALAS = [
  'Cupe',
  'Gramado - Casa Lugano',
  'Gramado - Dia',
  'Gramado - Hortênsias',
  'Gramado - Luguito',
  'Gramado - Nasa',
  'Gramado - Noite',
  'Gunga',
  'Park Hotel',
  'Beach Hotel',
  'Jericoacoara - Lagoa',
  'Jericoacoara - Vila',
  'Maceió - Noite',
  'Maragogi - dia',
  'Maragogi - Noite',
  'Muro Alto',
  'Pipa - Dia',
  'Pipa - Noite',
  'Porto 2 Life Hotel',
  'Porto Alto Hotel',
  'Porto de Galinhas - Dia',
  'Porto de Galinhas - Noite',
  'Praia do Francês',
  'Pyrenéus Hotel',
  'Teste',
  'Vendas Digitais'
];

// Roda isso UMA VEZ manualmente (menu "Executar" > selecione setupSalas) para
// popular a aba Salas com a lista real acima. Só cria se a aba ainda
// estiver vazia — não apaga nada se você já tiver editado a planilha.
function setupSalas() {
  var sheet = getSalasSheet();
  if (sheet.getLastRow() > 1) return; // já tem dados, não sobrescreve
  NOMES_SALAS.forEach(function (nome) {
    sheet.appendRow([nome, false]);
  });
}

// Roda isso se quiser APAGAR a aba Salas atual e recriar do zero com a
// lista real acima (por exemplo, se você já rodou setupSalas antes com
// nomes de exemplo tipo "Sala 01"). Use com cuidado: isso zera qual sala
// estava ativa.
function resetSalasComListaReal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Salas');
  if (!sheet) {
    sheet = ss.insertSheet('Salas');
  } else {
    sheet.clear(); // limpa o conteúdo em vez de apagar a aba (evita erro quando é a única aba da planilha)
  }
  sheet.appendRow(['Sala', 'Ativa']);
  NOMES_SALAS.forEach(function (nome) {
    sheet.appendRow([nome, false]);
  });
}

// ---------- Aba Respostas ----------
function getRespostasSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Respostas');
  if (!sheet) sheet = ss.insertSheet('Respostas');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Sala',
      'Email',
      'Conteúdo apresentado',
      'Organização e tempo',
      'Relevância dos assuntos',
      'Domínio dos palestrantes',
      'CSAT - Satisfação geral',
      'Feedback aberto'
    ]);
  }
  return sheet;
}

// Verifica de novo (evita corrida entre duas abas abertas) e só então grava
function enviarResposta(data) {
  if (!data.sala) return { error: 'sala_ausente' };

  var sheet = getRespostasSheet();
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.sala,
    '', // pesquisa anônima — e-mail não é mais coletado
    data.q1_conteudo,
    data.q2_organizacao_tempo,
    data.q3_relevancia_assuntos,
    data.q4_dominio_palestrantes,
    data.csat_satisfacao_geral,
    data.feedback_aberto || ''
  ]);
  return { status: 'ok' };
}

// Retorna todas as respostas já formatadas para o dashboard do admin
function getRespostasParaDashboard() {
  var sheet = getRespostasSheet();
  var values = sheet.getDataRange().getValues();
  var respostas = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0] && !row[1]) continue;
    respostas.push({
      timestamp: row[0] instanceof Date ? row[0].toISOString() : row[0],
      sala: row[1],
      email: row[2],
      q1: Number(row[3]),
      q2: Number(row[4]),
      q3: Number(row[5]),
      q4: Number(row[6]),
      csat: Number(row[7]),
      feedback: row[8] || ''
    });
  }
  return respostas;
}

// ---------- Utilitário JSONP ----------
function jsonpOrJson(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
