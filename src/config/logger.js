const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
// const config = require('./config');

const enumerateErrorFormat = winston.format((info) => {
    if (info.message instanceof Error) {
        info.message = {
            message: info.message.message,
            stack: info.message.stack,
            ...info.message,
        };
    }

    if (info instanceof Error) {
        return { message: info.message, stack: info.stack, ...info };
    }

    return info;
});
const isTest = process.env.NODE_ENV === 'test';

const transports = [
    new winston.transports.Console({
        level: 'info',
        silent: isTest,
    }),
];

// Pas de rotation de fichiers pendant les tests : cela laisserait des
// descripteurs ouverts et polluerait le dossier logs/
if (!isTest) {
    const transport = new DailyRotateFile({
        filename: 'logs/' + '%DATE%-app-log.log', //process.env.LOG_FOLDER + process.env.LOG_FILE,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '3',
        prepend: true,
    });
    transport.on('rotate', (oldFilename, newFilename) => {
        // call function like upload to s3 or on cloud
    });
    transports.unshift(transport);
}

const logger = winston.createLogger({
    format: winston.format.combine(enumerateErrorFormat(), winston.format.json()),
    transports,
});
module.exports = logger;
