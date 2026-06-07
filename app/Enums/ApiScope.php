<?php

namespace App\Enums;

enum ApiScope: string
{
    case ServerRead = 'server:read';
    case ServerWrite = 'server:write';
    case DnsRead = 'dns:read';
    case DnsWrite = 'dns:write';
    case SslRead = 'ssl:read';
    case SslWrite = 'ssl:write';

    public function label(): string
    {
        return match ($this) {
            self::ServerRead => 'Read Servers',
            self::ServerWrite => 'Write Servers',
            self::DnsRead => 'Read DNS',
            self::DnsWrite => 'Write DNS',
            self::SslRead => 'Read SSL Certificates',
            self::SslWrite => 'Write SSL Certificates',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::ServerRead => 'Allow reading server details.',
            self::ServerWrite => 'Allow creating, updating, and deleting servers.',
            self::DnsRead => 'Allow reading DNS records.',
            self::DnsWrite => 'Allow creating, updating, and deleting DNS records.',
            self::SslRead => 'Allow reading SSL certificates.',
            self::SslWrite => 'Allow creating and deleting SSL certificates.',
        };
    }
}
