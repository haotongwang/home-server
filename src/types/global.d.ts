declare namespace NodeJS {
    export interface Global {
        config: {
            "default": {
                "serveDirectory": string,
                "PORT_run": Port,
                "PORT_dev": Port
            }
        },
        serveDirectory: string,
        PORT: Port,
        mainDir: string,
        action: {
            "redirect": URL,
            "open": {
                "messages": [URL]
            },
            "reader-url": URL,
            "reader-replace": { [key: string]: string }
        }
    }
}

type Port = 443 | 5000
