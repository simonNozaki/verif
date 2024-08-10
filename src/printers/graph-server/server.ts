import * as http from 'http'
import fs from 'fs'
import path from 'path'
import consola from 'consola'
import { __dirname, toStaticPath } from '../../util'

type ContentType = 'text/html' | 'application/javascript' | 'text/css'

/**
 * Write static file by a path and content-type.
 */
function writeStatic(fileName: string, contentType: ContentType, res: http.ServerResponse): void {
  const source = fs.readFileSync(fileName, { encoding: 'utf-8' })

  res.writeHead(200, { 'Content-Type': contentType })
  res.write(source)
  res.end()
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    writeStatic(
      path.join(toStaticPath('index.html')),
      'text/html',
      res
    )
  } else if (req.url === '/cy.client.js') {
    writeStatic(
      path.join(toStaticPath('cy.client.js')),
      'application/javascript',
      res
    )
  }
  else if (req.url?.match(/\/*.css/)) {
    const strs = req.url.split('/')
    const css = strs[strs.length - 1]
    writeStatic(
      path.join(toStaticPath(css)),
      'text/css',
      res
    )
  }
  // Ignore unknown paths
})

function startServer(completedHandler: () => void): void {
  server.listen(38081)
    .on('listening', () => {
      consola.info('Graph is served on  http://localhost:38081.')
    })
  process.on('SIGTERM', () => {
    completedHandler()
  })
}

export default startServer
