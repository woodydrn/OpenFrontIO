export enum LogSeverity {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL'
}

export function slog(eventType: string, description, data: any, severity = LogSeverity.INFO): void {
    const logEntry = {
        eventType: eventType,
        description: description,
        severity: severity,
        data: data
    };
    if (process.env.GAME_ENV == 'dev') {
        console.log(description)
    } else {
        console.log(JSON.stringify(logEntry));
    }
}