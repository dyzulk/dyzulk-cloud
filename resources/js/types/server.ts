import type { SshKeyInstance } from './office';

export type ServerType = 'local' | 'build' | 'node' | 'deploy';

export type ServerStatus = 'online' | 'idle' | 'active' | 'offline' | 'building' | 'unknown';
export type SetupStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface ServerInstance {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    host: string;
    port: number;
    username: string;
    type: ServerType;
    ssh_key_id: number;
    ssh_key?: SshKeyInstance;
    swarm_manager_server_id: number | null;
    swarm_manager?: ServerInstance;
    connection_status: ServerStatus;
    setup_status: SetupStatus;
    validated_at: string | null;
    telemetry_collected_at: string | null;
    validation_result: Record<string, any> | null;
    telemetry: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}
