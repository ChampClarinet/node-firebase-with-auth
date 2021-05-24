import * as Config from './config';

export default `DMS running at ${Config.PORT}
Max file size allowed: ${Config.MAX_FILE_SIZE / 1024 / 1024} MBs
URLs lifetime: ${Config.DOWNLOAD_URL_LIFETIME / 6e5} minutes
`;