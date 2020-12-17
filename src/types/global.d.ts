declare namespace NodeJS {
    export interface Global {
        config: {
            "default": {
                "serveDirectory": string,
                "PORT_run": Port,
                "PORT_dev": Port
            },
            "reader": {
                "whitelist": string[],
                "targets": {
                    [url: string]: {
                        "title": string,
                        "content": string,
                        "next": string,
                        "prev": string,
                    }
                }
            }
        },
        serveDirectory: string,
        PORT: Port,
        mainDir: string,
        action: {
            "redirect": string,
            "open": {
                "messages": [string]
            },
            "reader": {
                "url": string,
                "replace": { [key: string]: string }
            }
        },
        update: {
            action: () => void,
            config: () => void
        }
    }
}

type Port = 443 | 5000
