import * as http from 'http'
import fs from 'fs'
import path from 'path'
import consola from 'consola'
import { colorize } from 'consola/utils'
import { __dirname, toStaticPath } from '../../util'

type ContentType = 'text/html' | 'application/javascript' | 'text/css'

export class GraphServer {
  private _server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      this.writeStatic(
        path.join(toStaticPath('index.html')),
        'text/html',
        res
      )
    } else if (req.url === '/cy.client.js') {
      this.writeStatic(
        path.join(toStaticPath('cy.client.js')),
        'application/javascript',
        res
      )
    }
    else if (req.url?.match(/\/*.css/)) {
      const strs = req.url.split('/')
      const css = strs[strs.length - 1]
      this.writeStatic(
        path.join(toStaticPath(css)),
        'text/css',
        res
      )
    }
    // Ignore unknown paths
  })

  /**
   * Write static file by a path and content-type.
   */
  private writeStatic(fileName: string, contentType: ContentType, res: http.ServerResponse): void {
    const source = fs.readFileSync(fileName, { encoding: 'utf-8' })

    res.writeHead(200, { 'Content-Type': contentType })
    res.write(source)
    res.end()
  }

  start(): void {
    this._server.listen(38081)
      .on('listening', () => {
        consola.info(`Graph is served on: ${colorize('blue', 'http://localhost:38081')}`)
      })
  }
}
