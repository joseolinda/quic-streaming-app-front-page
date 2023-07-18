const mysql = require("mysql");
const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "olindaweb",
};

function createDbConnection() {
  const db = mysql.createConnection(connectionConfig);

  db.connect((error) => {
    if (error) {
      throw new Error("Error connecting to MySQL database: " + error);
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
      workerStart VARCHAR(50),
      redirectStart VARCHAR(50),
      redirectEnd VARCHAR(50),
      fetchStart VARCHAR(50),
      domainLookupStart VARCHAR(50),
      domainLookupEnd VARCHAR(50),
      connectStart VARCHAR(50),
      connectEnd VARCHAR(50),
      secureConnectionStart VARCHAR(50),
      requestStart VARCHAR(50),
      responseStart VARCHAR(50),
      responseEnd VARCHAR(50),
      transferSize INT,
      encodedBodySize INT,
      decodedBodySize INT,
      renderBlockingStatus VARCHAR(255),
      responseStatus INT,
      name VARCHAR(255),
      entryType VARCHAR(255),
      startTime VARCHAR(50),
      duration VARCHAR(50)
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
          encodedBodySize, decodedBodySize, renderBlockingStatus, responseStatus,
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
        log.renderBlockingStatus,
        log.responseStatus,
        log.name,
        log.entryType,
        log.startTime,
        log.duration,
      ]);
  
      db.query(insertStatement, [values], (error, results, fields) => {
        if (error) {
          db.end();
          console.log(insertStatement),
           console.log(values)
          reject(error);
        } else {
          db.end();
          resolve(results);
        }
      });
    });
  }
  
module.exports = { insertLogs, createDbConnection };