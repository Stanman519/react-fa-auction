export interface AuthUser {
        created_at: Date;
        email: string;
        email_verified: boolean;
        family_name: string;
        given_name: string;
        identities: Identity[];
        locale: string;
        name: string;
        nickname: string;
        picture: string;
        updated_at: Date;
        user_id: string;
        last_ip: string;
        last_login: Date;
        logins_count: number;
        blocked_for: any[];
        guardian_authenticators: any[];
}

export interface Identity {
    provider: string;
    user_id: string;
    connection: string;
    isSocial: boolean;
}
