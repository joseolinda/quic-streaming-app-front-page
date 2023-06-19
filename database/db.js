const sqlite3 = require("sqlite3").verbose();
const filepath = "database/logs.sqlite";

function createDbConnection() {
  const db = new sqlite3.Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
    createTable(db);
  });
  console.log("Connection with SQLite has been established");
  return db;
}

function createTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initiatorType VARCHAR(255),
      nextHopProtocol VARCHAR(255),
      workerStart DECIMAL(15, 10),
      redirectStart DECIMAL(15, 10),
      redirectEnd DECIMAL(15, 10),
      fetchStart DECIMAL(15, 10),
      domainLookupStart DECIMAL(15, 10),
      domainLookupEnd DECIMAL(15, 10),
      connectStart DECIMAL(15, 10),
      connectEnd DECIMAL(15, 10),
      secureConnectionStart DECIMAL(15, 10),
      requestStart DECIMAL(15, 10),
      responseStart DECIMAL(15, 10),
      responseEnd DECIMAL(15, 10),
      transferSize INTEGER,
      encodedBodySize INTEGER,
      decodedBodySize INTEGER,
      serverTiming TEXT,
      renderBlockingStatus VARCHAR(255),
      responseStatus INTEGER,
      name VARCHAR(255),
      entryType VARCHAR(255),
      startTime DECIMAL(15, 10),
      duration DECIMAL(15, 10)
    );
  `);
}

function insertLogs(logs) {
  const db = createDbConnection();

  const insertStatement = db.prepare(`
    INSERT INTO logs (
      initiatorType, nextHopProtocol, workerStart, redirectStart,
      redirectEnd, fetchStart, domainLookupStart, domainLookupEnd, connectStart, connectEnd,
      secureConnectionStart, requestStart, responseStart, responseEnd, transferSize,
      encodedBodySize, decodedBodySize, serverTiming, renderBlockingStatus, responseStatus,
      name, entryType, startTime, duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  logs.forEach((log) => {
    const values = [
      log.initiatorType,
      log.nextHopProtocol,
      log.workerStart,
      log.redirectStart,
      log.redirectEnd,
      log.fetchStart,
      log.domainLookupStart,
      log.domainLookupEnd,
      log.connectStart,
      log.connectEnd,
      log.secureConnectionStart,
      log.requestStart,
      log.responseStart,
      log.responseEnd,
      log.transferSize,
      log.encodedBodySize,
      log.decodedBodySize,
      log.serverTiming,
      log.renderBlockingStatus,
      log.responseStatus,
      log.name,
      log.entryType,
      log.startTime,
      log.duration,
    ];

    insertStatement.run(values);
  });

  insertStatement.finalize((error) => {
    if (error) {
      console.error(error.message);
    } else {
      console.log("Logs inserted successfully");
    }
    db.close();
  });
}

module.exports = { insertLogs };