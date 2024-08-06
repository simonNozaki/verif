import * as http from 'http'
import fs from 'fs'
import path from 'path'
import consola from 'consola'
import Mustache from 'mustache'

const data = [
  { data: { id: 'a' } },
  { data: { id: 'b' } },
  { data: { id: 'c' } },
  { data: { id: 'd' } },
  { data: { id: 'e', source: 'a', target: 'b' } },
  { data: { id: 'f', source: 'b', target: 'c' } },
  { data: { id: 'g', source: 'a', target: 'c' } },
  { data: { id: 'h', source: 'a', target: 'd' } },
  { data: { id: 'i', source: 'c', target: 'd' } },
]

/**
 * テンプレートからHTMLで読ませるJavaScriptファイルを生成する
 */
function writeJavaScript(data: any[]): void {
  const template = fs.readFileSync(path.join(__dirname, 'cy.js.template'))

  const output = Mustache.render(template.toString(), {
    elements: JSON.stringify(data)
  })

  const jsPath = path.join(__dirname, 'cy.client.js')

  if (fs.existsSync(jsPath)) {
    fs.rmSync(jsPath)
  }

  fs.writeFileSync(jsPath, output, { encoding: 'utf-8' })
}

type ContentType = 'text/html' | 'application/javascript'

function writeStatic(fileName: string, contentType: ContentType, res: http.ServerResponse): void {
  const source = fs.readFileSync(fileName, { encoding: 'utf-8' })

  res.writeHead(200, { 'Content-Type': contentType })
  res.write(source)
  res.end()
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    writeStatic(
      path.join(__dirname, 'index.html'),
      'text/html',
      res
    )
  } else if (req.url === '/cy.client.js') {
    writeStatic(
      path.join(__dirname, 'cy.client.js'),
      'application/javascript',
      res
    )
  }
  // 認知しないパスは無視する
})

writeJavaScript(data)

server.listen(38081).on('listening', () => {
  consola.info('Graph visualizing server listening on port 38081.')
})
