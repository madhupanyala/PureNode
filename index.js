const http = require("http")
const url = require("url")
const StringDecoder = require("string_decoder").StringDecoder
const config = require("./config")

const HOST = config.params.host
const PORT = config.params.port

const server = http.createServer((req, res) => {
    execute(req, res)
})

server.listen(PORT, HOST, () => {
    console.info("Server listening on port:", PORT)
})

const handlers = {}

handlers.hello = (data, callback) => {
    callback(200, "{message: 'Welcome!'}")
}

handlers.notfound = (data, callback) => {
    callback(404)
}

const router = {
    "/hello": handlers.hello
}

const execute = (req, res) => {
    const parsedUrl = url.parse(req.url, true)
    const route = parsedUrl.pathname
    const decoder = new StringDecoder("utf-8")
    const theHandler = router[route] || handlers.notfound
    let body = ""

    req.on("data", (data) => {
        body += decoder.write(data)
    })

    req.on("end", () => {
        body += decoder.end()

        if ("POST" !== req.method) {
            res.writeHead(406)
            res.end("Only POST requests are allowed!")
        } else {
            theHandler(body, (statusCode, payload) => {
                res.setHeader("Content-Type", "application/json")
                res.writeHead(statusCode)
                res.end(JSON.stringify(payload || {}))
            })
        }
    })
}