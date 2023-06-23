const sqlite3 = require("sqlite3").verbose()
const filepath = "database/logs.sqlite"

function createDbConnection() {
  const db = new sqlite3.Database(filepath, (error) => {
    if (error) {
      throw new Error(error.message) // Lança uma exceção em caso de erro
    }
    createTable(db)
  })
  console.log("Connection with SQLite has been established")
  return db
}

function createTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  `)
}

function insertLogs(logs) {
  return new Promise((resolve, reject) => {
    const db = createDbConnection()

    const insertStatement = db.prepare(`
      INSERT INTO logs (
        playbackId, initiatorType, nextHopProtocol, workerStart, redirectStart,
        redirectEnd, fetchStart, domainLookupStart, domainLookupEnd, connectStart, connectEnd,
        secureConnectionStart, requestStart, responseStart, responseEnd, transferSize,
        encodedBodySize, decodedBodySize, serverTiming, renderBlockingStatus, responseStatus,
        name, entryType, startTime, duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `)

    logs.forEach((log) => {
      const values = [
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
      ]

      insertStatement.run(values, (error) => {
        if (error) {
          insertStatement.finalize()
          db.close()
          reject(new Error(error.message))
        }
      })
    })

    insertStatement.finalize((error) => {
      if (error) {
        reject(new Error(error.message))
      } else {
        resolve(true)
      }
      db.close()
    })

  })
}

module.exports = { insertLogs, createDbConnection }
