import { Request } from "express"

export type UserTokenData = {
    id: string,
    pseudo: string
}

export type AuthenticatedRequest = Request & {
    user: UserTokenData
}