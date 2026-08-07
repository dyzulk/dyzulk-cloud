export type ServerType = 'local' | 'build' | 'node' | 'deploy';

export type ServerStatus = 'online' | 'idle' | 'active' | 'offline' | 'building';

export interface ServerInstance {
    id: string;
    name: string;
    host: string;
    ip: string;
    type: ServerType;
    status: ServerStatus;
    cpu: number;
    memory: number;
    disk: number;
    role: string;
    docker_version: string;
    os: string;
    uptime: string;
}
