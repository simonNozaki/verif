import * as http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { colorize } from 'consola/utils'
import { toStaticPath } from '../../util'

type ContentType = 'text/html' | 'application/javascript' | 'text/css' | 'application/json'

interface PathRouter {
  [k: string]: {
    pattern: RegExp,
    handler: (rawPath: string, res: HttpResponse) => void
  }
}

/**
 * Type alias of Node.js ServerResponse
 */
type HttpResponse = http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }

export class GraphServer {
  private readonly routes: PathRouter = {
    index: {
      pattern: new RegExp(/(^\/$|\/index.html)/),
      handler: (_, res) => (this.writeStatic('index.html', 'text/html', res))
    },
    js: {
      pattern: new RegExp(/cy.client.js/),
      handler: (_, res) => (this.writeStatic('cy.client.js', 'application/javascript', res))
    },
    css: {
      pattern: new RegExp(/\/*.css/),
      handler: (rawPath, res) => {
        const strs = rawPath.split('/')
        const css = strs[strs.length - 1]
        this.writeStatic(css, 'text/css', res)
      }
    },
    json: {
      pattern: new RegExp(/\/*.json/),
      handler: (rawPath, res) => {
        const strs = rawPath.split('/')
        const json = strs[strs.length - 1]
        this.writeStatic(json, 'application/json', res)
      }
    }
  }

  /**
   * Find matching route and execute handler
   * Ignore unknown paths
   */
  route (req: http.IncomingMessage, res: HttpResponse) {
    for (const key of Object.keys(this.routes)) {
      if(this.routes[key].pattern.test(req.url)) {
        this.routes[key].handler(req.url, res)
      }
    }
  }

  private _server = http.createServer((req, res) => {
    this.route(req, res)
  })

  /**
   * Write static file by a path and content-type.
   */
  private writeStatic(fileName: string, contentType: ContentType, res: http.ServerResponse): void {
    const filePath = path.join(toStaticPath(fileName))
    fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        throw err
      }

      res.writeHead(200, { 'Content-Type': contentType })
      res.write(data)
      res.end()
    })
  }

  start(): void {
    this._server.listen(38081)
      .on('listening', () => {
        consola.info(`Graph is served on: ${colorize('blue', 'http://localhost:38081')}`)
      })
  }
}
