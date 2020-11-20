import * as dotenv from 'dotenv';

dotenv.config();

import { Jackett } from './jackett';
import { Sonarr } from './services/sonarr';
import { Radarr } from './services/radarr';
import { Lidarr } from './services/lidarr';
import { Service } from './services/service';
import { JackettIndexer } from './models/jackettIndexer';
import { Readerr } from './services/readerr';

async function start() {
    const jackett = new Jackett(), sonarr = new Sonarr(), radarr = new Radarr(), lidarr = new Lidarr(), readerr = new Readerr();

    let jackettIndexers: JackettIndexer[];
    try {
        jackett.validate();
        jackettIndexers = await jackett.getIndexers();
    } catch (error) {
        console.error(`[${jackett.name}] Couldn't get indexers`, error.message);
        process.exit(1);
    }

    sync(sonarr, jackettIndexers);
    sync(radarr, jackettIndexers);
    sync(lidarr, jackettIndexers);
    sync(readerr, jackettIndexers);
}

function sync(service: Service, jackettIndexers: JackettIndexer[]) {
    return service.validate()
        .then((response) => {
            console.log(`[${service.name}] Tested url & apiKey, running version ${response.data.version}`);
            return service.getIndexers();
        })
        .then(() => {
            console.log(`[${service.name}] Starting sync`);
            return service.sync(jackettIndexers);
        })
        .then(() => {
            console.log(`[${service.name}] Sync is done!`);
        })
        .catch((error) => {
            console.error(`[${service.name}] Failed:`, error.message);
        });
}

start();