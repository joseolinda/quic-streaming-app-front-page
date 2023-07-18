const mysql = require("mysql");
const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "olindaweb",
};

function createDbConnection() {
  const db = mysql.createConnection(connectionConfig);

  db.connect((error) => {
    if (error) {
      throw new Error("Error connecting to MySQL database: " + error.message);
    }
    createTable(db);
  });

  console.log("Connection with MySQL has been established");
  return db;
}

function createTable(db) {
  db.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      playbackId VARCHAR(255),
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
      transferSize INT,
      encodedBodySize INT,
      decodedBodySize INT,
      serverTiming TEXT,
      renderBlockingStatus VARCHAR(255),
      responseStatus INT,
      name VARCHAR(255),
      entryType VARCHAR(255),
      startTime DECIMAL(15, 10),
      duration DECIMAL(15, 10)
    );
  `);
}

function insertLogs(logs) {
  return new Promise((resolve, reject) => {
    const db = createDbConnection();

    const insertStatement = `
      INSERT INTO logs (
        playbackId, initiatorType, nextHopProtocol, workerStart, redirectStart,
        redirectEnd, fetchStart, domainLookupStart, domainLookupEnd, connectStart, connectEnd,
        secureConnectionStart, requestStart, responseStart, responseEnd, transferSize,
        encodedBodySize, decodedBodySize, serverTiming, renderBlockingStatus, responseStatus,
        name, entryType, startTime, duration
      ) VALUES ?;
    `;

    const values = logs.map((log) => [
      log.playbackId,
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
    ]);

    db.query(insertStatement, [values], (error, results) => {
      if (error) {
        db.end();
        reject(new Error("Error inserting logs: " + error.message));
      } else {
        db.end();
        resolve(true);
      }
    });
  });
}

module.exports = { insertLogs, createDbConnection };